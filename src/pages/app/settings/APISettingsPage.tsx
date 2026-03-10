import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Code2, Key, Plus, Copy, Eye, EyeOff, Trash2, RefreshCw,
  AlertTriangle, CheckCircle, Clock, Globe, Webhook,
  Shield, ExternalLink, Lock, Activity, Zap,
} from "lucide-react";
import { motion } from "framer-motion";

type KeyScope = "read"|"write"|"admin";
interface APIKey {
  id:string;name:string;prefix:string;scopes:KeyScope[];created:string;lastUsed?:string;expires?:string;active:boolean;requests:number;
}
const scopeConfig: Record<KeyScope,{label:string;color:string}> = {
  read:  {label:"Lecture",   color:"bg-blue-500/10 text-blue-500"},
  write: {label:"Écriture",  color:"bg-warning/10 text-warning"},
  admin: {label:"Admin",     color:"bg-destructive/10 text-destructive"},
};
const apiKeys: APIKey[] = [
  {id:"K1",name:"Production — Frontend",prefix:"m7_live_sk_",scopes:["read","write"],created:"15/01/2024",lastUsed:"Aujourd'hui 09:42",active:true,requests:1842},
  {id:"K2",name:"Comptable externe",prefix:"m7_live_sk_",scopes:["read"],created:"20/02/2024",lastUsed:"Il y a 2j",active:true,requests:245},
  {id:"K3",name:"Test — CI/CD",prefix:"m7_test_sk_",scopes:["read","write","admin"],created:"01/03/2024",lastUsed:"Il y a 5j",expires:"01/04/2024",active:true,requests:89},
  {id:"K4",name:"Ancien script (désactivé)",prefix:"m7_live_sk_",scopes:["read"],created:"10/11/2023",active:false,requests:0},
];
const webhooks = [
  {id:"W1",url:"https://acme.fr/webhooks/m7",events:["invoice.paid","invoice.overdue"],active:true,lastDelivery:"200 OK · Il y a 1h"},
  {id:"W2",url:"https://zapier.com/hooks/catch/xxx",events:["quote.accepted"],active:true,lastDelivery:"200 OK · Hier"},
];
export default function APISettingsPage() {
  const [showKey, setShowKey] = useState<Record<string,boolean>>({});
  const [newKeyName, setNewKeyName] = useState("");
  const toggle=(id:string)=>setShowKey(p=>({...p,[id]:!p[id]}));
  return (
    <motion.div className="p-6 space-y-6 max-w-3xl" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>
      <div>
        <h1 className="text-xl font-display font-bold">API & Webhooks</h1>
        <p className="text-sm text-muted-foreground">Gérez vos clés d'accès et configurez les webhooks</p>
      </div>

      {/* Sécurité avertissement */}
      <Card className="border-warning/30 bg-warning/5">
        <CardContent className="p-4 flex items-start gap-3">
          <Shield className="h-5 w-5 text-warning flex-shrink-0 mt-0.5"/>
          <div className="space-y-1 text-xs">
            <p className="font-semibold text-warning">Bonnes pratiques de sécurité API</p>
            <ul className="text-muted-foreground space-y-0.5 list-disc list-inside">
              <li>Ne partagez jamais vos clés secrètes — ne les commitez pas dans votre code source</li>
              <li>Utilisez des variables d'environnement ou un gestionnaire de secrets (Vault, AWS Secrets Manager)</li>
              <li>Accordez uniquement les permissions nécessaires (principe du moindre privilège)</li>
              <li>Faites tourner vos clés régulièrement et révoquez celles inutilisées</li>
              <li>Surveillez les appels API inhabituels dans les logs</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2"><Key className="h-4 w-4"/>Clés API</CardTitle>
            <Button size="sm" className="text-xs gradient-primary text-primary-foreground"><Plus className="h-3.5 w-3.5 mr-1.5"/>Nouvelle clé</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Créer une nouvelle clé */}
          <div className="p-3 rounded-lg border border-dashed border-border/60 bg-muted/20 space-y-3">
            <p className="text-xs font-medium">Créer une nouvelle clé</p>
            <div className="flex gap-2">
              <Input placeholder="Nom de la clé (ex: Integration Shopify)" className="h-8 text-sm flex-1" value={newKeyName} onChange={(e)=>setNewKeyName(e.target.value)}/>
            </div>
            <div className="flex gap-3 flex-wrap">
              <p className="text-xs text-muted-foreground self-center">Permissions :</p>
              {(["read","write","admin"] as KeyScope[]).map((s)=>(
                <label key={s} className="flex items-center gap-1.5 text-xs cursor-pointer">
                  <input type="checkbox" defaultChecked={s==="read"} className="rounded"/>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${scopeConfig[s].color}`}>{scopeConfig[s].label}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-2 items-center">
              <div className="space-y-1 flex-1"><Label className="text-[10px]">Expiration (optionnel)</Label>
                <Input type="date" className="h-8 text-sm"/></div>
              <Button size="sm" className="text-xs gradient-primary text-primary-foreground mt-4" disabled={!newKeyName}>
                <Zap className="h-3.5 w-3.5 mr-1.5"/>Générer
              </Button>
            </div>
          </div>

          {/* Liste des clés */}
          {apiKeys.map((key)=>(
            <div key={key.id} className={`p-3.5 rounded-lg border transition-colors ${key.active?"border-border/60 hover:bg-muted/20":"border-border/30 opacity-50"}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium">{key.name}</p>
                    {!key.active && <Badge variant="secondary" className="text-[10px] bg-muted text-muted-foreground">Révoquée</Badge>}
                    {key.expires && <Badge variant="secondary" className="text-[10px] bg-warning/10 text-warning"><Clock className="h-2.5 w-2.5 mr-1"/>Exp. {key.expires}</Badge>}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-xs font-mono text-muted-foreground bg-muted/40 px-2 py-0.5 rounded">
                      {showKey[key.id] ? `${key.prefix}••••••••••••••••` : `${key.prefix}${"•".repeat(24)}`}
                    </code>
                    <button onClick={()=>toggle(key.id)} className="text-muted-foreground hover:text-foreground transition-colors">
                      {showKey[key.id]?<EyeOff className="h-3.5 w-3.5"/>:<Eye className="h-3.5 w-3.5"/>}
                    </button>
                    <button className="text-muted-foreground hover:text-foreground transition-colors"><Copy className="h-3.5 w-3.5"/></button>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    {key.scopes.map(s=><span key={s} className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${scopeConfig[s].color}`}>{scopeConfig[s].label}</span>)}
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Activity className="h-2.5 w-2.5"/>{key.requests.toLocaleString()} req.</span>
                    {key.lastUsed && <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="h-2.5 w-2.5"/>{key.lastUsed}</span>}
                  </div>
                </div>
                {key.active && (
                  <div className="flex gap-1 flex-shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground"><RefreshCw className="h-3.5 w-3.5"/></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5"/></Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Webhooks */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2"><Webhook className="h-4 w-4"/>Webhooks</CardTitle>
            <Button size="sm" variant="outline" className="text-xs"><Plus className="h-3.5 w-3.5 mr-1.5"/>Ajouter un webhook</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 rounded-lg bg-muted/30 text-xs text-muted-foreground">
            Les webhooks envoient une requête HTTP POST à votre URL à chaque événement. La signature HMAC-SHA256 est incluse dans l'en-tête <code className="font-mono bg-muted px-1 rounded">X-M7-Signature</code> pour validation.
          </div>
          {webhooks.map((wh)=>(
            <div key={wh.id} className="p-3.5 rounded-lg border border-border/60 hover:bg-muted/20 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0"/>
                    <code className="text-xs font-mono truncate">{wh.url}</code>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {wh.events.map(e=><Badge key={e} variant="secondary" className="text-[9px]">{e}</Badge>)}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                    <CheckCircle className="h-2.5 w-2.5 text-success"/>{wh.lastDelivery}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Switch checked={wh.active} className="scale-75"/>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5"/></Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Docs + limits */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">Documentation API REST</p>
              <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-success"/>OpenAPI 3.0</span>
                <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-success"/>OAuth2 + JWT</span>
                <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-success"/>1 000 req/min</span>
                <span className="flex items-center gap-1"><Lock className="h-3 w-3 text-primary"/>TLS 1.3 only</span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="text-xs flex-shrink-0"><ExternalLink className="h-3.5 w-3.5 mr-1.5"/>Voir la doc</Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
