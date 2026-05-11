import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Percent, Save, Plus, Trash2, AlertTriangle, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
const rates = [{id:1,rate:"20",label:"TVA normale",default:true},{id:2,rate:"10",label:"TVA intermédiaire",default:false},{id:3,rate:"5.5",label:"TVA réduite",default:false},{id:4,rate:"0",label:"Exonéré",default:false}];
export default function VATSettingsPage() {
  const [subject, setSubject] = useState(true);
  const [regime, setRegime] = useState("reel_normal");
  return (
    <motion.div className="p-6 space-y-6 max-w-2xl" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>
      <div><h1 className="text-fluid-xl font-display font-bold">Paramètres TVA</h1>
        <p className="text-sm text-muted-foreground">Configurez votre régime de TVA et les taux applicables</p>
      </div>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Percent className="h-4 w-4"/>Statut TVA</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium">Assujetti à la TVA</p><p className="text-xs text-muted-foreground">Vos factures incluront la TVA</p></div>
            <Switch checked={subject} onCheckedChange={setSubject}/>
          </div>
          {!subject && <div className="p-3 rounded-lg bg-muted/40 border border-border/50 text-xs text-muted-foreground flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0"/>
            Mention légale qui sera ajoutée : "TVA non applicable — art. 293B du CGI"
          </div>}
          {subject && <>
            <div className="space-y-1.5"><Label className="text-xs">Régime de TVA</Label>
              <select value={regime} onChange={(e)=>setRegime(e.target.value)} className="w-full h-9 text-sm border border-input rounded-md px-2.5 bg-background">
                <option value="reel_normal">Régime réel normal (mensuel/trimestriel)</option>
                <option value="reel_simplifie">Régime réel simplifié (annuel)</option>
                <option value="mini_reel">Mini-réel</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label className="text-xs">N° TVA intracommunautaire</Label><Input defaultValue="FR12 123456789" className="h-9 text-sm font-mono"/></div>
              <div className="space-y-1.5"><Label className="text-xs">Périodicité déclaration</Label>
                <select className="w-full h-9 text-sm border border-input rounded-md px-2.5 bg-background"><option>Mensuelle</option><option>Trimestrielle</option></select>
              </div>
            </div>
          </>}
        </CardContent>
      </Card>
      {subject && <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Taux de TVA</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {rates.map((r) => (
            <div key={r.id} className={`flex items-center justify-between p-3 rounded-lg border ${r.default?"border-primary/30 bg-primary/5":"border-border/50"}`}>
              <div className="flex items-center gap-3">
                <div className="h-8 w-14 rounded-lg bg-muted flex items-center justify-center font-mono text-sm font-bold">{r.rate}%</div>
                <div><p className="text-sm font-medium">{r.label}</p>
                  {r.default && <Badge variant="secondary" className="text-[9px] bg-primary/10 text-primary">Défaut</Badge>}
                </div>
              </div>
              <div className="flex gap-1">
                {!r.default && <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">✏️</Button>}
                {r.rate !== "0" && !r.default && <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5"/></Button>}
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" className="text-xs w-full mt-2"><Plus className="h-3.5 w-3.5 mr-1.5"/>Ajouter un taux</Button>
        </CardContent>
      </Card>}
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm">Annuler</Button>
        <Button size="sm" className="gradient-primary text-primary-foreground"><Save className="h-3.5 w-3.5 mr-1.5"/>Enregistrer</Button>
      </div>
    </motion.div>
  );
}
