import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, Save, Shield, Mail, Globe, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
export default function AdminSettingsPage() {
  return (
    <motion.div className="p-6 space-y-6 max-w-2xl" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>
      <div><h1 className="text-2xl font-display font-bold">Paramètres backoffice</h1><p className="text-sm text-muted-foreground">Configuration globale de la plateforme</p></div>
      <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20 text-xs flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5"/>
        <span>Ces paramètres affectent <strong>tous les tenants</strong> de la plateforme. Toute modification est auditée.</span>
      </div>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Globe className="h-4 w-4"/>Plateforme</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5"><Label className="text-xs">Nom de la plateforme</Label><Input defaultValue="LE BELVEDERE" className="h-9 text-sm"/></div>
          <div className="space-y-1.5"><Label className="text-xs">URL principale</Label><Input defaultValue="https://app.m7seven.app" className="h-9 text-sm font-mono"/></div>
          <div className="space-y-1.5"><Label className="text-xs">URL portail client</Label><Input defaultValue="https://portal.m7seven.app" className="h-9 text-sm font-mono"/></div>
          {[{label:"Mode maintenance",desc:"Bloque l'accès aux tenants (admin uniquement)"},{label:"Inscription publique",desc:"Permet la création de nouveaux comptes"},{label:"Période d'essai gratuite",desc:"14 jours sans CB"}].map(item=>(
            <div key={item.label} className="flex items-center justify-between">
              <div><p className="text-sm font-medium">{item.label}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div>
              <Switch defaultChecked={item.label!=="Mode maintenance"}/>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Shield className="h-4 w-4"/>Sécurité globale</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {[{label:"Forcer HTTPS partout",desc:"Redirection automatique HTTP → HTTPS",def:true},{label:"2FA obligatoire pour tous les admins",desc:"Les comptes admin sans 2FA sont bloqués",def:true},{label:"Rotation des sessions (24h)",desc:"Force la reconnexion après 24h d'inactivité",def:true},{label:"Bloquer les TOR / proxies connus",desc:"Blacklist Cloudflare activée",def:false}].map(item=>(
            <div key={item.label} className="flex items-center justify-between">
              <div><p className="text-sm font-medium">{item.label}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div>
              <Switch defaultChecked={item.def}/>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Mail className="h-4 w-4"/>Email système</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5"><Label className="text-xs">Email expéditeur système</Label><Input defaultValue="no-reply@m7seven.app" className="h-9 text-sm"/></div>
          <div className="space-y-1.5"><Label className="text-xs">Email alerte sécurité</Label><Input defaultValue="security@m7seven.app" className="h-9 text-sm"/></div>
        </CardContent>
      </Card>
      <div className="flex justify-end"><Button size="sm" className="gradient-primary text-primary-foreground"><Save className="h-3.5 w-3.5 mr-1.5"/>Enregistrer</Button></div>
    </motion.div>
  );
}
