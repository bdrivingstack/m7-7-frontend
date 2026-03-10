import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, CheckCircle, AlertTriangle, RefreshCw, FileText, Globe, Clock } from "lucide-react";
import { motion } from "framer-motion";
const pdps = [
  {name:"Chorus Pro",type:"B2G",status:"connected",txCount:234,lastSync:"Il y a 5min",certified:true},
  {name:"Peppol Access Point",type:"B2B EU",status:"connected",txCount:67,lastSync:"Il y a 10min",certified:true},
  {name:"Factur-X Generator",type:"PDF/A-3",status:"operational",txCount:1847,lastSync:"Continu",certified:true},
];
const stats = [{label:"Factures e-transmises ce mois",value:"2 148"},{label:"Taux de succès",value:"99.8%"},{label:"Tenants e-facture activés",value:"89"},{label:"Erreurs (7j)",value:"4"}];
export default function AdminEInvoicingPage() {
  return (
    <motion.div className="p-6 space-y-6" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>
      <div><h1 className="text-2xl font-display font-bold">E-Facture Plateforme</h1><p className="text-sm text-muted-foreground">Gestion des PDP et conformité réforme 2026</p></div>
      <div className="grid grid-cols-4 gap-3">
        {stats.map(s=><Card key={s.label}><CardContent className="p-4"><p className="text-2xl font-display font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></CardContent></Card>)}
      </div>
      <div className="space-y-3">{pdps.map(pdp=>(
        <Card key={pdp.name} className="border-success/20">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center flex-shrink-0"><Zap className="h-5 w-5 text-success"/></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2"><p className="font-semibold text-sm">{pdp.name}</p><Badge variant="secondary" className="text-[9px]">{pdp.type}</Badge>{pdp.certified&&<Badge variant="secondary" className="text-[9px] bg-success/10 text-success">Certifié</Badge>}</div>
              <p className="text-xs text-muted-foreground">{pdp.txCount.toLocaleString()} transactions · Sync {pdp.lastSync}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant="secondary" className="text-[10px] bg-success/10 text-success flex items-center gap-1"><CheckCircle className="h-2.5 w-2.5"/>{pdp.status}</Badge>
              <Button variant="ghost" size="icon" className="h-8 w-8"><RefreshCw className="h-3.5 w-3.5"/></Button>
            </div>
          </CardContent>
        </Card>
      ))}</div>
      <Card className="border-primary/20 bg-primary/5"><CardContent className="p-4">
        <p className="font-semibold text-sm flex items-center gap-2"><Clock className="h-4 w-4 text-primary"/>Calendrier réforme — État de préparation</p>
        <div className="mt-3 space-y-2 text-xs">
          {[{date:"1er sept. 2026",label:"Grandes entreprises",ready:true},{date:"1er sept. 2026",label:"ETI",ready:true},{date:"1er sept. 2027",label:"PME & micro",ready:false,warn:"2 tenants non conformes"}].map((r,i)=>(
            <div key={i} className={`flex items-center justify-between p-2 rounded-lg border ${r.ready?"border-success/30 bg-success/5":"border-warning/30 bg-warning/5"}`}>
              <div><span className="font-medium">{r.date}</span> — {r.label}</div>
              <div className="flex items-center gap-2">
                {r.ready?<Badge variant="secondary" className="text-[9px] bg-success/10 text-success">Prêt</Badge>:<Badge variant="secondary" className="text-[9px] bg-warning/10 text-warning">{(r as any).warn}</Badge>}
              </div>
            </div>
          ))}
        </div>
      </CardContent></Card>
    </motion.div>
  );
}
