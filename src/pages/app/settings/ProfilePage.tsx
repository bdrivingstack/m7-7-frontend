import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { User, Camera, Mail, Phone, Globe, Save, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useApi } from "@/hooks/useApi";
import { toast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const { data: meData, loading } = useApi<any>("/api/users/me");
  const me = meData?.data;

  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [email,     setEmail]     = useState("");
  const [phone,     setPhone]     = useState("");
  const [timezone,  setTimezone]  = useState("Europe/Paris");
  const [saving,    setSaving]    = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword,     setNewPassword]     = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPwd,     setChangingPwd]     = useState(false);

  useEffect(() => {
    if (!me) return;
    setFirstName(me.firstName ?? "");
    setLastName(me.lastName  ?? "");
    setEmail(me.email        ?? "");
    setPhone(me.phone        ?? "");
    setTimezone(me.timezone  ?? "Europe/Paris");
  }, [me]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL ?? ""}/api/users/me`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, phone, timezone }),
      });
      if (res.ok) {
        toast({ title: "Profil mis à jour", description: "Vos informations ont été enregistrées." });
      } else {
        const err = await res.json().catch(() => ({}));
        toast({ title: "Erreur", description: err?.message ?? "Impossible d'enregistrer.", variant: "destructive" });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({ title: "Erreur", description: "Les mots de passe ne correspondent pas.", variant: "destructive" });
      return;
    }
    setChangingPwd(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL ?? ""}/api/users/me/change-password`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: "Mot de passe modifié", description: data.message ?? "Reconnectez-vous avec votre nouveau mot de passe." });
        setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      } else {
        toast({ title: "Erreur", description: data?.message ?? "Impossible de modifier le mot de passe.", variant: "destructive" });
      }
    } finally {
      setChangingPwd(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const initials = `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "?";

  return (
    <motion.div className="p-6 space-y-6 max-w-2xl" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div>
        <h1 className="text-fluid-xl font-display font-bold">Mon profil</h1>
        <p className="text-sm text-muted-foreground">Informations personnelles et préférences</p>
      </div>

      {/* Avatar */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="h-20 w-20 rounded-2xl gradient-primary flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-glow">
                {initials}
              </div>
              <button className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-background border-2 border-border flex items-center justify-center hover:bg-muted transition-colors">
                <Camera className="h-3 w-3" />
              </button>
            </div>
            <div>
              <p className="font-semibold">{firstName} {lastName}</p>
              <p className="text-sm text-muted-foreground">{me?.role ?? ""}</p>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm" className="text-xs h-7"
                  onClick={() => toast({ title: "Bientôt disponible", description: "L'upload de photo de profil sera disponible prochainement." })}>
                  Changer la photo
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Infos personnelles */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <User className="h-4 w-4" />Informations personnelles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Prénom</Label>
              <Input value={firstName} onChange={e => setFirstName(e.target.value)} className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Nom</Label>
              <Input value={lastName} onChange={e => setLastName(e.target.value)} className="h-9 text-sm" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1.5"><Mail className="h-3 w-3" />Email</Label>
            <div className="flex gap-2">
              <Input value={email} disabled className="h-9 text-sm flex-1 opacity-70" />
              {me?.isVerified
                ? <Badge variant="secondary" className="text-[10px] bg-success/10 text-success px-2 flex-shrink-0">Vérifié</Badge>
                : <Badge variant="secondary" className="text-[10px] bg-warning/10 text-warning px-2 flex-shrink-0">Non vérifié</Badge>}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1.5"><Phone className="h-3 w-3" />Téléphone</Label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} className="h-9 text-sm" placeholder="+33 6 12 34 56 78" />
          </div>
        </CardContent>
      </Card>

      {/* Préférences */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Préférences d'affichage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Langue</Label>
              <select className="w-full h-9 text-sm border border-input rounded-md px-2.5 bg-background focus:outline-none focus:ring-1 focus:ring-ring">
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Fuseau horaire</Label>
              <select
                className="w-full h-9 text-sm border border-input rounded-md px-2.5 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
              >
                <option value="Europe/Paris">Europe/Paris</option>
                <option value="Europe/London">Europe/London</option>
                <option value="America/New_York">America/New_York</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mot de passe */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Changer le mot de passe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Mot de passe actuel</Label>
              <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="h-9 text-sm" placeholder="••••••••••••" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Nouveau mot de passe</Label>
              <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="h-9 text-sm" placeholder="••••••••••••" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Confirmer</Label>
              <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="h-9 text-sm" placeholder="••••••••••••" />
            </div>
          </div>
          <div className="bg-muted/40 rounded-lg p-3 text-xs space-y-1">
            <p className="font-medium text-muted-foreground">Règles :</p>
            {["12 caractères minimum","1 majuscule et 1 minuscule","1 chiffre","1 caractère spécial (!@#$…)"].map(r => (
              <div key={r} className="flex items-center gap-1.5 text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 flex-shrink-0" />{r}
              </div>
            ))}
          </div>
          <Button size="sm" className="gradient-primary text-primary-foreground text-xs"
            disabled={changingPwd || !currentPassword || !newPassword}
            onClick={handleChangePassword}>
            {changingPwd ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
            Modifier le mot de passe
          </Button>
        </CardContent>
      </Card>

      {/* Zone danger */}
      <Card className="border-destructive/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-destructive flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />Zone de danger
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/20">
            <div>
              <p className="text-sm font-medium">Supprimer mon compte</p>
              <p className="text-xs text-muted-foreground">Cette action est irréversible. Toutes vos données seront effacées.</p>
            </div>
            <Button variant="outline" size="sm" className="text-xs text-destructive border-destructive/40 hover:bg-destructive/10 flex-shrink-0"
              onClick={() => toast({ title: "Contactez le support", description: "Pour supprimer votre compte, contactez support@m7app.fr", variant: "destructive" })}>
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />Supprimer
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm">Annuler</Button>
        <Button size="sm" className="gradient-primary text-primary-foreground" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
          Enregistrer les modifications
        </Button>
      </div>
    </motion.div>
  );
}
