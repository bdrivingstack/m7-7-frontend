import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Camera, RotateCcw, UploadCloud, X, CheckCircle2, AlertTriangle,
  FileText, ZoomIn, ChevronLeft, ChevronRight, ScanLine, Loader2,
  RefreshCw, Trash2, Check, Sparkles,
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

type PagePreview = { file: File; url: string; width?: number; height?: number };
type Quad = [[number, number], [number, number], [number, number], [number, number]];
type Step = "capture" | "preview" | "result";

type DetectionCandidate = {
  quad: Quad;
  area: number;
  score: number;
  source: string;
  confidence: number;
};

type FrameQuality = {
  blur: number;
  brightness: number;
  contrast: number;
  ok: boolean;
  reason: string;
};

export type ScanImportDialogProps = {
  onImported: () => void;
  trigger?: React.ReactNode;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const SCAN_DELAY_MS = 5000;
const PROCESS_EVERY_MS = 160;
const MIN_STABLE_FRAMES = 4;
const REQUIRED_STABLE_MS = 5000;
const JPEG_QUALITY = 0.94;
const MAX_PROCESS_WIDTH = 840;
const MIN_BLUR_LAPLACIAN = 42;
const MIN_BRIGHTNESS = 45;
const MAX_BRIGHTNESS = 225;
const MAX_QUAD_MOVEMENT_RATIO = 0.035;
const MAX_QUAD_AREA_CHANGE = 0.08;
const MIN_CANDIDATE_CONFIDENCE = 0.24;

// ─── Utilities ────────────────────────────────────────────────────────────────

function loadOpenCV(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.cv?.Mat) { resolve(); return; }

    const existing = document.getElementById("opencv-js");
    if (existing) {
      const poll = setInterval(() => {
        if (window.cv?.Mat) { clearInterval(poll); resolve(); }
      }, 150);
      setTimeout(() => { clearInterval(poll); reject(new Error("OpenCV timeout")); }, 30000);
      return;
    }

    const s = document.createElement("script");
    s.id = "opencv-js";
    s.src = "https://docs.opencv.org/4.8.0/opencv.js";
    s.async = true;
    s.onload = () => {
      const poll = setInterval(() => {
        if (window.cv?.Mat) { clearInterval(poll); resolve(); }
      }, 150);
      setTimeout(() => { clearInterval(poll); reject(new Error("OpenCV timeout")); }, 30000);
    };
    s.onerror = () => reject(new Error("Impossible de charger OpenCV"));
    document.head.appendChild(s);
  });
}

function distance(a: [number, number], b: [number, number]) {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

function polygonArea(q: Quad): number {
  let sum = 0;
  for (let i = 0; i < q.length; i++) {
    const [x1, y1] = q[i];
    const [x2, y2] = q[(i + 1) % q.length];
    sum += x1 * y2 - x2 * y1;
  }
  return Math.abs(sum / 2);
}

function quadPerimeter(q: Quad): number {
  return q.reduce((sum, pt, i) => sum + distance(pt, q[(i + 1) % 4]), 0);
}

// Sort quad corners → [TL, TR, BR, BL]
function sortCorners(pts: [number, number][]): Quad {
  const points = [...pts];
  const center: [number, number] = [
    points.reduce((s, p) => s + p[0], 0) / points.length,
    points.reduce((s, p) => s + p[1], 0) / points.length,
  ];

  const sorted = points.sort((a, b) => Math.atan2(a[1] - center[1], a[0] - center[0]) - Math.atan2(b[1] - center[1], b[0] - center[0]));
  const tlIndex = sorted.reduce((best, p, i) => (p[0] + p[1] < sorted[best][0] + sorted[best][1] ? i : best), 0);
  const rotated = [...sorted.slice(tlIndex), ...sorted.slice(0, tlIndex)] as Quad;

  if (rotated[1][1] > rotated[3][1]) {
    return [rotated[0], rotated[3], rotated[2], rotated[1]] as Quad;
  }
  return rotated;
}

function normalizeQuadForPortrait(q: Quad): Quad {
  const s = sortCorners([...q]);
  const top = distance(s[0], s[1]);
  const right = distance(s[1], s[2]);
  if (top > right) return [s[3], s[0], s[1], s[2]] as Quad;
  return s;
}

function quadDeltaRatio(a: Quad, b: Quad, diag: number): number {
  const sa = sortCorners([...a]);
  const sb = sortCorners([...b]);
  const deltas = sa.map((p, i) => distance(p, sb[i]) / diag);
  return Math.max(...deltas);
}

function smoothQuad(prev: Quad, next: Quad, alpha = 0.25): Quad {
  const p = sortCorners([...prev]);
  const n = sortCorners([...next]);
  return n.map(([x, y], i) => [p[i][0] + alpha * (x - p[i][0]), p[i][1] + alpha * (y - p[i][1])] as [number, number]) as Quad;
}

function clampQuad(q: Quad, w: number, h: number): Quad {
  return q.map(([x, y]) => [Math.max(0, Math.min(w, x)), Math.max(0, Math.min(h, y))] as [number, number]) as Quad;
}

function getQuadShapeScore(q: Quad, frameW: number, frameH: number) {
  const area = polygonArea(q);
  const frameArea = frameW * frameH;
  const areaRatio = area / frameArea;
  const top = distance(q[0], q[1]);
  const right = distance(q[1], q[2]);
  const bottom = distance(q[2], q[3]);
  const left = distance(q[3], q[0]);
  const widthAvg = (top + bottom) / 2;
  const heightAvg = (left + right) / 2;
  const aspect = Math.max(widthAvg, heightAvg) / Math.max(1, Math.min(widthAvg, heightAvg));

  const sideBalance = 1 - Math.min(0.78, (
    Math.abs(top - bottom) / Math.max(top, bottom, 1) +
    Math.abs(left - right) / Math.max(left, right, 1)
  ) / 2);

  const minEdge = Math.min(top, right, bottom, left);
  const edgeScore = Math.min(1, minEdge / Math.max(1, Math.min(frameW, frameH) * 0.14));
  const aspectScore = aspect >= 1.18 && aspect <= 7.2 ? 1 : 0.18;
  const areaScore = areaRatio >= 0.025 && areaRatio <= 0.78 ? 1 : 0.08;
  const margin = Math.min(frameW, frameH) * 0.015;
  const insideScore = q.every(([x, y]) => x > margin && y > margin && x < frameW - margin && y < frameH - margin) ? 1 : 0.55;

  const score = area * sideBalance * aspectScore * areaScore * edgeScore * insideScore;
  const confidence = Math.max(0, Math.min(1, sideBalance * aspectScore * areaScore * edgeScore * insideScore));
  return { score, confidence };
}

function angleOfLine(l: [number, number, number, number]) {
  return Math.atan2(l[3] - l[1], l[2] - l[0]);
}

function lineIntersection(a: [number, number, number, number], b: [number, number, number, number]): [number, number] | null {
  const [x1, y1, x2, y2] = a;
  const [x3, y3, x4, y4] = b;
  const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(den) < 1e-6) return null;
  const px = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / den;
  const py = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / den;
  return [px, py];
}

