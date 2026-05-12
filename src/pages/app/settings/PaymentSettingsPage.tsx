import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Landmark, CreditCard, Save, CheckCircle, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
const methods = [
  {id:"virement",label:"Virement bancaire",desc:"Affiche votre IBAN sur les factures",enabled:true,icon:"🏦"},
  {id:"stripe",label:"Paiement en ligne (Stripe)",desc:"Lien de paiement CB sur les factures",enabled:true,icon:"💳"},
  {id:"prelevement",label:"Prélèvement SEPA",desc:"Via GoCardless pour les contrats récurrents",enabled:false,icon:"🔄"},
  {id:"cheque",label:"Chèque",desc:"Mention de l'ordre à renseigner",enabled:false,icon:"📄"},
];
export default function PaymentSettingsPage() {
  const [enabled, setEnabled] = useState<Record<string,boolean>>(Object.fromEntries(methods.map(m=>[m.id,m.enabled])));
  return (
    <motion.div className="p-6 space-y-6 max-w-2xl" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>
      <div><h1 className="text-fluid-xl font-display font-bold">Moyens de paiement</h1>
        <p className="text-sm text-muted-foreground">Configurez les modes de règlement proposés à vos clients</p>
      </div>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Landmark className="h-4 w-4"/>Coordonnées bancaires (RIB)</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 rounded-lg border border-dashed border-border/60 bg-muted/20 text-center space-y-2">
            <Landmark className="h-6 w-6 text-muted-foreground/50 mx-auto" />
            <p className="text-xs text-muted-foreground">Aucun compte bancaire configuré.</p>
            <p className="text-[10px] text-muted-foreground">Connectez Qonto ou renseignez votre IBAN dans les paramètres de l'entreprise.</p>
          </div>
          <Button variant="outline" size="sm" className="text-xs"><Plus className="h-3.5 w-3.5 mr-1.5"/>Ajouter un compte</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Modes de règlement acceptés</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {methods.map((m) => (
            <div key={m.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/20 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-xl">{m.icon}</span>
                <div><p className="text-sm font-medium">{m.label}</p><p className="text-xs text-muted-foreground">{m.desc}</p></div>
              </div>
              <Switch checked={enabled[m.id]} onCheckedChange={(v)=>setEnabled(p=>({...p,[m.id]:v}))}/>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Conditions de paiement par défaut</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label className="text-xs">Délai de paiement</Label>
              <select className="w-full h-9 text-sm border border-input rounded-md px-2.5 bg-background">
                <option>30 jours</option><option>45 jours</option><option>60 jours</option><option>À réception</option>
              </select>
            </div>
            <div className="space-y-1.5"><Label className="text-xs">Pénalités de retard</Label><Input defaultValue="3 fois le taux légal" className="h-9 text-sm"/></div>
          </div>
          <div className="space-y-1.5"><Label className="text-xs">Mention légale paiement</Label>
            <textarea defaultValue="En cas de retard de paiement, des pénalités de retard au taux de 3 fois le taux légal seront appliquées, ainsi qu'une indemnité forfaitaire de recouvrement de 40 €." className="w-full text-sm border border-input rounded-md p-2.5 bg-background resize-none focus:outline-none focus:ring-1 focus:ring-ring" rows={3}/>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm">Annuler</Button>
        <Button size="sm" className="gradient-primary text-primary-foreground"><Save className="h-3.5 w-3.5 mr-1.5"/>Enregistrer</Button>
      </div>
    </motion.div>
  );
}
