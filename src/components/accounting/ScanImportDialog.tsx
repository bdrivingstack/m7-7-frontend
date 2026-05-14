import { useCallback, useEffect, useRef, useState } from "react";
import {
  Camera, RotateCcw, UploadCloud, X, CheckCircle2, AlertTriangle,
  FileText, ZoomIn, ChevronLeft, ChevronRight, ScanLine, Loader2,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

declare global { interface Window { cv: any } }

const apiBase = import.meta.env.VITE_API_BASE_URL ?? "";
const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

// ─── Types ────────────────────────────────────────────────────────────────────

type OcrData = {
  transaction?: { id: string; bookingDate: string; labelRaw: string; amountTTC: number };
  ocrConfidence: number;
  extractedDate?: string;
  extractedMerchant?: string;
  extractedTTC?: number;
  documentType?: string;
};

type PagePreview = { file: File; url: string };
type Quad = [[number, number], [number, number], [number, number], [number, number]];
type Step = "capture" | "preview" | "result";

export type ScanImportDialogProps = {
  onImported: () => void;
  trigger?: React.ReactNode;
};

// ─── Utilities ────────────────────────────────────────────────────────────────

function loadOpenCV(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.cv?.Mat) { resolve(); return; }
    const existing = document.getElementById("opencv-js");
    if (existing) {
      const poll = setInterval(() => { if (window.cv?.Mat) { clearInterval(poll); resolve(); } }, 150);
      return;
    }
    const s = document.createElement("script");
    s.id = "opencv-js";
    s.src = "https://docs.opencv.org/4.8.0/opencv.js";
    s.async = true;
    s.onload = () => {
      const poll = setInterval(() => { if (window.cv?.Mat) { clearInterval(poll); resolve(); } }, 150);
      setTimeout(() => { clearInterval(poll); reject(new Error("OpenCV timeout")); }, 30000);
    };
    s.onerror = () => reject(new Error("Impossible de charger OpenCV"));
    document.head.appendChild(s);
  });
}

// Sort quad corners → [TL, TR, BR, BL]
function sortCorners(pts: [number, number][]): [number, number][] {
  const s = [...pts].sort((a, b) => (a[0] + a[1]) - (b[0] + b[1]));
  const rest = [s[1], s[2]].sort((a, b) => (a[0] - a[1]) - (b[0] - b[1]));
  return [s[0], rest[0], s[3], rest[1]];
}

