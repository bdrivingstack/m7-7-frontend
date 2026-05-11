import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { User, Camera, Mail, Phone, Globe, Save, Trash2, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const [form, setForm] = useState({
    firstName: "Jean", lastName: "Dupont", email: "jean.dupont@acme.fr",
    phone: "+33 6 12 34 56 78", jobTitle: "Gérant", website: "https://acme.fr",
    bio: "Fondateur et gérant d'une ESN spécialisée en développement web et conseil digital.",
    language: "fr", timezone: "Europe/Paris", dateFormat: "DD/MM/YYYY",
  });

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

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
                JD
              </div>
              <button className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-background border-2 border-border flex items-center justify-center hover:bg-muted transition-colors">
                <Camera className="h-3 w-3" />
              </button>
            </div>
            <div>
              <p className="font-semibold">{form.firstName} {form.lastName}</p>
              <p className="text-sm text-muted-foreground">{form.jobTitle}</p>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm" className="text-xs h-7">Changer la photo</Button>
                <Button variant="ghost" size="sm" className="text-xs h-7 text-destructive">Supprimer</Button>
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
              <Input value={form.firstName} onChange={(e) => set("firstName", e.target.value)} className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Nom</Label>
              <Input value={form.lastName} onChange={(e) => set("lastName", e.target.value)} className="h-9 text-sm" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1.5"><Mail className="h-3 w-3" />Email</Label>
            <div className="flex gap-2">
              <Input value={form.email} onChange={(e) => set("email", e.target.value)} className="h-9 text-sm flex-1" />
              <Badge variant="secondary" className="text-[10px] bg-success/10 text-success px-2 flex-shrink-0">Vérifié</Badge>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1.5"><Phone className="h-3 w-3" />Téléphone</Label>
            <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} className="h-9 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Fonction / Titre</Label>
            <Input value={form.jobTitle} onChange={(e) => set("jobTitle", e.target.value)} className="h-9 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs flex items-center gap-1.5"><Globe className="h-3 w-3" />Site web</Label>
            <Input value={form.website} onChange={(e) => set("website", e.target.value)} className="h-9 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Bio courte</Label>
            <textarea
              value={form.bio}
              onChange={(e) => set("bio", e.target.value)}
              className="w-full text-sm border border-input rounded-md p-2.5 bg-background resize-none focus:outline-none focus:ring-1 focus:ring-ring"
              rows={3}
            />
            <p className="text-[10px] text-muted-foreground text-right">{form.bio.length}/200</p>
          </div>
        </CardContent>
      </Card>

      {/* Préférences */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Préférences d'affichage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Langue</Label>
              <select className="w-full h-9 text-sm border border-input rounded-md px-2.5 bg-background focus:outline-none focus:ring-1 focus:ring-ring">
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Fuseau horaire</Label>
              <select className="w-full h-9 text-sm border border-input rounded-md px-2.5 bg-background focus:outline-none focus:ring-1 focus:ring-ring">
                <option>Europe/Paris</option>
                <option>Europe/London</option>
                <option>America/New_York</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Format date</Label>
              <select className="w-full h-9 text-sm border border-input rounded-md px-2.5 bg-background focus:outline-none focus:ring-1 focus:ring-ring">
                <option>DD/MM/YYYY</option>
                <option>MM/DD/YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Zone danger */}
      <Card className="border-destructive/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-destructive flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />Zone de danger
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/20">
            <div>
              <p className="text-sm font-medium">Supprimer mon compte</p>
              <p className="text-xs text-muted-foreground">Cette action est irréversible. Toutes vos données seront effacées.</p>
            </div>
            <Button variant="outline" size="sm" className="text-xs text-destructive border-destructive/40 hover:bg-destructive/10 flex-shrink-0">
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />Supprimer
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm">Annuler</Button>
        <Button size="sm" className="gradient-primary text-primary-foreground">
          <Save className="h-3.5 w-3.5 mr-1.5" />Enregistrer les modifications
        </Button>
      </div>
    </motion.div>
  );
}
