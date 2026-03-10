import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { User, Lock, Shield, Smartphone, Eye, EyeOff, CheckCircle, AlertTriangle, Save, LogOut, Clock, Monitor, MapPin } from "lucide-react";
import { motion } from "framer-motion";
const sessions = [
  {device:"Chrome · macOS",location:"Paris, France",current:true,lastSeen:"En cours"},
  {device:"Safari · iPhone",location:"Paris, France",current:false,lastSeen:"Il y a 3h"},
];
export default function PortalProfilePage() {
  const [showPwd, setShowPwd] = useState(false);
  const [mfa, setMfa] = useState(true);
  const [notif, setNotif] = useState({email:true, sms:false});
  return (
    <motion.div className="space-y-6 max-w-xl" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>
      <div><h1 className="text-xl font-display font-bold">Mon profil</h1><p className="text-sm text-muted-foreground">Gérez vos informations et votre sécurité</p></div>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><User className="h-4 w-4"/>Informations</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center text-primary-foreground text-xl font-bold shadow-glow">JD</div>
            <div><p className="font-semibold">Jean Dupont</p><p className="text-sm text-muted-foreground">jean@acme.fr</p><Badge variant="secondary" className="text-[10px] bg-success/10 text-success mt-1">Email vérifié</Badge></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label className="text-xs">Prénom</Label><Input defaultValue="Jean" className="h-9 text-sm"/></div>
            <div className="space-y-1.5"><Label className="text-xs">Nom</Label><Input defaultValue="Dupont" className="h-9 text-sm"/></div>
            <div className="space-y-1.5 col-span-2"><Label className="text-xs">Email</Label><Input defaultValue="jean@acme.fr" className="h-9 text-sm" type="email"/></div>
            <div className="space-y-1.5"><Label className="text-xs">Téléphone</Label><Input defaultValue="+33 6 12 34 56 78" className="h-9 text-sm"/></div>
          </div>
          <Button size="sm" className="gradient-primary text-primary-foreground text-xs"><Save className="h-3.5 w-3.5 mr-1.5"/>Enregistrer</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Lock className="h-4 w-4"/>Mot de passe</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {["Mot de passe actuel","Nouveau mot de passe","Confirmer le nouveau"].map((label,i)=>(
            <div key={i} className="space-y-1.5"><Label className="text-xs">{label}</Label>
              <div className="relative"><Input type={showPwd?"text":"password"} placeholder="••••••••" className="h-9 text-sm pr-9"/>
                {i===0&&<button onClick={()=>setShowPwd(!showPwd)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">{showPwd?<EyeOff className="h-4 w-4"/>:<Eye className="h-4 w-4"/>}</button>}
              </div>
            </div>
          ))}
          <Button size="sm" variant="outline" className="text-xs"><Lock className="h-3.5 w-3.5 mr-1.5"/>Modifier</Button>
        </CardContent>
      </Card>
      <Card className={mfa?"border-success/30":""}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2"><Smartphone className="h-4 w-4"/>Double authentification (2FA)</CardTitle>
            <Switch checked={mfa} onCheckedChange={setMfa}/>
          </div>
        </CardHeader>
        <CardContent>
          {mfa?<div className="flex items-center gap-2 text-xs p-2.5 rounded-lg bg-success/5 border border-success/20"><CheckCircle className="h-4 w-4 text-success flex-shrink-0"/><span className="text-success font-medium">2FA actif — votre compte est protégé</span></div>
          :<div className="flex items-start gap-2 text-xs p-2.5 rounded-lg bg-warning/5 border border-warning/20"><AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5"/><span className="text-warning">Activez le 2FA pour mieux sécuriser votre accès.</span></div>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Monitor className="h-4 w-4"/>Sessions actives</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {sessions.map((s,i)=>(
            <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border ${s.current?"border-primary/30 bg-primary/5":"border-border/50"}`}>
              <Monitor className={`h-4 w-4 flex-shrink-0 ${s.current?"text-primary":"text-muted-foreground"}`}/>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><p className="text-xs font-medium">{s.device}</p>{s.current&&<Badge variant="secondary" className="text-[9px] bg-primary/10 text-primary">Actuelle</Badge>}</div>
                <p className="text-[10px] text-muted-foreground flex items-center gap-2"><MapPin className="h-2.5 w-2.5"/>{s.location} · <Clock className="h-2.5 w-2.5"/>{s.lastSeen}</p>
              </div>
              {!s.current&&<Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"><LogOut className="h-3.5 w-3.5"/></Button>}
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Notifications</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[{key:"email",label:"Email",desc:"Factures, devis et paiements par email"},{key:"sms",label:"SMS",desc:"Alertes de paiement par SMS"}].map(item=>(
            <div key={item.key} className="flex items-center justify-between">
              <div><p className="text-sm font-medium">{item.label}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div>
              <Switch checked={notif[item.key as "email"|"sms"]} onCheckedChange={v=>setNotif(p=>({...p,[item.key]:v}))}/>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}
