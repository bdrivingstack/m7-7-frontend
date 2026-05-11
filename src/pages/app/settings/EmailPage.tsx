import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Send, CheckCircle, Save, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
export default function EmailPage() {
  const [smtpCustom, setSmtpCustom] = useState(false);
  const [signature, setSignature] = useState("Cordialement,\n\nJean Dupont\nMon Entreprise SAS\n+33 6 12 34 56 78");
  return (
    <motion.div className="p-6 space-y-6 max-w-2xl" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>
      <div><h1 className="text-fluid-xl font-display font-bold">Configuration email</h1>
        <p className="text-sm text-muted-foreground">Paramétrez l'envoi de vos factures, devis et relances</p>
      </div>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Mail className="h-4 w-4"/>Expéditeur</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label className="text-xs">Nom d'expéditeur</Label><Input defaultValue="Mon Entreprise SAS" className="h-9 text-sm"/></div>
            <div className="space-y-1.5"><Label className="text-xs">Email d'expédition</Label>
              <div className="flex gap-2"><Input defaultValue="facturation@monentreprise.fr" className="h-9 text-sm flex-1"/>
                <Badge variant="secondary" className="text-[10px] bg-success/10 text-success px-2 flex-shrink-0 self-center">Vérifié</Badge>
              </div>
            </div>
          </div>
          <div className="space-y-1.5"><Label className="text-xs">Email de réponse (reply-to)</Label><Input defaultValue="contact@monentreprise.fr" className="h-9 text-sm"/></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Serveur SMTP personnalisé</CardTitle>
            <Switch checked={smtpCustom} onCheckedChange={setSmtpCustom}/>
          </div>
        </CardHeader>
        {smtpCustom && <CardContent className="space-y-4">
          <div className="p-3 rounded-lg bg-muted/40 text-xs text-muted-foreground flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 text-warning mt-0.5"/>
            Assurez-vous que votre serveur SMTP supporte TLS/STARTTLS. Désactivez-le pour utiliser notre infrastructure sécurisée.
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2"><Label className="text-xs">Hôte SMTP</Label><Input placeholder="smtp.votredomaine.fr" className="h-9 text-sm"/></div>
            <div className="space-y-1.5"><Label className="text-xs">Port</Label><Input placeholder="587" className="h-9 text-sm"/></div>
            <div className="space-y-1.5"><Label className="text-xs">Sécurité</Label>
              <select className="w-full h-9 text-sm border border-input rounded-md px-2.5 bg-background"><option>STARTTLS</option><option>TLS</option><option>Aucune</option></select>
            </div>
            <div className="space-y-1.5"><Label className="text-xs">Identifiant</Label><Input placeholder="user@domaine.fr" className="h-9 text-sm"/></div>
            <div className="space-y-1.5"><Label className="text-xs">Mot de passe</Label><Input type="password" placeholder="••••••••" className="h-9 text-sm"/></div>
          </div>
          <Button variant="outline" size="sm" className="text-xs"><Send className="h-3.5 w-3.5 mr-1.5"/>Tester la connexion</Button>
        </CardContent>}
      </Card>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Signature email</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Textarea value={signature} onChange={(e)=>setSignature(e.target.value)} rows={5} className="text-sm font-mono"/>
          <p className="text-xs text-muted-foreground">Cette signature sera ajoutée automatiquement à tous vos emails sortants.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Notifications automatiques</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[
            {label:"Confirmation d'envoi de facture",sub:"Recevez une copie à chaque facture envoyée"},
            {label:"Alerte paiement reçu",sub:"Notification quand un client paie"},
            {label:"Résumé hebdomadaire",sub:"Synthèse des factures et paiements le lundi"},
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div><p className="text-sm font-medium">{item.label}</p><p className="text-xs text-muted-foreground">{item.sub}</p></div>
              <Switch defaultChecked/>
            </div>
          ))}
        </CardContent>
      </Card>
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm">Annuler</Button>
        <Button size="sm" className="gradient-primary text-primary-foreground"><Save className="h-3.5 w-3.5 mr-1.5"/>Enregistrer</Button>
      </div>
    </motion.div>
  );
}
