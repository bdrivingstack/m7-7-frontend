import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Cpu, Zap, TrendingUp, DollarSign, Save, Shield, AlertTriangle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
const usageData = [{day:"Lun",tokens:48200},{day:"Mar",tokens:62400},{day:"Mer",tokens:71800},{day:"Jeu",tokens:58300},{day:"Ven",tokens:84200},{day:"Sam",tokens:23100},{day:"Dim",tokens:12400}];
export default function AdminAIPage() {
  return (
    <motion.div className="p-6 space-y-6" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>
      <div><h1 className="text-2xl font-display font-bold">IA Plateforme</h1><p className="text-sm text-muted-foreground">Gestion du module IA, modèles et consommation</p></div>
      <div className="grid grid-cols-4 gap-3">
        {[{label:"Tokens ce mois",value:"360k",sub:"/ 2M (Plan Pro)"},{label:"Coût estimé",value:"18,40 €",sub:"Ce mois"},{label:"Requêtes IA",value:"4 821",sub:"Ce mois"},{label:"Modèle actif",value:"claude-sonnet-4",sub:"Anthropic"}].map(s=>(
          <Card key={s.label}><CardContent className="p-4"><p className="text-xl font-display font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-[10px] text-muted-foreground">{s.sub}</p></CardContent></Card>
        ))}
      </div>
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold flex items-center gap-2"><TrendingUp className="h-4 w-4"/>Consommation tokens (7j)</CardTitle></CardHeader>
        <CardContent><ResponsiveContainer width="100%" height={160}>
          <AreaChart data={usageData}>
            <defs><linearGradient id="aiGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/><stop offset="95%" stopColor="#a855f7" stopOpacity={0}/></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4}/>
            <XAxis dataKey="day" tick={{fontSize:10}} tickLine={false} axisLine={false}/>
            <YAxis tick={{fontSize:10}} tickLine={false} axisLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
            <Tooltip contentStyle={{fontSize:11,borderRadius:8}}/>
            <Area type="monotone" dataKey="tokens" stroke="#a855f7" fill="url(#aiGrad)" strokeWidth={2} name="Tokens"/>
          </AreaChart>
        </ResponsiveContainer></CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Shield className="h-4 w-4"/>Sécurité & modération IA</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-muted-foreground flex items-start gap-2">
            <Shield className="h-4 w-4 text-primary flex-shrink-0 mt-0.5"/>
            L'IA de M7:7 utilise Claude (Anthropic) via API. Aucune donnée client n'est utilisée pour l'entraînement. Toutes les requêtes sont chiffrées TLS. Les clés API sont stockées chiffrées AES-256.
          </div>
          {[{label:"Filtre de contenu inapproprié",desc:"Bloque les requêtes non liées à la facturation"},
            {label:"Logs de toutes les requêtes IA",desc:"Audit complet pour conformité"},
            {label:"Limite de tokens par tenant",desc:"Évite les abus et surcoûts"}].map(item=>(
            <div key={item.label} className="flex items-center justify-between">
              <div><p className="text-sm font-medium">{item.label}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div>
              <Switch defaultChecked/>
            </div>
          ))}
          <div className="space-y-1.5"><Label className="text-xs">Limite de tokens/mois par tenant (Plan Pro)</Label><div className="flex gap-2"><Input defaultValue="2000000" type="number" className="h-9 text-sm font-mono max-w-[160px]"/><Button size="sm" className="gradient-primary text-primary-foreground text-xs"><Save className="h-3.5 w-3.5 mr-1.5"/>Sauver</Button></div></div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
