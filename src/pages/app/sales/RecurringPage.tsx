import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus, RefreshCw, Search, MoreHorizontal, Eye,
  Pause, Play, Trash2, Calendar, Users, TrendingUp, Clock,
} from "lucide-react";
import { fmtEUR } from "@/lib/sales-data";
import { motion } from "framer-motion";

type Frequency = "monthly" | "quarterly" | "yearly" | "weekly";
type RecStatus = "active" | "paused" | "ended";

interface RecurringTemplate {
  id: string;
  name: string;
  client: string;
  frequency: Frequency;
  amount: number;
  nextDate: string;
  lastGenerated: string;
  status: RecStatus;
  totalGenerated: number;
  daysBefore: number;
}

const freqConfig: Record<Frequency, { label: string; color: string }> = {
  monthly: { label: "Mensuel", color: "bg-blue-500/10 text-blue-500" },
  quarterly: { label: "Trimestriel", color: "bg-violet-500/10 text-violet-500" },
  yearly: { label: "Annuel", color: "bg-orange-500/10 text-orange-500" },
  weekly: { label: "Hebdomadaire", color: "bg-emerald-500/10 text-emerald-500" },
};

const statusConfig: Record<RecStatus, { label: string; color: string }> = {
  active: { label: "Actif", color: "bg-success/10 text-success" },
  paused: { label: "En pause", color: "bg-warning/10 text-warning" },
  ended: { label: "Terminé", color: "bg-muted text-muted-foreground" },
};

const templates: RecurringTemplate[] = [
  { id: "RT1", name: "Maintenance mensuelle", client: "Green Solutions", frequency: "monthly", amount: 780, nextDate: "2024-04-01", lastGenerated: "2024-03-01", status: "active", totalGenerated: 12, daysBefore: 3 },
  { id: "RT2", name: "Abonnement support", client: "TechFlow SAS", frequency: "monthly", amount: 960, nextDate: "2024-04-05", lastGenerated: "2024-03-05", status: "active", totalGenerated: 8, daysBefore: 5 },
  { id: "RT3", name: "Retainer consulting", client: "Acme Corp", frequency: "monthly", amount: 3600, nextDate: "2024-04-10", lastGenerated: "2024-03-10", status: "active", totalGenerated: 6, daysBefore: 5 },
  { id: "RT4", name: "Licence annuelle SaaS", client: "Studio Créatif", frequency: "yearly", amount: 1440, nextDate: "2025-01-15", lastGenerated: "2024-01-15", status: "active", totalGenerated: 2, daysBefore: 14 },
  { id: "RT5", name: "Rapport trimestriel", client: "Innovatech", frequency: "quarterly", amount: 2400, nextDate: "2024-06-01", lastGenerated: "2024-03-01", status: "paused", totalGenerated: 3, daysBefore: 7 },
  { id: "RT6", name: "Backup hebdomadaire", client: "StartupXYZ", frequency: "weekly", amount: 120, nextDate: "2024-03-16", lastGenerated: "2024-03-09", status: "ended", totalGenerated: 52, daysBefore: 1 },
];

