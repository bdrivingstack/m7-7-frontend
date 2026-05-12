import { useState } from "react";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Download, Search, Filter, ArrowUpRight, Calendar, FileText, Loader2, RefreshCw } from "lucide-react";
import { revenueBookEntries } from "@/lib/accounting-data";
import { motion } from "framer-motion";
import { useDemo } from "@/contexts/DemoContext";
import { useApi } from "@/hooks/useApi";
import { toast } from "@/hooks/use-toast";

const fmt = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

export default function RevenueBookPage() {
  const demo   = useDemo();
  const isDemo = !!demo?.isDemo;
  const [search, setSearch] = useState("");

  const { data: apiData, loading, refetch } = useApi<any>("/api/invoices?status=PAID&limit=100", { skip: isDemo });

  const apiInvoices: any[] = apiData?.data ?? [];
  const apiEntries = apiInvoices.map((inv: any) => ({
    id:            inv.id,
    date:          inv.paidAt ?? inv.updatedAt,
    description:   inv.subject ?? inv.number,
    invoiceId:     inv.number,
    category:      "Prestations de services",
    paymentMethod: inv.paymentMethod ?? "Virement",
    net:           Number(inv.totalHT ?? 0),
    vat:           Number(inv.totalVAT ?? 0),
    amount:        Number(inv.totalTTC ?? 0),
  }));

  const rows = isDemo ? revenueBookEntries : apiEntries;

  const filtered = rows.filter(e =>
    !search ||
    e.description?.toLowerCase().includes(search.toLowerCase()) ||
    e.invoiceId?.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = filtered.reduce((s, e) => s + e.amount, 0);
  const totalVAT     = filtered.reduce((s, e) => s + e.vat, 0);
  const totalNet     = filtered.reduce((s, e) => s + e.net, 0);

  const handleExportCSV = () => {
    const rows2 = [
      ["Date", "Description", "N° Facture", "Catégorie", "Mode", "HT", "TVA", "TTC"],
      ...filtered.map(e => [
        new Date(e.date).toLocaleDateString("fr-FR"),
        e.description, e.invoiceId, e.category, e.paymentMethod,
        e.net, e.vat, e.amount,
      ]),
    ];
    const csv  = rows2.map(r => r.map(String).join(";")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const a    = document.createElement("a");
    a.href     = URL.createObjectURL(blob);
    a.download = `livre_recettes_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(a.href);
    toast({ title: "Export réussi", description: `${filtered.length} entrées exportées.` });
  };

  return (
    <motion.div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-full overflow-x-hidden" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-fluid-2xl font-display font-bold">Livre des recettes</h1>
          <p className="text-sm text-muted-foreground">Registre chronologique de vos encaissements</p>
        </div>
        <div className="flex gap-2">
          {!isDemo && (
            <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
              {loading ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5 mr-1.5" />}
              Actualiser
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleExportCSV}><Download className="h-3.5 w-3.5 mr-1.5" />Exporter CSV</Button>
          <Button variant="outline" size="sm" onClick={() => toast({ title: "PDF", description: "Export PDF disponible prochainement." })}><FileText className="h-3.5 w-3.5 mr-1.5" />Exporter PDF</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3.5 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total TTC</p>
              <InfoTooltip title="Total TTC" description="Somme de toutes les recettes TTC." benefit="Montant brut encaissé incluant la TVA à reverser." />
            </div>
            <p className="text-fluid-xl font-display font-bold">{fmt(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3.5 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">TVA collectée</p>
              <InfoTooltip title="TVA collectée" description="TVA incluse dans vos factures sur la période." formula="Σ (TTC − HT)" benefit="Cette TVA doit être reversée à l'État." />
            </div>
            <p className="text-xl font-display font-bold text-warning">{fmt(totalVAT)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3.5 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Net HT</p>
              <InfoTooltip title="Net HT" description="CA hors taxes — base d'imposition." formula="Total TTC − TVA collectée" benefit="Sert de base au calcul de votre résultat imposable." />
            </div>
            <p className="text-xl font-display font-bold text-primary">{fmt(totalNet)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher..." className="pl-9 h-8 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button variant="outline" size="sm"><Calendar className="h-3.5 w-3.5 mr-1.5" />Période</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Description</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Catégorie</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Mode</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">HT</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">TVA</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">TTC</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin inline mr-2" />Chargement…
                  </td></tr>
                )}
                {!loading && filtered.map(entry => (
                  <tr key={entry.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="p-3 text-muted-foreground">{new Date(entry.date).toLocaleDateString("fr-FR")}</td>
                    <td className="p-3">
                      <div className="font-medium">{entry.description}</div>
                      <div className="text-muted-foreground font-mono text-[10px]">{entry.invoiceId}</div>
                    </td>
                    <td className="p-3"><Badge variant="secondary" className="text-[10px]">{entry.category}</Badge></td>
                    <td className="p-3 text-muted-foreground">{entry.paymentMethod}</td>
                    <td className="p-3 text-right font-medium">{fmt(entry.net)}</td>
                    <td className="p-3 text-right text-muted-foreground">{fmt(entry.vat)}</td>
                    <td className="p-3 text-right font-semibold text-success">{fmt(entry.amount)}</td>
                  </tr>
                ))}
              </tbody>
              {!loading && filtered.length === 0 && (
                <tfoot>
                  <tr><td colSpan={7} className="py-12 text-center text-muted-foreground text-sm">
                    <ArrowUpRight className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    {isDemo ? "Aucune recette trouvée" : "Aucune facture encaissée — les paiements reçus apparaîtront ici"}
                  </td></tr>
                </tfoot>
              )}
              {!loading && filtered.length > 0 && (
                <tfoot>
                  <tr className="bg-muted/30 font-medium">
                    <td colSpan={4} className="p-3">Total</td>
                    <td className="p-3 text-right">{fmt(totalNet)}</td>
                    <td className="p-3 text-right">{fmt(totalVAT)}</td>
                    <td className="p-3 text-right font-bold">{fmt(totalRevenue)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
