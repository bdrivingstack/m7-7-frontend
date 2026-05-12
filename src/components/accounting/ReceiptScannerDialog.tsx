import { useEffect, useRef, useState } from "react";
import { Camera, FileUp, RotateCcw, Trash2, UploadCloud, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type ReceiptScannerDialogProps = {
  transactionId: string;
  hasReceipt?: boolean;
  onUploaded: () => void;
};

const apiBase = import.meta.env.VITE_API_BASE_URL ?? "";

export function ReceiptScannerDialog({ transactionId, hasReceipt, onUploaded }: ReceiptScannerDialogProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [open, setOpen] = useState(false);
  const [pages, setPages] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    if (!open) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setCameraReady(false);
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) return;
    navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCameraReady(true);
      })
      .catch(() => setCameraReady(false));
  }, [open]);

  const capturePage = async () => {
    const video = videoRef.current;
    if (!video) return toast.error("Caméra non disponible.");
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return toast.error("Capture impossible.");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return toast.error("Image vide.");
      const file = new File([blob], `justificatif-page-${pages.length + 1}.jpg`, { type: "image/jpeg" });
      setPages((prev) => [...prev, file]);
      toast.success(`Page ${pages.length + 1} ajoutée.`);
    }, "image/jpeg", 0.92);
  };

  const upload = async (replace = false) => {
    if (!pages.length) return toast.error("Ajoute au moins une page ou un fichier.");
    const formData = new FormData();
    pages.forEach((file) => formData.append("files", file));
    setSaving(true);
    try {
      const response = await fetch(`${apiBase}/api/accounting-intelligence/transactions/${transactionId}/receipt`, {
        method: replace ? "PUT" : "POST",
        credentials: "include",
        body: formData,
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message ?? "Upload impossible");
      toast.success(replace ? "Justificatif remplacé." : "Justificatif attaché à l'opération.");
      setPages([]);
      setOpen(false);
      onUploaded();
    } catch (error: any) {
      toast.error(error.message ?? "Erreur justificatif");
    } finally {
      setSaving(false);
    }
  };

  const deleteReceipt = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${apiBase}/api/accounting-intelligence/transactions/${transactionId}/receipt`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.message ?? "Suppression impossible");
      toast.success("Justificatif et données extraites supprimés.");
      setPages([]);
      setOpen(false);
      onUploaded();
    } catch (error: any) {
      toast.error(error.message ?? "Suppression impossible");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant={hasReceipt ? "outline" : "secondary"}>
          {hasReceipt ? "Gérer justificatif" : "Scanner / joindre"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Scanner ou joindre un justificatif</DialogTitle>
          <DialogDescription>
            Cadre le document dans la zone violette, ajoute les pages suivantes si nécessaire, puis termine pour lancer la lecture.
          </DialogDescription>
        </DialogHeader>

        <div className="grid lg:grid-cols-[1.2fr_.8fr] gap-4">
          <div className="space-y-3">
            {/* Zone caméra avec cadre violet premium */}
            <div className="relative overflow-hidden rounded-2xl border bg-black aspect-[3/4] sm:aspect-video">
              <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />

              {/* Overlay sombre autour du document */}
              <div className="absolute inset-0 bg-black/30 pointer-events-none" />

              {/* Cadre violet premium type scanner bancaire */}
              <div className="absolute inset-6 rounded-2xl border-[3px] border-violet-500 shadow-[0_0_25px_rgba(124,58,237,0.45)] backdrop-blur-[1px] pointer-events-none">
                <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-violet-400 rounded-tl-xl" />
                <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-violet-400 rounded-tr-xl" />
                <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-violet-400 rounded-bl-xl" />
                <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-violet-400 rounded-br-xl" />
              </div>

              <div className="absolute bottom-3 left-3 right-3 rounded-full bg-background/90 px-3 py-2 text-xs text-foreground shadow z-10">
                {cameraReady ? "Place le document à plat, bien éclairé, sans couper les coins." : "Caméra indisponible : utilise l'import de fichier."}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={capturePage} disabled={!cameraReady || saving}>
                <Camera className="h-4 w-4 mr-2" />Prendre la photo
              </Button>
              <Button type="button" variant="outline" onClick={() => setPages((prev) => prev.slice(0, -1))} disabled={!pages.length || saving}>
                <RotateCcw className="h-4 w-4 mr-2" />Retirer dernière page
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border p-3 space-y-2">
              <p className="text-sm font-medium">Pages du justificatif</p>
              <p className="text-xs text-muted-foreground">{pages.length} page(s). Elles seront traitées comme un document unique.</p>
              <Input
                type="file"
                accept="image/*,.pdf,application/pdf"
                multiple
                onChange={(event) => setPages((prev) => [...prev, ...Array.from(event.target.files ?? [])])}
              />
              <div className="max-h-40 overflow-auto space-y-1">
                {pages.map((page, index) => (
                  <div key={`${page.name}-${index}`} className="flex items-center justify-between rounded-lg bg-muted/50 px-2 py-1 text-xs">
                    <span className="truncate">Page {index + 1} · {page.name}</span>
                    <button
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => setPages((prev) => prev.filter((_, i) => i !== index))}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Button
                onClick={() => upload(false)}
                disabled={saving || !pages.length || hasReceipt}
                className="gradient-primary text-primary-foreground"
              >
                <UploadCloud className="h-4 w-4 mr-2" />Terminer et lire le document
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
  );
}
