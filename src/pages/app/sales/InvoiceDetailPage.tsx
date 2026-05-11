import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft, Send, Download, Copy, Printer, CreditCard, Clock,
  CheckCircle, FileText, AlertTriangle, RefreshCw, Bot,
} from "lucide-react";
import { invoices, invoiceStatusConfig, fmtEUR } from "@/lib/sales-data";
import { motion } from "framer-motion";

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const invoice = invoices.find(i => i.id === id);

  if (!invoice) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Facture introuvable</p>
        <Link to="/app/sales/invoices"><Button variant="outline" size="sm" className="mt-4">Retour aux factures</Button></Link>
      </div>
    );
  }

  const sc = invoiceStatusConfig[invoice.status];
  const remaining = invoice.total - invoice.paidAmount;
  const isLocked = !["draft"].includes(invoice.status);

  return (
    <motion.div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-full overflow-x-hidden" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/app/sales/invoices">
            <Button variant="ghost" size="icon" className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-fluid-2xl font-display font-bold">{invoice.number}</h1>
              <Badge variant="secondary" className={`${sc.color}`}>{sc.label}</Badge>
              {isLocked && (
                <Badge variant="secondary" className="bg-muted text-muted-foreground text-[9px]">🔒 Verrouillée</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{invoice.client} · Créée le {new Date(invoice.date).toLocaleDateString("fr-FR")}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {invoice.status === "draft" && (
            <Button size="sm" className="gradient-primary text-primary-foreground">
              <CheckCircle className="h-3.5 w-3.5 mr-1.5" />Valider
            </Button>
          )}
          {["validated", "sent"].includes(invoice.status) && (
            <Button size="sm" variant="outline"><Send className="h-3.5 w-3.5 mr-1.5" />Envoyer</Button>
          )}
          {["sent", "overdue", "partially_paid"].includes(invoice.status) && (
            <Button size="sm" className="gradient-primary text-primary-foreground">
              <CreditCard className="h-3.5 w-3.5 mr-1.5" />Enregistrer paiement
            </Button>
          )}
          <Button variant="outline" size="sm"><Download className="h-3.5 w-3.5 mr-1.5" />PDF</Button>
          <Button variant="outline" size="sm"><Copy className="h-3.5 w-3.5 mr-1.5" />Dupliquer</Button>
          {isLocked && (
            <Button variant="outline" size="sm" className="text-warning border-warning/30">
              <FileText className="h-3.5 w-3.5 mr-1.5" />Créer un avoir
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Invoice info */}
          <Card>
            <CardContent className="p-5">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Émetteur</h3>
                  <p className="text-sm font-medium">Mon entreprise</p>
                  <p className="text-xs text-muted-foreground">123 rue de la Paix, 75001 Paris</p>
                  <p className="text-xs text-muted-foreground">SIRET : 123 456 789 00012</p>
                </div>
                <div>
                  <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Client</h3>
                  <p className="text-sm font-medium">{invoice.client}</p>
                  <p className="text-xs text-muted-foreground">Adresse du client</p>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground">Date d'émission</span>
                  <p className="font-medium">{new Date(invoice.date).toLocaleDateString("fr-FR")}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Date d'échéance</span>
                  <p className="font-medium">{new Date(invoice.dueDate).toLocaleDateString("fr-FR")}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Conditions</span>
                  <p className="font-medium">30 jours</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lines */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Lignes de facturation</CardTitle>
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
                  {invoice.lines.map(line => (
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
                  <span className="font-medium">{fmtEUR(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">TVA (20%)</span>
                  <span className="font-medium">{fmtEUR(invoice.vatTotal)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="font-bold">Total TTC</span>
                  <span className="font-bold text-lg">{fmtEUR(invoice.total)}</span>
                </div>
                {invoice.paidAmount > 0 && invoice.paidAmount < invoice.total && (
                  <>
                    <div className="flex justify-between text-xs text-success">
                      <span>Déjà payé</span>
                      <span className="font-medium">{fmtEUR(invoice.paidAmount)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-warning font-medium">
                      <span>Reste à payer</span>
                      <span>{fmtEUR(remaining)}</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {invoice.notes && (
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Notes</p>
                <p className="text-sm">{invoice.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Legal mentions */}
          <Card className="bg-muted/20">
            <CardContent className="p-4">
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                En cas de retard de paiement, une pénalité de 3 fois le taux d'intérêt légal sera appliquée,
                à laquelle s'ajoutera une indemnité forfaitaire pour frais de recouvrement de 40 €.
                Pas d'escompte pour paiement anticipé.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Payment status */}
          <Card className={remaining > 0 && invoice.status !== "draft" ? "border-warning/30" : "border-success/30"}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                {invoice.status === "paid" ? (
                  <CheckCircle className="h-5 w-5 text-success" />
                ) : invoice.status === "overdue" ? (
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                ) : (
                  <Clock className="h-5 w-5 text-warning" />
                )}
                <span className="text-sm font-medium">
                  {invoice.status === "paid" ? "Payée intégralement" :
                   invoice.status === "overdue" ? "En retard de paiement" :
                   invoice.status === "draft" ? "Brouillon" : "En attente de paiement"}
                </span>
              </div>
              {remaining > 0 && invoice.status !== "draft" && (
                <div className="mt-2">
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full bg-success" style={{ width: `${(invoice.paidAmount / invoice.total) * 100}%` }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{Math.round((invoice.paidAmount / invoice.total) * 100)}% payé</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Historique</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...invoice.statusHistory].reverse().map((event, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                      {i < invoice.statusHistory.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                    </div>
                    <div className="pb-3">
                      <p className="text-xs font-medium">{invoiceStatusConfig[event.status]?.label}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(event.date).toLocaleDateString("fr-FR")} · {event.by}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card className="border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Bot className="h-4 w-4 text-primary" /> Actions IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {invoice.status === "overdue" && (
                <Button variant="outline" size="sm" className="w-full text-xs justify-start">
                  <Send className="h-3 w-3 mr-2" />Générer relance IA
                </Button>
              )}
              <Button variant="outline" size="sm" className="w-full text-xs justify-start">
                <RefreshCw className="h-3 w-3 mr-2" />Dupliquer en nouveau devis
              </Button>
              <Button variant="outline" size="sm" className="w-full text-xs justify-start">
                <Printer className="h-3 w-3 mr-2" />Prévisualiser PDF
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