function buildHoughQuad(linesMat: any, frameW: number, frameH: number): Quad | null {
  const lines: [number, number, number, number][] = [];
  for (let i = 0; i < linesMat.rows; i++) {
    const d = linesMat.data32S.slice(i * 4, i * 4 + 4) as any;
    const l: [number, number, number, number] = [d[0], d[1], d[2], d[3]];
    if (distance([l[0], l[1]], [l[2], l[3]]) > Math.min(frameW, frameH) * 0.18) lines.push(l);
  }
  if (lines.length < 4) return null;

  const vertical = lines.filter((l) => Math.abs(Math.cos(angleOfLine(l))) < 0.45).slice(0, 8);
  const horizontal = lines.filter((l) => Math.abs(Math.sin(angleOfLine(l))) < 0.45).slice(0, 8);
  if (vertical.length < 2 || horizontal.length < 2) return null;

  const xMid = (l: [number, number, number, number]) => (l[0] + l[2]) / 2;
  const yMid = (l: [number, number, number, number]) => (l[1] + l[3]) / 2;
  const left = vertical.reduce((a, b) => xMid(a) < xMid(b) ? a : b);
  const right = vertical.reduce((a, b) => xMid(a) > xMid(b) ? a : b);
  const top = horizontal.reduce((a, b) => yMid(a) < yMid(b) ? a : b);
  const bottom = horizontal.reduce((a, b) => yMid(a) > yMid(b) ? a : b);

  const tl = lineIntersection(left, top);
  const tr = lineIntersection(right, top);
  const br = lineIntersection(right, bottom);
  const bl = lineIntersection(left, bottom);
  if (!tl || !tr || !br || !bl) return null;

  const q = clampQuad(sortCorners([tl, tr, br, bl]), frameW, frameH);
  const area = polygonArea(q);
  if (area < frameW * frameH * 0.025 || area > frameW * frameH * 0.78) return null;
  return q;
}

function estimateFrameQuality(gray: any, cv: any): FrameQuality {
  const mean = new cv.Mat();
  const std = new cv.Mat();
  const lap = new cv.Mat();
  const lapMean = new cv.Mat();
  const lapStd = new cv.Mat();
  try {
    cv.meanStdDev(gray, mean, std);
    cv.Laplacian(gray, lap, cv.CV_64F);
    cv.meanStdDev(lap, lapMean, lapStd);
    const brightness = mean.doubleAt(0, 0);
    const contrast = std.doubleAt(0, 0);
    const blur = Math.pow(lapStd.doubleAt(0, 0), 2);
    const ok = blur >= MIN_BLUR_LAPLACIAN && brightness >= MIN_BRIGHTNESS && brightness <= MAX_BRIGHTNESS;
    const reason = blur < MIN_BLUR_LAPLACIAN ? "Image floue — stabilisez" : brightness < MIN_BRIGHTNESS ? "Trop sombre" : brightness > MAX_BRIGHTNESS ? "Trop lumineux" : "";
    return { blur, brightness, contrast, ok, reason };
  } finally {
    [mean, std, lap, lapMean, lapStd].forEach((m) => { try { m?.delete(); } catch {} });
  }
}

async function blobFromCanvas(canvas: HTMLCanvasElement, quality = JPEG_QUALITY): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Impossible de générer l'image")), "image/jpeg", quality);
  });
}

