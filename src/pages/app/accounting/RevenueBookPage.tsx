import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Download, Search, Filter, ArrowUpRight, Calendar, FileText } from "lucide-react";
import { revenueBookEntries } from "@/lib/accounting-data";
import { motion } from "framer-motion";

const fmt = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

const totalRevenue = revenueBookEntries.reduce((s, e) => s + e.amount, 0);
const totalVAT = revenueBookEntries.reduce((s, e) => s + e.vat, 0);
const totalNet = revenueBookEntries.reduce((s, e) => s + e.net, 0);

export default function RevenueBookPage() {
  return (
    <motion.div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-full overflow-x-hidden" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-fluid-2xl font-display font-bold">Livre des recettes</h1>
          <p className="text-sm text-muted-foreground">Registre chronologique de vos encaissements</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="h-3.5 w-3.5 mr-1.5" />Exporter CSV</Button>
          <Button variant="outline" size="sm"><FileText className="h-3.5 w-3.5 mr-1.5" />Exporter PDF</Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3.5 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total TTC</p>
              <InfoTooltip title="Total TTC" description="Somme de toutes les recettes toutes taxes comprises enregistrées dans le livre des recettes sur la période." benefit="Montant brut encaissé ou à encaisser. Inclut la TVA que vous devrez reverser à l'État." />
            </div>
            <p className="text-fluid-xl font-display font-bold">{fmt(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3.5 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">TVA collectée</p>
              <InfoTooltip title="TVA collectée" description="Montant total de TVA inclus dans vos factures de vente sur la période." formula="Σ (Total TTC − Total HT) de toutes les recettes" benefit="Cette TVA doit être reversée à l'État. Elle n'appartient pas à votre trésorerie." />
            </div>
            <p className="text-xl font-display font-bold text-warning">{fmt(totalVAT)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3.5 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Net HT</p>
              <InfoTooltip title="Net HT" description="Chiffre d'affaires hors taxes : vos recettes réelles avant TVA. C'est ce montant qui sert de base à votre imposition." formula="Total TTC − TVA collectée" benefit="Le Net HT est la base de calcul de votre résultat imposable et de vos cotisations sociales." />
            </div>
            <p className="text-xl font-display font-bold text-primary">{fmt(totalNet)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher..." className="pl-9 h-8 text-sm" />
        </div>
        <Button variant="outline" size="sm"><Filter className="h-3.5 w-3.5 mr-1.5" />Filtres</Button>
        <Button variant="outline" size="sm"><Calendar className="h-3.5 w-3.5 mr-1.5" />Période</Button>
      </div>

      {/* Table */}
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
                {revenueBookEntries.map(entry => (
                  <tr key={entry.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="p-3 text-muted-foreground">{new Date(entry.date).toLocaleDateString("fr-FR")}</td>
                    <td className="p-3">
                      <div className="font-medium">{entry.description}</div>
                      <div className="text-muted-foreground font-mono text-[10px]">{entry.invoiceId}</div>
                    </td>
                    <td className="p-3">
                      <Badge variant="secondary" className="text-[10px]">{entry.category}</Badge>
                    </td>
                    <td className="p-3 text-muted-foreground">{entry.paymentMethod}</td>
                    <td className="p-3 text-right font-medium">{fmt(entry.net)}</td>
                    <td className="p-3 text-right text-muted-foreground">{fmt(entry.vat)}</td>
                    <td className="p-3 text-right font-semibold text-success">{fmt(entry.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-muted/30 font-medium">
                  <td colSpan={4} className="p-3">Total</td>
                  <td className="p-3 text-right">{fmt(totalNet)}</td>
                  <td className="p-3 text-right">{fmt(totalVAT)}</td>
                  <td className="p-3 text-right font-bold">{fmt(totalRevenue)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
