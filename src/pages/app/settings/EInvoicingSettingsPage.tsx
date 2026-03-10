import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Zap, CheckCircle, AlertTriangle, ExternalLink, Save, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
const platforms = [
  {id:"chorus",name:"Chorus Pro",desc:"Portail officiel facturation public (B2G)",logo:"🏛️",status:"connected"},
  {id:"peppol",name:"Peppol",desc:"Réseau européen d'échange interopérable",logo:"🌐",status:"available"},
  {id:"factur_x",name:"Factur-X",desc:"Format PDF/A-3 avec données XML embarquées",logo:"📄",status:"active"},
];
export default function EInvoicingSettingsPage() {
  return (
    <motion.div className="p-6 space-y-6 max-w-2xl" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>
      <div><h1 className="text-xl font-display font-bold">E-Facture</h1>
        <p className="text-sm text-muted-foreground">Conformité à la réforme de facturation électronique 2026</p>
      </div>
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Zap className="h-5 w-5 text-primary flex-shrink-0 mt-0.5"/>
            <div>
              <p className="font-semibold text-sm">Réforme e-facture — Calendrier</p>
              <div className="mt-2 space-y-1.5 text-xs">
                {[
                  {date:"1er sept. 2026",label:"Grandes entreprises — obligation de réception",done:false},
                  {date:"1er sept. 2026",label:"ETI — obligation d'émission et réception",done:false},
                  {date:"1er sept. 2027",label:"PME & micro-entreprises — obligation complète",done:false},
                ].map((item,i)=>(
                  <div key={i} className={`flex items-center gap-2 p-2 rounded-lg border ${item.done?"border-success/30 bg-success/5":"border-border/50"}`}>
                    <Clock className={`h-3.5 w-3.5 flex-shrink-0 ${item.done?"text-success":"text-warning"}`}/>
                    <span className="font-medium">{item.date}</span>
                    <span className="text-muted-foreground">— {item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Plateformes de dématérialisation (PDP)</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {platforms.map((p)=>(
            <div key={p.id} className={`flex items-center justify-between p-3 rounded-lg border ${p.status==="connected"?"border-success/30 bg-success/5":"p.status==='active'?'border-primary/20 bg-primary/5':'border-border/50'"}`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{p.logo}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{p.name}</p>
                    {p.status==="connected"&&<Badge variant="secondary" className="text-[10px] bg-success/10 text-success">Connecté</Badge>}
                    {p.status==="active"&&<Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">Actif</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">{p.desc}</p>
                </div>
              </div>
              {p.status==="available"?<Button size="sm" variant="outline" className="text-xs">Connecter</Button>
              :<Button size="sm" variant="ghost" className="text-xs"><ExternalLink className="h-3.5 w-3.5 mr-1"/></Button>}
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Identifiants e-facture</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label className="text-xs">SIRET émetteur</Label><Input defaultValue="123 456 789 00012" className="h-9 text-sm font-mono"/></div>
            <div className="space-y-1.5"><Label className="text-xs">N° TVA intracommunautaire</Label><Input defaultValue="FR12 123456789" className="h-9 text-sm font-mono"/></div>
            <div className="space-y-1.5 col-span-2"><Label className="text-xs">Code routage Peppol (optionnel)</Label><Input placeholder="0208:BE0477472701" className="h-9 text-sm font-mono"/></div>
          </div>
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium">Format Factur-X par défaut</p><p className="text-xs text-muted-foreground">Embarque les données XML dans vos PDF (EN 16931)</p></div>
            <Switch defaultChecked/>
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