function imageDataVariance(gray: any, cv: any): number {
  const mean = new cv.Mat();
  const std = new cv.Mat();
  try {
    cv.meanStdDev(gray, mean, std);
    return std.doubleAt(0, 0);
  } finally {
    try { mean.delete(); std.delete(); } catch {}
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ScanImportDialog({ onImported, trigger }: ScanImportDialogProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const procCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);
  const loopActiveRef = useRef(false);
  const cvReadyRef = useRef(false);
  const quadRef = useRef<Quad | null>(null);
  const displayedQuadRef = useRef<Quad | null>(null);
  const gaugeStartRef = useRef<number | null>(null);
  const gaugeRef = useRef(0);
  const isCapturingRef = useRef(false);
  const pagesRef = useRef<PagePreview[]>([]);
  const prevQuadRef = useRef<Quad | null>(null);
  const stableFrameRef = useRef(0);
  const lastCaptureAtRef = useRef(0);
  const lastDetectionSourceRef = useRef<string>("");

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("capture");
  const [pages, setPages] = useState<PagePreview[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);
  const [cvStatus, setCvStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [saving, setSaving] = useState(false);
  const [ocrData, setOcrData] = useState<OcrData | null>(null);
  const [opType, setOpType] = useState<"EXPENSE" | "INCOME">("EXPENSE");
  const [fullscreenUrl, setFullscreenUrl] = useState<string | null>(null);
  const [detected, setDetected] = useState(false);
  const [capturePreviewUrl, setCapturePreviewUrl] = useState<string | null>(null);
  const [capturePreviewIndex, setCapturePreviewIndex] = useState<number | null>(null);

  const remainingSeconds = Math.max(0, Math.ceil((SCAN_DELAY_MS - (gaugeRef.current / 100) * SCAN_DELAY_MS) / 1000));

  useEffect(() => { pagesRef.current = pages; }, [pages]);

  // ── Camera stream ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open || step !== "capture" || capturePreviewUrl) {
      if (!open || step !== "capture") {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        setCameraReady(false);
      }
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) return;

    const startCamera = (constraints: MediaStreamConstraints) => navigator.mediaDevices.getUserMedia(constraints);

    startCamera({
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        aspectRatio: { ideal: 1.777777 },
      },
      audio: false,
    })
      .catch(() => startCamera({ video: true, audio: false }))
      .then((stream) => {
        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        const onReady = () => { setCameraReady(true); video.removeEventListener("canplay", onReady); };
        video.addEventListener("canplay", onReady);
        video.play().catch(() => undefined);
      })
      .catch(() => setCameraReady(false));
  }, [open, step, capturePreviewUrl]);

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
    if (!open || step !== "capture" || !cameraReady || !cvReadyRef.current || capturePreviewUrl) return;
    loopActiveRef.current = true;
    let lastMs = 0;

    const loop = (ts: number) => {
      if (!loopActiveRef.current) return;
      if (ts - lastMs >= PROCESS_EVERY_MS) { lastMs = ts; processFrame(); }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { loopActiveRef.current = false; cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, step, cameraReady, cvStatus, capturePreviewUrl]);

  const resetDetection = useCallback(() => {
    gaugeStartRef.current = null;
    gaugeRef.current = 0;
    quadRef.current = null;
    displayedQuadRef.current = null;
    prevQuadRef.current = null;
    stableFrameRef.current = 0;
    setDetected(false);
    const overlay = overlayRef.current;
    if (overlay) drawOverlay(overlay, null, 0, "");
  }, []);

  // ── Reset on close ─────────────────────────────────────────────────────────
  const resetAll = () => {
    pagesRef.current.forEach((p) => p.url && URL.revokeObjectURL(p.url));
    if (capturePreviewUrl) URL.revokeObjectURL(capturePreviewUrl);
    setPages([]);
    setStep("capture");
    setOcrData(null);
    setCurrentPage(0);
    setCameraReady(false);
    setCapturePreviewUrl(null);
    setCapturePreviewIndex(null);
    isCapturingRef.current = false;
    lastCaptureAtRef.current = 0;
    resetDetection();
  };

  const handleClose = (v: boolean) => { if (!v) resetAll(); setOpen(v); };

  // ── Flash ──────────────────────────────────────────────────────────────────
  const triggerFlash = () => {
    const el = flashRef.current; if (!el) return;
    el.style.opacity = "1";
    setTimeout(() => { el.style.opacity = "0"; }, 180);
  };

  // ── Detection helpers ──────────────────────────────────────────────────────
  const findBestQuad = useCallback((proc: HTMLCanvasElement): DetectionCandidate | null => {
    const cv = window.cv;
    if (!cv?.Mat) return null;

    const candidates: DetectionCandidate[] = [];
    let src: any, gray: any, eq: any, blurred: any, edges: any, dilated: any;
    let adaptive: any, morph: any, kernel3: any, kernel5: any, kernel11: any, houghLines: any;
    let darkText: any, textClosed: any, textDilated: any, textKernel: any, tallKernel: any;
    let contours: any, hierarchy: any;

    const contentScore = (q: Quad, source: string): number => {
      if (!gray || !edges) return 0.6;
      const mask = new cv.Mat.zeros(proc.height, proc.width, cv.CV_8U);
      const ring = new cv.Mat();
      const ringOnly = new cv.Mat();
      const edgeInside = new cv.Mat();
      const edgeOutside = new cv.Mat();
      const pts = cv.matFromArray(4, 1, cv.CV_32SC2, q.flat().map(Math.round));
      const ptsVec = new cv.MatVector();
      try {
        ptsVec.push_back(pts);
        cv.fillPoly(mask, ptsVec, new cv.Scalar(255));

        const k = cv.Mat.ones(21, 21, cv.CV_8U);
        cv.dilate(mask, ring, k);
        cv.subtract(ring, mask, ringOnly);
        try { k.delete(); } catch {}

        const meanIn = cv.mean(gray, mask)[0];
        const meanOut = cv.mean(gray, ringOnly)[0];
        const brightnessDelta = meanIn - meanOut;

        cv.bitwise_and(edges, edges, edgeInside, mask);
        cv.bitwise_and(edges, edges, edgeOutside, ringOnly);
        const insideArea = Math.max(1, cv.countNonZero(mask));
        const outsideArea = Math.max(1, cv.countNonZero(ringOnly));
        const edgeDensityIn = cv.countNonZero(edgeInside) / insideArea;
        const edgeDensityOut = cv.countNonZero(edgeOutside) / outsideArea;

        const paperBrightnessScore = meanIn > 112 ? 1 : meanIn > 88 ? 0.72 : 0.35;
        const contrastScore = brightnessDelta > 18 ? 1 : brightnessDelta > 6 ? 0.72 : 0.46;
        const textDetailScore = edgeDensityIn > 0.018 ? 1 : edgeDensityIn > 0.009 ? 0.72 : 0.34;
        const backgroundPenalty = edgeDensityOut > edgeDensityIn * 1.8 ? 0.55 : 1;
        const sourcePenalty = source.includes("hough") && textDetailScore < 0.72 ? 0.62 : 1;
        return Math.max(0.05, Math.min(1.25, paperBrightnessScore * 0.34 + contrastScore * 0.26 + textDetailScore * 0.4)) * backgroundPenalty * sourcePenalty;
      } finally {
        [mask, ring, ringOnly, edgeInside, edgeOutside, pts, ptsVec].forEach((m) => { try { m?.delete(); } catch {} });
      }
    };

    const centerScore = (q: Quad): number => {
      const cx = q.reduce((s, p) => s + p[0], 0) / 4;
      const cy = q.reduce((s, p) => s + p[1], 0) / 4;
      const dx = Math.abs(cx - proc.width / 2) / (proc.width / 2);
      const dy = Math.abs(cy - proc.height / 2) / (proc.height / 2);
      const d = Math.sqrt(dx * dx + dy * dy);
      return Math.max(0.42, 1 - d * 0.42);
    };

    const pushCandidate = (q: Quad, source: string, areaOverride?: number) => {
      const area = areaOverride ?? polygonArea(q);
      const { score, confidence } = getQuadShapeScore(q, proc.width, proc.height);
      if (confidence < MIN_CANDIDATE_CONFIDENCE) return;

      const content = contentScore(q, source);
      if (content < 0.34) return;

      // text-receipt candidates get highest priority — they are built from actual document content
      const srcMultiplier = source.includes("text-receipt") ? 1.34 : source.includes("edge") ? 1.12 : source.includes("adaptive") ? 1.04 : source.includes("hough") ? 0.96 : 0.82;
      candidates.push({
        quad: q,
        area,
        score: score * content * centerScore(q) * srcMultiplier,
        source,
        confidence: Math.min(1, confidence * content),
      });
    };

    // ── Strategy 0: text-cluster — robust on wrinkled/grey paper ─────────────
    // Each word/line becomes a small zone; dilation merges nearby zones;
    // vertically-aligned text blocks are grouped and their bounding box becomes the document quad.
    const collectTextReceiptCandidate = () => {
      if (!gray) return;
      darkText = new cv.Mat();
      textClosed = new cv.Mat();
      textDilated = new cv.Mat();
      textKernel = cv.Mat.ones(7, 3, cv.CV_8U);
      tallKernel = cv.Mat.ones(19, 7, cv.CV_8U);

      type TextRect = { x: number; y: number; width: number; height: number; area: number; cx: number; cy: number };

      try {
        cv.adaptiveThreshold(gray, darkText, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY_INV, 31, 13);
        cv.morphologyEx(darkText, textClosed, cv.MORPH_OPEN, textKernel);
        cv.dilate(textClosed, textDilated, tallKernel, new cv.Point(-1, -1), 1);

        const cText = new cv.MatVector();
        const hText = new cv.Mat();
        try {
          cv.findContours(textDilated, cText, hText, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

          const frameArea = proc.width * proc.height;
          const rawRects: TextRect[] = [];

          for (let i = 0; i < cText.size(); i++) {
            const cnt = cText.get(i);
            try {
              const rect = cv.boundingRect(cnt);
              const area = rect.width * rect.height;
              const aspect = Math.max(rect.width, rect.height) / Math.max(1, Math.min(rect.width, rect.height));

              // Remove isolated noise, fold marks, background dots and large flat regions
              if (
                area < frameArea * 0.0012 ||
                area > frameArea * 0.22 ||
                rect.width < 8 ||
                rect.height < 6 ||
                aspect > 18
              ) continue;

              rawRects.push({
                x: rect.x, y: rect.y,
                width: rect.width, height: rect.height,
                area,
                cx: rect.x + rect.width / 2,
                cy: rect.y + rect.height / 2,
              });
            } finally { try { cnt.delete(); } catch {} }
          }

          if (!rawRects.length) return;

          // Find the main vertical axis of the receipt then group aligned blocks
          const sortedByArea = [...rawRects].sort((a, b) => b.area - a.area);
          const seed = sortedByArea[0];
          const medianWidth = sortedByArea[Math.floor(Math.min(sortedByArea.length - 1, 4))]?.width || seed.width;
          const axisTolerance = Math.max(proc.width * 0.11, medianWidth * 1.25, 38);

          const aligned = rawRects.filter((r) => {
            const verticalCompatible = Math.abs(r.cx - seed.cx) <= axisTolerance;
            const overlapsMainColumn = r.x < seed.x + seed.width + axisTolerance && r.x + r.width > seed.x - axisTolerance;
            const plausibleText = r.area >= frameArea * 0.0012 && r.height <= proc.height * 0.28;
            return plausibleText && (verticalCompatible || overlapsMainColumn);
          });

          const group = aligned.length >= 2 ? aligned : sortedByArea.slice(0, Math.min(4, sortedByArea.length));
          if (!group.length) return;

          // Merge minX/minY/maxX/maxY of all retained text blocks
          const minX = Math.min(...group.map((r) => r.x));
          const minY = Math.min(...group.map((r) => r.y));
          const maxX = Math.max(...group.map((r) => r.x + r.width));
          const maxY = Math.max(...group.map((r) => r.y + r.height));
          const textW = maxX - minX;
          const textH = maxY - minY;

          if (textW < proc.width * 0.05 || textH < proc.height * 0.16) return;

          // Document padding: text is always slightly inside the receipt edges
          const padX = Math.max(16, textW * 0.22);
          const padTop = Math.max(20, textH * 0.18);
          const padBottom = Math.max(28, textH * 0.24);

          const x1 = Math.max(0, minX - padX);
          const y1 = Math.max(0, minY - padTop);
          const x2 = Math.min(proc.width, maxX + padX);
          const y2 = Math.min(proc.height, maxY + padBottom);

          const q = sortCorners([[x1, y1], [x2, y1], [x2, y2], [x1, y2]]);
          pushCandidate(q, "text-receipt-cluster", polygonArea(q));

          // Wider variant for wrinkled receipts with sparse printing at top/bottom
          const widePadX = Math.max(20, textW * 0.30);
          const widePadTop = Math.max(24, textH * 0.24);
          const widePadBottom = Math.max(34, textH * 0.32);
          const qWide = sortCorners([
            [Math.max(0, minX - widePadX), Math.max(0, minY - widePadTop)],
            [Math.min(proc.width, maxX + widePadX), Math.max(0, minY - widePadTop)],
            [Math.min(proc.width, maxX + widePadX), Math.min(proc.height, maxY + widePadBottom)],
            [Math.max(0, minX - widePadX), Math.min(proc.height, maxY + widePadBottom)],
          ]);
          pushCandidate(qWide, "text-receipt-wide", polygonArea(qWide));
        } finally {
          try { cText?.delete(); hText?.delete(); } catch {}
        }
      } catch {}
    };

    const collectFromMask = (mask: any, source: string, retrieval = cv.RETR_EXTERNAL) => {
      contours = new cv.MatVector();
      hierarchy = new cv.Mat();
      try {
        cv.findContours(mask, contours, hierarchy, retrieval, cv.CHAIN_APPROX_SIMPLE);
        const frameArea = proc.width * proc.height;
        const minArea = frameArea * 0.025;
        const maxArea = frameArea * 0.72;

        for (let i = 0; i < contours.size(); i++) {
          const cnt = contours.get(i);
          const hull = new cv.Mat();
          const approx = new cv.Mat();
          try {
            const area = cv.contourArea(cnt);
            if (area < minArea || area > maxArea) continue;

            cv.convexHull(cnt, hull, false, true);
            const peri = cv.arcLength(hull, true);
            if (peri < Math.min(proc.width, proc.height) * 0.46) continue;

            for (const eps of [0.012, 0.018, 0.026, 0.036, 0.052, 0.075, 0.105]) {
              cv.approxPolyDP(hull, approx, eps * peri, true);

              let pts: [number, number][] = [];
              if (approx.rows === 4) {
                const d = approx.data32S;
                pts = [[d[0], d[1]], [d[2], d[3]], [d[4], d[5]], [d[6], d[7]]];
              } else if (approx.rows > 4 && !source.includes("hough")) {
                const rect = cv.minAreaRect(hull);
                const vertices = cv.RotatedRect.points(rect);
                pts = vertices.map((p: any) => [p.x, p.y] as [number, number]);
              }

              if (pts.length === 4) {
                const q = clampQuad(sortCorners(pts), proc.width, proc.height);
                const qArea = polygonArea(q);
                if (qArea < minArea || qArea > maxArea) continue;
                pushCandidate(q, source, qArea);
                break;
              }
            }
          } finally {
            try { cnt.delete(); hull.delete(); approx.delete(); } catch {}
          }
        }
      } finally {
        try { contours?.delete(); hierarchy?.delete(); } catch {}
      }
    };

    try {
      src = cv.imread(proc);
      gray = new cv.Mat();
      eq = new cv.Mat();
      blurred = new cv.Mat();
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

      const quality = estimateFrameQuality(gray, cv);
      if (!quality.ok) return null;

      const clahe = new cv.CLAHE(2.2, new cv.Size(8, 8));
      clahe.apply(gray, eq);
      try { clahe.delete(); } catch {}

      const blurSize = quality.contrast < 28 ? 5 : 7;
      cv.GaussianBlur(eq, blurred, new cv.Size(blurSize, blurSize), 0);

      kernel3 = cv.Mat.ones(3, 3, cv.CV_8U);
      kernel5 = cv.Mat.ones(5, 5, cv.CV_8U);
      kernel11 = cv.Mat.ones(11, 11, cv.CV_8U);

      // 0) Text-cluster: highest priority — works on white surface, wrinkled paper, any background
      collectTextReceiptCandidate();

      // 1) Canny: true document/ticket edge contours
      edges = new cv.Mat();
      dilated = new cv.Mat();
      const low = quality.contrast < 25 ? 10 : 22;
      const high = quality.contrast < 25 ? 48 : 92;
      cv.Canny(blurred, edges, low, high);
      cv.dilate(edges, dilated, kernel3, new cv.Point(-1, -1), 1);
      cv.morphologyEx(dilated, dilated, cv.MORPH_CLOSE, kernel5);
      collectFromMask(dilated, "edge+canny+close", cv.RETR_EXTERNAL);

      // 2) Adaptive threshold: white/grey paper on bright surfaces
      adaptive = new cv.Mat();
      morph = new cv.Mat();
      cv.adaptiveThreshold(blurred, adaptive, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY_INV, 25, 9);
      cv.morphologyEx(adaptive, morph, cv.MORPH_CLOSE, kernel5, new cv.Point(-1, -1), 2);
      collectFromMask(morph, "adaptive-inv", cv.RETR_EXTERNAL);

      // 3) Hough Lines: fallback only, penalised by content score against sofa/carpet patterns
      houghLines = new cv.Mat();
      cv.HoughLinesP(dilated, houghLines, 1, Math.PI / 180, 52, Math.min(proc.width, proc.height) * 0.24, 18);
      const houghQuad = buildHoughQuad(houghLines, proc.width, proc.height);
      if (houghQuad) pushCandidate(houghQuad, "hough-lines");

      // 4) Otsu: last resort, never prioritised
      const otsu = new cv.Mat();
      const otsuInv = new cv.Mat();
      try {
        cv.threshold(blurred, otsu, 0, 255, cv.THRESH_BINARY | cv.THRESH_OTSU);
        cv.morphologyEx(otsu, otsu, cv.MORPH_CLOSE, kernel11);
        collectFromMask(otsu, "otsu-bright-fallback", cv.RETR_EXTERNAL);

        cv.threshold(blurred, otsuInv, 0, 255, cv.THRESH_BINARY_INV | cv.THRESH_OTSU);
        cv.morphologyEx(otsuInv, otsuInv, cv.MORPH_CLOSE, kernel11);
        collectFromMask(otsuInv, "otsu-dark-fallback", cv.RETR_EXTERNAL);
      } finally {
        try { otsu.delete(); otsuInv.delete(); } catch {}
      }
    } catch {
      return null;
    } finally {
      [src, gray, eq, blurred, edges, dilated, adaptive, morph, kernel3, kernel5, kernel11, houghLines, darkText, textClosed, textDilated, textKernel, tallKernel]
        .forEach((m) => { try { m?.delete(); } catch {} });
    }

    if (!candidates.length) return null;
    candidates.sort((a, b) => b.score - a.score);
    return candidates[0];
  }, []);

  // ── Process one video frame ────────────────────────────────────────────────
  const processFrame = useCallback(() => {
    const video = videoRef.current;
    const overlay = overlayRef.current;
    const cv = window.cv;
    if (!video || !overlay || !cv?.Mat || isCapturingRef.current) return;
    if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) return;

    const rect = video.getBoundingClientRect();
    const dw = Math.round(rect.width) || video.clientWidth || 640;
    const dh = Math.round(rect.height) || video.clientHeight || 480;
    if (!dw || !dh) return;
    if (overlay.width !== dw || overlay.height !== dh) { overlay.width = dw; overlay.height = dh; }

    if (!procCanvasRef.current) procCanvasRef.current = document.createElement("canvas");
    const proc = procCanvasRef.current;
    const procW = Math.min(video.videoWidth, MAX_PROCESS_WIDTH);
    const procH = Math.round(video.videoHeight * procW / video.videoWidth);
    proc.width = procW;
    proc.height = procH;

    try { proc.getContext("2d", { willReadFrequently: true })!.drawImage(video, 0, 0, procW, procH); } catch { return; }

    const candidate = findBestQuad(proc);
    const now = performance.now();
    const diag = Math.hypot(dw, dh);

    let candidateDisplayQuad: Quad | null = null;
    if (candidate?.quad) {
      const sx = dw / procW;
      const sy = dh / procH;
      candidateDisplayQuad = candidate.quad.map(([x, y]) => [x * sx, y * sy] as [number, number]) as Quad;
      candidateDisplayQuad = sortCorners(candidateDisplayQuad);
      lastDetectionSourceRef.current = candidate.source;
    }

    if (!candidateDisplayQuad) {
      resetDetection();
      drawOverlay(overlay, null, 0, "");
      return;
    }

    const prev = prevQuadRef.current;
    const movement = prev ? quadDeltaRatio(prev, candidateDisplayQuad, diag) : 1;
    const areaChange = prev ? Math.abs(polygonArea(prev) - polygonArea(candidateDisplayQuad)) / Math.max(1, polygonArea(prev)) : 1;
    const perspectiveChange = movement > MAX_QUAD_MOVEMENT_RATIO || areaChange > MAX_QUAD_AREA_CHANGE;

    if (!prev || perspectiveChange) {
      prevQuadRef.current = candidateDisplayQuad;
      displayedQuadRef.current = candidateDisplayQuad;
      stableFrameRef.current = 1;
      gaugeStartRef.current = null;
      gaugeRef.current = 0;
      quadRef.current = null;
      setDetected(false);
      drawOverlay(overlay, candidateDisplayQuad, 0, "Stabilisez");
      return;
    }

    stableFrameRef.current += 1;
    const smoothed = displayedQuadRef.current ? smoothQuad(displayedQuadRef.current, candidateDisplayQuad, 0.22) : candidateDisplayQuad;
    displayedQuadRef.current = smoothed;
    prevQuadRef.current = candidateDisplayQuad;

    if (stableFrameRef.current >= MIN_STABLE_FRAMES) {
      quadRef.current = smoothed;
      if (gaugeStartRef.current === null) gaugeStartRef.current = now;
      const stableElapsed = now - gaugeStartRef.current;
      gaugeRef.current = Math.min(100, (stableElapsed / REQUIRED_STABLE_MS) * 100);
      setDetected(true);

      if (stableElapsed >= SCAN_DELAY_MS && now - lastCaptureAtRef.current > 1200) {
        lastCaptureAtRef.current = now;
        isCapturingRef.current = true;
        setTimeout(() => doCaptureWithCorrection(), 0);
      }
    } else {
      gaugeStartRef.current = null;
      gaugeRef.current = 0;
      quadRef.current = null;
      setDetected(false);
    }

    drawOverlay(overlay, smoothed, gaugeRef.current, lastDetectionSourceRef.current);
  }, [findBestQuad, resetDetection]);

  // ── Draw detection overlay + gauge ────────────────────────────────────────
  const drawOverlay = (canvas: HTMLCanvasElement, quad: Quad | null, progress: number, hint = "") => {
    const ctx = canvas.getContext("2d");
    if (!ctx || !canvas.width || !canvas.height) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const w = canvas.width, h = canvas.height;
    const arm = Math.min(w, h) * 0.07;
    const mg = Math.min(w, h) * 0.09;
    const bracketColor = quad ? "rgba(56,189,248,0.95)" : "rgba(255,255,255,0.45)";

    ctx.strokeStyle = bracketColor;
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.setLineDash([]);
    const brackets: [[number, number], [number, number], [number, number]][] = [
      [[mg + arm, mg], [mg, mg], [mg, mg + arm]],
      [[w - mg - arm, mg], [w - mg, mg], [w - mg, mg + arm]],
      [[mg + arm, h - mg], [mg, h - mg], [mg, h - mg - arm]],
      [[w - mg - arm, h - mg], [w - mg, h - mg], [w - mg, h - mg - arm]],
    ];
    brackets.forEach(([[x1, y1], [x2, y2], [x3, y3]]) => {
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.stroke();
    });

    if (!quad) return;

    ctx.beginPath();
    ctx.moveTo(quad[0][0], quad[0][1]);
    for (let i = 1; i < 4; i++) ctx.lineTo(quad[i][0], quad[i][1]);
    ctx.closePath();
    ctx.fillStyle = "rgba(37,99,235,0.28)";
    ctx.fill();

    ctx.strokeStyle = "rgba(29,78,216,0.95)";
    ctx.lineWidth = 3.5;
    ctx.stroke();

    if (progress > 0) {
      const perim = quadPerimeter(quad);
      const dashLen = (progress / 100) * perim;
      ctx.beginPath();
      ctx.moveTo(quad[0][0], quad[0][1]);
      for (let i = 1; i < 4; i++) ctx.lineTo(quad[i][0], quad[i][1]);
      ctx.closePath();
      ctx.strokeStyle = "#1d4ed8";
      ctx.lineWidth = 7;
      ctx.shadowColor = "rgba(56,189,248,0.95)";
      ctx.shadowBlur = 14;
      ctx.setLineDash([dashLen, perim + 1]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;
    }

    quad.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fillStyle = "#1d4ed8";
      ctx.shadowColor = "#1d4ed8";
      ctx.shadowBlur = 16;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    const [lx, ly] = quad[0];
    const label = progress > 3 ? `${Math.round(progress)}%` : hint;
    if (label) {
      ctx.font = "800 15px system-ui";
      ctx.lineWidth = 4;
      ctx.strokeStyle = "rgba(0,0,0,0.72)";
      ctx.strokeText(label, lx + 8, ly - 10);
      ctx.fillStyle = "#38bdf8";
      ctx.fillText(label, lx + 8, ly - 10);
    }
  };

  // ── Post-warp crop: removes remaining table/sofa from the final image ─────
  const cropCanvasToDocumentOnly = (canvas: HTMLCanvasElement): HTMLCanvasElement => {
    const cv = window.cv;
    if (!cv?.Mat) return canvas;

    let src: any, gray: any, bin: any, dilated: any, kOpen: any, kDilate: any, contours: any, hierarchy: any;
    try {
      src = cv.imread(canvas);
      gray = new cv.Mat();
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

      bin = new cv.Mat();
      cv.adaptiveThreshold(gray, bin, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY_INV, 31, 12);

      kOpen = cv.Mat.ones(3, 3, cv.CV_8U);
      kDilate = cv.Mat.ones(15, 7, cv.CV_8U);
      cv.morphologyEx(bin, bin, cv.MORPH_OPEN, kOpen);
      dilated = new cv.Mat();
      cv.dilate(bin, dilated, kDilate, new cv.Point(-1, -1), 1);

      contours = new cv.MatVector();
      hierarchy = new cv.Mat();
      cv.findContours(dilated, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

      const rects: Array<{ x: number; y: number; width: number; height: number; area: number }> = [];
      const frameArea = canvas.width * canvas.height;
      for (let i = 0; i < contours.size(); i++) {
        const cnt = contours.get(i);
        try {
          const r = cv.boundingRect(cnt);
          const area = r.width * r.height;
          if (area > frameArea * 0.0008 && area < frameArea * 0.35 && r.width > 8 && r.height > 5) {
            rects.push({ ...r, area });
          }
        } finally { try { cnt.delete(); } catch {} }
      }

      if (rects.length < 2) return canvas;

      const minX = Math.min(...rects.map((r) => r.x));
      const minY = Math.min(...rects.map((r) => r.y));
      const maxX = Math.max(...rects.map((r) => r.x + r.width));
      const maxY = Math.max(...rects.map((r) => r.y + r.height));
      const textW = maxX - minX;
      const textH = maxY - minY;

      if (textW < canvas.width * 0.18 || textH < canvas.height * 0.18) return canvas;

      const padX = Math.max(18, textW * 0.20);
      const padTop = Math.max(22, textH * 0.16);
      const padBottom = Math.max(28, textH * 0.22);

      const x = Math.max(0, Math.floor(minX - padX));
      const y = Math.max(0, Math.floor(minY - padTop));
      const cw = Math.min(canvas.width - x, Math.ceil(textW + padX * 2));
      const ch = Math.min(canvas.height - y, Math.ceil(textH + padTop + padBottom));

      // Keep warp if crop would leave almost the same area (perspective was already tight)
      if (cw * ch > frameArea * 0.94) return canvas;

      const cropped = document.createElement("canvas");
      cropped.width = cw;
      cropped.height = ch;
      cropped.getContext("2d")!.drawImage(canvas, x, y, cw, ch, 0, 0, cw, ch);
      return cropped;
    } catch {
      return canvas;
    } finally {
      [src, gray, bin, dilated, kOpen, kDilate, contours, hierarchy].forEach((m) => { try { m?.delete(); } catch {} });
    }
  };

  const enhanceScanCanvas = (canvas: HTMLCanvasElement): HTMLCanvasElement => {
    const cv = window.cv;
    if (!cv?.Mat) return canvas;

    let src: any, rgb: any, gray: any, denoise: any, out: any;
    try {
      src = cv.imread(canvas);
      rgb = new cv.Mat();
      gray = new cv.Mat();
      denoise = new cv.Mat();
      out = new cv.Mat();

      cv.cvtColor(src, rgb, cv.COLOR_RGBA2RGB);
      cv.cvtColor(rgb, gray, cv.COLOR_RGB2GRAY);
      cv.bilateralFilter(gray, denoise, 7, 55, 55);
      cv.adaptiveThreshold(denoise, out, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 31, 11);

      const outCanvas = document.createElement("canvas");
      outCanvas.width = canvas.width;
      outCanvas.height = canvas.height;
      cv.imshow(outCanvas, out);
      return outCanvas;
    } catch {
      return canvas;
    } finally {
      [src, rgb, gray, denoise, out].forEach((m) => { try { m?.delete(); } catch {} });
    }
  };

  // ── Capture with perspective correction ───────────────────────────────────
  const doCaptureWithCorrection = useCallback(async () => {
    const video = videoRef.current;
    const overlay = overlayRef.current;
    if (!video) { isCapturingRef.current = false; return; }

    triggerFlash();

    const vw = video.videoWidth || 1280;
    const vh = video.videoHeight || 720;
    const capCanvas = document.createElement("canvas");
    capCanvas.width = vw;
    capCanvas.height = vh;
    const capCtx = capCanvas.getContext("2d")!;
    capCtx.filter = "contrast(1.08) brightness(1.03) saturate(0.9)";
    capCtx.drawImage(video, 0, 0, vw, vh);
    capCtx.filter = "none";

    const quad = quadRef.current;

    // Blocked: if no document detected, never save a full-frame photo with background
    if (!quad) {
      toast.error("Document non détecté : rapprochez le document et réessayez.");
      isCapturingRef.current = false;
      resetDetection();
      return;
    }

    let outCanvas: HTMLCanvasElement = capCanvas;

    if (window.cv?.Mat && overlay?.width && overlay?.height) {
      const sx = vw / overlay.width;
      const sy = vh / overlay.height;
      const scaledQuad = normalizeQuadForPortrait(quad.map(([x, y]) => [x * sx, y * sy] as [number, number]) as Quad);
      const cv = window.cv;
      let src: any, srcPts: any, dstPts: any, matrix: any, dst: any;

      try {
        src = cv.imread(capCanvas);
        const topW = distance(scaledQuad[0], scaledQuad[1]);
        const bottomW = distance(scaledQuad[3], scaledQuad[2]);
        const leftH = distance(scaledQuad[0], scaledQuad[3]);
        const rightH = distance(scaledQuad[1], scaledQuad[2]);
        let w = Math.round(Math.max(topW, bottomW));
        let h = Math.round(Math.max(leftH, rightH));

        const shouldRotateOutput = w > h;
        if (shouldRotateOutput) [w, h] = [h, w];

        if (w > 100 && h > 100) {
          const dstArray = shouldRotateOutput
            ? [0, h, 0, 0, w, 0, w, h]
            : [0, 0, w, 0, w, h, 0, h];

          srcPts = cv.matFromArray(4, 1, cv.CV_32FC2, scaledQuad.flat());
          dstPts = cv.matFromArray(4, 1, cv.CV_32FC2, dstArray);
          matrix = cv.getPerspectiveTransform(srcPts, dstPts);
          dst = new cv.Mat();
          cv.warpPerspective(src, dst, matrix, new cv.Size(w, h), cv.INTER_CUBIC, cv.BORDER_REPLICATE);

          const warped = document.createElement("canvas");
          warped.width = w;
          warped.height = h;
          cv.imshow(warped, dst);

          // Double crop: after perspective warp, crop again to document-only content
          const documentOnly = cropCanvasToDocumentOnly(warped);
          outCanvas = enhanceScanCanvas(documentOnly);
        }
      } catch {
        // warp failed — still blocked from saving raw frame
        toast.error("Correction perspective impossible. Réessayez.");
        isCapturingRef.current = false;
        resetDetection();
        return;
      } finally {
        [src, srcPts, dstPts, matrix, dst].forEach((m) => { try { m?.delete(); } catch {} });
      }
    }

    try {
      const blob = await blobFromCanvas(outCanvas);
      const idx = pagesRef.current.length + 1;
      const file = new File([blob], `scan-p${idx}.jpg`, { type: "image/jpeg" });
      const url = URL.createObjectURL(blob);
      const page: PagePreview = { file, url, width: outCanvas.width, height: outCanvas.height };
      setPages((prev) => [...prev, page]);
      setCurrentPage(idx - 1);
      setCapturePreviewUrl(url);
      setCapturePreviewIndex(idx - 1);
      toast.success(`Page ${idx} scannée et redressée ✓`);
    } catch (err: any) {
      toast.error(err?.message ?? "Capture impossible");
    } finally {
      isCapturingRef.current = false;
      resetDetection();
    }
  }, [resetDetection]);

  const rejectLastCapture = () => {
    if (capturePreviewIndex == null) return;
    setPages((prev) => {
      const target = prev[capturePreviewIndex];
      if (target?.url) URL.revokeObjectURL(target.url);
      return prev.filter((_, i) => i !== capturePreviewIndex);
    });
    setCapturePreviewUrl(null);
    setCapturePreviewIndex(null);
    resetDetection();
  };

  const acceptCapturePreview = () => {
    setCapturePreviewUrl(null);
    setCapturePreviewIndex(null);
    resetDetection();
  };

  const rotateCurrentPreview = async () => {
    if (capturePreviewIndex == null) return;
    const page = pagesRef.current[capturePreviewIndex];
    if (!page?.url) return;

    const img = new Image();
    img.onload = async () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.height;
      canvas.height = img.width;
      const ctx = canvas.getContext("2d")!;
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(Math.PI / 2);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      const blob = await blobFromCanvas(canvas);
      const url = URL.createObjectURL(blob);
      const file = new File([blob], page.file.name, { type: "image/jpeg" });

      setPages((prev) => {
        const next = [...prev];
        if (next[capturePreviewIndex]?.url) URL.revokeObjectURL(next[capturePreviewIndex].url);
        next[capturePreviewIndex] = { file, url, width: canvas.width, height: canvas.height };
        return next;
      });
      setCapturePreviewUrl(url);
    };
    img.src = page.url;
  };

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    setPages((prev) => [...prev, ...Array.from(list).map((f) => ({
      file: f,
      url: f.type.startsWith("image/") ? URL.createObjectURL(f) : "",
    }))]);
  };

  const removePage = (i: number) => {
    setPages((prev) => {
      if (prev[i]?.url) URL.revokeObjectURL(prev[i].url);
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
      const res = await fetch(`${apiBase}/api/accounting-intelligence/imports/scan`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
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
    <div className="grid lg:grid-cols-[1.35fr_.65fr] gap-4">
      <div className="space-y-3">
        <div
          className="relative overflow-hidden rounded-[1.35rem] bg-black aspect-[3/4] sm:aspect-video shadow-xl"
          style={{ border: "1px solid rgba(124,58,237,0.28)" }}
        >
          {!capturePreviewUrl && <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />}

          {capturePreviewUrl && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#111114] p-4">
              <div className="relative h-full w-full flex items-center justify-center">
                <img src={capturePreviewUrl} alt="Aperçu du scan" className="max-h-full max-w-full rounded-md bg-white shadow-2xl object-contain" />
                <div className="absolute top-3 left-3 rounded-full bg-emerald-500/95 text-white text-xs font-semibold px-3 py-1 shadow-lg flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" /> Aperçu PDF prêt
                </div>
              </div>
            </div>
          )}

          <div className="absolute inset-0 pointer-events-none" style={{
            background: capturePreviewUrl ? "transparent" : "radial-gradient(ellipse at center,transparent 50%,rgba(0,0,0,0.58) 100%)"
          }} />

          <canvas ref={overlayRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }} />
          <div ref={flashRef} className="absolute inset-0 bg-white pointer-events-none transition-opacity duration-[180ms] z-30" style={{ opacity: 0 }} />

          <div className="absolute bottom-3 left-3 right-3 rounded-full bg-black/72 backdrop-blur-md px-3 py-2 text-xs text-white text-center z-40 shadow-lg">
            {capturePreviewUrl && "Vérifiez le rendu redressé avant de continuer"}
            {!capturePreviewUrl && cvStatus === "loading" && <span className="flex items-center justify-center gap-2"><Loader2 className="h-3 w-3 animate-spin" />Chargement détection premium…</span>}
            {!capturePreviewUrl && cvStatus === "error" && "Détection indisponible — capture manuelle active"}
            {!capturePreviewUrl && cvStatus === "ready" && !cameraReady && "Caméra indisponible — importez un fichier"}
            {!capturePreviewUrl && cvStatus === "ready" && cameraReady && !detected && "Cadrez le document — surface blanche OK, bords recherchés…"}
            {!capturePreviewUrl && cvStatus === "ready" && cameraReady && detected && `Document net et stable ✓ — scan auto dans ${remainingSeconds}s`}
          </div>
        </div>

        {!capturePreviewUrl ? (
          <div className="flex flex-wrap gap-2">
            <Button type="button" className="gradient-primary text-primary-foreground shadow-md" onClick={doCaptureWithCorrection} disabled={!cameraReady || saving}>
              <Camera className="h-4 w-4 mr-2" />Capturer maintenant
            </Button>
            <Button type="button" variant="outline" onClick={() => removePage(pages.length - 1)} disabled={!pages.length}>
              <RotateCcw className="h-4 w-4 mr-2" />Annuler dernière
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            <Button type="button" variant="outline" onClick={rejectLastCapture}>
              <Trash2 className="h-4 w-4 mr-2" />Refaire
            </Button>
            <Button type="button" variant="outline" onClick={rotateCurrentPreview}>
              <RefreshCw className="h-4 w-4 mr-2" />Tourner
            </Button>
            <Button type="button" className="gradient-primary text-primary-foreground" onClick={acceptCapturePreview}>
              <Check className="h-4 w-4 mr-2" />Valider
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="rounded-2xl border bg-card/70 p-3 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Pages ({pages.length})</p>
            <label className="cursor-pointer text-xs text-primary hover:underline font-medium">
              + Fichier
              <Input type="file" accept="image/*,.pdf" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
            </label>
          </div>
          {pages.length === 0
            ? <div className="h-24 flex flex-col items-center justify-center border-2 border-dashed rounded-xl text-xs text-muted-foreground text-center px-2 gap-1">
                <Sparkles className="h-4 w-4 opacity-60" />
                Prenez une photo ou importez un fichier
              </div>
            : <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {pages.map((p, i) => (
                  <div key={i} className={`relative group rounded-xl overflow-hidden border bg-muted aspect-[3/4] ${capturePreviewIndex === i ? "ring-2 ring-sky-400" : ""}`}>
                    {p.url
                      ? <img src={p.url} alt="" className="h-full w-full object-cover" style={{ filter: "contrast(1.06)" }} />
                      : <div className="h-full flex items-center justify-center"><FileText className="h-5 w-5 text-muted-foreground" /></div>
                    }
                    <div className="absolute top-1 left-1 rounded bg-black/65 px-1.5 py-0.5 text-[9px] text-white font-semibold">{i + 1}</div>
                    <button className="absolute top-1 right-1 rounded-full bg-black/65 p-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removePage(i)}>
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
          }
        </div>

        <div className="flex rounded-xl border overflow-hidden text-xs bg-card shadow-sm">
          <button className={`flex-1 py-2.5 font-semibold transition-colors ${opType === "EXPENSE" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`} onClick={() => setOpType("EXPENSE")}>Dépense</button>
          <button className={`flex-1 py-2.5 font-semibold transition-colors ${opType === "INCOME" ? "bg-success text-white" : "hover:bg-muted"}`} onClick={() => setOpType("INCOME")}>Recette</button>
        </div>

        <Button className="w-full gradient-primary text-primary-foreground shadow-md" onClick={() => { setCurrentPage(0); setStep("preview"); }} disabled={!pages.length || !!capturePreviewUrl}>
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

      <div className="rounded-2xl overflow-hidden border" style={{ background: "#17171b", padding: "16px 12px" }}>
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
            className="relative bg-white rounded-md overflow-hidden cursor-zoom-in"
            style={{ maxWidth: 420, width: "100%", boxShadow: "0 4px 36px rgba(0,0,0,0.72), 0 1px 4px rgba(0,0,0,0.4)" }}
            onClick={() => pages[currentPage]?.url && setFullscreenUrl(pages[currentPage].url)}
          >
            {pages[currentPage]?.url
              ? <>
                  <img src={pages[currentPage].url} alt="" className="w-full block" />
                  <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg,rgba(255,255,255,0.035) 0%,transparent 50%,rgba(0,0,0,0.035) 100%)" }} />
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

      <Button className="w-full gradient-primary text-primary-foreground shadow-md" onClick={submitScan} disabled={saving}>
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
          {ocrData?.extractedDate && <div className="rounded-lg bg-background border p-2"><p className="text-muted-foreground mb-0.5">Date</p><p className="font-semibold">{new Date(ocrData.extractedDate).toLocaleDateString("fr-FR")}</p></div>}
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
              {step === "result" && "Document importé"}
            </DialogTitle>
            <DialogDescription>
              {step === "capture" && "Cadrez le document — le scan automatique se déclenche uniquement après 5s de stabilité."}
              {step === "preview" && "Vérifiez la lisibilité avant la lecture OCR."}
              {step === "result" && "L'opération est classée par date dans vos transactions."}
            </DialogDescription>
          </DialogHeader>
          {step === "capture" && renderCapture()}
          {step === "preview" && renderPreview()}
          {step === "result" && renderResult()}
        </DialogContent>
      </Dialog>
    </>
  );
}
