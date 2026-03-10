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
    <motion.div className="p-6 space-y-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Livre des recettes</h1>
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
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Total TTC</p>
            <p className="text-xl font-display font-bold">{fmt(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3.5 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">TVA collectée</p>
            <p className="text-xl font-display font-bold text-warning">{fmt(totalVAT)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3.5 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Net HT</p>
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