export default function RecurringPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | RecStatus>("all");

  const filtered = templates.filter((t) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.client.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const mrr = templates.filter((t) => t.status === "active" && t.frequency === "monthly").reduce((s, t) => s + t.amount, 0);
  const activeCount = templates.filter((t) => t.status === "active").length;
  const nextMonth = templates.filter((t) => t.status === "active").reduce((s, t) => {
    if (t.frequency === "monthly") return s + t.amount;
    if (t.frequency === "weekly") return s + t.amount * 4;
    if (t.frequency === "quarterly") return s + t.amount / 3;
    if (t.frequency === "yearly") return s + t.amount / 12;
    return s;
  }, 0);

  return (
    <motion.div className="p-6 space-y-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Facturation récurrente</h1>
          <p className="text-sm text-muted-foreground">Gérez vos modèles de factures automatiques</p>
        </div>
        <Button size="sm" className="gradient-primary text-primary-foreground">
          <Plus className="h-3.5 w-3.5 mr-1.5" />Nouveau modèle
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Modèles actifs</span>
              <InfoTooltip title="Modèles récurrents actifs" description="Nombre de modèles de facturation récurrente en cours d'exécution automatique." benefit="Chaque modèle actif génère des factures automatiquement à la fréquence configurée, sans intervention manuelle." />
            </div>
            <p className="text-2xl font-display font-bold">{activeCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">MRR récurrent</span>
              <InfoTooltip title="MRR — Monthly Recurring Revenue" description="Revenu mensuel récurrent garanti par vos contrats de facturation automatique actifs." formula="Σ montants mensualisés de tous les modèles actifs" benefit="Le MRR est la base de votre visibilité financière. Plus il est élevé, plus votre trésorerie est prévisible." />
            </div>
            <p className="text-2xl font-display font-bold">{fmtEUR(mrr)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Prochain mois</span>
              <InfoTooltip title="Facturation du mois prochain" description="Montant total qui sera automatiquement facturé le mois prochain si tous les modèles restent actifs." benefit="Anticipez vos encaissements et votre trésorerie en vous basant sur cette projection." />
            </div>
            <p className="text-2xl font-display font-bold">{fmtEUR(nextMonth)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Clients concernés</span>
              <InfoTooltip title="Clients avec facturation récurrente" description="Nombre de clients distincts qui ont au moins un modèle de facturation récurrente actif." benefit="Des clients sous contrat récurrent sont plus fidèles et plus prévisibles financièrement." />
            </div>
            <p className="text-2xl font-display font-bold">
              {new Set(templates.filter((t) => t.status === "active").map((t) => t.client)).size}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..." className="pl-9 h-8 text-sm"
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1">
          {(["all", "active", "paused", "ended"] as const).map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? "default" : "outline"}
              size="sm" className={`text-xs h-7 ${statusFilter === s ? "gradient-primary text-primary-foreground" : ""}`}
              onClick={() => setStatusFilter(s)}
            >
              {s === "all" ? "Tous" : statusConfig[s].label}
            </Button>
          ))}
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((t) => {
          const fc = freqConfig[t.frequency];
          const sc = statusConfig[t.status];
          return (
            <Card key={t.id} className={`border-border/50 hover:shadow-md transition-shadow ${t.status === "ended" ? "opacity-60" : ""}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm truncate">{t.name}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground">{t.client}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="text-xs">
                      <DropdownMenuItem><Eye className="h-3 w-3 mr-2" />Voir le modèle</DropdownMenuItem>
                      {t.status === "active" ? (
                        <DropdownMenuItem><Pause className="h-3 w-3 mr-2" />Mettre en pause</DropdownMenuItem>
                      ) : t.status === "paused" ? (
                        <DropdownMenuItem><Play className="h-3 w-3 mr-2" />Réactiver</DropdownMenuItem>
                      ) : null}
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-3 w-3 mr-2" />Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary" className={`text-[10px] ${fc.color}`}>{fc.label}</Badge>
                  <Badge variant="secondary" className={`text-[10px] ${sc.color}`}>{sc.label}</Badge>
                </div>

                <div className="text-2xl font-display font-bold mb-4">{fmtEUR(t.amount)}</div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />Prochaine génération
                    </span>
                    <span className="font-medium">
                      {t.status === "ended" ? "—" : new Date(t.nextDate).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />Générer avant
                    </span>
                    <span>{t.daysBefore}j avant échéance</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Factures générées</span>
                    <span>{t.totalGenerated}</span>
                  </div>
                </div>

                {t.status === "active" && (
                  <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Actif</span>
                    <Switch defaultChecked />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {/* Add card */}
        <Card className="border-dashed border-border/70 hover:border-primary/40 transition-colors cursor-pointer group">
          <CardContent className="p-5 flex flex-col items-center justify-center h-full min-h-48 text-center">
            <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Plus className="h-5 w-5 text-primary-foreground" />
            </div>
            <p className="text-sm font-medium">Nouveau modèle récurrent</p>
            <p className="text-xs text-muted-foreground mt-1">Automatisez votre facturation</p>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
