import { useEffect, useRef, useState } from "react";
import {
  Camera, RotateCcw, UploadCloud, X, CheckCircle2, AlertTriangle,
  FileText, ZoomIn, ChevronLeft, ChevronRight, ScanLine,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const apiBase = import.meta.env.VITE_API_BASE_URL ?? "";
const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

type OcrData = {
  transaction?: { id: string; bookingDate: string; labelRaw: string; amountTTC: number };
  ocrConfidence: number;
  extractedDate?: string;
  extractedMerchant?: string;
  extractedTTC?: number;
  documentType?: string;
};

type PagePreview = { file: File; url: string };

type ScanImportDialogProps = {
  onImported: () => void;
  trigger?: React.ReactNode;
};

type Step = "capture" | "preview" | "result";

export function ScanImportDialog({ onImported, trigger }: ScanImportDialogProps) {
  const videoRef  = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const flashRef  = useRef<HTMLDivElement | null>(null);

  const [open, setOpen]             = useState(false);
  const [step, setStep]             = useState<Step>("capture");
  const [pages, setPages]           = useState<PagePreview[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);
  const [saving, setSaving]         = useState(false);
  const [ocrData, setOcrData]       = useState<OcrData | null>(null);
  const [opType, setOpType]         = useState<"EXPENSE" | "INCOME">("EXPENSE");
  const [fullscreenUrl, setFullscreenUrl] = useState<string | null>(null);

  // Camera init / cleanup
  useEffect(() => {
    if (!open) {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setCameraReady(false);
      return;
    }
    if (step !== "capture") return;
    if (!navigator.mediaDevices?.getUserMedia) return;

    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCameraReady(true);
      })
      .catch(() => setCameraReady(false));
  }, [open, step]);

  // Stop camera when we leave capture step
  useEffect(() => {
    if (step !== "capture") {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, [step]);

  const resetAll = () => {
    pages.forEach((p) => URL.revokeObjectURL(p.url));
    setPages([]);
    setStep("capture");
    setOcrData(null);
    setCurrentPage(0);
    setCameraReady(false);
  };

  const handleClose = (v: boolean) => {
    if (!v) resetAll();
    setOpen(v);
  };

  // Flash effect
  const triggerFlash = () => {
    const el = flashRef.current;
    if (!el) return;
    el.style.opacity = "1";
    setTimeout(() => { el.style.opacity = "0"; }, 200);
  };

  const capturePage = () => {
    const video = videoRef.current;
    if (!video || !cameraReady) return toast.error("Caméra non disponible.");
    const canvas = document.createElement("canvas");
    canvas.width  = video.videoWidth  || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.filter = "contrast(1.12) brightness(1.04) saturate(0.9)";
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    triggerFlash();
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `scan-p${pages.length + 1}.jpg`, { type: "image/jpeg" });
      const url  = URL.createObjectURL(blob);
      setPages((prev) => [...prev, { file, url }]);
      toast.success(`Page ${pages.length + 1} capturée.`);
    }, "image/jpeg", 0.93);
  };

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const added: PagePreview[] = Array.from(list).map((f) => ({
      file: f,
      url: f.type.startsWith("image/") ? URL.createObjectURL(f) : "",
    }));
    setPages((prev) => [...prev, ...added]);
  };

  const removePage = (i: number) => {
    setPages((prev) => {
      URL.revokeObjectURL(prev[i].url);
      const next = prev.filter((_, idx) => idx !== i);
      setCurrentPage((c) => Math.min(c, next.length - 1));
      return next;
    });
  };

  const goToPreview = () => {
    if (!pages.length) return toast.error("Capturez au moins une page.");
    setCurrentPage(0);
    setStep("preview");
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
      toast.error(err.message ?? "Erreur lors du scan");
    } finally {
      setSaving(false);
    }
  };

  // ── STEP: capture ─────────────────────────────────────────────────────────
  const renderCapture = () => (
    <div className="grid lg:grid-cols-[1.3fr_.7fr] gap-4">
      {/* Camera */}
      <div className="space-y-3">
        <div
          className="relative overflow-hidden rounded-2xl bg-black aspect-[3/4] sm:aspect-video"
          style={{ border: "1px solid rgba(124,58,237,0.3)" }}
        >
          <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />

          {/* Vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)" }}
          />

          {/* Violet scanner frame */}
          <div
            className="absolute pointer-events-none"
            style={{
              inset: "8%",
              border: "2.5px solid #7c3aed",
              borderRadius: "10px",
              boxShadow: "0 0 0 1px rgba(124,58,237,0.15), 0 0 30px rgba(124,58,237,0.5)",
            }}
          >
            {[
              { top: -2, left: -2, borderTop: "4px solid #a78bfa", borderLeft: "4px solid #a78bfa", borderRadius: "7px 0 0 0" },
              { top: -2, right: -2, borderTop: "4px solid #a78bfa", borderRight: "4px solid #a78bfa", borderRadius: "0 7px 0 0" },
              { bottom: -2, left: -2, borderBottom: "4px solid #a78bfa", borderLeft: "4px solid #a78bfa", borderRadius: "0 0 0 7px" },
              { bottom: -2, right: -2, borderBottom: "4px solid #a78bfa", borderRight: "4px solid #a78bfa", borderRadius: "0 0 7px 0" },
            ].map((s, i) => (
              <div key={i} className="absolute w-7 h-7" style={s} />
            ))}
            {cameraReady && (
              <div
                className="absolute left-0 right-0 h-[2px] pointer-events-none"
                style={{
                  background: "linear-gradient(90deg,transparent,rgba(167,139,250,0.85),transparent)",
                  animation: "scanLine 2s linear infinite",
                }}
              />
            )}
          </div>

          {/* Flash */}
          <div
            ref={flashRef}
            className="absolute inset-0 bg-white pointer-events-none transition-opacity duration-[200ms]"
            style={{ opacity: 0 }}
          />

          {/* Status */}
          <div className="absolute bottom-3 left-3 right-3 rounded-full bg-black/70 backdrop-blur-sm px-3 py-1.5 text-xs text-white text-center z-10">
            {cameraReady
              ? pages.length > 0 ? `✓ ${pages.length} page(s) — continuez ou passez à l'aperçu` : "Cadrez le document dans le rectangle violet"
              : "Caméra indisponible — importez un fichier"}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            className="gradient-primary text-primary-foreground"
            onClick={capturePage}
            disabled={!cameraReady || saving}
          >
            <Camera className="h-4 w-4 mr-2" />Prendre la photo
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => removePage(pages.length - 1)}
            disabled={!pages.length}
          >
            <RotateCcw className="h-4 w-4 mr-2" />Annuler dernière
          </Button>
        </div>
      </div>

      {/* Right panel */}
      <div className="space-y-3">
        {/* Pages list */}
        <div className="rounded-2xl border p-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Pages capturées ({pages.length})</p>
            <label className="cursor-pointer text-xs text-primary hover:underline">
              + Fichier
              <Input type="file" accept="image/*,.pdf" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
            </label>
          </div>
          {pages.length === 0 ? (
            <div className="h-20 flex items-center justify-center border-2 border-dashed rounded-xl text-xs text-muted-foreground text-center px-2">
              Prenez une photo ou importez un fichier
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {pages.map((p, i) => (
                <div key={i} className="relative group rounded-lg overflow-hidden border bg-muted aspect-[3/4]">
                  {p.url
                    ? <img src={p.url} alt="" className="h-full w-full object-cover" style={{ filter: "contrast(1.08)" }} />
                    : <div className="h-full flex items-center justify-center"><FileText className="h-5 w-5 text-muted-foreground" /></div>
                  }
                  <div className="absolute top-1 left-1 rounded bg-black/60 px-1 text-[9px] text-white">{i + 1}</div>
                  <button
                    className="absolute top-1 right-1 rounded-full bg-black/60 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removePage(i)}
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Type toggle */}
        <div className="flex rounded-lg border overflow-hidden text-xs">
          <button
            className={`flex-1 py-2 font-medium transition-colors ${opType === "EXPENSE" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            onClick={() => setOpType("EXPENSE")}
          >Dépense</button>
          <button
            className={`flex-1 py-2 font-medium transition-colors ${opType === "INCOME" ? "bg-success text-white" : "hover:bg-muted"}`}
            onClick={() => setOpType("INCOME")}
          >Recette</button>
        </div>

        <Button
          className="w-full gradient-primary text-primary-foreground"
          onClick={goToPreview}
          disabled={!pages.length}
        >
          Aperçu avant import →
        </Button>
      </div>
    </div>
  );

  // ── STEP: preview (document scanné style PDF) ──────────────────────────────
  const renderPreview = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => setStep("capture")}>
          <ChevronLeft className="h-4 w-4 mr-1" />Reprendre la capture
        </Button>
        <span className="text-xs text-muted-foreground">{pages.length} page(s) · {opType === "EXPENSE" ? "Dépense" : "Recette"}</span>
      </div>

      {/* Document viewer — style scan PDF */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "#2a2a2e", padding: "16px", minHeight: "320px" }}
      >
        {/* Page navigation */}
        {pages.length > 1 && (
          <div className="flex items-center justify-center gap-3 mb-3">
            <button
              className="rounded-full bg-white/10 hover:bg-white/20 p-1 disabled:opacity-30"
              onClick={() => setCurrentPage((c) => Math.max(0, c - 1))}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="h-4 w-4 text-white" />
            </button>
            <span className="text-xs text-white/70">Page {currentPage + 1} / {pages.length}</span>
            <button
              className="rounded-full bg-white/10 hover:bg-white/20 p-1 disabled:opacity-30"
              onClick={() => setCurrentPage((c) => Math.min(pages.length - 1, c + 1))}
              disabled={currentPage === pages.length - 1}
            >
              <ChevronRight className="h-4 w-4 text-white" />
            </button>
          </div>
        )}

        {/* Page document */}
        <div className="flex justify-center">
          <div
            className="relative bg-white rounded-sm overflow-hidden cursor-pointer"
            style={{
              maxWidth: "420px",
              width: "100%",
              boxShadow: "0 4px 32px rgba(0,0,0,0.6), 0 1px 4px rgba(0,0,0,0.4)",
            }}
            onClick={() => pages[currentPage]?.url && setFullscreenUrl(pages[currentPage].url)}
          >
            {pages[currentPage]?.url ? (
              <>
                <img
                  src={pages[currentPage].url}
                  alt={`Page ${currentPage + 1}`}
                  className="w-full"
                  style={{ filter: "contrast(1.1) brightness(1.02) saturate(0.85)", display: "block" }}
                />
                {/* Scan overlay effect */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 50%, rgba(0,0,0,0.04) 100%)",
                    mixBlendMode: "overlay",
                  }}
                />
              </>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <FileText className="h-10 w-10 opacity-30" />
                <span className="text-sm">{pages[currentPage]?.file.name}</span>
              </div>
            )}

            {/* Zoom hint */}
            <div className="absolute bottom-2 right-2 rounded-full bg-black/50 p-1">
              <ZoomIn className="h-3.5 w-3.5 text-white/70" />
            </div>
          </div>
        </div>

        {/* Thumbnails strip */}
        {pages.length > 1 && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 justify-center">
            {pages.map((p, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className="flex-shrink-0 rounded overflow-hidden"
                style={{
                  width: 48, height: 64,
                  border: i === currentPage ? "2px solid #a78bfa" : "2px solid transparent",
                  opacity: i === currentPage ? 1 : 0.6,
                }}
              >
                {p.url
                  ? <img src={p.url} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-white/10 flex items-center justify-center"><FileText className="h-4 w-4 text-white/50" /></div>
                }
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <Button
        className="w-full gradient-primary text-primary-foreground"
        onClick={submitScan}
        disabled={saving}
      >
        <UploadCloud className="h-4 w-4 mr-2" />
        {saving ? "Lecture OCR en cours…" : `Valider et importer (${pages.length} page${pages.length > 1 ? "s" : ""})`}
      </Button>
    </div>
  );

  // ── STEP: result ──────────────────────────────────────────────────────────
  const renderResult = () => (
    <div className="space-y-4">
      {/* Success banner */}
      <div className={`rounded-xl border p-4 space-y-3 ${(ocrData?.ocrConfidence ?? 0) >= 0.6 ? "border-success/30 bg-success/5" : "border-warning/30 bg-warning/5"}`}>
        <div className="flex items-center gap-2 flex-wrap">
          {(ocrData?.ocrConfidence ?? 0) >= 0.6
            ? <CheckCircle2 className="h-4 w-4 text-success" />
            : <AlertTriangle className="h-4 w-4 text-warning" />}
          <span className="text-sm font-semibold">
            {ocrData?.transaction ? "Opération créée et classée" : "Document enregistré"}
          </span>
          <Badge variant="secondary" className="text-[10px]">
            Confiance OCR {Math.round((ocrData?.ocrConfidence ?? 0) * 100)}%
          </Badge>
          {ocrData?.documentType && (
            <Badge variant="outline" className="text-[10px] capitalize">{ocrData.documentType}</Badge>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          {ocrData?.extractedMerchant && (
            <div className="rounded-lg bg-background border p-2">
              <p className="text-muted-foreground mb-0.5">Fournisseur</p>
              <p className="font-semibold truncate">{ocrData.extractedMerchant}</p>
            </div>
          )}
          {ocrData?.extractedDate && (
            <div className="rounded-lg bg-background border p-2">
              <p className="text-muted-foreground mb-0.5">Date</p>
              <p className="font-semibold">{new Date(ocrData.extractedDate).toLocaleDateString("fr-FR")}</p>
            </div>
          )}
          {ocrData?.extractedTTC !== undefined && ocrData.extractedTTC !== null && (
            <div className="rounded-lg bg-background border p-2">
              <p className="text-muted-foreground mb-0.5">Montant TTC</p>
              <p className={`font-semibold ${opType === "EXPENSE" ? "text-destructive" : "text-success"}`}>
                {opType === "EXPENSE" ? "−" : "+"}{fmt(Math.abs(ocrData.extractedTTC))}
              </p>
            </div>
          )}
          {ocrData?.transaction && (
            <div className="rounded-lg bg-background border p-2 col-span-2">
              <p className="text-muted-foreground mb-0.5">Opération dans la liste</p>
              <p className="font-semibold text-[11px] truncate">{ocrData.transaction.labelRaw}</p>
            </div>
          )}
        </div>

        {(ocrData?.ocrConfidence ?? 0) < 0.5 && (
          <p className="text-[11px] text-warning">
            Confiance faible — l'opération est marquée "À valider". Corrigez le montant et la TVA dans la liste des opérations.
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={() => { resetAll(); }}>
          Scanner un autre document
        </Button>
        <Button className="flex-1 gradient-primary text-primary-foreground" onClick={() => handleClose(false)}>
          Fermer
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Fullscreen zoom */}
      {fullscreenUrl && (
        <div
          className="fixed inset-0 z-[200] bg-black/92 flex items-center justify-center"
          onClick={() => setFullscreenUrl(null)}
        >
          <img src={fullscreenUrl} alt="Aperçu" className="max-h-[92vh] max-w-[92vw] object-contain rounded shadow-2xl" />
          <button className="absolute top-4 right-4 text-white/80 hover:text-white" onClick={() => setFullscreenUrl(null)}>
            <X className="h-7 w-7" />
          </button>
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
              {step === "preview" && "Aperçu du document scanné"}
              {step === "result" && "Document importé"}
            </DialogTitle>
            <DialogDescription>
              {step === "capture" && "Ticket de caisse, facture, parking… — cadrez dans le rectangle violet, l'OCR lit tous types de papiers"}
              {step === "preview" && "Vérifiez la lisibilité avant de lancer la lecture OCR"}
              {step === "result" && "L'opération a été créée et classée dans vos transactions par date"}
            </DialogDescription>
          </DialogHeader>

          {step === "capture" && renderCapture()}
          {step === "preview" && renderPreview()}
          {step === "result"  && renderResult()}
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes scanLine {
          0%   { top: 0%;   opacity: 0; }
          5%   { opacity: 1; }
          95%  { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </>
  );
}
