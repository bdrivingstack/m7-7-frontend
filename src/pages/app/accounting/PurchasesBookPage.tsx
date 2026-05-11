import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Download, Search, Filter, Calendar, FileText, ArrowDownRight } from "lucide-react";
import { purchaseBookEntries } from "@/lib/accounting-data";
import { motion } from "framer-motion";

const fmt = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

const totalExpenses = purchaseBookEntries.reduce((s, e) => s + e.amount, 0);
const totalVAT = purchaseBookEntries.reduce((s, e) => s + e.vat, 0);
const totalNet = purchaseBookEntries.reduce((s, e) => s + e.net, 0);

export default function PurchasesBookPage() {
  return (
    <motion.div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-full overflow-x-hidden" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-fluid-2xl font-display font-bold">Livre des achats</h1>
          <p className="text-sm text-muted-foreground">Registre de vos dépenses professionnelles</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="h-3.5 w-3.5 mr-1.5" />Exporter CSV</Button>
          <Button variant="outline" size="sm"><FileText className="h-3.5 w-3.5 mr-1.5" />Exporter PDF</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3.5 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total TTC</p>
              <InfoTooltip title="Total achats TTC" description="Montant total de vos achats et dépenses toutes taxes comprises sur la période." benefit="Ce montant inclut la TVA que vous pourrez déduire. Vérifiez que chaque dépense est bien justifiée par une facture." />
            </div>
            <p className="text-fluid-xl font-display font-bold">{fmt(totalExpenses)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3.5 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">TVA déductible</p>
              <InfoTooltip title="TVA déductible" description="TVA payée sur vos achats professionnels, récupérable auprès de l'administration fiscale." formula="Σ TVA de toutes les factures d'achat professionnelles" benefit="Cette TVA vient en déduction de votre TVA collectée, réduisant votre TVA nette à reverser." />
            </div>
            <p className="text-xl font-display font-bold text-success">{fmt(totalVAT)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3.5 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Net HT</p>
              <InfoTooltip title="Charges nettes HT" description="Total de vos dépenses hors taxes. Ce montant est déductible de votre résultat imposable." formula="Total TTC − TVA déductible" benefit="Plus vos charges HT sont élevées, plus votre résultat imposable baisse. Conservez toutes les factures justificatives." />
            </div>
            <p className="text-xl font-display font-bold text-destructive">{fmt(totalNet)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher..." className="pl-9 h-8 text-sm" />
        </div>
        <Button variant="outline" size="sm"><Filter className="h-3.5 w-3.5 mr-1.5" />Filtres</Button>
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
                  <th className="text-left p-3 font-medium text-muted-foreground">Fournisseur</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Catégorie</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">HT</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">TVA</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">TTC</th>
                </tr>
              </thead>
              <tbody>
                {purchaseBookEntries.map(entry => (
                  <tr key={entry.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="p-3 text-muted-foreground">{new Date(entry.date).toLocaleDateString("fr-FR")}</td>
                    <td className="p-3 font-medium">{entry.description}</td>
                    <td className="p-3 text-muted-foreground">{entry.supplier}</td>
                    <td className="p-3"><Badge variant="secondary" className="text-[10px]">{entry.category}</Badge></td>
                    <td className="p-3 text-right font-medium">{fmt(entry.net)}</td>
                    <td className="p-3 text-right text-muted-foreground">{fmt(entry.vat)}</td>
                    <td className="p-3 text-right font-semibold">{fmt(entry.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-muted/30 font-medium">
                  <td colSpan={4} className="p-3">Total</td>
                  <td className="p-3 text-right">{fmt(totalNet)}</td>
                  <td className="p-3 text-right">{fmt(totalVAT)}</td>
                  <td className="p-3 text-right font-bold">{fmt(totalExpenses)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
