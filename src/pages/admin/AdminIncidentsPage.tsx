import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Plus, Clock, Zap } from "lucide-react";
import { motion } from "framer-motion";
const incidents = [
  {id:"INC-2024-015",title:"Latence API élevée — endpoint /invoices",status:"investigating",severity:"major",start:"09/03/2024 08:30",affected:"API REST",updates:["08:30 — Détection automatique d'une dégradation des temps de réponse","08:45 — Équipe notifiée, investigation en cours","09:00 — Cause identifiée : index DB manquant"]},
  {id:"INC-2024-014",title:"Erreurs 500 intermittentes sur l'export PDF",status:"resolved",severity:"minor",start:"07/03/2024 14:00",end:"07/03/2024 15:30",affected:"Export PDF",updates:["14:00 — Signalement client","14:20 — Correction déployée","15:30 — Résolution confirmée"]},
  {id:"INC-2024-013",title:"Indisponibilité portail client",status:"resolved",severity:"critical",start:"01/03/2024 02:00",end:"01/03/2024 02:45",affected:"Portail client",updates:["02:00 — Alerte monitoring","02:15 — Rollback déployé","02:45 — Service restauré"]},
];
const severityConfig: Record<string,{color:string;label:string}> = {critical:{color:"bg-destructive/10 text-destructive",label:"Critique"},major:{color:"bg-warning/10 text-warning",label:"Majeur"},minor:{color:"bg-blue-500/10 text-blue-500",label:"Mineur"}};
const statusConfig: Record<string,{color:string;label:string;icon:any}> = {investigating:{color:"bg-warning/10 text-warning",label:"En cours",icon:AlertTriangle},resolved:{color:"bg-success/10 text-success",label:"Résolu",icon:CheckCircle},monitoring:{color:"bg-blue-500/10 text-blue-500",label:"Surveillance",icon:Zap}};
export default function AdminIncidentsPage() {
  return (
    <motion.div className="p-6 space-y-6" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-display font-bold">Incidents</h1><p className="text-sm text-muted-foreground">Gestion des incidents et postmortems</p></div>
        <Button size="sm" className="gradient-primary text-primary-foreground text-xs"><Plus className="h-3.5 w-3.5 mr-1.5"/>Déclarer</Button>
      </div>
      {incidents.filter(i=>i.status!=="resolved").length>0&&<div className="p-3 rounded-lg border border-warning/30 bg-warning/5 flex items-center gap-3 text-sm"><AlertTriangle className="h-4 w-4 text-warning flex-shrink-0"/><span className="text-xs"><strong>{incidents.filter(i=>i.status!=="resolved").length} incident(s) actif(s)</strong> en ce moment.</span></div>}
      <div className="space-y-4">
        {incidents.map(inc=>{
          const sc=statusConfig[inc.status]; const sv=severityConfig[inc.severity]; const StatusIcon=sc.icon;
          return <Card key={inc.id} className={inc.status!=="resolved"?"border-warning/30":""}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div><p className="text-xs font-mono text-muted-foreground">{inc.id}</p><CardTitle className="text-sm font-semibold mt-0.5">{inc.title}</CardTitle></div>
                <div className="flex gap-2 flex-shrink-0">
                  <Badge variant="secondary" className={`text-[10px] ${sv.color}`}>{sv.label}</Badge>
                  <Badge variant="secondary" className={`text-[10px] inline-flex items-center gap-1 ${sc.color}`}><StatusIcon className="h-2.5 w-2.5"/>{sc.label}</Badge>
                </div>
              </div>
              <div className="flex gap-4 text-[10px] text-muted-foreground"><span className="flex items-center gap-1"><Clock className="h-3 w-3"/>Début : {inc.start}</span>{(inc as any).end&&<span>Fin : {(inc as any).end}</span>}<span>Affecté : {inc.affected}</span></div>
            </CardHeader>
            <CardContent><div className="space-y-1.5">{inc.updates.map((u,i)=>(
              <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground"><div className="h-1.5 w-1.5 rounded-full bg-muted-foreground mt-1.5 flex-shrink-0"/><span>{u}</span></div>
            ))}</div>
            {inc.status==="investigating"&&<Button size="sm" className="mt-3 text-xs gradient-primary text-primary-foreground">Mettre à jour</Button>}
            </CardContent>
          </Card>;
        })}
      </div>
    </motion.div>
  );
}
