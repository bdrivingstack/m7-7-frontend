import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Eye, Download, Clock, CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";
const fmtEUR = (n:number) => n.toLocaleString("fr-FR",{style:"currency",currency:"EUR"});
const quotes = [
  {id:"D-2024-031",date:"01/03/2024",validUntil:"31/03/2024",amount:10200,status:"pending",desc:"Application mobile React Native"},
  {id:"D-2024-018",date:"15/01/2024",validUntil:"14/02/2024",amount:4800,status:"accepted",desc:"Refonte identité visuelle"},
  {id:"D-2024-005",date:"10/01/2024",validUntil:"09/02/2024",amount:2400,status:"declined",desc:"Maintenance annuelle"},
];
const sc: Record<string,{label:string;color:string;icon:any}> = {
  pending: {label:"En attente",color:"bg-warning/10 text-warning",icon:Clock},
  accepted:{label:"Accepté",  color:"bg-success/10 text-success", icon:CheckCircle},
  declined:{label:"Refusé",   color:"bg-destructive/10 text-destructive",icon:XCircle},
};
export default function PortalQuotesPage() {
  const navigate = useNavigate();
  return (
    <motion.div className="space-y-6" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>
      <div><h1 className="text-xl font-display font-bold">Mes devis</h1><p className="text-sm text-muted-foreground">Consultez et acceptez vos devis en ligne</p></div>
      <div className="space-y-3">
        {quotes.map(q=>{const s=sc[q.status];const Icon=s.icon;return(
          <Card key={q.id} className={`hover:shadow-sm transition-all ${q.status==="pending"?"border-warning/20":""}`}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0"><FileText className="h-5 w-5 text-muted-foreground"/></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><p className="font-semibold text-sm">{q.id}</p><Badge variant="secondary" className={`text-[10px] inline-flex items-center gap-1 ${s.color}`}><Icon className="h-2.5 w-2.5"/>{s.label}</Badge></div>
                <p className="text-xs text-muted-foreground">{q.desc}</p>
                <p className="text-[10px] text-muted-foreground">Émis le {q.date} · Valide jusqu'au {q.validUntil}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-base">{fmtEUR(q.amount)}</p>
                <div className="flex gap-1 mt-1 justify-end">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={()=>navigate(`/portal/quotes/${q.id.replace("D-","")}`)}>
                    <Eye className="h-3.5 w-3.5"/>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7"><Download className="h-3.5 w-3.5"/></Button>
                  {q.status==="pending"&&<Button size="sm" className="h-7 text-xs gradient-primary text-primary-foreground" onClick={()=>navigate(`/portal/quotes/${q.id.replace("D-","")}`)}>Répondre</Button>}
                </div>
              </div>
            </CardContent>
          </Card>
        );})}
      </div>
    </motion.div>
  );
}
