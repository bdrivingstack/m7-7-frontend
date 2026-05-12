import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { useDemo } from "@/contexts/DemoContext";
import { toast } from "@/hooks/use-toast";

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
  monthly:   { label: "Mensuel",       color: "bg-blue-500/10 text-blue-500" },
  quarterly: { label: "Trimestriel",   color: "bg-violet-500/10 text-violet-500" },
  yearly:    { label: "Annuel",        color: "bg-orange-500/10 text-orange-500" },
  weekly:    { label: "Hebdomadaire",  color: "bg-emerald-500/10 text-emerald-500" },
};

const statusConfig: Record<RecStatus, { label: string; color: string }> = {
  active: { label: "Actif",      color: "bg-success/10 text-success" },
  paused: { label: "En pause",   color: "bg-warning/10 text-warning" },
  ended:  { label: "Terminé",    color: "bg-muted text-muted-foreground" },
};

const templates: RecurringTemplate[] = [
  { id: "RT1", name: "Maintenance mensuelle", client: "Green Solutions", frequency: "monthly", amount: 780, nextDate: "2024-04-01", lastGenerated: "2024-03-01", status: "active", totalGenerated: 12, daysBefore: 3 },
  { id: "RT2", name: "Abonnement support", client: "TechFlow SAS", frequency: "monthly", amount: 960, nextDate: "2024-04-05", lastGenerated: "2024-03-05", status: "active", totalGenerated: 8, daysBefore: 5 },
  { id: "RT3", name: "Retainer consulting", client: "Acme Corp", frequency: "monthly", amount: 3600, nextDate: "2024-04-10", lastGenerated: "2024-03-10", status: "active", totalGenerated: 6, daysBefore: 5 },
  { id: "RT4", name: "Licence annuelle SaaS", client: "Studio Créatif", frequency: "yearly", amount: 1440, nextDate: "2025-01-15", lastGenerated: "2024-01-15", status: "active", totalGenerated: 2, daysBefore: 14 },
  { id: "RT5", name: "Rapport trimestriel", client: "Innovatech", frequency: "quarterly", amount: 2400, nextDate: "2024-06-01", lastGenerated: "2024-03-01", status: "paused", totalGenerated: 3, daysBefore: 7 },
];

export default function RecurringPage() {
  const demo = useDemo();
  const isDemo = !!demo?.isDemo;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | RecStatus>("all");

  // ── Mode réel : aucun backend recurring pour l'instant ──────────────────────
  if (!isDemo) {
    return (
      <motion.div
        className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center"
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      >
        <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
          <RefreshCw className="h-10 w-10 text-primary/50" />
        </div>
        <h2 className="text-xl font-display font-bold mb-2">Facturation récurrente</h2>
        <p className="text-sm text-muted-foreground max-w-md mb-2">
          Aucun modèle récurrent configuré pour le moment.
        </p>
        <p className="text-xs text-muted-foreground max-w-sm mb-6">
          Créez d'abord une facture ou un devis, puis activez la récurrence depuis son détail.
          Cette fonctionnalité sera disponible sous forme de module dédié prochainement.
        </p>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/app/sales/invoices">Voir mes factures</Link>
          </Button>
          <Button size="sm" className="gradient-primary text-primary-foreground"
            onClick={() => toast({ title: "Bientôt disponible", description: "La création de modèles récurrents sera déployée prochainement." })}>
            <Plus className="h-3.5 w-3.5 mr-1.5" />Nouveau modèle
          </Button>
        </div>
      </motion.div>
    );
  }

  // ── Mode démo ────────────────────────────────────────────────────────────────
  const filtered = templates.filter((t) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.client.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const mrr = templates.filter(t => t.status === "active" && t.frequency === "monthly").reduce((s, t) => s + t.amount, 0);
  const activeCount = templates.filter(t => t.status === "active").length;
  const nextMonth = templates.filter(t => t.status === "active").reduce((s, t) => {
    if (t.frequency === "monthly")   return s + t.amount;
    if (t.frequency === "weekly")    return s + t.amount * 4;
    if (t.frequency === "quarterly") return s + t.amount / 3;
    if (t.frequency === "yearly")    return s + t.amount / 12;
    return s;
  }, 0);

  return (
    <motion.div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-full overflow-x-hidden" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-fluid-2xl font-display font-bold">Facturation récurrente</h1>
          <p className="text-sm text-muted-foreground">Gérez vos modèles de factures automatiques</p>
        </div>
        <Button size="sm" className="gradient-primary text-primary-foreground">
          <Plus className="h-3.5 w-3.5 mr-1.5" />Nouveau modèle
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: RefreshCw, label: "Modèles actifs", value: activeCount },
          { icon: TrendingUp, label: "MRR récurrent", value: fmtEUR(mrr) },
          { icon: Calendar,  label: "Prochain mois",  value: fmtEUR(nextMonth) },
          { icon: Users,     label: "Clients",         value: new Set(templates.filter(t => t.status === "active").map(t => t.client)).size },
        ].map(({ icon: Icon, label, value }) => (
          <Card key={label}><CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2"><Icon className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-xs text-muted-foreground">{label}</span></div>
            <p className="text-fluid-2xl font-display font-bold">{value}</p>
          </CardContent></Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher..." className="pl-9 h-8 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1">
          {(["all", "active", "paused", "ended"] as const).map(s => (
            <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm"
              className={`text-xs h-7 ${statusFilter === s ? "gradient-primary text-primary-foreground" : ""}`}
              onClick={() => setStatusFilter(s)}>
              {s === "all" ? "Tous" : statusConfig[s as RecStatus].label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(t => {
          const fc = freqConfig[t.frequency];
          const sc = statusConfig[t.status];
          return (
            <Card key={t.id} className={`border-border/50 hover:shadow-md transition-shadow ${t.status === "ended" ? "opacity-60" : ""}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.client}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-3.5 w-3.5" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="text-xs">
                      <DropdownMenuItem><Eye className="h-3 w-3 mr-2" />Voir</DropdownMenuItem>
                      {t.status === "active" ? <DropdownMenuItem><Pause className="h-3 w-3 mr-2" />Pause</DropdownMenuItem>
                        : t.status === "paused" ? <DropdownMenuItem><Play className="h-3 w-3 mr-2" />Réactiver</DropdownMenuItem>
                        : null}
                      <DropdownMenuItem className="text-destructive"><Trash2 className="h-3 w-3 mr-2" />Supprimer</DropdownMenuItem>
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
                    <span className="text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />Prochaine</span>
                    <span className="font-medium">{t.status === "ended" ? "—" : new Date(t.nextDate).toLocaleDateString("fr-FR")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />Délai</span>
                    <span>{t.daysBefore}j avant</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Générées</span>
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
