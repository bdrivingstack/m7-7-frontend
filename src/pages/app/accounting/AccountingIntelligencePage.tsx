import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Upload, Brain, CheckCircle2, AlertTriangle, FileSpreadsheet,
  Download, Sparkles, Eye, FileText, X, Info, Camera,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApi, apiFetch, API_BASE } from "@/hooks/useApi";
import { toast } from "sonner";
import { ReceiptScannerDialog } from "@/components/accounting/ReceiptScannerDialog";

const vatLabels: Record<string, string> = {
  DEDUCTIBLE: "TVA déductible",
  NON_DEDUCTIBLE: "TVA non déductible",
  COLLECTED: "TVA collectée",
  REVERSE_CHARGE: "Autoliquidation",
  EXEMPT: "Hors TVA / exonéré",
  MIXED: "TVA mixte",
  UNKNOWN: "À qualifier",
};

const FORMAT_ACCEPT = ".csv,.xls,.xlsx,.ofx,.qbo,.qif,.xml,.mt940,.sta,.cfonb,.txt,.pdf";

const FORMAT_LABELS: Record<string, string> = {
  "BANK_CSV": "CSV",
  "BANK_XLSX": "Excel",
  "BANK_OFX": "OFX/QBO",
  "BANK_QIF": "QIF",
  "BANK_CAMT053": "CAMT.053",
  "BANK_CAMT054": "CAMT.054",
  "BANK_MT940": "MT940",
  "BANK_CFONB120": "CFONB120",
};

type BankTransaction = {
  id: string;
  bookingDate: string;
  labelRaw: string;
  merchantName?: string | null;
  amountTTC: string | number;
  amountHT?: string | number | null;
  vatAmount?: string | number | null;
  vatType: string;
  vatSource?: string | null;
  vatConfidence: string | number;
  vatNeedsReview: boolean;
  accountingAccount?: string | null;
  documentId?: string | null;
  matchedInvoiceId?: string | null;
  metadata?: { vatReason?: string; receipt?: { status?: string } | null; importFormat?: string };
};

type ActivityProfile = {
  id: string;
  activityLabel: string;
  nafCode?: string | null;
  status: string;
};

type PreviewRow = {
  date: string | null;
  label: string | null;
  amount: number | null;
  raw: Record<string, string>;
};

type PreviewResult = {
  detectedFormat: string;
  source: string;
  totalRows: number;
  headers: string[];
  preview: PreviewRow[];
};

const euro = (v: string | number | null | undefined) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(Number(v ?? 0));

