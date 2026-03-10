import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Palette, Eye, Save, Upload, Type, Layout } from "lucide-react";
import { motion } from "framer-motion";

const fonts = ["Inter","Roboto","Poppins","Montserrat","Space Grotesk","Playfair Display"];
const colorPresets = [
  {name:"Violet",primary:"#7C3AED",accent:"#A78BFA"},
  {name:"Bleu",primary:"#2563EB",accent:"#60A5FA"},
  {name:"Vert",primary:"#16A34A",accent:"#4ADE80"},
  {name:"Ardoise",primary:"#475569",accent:"#94A3B8"},
  {name:"Rose",primary:"#DB2777",accent:"#F472B6"},
];

export default function BrandingPage() {
  const [primary, setPrimary] = useState("#7C3AED");
  const [accent, setAccent] = useState("#A78BFA");
  const [font, setFont] = useState("Inter");
  const [logoPos, setLogoPos] = useState<"left"|"center"|"right">("left");

  return (
    <motion.div className="p-6 space-y-6 max-w-2xl" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>
      <div><h1 className="text-xl font-display font-bold">Marque & design</h1>
        <p className="text-sm text-muted-foreground">Personnalisez l'apparence de vos documents et du portail client</p>
      </div>

      {/* Logo */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Upload className="h-4 w-4"/>Logo</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            {["Logo principal","Logo compact"].map((type) => (
              <div key={type} className="flex-1 border-2 border-dashed border-border/60 rounded-xl p-6 flex flex-col items-center gap-2 hover:border-primary/40 cursor-pointer transition-colors">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center"><Upload className="h-5 w-5 text-muted-foreground"/></div>
                <p className="text-xs font-medium">{type}</p>
                <p className="text-[10px] text-muted-foreground text-center">PNG, SVG · max 2Mo</p>
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Position du logo sur les documents</Label>
            <div className="flex gap-2">
              {(["left","center","right"] as const).map((pos) => (
                <Button key={pos} variant={logoPos===pos?"default":"outline"} size="sm"
                  className={`text-xs flex-1 h-8 ${logoPos===pos?"gradient-primary text-primary-foreground":""}`}
                  onClick={()=>setLogoPos(pos)}>
                  {pos==="left"?"Gauche":pos==="center"?"Centre":"Droite"}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Couleurs */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Palette className="h-4 w-4"/>Couleurs</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {colorPresets.map((p) => (
              <button key={p.name} onClick={()=>{setPrimary(p.primary);setAccent(p.accent);}}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/60 hover:border-primary/40 text-xs transition-colors">
                <div className="h-4 w-4 rounded-full" style={{background:p.primary}}/>
                {p.name}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Couleur principale</Label>
              <div className="flex gap-2">
                <div className="h-9 w-9 rounded-lg border border-border flex-shrink-0 cursor-pointer overflow-hidden">
                  <input type="color" value={primary} onChange={(e)=>setPrimary(e.target.value)} className="h-full w-full cursor-pointer border-0 p-0 scale-150"/>
                </div>
                <Input value={primary} onChange={(e)=>setPrimary(e.target.value)} className="h-9 text-sm font-mono flex-1"/>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Couleur secondaire</Label>
              <div className="flex gap-2">
                <div className="h-9 w-9 rounded-lg border border-border flex-shrink-0 cursor-pointer overflow-hidden">
                  <input type="color" value={accent} onChange={(e)=>setAccent(e.target.value)} className="h-full w-full cursor-pointer border-0 p-0 scale-150"/>
                </div>
                <Input value={accent} onChange={(e)=>setAccent(e.target.value)} className="h-9 text-sm font-mono flex-1"/>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typographie */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Type className="h-4 w-4"/>Typographie</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {fonts.map((f) => (
              <button key={f} onClick={()=>setFont(f)}
                className={`p-3 rounded-lg border text-center transition-all ${font===f?"border-primary bg-primary/5":"border-border/60 hover:border-primary/30"}`}>
                <p className="text-sm font-medium" style={{fontFamily:f}}>{f}</p>
                <p className="text-[10px] text-muted-foreground mt-1" style={{fontFamily:f}}>Aa Bb Cc 123</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Aperçu facture */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Eye className="h-4 w-4"/>Aperçu document</CardTitle></CardHeader>
        <CardContent>
          <div className="border border-border/60 rounded-xl overflow-hidden" style={{fontFamily:font}}>
            <div className="p-4 flex items-center justify-between" style={{background:primary}}>
              <div className="h-8 w-24 bg-white/20 rounded flex items-center justify-center text-white text-xs font-bold">LOGO</div>
              <div className="text-right text-white text-xs">
                <p className="font-bold text-base">FACTURE</p>
                <p className="opacity-80">F-2024-047</p>
              </div>
            </div>
            <div className="p-4 bg-white dark:bg-card space-y-3">
              <div className="flex justify-between text-xs">
                <div><p className="font-semibold">Mon Entreprise SAS</p><p className="text-muted-foreground">12 Rue de la Paix · Paris</p></div>
                <div className="text-right"><p className="font-semibold">Client</p><p className="text-muted-foreground">Acme Corp</p></div>
              </div>
              <div className="border-t border-border/40 pt-3">
                <div className="flex justify-between text-xs py-1.5">
                  <span>Développement web — 3j</span><span className="font-semibold">2 250,00 €</span>
                </div>
                <div className="flex justify-between text-xs font-bold pt-2 border-t border-border/40 mt-2">
                  <span>Total TTC</span>
                  <span style={{color:primary}}>2 700,00 €</span>
                </div>
              </div>
            </div>
            <div className="p-3 text-center text-[10px] text-muted-foreground border-t border-border/40" style={{borderTop:`2px solid ${accent}`}}>
              Merci pour votre confiance · contact@monentreprise.fr
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
