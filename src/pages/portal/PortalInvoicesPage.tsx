import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FileText, Download, CreditCard, Search, Eye, ExternalLink, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
type InvoiceStatus = "paid"|"sent"|"overdue"|"draft";
const statusConfig: Record<InvoiceStatus,{label:string;color:string;icon:any}> = {
  paid:   {label:"Payée",       color:"bg-success/10 text-success",         icon:CheckCircle},
  sent:   {label:"À payer",     color:"bg-warning/10 text-warning",         icon:Clock},
  overdue:{label:"En retard",   color:"bg-destructive/10 text-destructive", icon:AlertTriangle},
  draft:  {label:"Brouillon",   color:"bg-muted text-muted-foreground",     icon:FileText},
};
const invoices = [
  {id:"F-2024-052",date:"05/03/2024",due:"04/04/2024",amount:2700,status:"sent"  as InvoiceStatus,desc:"Développement — Mars 2024",payUrl:"https://pay.stripe.com/demo"},
  {id:"F-2024-051",date:"01/03/2024",due:"31/03/2024",amount:1850,status:"overdue"as InvoiceStatus,desc:"Maintenance mensuelle",payUrl:"https://pay.stripe.com/demo"},
  {id:"F-2024-047",date:"08/02/2024",due:"10/03/2024",amount:4200,status:"paid"  as InvoiceStatus,desc:"Refonte site web"},
  {id:"F-2024-039",date:"15/01/2024",due:"14/02/2024",amount:3300,status:"paid"  as InvoiceStatus,desc:"Consulting stratégie"},
];
const fmtEUR = (n:number) => n.toLocaleString("fr-FR",{style:"currency",currency:"EUR"});
export default function PortalInvoicesPage() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const filtered = invoices.filter(i=>!search||i.id.toLowerCase().includes(search.toLowerCase())||i.desc.toLowerCase().includes(search.toLowerCase()));
  const totalDue = invoices.filter(i=>i.status==="sent"||i.status==="overdue").reduce((a,i)=>a+i.amount,0);
  return (
    <motion.div className="space-y-6" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>
      <div><h1 className="text-xl font-display font-bold">Mes factures</h1><p className="text-sm text-muted-foreground">Consultez et payez vos factures en ligne</p></div>
      <div className="grid grid-cols-3 gap-3">
        {[{label:"Total à payer",value:fmtEUR(totalDue),color:"text-warning"},{label:"En retard",value:invoices.filter(i=>i.status==="overdue").length.toString(),color:"text-destructive"},{label:"Payées (total)",value:fmtEUR(invoices.filter(i=>i.status==="paid").reduce((a,i)=>a+i.amount,0)),color:"text-success"}].map(s=>(
          <Card key={s.label}><CardContent className="p-4"><p className={`text-xl font-display font-bold ${s.color}`}>{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></CardContent></Card>
        ))}
      </div>
      {invoices.some(i=>i.status==="overdue")&&<div className="p-3 rounded-lg border border-destructive/30 bg-destructive/5 flex items-center gap-2 text-xs"><AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0"/><span><strong>{invoices.filter(i=>i.status==="overdue").length} facture(s) en retard.</strong> Veuillez régulariser pour éviter des pénalités.</span></div>}
      <div className="relative max-w-xs"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/><Input placeholder="Rechercher…" className="pl-9 h-8 text-sm" value={search} onChange={e=>setSearch(e.target.value)}/></div>
      <div className="space-y-3">
        {filtered.map(inv=>{
          const sc=statusConfig[inv.status]; const Icon=sc.icon;
          return <Card key={inv.id} className={`hover:shadow-sm transition-all ${inv.status==="overdue"?"border-destructive/30":inv.status==="sent"?"border-warning/20":""}`}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${inv.status==="paid"?"bg-success/10":"inv.status==='overdue'?'bg-destructive/10':'bg-warning/10'"}`}>
                <FileText className={`h-5 w-5 ${inv.status==="paid"?"text-success":inv.status==="overdue"?"text-destructive":"text-warning"}`}/>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><p className="font-semibold text-sm">{inv.id}</p><Badge variant="secondary" className={`text-[10px] inline-flex items-center gap-1 ${sc.color}`}><Icon className="h-2.5 w-2.5"/>{sc.label}</Badge></div>
                <p className="text-xs text-muted-foreground">{inv.desc}</p>
                <p className="text-[10px] text-muted-foreground">Émise le {inv.date} · Échéance {inv.due}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-base">{fmtEUR(inv.amount)}</p>
                <div className="flex gap-1 mt-1 justify-end">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={()=>navigate(`/portal/invoices/${inv.id.replace("F-","")}`)}>
                    <Eye className="h-3.5 w-3.5"/>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7"><Download className="h-3.5 w-3.5"/></Button>
                  {(inv.status==="sent"||inv.status==="overdue")&&(
                    <Button size="sm" className="h-7 text-xs gradient-primary text-primary-foreground" onClick={()=>window.open(inv.payUrl,"_blank")}>
                      <CreditCard className="h-3 w-3 mr-1"/>Payer
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>;
        })}
      </div>
    </motion.div>
  );
}
