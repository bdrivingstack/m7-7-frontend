import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, MapPin, FileText, Euro, Save } from "lucide-react";
import { motion } from "framer-motion";

export default function CompanyPage() {
  const [form, setForm] = useState({
    name: "Mon Entreprise SAS", legalForm: "SAS", siret: "123 456 789 00012",
    tvaNumber: "FR12 123456789", rcs: "Paris B 123 456 789",
    capital: "10 000", naf: "6201Z",
    address: "12 Rue de la Paix", city: "Paris", zip: "75001", country: "France",
    phone: "+33 1 23 45 67 89", email: "contact@monentreprise.fr", website: "https://monentreprise.fr",
    iban: "FR76 3000 6000 0112 3456 7890 189", bic: "BNPAFRPP",
    bankName: "BNP Paribas",
  });
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <motion.div className="p-6 space-y-6 max-w-2xl" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div>
        <h1 className="text-fluid-xl font-display font-bold">Entreprise</h1>
        <p className="text-sm text-muted-foreground">Informations légales et coordonnées de votre société</p>
      </div>

      {/* Logo */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted/30">
              <Building2 className="h-7 w-7 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">Logo de l'entreprise</p>
              <p className="text-xs text-muted-foreground">PNG, JPG ou SVG · max 2 Mo · 400×400px recommandé</p>
              <Button variant="outline" size="sm" className="mt-2 text-xs h-7">Télécharger un logo</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Infos légales */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4" />Informations légales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2">
              <Label className="text-xs">Dénomination sociale</Label>
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Forme juridique</Label>
              <select className="w-full h-9 text-sm border border-input rounded-md px-2.5 bg-background focus:outline-none focus:ring-1 focus:ring-ring">
                {["SAS", "SARL", "EURL", "SA", "EI", "Auto-entrepreneur", "Autre"].map((f) => (
                  <option key={f} selected={form.legalForm === f}>{f}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Capital social</Label>
              <div className="relative">
                <Input value={form.capital} onChange={(e) => set("capital", e.target.value)} className="h-9 text-sm pr-6" />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">€</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">SIRET</Label>
              <Input value={form.siret} onChange={(e) => set("siret", e.target.value)} className="h-9 text-sm font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">N° TVA intracommunautaire</Label>
              <Input value={form.tvaNumber} onChange={(e) => set("tvaNumber", e.target.value)} className="h-9 text-sm font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">RCS</Label>
              <Input value={form.rcs} onChange={(e) => set("rcs", e.target.value)} className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Code NAF / APE</Label>
              <Input value={form.naf} onChange={(e) => set("naf", e.target.value)} className="h-9 text-sm font-mono" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Adresse */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <MapPin className="h-4 w-4" />Adresse du siège social
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Adresse</Label>
            <Input value={form.address} onChange={(e) => set("address", e.target.value)} className="h-9 text-sm" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Code postal</Label>
              <Input value={form.zip} onChange={(e) => set("zip", e.target.value)} className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Ville</Label>
              <Input value={form.city} onChange={(e) => set("city", e.target.value)} className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Pays</Label>
              <Input value={form.country} onChange={(e) => set("country", e.target.value)} className="h-9 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Téléphone</Label>
              <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email contact</Label>
              <Input value={form.email} onChange={(e) => set("email", e.target.value)} className="h-9 text-sm" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coordonnées bancaires */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Euro className="h-4 w-4" />Coordonnées bancaires (RIB)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">Ces coordonnées apparaîtront sur vos factures.</p>
          <div className="space-y-1.5">
            <Label className="text-xs">Banque</Label>
            <Input value={form.bankName} onChange={(e) => set("bankName", e.target.value)} className="h-9 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">IBAN</Label>
            <Input value={form.iban} onChange={(e) => set("iban", e.target.value)} className="h-9 text-sm font-mono tracking-wider" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">BIC / SWIFT</Label>
            <Input value={form.bic} onChange={(e) => set("bic", e.target.value)} className="h-9 text-sm font-mono" />
          </div>
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
