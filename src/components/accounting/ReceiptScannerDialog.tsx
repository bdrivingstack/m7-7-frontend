import { useEffect, useRef, useState } from "react";
import { Camera, FileUp, RotateCcw, Trash2, UploadCloud, X, CheckCircle2, AlertTriangle, FileText, ZoomIn } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type OcrExtracted = {
  supplierName?: string;
  invoiceDate?: string;
  totalTTC?: number;
  totalHT?: number;
  totalVat?: number;
  confidence?: number;
  documentType?: string;
};

type PagePreview = { file: File; url: string };

type ReceiptScannerDialogProps = {
  transactionId: string;
  hasReceipt?: boolean;
  onUploaded: () => void;
};

const apiBase = import.meta.env.VITE_API_BASE_URL ?? "";
const fmt = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

export function ReceiptScannerDialog({ transactionId, hasReceipt, onUploaded }: ReceiptScannerDialogProps) {
  const videoRef    = useRef<HTMLVideoElement | null>(null);
  const streamRef   = useRef<MediaStream | null>(null);
  const flashRef    = useRef<HTMLDivElement | null>(null);
  const [open, setOpen]               = useState(false);
  const [pages, setPages]             = useState<PagePreview[]>([]);
  const [saving, setSaving]           = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [ocrResult, setOcrResult]     = useState<OcrExtracted | null>(null);
  const [previewPage, setPreviewPage] = useState<string | null>(null);

  // Start / stop camera stream
  useEffect(() => {
    if (!open) {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setCameraReady(false);
      setOcrResult(null);
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) return;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) { videoRef.current.srcObject = stream; }
        setCameraReady(true);
      })
      .catch(() => setCameraReady(false));
  }, [open]);

  // Revoke object URLs on close
  useEffect(() => {
    if (!open) {
      pages.forEach((p) => URL.revokeObjectURL(p.url));
      setPages([]);
      setPreviewPage(null);
    }
  }, [open]); // eslint-disable-line

  const triggerFlash = () => {
    const el = flashRef.current;
    if (!el) return;
    el.style.opacity = "1";
    setTimeout(() => { el.style.opacity = "0"; }, 180);
  };

  const capturePage = () => {
    const video = videoRef.current;
    if (!video || !cameraReady) return toast.error("Caméra non disponible.");
    const canvas = document.createElement("canvas");
    canvas.width  = video.videoWidth  || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return toast.error("Capture impossible.");

    // Draw with slight contrast/brightness boost for scan effect
    ctx.filter = "contrast(1.1) brightness(1.05)";
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    triggerFlash();

    canvas.toBlob((blob) => {
      if (!blob) return toast.error("Image vide.");
      const file = new File([blob], `scan-page-${pages.length + 1}.jpg`, { type: "image/jpeg" });
      const url  = URL.createObjectURL(blob);
      setPages((prev) => [...prev, { file, url }]);
      toast.success(`Page ${pages.length + 1} capturée.`);
    }, "image/jpeg", 0.93);
  };

  const addFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const newPages: PagePreview[] = Array.from(fileList).map((file) => ({
      file,
      url: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
    }));
    setPages((prev) => [...prev, ...newPages]);
  };

  const removePage = (index: number) => {
    setPages((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const upload = async (replace = false) => {
    if (!pages.length) return toast.error("Ajoute au moins une page ou un fichier.");
    const formData = new FormData();
    pages.forEach((p) => formData.append("files", p.file));
    setSaving(true);
    try {
      const response = await fetch(
        `${apiBase}/api/accounting-intelligence/transactions/${transactionId}/receipt`,
        { method: replace ? "PUT" : "POST", credentials: "include", body: formData }
      );
      const json = await response.json();
      if (!response.ok) throw new Error(json.message ?? "Upload impossible");

      const inv = json.data?.invoice;
      if (inv) {
        setOcrResult({
          supplierName: inv.supplierName,
          invoiceDate: inv.invoiceDate,
          totalTTC:  inv.totalTTC  != null ? Number(inv.totalTTC)  : undefined,
          totalHT:   inv.totalHT   != null ? Number(inv.totalHT)   : undefined,
          totalVat:  inv.totalVat  != null ? Number(inv.totalVat)  : undefined,
          confidence:  Number(inv.extractionConfidence ?? 0),
          documentType: json.data?.transaction?.metadata?.receipt?.documentType,
        });
        toast.success("Document lu — vérifiez les données extraites ci-dessous.");
      } else {
        toast.success(replace ? "Justificatif remplacé." : "Justificatif attaché.");
        setOpen(false);
        onUploaded();
      }
    } catch (err: any) {
      toast.error(err.message ?? "Erreur justificatif");
    } finally {
      setSaving(false);
    }
  };

  const deleteReceipt = async () => {
    setSaving(true);
    try {
      const response = await fetch(
        `${apiBase}/api/accounting-intelligence/transactions/${transactionId}/receipt`,
        { method: "DELETE", credentials: "include" }
      );
      const json = await response.json();
      if (!response.ok) throw new Error(json.message ?? "Suppression impossible");
      toast.success("Justificatif et données OCR supprimés.");
      setOpen(false);
      onUploaded();
    } catch (err: any) {
      toast.error(err.message ?? "Suppression impossible");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Fullscreen page preview */}
      {previewPage && (
        <div
          className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center"
          onClick={() => setPreviewPage(null)}
        >
          <img src={previewPage} alt="Aperçu" className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl" />
          <button className="absolute top-4 right-4 text-white/80 hover:text-white" onClick={() => setPreviewPage(null)}>
            <X className="h-7 w-7" />
          </button>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant={hasReceipt ? "outline" : "secondary"}>
            {hasReceipt ? "Gérer justificatif" : "Scanner / joindre"}
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Scanner ou joindre un justificatif</DialogTitle>
            <DialogDescription>
              Cadrez le document dans le cadre violet · Plusieurs pages possibles · L'OCR lit tous types de papiers
            </DialogDescription>
          </DialogHeader>

          {/* ── OCR results ── */}
          {ocrResult && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {(ocrResult.confidence ?? 0) >= 0.6
                    ? <CheckCircle2 className="h-4 w-4 text-success" />
                    : <AlertTriangle className="h-4 w-4 text-warning" />}
                  <span className="text-sm font-semibold">Données extraites par OCR</span>
                  <Badge variant="secondary" className="text-[10px]">
                    Confiance {Math.round((ocrResult.confidence ?? 0) * 100)}%
                  </Badge>
                  {ocrResult.documentType && (
                    <Badge variant="outline" className="text-[10px] capitalize">{ocrResult.documentType}</Badge>
                  )}
                </div>
                <Button
                  variant="ghost" size="sm" className="h-7 px-2 text-xs"
                  onClick={() => { setOcrResult(null); setOpen(false); onUploaded(); }}
                >
                  <X className="h-3 w-3 mr-1" />Fermer
                </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {ocrResult.supplierName && (
                  <div className="rounded-lg bg-background border p-2">
                    <p className="text-muted-foreground mb-0.5">Fournisseur</p>
                    <p className="font-semibold truncate">{ocrResult.supplierName}</p>
                  </div>
                )}
                {ocrResult.invoiceDate && (
                  <div className="rounded-lg bg-background border p-2">
                    <p className="text-muted-foreground mb-0.5">Date</p>
                    <p className="font-semibold">{new Date(ocrResult.invoiceDate).toLocaleDateString("fr-FR")}</p>
                  </div>
                )}
                {ocrResult.totalTTC !== undefined && (
                  <div className="rounded-lg bg-background border p-2">
                    <p className="text-muted-foreground mb-0.5">Total TTC</p>
                    <p className="font-semibold text-primary">{fmt(ocrResult.totalTTC)}</p>
                  </div>
                )}
                {ocrResult.totalHT !== undefined && (
                  <div className="rounded-lg bg-background border p-2">
                    <p className="text-muted-foreground mb-0.5">Total HT</p>
                    <p className="font-semibold">{fmt(ocrResult.totalHT)}</p>
                  </div>
                )}
                {ocrResult.totalVat !== undefined && (
                  <div className="rounded-lg bg-background border p-2">
                    <p className="text-muted-foreground mb-0.5">TVA</p>
                    <p className="font-semibold">{fmt(ocrResult.totalVat)}</p>
                  </div>
                )}
              </div>
              {(ocrResult.confidence ?? 0) < 0.5 && (
                <p className="text-[11px] text-warning">Confiance faible — vérifiez et corrigez les montants dans la section TVA.</p>
              )}
            </div>
          )}

          <div className="grid lg:grid-cols-[1.3fr_.7fr] gap-4">
            {/* ── Camera zone ── */}
            <div className="space-y-3">
              <div
                className="relative overflow-hidden rounded-2xl bg-black aspect-[3/4] sm:aspect-video"
                style={{ border: "1px solid rgba(124,58,237,0.3)" }}
              >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full object-cover"
                />

                {/* Dark vignette overlay */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)",
                  }}
                />

                {/* Violet scanner frame */}
                <div
                  className="absolute pointer-events-none"
                  style={{
                    inset: "10%",
                    border: "2.5px solid #7c3aed",
                    borderRadius: "12px",
                    boxShadow: "0 0 0 1px rgba(124,58,237,0.15), 0 0 28px rgba(124,58,237,0.5)",
                  }}
                >
                  {/* Corner accents */}
                  {[
                    { top: -2, left: -2, borderTop: "4px solid #a78bfa", borderLeft: "4px solid #a78bfa", borderRadius: "8px 0 0 0" },
                    { top: -2, right: -2, borderTop: "4px solid #a78bfa", borderRight: "4px solid #a78bfa", borderRadius: "0 8px 0 0" },
                    { bottom: -2, left: -2, borderBottom: "4px solid #a78bfa", borderLeft: "4px solid #a78bfa", borderRadius: "0 0 0 8px" },
                    { bottom: -2, right: -2, borderBottom: "4px solid #a78bfa", borderRight: "4px solid #a78bfa", borderRadius: "0 0 8px 0" },
                  ].map((style, i) => (
                    <div key={i} className="absolute w-7 h-7" style={style} />
                  ))}

                  {/* Scan line animation */}
                  {cameraReady && (
                    <div
                      className="absolute left-0 right-0 h-[2px] pointer-events-none"
                      style={{
                        background: "linear-gradient(90deg, transparent, rgba(167,139,250,0.8), transparent)",
                        animation: "scanLine 2s linear infinite",
                        top: 0,
                      }}
                    />
                  )}
                </div>

                {/* Flash effect on capture */}
                <div
                  ref={flashRef}
                  className="absolute inset-0 bg-white pointer-events-none transition-opacity duration-[180ms]"
                  style={{ opacity: 0 }}
                />

                {/* Status bar */}
                <div className="absolute bottom-3 left-3 right-3 rounded-full bg-black/70 backdrop-blur-sm px-3 py-1.5 text-xs text-white text-center z-10">
                  {cameraReady
                    ? pages.length > 0 ? `✓ ${pages.length} page(s) — Prenez la suite ou terminez` : "Cadrez le document dans le rectangle violet"
                    : "Caméra indisponible — importez un fichier"}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={capturePage}
                  disabled={!cameraReady || saving}
                  className="gradient-primary text-primary-foreground"
                >
                  <Camera className="h-4 w-4 mr-2" />Prendre la photo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => removePage(pages.length - 1)}
                  disabled={!pages.length || saving}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />Annuler dernière
                </Button>
              </div>
            </div>

            {/* ── Right panel: pages + actions ── */}
            <div className="space-y-3">
              {/* Page thumbnails */}
              <div className="rounded-2xl border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Pages ({pages.length})</p>
                  <label className="cursor-pointer">
                    <span className="text-xs text-primary underline-offset-2 hover:underline">+ Fichier</span>
                    <Input
                      type="file"
                      accept="image/*,.pdf,application/pdf"
                      multiple
                      className="hidden"
                      onChange={(e) => addFiles(e.target.files)}
                    />
                  </label>
                </div>

                {pages.length === 0 ? (
                  <div className="h-24 flex items-center justify-center border-2 border-dashed rounded-xl text-xs text-muted-foreground">
                    Aucune page — prenez une photo ou importez un fichier
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto">
                    {pages.map((page, i) => (
                      <div key={`${page.file.name}-${i}`} className="relative group rounded-lg overflow-hidden border bg-muted aspect-[3/4]">
                        {page.url ? (
                          <img
                            src={page.url}
                            alt={`Page ${i + 1}`}
                            className="h-full w-full object-cover"
                            style={{ filter: "contrast(1.08) brightness(1.03)" }}
                          />
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center gap-1 text-muted-foreground">
                            <FileText className="h-6 w-6" />
                            <span className="text-[10px] text-center px-1 truncate w-full">{page.file.name}</span>
                          </div>
                        )}

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                          {page.url && (
                            <button
                              className="rounded-full bg-white/90 p-1"
                              onClick={() => setPreviewPage(page.url)}
                            >
                              <ZoomIn className="h-3.5 w-3.5 text-foreground" />
                            </button>
                          )}
                          <button
                            className="rounded-full bg-white/90 p-1"
                            onClick={() => removePage(i)}
                          >
                            <X className="h-3.5 w-3.5 text-destructive" />
                          </button>
                        </div>

                        {/* Page number badge */}
                        <div className="absolute top-1 left-1 rounded bg-black/60 px-1 text-[9px] text-white">{i + 1}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="grid gap-2">
                <Button
                  onClick={() => upload(false)}
                  disabled={saving || !pages.length || hasReceipt}
                  className="gradient-primary text-primary-foreground"
                >
                  <UploadCloud className="h-4 w-4 mr-2" />
                  {saving ? "Lecture en cours…" : "Terminer et lire le document"}
                </Button>
                <Button
                  onClick={() => upload(true)}
                  disabled={saving || !pages.length}
                  variant="outline"
                >
                  <FileUp className="h-4 w-4 mr-2" />Remplacer le justificatif
                </Button>
                <Button
                  onClick={deleteReceipt}
                  disabled={saving || !hasReceipt}
                  variant="destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />Supprimer justificatif + données
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Scan line keyframes */}
      <style>{`
        @keyframes scanLine {
          0%   { top: 0%; opacity: 0; }
          5%   { opacity: 1; }
          95%  { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </>
  );
}
