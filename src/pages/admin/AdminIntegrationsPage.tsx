import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plug, CheckCircle, AlertTriangle, RefreshCw, Settings } from "lucide-react";
import { motion } from "framer-motion";
const integrations = [
  {name:"Stripe",desc:"Passerelle de paiement",status:"ok",tenants:847,errors:0,lastCheck:"Il y a 2min"},
  {name:"Qonto (Bridge)",desc:"Agrégateur bancaire",status:"ok",tenants:234,errors:0,lastCheck:"Il y a 5min"},
  {name:"Chorus Pro",desc:"Portail e-facture B2G",status:"ok",tenants:12,errors:0,lastCheck:"Il y a 1h"},
  {name:"GoCardless",desc:"Prélèvement SEPA",status:"degraded",tenants:43,errors:7,lastCheck:"Il y a 10min"},
  {name:"HubSpot",desc:"CRM",status:"ok",tenants:78,errors:0,lastCheck:"Il y a 3min"},
  {name:"Slack",desc:"Notifications",status:"ok",tenants:312,errors:0,lastCheck:"Il y a 1min"},
];
const stCfg: Record<string,{color:string;label:string}> = {ok:{color:"bg-success/10 text-success",label:"Opérationnel"},degraded:{color:"bg-warning/10 text-warning",label:"Dégradé"}};
export default function AdminIntegrationsPage() {
  return (
    <motion.div className="p-6 space-y-6" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>
      <div><h1 className="text-2xl font-display font-bold">Intégrations plateforme</h1><p className="text-sm text-muted-foreground">État de toutes les intégrations tierces</p></div>
      <div className="grid grid-cols-3 gap-3">
        {[{label:"Intégrations actives",value:integrations.filter(i=>i.status==="ok").length},{label:"Tenants connectés",value:integrations.reduce((a,i)=>a+i.tenants,0).toLocaleString()},{label:"Erreurs actives",value:integrations.reduce((a,i)=>a+i.errors,0)}].map(s=>(
          <Card key={s.label}><CardContent className="p-4"><p className="text-2xl font-display font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></CardContent></Card>
        ))}
      </div>
      <div className="space-y-3">{integrations.map(intg=>{
        const sc=stCfg[intg.status]; const StatusIcon=intg.status==="ok"?CheckCircle:AlertTriangle;
        return <Card key={intg.name} className={intg.status!=="ok"?"border-warning/30":""}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0"><Plug className="h-5 w-5 text-muted-foreground"/></div>
            <div className="flex-1 min-w-0"><div className="flex items-center gap-2"><p className="font-semibold text-sm">{intg.name}</p><Badge variant="secondary" className={`text-[9px] inline-flex items-center gap-1 ${sc.color}`}><StatusIcon className="h-2.5 w-2.5"/>{sc.label}</Badge>{intg.errors>0&&<Badge variant="secondary" className="text-[9px] bg-destructive/10 text-destructive">{intg.errors} erreurs</Badge>}</div>
              <p className="text-xs text-muted-foreground">{intg.desc} · {intg.tenants} tenants · Vérifié {intg.lastCheck}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button variant="ghost" size="icon" className="h-8 w-8"><RefreshCw className="h-3.5 w-3.5"/></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8"><Settings className="h-3.5 w-3.5"/></Button>
            </div>
          </CardContent>
        </Card>;
      })}</div>
    </motion.div>
  );
}
