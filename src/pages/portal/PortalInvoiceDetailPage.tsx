import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, CreditCard, FileText, CheckCircle, Clock, Shield, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
const fmtEUR = (n:number) => n.toLocaleString("fr-FR",{style:"currency",currency:"EUR"});
const invoice = {id:"F-2024-052",date:"05/03/2024",due:"04/04/2024",status:"sent",desc:"Développement — Mars 2024",
  seller:{name:"Mon Entreprise SAS",address:"12 Rue de la Paix, 75001 Paris",siret:"123 456 789 00012",tva:"FR12 123456789",iban:"FR76 3000 6000 0112 3456 7890 189"},
  buyer:{name:"ACME Corp",address:"45 Avenue des Champs, 75008 Paris",siret:"987 654 321 00099"},
  lines:[{desc:"Développement React / Node.js",qty:3,unit:"jours",pu:750,ht:2250},{desc:"Réunion de suivi",qty:2,unit:"heures",pu:150,ht:300}],
  ht:2550,tva:510,ttc:3060,payUrl:"https://pay.stripe.com/demo"
};
export default function PortalInvoiceDetailPage() {
  const navigate = useNavigate();
  return (
    <motion.div className="space-y-6" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={()=>navigate("/portal/invoices")}><ArrowLeft className="h-4 w-4"/></Button>
        <div className="flex-1"><div className="flex items-center gap-2"><h1 className="text-xl font-display font-bold">{invoice.id}</h1><Badge variant="secondary" className="text-[10px] bg-warning/10 text-warning flex items-center gap-1"><Clock className="h-2.5 w-2.5"/>À payer</Badge></div><p className="text-sm text-muted-foreground">{invoice.desc}</p></div>
        <div className="flex gap-2"><Button variant="outline" size="sm" className="text-xs"><Download className="h-3.5 w-3.5 mr-1.5"/>PDF</Button>
          <Button size="sm" className="gradient-primary text-primary-foreground text-xs" onClick={()=>window.open(invoice.payUrl,"_blank")}><CreditCard className="h-3.5 w-3.5 mr-1.5"/>Payer {fmtEUR(invoice.ttc)}</Button>
        </div>
      </div>
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex justify-between">
            <div><p className="font-bold text-lg">{invoice.seller.name}</p><p className="text-xs text-muted-foreground">{invoice.seller.address}</p><p className="text-xs text-muted-foreground font-mono">SIRET : {invoice.seller.siret}</p><p className="text-xs text-muted-foreground font-mono">TVA : {invoice.seller.tva}</p></div>
            <div className="text-right"><p className="text-xs text-muted-foreground">FACTURE</p><p className="text-xl font-display font-bold">{invoice.id}</p><p className="text-xs text-muted-foreground">Émise le {invoice.date}</p><p className="text-xs text-warning font-semibold">Échéance : {invoice.due}</p></div>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 border border-border/50"><p className="text-xs font-semibold mb-1">Facturé à</p><p className="text-sm font-medium">{invoice.buyer.name}</p><p className="text-xs text-muted-foreground">{invoice.buyer.address}</p><p className="text-xs text-muted-foreground font-mono">SIRET : {invoice.buyer.siret}</p></div>
          <table className="w-full text-sm">
            <thead><tr className="border-b"><th className="text-left py-2 text-xs text-muted-foreground">Description</th><th className="text-center py-2 text-xs text-muted-foreground">Qté</th><th className="text-right py-2 text-xs text-muted-foreground">P.U. HT</th><th className="text-right py-2 text-xs text-muted-foreground">Total HT</th></tr></thead>
            <tbody>{invoice.lines.map((l,i)=>(<tr key={i} className="border-b border-border/40"><td className="py-3">{l.desc}</td><td className="py-3 text-center text-muted-foreground">{l.qty} {l.unit}</td><td className="py-3 text-right text-muted-foreground">{fmtEUR(l.pu)}</td><td className="py-3 text-right font-medium">{fmtEUR(l.ht)}</td></tr>))}</tbody>
          </table>
          <div className="flex justify-end"><div className="w-52 space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Total HT</span><span>{fmtEUR(invoice.ht)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">TVA 20%</span><span>{fmtEUR(invoice.tva)}</span></div>
            <div className="flex justify-between font-bold text-base border-t border-border pt-1.5"><span>Total TTC</span><span className="text-primary">{fmtEUR(invoice.ttc)}</span></div>
          </div></div>
          <div className="p-3 rounded-lg bg-muted/30 border border-border/50 text-xs space-y-0.5"><p className="font-semibold">Virement bancaire</p><p className="font-mono text-muted-foreground">{invoice.seller.iban}</p></div>
        </CardContent>
      </Card>
      <Card className="border-primary/20 bg-primary/5"><CardContent className="p-4 flex items-center gap-3">
        <Shield className="h-5 w-5 text-primary flex-shrink-0"/>
        <div className="text-xs"><p className="font-semibold">Paiement sécurisé</p><p className="text-muted-foreground">Vos paiements en ligne sont traités par Stripe · Chiffrement TLS 1.3 · Aucune donnée bancaire stockée chez nous.</p></div>
        <Button size="sm" className="gradient-primary text-primary-foreground text-xs flex-shrink-0" onClick={()=>window.open(invoice.payUrl,"_blank")}><CreditCard className="h-3.5 w-3.5 mr-1.5"/>Payer maintenant<ExternalLink className="h-3 w-3 ml-1"/></Button>
      </CardContent></Card>
    </motion.div>
  );
}
