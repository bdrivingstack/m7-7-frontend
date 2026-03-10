import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, Server, Database, Globe, RefreshCw, CheckCircle, AlertTriangle, Cpu, HardDrive, Wifi, Clock } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
const responseData = [{t:"00:00",ms:45},{t:"04:00",ms:38},{t:"08:00",ms:92},{t:"10:00",ms:78},{t:"12:00",ms:145},{t:"14:00",ms:88},{t:"16:00",ms:112},{t:"18:00",ms:67},{t:"20:00",ms:43},{t:"Now",ms:52}];
const services = [
  {name:"API REST",status:"operational",uptime:"99.97%",p50:"52ms",p99:"180ms",icon:Globe},
  {name:"Base de données",status:"operational",uptime:"99.99%",p50:"8ms",p99:"45ms",icon:Database},
  {name:"Worker files PDF",status:"operational",uptime:"99.85%",p50:"340ms",p99:"1200ms",icon:Server},
  {name:"Worker emails",status:"degraded",uptime:"98.12%",p50:"890ms",p99:"3500ms",icon:Wifi},
  {name:"Stockage S3",status:"operational",uptime:"100%",p50:"12ms",p99:"80ms",icon:HardDrive},
];
const statusCfg: Record<string,{color:string;label:string;icon:any}> = {operational:{color:"bg-success/10 text-success",label:"Opérationnel",icon:CheckCircle},degraded:{color:"bg-warning/10 text-warning",label:"Dégradé",icon:AlertTriangle},down:{color:"bg-destructive/10 text-destructive",label:"Hors ligne",icon:AlertTriangle}};
export default function AdminMonitoringPage() {
  return (
    <motion.div className="p-6 space-y-6" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-display font-bold">Monitoring</h1><p className="text-sm text-muted-foreground">État des services et métriques d'infrastructure</p></div>
        <Button variant="outline" size="sm" className="text-xs"><RefreshCw className="h-3.5 w-3.5 mr-1.5"/>Actualiser</Button>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {[{label:"Uptime global",value:"99.97%",sub:"30 derniers jours",good:true},{label:"Latence p50",value:"52ms",sub:"API REST",good:true},{label:"Latence p99",value:"180ms",sub:"API REST",good:true},{label:"Services OK",value:`${services.filter(s=>s.status==="operational").length}/${services.length}`,sub:"1 dégradé",good:false}].map(s=>(
          <Card key={s.label}><CardContent className="p-4"><p className={`text-2xl font-display font-bold ${s.good?"text-success":"text-warning"}`}>{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-[10px] text-muted-foreground">{s.sub}</p></CardContent></Card>
        ))}
      </div>
      <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Activity className="h-4 w-4"/>Temps de réponse API (24h)</CardTitle></CardHeader>
        <CardContent><ResponsiveContainer width="100%" height={160}>
          <AreaChart data={responseData}>
            <defs><linearGradient id="rtGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4}/>
            <XAxis dataKey="t" tick={{fontSize:10}} tickLine={false} axisLine={false}/>
            <YAxis tick={{fontSize:10}} tickLine={false} axisLine={false} tickFormatter={v=>`${v}ms`}/>
            <Tooltip formatter={(v:any)=>[`${v}ms`,"Latence"]} contentStyle={{fontSize:11,borderRadius:8}}/>
            <Area type="monotone" dataKey="ms" stroke="hsl(var(--primary))" fill="url(#rtGrad)" strokeWidth={2}/>
          </AreaChart>
        </ResponsiveContainer></CardContent>
      </Card>
      <div className="space-y-2">{services.map(svc=>{
        const sc=statusCfg[svc.status]; const StatusIcon=sc.icon; const SvcIcon=svc.icon;
        return <Card key={svc.name} className={svc.status!=="operational"?"border-warning/30":""}>
          <CardContent className="p-3.5 flex items-center gap-4">
            <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0"><SvcIcon className="h-4 w-4 text-muted-foreground"/></div>
            <div className="flex-1 min-w-0"><p className="font-semibold text-sm">{svc.name}</p>
              <div className="flex gap-4 text-[10px] text-muted-foreground mt-0.5">
                <span>Uptime : <strong>{svc.uptime}</strong></span><span>p50 : <strong>{svc.p50}</strong></span><span>p99 : <strong>{svc.p99}</strong></span>
              </div>
            </div>
            <Badge variant="secondary" className={`text-[10px] inline-flex items-center gap-1 flex-shrink-0 ${sc.color}`}><StatusIcon className="h-2.5 w-2.5"/>{sc.label}</Badge>
          </CardContent>
        </Card>;
      })}</div>
    </motion.div>
  );
}
