import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Building2, Users, FileText, CreditCard, Shield, Activity, Edit, Ban, ArrowUpRight, CheckCircle, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
export default function AdminOrgDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const org = { id, name:"ACME Corp", owner:"Jean Dupont", email:"jean@acme.fr", plan:"Pro", status:"active", users:7, invoices:147, mrr:29, created:"15/01/2024", country:"France", siret:"123 456 789 00012", tva:"FR12 123456789", lastLogin:"Aujourd'hui 09:42", storageUsed:"18 Go", storageMax:"50 Go", apiCalls:1842, mfaEnabled:6 };
  const events = [
    {event:"Connexion utilisateur",detail:"jean@acme.fr · Chrome · Paris",time:"Il y a 2h",ok:true},
    {event:"Facture créée",detail:"F-2024-052 · 2 700 €",time:"Il y a 2h",ok:true},
    {event:"API call",detail:"GET /invoices · 200 OK",time:"Il y a 3h",ok:true},
    {event:"Tentative de connexion échouée",detail:"marie@acme.fr · 2 essais",time:"Hier",ok:false},
  ];
  return (
    <motion.div className="p-6 space-y-6" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={()=>navigate("/admin/organizations")}><ArrowLeft className="h-4 w-4"/></Button>
        <div className="flex-1">
          <div className="flex items-center gap-2"><h1 className="text-2xl font-display font-bold">{org.name}</h1><Badge variant="secondary" className="text-[10px] bg-success/10 text-success">{org.status}</Badge><Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">{org.plan}</Badge></div>
          <p className="text-sm text-muted-foreground">{org.id} · créé le {org.created}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-xs"><ArrowUpRight className="h-3.5 w-3.5 mr-1.5"/>Changer plan</Button>
          <Button variant="outline" size="sm" className="text-xs text-destructive border-destructive/40"><Ban className="h-3.5 w-3.5 mr-1.5"/>Suspendre</Button>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[{label:"MRR",value:`${org.mrr} €`,icon:CreditCard},{label:"Utilisateurs",value:`${org.users}`,icon:Users},{label:"Factures",value:`${org.invoices}`,icon:FileText},{label:"2FA activés",value:`${org.mfaEnabled}/${org.users}`,icon:Shield}].map(s=>(
          <Card key={s.label}><CardContent className="p-4"><s.icon className="h-4 w-4 text-muted-foreground mb-2"/><p className="text-2xl font-display font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></CardContent></Card>
        ))}
      </div>
      <Tabs defaultValue="info">
        <TabsList className="h-8 text-xs"><TabsTrigger value="info" className="text-xs">Infos</TabsTrigger><TabsTrigger value="users" className="text-xs">Utilisateurs</TabsTrigger><TabsTrigger value="activity" className="text-xs">Activité</TabsTrigger><TabsTrigger value="security" className="text-xs">Sécurité</TabsTrigger></TabsList>
        <TabsContent value="info" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Informations légales</CardTitle></CardHeader><CardContent className="space-y-2 text-xs">
              {[["Propriétaire",org.owner],["Email",org.email],["SIRET",org.siret],["N° TVA",org.tva],["Pays",org.country]].map(([k,v])=>(
                <div key={k} className="flex justify-between py-1 border-b border-border/30 last:border-0"><span className="text-muted-foreground">{k}</span><span className="font-medium">{v}</span></div>
              ))}
            </CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Utilisation</CardTitle></CardHeader><CardContent className="space-y-3 text-xs">
              <div><div className="flex justify-between mb-1"><span className="text-muted-foreground">Stockage</span><span>{org.storageUsed} / {org.storageMax}</span></div>
                <div className="h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{width:"36%"}}/></div>
              </div>
              {[["API calls ce mois",org.apiCalls.toLocaleString()],["Dernière connexion",org.lastLogin]].map(([k,v])=>(
                <div key={k} className="flex justify-between py-1 border-b border-border/30 last:border-0"><span className="text-muted-foreground">{k}</span><span className="font-medium">{v}</span></div>
              ))}
            </CardContent></Card>
          </div>
        </TabsContent>
        <TabsContent value="activity" className="mt-4">
          <Card><CardContent className="p-0">
            <div className="divide-y divide-border/40">
              {events.map((e,i)=>(
                <div key={i} className="flex items-center gap-3 p-3 text-xs">
                  {e.ok?<CheckCircle className="h-4 w-4 text-success flex-shrink-0"/>:<AlertTriangle className="h-4 w-4 text-warning flex-shrink-0"/>}
                  <div className="flex-1"><p className="font-medium">{e.event}</p><p className="text-muted-foreground">{e.detail}</p></div>
                  <span className="text-muted-foreground">{e.time}</span>
                </div>
              ))}
            </div>
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="security" className="mt-4">
          <Card><CardContent className="p-4 space-y-2 text-xs">
            {[{ok:true,label:`2FA actif : ${org.mfaEnabled}/${org.users} utilisateurs`},{ok:true,label:"Aucune tentative de connexion suspecte (7j)"},{ok:org.mfaEnabled===org.users,label:"Tous les utilisateurs ont le 2FA activé"},{ok:false,label:"1 utilisateur n'a pas de 2FA"}].map((c,i)=>(
              <div key={i} className={`flex items-center gap-2 p-2.5 rounded-lg border ${c.ok?"border-success/20 bg-success/5":"border-warning/20 bg-warning/5"}`}>
                {c.ok?<CheckCircle className="h-3.5 w-3.5 text-success flex-shrink-0"/>:<AlertTriangle className="h-3.5 w-3.5 text-warning flex-shrink-0"/>}
                <span className={c.ok?"text-muted-foreground":"font-medium"}>{c.label}</span>
              </div>
            ))}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
