import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Edit, CheckCircle, Save, Users, Zap } from "lucide-react";
import { motion } from "framer-motion";
const plans = [
  {id:"micro",name:"Micro",price:9,users:1,storage:"5 Go",ai:false,api:false,sso:false,subscribers:234,color:"text-muted-foreground"},
  {id:"pro",name:"Pro",price:29,users:10,storage:"50 Go",ai:true,api:true,sso:false,subscribers:891,color:"text-primary"},
  {id:"business",name:"Business",price:79,users:50,storage:"200 Go",ai:true,api:true,sso:true,subscribers:147,color:"text-violet-600"},
  {id:"expert",name:"Expert",price:499,users:999,storage:"1 To",ai:true,api:true,sso:true,subscribers:23,color:"text-amber-600"},
];
export default function AdminPlansPage() {
  return (
    <motion.div className="p-6 space-y-6" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-display font-bold">Plans & Tarification</h1><p className="text-sm text-muted-foreground">Configuration des offres et limites</p></div>
        <Button size="sm" className="gradient-primary text-primary-foreground text-xs"><Save className="h-3.5 w-3.5 mr-1.5"/>Enregistrer</Button>
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        {plans.map(plan=>(
          <Card key={plan.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className={`text-sm font-bold ${plan.color}`}>{plan.name}</CardTitle>
                <Badge variant="secondary" className="text-[10px]"><Users className="h-2.5 w-2.5 mr-1"/>{plan.subscribers} abonnés</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5"><Label className="text-[10px]">Prix mensuel (€)</Label><Input defaultValue={plan.price} type="number" className="h-8 text-sm"/></div>
              <div className="space-y-1.5"><Label className="text-[10px]">Utilisateurs max</Label><Input defaultValue={plan.users===999?"Illimité":plan.users} className="h-8 text-sm"/></div>
              <div className="space-y-1.5"><Label className="text-[10px]">Stockage</Label><Input defaultValue={plan.storage} className="h-8 text-sm"/></div>
              <div className="space-y-1.5">
                <Label className="text-[10px]">Fonctionnalités</Label>
                {[{label:"IA intégrée",val:plan.ai},{label:"Accès API",val:plan.api},{label:"SSO / SAML",val:plan.sso}].map(f=>(
                  <div key={f.label} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{f.label}</span>
                    <input type="checkbox" defaultChecked={f.val} className="rounded"/>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-border/40 text-xs">
                <p className="text-muted-foreground">MRR :</p>
                <p className="font-bold text-base">{(plan.price*plan.subscribers).toLocaleString()} €</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}