export default function AccountingIntelligencePage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const { data: transactionsResult, refetch } = useApi<{ data: BankTransaction[] }>("/api/accounting-intelligence/transactions?limit=100");
  const [selectedVat, setSelectedVat] = useState<Record<string, string>>({});

  const transactions = transactionsResult?.data ?? [];
  const needsReview = useMemo(() => transactions.filter((tx) => tx.vatNeedsReview).length, [transactions]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const f = event.target.files?.[0] ?? null;
    setFile(f);
    setPreview(null);
  };

  const previewFile = async () => {
    if (!file) return toast.error("Sélectionne un fichier.");
    const formData = new FormData();
    formData.append("file", file);
    setPreviewing(true);
    try {
      const result = await fetch(`${API_BASE}/api/accounting-intelligence/imports/preview`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const json = await result.json();
      if (!result.ok) throw new Error(json.message ?? "Aperçu impossible");
      setPreview(json.data);
      toast.success(`Format détecté : ${json.data.detectedFormat} — ${json.data.totalRows} ligne(s)`);
    } catch (error: any) {
      toast.error(error.message ?? "Erreur de prévisualisation");
    } finally {
      setPreviewing(false);
    }
  };

  const uploadFile = async () => {
    if (!file) return toast.error("Sélectionne un fichier.");
    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);
    try {
      const result = await fetch(`${API_BASE}/api/accounting-intelligence/imports/bank-multi`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const json = await result.json();
      if (!result.ok) throw new Error(json.message ?? "Import impossible");
      toast.success(`${json.data.rowsImported} opération(s) importée(s) — format ${json.data.format}`);
      if (json.data.rowsFailed > 0) toast.warning(`${json.data.rowsFailed} ligne(s) ignorée(s) (données manquantes).`);
      setFile(null);
      setPreview(null);
      refetch();
    } catch (error: any) {
      toast.error(error.message ?? "Erreur d'import");
    } finally {
      setUploading(false);
    }
  };

  const suggestActivity = async () => {
    try {
      const result = await apiFetch<{ data: ActivityProfile; message: string }>("/api/accounting-intelligence/activity/suggest", { method: "POST", body: JSON.stringify({}) });
      toast.success(`Activité suggérée : ${result.data.activityLabel}`);
    } catch (error: any) {
      toast.error(error.message ?? "Impossible de suggérer l'activité");
    }
  };

  const validateVat = async (tx: BankTransaction) => {
    const vatType = selectedVat[tx.id] ?? tx.vatType;
    try {
      await apiFetch(`/api/accounting-intelligence/transactions/${tx.id}/vat`, {
        method: "PATCH",
        body: JSON.stringify({ vatType, applyLearning: true }),
      });
      toast.success("Qualification TVA validée et mémorisée.");
      refetch();
    } catch (error: any) {
      toast.error(error.message ?? "Validation impossible");
    }
  };

  return (
    <motion.div
      className="p-3 sm:p-6 space-y-5 max-w-full overflow-x-hidden"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary mb-2">
            <Sparkles className="h-3.5 w-3.5" /> Import multi-format + mémoire TVA
          </div>
          <h1 className="text-fluid-2xl font-display font-bold">Extraction & qualification comptable</h1>
          <p className="text-sm text-muted-foreground max-w-3xl">
            CSV · Excel · OFX · QIF · CAMT.053/054 · MT940 · CFONB120 · PDF — TVA auto-qualifiée par IA
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={suggestActivity}>
            <Brain className="h-4 w-4 mr-2" />Qualifier l'activité
          </Button>
          <Button variant="outline" asChild>
            <a href={`${API_BASE}/api/accounting-intelligence/exports/transactions.csv`} target="_blank" rel="noreferrer">
              <Download className="h-4 w-4 mr-2" />Export CSV
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href={`${API_BASE}/api/accounting-intelligence/exports/transactions.fec`} target="_blank" rel="noreferrer">
              <FileText className="h-4 w-4 mr-2" />Export FEC
            </a>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Opérations importées</p>
            <p className="text-2xl font-display font-bold">{transactions.length}</p>
          </CardContent>
        </Card>
        <Card className={needsReview ? "border-warning/40" : "border-success/30"}>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">TVA à valider</p>
            <p className="text-2xl font-display font-bold">{needsReview}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Formats supportés</p>
            <p className="text-sm font-medium">CSV · XLS/X · OFX · QIF · CAMT · MT940 · CFONB · PDF</p>
          </CardContent>
        </Card>
      </div>

      {/* Import Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileSpreadsheet className="h-4 w-4" />Import relevé bancaire
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Input caméra mobile caché — capture directe arrière */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*,.pdf"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="space-y-1.5 flex-1">
              <Label>Fichier relevé bancaire</Label>
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept={FORMAT_ACCEPT}
                  onChange={handleFileChange}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="flex-shrink-0 lg:hidden"
                  title="Prendre en photo"
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              {file && (
                <p className="text-[11px] text-primary font-medium truncate">
                  Fichier sélectionné : {file.name}
                </p>
              )}
              <p className="text-[11px] text-muted-foreground">
                Formats acceptés : CSV · XLS/XLSX · OFX/QBO · QIF · CAMT.053/054 (XML) · MT940 · CFONB120 · PDF
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={previewFile} disabled={previewing}>
                <Eye className="h-4 w-4 mr-2" />{previewing ? "Analyse…" : "Aperçu"}
              </Button>
              <Button onClick={uploadFile} disabled={uploading} className="gradient-primary text-primary-foreground">
                <Upload className="h-4 w-4 mr-2" />{uploading ? "Import…" : "Importer"}
              </Button>
            </div>
          </div>

          {/* Preview */}
          {preview && (
            <div className="border border-border/60 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b">
                <div className="flex items-center gap-2">
                  <Info className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-medium">
                    Format détecté : <Badge variant="secondary" className="ml-1 text-[10px]">{preview.detectedFormat}</Badge>
                  </span>
                  <span className="text-xs text-muted-foreground">{preview.totalRows} ligne(s) à importer</span>
                </div>
                <Button variant="ghost" size="sm" className="h-6 px-1" onClick={() => setPreview(null)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-muted/20">
                      <th className="text-left p-2 font-medium">Date</th>
                      <th className="text-left p-2 font-medium">Libellé</th>
                      <th className="text-right p-2 font-medium">Montant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.preview.map((row, i) => (
                      <tr key={i} className="border-b border-border/40 hover:bg-muted/10">
                        <td className="p-2 text-muted-foreground">{row.date ?? "—"}</td>
                        <td className="p-2 max-w-[300px] truncate">{row.label ?? "—"}</td>
                        <td className={`p-2 text-right font-medium ${(row.amount ?? 0) > 0 ? "text-success" : "text-foreground"}`}>
                          {row.amount !== null ? euro(row.amount) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {preview.totalRows > 10 && (
                  <p className="text-[11px] text-muted-foreground p-2 text-center">
                    … et {preview.totalRows - 10} ligne(s) supplémentaire(s)
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transactions list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Opérations à contrôler</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/60">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="p-4 grid lg:grid-cols-[1fr_220px_180px_180px_120px] gap-3 items-center hover:bg-muted/20 transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm truncate">{tx.labelRaw}</p>
                    {tx.vatNeedsReview ? (
                      <Badge variant="outline" className="border-warning/40 text-warning">
                        <AlertTriangle className="h-3 w-3 mr-1" />À valider
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <CheckCircle2 className="h-3 w-3 mr-1" />Validée
                      </Badge>
                    )}
                    {tx.metadata?.importFormat && (
                      <Badge variant="secondary" className="text-[9px] opacity-60">
                        {FORMAT_LABELS[tx.metadata.importFormat as string] ?? tx.metadata.importFormat}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(tx.bookingDate).toLocaleDateString("fr-FR")} · {tx.merchantName ?? "Marchand inconnu"} · confiance TVA {Math.round(Number(tx.vatConfidence) * 100)}%
                  </p>
                  {tx.metadata?.vatReason && (
                    <p className="text-xs text-muted-foreground mt-1">{tx.metadata.vatReason}</p>
                  )}
                </div>

                <Select
                  value={selectedVat[tx.id] ?? tx.vatType}
                  onValueChange={(value) => setSelectedVat((prev) => ({ ...prev, [tx.id]: value }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(vatLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="text-sm lg:text-right">
                  <p className="font-semibold">{euro(tx.amountTTC)}</p>
                  <p className="text-xs text-muted-foreground">TVA {euro(tx.vatAmount)}</p>
                </div>

                <ReceiptScannerDialog
                  transactionId={tx.id}
                  hasReceipt={Boolean(tx.documentId || tx.matchedInvoiceId)}
                  onUploaded={refetch}
                />

                <Button
                  size="sm"
                  variant={tx.vatNeedsReview ? "default" : "outline"}
                  onClick={() => validateVat(tx)}
                >
                  Valider
                </Button>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="p-8 text-sm text-muted-foreground text-center">
                <Upload className="h-8 w-8 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Aucune opération importée</p>
                <p className="text-xs mt-1">Importez un relevé bancaire ci-dessus pour commencer.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
