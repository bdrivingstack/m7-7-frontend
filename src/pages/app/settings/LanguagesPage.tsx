import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Globe, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
const currencies = ["EUR €","USD $","GBP £","CHF","CAD $"];
const langs = [{code:"fr",label:"Français",flag:"🇫🇷",default:true},{code:"en",label:"English",flag:"🇬🇧"},{code:"de",label:"Deutsch",flag:"🇩🇪"},{code:"es",label:"Español",flag:"🇪🇸"}];
export default function LanguagesPage() {
  return (
    <motion.div className="p-6 space-y-6 max-w-2xl" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>
      <div><h1 className="text-fluid-xl font-display font-bold">Langue & région</h1>
        <p className="text-sm text-muted-foreground">Configurez la langue et les formats régionaux de vos documents</p>
      </div>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Globe className="h-4 w-4"/>Langue des documents</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">Langue utilisée sur vos factures, devis et emails envoyés aux clients.</p>
          <div className="grid grid-cols-2 gap-2">
            {langs.map((l) => (
              <button key={l.code} className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${l.default?"border-primary bg-primary/5":"border-border/60 hover:border-primary/30"}`}>
                <span className="text-2xl">{l.flag}</span>
                <div>
                  <p className="text-sm font-medium">{l.label}</p>
                  {l.default && <Badge variant="secondary" className="text-[9px] bg-primary/10 text-primary mt-0.5">Par défaut</Badge>}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Formats régionaux</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label className="text-xs">Devise</Label>
              <select className="w-full h-9 text-sm border border-input rounded-md px-2.5 bg-background">{currencies.map(c=><option key={c}>{c}</option>)}</select>
            </div>
            <div className="space-y-1.5"><Label className="text-xs">Format date</Label>
              <select className="w-full h-9 text-sm border border-input rounded-md px-2.5 bg-background"><option>DD/MM/YYYY</option><option>MM/DD/YYYY</option><option>YYYY-MM-DD</option></select>
            </div>
            <div className="space-y-1.5"><Label className="text-xs">Séparateur décimal</Label>
              <select className="w-full h-9 text-sm border border-input rounded-md px-2.5 bg-background"><option>Virgule (1 234,56)</option><option>Point (1,234.56)</option></select>
            </div>
            <div className="space-y-1.5"><Label className="text-xs">Fuseau horaire</Label>
              <select className="w-full h-9 text-sm border border-input rounded-md px-2.5 bg-background"><option>Europe/Paris (UTC+1)</option><option>Europe/London (UTC+0)</option><option>America/New_York (UTC-5)</option></select>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-muted/40 border border-border/50 text-xs">
            <p className="font-medium mb-1.5">Aperçu des formats :</p>
            <div className="grid grid-cols-2 gap-1 text-muted-foreground">
              <span>Date :</span><span className="font-mono">09/03/2024</span>
              <span>Montant :</span><span className="font-mono">2 750,00 €</span>
              <span>Heure :</span><span className="font-mono">14:30</span>
            </div>
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
