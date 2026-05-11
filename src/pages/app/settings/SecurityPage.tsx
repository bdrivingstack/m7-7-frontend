import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Shield, Lock, Smartphone, Monitor, Globe, AlertTriangle,
  CheckCircle, XCircle, Eye, EyeOff, LogOut, Trash2,
  Key, RefreshCw, QrCode, Clock, MapPin, Wifi, Save,
  ShieldAlert, ShieldCheck, Info, Copy,
} from "lucide-react";
import { motion } from "framer-motion";

// Mock active sessions
const sessions = [
  { id: "S1", device: "Chrome · macOS", location: "Paris, France", ip: "92.184.12.x", current: true,  lastSeen: "En cours", trusted: true },
  { id: "S2", device: "Safari · iPhone 15", location: "Paris, France", ip: "92.184.12.x", current: false, lastSeen: "Il y a 2h",  trusted: true },
  { id: "S3", device: "Firefox · Windows 11", location: "Lyon, France",  ip: "78.241.55.x", current: false, lastSeen: "Hier 18:42",  trusted: false },
  { id: "S4", device: "Chrome · Android",    location: "Marseille, France", ip: "109.22.14.x", current: false, lastSeen: "Il y a 5j",  trusted: false },
];

// Mock recent security events
const securityLog = [
  { icon: CheckCircle, color: "text-success", event: "Connexion réussie",        detail: "Chrome · Paris",       time: "Aujourd'hui 09:15" },
  { icon: Shield,      color: "text-primary", event: "2FA vérifié",              detail: "Application TOTP",     time: "Aujourd'hui 09:15" },
  { icon: AlertTriangle,color:"text-warning", event: "Connexion depuis un nouvel appareil", detail: "Firefox · Lyon", time: "Hier 18:42" },
  { icon: XCircle,     color: "text-destructive", event: "Tentative de connexion échouée", detail: "Mot de passe incorrect · 3 essais", time: "Il y a 3j" },
  { icon: Key,         color: "text-muted-foreground", event: "Mot de passe modifié", detail: "Par Jean Dupont", time: "Il y a 7j" },
];

