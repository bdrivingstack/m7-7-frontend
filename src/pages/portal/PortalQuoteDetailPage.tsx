import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, CheckCircle, XCircle, Shield, Clock, FileText, MessageSquare, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
const fmtEUR = (n:number) => n.toLocaleString("fr-FR",{style:"currency",currency:"EUR"});
const quote = {id:"D-2024-031",date:"01/03/2024",validUntil:"31/03/2024",status:"pending",
  seller:{name:"Mon Entreprise SAS",address:"12 Rue de la Paix, 75001 Paris",siret:"123 456 789 00012"},
  lines:[{desc:"Développement application mobile React Native",qty:10,unit:"jours",pu:750,ht:7500},{desc:"Tests & déploiement",qty:2,unit:"jours",pu:500,ht:1000}],
  ht:8500,tva:1700,ttc:10200,conditions:"Acompte 30% à la commande. Solde à réception."
};
export default function PortalQuoteDetailPage() {
  const navigate = useNavigate();
  const [action, setAction] = useState<"idle"|"accepting"|"accepted"|"declining"|"declined">("idle");
  const [comment, setComment] = useState("");
  const handleAccept = async () => {
    setAction("accepting");
    await new Promise(r=>setTimeout(r,800));
    setAction("accepted");
  };
  const handleDecline = async () => {
    setAction("declining");
    await new Promise(r=>setTimeout(r,800));
    setAction("declined");
  };
  const daysLeft = 22;
  return (
    <motion.div className="space-y-6" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={()=>navigate("/portal/quotes")}><ArrowLeft className="h-4 w-4"/></Button>
        <div className="flex-1"><div className="flex items-center gap-2"><h1 className="text-xl font-display font-bold">{quote.id}</h1>
          {action==="accepted"?<Badge variant="secondary" className="text-[10px] bg-success/10 text-success">Accepté</Badge>
          :action==="declined"?<Badge variant="secondary" className="text-[10px] bg-destructive/10 text-destructive">Refusé</Badge>
          :<Badge variant="secondary" className="text-[10px] bg-warning/10 text-warning flex items-center gap-1"><Clock className="h-2.5 w-2.5"/>En attente</Badge>}
        </div><p className="text-sm text-muted-foreground">Valide jusqu'au {quote.validUntil} · {daysLeft}j restants</p></div>
        <Button variant="outline" size="sm" className="text-xs"><Download className="h-3.5 w-3.5 mr-1.5"/>PDF</Button>
      </div>

      {daysLeft<=7&&action==="idle"&&<div className="p-3 rounded-lg border border-warning/30 bg-warning/5 flex items-center gap-2 text-xs"><AlertTriangle className="h-4 w-4 text-warning flex-shrink-0"/><span>Ce devis expire dans <strong>{daysLeft} jours</strong>. Acceptez-le avant qu'il ne soit plus valide.</span></div>}

      <Card><CardContent className="p-6 space-y-6">
        <div className="flex justify-between">
          <div><p className="font-bold text-lg">{quote.seller.name}</p><p className="text-xs text-muted-foreground">{quote.seller.address}</p></div>
          <div className="text-right"><p className="text-xs text-muted-foreground">DEVIS</p><p className="text-xl font-display font-bold">{quote.id}</p><p className="text-xs text-muted-foreground">Émis le {quote.date}</p></div>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="border-b"><th className="text-left py-2 text-xs text-muted-foreground">Description</th><th className="text-center py-2 text-xs text-muted-foreground">Qté</th><th className="text-right py-2 text-xs text-muted-foreground">P.U. HT</th><th className="text-right py-2 text-xs text-muted-foreground">Total HT</th></tr></thead>
          <tbody>{quote.lines.map((l,i)=>(<tr key={i} className="border-b border-border/40"><td className="py-3">{l.desc}</td><td className="py-3 text-center text-muted-foreground">{l.qty} {l.unit}</td><td className="py-3 text-right text-muted-foreground">{fmtEUR(l.pu)}</td><td className="py-3 text-right font-medium">{fmtEUR(l.ht)}</td></tr>))}</tbody>
        </table>
        <div className="flex justify-end"><div className="w-52 space-y-1.5 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Total HT</span><span>{fmtEUR(quote.ht)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">TVA 20%</span><span>{fmtEUR(quote.tva)}</span></div>
          <div className="flex justify-between font-bold text-base border-t border-border pt-1.5"><span>Total TTC</span><span className="text-primary">{fmtEUR(quote.ttc)}</span></div>
        </div></div>
        <p className="text-xs text-muted-foreground border-t border-border/40 pt-3">{quote.conditions}</p>
      </CardContent></Card>

      {/* Action panel */}
      <AnimatePresence mode="wait">
        {action==="accepted"&&<motion.div key="acc" initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} className="p-5 rounded-xl border border-success/30 bg-success/5 flex items-center gap-4">
          <CheckCircle className="h-8 w-8 text-success flex-shrink-0"/><div><p className="font-bold text-success">Devis accepté !</p><p className="text-sm text-muted-foreground">Votre prestataire va prendre contact pour la suite. Un email de confirmation a été envoyé.</p></div>
        </motion.div>}
        {action==="declined"&&<motion.div key="dec" initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} className="p-5 rounded-xl border border-destructive/30 bg-destructive/5 flex items-center gap-4">
          <XCircle className="h-8 w-8 text-destructive flex-shrink-0"/><div><p className="font-bold text-destructive">Devis refusé</p><p className="text-sm text-muted-foreground">Votre prestataire a été notifié. N'hésitez pas à le contacter pour discuter.</p></div>
        </motion.div>}
        {(action==="idle"||action==="accepting"||action==="declining")&&<motion.div key="btns">
          <Card className="border-primary/20 bg-primary/5"><CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-primary"/><p className="font-semibold text-sm">Votre décision</p></div>
            <p className="text-xs text-muted-foreground">En acceptant ce devis, vous approuvez les conditions et le montant indiqués. Cette action est enregistrée avec votre identifiant et horodatée.</p>
            <div className="space-y-1.5">
              <label className="text-xs font-medium flex items-center gap-1.5"><MessageSquare className="h-3.5 w-3.5"/>Commentaire (optionnel)</label>
              <textarea value={comment} onChange={e=>setComment(e.target.value)} placeholder="Ajouter un message à votre prestataire…" className="w-full text-sm border border-input rounded-lg p-2.5 bg-background resize-none focus:outline-none focus:ring-1 focus:ring-ring" rows={2}/>
            </div>
            <div className="flex gap-3">
              <Button className="flex-1 gradient-primary text-primary-foreground" onClick={handleAccept} disabled={action!=="idle"}>
                {action==="accepting"?<span className="flex items-center gap-2"><span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"/>Validation…</span>:<span className="flex items-center gap-2"><CheckCircle className="h-4 w-4"/>Accepter le devis</span>}
              </Button>
              <Button variant="outline" className="flex-1 text-destructive border-destructive/40 hover:bg-destructive/5" onClick={handleDecline} disabled={action!=="idle"}>
                {action==="declining"?<span className="flex items-center gap-2"><span className="h-3.5 w-3.5 border-2 border-destructive border-t-transparent rounded-full animate-spin"/>Envoi…</span>:<span className="flex items-center gap-2"><XCircle className="h-4 w-4"/>Refuser</span>}
              </Button>
            </div>
          </CardContent></Card>
        </motion.div>}
      </AnimatePresence>
    </motion.div>
  );
}
