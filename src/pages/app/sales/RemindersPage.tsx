import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Send, Clock, AlertTriangle, Bot, Settings, Plus } from "lucide-react";
import { reminderRules, reminderEvents, fmtEUR } from "@/lib/sales-data";
import { motion } from "framer-motion";

export default function RemindersPage() {
  return (
    <motion.div className="p-6 space-y-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Relances</h1>
          <p className="text-sm text-muted-foreground">Automatisez le suivi de vos impayés</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Bot className="h-3.5 w-3.5 mr-1.5" />Relance IA</Button>
          <Button size="sm" className="gradient-primary text-primary-foreground">
            <Plus className="h-3.5 w-3.5 mr-1.5" />Nouvelle règle
          </Button>
        </div>
      </div>

      {/* Rules */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Settings className="h-4 w-4" /> Règles de relance automatique
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {reminderRules.map(rule => (
            <div key={rule.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/20">
              <div className="flex items-center gap-3">
                <Switch checked={rule.active} />
                <div>
                  <p className="text-sm font-medium">{rule.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    Template : {rule.template} · {rule.sent} envoyées
                  </p>
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

      {/* History */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" /> Historique des relances
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {reminderEvents.map(event => (
            <div key={event.id} className="flex items-center gap-4 p-3 rounded-lg border border-border/50 hover:bg-muted/20">
              <div className="h-8 w-8 rounded-lg bg-warning/10 flex items-center justify-center">
                <Send className="h-4 w-4 text-warning" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{event.rule}</p>
                <p className="text-[10px] text-muted-foreground">
                  {event.client} · {event.invoice} · {new Date(event.date).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <Badge variant="secondary" className="text-[10px] bg-success/10 text-success">Envoyée</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* AI suggestion */}
      <Card className="border-primary/20">
        <CardContent className="p-4 flex items-start gap-3">
          <Bot className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium">Suggestion IA</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Digital Wave a 2 factures en retard pour un total de 4 270 €. L'IA peut générer une relance
              personnalisée adaptée à l'historique de ce client.
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