function quadPerimeter(q: Quad): number {
  return q.reduce((sum, pt, i) => {
    const next = q[(i + 1) % 4];
    return sum + Math.hypot(next[0] - pt[0], next[1] - pt[1]);
  }, 0);
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ScanImportDialog({ onImported, trigger }: ScanImportDialogProps) {
  const videoRef        = useRef<HTMLVideoElement>(null);
  const streamRef       = useRef<MediaStream | null>(null);
  const flashRef        = useRef<HTMLDivElement>(null);
  const overlayRef      = useRef<HTMLCanvasElement>(null);
  const procCanvasRef   = useRef<HTMLCanvasElement | null>(null);
  const rafRef          = useRef<number>(0);
  const loopActiveRef   = useRef(false);
  const cvReadyRef      = useRef(false);
  const quadRef         = useRef<Quad | null>(null);
  const gaugeStartRef   = useRef<number | null>(null);
  const gaugeRef        = useRef(0);
  const isCapturingRef  = useRef(false);
  const pagesRef        = useRef<PagePreview[]>([]);
  const prevQuadRef     = useRef<Quad | null>(null);    // temporal smoothing
  const stableFrameRef  = useRef(0);                    // consecutive stable frames

  const [open, setOpen]           = useState(false);
  const [step, setStep]           = useState<Step>("capture");
  const [pages, setPages]         = useState<PagePreview[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);
  const [cvStatus, setCvStatus]   = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [saving, setSaving]       = useState(false);
  const [ocrData, setOcrData]     = useState<OcrData | null>(null);
  const [opType, setOpType]       = useState<"EXPENSE" | "INCOME">("EXPENSE");
  const [fullscreenUrl, setFullscreenUrl] = useState<string | null>(null);
  const [detected, setDetected]   = useState(false);

  // Keep pagesRef in sync
  useEffect(() => { pagesRef.current = pages; }, [pages]);

  // ── Camera stream ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open || step !== "capture") {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setCameraReady(false);
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) return;

    const startCamera = (constraints: MediaStreamConstraints) =>
      navigator.mediaDevices.getUserMedia(constraints);

    // Try rear camera → any camera (desktop / devices without rear cam)
    startCamera({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false })
      .catch(() => startCamera({ video: true, audio: false }))
      .then((stream) => {
        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        // Wait for actual frames before declaring camera ready
        const onReady = () => { setCameraReady(true); video.removeEventListener("canplay", onReady); };
        video.addEventListener("canplay", onReady);
      })
      .catch(() => setCameraReady(false));
  }, [open, step]);

  // ── Load OpenCV ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open || step !== "capture" || cvReadyRef.current) return;
    setCvStatus("loading");
    loadOpenCV()
      .then(() => { cvReadyRef.current = true; setCvStatus("ready"); })
      .catch(() => setCvStatus("error"));
  }, [open, step]);

  // ── Detection loop ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open || step !== "capture" || !cameraReady || !cvReadyRef.current) return;
    loopActiveRef.current = true;
    let lastMs = 0;

    const loop = (ts: number) => {
      if (!loopActiveRef.current) return;
      if (ts - lastMs >= 200) { lastMs = ts; processFrame(); }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { loopActiveRef.current = false; cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, step, cameraReady, cvStatus]);

  // ── Reset on close ─────────────────────────────────────────────────────────
  const resetAll = () => {
    pagesRef.current.forEach((p) => URL.revokeObjectURL(p.url));
    setPages([]); setStep("capture"); setOcrData(null); setCurrentPage(0);
    setCameraReady(false); setDetected(false);
    gaugeStartRef.current = null; gaugeRef.current = 0;
    quadRef.current = null; isCapturingRef.current = false;
    prevQuadRef.current = null; stableFrameRef.current = 0;
  };

  const handleClose = (v: boolean) => { if (!v) resetAll(); setOpen(v); };

  // ── Flash ──────────────────────────────────────────────────────────────────
  const triggerFlash = () => {
    const el = flashRef.current; if (!el) return;
    el.style.opacity = "1";
    setTimeout(() => { el.style.opacity = "0"; }, 200);
  };

  // ── Process one video frame ────────────────────────────────────────────────
  const processFrame = useCallback(() => {
    const video   = videoRef.current;
    const overlay = overlayRef.current;
    const cv      = window.cv;
    if (!video || !overlay || !cv?.Mat) return;
    if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) return;

    const rect = video.getBoundingClientRect();
    const dw = Math.round(rect.width)  || video.clientWidth  || 640;
    const dh = Math.round(rect.height) || video.clientHeight || 480;
    if (!dw || !dh) return;
    if (overlay.width !== dw || overlay.height !== dh) { overlay.width = dw; overlay.height = dh; }

    if (!procCanvasRef.current) procCanvasRef.current = document.createElement("canvas");
    const proc = procCanvasRef.current;
    const procW = Math.min(video.videoWidth, 640);
    const procH = Math.round(video.videoHeight * procW / video.videoWidth);
    if (!procH) return;
    proc.width = procW; proc.height = procH;
    try { proc.getContext("2d")!.drawImage(video, 0, 0, procW, procH); } catch { return; }

    let bestQuad: Quad | null = null;

    // Find the best 4-corner quad from a contour vector
    // minArea: ignore tiny noise. maxArea: ignore whole-frame false detection (100% rejected).
    const minArea = procW * procH * 0.05;   // at least 5% of frame
    const maxArea = procW * procH * 0.92;   // at most 92% — rejects only if literally the whole frame

    const findQuad = (cvec: any): Quad | null => {
      let result: Quad | null = null;
      let largestArea = minArea;
      for (let i = 0; i < cvec.size(); i++) {
        const cnt = cvec.get(i);
        const area = cv.contourArea(cnt);
        if (area <= largestArea || area > maxArea) { cnt.delete(); continue; }
        const hull = new cv.Mat();
        try {
          cv.convexHull(cnt, hull, false, true);
          const peri = cv.arcLength(hull, true);
          for (const eps of [0.02, 0.03, 0.05, 0.08, 0.12]) {
            const approx = new cv.Mat();
            try {
              cv.approxPolyDP(hull, approx, eps * peri, true);
              if (approx.rows === 4) {
                largestArea = area;
                const sx = dw / procW, sy = dh / procH;
                const d = approx.data32S;
                result = [
                  [d[0] * sx, d[1] * sy],
                  [d[2] * sx, d[3] * sy],
                  [d[4] * sx, d[5] * sy],
                  [d[6] * sx, d[7] * sy],
                ] as Quad;
                break;
              }
            } finally { try { approx.delete(); } catch {} }
          }
        } finally { try { hull.delete(); } catch {} }
        cnt.delete();
      }
      return result;
    };

    let src: any, gray: any, blurred: any,
        thresh: any, closed: any, bigK: any,
        edges: any, dilated: any, smK: any,
        cA: any, hA: any, cB: any, hB: any;
    try {
      src     = cv.imread(proc);
      gray    = new cv.Mat(); blurred = new cv.Mat();
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
      cv.GaussianBlur(gray, blurred, new cv.Size(9, 9), 0);

      // Strategy A: Otsu threshold — finds bright paper body (white on dark)
      thresh = new cv.Mat(); closed = new cv.Mat();
      bigK   = cv.Mat.ones(15, 15, cv.CV_8U);
      cv.threshold(blurred, thresh, 0, 255, cv.THRESH_BINARY | cv.THRESH_OTSU);
      cv.morphologyEx(thresh, closed, cv.MORPH_CLOSE, bigK);
      cA = new cv.MatVector(); hA = new cv.Mat();
      cv.findContours(closed, cA, hA, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

      // Strategy B: Canny edges — works on any surface/color
      edges   = new cv.Mat(); dilated = new cv.Mat();
      smK     = cv.Mat.ones(5, 5, cv.CV_8U);
      cv.Canny(blurred, edges, 20, 60);
      cv.dilate(edges, dilated, smK);
      cB = new cv.MatVector(); hB = new cv.Mat();
      cv.findContours(dilated, cB, hB, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

      const qA = findQuad(cA);
      const qB = findQuad(cB);
      // Keep the quad with the larger bounding box
      if (qA && qB) {
        const sizeA = Math.hypot(qA[2][0] - qA[0][0], qA[2][1] - qA[0][1]);
        const sizeB = Math.hypot(qB[2][0] - qB[0][0], qB[2][1] - qB[0][1]);
        bestQuad = sizeA >= sizeB ? qA : qB;
      } else {
        bestQuad = qA ?? qB;
      }
    } catch {
      // silent OpenCV error
    } finally {
      [src, gray, blurred, thresh, closed, bigK, edges, dilated, smK, cA, hA, cB, hB]
        .forEach((m) => { try { m?.delete(); } catch {} });
    }

    // ── Temporal smoothing: require 3 stable frames before accepting ──────────
    let stableQuad: Quad | null = null;
    if (bestQuad && prevQuadRef.current) {
      // Sort both quads for consistent corner ordering before comparing
      const sorted    = sortCorners([...bestQuad])    as Quad;
      const prevSorted = sortCorners([...prevQuadRef.current]) as Quad;
      const diagonal  = Math.hypot(dw, dh);
      const maxDelta  = diagonal * 0.20; // 20% of diagonal = "same quad"
      const isSimilar = sorted.every(([x, y], i) =>
        Math.hypot(x - prevSorted[i][0], y - prevSorted[i][1]) < maxDelta
      );
      if (isSimilar) {
        stableFrameRef.current++;
        // EMA smooth the corners (alpha=0.4)
        const alpha = 0.4;
        stableQuad = sorted.map(([x, y], i) => [
          prevSorted[i][0] + alpha * (x - prevSorted[i][0]),
          prevSorted[i][1] + alpha * (y - prevSorted[i][1]),
        ]) as Quad;
      } else {
        // Camera moved — reset stability and gauge
        stableFrameRef.current = 0;
        gaugeStartRef.current = null;
        gaugeRef.current = 0;
      }
    } else if (bestQuad) {
      stableFrameRef.current = 1;
    } else {
      stableFrameRef.current = 0;
    }
    prevQuadRef.current = bestQuad ? (sortCorners([...bestQuad]) as Quad) : null;

    // Only use quad after 3 consecutive stable frames
    const confirmedQuad = stableFrameRef.current >= 3 ? stableQuad : null;

    // Gauge logic (only on confirmed stable quad)
    const now = performance.now();
    if (confirmedQuad) {
      quadRef.current = confirmedQuad;
      if (gaugeStartRef.current === null) gaugeStartRef.current = now;
      gaugeRef.current = Math.min(100, ((now - gaugeStartRef.current) / 5000) * 100);
      setDetected(true);
      if (gaugeRef.current >= 100 && !isCapturingRef.current) {
        isCapturingRef.current = true;
        setTimeout(() => doCaptureWithCorrection(), 0);
      }
    } else {
      quadRef.current = null;
      if (!bestQuad) {
        gaugeStartRef.current = null;
        gaugeRef.current = 0;
      }
      setDetected(false);
    }

    drawOverlay(overlay, confirmedQuad, gaugeRef.current);
  }, []);

  // ── Draw detection overlay + gauge ────────────────────────────────────────
  const drawOverlay = (canvas: HTMLCanvasElement, quad: Quad | null, progress: number) => {
    const ctx = canvas.getContext("2d");
    if (!ctx || !canvas.width || !canvas.height) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Always draw corner brackets — visible guide even before detection
    const w = canvas.width, h = canvas.height;
    const arm   = Math.min(w, h) * 0.07;
    const mg    = Math.min(w, h) * 0.09;
    const bracketColor = quad ? "rgba(56,189,248,0.9)" : "rgba(255,255,255,0.45)";
    ctx.strokeStyle = bracketColor;
    ctx.lineWidth = 3.5;
    ctx.setLineDash([]);
    const brackets: [[number,number],[number,number],[number,number]][] = [
      [[mg+arm,mg],[mg,mg],[mg,mg+arm]],
      [[w-mg-arm,mg],[w-mg,mg],[w-mg,mg+arm]],
      [[mg+arm,h-mg],[mg,h-mg],[mg,h-mg-arm]],
      [[w-mg-arm,h-mg],[w-mg,h-mg],[w-mg,h-mg-arm]],
    ];
    brackets.forEach(([[x1,y1],[x2,y2],[x3,y3]]) => {
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.lineTo(x3,y3); ctx.stroke();
    });

    if (!quad) return;

    // Detected quad fill
    ctx.beginPath();
    ctx.moveTo(quad[0][0], quad[0][1]);
    for (let i = 1; i < 4; i++) ctx.lineTo(quad[i][0], quad[i][1]);
    ctx.closePath();
    ctx.fillStyle = "rgba(56,189,248,0.18)";
    ctx.fill();

    // Quad border
    ctx.strokeStyle = "rgba(56,189,248,0.65)";
    ctx.lineWidth = 2.5;
    ctx.setLineDash([]);
    ctx.stroke();

    // Gauge — animated stroke around perimeter
    if (progress > 0) {
      const perim = quadPerimeter(quad);
      const dashLen = (progress / 100) * perim;
      ctx.beginPath();
      ctx.moveTo(quad[0][0], quad[0][1]);
      for (let i = 1; i < 4; i++) ctx.lineTo(quad[i][0], quad[i][1]);
      ctx.closePath();
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 5;
      ctx.shadowColor = "rgba(56,189,248,0.9)";
      ctx.shadowBlur = 12;
      ctx.setLineDash([dashLen, perim + 1]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;
    }

    // Corner dots
    quad.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.fillStyle = "#38bdf8";
      ctx.shadowColor = "#38bdf8";
      ctx.shadowBlur = 14;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Progress % label with text outline for readability
    if (progress > 5) {
      const [lx, ly] = quad[0];
      const pct = Math.round(progress);
      ctx.font = "bold 14px system-ui";
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(0,0,0,0.7)";
      ctx.strokeText(`${pct}%`, lx + 8, ly - 10);
      ctx.fillStyle = "#38bdf8";
      ctx.fillText(`${pct}%`, lx + 8, ly - 10);
    }
  };

  // ── Capture with perspective correction ───────────────────────────────────
  const doCaptureWithCorrection = useCallback(() => {
    const video   = videoRef.current;
    const overlay = overlayRef.current;
    if (!video) return;
    triggerFlash();

    const vw = video.videoWidth || 1280;
    const vh = video.videoHeight || 720;

    const capCanvas = document.createElement("canvas");
    capCanvas.width = vw; capCanvas.height = vh;
    const capCtx = capCanvas.getContext("2d")!;
    capCtx.filter = "contrast(1.12) brightness(1.04) saturate(0.88)";
    capCtx.drawImage(video, 0, 0, vw, vh);
    capCtx.filter = "none";

    const quad = quadRef.current;

    if (quad && window.cv?.Mat && overlay) {
      const sx = vw / overlay.width;
      const sy = vh / overlay.height;
      const scaledQuad = quad.map(([x, y]) => [x * sx, y * sy] as [number, number]);
      const sorted = sortCorners(scaledQuad) as [[number,number],[number,number],[number,number],[number,number]];
      const cv = window.cv;
      const src = cv.imread(capCanvas);

      const w = Math.round(Math.max(
        Math.hypot(sorted[1][0]-sorted[0][0], sorted[1][1]-sorted[0][1]),
        Math.hypot(sorted[2][0]-sorted[3][0], sorted[2][1]-sorted[3][1])
      ));
      const h = Math.round(Math.max(
        Math.hypot(sorted[3][0]-sorted[0][0], sorted[3][1]-sorted[0][1]),
        Math.hypot(sorted[2][0]-sorted[1][0], sorted[2][1]-sorted[1][1])
      ));

      if (w > 80 && h > 80) {
        const srcPts = cv.matFromArray(4, 1, cv.CV_32FC2, sorted.flat());
        const dstPts = cv.matFromArray(4, 1, cv.CV_32FC2, [0,0, w,0, w,h, 0,h]);
        const M   = cv.getPerspectiveTransform(srcPts, dstPts);
        const dst = new cv.Mat();
        cv.warpPerspective(src, dst, M, new cv.Size(w, h));

        const outCanvas = document.createElement("canvas");
        outCanvas.width = w; outCanvas.height = h;
        cv.imshow(outCanvas, dst);
        [src, dst, M, srcPts, dstPts].forEach((m) => { try { m.delete(); } catch {} });

        outCanvas.toBlob((blob) => {
          if (!blob) return;
          const idx = pagesRef.current.length + 1;
          const file = new File([blob], `scan-p${idx}.jpg`, { type: "image/jpeg" });
          const url  = URL.createObjectURL(blob);
          setPages((prev) => [...prev, { file, url }]);
          toast.success(`Page ${idx} scannée et recadrée ✓`);
          gaugeStartRef.current = null; gaugeRef.current = 0; isCapturingRef.current = false;
        }, "image/jpeg", 0.93);
        return;
      }
      try { src.delete(); } catch {}
    }

    // Fallback: no warp
    capCanvas.toBlob((blob) => {
      if (!blob) return;
      const idx = pagesRef.current.length + 1;
      const file = new File([blob], `scan-p${idx}.jpg`, { type: "image/jpeg" });
      const url  = URL.createObjectURL(blob);
      setPages((prev) => [...prev, { file, url }]);
      toast.success(`Page ${idx} capturée.`);
      gaugeStartRef.current = null; gaugeRef.current = 0; isCapturingRef.current = false;
    }, "image/jpeg", 0.93);
  }, []);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    setPages((prev) => [...prev, ...Array.from(list).map((f) => ({
      file: f,
      url: f.type.startsWith("image/") ? URL.createObjectURL(f) : "",
    }))]);
  };

  const removePage = (i: number) => {
    setPages((prev) => {
      URL.revokeObjectURL(prev[i].url);
      const next = prev.filter((_, idx) => idx !== i);
      setCurrentPage((c) => Math.min(c, Math.max(0, next.length - 1)));
      return next;
    });
  };

  const submitScan = async () => {
    setSaving(true);
    const formData = new FormData();
    pages.forEach((p) => formData.append("files", p.file));
    formData.append("operationType", opType);
    try {
      const res  = await fetch(`${apiBase}/api/accounting-intelligence/imports/scan`, { method: "POST", credentials: "include", body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Import impossible");
      setOcrData(json.data);
      setStep("result");
      onImported();
    } catch (err: any) {
      toast.error(err.message ?? "Erreur import");
    } finally {
      setSaving(false);
    }
  };

  // ── STEP: capture ──────────────────────────────────────────────────────────
  const renderCapture = () => (
    <div className="grid lg:grid-cols-[1.3fr_.7fr] gap-4">
      <div className="space-y-3">
        <div
          className="relative overflow-hidden rounded-2xl bg-black aspect-[3/4] sm:aspect-video"
          style={{ border: "1px solid rgba(124,58,237,0.3)" }}
        >
          <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />

          {/* Vignette */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "radial-gradient(ellipse at center,transparent 48%,rgba(0,0,0,0.6) 100%)"
          }} />

          {/* OpenCV detection overlay */}
          <canvas ref={overlayRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }} />

          {/* Flash */}
          <div ref={flashRef} className="absolute inset-0 bg-white pointer-events-none transition-opacity duration-[200ms]" style={{ opacity: 0 }} />

          {/* Frame guide drawn directly on canvas — no DOM fallback needed */}

          {/* Status bar */}
          <div className="absolute bottom-3 left-3 right-3 rounded-full bg-black/70 backdrop-blur-sm px-3 py-1.5 text-xs text-white text-center z-10">
            {cvStatus === "loading" && <span className="flex items-center justify-center gap-2"><Loader2 className="h-3 w-3 animate-spin" />Chargement détection IA…</span>}
            {cvStatus === "error"   && "Détection IA indisponible — capture manuelle active"}
            {cvStatus === "ready"   && !cameraReady  && "Caméra indisponible — importez un fichier"}
            {cvStatus === "ready"   && cameraReady && !detected && "Cadrez le document — détection automatique en cours…"}
            {cvStatus === "ready"   && cameraReady && detected  && `Document détecté ✓ — scan auto dans ${Math.max(0, Math.round(5 - (gaugeRef.current / 100) * 5))}s`}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" className="gradient-primary text-primary-foreground" onClick={doCaptureWithCorrection} disabled={!cameraReady || saving}>
            <Camera className="h-4 w-4 mr-2" />Capturer maintenant
          </Button>
          <Button type="button" variant="outline" onClick={() => removePage(pages.length - 1)} disabled={!pages.length}>
            <RotateCcw className="h-4 w-4 mr-2" />Annuler dernière
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="rounded-2xl border p-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Pages ({pages.length})</p>
            <label className="cursor-pointer text-xs text-primary hover:underline">
              + Fichier
              <Input type="file" accept="image/*,.pdf" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
            </label>
          </div>
          {pages.length === 0
            ? <div className="h-20 flex items-center justify-center border-2 border-dashed rounded-xl text-xs text-muted-foreground text-center px-2">
                Prenez une photo ou importez un fichier
              </div>
            : <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {pages.map((p, i) => (
                  <div key={i} className="relative group rounded-lg overflow-hidden border bg-muted aspect-[3/4]">
                    {p.url
                      ? <img src={p.url} alt="" className="h-full w-full object-cover" style={{ filter: "contrast(1.08)" }} />
                      : <div className="h-full flex items-center justify-center"><FileText className="h-5 w-5 text-muted-foreground" /></div>
                    }
                    <div className="absolute top-1 left-1 rounded bg-black/60 px-1 text-[9px] text-white">{i + 1}</div>
                    <button className="absolute top-1 right-1 rounded-full bg-black/60 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removePage(i)}>
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
          }
        </div>

        <div className="flex rounded-lg border overflow-hidden text-xs">
          <button className={`flex-1 py-2 font-medium transition-colors ${opType === "EXPENSE" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`} onClick={() => setOpType("EXPENSE")}>Dépense</button>
          <button className={`flex-1 py-2 font-medium transition-colors ${opType === "INCOME"  ? "bg-success text-white"             : "hover:bg-muted"}`} onClick={() => setOpType("INCOME")}>Recette</button>
        </div>

        <Button className="w-full gradient-primary text-primary-foreground" onClick={() => { setCurrentPage(0); setStep("preview"); }} disabled={!pages.length}>
          Aperçu avant import →
        </Button>
      </div>
    </div>
  );

  // ── STEP: preview ──────────────────────────────────────────────────────────
  const renderPreview = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => setStep("capture")}>
          <ChevronLeft className="h-4 w-4 mr-1" />Reprendre
        </Button>
        <span className="text-xs text-muted-foreground">{pages.length} page(s) · {opType === "EXPENSE" ? "Dépense" : "Recette"}</span>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: "#1e1e22", padding: "16px 12px" }}>
        {pages.length > 1 && (
          <div className="flex items-center justify-center gap-3 mb-3">
            <button className="rounded-full bg-white/10 hover:bg-white/20 p-1 disabled:opacity-30" onClick={() => setCurrentPage((c) => Math.max(0, c - 1))} disabled={currentPage === 0}>
              <ChevronLeft className="h-4 w-4 text-white" />
            </button>
            <span className="text-xs text-white/70">Page {currentPage + 1} / {pages.length}</span>
            <button className="rounded-full bg-white/10 hover:bg-white/20 p-1 disabled:opacity-30" onClick={() => setCurrentPage((c) => Math.min(pages.length - 1, c + 1))} disabled={currentPage === pages.length - 1}>
              <ChevronRight className="h-4 w-4 text-white" />
            </button>
          </div>
        )}

        <div className="flex justify-center">
          <div
            className="relative bg-white rounded-sm overflow-hidden cursor-zoom-in"
            style={{ maxWidth: 420, width: "100%", boxShadow: "0 4px 32px rgba(0,0,0,0.7), 0 1px 4px rgba(0,0,0,0.4)" }}
            onClick={() => pages[currentPage]?.url && setFullscreenUrl(pages[currentPage].url)}
          >
            {pages[currentPage]?.url
              ? <>
                  <img src={pages[currentPage].url} alt="" className="w-full block" style={{ filter: "contrast(1.1) brightness(1.02) saturate(0.85)" }} />
                  <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg,rgba(255,255,255,0.03) 0%,transparent 50%,rgba(0,0,0,0.04) 100%)" }} />
                </>
              : <div className="h-64 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <FileText className="h-10 w-10 opacity-30" />
                  <span className="text-sm">{pages[currentPage]?.file.name}</span>
                </div>
            }
            <div className="absolute bottom-2 right-2 rounded-full bg-black/50 p-1">
              <ZoomIn className="h-3.5 w-3.5 text-white/70" />
            </div>
          </div>
        </div>

        {pages.length > 1 && (
          <div className="flex gap-2 mt-3 overflow-x-auto justify-center">
            {pages.map((p, i) => (
              <button key={i} onClick={() => setCurrentPage(i)}
                className="flex-shrink-0 rounded overflow-hidden"
                style={{ width: 44, height: 58, border: i === currentPage ? "2px solid #38bdf8" : "2px solid transparent", opacity: i === currentPage ? 1 : 0.55 }}>
                {p.url ? <img src={p.url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-white/10 flex items-center justify-center"><FileText className="h-4 w-4 text-white/40" /></div>}
              </button>
            ))}
          </div>
        )}
      </div>

      <Button className="w-full gradient-primary text-primary-foreground" onClick={submitScan} disabled={saving}>
        <UploadCloud className="h-4 w-4 mr-2" />
        {saving ? "Lecture OCR en cours…" : `Valider et importer (${pages.length} page${pages.length > 1 ? "s" : ""})`}
      </Button>
    </div>
  );

  // ── STEP: result ───────────────────────────────────────────────────────────
  const renderResult = () => (
    <div className="space-y-4">
      <div className={`rounded-xl border p-4 space-y-3 ${(ocrData?.ocrConfidence ?? 0) >= 0.6 ? "border-success/30 bg-success/5" : "border-warning/30 bg-warning/5"}`}>
        <div className="flex items-center gap-2 flex-wrap">
          {(ocrData?.ocrConfidence ?? 0) >= 0.6 ? <CheckCircle2 className="h-4 w-4 text-success" /> : <AlertTriangle className="h-4 w-4 text-warning" />}
          <span className="text-sm font-semibold">Opération créée et classée</span>
          <Badge variant="secondary" className="text-[10px]">Confiance OCR {Math.round((ocrData?.ocrConfidence ?? 0) * 100)}%</Badge>
          {ocrData?.documentType && <Badge variant="outline" className="text-[10px] capitalize">{ocrData.documentType}</Badge>}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          {ocrData?.extractedMerchant && <div className="rounded-lg bg-background border p-2"><p className="text-muted-foreground mb-0.5">Fournisseur</p><p className="font-semibold truncate">{ocrData.extractedMerchant}</p></div>}
          {ocrData?.extractedDate     && <div className="rounded-lg bg-background border p-2"><p className="text-muted-foreground mb-0.5">Date</p><p className="font-semibold">{new Date(ocrData.extractedDate).toLocaleDateString("fr-FR")}</p></div>}
          {ocrData?.extractedTTC != null && <div className="rounded-lg bg-background border p-2"><p className="text-muted-foreground mb-0.5">Montant TTC</p><p className={`font-semibold ${opType === "EXPENSE" ? "text-destructive" : "text-success"}`}>{opType === "EXPENSE" ? "−" : "+"}{fmt(Math.abs(ocrData.extractedTTC))}</p></div>}
          {ocrData?.transaction && <div className="rounded-lg bg-background border p-2 col-span-2"><p className="text-muted-foreground mb-0.5">Classée dans les opérations</p><p className="font-semibold text-[11px] truncate">{ocrData.transaction.labelRaw}</p></div>}
        </div>
        {(ocrData?.ocrConfidence ?? 0) < 0.5 && <p className="text-[11px] text-warning">Confiance faible — l'opération est marquée "À valider". Corrigez le montant et la TVA dans la liste.</p>}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={resetAll}>Scanner un autre document</Button>
        <Button className="flex-1 gradient-primary text-primary-foreground" onClick={() => handleClose(false)}>Fermer</Button>
      </div>
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {fullscreenUrl && (
        <div className="fixed inset-0 z-[200] bg-black/92 flex items-center justify-center" onClick={() => setFullscreenUrl(null)}>
          <img src={fullscreenUrl} alt="" className="max-h-[92vh] max-w-[92vw] object-contain rounded shadow-2xl" />
          <button className="absolute top-4 right-4 text-white/80 hover:text-white" onClick={() => setFullscreenUrl(null)}><X className="h-7 w-7" /></button>
        </div>
      )}

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogTrigger asChild>
          {trigger ?? (
            <Button variant="outline" size="sm">
              <ScanLine className="h-4 w-4 mr-2" />Scanner un document
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {step === "capture" && "Scanner un document"}
              {step === "preview" && "Aperçu du scan"}
              {step === "result"  && "Document importé"}
            </DialogTitle>
            <DialogDescription>
              {step === "capture" && "Cadrez dans le rectangle — détection automatique des bords et scan en 5s"}
              {step === "preview" && "Vérifiez la lisibilité avant la lecture OCR"}
              {step === "result"  && "L'opération est classée par date dans vos transactions"}
            </DialogDescription>
          </DialogHeader>
          {step === "capture" && renderCapture()}
          {step === "preview" && renderPreview()}
          {step === "result"  && renderResult()}
        </DialogContent>
      </Dialog>
    </>
  );
}
