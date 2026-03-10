import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Download, CheckCircle, Clock, ExternalLink, Shield } from "lucide-react";
import { motion } from "framer-motion";
const fmtEUR = (n:number) => n.toLocaleString("fr-FR",{style:"currency",currency:"EUR"});
const payments = [
  {id:"PAY-2024-038",invoice:"F-2024-047",date:"10/03/2024",amount:4200,method:"Carte Visa ••4242",status:"captured",receipt:"https://stripe.com/receipt/demo"},
  {id:"PAY-2024-027",invoice:"F-2024-039",date:"14/02/2024",amount:3300,method:"Virement bancaire",status:"captured",receipt:null},
  {id:"PAY-2024-012",invoice:"F-2024-031",date:"20/01/2024",amount:6500,method:"Carte Visa ••4242",status:"captured",receipt:"https://stripe.com/receipt/demo"},
];
export default function PortalPaymentsPage() {
  return (
    <motion.div className="space-y-6" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>
      <div><h1 className="text-xl font-display font-bold">Historique des paiements</h1><p className="text-sm text-muted-foreground">Tous vos règlements</p></div>
      <div className="grid grid-cols-2 gap-3">
        {[{label:"Total payé",value:fmtEUR(payments.reduce((a,p)=>a+p.amount,0)),color:"text-success"},{label:"Paiements CB",value:payments.filter(p=>p.method.includes("Visa")).length.toString(),color:""}].map(s=>(
          <Card key={s.label}><CardContent className="p-4"><p className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></CardContent></Card>
        ))}
      </div>
      <Card className="border-primary/20 bg-primary/5"><CardContent className="p-4 flex items-center gap-3">
        <Shield className="h-5 w-5 text-primary flex-shrink-0"/>
        <div className="text-xs"><p className="font-semibold">Paiements sécurisés par Stripe</p><p className="text-muted-foreground">Nous ne stockons jamais vos données bancaires. Traitement sécurisé PCI-DSS · Chiffrement TLS 1.3.</p></div>
      </CardContent></Card>
      <div className="space-y-3">
        {payments.map(p=>(
          <Card key={p.id}><CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0"><CheckCircle className="h-5 w-5 text-success"/></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2"><p className="font-semibold text-sm font-mono">{p.id}</p><Badge variant="secondary" className="text-[10px] bg-success/10 text-success">Encaissé</Badge></div>
              <p className="text-xs text-muted-foreground">Facture {p.invoice} · {p.method} · {p.date}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-bold text-base text-success">{fmtEUR(p.amount)}</p>
              <div className="flex gap-1 justify-end mt-1">
                <Button variant="ghost" size="icon" className="h-7 w-7"><Download className="h-3.5 w-3.5"/></Button>
                {p.receipt&&<Button variant="ghost" size="icon" className="h-7 w-7" onClick={()=>window.open(p.receipt,"_blank")}><ExternalLink className="h-3.5 w-3.5"/></Button>}
              </div>
            </div>
          </CardContent></Card>
        ))}
      </div>
    </motion.div>
  );
}
