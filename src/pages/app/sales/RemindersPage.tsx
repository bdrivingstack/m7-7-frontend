import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Send, Clock, AlertTriangle, Bot, Settings, Plus, Loader2, Bell, RefreshCw } from "lucide-react";
import { reminderRules, reminderEvents, fmtEUR } from "@/lib/sales-data";
import { motion } from "framer-motion";
import { useDemo } from "@/contexts/DemoContext";
import { useApi } from "@/hooks/useApi";
import { toast } from "@/hooks/use-toast";

export default function RemindersPage() {
  const demo   = useDemo();
  const isDemo = !!demo?.isDemo;

  // En mode réel on charge les factures en retard
  const { data: overdueData, loading, refetch } = useApi<any>("/api/invoices?status=OVERDUE&limit=50", { skip: isDemo });
  const overdueInvoices: any[] = overdueData?.data ?? overdueData?.invoices ?? [];

  if (!isDemo) {
    return (
      <motion.div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-full overflow-x-hidden" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-fluid-2xl font-display font-bold">Relances</h1>
            <p className="text-sm text-muted-foreground">Factures en retard et suivi des impayés</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
              {loading ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5 mr-1.5" />}
              Actualiser
            </Button>
            <Button size="sm" className="gradient-primary text-primary-foreground"
              onClick={() => toast({ title: "Bientôt disponible", description: "Les relances automatiques seront déployées prochainement." })}>
              <Plus className="h-3.5 w-3.5 mr-1.5" />Nouvelle règle
            </Button>
          </div>
        </div>

        {/* Stat */}
        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Card className={overdueInvoices.length > 0 ? "border-destructive/30" : "border-success/30"}>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Factures en retard</p>
                <p className={`text-2xl font-display font-bold ${overdueInvoices.length > 0 ? "text-destructive" : "text-success"}`}>
                  {overdueInvoices.length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Montant impayé</p>
                <p className="text-2xl font-display font-bold text-destructive">
                  {fmtEUR(overdueInvoices.reduce((s: number, i: any) => s + Number(i.totalDue ?? i.totalTTC ?? 0), 0))}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground mb-1">Relances envoyées</p>
                <p className="text-2xl font-display font-bold">0</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Factures en retard */}
        <Card className={overdueInvoices.length > 0 ? "border-destructive/20" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Factures en retard ({overdueInvoices.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-8 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />Chargement…
              </div>
            ) : overdueInvoices.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-sm">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p>Aucune facture en retard 🎉</p>
                <p className="text-xs mt-1">Toutes vos factures sont à jour.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {overdueInvoices.map((inv: any) => (
                  <div key={inv.id} className="flex items-center gap-4 p-3 rounded-lg border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 transition-colors">
                    <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{inv.number ?? inv.id}</p>
                      <p className="text-xs text-muted-foreground">
                        {inv.customer?.name ?? inv.client ?? "—"} · Échéance {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("fr-FR") : "—"}
                      </p>
                    </div>
                    <span className="font-semibold text-destructive text-sm">
                      {fmtEUR(Number(inv.totalDue ?? inv.totalTTC ?? 0))}
                    </span>
                    <Button size="sm" variant="outline" className="text-xs h-7 border-destructive/40 text-destructive"
                      onClick={() => toast({ title: "Bientôt disponible", description: "L'envoi de relance email sera déployé prochainement." })}>
                      <Send className="h-3 w-3 mr-1" />Relancer
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Module règles : à venir */}
        <Card className="border-dashed border-border/60">
          <CardContent className="p-5 flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Settings className="h-5 w-5 text-primary/60" />
            </div>
            <div>
              <p className="text-sm font-medium">Règles de relance automatique</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Configurez des séquences de relances (J+7, J+15, J+30) pour automatiser le recouvrement.
                Cette fonctionnalité sera disponible prochainement.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // ── Mode démo ────────────────────────────────────────────────────────────────
  return (
    <motion.div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-full overflow-x-hidden" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-fluid-2xl font-display font-bold">Relances</h1>
          <p className="text-sm text-muted-foreground">Automatisez le suivi de vos impayés</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Bot className="h-3.5 w-3.5 mr-1.5" />Relance IA</Button>
          <Button size="sm" className="gradient-primary text-primary-foreground"><Plus className="h-3.5 w-3.5 mr-1.5" />Nouvelle règle</Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Settings className="h-4 w-4" />Règles de relance automatique
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {reminderRules.map((rule: any) => (
            <div key={rule.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/20">
              <div className="flex items-center gap-3">
                <Switch checked={rule.active} />
                <div>
                  <p className="text-sm font-medium">{rule.name}</p>
                  <p className="text-[10px] text-muted-foreground">Template : {rule.template} · {rule.sent} envoyées</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-[10px]">J+{rule.delay}</Badge>
                <Badge variant="secondary" className={`text-[10px] ${rule.active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                  {rule.active ? "Actif" : "Inactif"}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />Historique des relances
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {reminderEvents.map((event: any) => (
            <div key={event.id} className="flex items-center gap-4 p-3 rounded-lg border border-border/50 hover:bg-muted/20">
              <div className="h-8 w-8 rounded-lg bg-warning/10 flex items-center justify-center">
                <Send className="h-4 w-4 text-warning" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{event.rule}</p>
                <p className="text-[10px] text-muted-foreground">{event.client} · {event.invoice} · {new Date(event.date).toLocaleDateString("fr-FR")}</p>
              </div>
              <Badge variant="secondary" className="text-[10px] bg-success/10 text-success">Envoyée</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-primary/20">
        <CardContent className="p-4 flex items-start gap-3">
          <Bot className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium">Suggestion IA</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Digital Wave a 2 factures en retard pour un total de 4 270 €. L'IA peut générer une relance personnalisée.
            </p>
            <Button variant="outline" size="sm" className="mt-2 text-xs">
              <Bot className="h-3 w-3 mr-1.5" />Générer la relance
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
