import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Eye, Plus } from "lucide-react";
import { creditNotes, fmtEUR } from "@/lib/sales-data";
import { motion } from "framer-motion";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  validated: "bg-info/10 text-info",
  sent: "bg-success/10 text-success",
};

export default function CreditNotesPage() {
  return (
    <motion.div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-full overflow-x-hidden" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-fluid-2xl font-display font-bold">Avoirs</h1>
          <p className="text-sm text-muted-foreground">Corrections et annulations de factures</p>
        </div>
        <Button size="sm" className="gradient-primary text-primary-foreground">
          <Plus className="h-3.5 w-3.5 mr-1.5" />Nouvel avoir
        </Button>
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

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left p-3 font-medium text-muted-foreground">N°</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Client</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Facture liée</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Motif</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Montant</th>
                <th className="text-center p-3 font-medium text-muted-foreground">Statut</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {creditNotes.map(cn => (
                <tr key={cn.id} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="p-3 font-mono font-medium">{cn.number}</td>
                  <td className="p-3 font-medium">{cn.client}</td>
                  <td className="p-3">
                    <Badge variant="secondary" className="text-[10px]">{cn.relatedInvoice}</Badge>
                  </td>
                  <td className="p-3 text-muted-foreground max-w-[200px] truncate">{cn.reason}</td>
                  <td className="p-3 text-muted-foreground">{new Date(cn.date).toLocaleDateString("fr-FR")}</td>
                  <td className="p-3 text-right font-semibold text-destructive">{fmtEUR(cn.total)}</td>
                  <td className="p-3 text-center">
                    <Badge variant="secondary" className={`text-[10px] ${statusColors[cn.status]}`}>
                      {cn.status === "draft" ? "Brouillon" : cn.status === "validated" ? "Validé" : "Envoyé"}
                    </Badge>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7"><Download className="h-3.5 w-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
