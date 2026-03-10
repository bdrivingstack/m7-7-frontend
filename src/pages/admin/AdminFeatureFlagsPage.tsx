import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Zap, Search, AlertTriangle, CheckCircle, Plus } from "lucide-react";
import { motion } from "framer-motion";
type FlagEnv = "all"|"pro"|"business"|"expert";
interface Flag {id:string;name:string;desc:string;enabled:boolean;env:FlagEnv;rollout:number;updatedBy:string;updatedAt:string;}
const initFlags: Flag[] = [
  {id:"ai_assistant",name:"ai_assistant",desc:"Module IA — chatbot et recommandations",enabled:true,env:"pro",rollout:100,updatedBy:"super@m7seven.app",updatedAt:"Aujourd'hui"},
  {id:"e_invoice_peppol",name:"e_invoice_peppol",desc:"Envoi via réseau Peppol",enabled:false,env:"business",rollout:0,updatedBy:"admin@m7seven.app",updatedAt:"Il y a 2j"},
  {id:"kanban_board",name:"kanban_board",desc:"Vue Kanban projets",enabled:true,env:"all",rollout:100,updatedBy:"admin@m7seven.app",updatedAt:"Il y a 5j"},
  {id:"new_dashboard_v2",name:"new_dashboard_v2",desc:"Nouveau dashboard — beta",enabled:true,env:"expert",rollout:20,updatedBy:"super@m7seven.app",updatedAt:"Hier"},
  {id:"social_charges",name:"social_charges",desc:"Module cotisations sociales",enabled:true,env:"all",rollout:100,updatedBy:"admin@m7seven.app",updatedAt:"Il y a 10j"},
];
const envColors: Record<FlagEnv,string> = {all:"bg-muted text-muted-foreground",pro:"bg-primary/10 text-primary",business:"bg-violet-500/10 text-violet-600",expert:"bg-amber-500/10 text-amber-600"};
export default function AdminFeatureFlagsPage() {
  const [flags, setFlags] = useState(initFlags);
  const [search, setSearch] = useState("");
  const toggle=(id:string)=>setFlags(p=>p.map(f=>f.id===id?{...f,enabled:!f.enabled}:f));
  const filtered=flags.filter(f=>!search||f.name.includes(search.toLowerCase())||f.desc.toLowerCase().includes(search.toLowerCase()));
  return (
    <motion.div className="p-6 space-y-6" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-display font-bold">Feature Flags</h1><p className="text-sm text-muted-foreground">Activation des fonctionnalités par plan et rollout</p></div>
        <Button size="sm" className="gradient-primary text-primary-foreground text-xs"><Plus className="h-3.5 w-3.5 mr-1.5"/>Nouveau flag</Button>
      </div>
      <div className="p-3 rounded-lg bg-warning/5 border border-warning/20 text-xs flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5"/>
        <span>Toute modification est journalisée dans les <strong>audit logs</strong> et appliquée immédiatement à tous les tenants concernés. Soyez prudent.</span>
      </div>
      <div className="relative max-w-sm"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/><Input placeholder="Rechercher un flag…" className="pl-9 h-8 text-sm font-mono" value={search} onChange={e=>setSearch(e.target.value)}/></div>
      <div className="space-y-2">{filtered.map(flag=>(
        <Card key={flag.id} className={flag.enabled?"border-success/20":""}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <code className="text-sm font-mono font-bold">{flag.name}</code>
                <Badge variant="secondary" className={`text-[9px] ${envColors[flag.env]}`}>{flag.env==="all"?"Tous":flag.env}</Badge>
                {flag.rollout<100&&flag.enabled&&<Badge variant="secondary" className="text-[9px] bg-blue-500/10 text-blue-500">{flag.rollout}% rollout</Badge>}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{flag.desc}</p>
              <p className="text-[10px] text-muted-foreground mt-1">Modifié par {flag.updatedBy} · {flag.updatedAt}</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {flag.enabled?<CheckCircle className="h-4 w-4 text-success"/>:<div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30"/>}
              <Switch checked={flag.enabled} onCheckedChange={()=>toggle(flag.id)}/>
            </div>
          </CardContent>
        </Card>
      ))}</div>
    </motion.div>
  );
}
