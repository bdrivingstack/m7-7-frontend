import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Search, Shield, CheckCircle, XCircle, Ban, MoreHorizontal, AlertTriangle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
const users = [
  {id:"U001",name:"Jean Dupont",email:"jean@acme.fr",org:"ACME Corp",orgId:"T1847",role:"owner",plan:"Pro",status:"active",mfa:true,lastLogin:"Il y a 2h",ip:"92.184.x.x"},
  {id:"U002",name:"Marie Martin",email:"marie@bf.fr",org:"Bernard & Fils",orgId:"T1203",role:"admin",plan:"Business",status:"active",mfa:true,lastLogin:"Hier",ip:"78.12.x.x"},
  {id:"U003",name:"Thomas Dubois",email:"thomas@dubois.fr",org:"Dubois SAS",orgId:"T2201",role:"owner",plan:"Micro",status:"suspended",mfa:false,lastLogin:"Il y a 15j",ip:"—"},
  {id:"U004",name:"Clara Tech",email:"clara@techsol.fr",org:"Tech Solutions",orgId:"T0891",role:"manager",plan:"Expert",status:"active",mfa:true,lastLogin:"Il y a 1h",ip:"51.38.x.x"},
];
export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const filtered = users.filter(u=>!search||u.name.toLowerCase().includes(search.toLowerCase())||u.email.toLowerCase().includes(search.toLowerCase()));
  return (
    <motion.div className="p-6 space-y-6" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>
      <div><h1 className="text-2xl font-display font-bold">Utilisateurs</h1><p className="text-sm text-muted-foreground">Tous les utilisateurs de la plateforme</p></div>
      <div className="grid grid-cols-3 gap-3">
        {[{label:"Total users",value:users.length},{label:"Sans 2FA",value:users.filter(u=>!u.mfa&&u.status==="active").length},{label:"Suspendus",value:users.filter(u=>u.status==="suspended").length}].map(s=>(
          <Card key={s.label}><CardContent className="p-4"><p className="text-2xl font-display font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></CardContent></Card>
        ))}
      </div>
      {users.some(u=>u.status==="active"&&!u.mfa)&&(
        <div className="flex items-center gap-3 p-3 rounded-lg border border-warning/30 bg-warning/5 text-sm">
          <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0"/>
          <span className="text-xs"><strong>Sécurité :</strong> {users.filter(u=>u.status==="active"&&!u.mfa).length} utilisateur(s) actif(s) sans 2FA.</span>
        </div>
      )}
      <div className="relative max-w-sm"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/><Input placeholder="Rechercher…" className="pl-9 h-8 text-sm" value={search} onChange={e=>setSearch(e.target.value)}/></div>
      <Card><CardContent className="p-0">
        <table className="w-full text-xs">
          <thead><tr className="border-b bg-muted/30">
            <th className="text-left p-3 font-medium text-muted-foreground">Utilisateur</th>
            <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Organisation</th>
            <th className="text-center p-3 font-medium text-muted-foreground">Statut</th>
            <th className="text-center p-3 font-medium text-muted-foreground">2FA</th>
            <th className="text-right p-3 font-medium text-muted-foreground hidden lg:table-cell">Dernière connexion</th>
            <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
          </tr></thead>
          <tbody>
            {filtered.map(u=>(
              <tr key={u.id} className="border-b border-border/40 hover:bg-muted/20">
                <td className="p-3"><div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground text-[9px] font-bold flex-shrink-0">{u.name.slice(0,2).toUpperCase()}</div>
                  <div><p className="font-medium">{u.name}</p><p className="text-[10px] text-muted-foreground">{u.email}</p></div>
                </div></td>
                <td className="p-3 text-muted-foreground hidden md:table-cell">{u.org}</td>
                <td className="p-3 text-center"><Badge variant="secondary" className={`text-[9px] ${u.status==="active"?"bg-success/10 text-success":"bg-destructive/10 text-destructive"}`}>{u.status}</Badge></td>
                <td className="p-3 text-center">{u.mfa?<CheckCircle className="h-4 w-4 text-success mx-auto"/>:<XCircle className="h-4 w-4 text-muted-foreground mx-auto"/>}</td>
                <td className="p-3 text-right text-muted-foreground hidden lg:table-cell">{u.lastLogin}</td>
                <td className="p-3 text-right">
                  <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-3.5 w-3.5"/></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="text-xs">
                      <DropdownMenuItem><Shield className="h-3 w-3 mr-2"/>Réinitialiser 2FA</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive"><Ban className="h-3 w-3 mr-2"/>Suspendre</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent></Card>
    </motion.div>
  );
}
