import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MessageSquare, Search, Clock, CheckCircle, AlertTriangle, User, Building2, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
type TicketStatus = "open"|"in_progress"|"resolved"|"closed";
type Priority = "low"|"medium"|"high"|"urgent";
const statusConfig: Record<TicketStatus,{label:string;color:string}> = {open:{label:"Ouvert",color:"bg-blue-500/10 text-blue-500"},in_progress:{label:"En cours",color:"bg-warning/10 text-warning"},resolved:{label:"Résolu",color:"bg-success/10 text-success"},closed:{label:"Fermé",color:"bg-muted text-muted-foreground"}};
const priorityConfig: Record<Priority,{label:string;color:string}> = {low:{label:"Basse",color:"bg-muted text-muted-foreground"},medium:{label:"Moyenne",color:"bg-blue-500/10 text-blue-500"},high:{label:"Haute",color:"bg-warning/10 text-warning"},urgent:{label:"Urgent",color:"bg-destructive/10 text-destructive"}};
const tickets = [
  {id:"T-1842",subject:"Impossible de connecter Stripe",user:"jean@acme.fr",org:"ACME Corp",status:"in_progress" as TicketStatus,priority:"high" as Priority,created:"Il y a 2h",assigned:"Admin 1"},
  {id:"T-1841",subject:"Export FEC incorrect",user:"paul@bf.fr",org:"Bernard & Fils",status:"open" as TicketStatus,priority:"medium" as Priority,created:"Il y a 5h",assigned:null},
  {id:"T-1840",subject:"Facture envoyée en doublon",user:"marie@mdesign.fr",org:"Marie Design",status:"resolved" as TicketStatus,priority:"medium" as Priority,created:"Hier",assigned:"Admin 2"},
  {id:"T-1839",subject:"2FA bloqué — compte inaccessible",user:"thomas@dubois.fr",org:"Dubois SAS",status:"open" as TicketStatus,priority:"urgent" as Priority,created:"Hier",assigned:null},
];
export default function AdminSupportPage() {
  const [search, setSearch] = useState("");
  return (
    <motion.div className="p-6 space-y-6" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-display font-bold">Support</h1><p className="text-sm text-muted-foreground">Tickets des clients et demandes d'assistance</p></div></div>
      <div className="grid grid-cols-4 gap-3">
        {[{label:"Ouverts",value:tickets.filter(t=>t.status==="open").length,color:"text-blue-500"},{label:"En cours",value:tickets.filter(t=>t.status==="in_progress").length,color:"text-warning"},{label:"Urgents",value:tickets.filter(t=>t.priority==="urgent").length,color:"text-destructive"},{label:"Sans assigné",value:tickets.filter(t=>!t.assigned).length,color:"text-warning"}].map(s=>(
          <Card key={s.label}><CardContent className="p-4"><p className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></CardContent></Card>
        ))}
      </div>
      <div className="relative max-w-sm"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/><Input placeholder="Rechercher…" className="pl-9 h-8 text-sm" value={search} onChange={e=>setSearch(e.target.value)}/></div>
      <Card><CardContent className="p-0"><table className="w-full text-xs">
        <thead><tr className="border-b bg-muted/30"><th className="text-left p-3 font-medium text-muted-foreground">Ticket</th><th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Organisation</th><th className="text-center p-3 font-medium text-muted-foreground">Priorité</th><th className="text-center p-3 font-medium text-muted-foreground">Statut</th><th className="text-right p-3 font-medium text-muted-foreground">Actions</th></tr></thead>
        <tbody>{tickets.map(t=>(
          <tr key={t.id} className="border-b border-border/40 hover:bg-muted/20">
            <td className="p-3"><p className="font-semibold font-mono text-[10px] text-muted-foreground">{t.id}</p><p className="font-medium">{t.subject}</p><p className="text-[10px] text-muted-foreground">{t.user} · {t.created}</p></td>
            <td className="p-3 text-muted-foreground hidden md:table-cell">{t.org}</td>
            <td className="p-3 text-center"><Badge variant="secondary" className={`text-[9px] ${priorityConfig[t.priority].color}`}>{priorityConfig[t.priority].label}</Badge></td>
            <td className="p-3 text-center"><Badge variant="secondary" className={`text-[9px] ${statusConfig[t.status].color}`}>{statusConfig[t.status].label}</Badge></td>
            <td className="p-3 text-right">
              <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-3.5 w-3.5"/></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="text-xs"><DropdownMenuItem>Assigner</DropdownMenuItem><DropdownMenuItem>Répondre</DropdownMenuItem><DropdownMenuItem>Fermer</DropdownMenuItem></DropdownMenuContent>
              </DropdownMenu>
            </td>
          </tr>
        ))}</tbody>
      </table></CardContent></Card>
    </motion.div>
  );
}
