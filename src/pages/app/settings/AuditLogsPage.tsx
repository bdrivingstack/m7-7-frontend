import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Search, Download, Filter, User, FileText, Settings, Shield, CreditCard, Trash2, Edit, Eye, Lock } from "lucide-react";
import { motion } from "framer-motion";
type LogAction = "create"|"update"|"delete"|"login"|"logout"|"export"|"view"|"security";
const actionConfig: Record<LogAction,{label:string;color:string;icon:React.ElementType}> = {
  create:  {label:"Création",  color:"bg-success/10 text-success",       icon:FileText},
  update:  {label:"Modification",color:"bg-blue-500/10 text-blue-500",   icon:Edit},
  delete:  {label:"Suppression",color:"bg-destructive/10 text-destructive",icon:Trash2},
  login:   {label:"Connexion",  color:"bg-muted text-muted-foreground",   icon:User},
  logout:  {label:"Déconnexion",color:"bg-muted text-muted-foreground",   icon:User},
  export:  {label:"Export",     color:"bg-violet-500/10 text-violet-500", icon:Download},
  view:    {label:"Consultation",color:"bg-muted text-muted-foreground",  icon:Eye},
  security:{label:"Sécurité",   color:"bg-warning/10 text-warning",       icon:Shield},
};
const logs = [
  {id:1,user:"Jean Dupont",email:"jean@acme.fr",action:"create" as LogAction,resource:"Facture F-2024-052",detail:"Montant : 2 700 €",ip:"92.184.12.x",time:"Aujourd'hui 09:42",avatar:"JD"},
  {id:2,user:"Jean Dupont",email:"jean@acme.fr",action:"security" as LogAction,resource:"Paramètres sécurité",detail:"2FA reconfiguré",ip:"92.184.12.x",time:"Aujourd'hui 09:15",avatar:"JD"},
  {id:3,user:"Marie Martin",email:"marie@acme.fr",action:"update" as LogAction,resource:"Client Acme Corp",detail:"Email modifié",ip:"92.184.14.x",time:"Hier 17:30",avatar:"MM"},
  {id:4,user:"Paul Bernard",email:"paul@acme.fr",action:"export" as LogAction,resource:"Export FEC",detail:"Période : 2024-Q1",ip:"88.123.45.x",time:"Hier 11:00",avatar:"PB"},
  {id:5,user:"Jean Dupont",email:"jean@acme.fr",action:"delete" as LogAction,resource:"Brouillon F-2024-051",detail:"Suppression définitive",ip:"92.184.12.x",time:"Il y a 2j",avatar:"JD"},
  {id:6,user:"Sophie Leroy",email:"sophie@acme.fr",action:"login" as LogAction,resource:"Connexion",detail:"Chrome · Paris",ip:"78.12.34.x",time:"Il y a 2j",avatar:"SL"},
  {id:7,user:"Jean Dupont",email:"jean@acme.fr",action:"update" as LogAction,resource:"Paramètres entreprise",detail:"IBAN modifié",ip:"92.184.12.x",time:"Il y a 3j",avatar:"JD"},
  {id:8,user:"Paul Bernard",email:"paul@acme.fr",action:"view" as LogAction,resource:"Rapport financier T1 2024",detail:"Consultation",ip:"88.123.45.x",time:"Il y a 4j",avatar:"PB"},
];
export default function AuditLogsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all"|LogAction>("all");
  const filtered = logs.filter(l => {
    if(filter!=="all" && l.action!==filter) return false;
    if(search){const q=search.toLowerCase();return l.user.toLowerCase().includes(q)||l.resource.toLowerCase().includes(q)||l.detail.toLowerCase().includes(q);}
    return true;
  });
  return (
    <motion.div className="p-6 space-y-6 max-w-4xl" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-display font-bold">Journaux d'audit</h1>
          <p className="text-sm text-muted-foreground">Traçabilité complète de toutes les actions sur votre compte</p>
        </div>
        <Button variant="outline" size="sm" className="text-xs"><Download className="h-3.5 w-3.5 mr-1.5"/>Exporter les logs</Button>
      </div>
      <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-muted-foreground flex items-start gap-2">
        <Lock className="h-4 w-4 text-primary flex-shrink-0 mt-0.5"/>
        Les journaux d'audit sont en lecture seule et conservés 12 mois (Plan Pro) · 36 mois (Plan Business). Ils ne peuvent pas être modifiés ni supprimés.
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
          <Input placeholder="Rechercher…" className="pl-9 h-8 text-sm" value={search} onChange={(e)=>setSearch(e.target.value)}/>
        </div>
        <div className="flex gap-1 flex-wrap">
          {(["all","create","update","delete","security","export","login"] as const).map((a)=>(
            <Button key={a} variant={filter===a?"default":"outline"} size="sm"
              className={`text-xs h-7 ${filter===a?"gradient-primary text-primary-foreground":""}`}
              onClick={()=>setFilter(a)}>
              {a==="all"?"Tous":actionConfig[a].label}
            </Button>
          ))}
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-xs">
            <thead><tr className="border-b bg-muted/30">
              <th className="text-left p-3 font-medium text-muted-foreground">Utilisateur</th>
              <th className="text-center p-3 font-medium text-muted-foreground">Action</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Ressource</th>
              <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Détail</th>
              <th className="text-center p-3 font-medium text-muted-foreground hidden lg:table-cell">IP</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Horodatage</th>
            </tr></thead>
            <tbody>
              {filtered.map((log)=>{
                const ac=actionConfig[log.action]; const Icon=ac.icon;
                return <tr key={log.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="p-3"><div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md gradient-primary flex items-center justify-center text-primary-foreground text-[9px] font-bold flex-shrink-0">{log.avatar}</div>
                    <div><p className="font-medium">{log.user}</p><p className="text-[10px] text-muted-foreground">{log.email}</p></div>
                  </div></td>
                  <td className="p-3 text-center"><Badge variant="secondary" className={`text-[10px] inline-flex items-center gap-1 ${ac.color}`}><Icon className="h-2.5 w-2.5"/>{ac.label}</Badge></td>
                  <td className="p-3 font-medium">{log.resource}</td>
                  <td className="p-3 text-muted-foreground hidden md:table-cell">{log.detail}</td>
                  <td className="p-3 text-center hidden lg:table-cell font-mono text-muted-foreground">{log.ip}</td>
                  <td className="p-3 text-right text-muted-foreground">{log.time}</td>
                </tr>;
              })}
            </tbody>
          </table>
          {filtered.length===0&&<div className="text-center py-10 text-muted-foreground"><ClipboardList className="h-8 w-8 mx-auto mb-2 opacity-30"/><p className="text-sm">Aucun log trouvé</p></div>}
        </CardContent>
      </Card>
    </motion.div>
  );
}