export default function SecurityPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [ssoEnabled, setSsoEnabled] = useState(false);
  const [ipWhitelist, setIpWhitelist] = useState(false);
  const [forceMfa, setForceMfa] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("8");
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [newIp, setNewIp] = useState("");

  const backupCodes = [
    "ABCD-1234", "EFGH-5678", "IJKL-9012",
    "MNOP-3456", "QRST-7890", "UVWX-2345",
    "YZAB-6789", "CDEF-0123",
  ];

  const ipList = ["92.184.12.0/24", "78.192.55.10"];

  return (
    <motion.div className="p-6 space-y-6 max-w-3xl" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-fluid-xl font-display font-bold">Sécurité</h1>
          <p className="text-sm text-muted-foreground">Protégez votre compte et contrôlez les accès</p>
        </div>
        {/* Security score */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-success/10 border border-success/20">
          <ShieldCheck className="h-5 w-5 text-success" />
          <div>
            <p className="text-xs font-bold text-success">Score : 82/100</p>
            <p className="text-[10px] text-muted-foreground">Bon niveau</p>
          </div>
        </div>
      </div>

      {/* Score breakdown */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <ShieldAlert className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold">Recommandations de sécurité</p>
          </div>
          <div className="space-y-2">
            {[
              { done: true,  label: "Authentification 2FA activée" },
              { done: true,  label: "Mot de passe fort (12+ caractères)" },
              { done: true,  label: "Sessions actives surveillées" },
              { done: false, label: "Forcer le 2FA pour tous les utilisateurs", cta: "Activer" },
              { done: false, label: "Restreindre l'accès par adresse IP", cta: "Configurer" },
              { done: false, label: "Activer le SSO / SAML pour votre domaine", cta: "En savoir plus" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 text-xs">
                {item.done
                  ? <CheckCircle className="h-3.5 w-3.5 text-success flex-shrink-0" />
                  : <AlertTriangle className="h-3.5 w-3.5 text-warning flex-shrink-0" />}
                <span className={item.done ? "text-muted-foreground line-through" : "font-medium"}>{item.label}</span>
                {!item.done && item.cta && (
                  <button className="text-primary hover:underline ml-auto">{item.cta}</button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mot de passe */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Lock className="h-4 w-4" />Mot de passe
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Mot de passe actuel</Label>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} placeholder="••••••••••••" className="h-9 text-sm pr-9" />
                <button className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Nouveau mot de passe</Label>
              <Input type="password" placeholder="••••••••••••" className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Confirmer le nouveau mot de passe</Label>
              <Input type="password" placeholder="••••••••••••" className="h-9 text-sm" />
            </div>
          </div>
          <div className="bg-muted/40 rounded-lg p-3 text-xs space-y-1.5">
            <p className="font-medium text-muted-foreground">Règles du mot de passe :</p>
            {["12 caractères minimum", "1 majuscule et 1 minuscule", "1 chiffre", "1 caractère spécial (!@#$…)"].map((rule) => (
              <div key={rule} className="flex items-center gap-1.5 text-muted-foreground">
                <CheckCircle className="h-3 w-3 text-success" />{rule}
              </div>
            ))}
          </div>
          <Button size="sm" className="gradient-primary text-primary-foreground text-xs">
            <Lock className="h-3.5 w-3.5 mr-1.5" />Modifier le mot de passe
          </Button>
        </CardContent>
      </Card>

      {/* 2FA */}
      <Card className={mfaEnabled ? "border-success/30" : "border-warning/30"}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Smartphone className="h-4 w-4" />Authentification à deux facteurs (2FA)
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={mfaEnabled ? "text-[10px] bg-success/10 text-success" : "text-[10px] bg-warning/10 text-warning"}>
                {mfaEnabled ? "Activé" : "Désactivé"}
              </Badge>
              <Switch checked={mfaEnabled} onCheckedChange={setMfaEnabled} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {mfaEnabled ? (
            <>
              <div className="flex items-center gap-3 p-3 bg-success/5 border border-success/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">2FA actif via application TOTP</p>
                  <p className="text-xs text-muted-foreground">Application : Authy · Activé le 15/01/2024</p>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" size="sm" className="text-xs">
                  <QrCode className="h-3.5 w-3.5 mr-1.5" />Reconfigurer
                </Button>
                <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowBackupCodes(!showBackupCodes)}>
                  <Key className="h-3.5 w-3.5 mr-1.5" />Codes de secours
                </Button>
              </div>

              {showBackupCodes && (
                <div className="p-4 bg-muted/30 rounded-lg border border-border/60">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold">Codes de secours (usage unique)</p>
                    <Button variant="ghost" size="sm" className="text-xs h-6">
                      <Copy className="h-3 w-3 mr-1" />Copier tout
                    </Button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {backupCodes.map((code) => (
                      <code key={code} className="text-[10px] font-mono bg-background border border-border rounded px-2 py-1 text-center">
                        {code}
                      </code>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2">
                    ⚠️ Gardez ces codes dans un endroit sûr. Chaque code ne peut être utilisé qu'une seule fois.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                La double authentification ajoute une couche de sécurité supplémentaire. En cas de vol de mot de passe, votre compte reste protégé.
              </p>
              <Button size="sm" className="gradient-primary text-primary-foreground text-xs">
                <Smartphone className="h-3.5 w-3.5 mr-1.5" />Configurer le 2FA maintenant
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Politique de session */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4" />Politique de session
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Forcer le 2FA pour tous les utilisateurs</p>
              <p className="text-xs text-muted-foreground">Tous les membres doivent activer le 2FA pour se connecter.</p>
            </div>
            <Switch checked={forceMfa} onCheckedChange={setForceMfa} />
          </div>
          <Separator />
          <div className="space-y-1.5">
            <Label className="text-xs">Délai d'expiration de session (heures)</Label>
            <div className="flex items-center gap-3">
              <Input
                type="number" value={sessionTimeout} onChange={(e) => setSessionTimeout(e.target.value)}
                className="h-9 text-sm w-24" min="1" max="720"
              />
              <p className="text-xs text-muted-foreground">Les sessions inactives expirent après ce délai.</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">SSO / SAML</p>
              <p className="text-xs text-muted-foreground">Authentification unique via votre fournisseur d'identité (Okta, Azure AD…)</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-500">Plan Expert</Badge>
              <Switch checked={ssoEnabled} onCheckedChange={setSsoEnabled} disabled />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions actives */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Monitor className="h-4 w-4" />Sessions actives
            </CardTitle>
            <Button variant="outline" size="sm" className="text-xs text-destructive border-destructive/30 hover:bg-destructive/5">
              <LogOut className="h-3.5 w-3.5 mr-1.5" />Déconnecter tout
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {sessions.map((session) => (
            <div key={session.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${session.current ? "border-primary/30 bg-primary/5" : "border-border/50 hover:bg-muted/20"}`}>
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${session.current ? "gradient-primary" : "bg-muted"}`}>
                <Monitor className={`h-4 w-4 ${session.current ? "text-primary-foreground" : "text-muted-foreground"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium">{session.device}</p>
                  {session.current && <Badge variant="secondary" className="text-[9px] bg-primary/10 text-primary">Actuelle</Badge>}
                  {!session.trusted && <Badge variant="secondary" className="text-[9px] bg-warning/10 text-warning">Nouvel appareil</Badge>}
                </div>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-0.5">
                  <span className="flex items-center gap-1"><MapPin className="h-2.5 w-2.5" />{session.location}</span>
                  <span className="flex items-center gap-1"><Wifi className="h-2.5 w-2.5" />{session.ip}</span>
                  <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5" />{session.lastSeen}</span>
                </div>
              </div>
              {!session.current && (
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive flex-shrink-0">
                  <LogOut className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* IP Whitelist */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Globe className="h-4 w-4" />Restriction par adresse IP
            </CardTitle>
            <Switch checked={ipWhitelist} onCheckedChange={setIpWhitelist} />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {ipWhitelist ? (
            <>
              <div className="p-3 rounded-lg bg-warning/5 border border-warning/20 flex items-start gap-2">
                <Info className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  Seules les adresses IP listées pourront accéder à votre compte. Assurez-vous d'inclure votre IP actuelle avant d'activer.
                </p>
              </div>
              <div className="space-y-2">
                {ipList.map((ip) => (
                  <div key={ip} className="flex items-center justify-between p-2 rounded bg-muted/30 border border-border/50">
                    <code className="text-xs font-mono">{ip}</code>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="192.168.1.0/24 ou 203.0.113.5"
                  className="h-8 text-sm font-mono flex-1"
                  value={newIp}
                  onChange={(e) => setNewIp(e.target.value)}
                />
                <Button size="sm" variant="outline" className="text-xs flex-shrink-0">Ajouter</Button>
              </div>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">
              Activez cette option pour restreindre l'accès à votre compte depuis des adresses IP spécifiques uniquement.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Journaux de sécurité */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4" />Activité de sécurité récente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-0">
          {securityLog.map((entry, i) => {
            const Icon = entry.icon;
            return (
              <div key={i} className="flex items-start gap-3 py-2.5 border-b border-border/40 last:border-0">
                <Icon className={`h-4 w-4 flex-shrink-0 mt-0.5 ${entry.color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium">{entry.event}</p>
                  <p className="text-[10px] text-muted-foreground">{entry.detail}</p>
                </div>
                <span className="text-[10px] text-muted-foreground flex-shrink-0">{entry.time}</span>
              </div>
            );
          })}
          <Button variant="ghost" size="sm" className="w-full mt-2 text-xs text-primary">
            Voir tous les journaux d'audit →
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm">Annuler</Button>
        <Button size="sm" className="gradient-primary text-primary-foreground">
          <Save className="h-3.5 w-3.5 mr-1.5" />Enregistrer
        </Button>
      </div>
    </motion.div>
  );
}
