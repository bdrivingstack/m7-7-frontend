import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft, Send, Download, Copy, ArrowRight, CheckCircle, XCircle,
  Clock, FileText,
} from "lucide-react";
import { quotes, quoteStatusConfig, fmtEUR } from "@/lib/sales-data";
import { motion } from "framer-motion";

export default function QuoteDetailPage() {
  const { id } = useParams();
  const quote = quotes.find(q => q.id === id);

  if (!quote) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Devis introuvable</p>
        <Link to="/app/sales/quotes"><Button variant="outline" size="sm" className="mt-4">Retour</Button></Link>
      </div>
    );
  }

  const sc = quoteStatusConfig[quote.status];

  return (
    <motion.div className="p-6 space-y-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/app/sales/quotes">
            <Button variant="ghost" size="icon" className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-display font-bold">{quote.number}</h1>
              <Badge variant="secondary" className={sc.color}>{sc.label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{quote.client} · Valide jusqu'au {new Date(quote.validUntil).toLocaleDateString("fr-FR")}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {quote.status === "draft" && (
            <Button size="sm"><Send className="h-3.5 w-3.5 mr-1.5" />Envoyer</Button>
          )}
          {quote.status === "accepted" && !quote.convertedInvoice && (
            <Button size="sm" className="gradient-primary text-primary-foreground">
              <ArrowRight className="h-3.5 w-3.5 mr-1.5" />Convertir en facture
            </Button>
          )}
          <Button variant="outline" size="sm"><Download className="h-3.5 w-3.5 mr-1.5" />PDF</Button>
          <Button variant="outline" size="sm"><Copy className="h-3.5 w-3.5 mr-1.5" />Dupliquer</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-5">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Émetteur</h3>
                  <p className="text-sm font-medium">Mon entreprise</p>
                  <p className="text-xs text-muted-foreground">123 rue de la Paix, 75001 Paris</p>
                </div>
                <div>
                  <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Client</h3>
                  <p className="text-sm font-medium">{quote.client}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Lignes du devis</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left p-3 font-medium text-muted-foreground">Description</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Qté</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">P.U. HT</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">TVA</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Remise</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Total HT</th>
                  </tr>
                </thead>
                <tbody>
                  {quote.lines.map(line => (
                    <tr key={line.id} className="border-b border-border/50">
                      <td className="p-3 font-medium">{line.description}</td>
                      <td className="p-3 text-right">{line.quantity}</td>
                      <td className="p-3 text-right">{fmtEUR(line.unitPrice)}</td>
                      <td className="p-3 text-right">{line.vatRate}%</td>
                      <td className="p-3 text-right">{line.discount > 0 ? `${line.discount}%` : "—"}</td>
                      <td className="p-3 text-right font-semibold">{fmtEUR(line.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-4 space-y-1.5 border-t bg-muted/20">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Sous-total HT</span>
                  <span>{fmtEUR(quote.subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">TVA</span>
                  <span>{fmtEUR(quote.vatTotal)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="font-bold">Total TTC</span>
                  <span className="font-bold text-lg">{fmtEUR(quote.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {quote.notes && (
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Notes</p>
                <p className="text-sm">{quote.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Historique</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...quote.statusHistory].reverse().map((event, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                      {i < quote.statusHistory.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                    </div>
                    <div className="pb-3">
                      <p className="text-xs font-medium">{quoteStatusConfig[event.status]?.label}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(event.date).toLocaleDateString("fr-FR")} · {event.by}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {quote.convertedInvoice && (
            <Card className="border-primary/20">
              <CardContent className="p-4 flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <p className="text-xs font-medium">Converti en facture</p>
                  <p className="text-[10px] text-muted-foreground">{quote.convertedInvoice}</p>
                </div>
                <Button variant="outline" size="sm" className="text-xs">Voir</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  );
}
