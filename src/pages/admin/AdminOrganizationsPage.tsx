import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Building2, Search, Plus, MoreHorizontal, Eye, Ban, ArrowUpRight, Filter } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
const orgs = [
  { id:"T1847", name:"ACME Corp", owner:"jean@acme.fr", plan:"Pro", users:7, invoices:147, mrr:29, status:"active", created:"15/01/2024" },
  { id:"T1203", name:"Bernard & Fils", owner:"p.bernard@bf.fr", plan:"Business", users:23, invoices:892, mrr:79, status:"active", created:"03/11/2023" },
  { id:"T2201", name:"Dubois SAS", owner:"thomas@dubois.fr", plan:"Micro", users:1, invoices:34, mrr:9, status:"suspended", created:"20/02/2024" },
  { id:"T0891", name:"Tech Solutions", owner:"admin@techsol.fr", plan:"Expert", users:87, invoices:3421, mrr:499, status:"active", created:"01/06/2023" },
  { id:"T3301", name:"Marie Design", owner:"marie@mdesign.fr", plan:"Pro", users:3, invoices:78, mrr:29, status:"active", created:"08/03/2024" },
  { id:"T2788", name:"Freelance Studio", owner:"studio@free.fr", plan:"Micro", users:1, invoices:12, mrr:9, status:"trial", created:"07/03/2024" },
];
const planColors: Record<string,string> = { Micro:"bg-muted text-muted-foreground", Pro:"bg-primary/10 text-primary", Business:"bg-violet-500/10 text-violet-600", Expert:"bg-amber-500/10 text-amber-600" };
const statusColors: Record<string,string> = { active:"bg-success/10 text-success", suspended:"bg-destructive/10 text-destructive", trial:"bg-blue-500/10 text-blue-500" };
export default function AdminOrganizationsPage() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const filtered = orgs.filter(o => !search || o.name.toLowerCase().includes(search.toLowerCase()) || o.owner.toLowerCase().includes(search.toLowerCase()));
  const totalMrr = orgs.reduce((a,o)=>a+o.mrr,0);
  return (
    <motion.div className="p-6 space-y-6" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-display font-bold">Organisations</h1><p className="text-sm text-muted-foreground">Tous les tenants de la plateforme</p></div>
        <Button size="sm" className="gradient-primary text-primary-foreground text-xs"><Plus className="h-3.5 w-3.5 mr-1.5"/>Créer</Button>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {[{label:"Total orgs",value:orgs.length},{label:"Actives",value:orgs.filter(o=>o.status==="active").length},{label:"Essai",value:orgs.filter(o=>o.status==="trial").length},{label:"MRR total",value:`${totalMrr} €`}].map(s=>(
          <Card key={s.label}><CardContent className="p-4"><p className="text-2xl font-display font-bold">{s.value}</p><p className="text-xs text-muted-foreground mt-0.5">{s.label}</p></CardContent></Card>
        ))}
      </div>
      <div className="relative max-w-sm"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/><Input placeholder="Rechercher…" className="pl-9 h-8 text-sm" value={search} onChange={e=>setSearch(e.target.value)}/></div>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-xs">
            <thead><tr className="border-b bg-muted/30">
              <th className="text-left p-3 font-medium text-muted-foreground">Organisation</th>
              <th className="text-center p-3 font-medium text-muted-foreground">Plan</th>
              <th className="text-center p-3 font-medium text-muted-foreground hidden sm:table-cell">Statut</th>
              <th className="text-right p-3 font-medium text-muted-foreground hidden md:table-cell">Utilisateurs</th>
              <th className="text-right p-3 font-medium text-muted-foreground hidden lg:table-cell">Factures</th>
              <th className="text-right p-3 font-medium text-muted-foreground">MRR</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map(org=>(
                <tr key={org.id} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                  <td className="p-3"><div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0"><Building2 className="h-4 w-4 text-muted-foreground"/></div>
                    <div><p className="font-semibold">{org.name}</p><p className="text-[10px] text-muted-foreground">{org.owner} · {org.id}</p></div>
                  </div></td>
                  <td className="p-3 text-center"><Badge variant="secondary" className={`text-[10px] ${planColors[org.plan]}`}>{org.plan}</Badge></td>
                  <td className="p-3 text-center hidden sm:table-cell"><Badge variant="secondary" className={`text-[10px] ${statusColors[org.status]}`}>{org.status}</Badge></td>
                  <td className="p-3 text-right hidden md:table-cell">{org.users}</td>
                  <td className="p-3 text-right hidden lg:table-cell">{org.invoices}</td>
                  <td className="p-3 text-right font-semibold">{org.mrr} €</td>
                  <td className="p-3 text-right">
                    <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-3.5 w-3.5"/></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="text-xs">
                        <DropdownMenuItem onClick={()=>navigate(`/admin/organizations/${org.id}`)}><Eye className="h-3 w-3 mr-2"/>Voir le détail</DropdownMenuItem>
                        <DropdownMenuItem><ArrowUpRight className="h-3 w-3 mr-2"/>Changer de plan</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive"><Ban className="h-3 w-3 mr-2"/>Suspendre</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
