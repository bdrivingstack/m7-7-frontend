import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Hash, Save, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
const types = [
  {id:"invoice",label:"Factures",prefix:"F",sep:"-",year:"2024",sep2:"-",seq:"001",preview:"F-2024-001"},
  {id:"quote",label:"Devis",prefix:"D",sep:"-",year:"2024",sep2:"-",seq:"001",preview:"D-2024-001"},
  {id:"credit",label:"Avoirs",prefix:"AV",sep:"-",year:"2024",sep2:"-",seq:"001",preview:"AV-2024-001"},
];
export default function NumberingPage() {
  const [configs, setConfigs] = useState(types);
  return (
    <motion.div className="p-6 space-y-6 max-w-2xl" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>
      <div><h1 className="text-xl font-display font-bold">Numérotation</h1>
        <p className="text-sm text-muted-foreground">Configurez le format des numéros de vos documents</p>
      </div>
      <div className="p-3 rounded-lg bg-warning/5 border border-warning/20 text-xs text-muted-foreground flex items-start gap-2">
        <Hash className="h-4 w-4 text-warning flex-shrink-0 mt-0.5"/>
        La numérotation doit être continue et sans rupture pour être conforme aux obligations légales françaises. Ne modifiez le séquenceur qu'avec précaution.
      </div>
      {configs.map((cfg, i) => (
        <Card key={cfg.id}>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">{cfg.label}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="space-y-1"><Label className="text-[10px]">Préfixe</Label><Input value={cfg.prefix} onChange={(e)=>setConfigs(p=>p.map((c,j)=>j===i?{...c,prefix:e.target.value}:c))} className="h-8 text-sm w-20 font-mono"/></div>
              <span className="text-muted-foreground mt-4">-</span>
              <div className="space-y-1"><Label className="text-[10px]">Année</Label><Input value={cfg.year} className="h-8 text-sm w-20 font-mono" readOnly/></div>
              <span className="text-muted-foreground mt-4">-</span>
              <div className="space-y-1"><Label className="text-[10px]">Séquence</Label><Input value={cfg.seq} onChange={(e)=>setConfigs(p=>p.map((c,j)=>j===i?{...c,seq:e.target.value}:c))} className="h-8 text-sm w-20 font-mono"/></div>
              <div className="mt-4 flex items-center gap-2 p-2 rounded-lg bg-muted/40 border border-border/50">
                <Eye className="h-3.5 w-3.5 text-muted-foreground"/>
                <code className="text-sm font-mono font-bold text-primary">{cfg.prefix}-{cfg.year}-{cfg.seq}</code>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label className="text-xs">Remise à zéro</Label>
                <select className="w-full h-9 text-sm border border-input rounded-md px-2.5 bg-background"><option>Annuelle</option><option>Mensuelle</option><option>Jamais</option></select>
              </div>
              <div className="space-y-1.5"><Label className="text-xs">Prochain numéro</Label>
                <div className="flex items-center gap-2">
                  <Input value={`${cfg.prefix}-2024-${String(parseInt(cfg.seq)+1).padStart(3,'0')}`} className="h-9 text-sm font-mono" readOnly/>
                  <Badge variant="secondary" className="text-[10px] bg-success/10 text-success flex-shrink-0">Auto</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm">Annuler</Button>
        <Button size="sm" className="gradient-primary text-primary-foreground"><Save className="h-3.5 w-3.5 mr-1.5"/>Enregistrer</Button>
      </div>
    </motion.div>
  );
}
