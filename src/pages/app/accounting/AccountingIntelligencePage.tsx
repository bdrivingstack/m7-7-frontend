import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Upload, Brain, CheckCircle2, AlertTriangle, FileSpreadsheet, Download, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApi, apiFetch } from "@/hooks/useApi";
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
  metadata?: { vatReason?: string; receipt?: { status?: string; pageCount?: number } | null };
};

type ActivityProfile = {
  id: string;
  activityLabel: string;
  nafCode?: string | null;
  naceCode?: string | null;
  status: string;
  confidenceScore: string | number;
};

const euro = (value: string | number | null | undefined) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(Number(value ?? 0));

export default function AccountingIntelligencePage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { data: transactionsResult, refetch } = useApi<{ data: BankTransaction[] }>("/api/accounting-intelligence/transactions?limit=100");
  const [selectedVat, setSelectedVat] = useState<Record<string, string>>({});

  const transactions = transactionsResult?.data ?? [];
  const needsReview = useMemo(() => transactions.filter((tx) => tx.vatNeedsReview).length, [transactions]);

  const uploadCsv = async () => {
    if (!file) return toast.error("Sélectionne un fichier CSV bancaire.");
    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);
    try {
      const result = await fetch(`${import.meta.env.VITE_API_BASE_URL ?? ""}/api/accounting-intelligence/imports/bank-csv`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const json = await result.json();
      if (!result.ok) throw new Error(json.message ?? "Import impossible");
      toast.success(`${json.data.rowsImported} opération(s) importée(s), ${json.data.rowsFailed} ligne(s) à corriger.`);
      setFile(null);
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary mb-2">
            <Sparkles className="h-3.5 w-3.5" /> Import intelligent + mémoire TVA
          </div>
          <h1 className="text-fluid-2xl font-display font-bold">Extraction & qualification comptable</h1>
          <p className="text-sm text-muted-foreground max-w-3xl">
            Importe les relevés, détecte la TVA, propose une qualification selon l'activité et apprend des validations répétées.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={suggestActivity}>
            <Brain className="h-4 w-4 mr-2" />Qualifier l'activité
          </Button>
          <Button variant="outline" asChild>
            <a href="/api/accounting-intelligence/exports/transactions.csv">
              <Download className="h-4 w-4 mr-2" />Exporter CSV
            </a>
          </Button>
        </div>
      </div>

      {/* Statistiques */}
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
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Pipeline</p>
            <p className="text-sm font-medium">CSV → normalisation → TVA → apprentissage → export</p>
          </CardContent>
        </Card>
      </div>

      {/* Import CSV */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileSpreadsheet className="h-4 w-4" />Import relevé bancaire CSV
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="space-y-1.5 flex-1">
            <Label>Fichier CSV bancaire</Label>
            <Input type="file" accept=".csv,text/csv" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
          </div>
          <Button onClick={uploadCsv} disabled={uploading} className="gradient-primary text-primary-foreground">
            <Upload className="h-4 w-4 mr-2" />Importer & analyser
          </Button>
        </CardContent>
      </Card>

      {/* Liste des opérations */}
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
                  <div className="flex items-center gap-2">
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
              <div className="p-6 text-sm text-muted-foreground text-center">
                Aucune opération importée pour le moment.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
