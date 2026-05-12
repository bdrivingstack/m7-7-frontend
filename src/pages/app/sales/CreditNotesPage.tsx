import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FileText, Download, Eye, Plus, Search, RefreshCw, Loader2, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { useDemo } from "@/contexts/DemoContext";
import { useApi } from "@/hooks/useApi";
import { creditNotes as mockCreditNotes, fmtEUR } from "@/lib/sales-data";
import { toast } from "@/hooks/use-toast";

const statusColors: Record<string, string> = {
  draft:     "bg-muted text-muted-foreground",
  validated: "bg-info/10 text-info",
  sent:      "bg-success/10 text-success",
  DRAFT:     "bg-muted text-muted-foreground",
  SENT:      "bg-success/10 text-success",
  PAID:      "bg-success/10 text-success",
  CANCELLED: "bg-destructive/10 text-destructive",
};

const statusLabel = (s: string) =>
  ({ draft:"Brouillon", validated:"Validé", sent:"Envoyé", DRAFT:"Brouillon", SENT:"Envoyé", PAID:"Payé", CANCELLED:"Annulé" })[s] ?? s;

export default function CreditNotesPage() {
  const demo    = useDemo();
  const isDemo  = !!demo?.isDemo;
  const [search, setSearch] = useState("");

  const { data: apiData, loading, refetch } = useApi<any>("/api/credit-notes?limit=50", { skip: isDemo });

  const apiItems: any[] = apiData?.data ?? [];

  // Normalise les données API pour correspondre au format d'affichage
  const apiRows = apiItems.map((cn: any) => ({
    id:             cn.id,
    number:         cn.number,
    client:         cn.customer?.name ?? "—",
    relatedInvoice: cn.invoice?.number ?? "—",
    reason:         cn.reason ?? "—",
    date:           cn.issueDate ?? cn.createdAt,
    total:          Number(cn.totalTTC ?? 0),
    status:         cn.status,
  }));

  const demoRows = (mockCreditNotes as any[]).map((cn: any) => ({
    id:             cn.id,
    number:         cn.number,
    client:         cn.client,
    relatedInvoice: cn.relatedInvoice,
    reason:         cn.reason,
    date:           cn.date,
    total:          cn.total,
    status:         cn.status,
  }));

  const rows = isDemo ? demoRows : apiRows;

  const filtered = rows.filter(cn =>
    !search ||
    cn.number?.toLowerCase().includes(search.toLowerCase()) ||
    cn.client?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDownload = (cn: any) => {
    if (isDemo) {
      toast({ title: "Mode démo", description: "Le téléchargement PDF n'est pas disponible en mode démo." });
      return;
    }
    window.open(`/api/credit-notes/${cn.id}/pdf`, "_blank");
  };

  return (
    <motion.div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-full overflow-x-hidden" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-fluid-2xl font-display font-bold">Avoirs</h1>
          <p className="text-sm text-muted-foreground">Corrections et annulations de factures</p>
        </div>
        <div className="flex gap-2">
          {!isDemo && (
            <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
              {loading ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5 mr-1.5" />}
              Actualiser
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => toast({ title: "Bientôt disponible", description: "L'import d'avoirs par CSV sera disponible prochainement." })}>
            <Upload className="h-3.5 w-3.5 mr-1.5" />Importer
          </Button>
          <Button size="sm" className="gradient-primary text-primary-foreground"
            onClick={() => {
              if (!isDemo) toast({ title: "Bientôt disponible", description: "La création d'avoir s'effectue depuis le détail d'une facture." });
            }}>
            <Plus className="h-3.5 w-3.5 mr-1.5" />Nouvel avoir
          </Button>
        </div>
      </div>

      <Card className="bg-muted/20">
        <CardContent className="p-4 flex items-start gap-3">
          <FileText className="h-5 w-5 text-info flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">Règle métier</p>
            <p className="text-xs text-muted-foreground">
              Une facture validée ne peut pas être modifiée destructivement. Toute correction après validation
              doit passer par un avoir ou une note corrective, conformément aux règles de facturation.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="relative max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Rechercher par n° ou client..." className="pl-9 h-8 text-sm"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left p-3 font-medium text-muted-foreground">N°</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Client</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Facture liée</th>
                <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Motif</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Montant</th>
                <th className="text-center p-3 font-medium text-muted-foreground">Statut</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(cn => (
                <tr key={cn.id} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="p-3 font-mono font-medium">{cn.number}</td>
                  <td className="p-3 font-medium">{cn.client}</td>
                  <td className="p-3">
                    <Badge variant="secondary" className="text-[10px]">{cn.relatedInvoice}</Badge>
                  </td>
                  <td className="p-3 text-muted-foreground max-w-[200px] truncate hidden md:table-cell">{cn.reason}</td>
                  <td className="p-3 text-muted-foreground">{new Date(cn.date).toLocaleDateString("fr-FR")}</td>
                  <td className="p-3 text-right font-semibold text-destructive">{fmtEUR(cn.total)}</td>
                  <td className="p-3 text-center">
                    <Badge variant="secondary" className={`text-[10px] ${statusColors[cn.status] ?? ""}`}>
                      {statusLabel(cn.status)}
                    </Badge>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDownload(cn)}>
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && (
            <div className="py-12 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />Chargement…
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <div className="py-12 text-center text-muted-foreground text-sm">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
              {isDemo ? "Aucun avoir trouvé" : "Aucun avoir pour le moment — créez-en depuis le détail d'une facture"}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
