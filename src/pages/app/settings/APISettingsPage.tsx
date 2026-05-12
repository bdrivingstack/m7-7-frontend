import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Code2, Key, Plus, Trash2, RefreshCw,
  AlertTriangle, CheckCircle, Globe, Webhook,
  Shield, ExternalLink, Lock, Zap, Loader2, X,
} from "lucide-react";
import { motion } from "framer-motion";
import { useApi } from "@/hooks/useApi";
import { toast } from "@/hooks/use-toast";

export default function APISettingsPage() {
  const { data: whData, loading: whLoading, refetch: whRefetch } = useApi<any>("/api/settings/webhooks");
  const webhooks: any[] = whData?.data ?? [];

  const [newWebhookUrl, setNewWebhookUrl]     = useState("");
  const [newWebhookEvents, setNewWebhookEvents] = useState("invoice.paid,invoice.overdue");
  const [addingWh, setAddingWh]               = useState(false);
  const [showWebhookForm, setShowWebhookForm] = useState(false);

  const handleAddWebhook = async () => {
    if (!newWebhookUrl.trim()) {
      toast({ title: "URL manquante", description: "Saisissez une URL valide.", variant: "destructive" });
      return;
    }
    const events = newWebhookEvents.split(",").map(e => e.trim()).filter(Boolean);
    if (events.length === 0) {
      toast({ title: "Événements manquants", description: "Saisissez au moins un événement.", variant: "destructive" });
      return;
    }
    setAddingWh(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL ?? ""}/api/settings/webhooks`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: newWebhookUrl, events }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({
          title: "Webhook créé",
          description: `Secret : ${data.data?.secret ?? ""}. Conservez-le, il ne sera plus affiché.`,
        });
        setNewWebhookUrl(""); setNewWebhookEvents("invoice.paid,invoice.overdue");
        setShowWebhookForm(false);
        whRefetch();
      } else {
        toast({ title: "Erreur", description: data?.message ?? "Impossible de créer le webhook.", variant: "destructive" });
      }
    } finally {
      setAddingWh(false);
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    if (!confirm("Supprimer ce webhook ?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL ?? ""}/api/settings/webhooks/${id}`, {
        method: "DELETE", credentials: "include",
      });
      if (res.ok) {
        toast({ title: "Webhook supprimé" });
        whRefetch();
      } else {
        const err = await res.json().catch(() => ({}));
        toast({ title: "Erreur", description: err?.message ?? "Impossible de supprimer.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erreur réseau", variant: "destructive" });
    }
  };

  return (
    <motion.div className="p-6 space-y-6 max-w-3xl" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div>
        <h1 className="text-fluid-xl font-display font-bold">API & Webhooks</h1>
        <p className="text-sm text-muted-foreground">Gérez vos clés d'accès et configurez les webhooks</p>
      </div>

      {/* Security warning */}
      <Card className="border-warning/30 bg-warning/5">
        <CardContent className="p-4 flex items-start gap-3">
          <Shield className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <p className="font-semibold text-warning">Bonnes pratiques de sécurité API</p>
            <ul className="text-muted-foreground space-y-0.5 list-disc list-inside">
              <li>Ne partagez jamais vos clés secrètes — ne les commitez pas dans votre code source</li>
              <li>Utilisez des variables d'environnement ou un gestionnaire de secrets</li>
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
            <CardTitle className="text-sm font-semibold flex items-center gap-2"><Key className="h-4 w-4" />Clés API</CardTitle>
            <Button size="sm" className="text-xs gradient-primary text-primary-foreground"
              onClick={() => toast({ title: "Bientôt disponible", description: "La gestion des clés API sera disponible prochainement." })}>
              <Plus className="h-3.5 w-3.5 mr-1.5" />Nouvelle clé
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
            <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-2">
              <Key className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium">Aucune clé API</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              La gestion des clés API via l'interface sera disponible prochainement.
              Utilisez vos credentials de session pour l'instant.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Webhooks */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Webhook className="h-4 w-4" />Webhooks
              {whLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
            </CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="text-xs" onClick={whRefetch} disabled={whLoading}>
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" variant="outline" className="text-xs" onClick={() => setShowWebhookForm(v => !v)}>
                {showWebhookForm ? <X className="h-3.5 w-3.5 mr-1.5" /> : <Plus className="h-3.5 w-3.5 mr-1.5" />}
                {showWebhookForm ? "Annuler" : "Ajouter"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 rounded-lg bg-muted/30 text-xs text-muted-foreground">
            Les webhooks envoient une requête HTTP POST à votre URL à chaque événement. La signature HMAC-SHA256 est incluse dans l'en-tête{" "}
            <code className="font-mono bg-muted px-1 rounded">X-M7-Signature</code> pour validation.
          </div>

          {showWebhookForm && (
            <div className="p-4 rounded-lg border border-primary/30 bg-primary/5 space-y-3">
              <p className="text-xs font-semibold">Nouveau webhook</p>
              <div className="space-y-1.5">
                <Label className="text-xs">URL</Label>
                <Input value={newWebhookUrl} onChange={e => setNewWebhookUrl(e.target.value)}
                  placeholder="https://votreapp.fr/webhooks/m7" className="h-9 text-sm font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Événements (séparés par des virgules)</Label>
                <Input value={newWebhookEvents} onChange={e => setNewWebhookEvents(e.target.value)}
                  placeholder="invoice.paid,invoice.overdue,quote.accepted" className="h-9 text-sm font-mono" />
              </div>
              <Button size="sm" className="gradient-primary text-primary-foreground text-xs"
                onClick={handleAddWebhook} disabled={addingWh || !newWebhookUrl}>
                {addingWh ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Zap className="h-3.5 w-3.5 mr-1.5" />}
                Créer le webhook
              </Button>
            </div>
          )}

          {!whLoading && webhooks.length === 0 && !showWebhookForm && (
            <div className="text-center py-6 text-muted-foreground">
              <Webhook className="h-6 w-6 mx-auto mb-2 opacity-30" />
              <p className="text-xs">Aucun webhook configuré</p>
            </div>
          )}

          {webhooks.map((wh: any) => (
            <div key={wh.id} className="p-3.5 rounded-lg border border-border/60 hover:bg-muted/20 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    <code className="text-xs font-mono truncate">{wh.url}</code>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {(wh.events as string[]).map((e: string) => (
                      <Badge key={e} variant="secondary" className="text-[9px]">{e}</Badge>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                    {wh.isActive
                      ? <><CheckCircle className="h-2.5 w-2.5 text-success" />Actif</>
                      : <><X className="h-2.5 w-2.5 text-muted-foreground" />Inactif</>}
                    {wh.lastSyncAt && ` · Dernière livraison : ${new Date(wh.lastSyncAt).toLocaleString("fr-FR")}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteWebhook(wh.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Docs */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">Documentation API REST</p>
              <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-success" />OpenAPI 3.0</span>
                <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-success" />OAuth2 + JWT</span>
                <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3 text-success" />1 000 req/min</span>
                <span className="flex items-center gap-1"><Lock className="h-3 w-3 text-primary" />TLS 1.3 only</span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="text-xs flex-shrink-0"
              onClick={() => toast({ title: "Documentation en cours", description: "La documentation API sera disponible prochainement." })}>
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />Voir la doc
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
