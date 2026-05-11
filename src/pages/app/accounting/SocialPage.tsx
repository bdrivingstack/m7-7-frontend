import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PiggyBank, Calendar, CheckCircle, Clock,
  Download, TrendingUp, Info, ChevronRight, ExternalLink,
  Building2, Shield,
} from "lucide-react";
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from "recharts";
import { socialContributions } from "@/lib/accounting-data";
import { motion } from "framer-motion";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

type PaymentStatus = "paid" | "pending" | "upcoming";

interface SocialPayment {
  id: string;
  period: string;
  label: string;
  amount: number;
  status: PaymentStatus;
  dueDate: string;
  paidDate?: string;
  type: "urssaf" | "retraite" | "prevoyance";
}

const payments: SocialPayment[] = [
  { id: "SC1", period: "T1 2024", label: "URSSAF — Cotisations T1 2024", amount: 1842, status: "paid", dueDate: "2024-04-05", paidDate: "2024-03-06", type: "urssaf" },
  { id: "SC2", period: "T1 2024", label: "Retraite complémentaire T1 2024", amount: 680, status: "pending", dueDate: "2024-04-15", type: "retraite" },
  { id: "SC3", period: "T1 2024", label: "Prévoyance T1 2024", amount: 220, status: "pending", dueDate: "2024-04-15", type: "prevoyance" },
  { id: "SC4", period: "T4 2023", label: "URSSAF — Cotisations T4 2023", amount: 2105, status: "paid", dueDate: "2024-01-05", paidDate: "2024-01-04", type: "urssaf" },
  { id: "SC5", period: "T4 2023", label: "Retraite complémentaire T4 2023", amount: 710, status: "paid", dueDate: "2024-01-15", paidDate: "2024-01-12", type: "retraite" },
  { id: "SC6", period: "T3 2023", label: "URSSAF — Cotisations T3 2023", amount: 1920, status: "paid", dueDate: "2023-10-05", paidDate: "2023-10-03", type: "urssaf" },
  { id: "SC7", period: "T2 2024", label: "URSSAF — Cotisations T2 2024", amount: 1950, status: "upcoming", dueDate: "2024-07-05", type: "urssaf" },
];

const statusConfig: Record<PaymentStatus, { label: string; color: string; icon: typeof CheckCircle }> = {
  paid: { label: "Payée", color: "bg-success/10 text-success", icon: CheckCircle },
  pending: { label: "À payer", color: "bg-warning/10 text-warning", icon: Clock },
  upcoming: { label: "À venir", color: "bg-muted text-muted-foreground", icon: Calendar },
};

const typeConfig = {
  urssaf: { label: "URSSAF", color: "bg-blue-500/10 text-blue-500", icon: Building2 },
  retraite: { label: "Retraite", color: "bg-violet-500/10 text-violet-500", icon: PiggyBank },
  prevoyance: { label: "Prévoyance", color: "bg-emerald-500/10 text-emerald-500", icon: Shield },
};

const cotisationLines = [
  { label: "Maladie-maternité", rate: 6.5, base: 47850, amount: 3110 },
  { label: "Retraite de base", rate: 17.75, base: 42705, amount: 7580 },
  { label: "Retraite complémentaire", rate: 7.0, base: 47850, amount: 3350 },
  { label: "Invalidité-décès", rate: 1.3, base: 47850, amount: 622 },
  { label: "Allocations familiales", rate: 0, base: 47850, amount: 0, note: "Exonéré sous le seuil" },
  { label: "CSG-CRDS", rate: 9.7, base: 46817, amount: 4540 },
  { label: "Formation professionnelle", rate: 0.25, base: 47850, amount: 120 },
];

const historicalData = [
  { period: "T2 2023", urssaf: 1820, retraite: 650, total: 2470 },
  { period: "T3 2023", urssaf: 1920, retraite: 690, total: 2610 },
  { period: "T4 2023", urssaf: 2105, retraite: 710, total: 2815 },
  { period: "T1 2024", urssaf: 1842, retraite: 900, total: 2742 },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function SocialPage() {
  const [periodFilter, setPeriodFilter] = useState<"all" | "T1 2024" | "T4 2023">("all");

  const filtered = payments.filter((p) => {
    if (periodFilter !== "all" && p.period !== periodFilter) return false;
    return true;
  });

  const totalPending = payments.filter((p) => p.status === "pending").reduce((s, p) => s + p.amount, 0);
  const progressPct = Math.round((socialContributions.paid / socialContributions.estimated) * 100);

  return (
    <motion.div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-full overflow-x-hidden" variants={container} initial="hidden" animate="show">

      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-fluid-2xl font-display font-bold">Cotisations sociales</h1>
          <p className="text-sm text-muted-foreground">Suivi URSSAF, retraite et prévoyance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.open("https://www.urssaf.fr", "_blank")}>
            <ExternalLink className="h-3.5 w-3.5 mr-1.5" />URSSAF.fr
          </Button>
          <Button variant="outline" size="sm"><Download className="h-3.5 w-3.5 mr-1.5" />Exporter</Button>
        </div>
      </motion.div>

      {/* KPIs */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Estimé annuel</span>
              <InfoTooltip title="Cotisations sociales estimées" description="Estimation des cotisations sociales dues sur l'année complète, calculée sur la base de votre CA déclaré." formula="CA annuel × taux de cotisations selon votre régime (BNC/BIC services/BIC vente)" benefit="Cette estimation vous permet de provisionner chaque mois la bonne somme pour éviter les mauvaises surprises aux échéances URSSAF." />
            </div>
            <p className="text-fluid-2xl font-display font-bold">{fmt(socialContributions.estimated)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Taux moyen {socialContributions.rate}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-3.5 w-3.5 text-success" />
              <span className="text-xs text-muted-foreground">Déjà réglé</span>
              <InfoTooltip title="Cotisations déjà réglées" description="Total des cotisations sociales effectivement versées à l'URSSAF sur l'année en cours." benefit="Comparez ce montant à l'estimation annuelle pour savoir si vous êtes à jour dans vos versements." />
            </div>
            <p className="text-2xl font-display font-bold text-success">{fmt(socialContributions.paid)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{progressPct}% de l'estimation</p>
          </CardContent>
        </Card>
        <Card className="border-warning/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-3.5 w-3.5 text-warning" />
              <span className="text-xs text-muted-foreground">À payer maintenant</span>
              <InfoTooltip title="Cotisations à payer maintenant" description="Montant des cotisations dont l'échéance est passée ou arrive dans moins de 7 jours." benefit="Réglez rapidement pour éviter les majorations de retard URSSAF (5% + 0.2% par mois de retard)." />
            </div>
            <p className="text-2xl font-display font-bold text-warning">{fmt(totalPending)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{payments.filter(p => p.status === "pending").length} échéances</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Prochaine échéance</span>
              <InfoTooltip title="Prochaine échéance URSSAF" description="Date limite du prochain versement de cotisations sociales à l'URSSAF." benefit="Notez cette date et assurez-vous d'avoir les fonds disponibles. LE BELVEDERE vous enverra un rappel automatique." />
            </div>
            <p className="text-fluid-xl font-display font-bold">
              {new Date(socialContributions.nextDeadline).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{socialContributions.period}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Progress bar */}
      <motion.div variants={item}>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium">Progression annuelle {socialContributions.period}</p>
                <p className="text-xs text-muted-foreground">{fmt(socialContributions.paid)} payés sur {fmt(socialContributions.estimated)} estimés</p>
              </div>
              <span className="text-2xl font-display font-bold text-primary">{progressPct}%</span>
            </div>
            <div className="h-3 rounded-full bg-secondary overflow-hidden">
              <motion.div
                className="h-full rounded-full gradient-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.8, delay: 0.2 }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Payé : {fmt(socialContributions.paid)}</span>
              <span>Restant : {fmt(socialContributions.remaining)}</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="payments">
        <TabsList>
          <TabsTrigger value="payments">Échéancier</TabsTrigger>
          <TabsTrigger value="breakdown">Détail des cotisations</TabsTrigger>
          <TabsTrigger value="history">Évolution</TabsTrigger>
        </TabsList>

        {/* Echéancier */}
        <TabsContent value="payments" className="space-y-4 mt-4">
          <div className="flex gap-1">
            {(["all", "T1 2024", "T4 2023"] as const).map((f) => (
              <Button
                key={f}
                variant={periodFilter === f ? "default" : "outline"}
                size="sm" className={`text-xs h-7 ${periodFilter === f ? "gradient-primary text-primary-foreground" : ""}`}
                onClick={() => setPeriodFilter(f)}
              >
                {f === "all" ? "Toutes" : f}
              </Button>
            ))}
          </div>
          <div className="space-y-3">
            {filtered.map((p) => {
              const sc = statusConfig[p.status];
              const StatusIcon = sc.icon;
              const tc = typeConfig[p.type];
              const TypeIcon = tc.icon;
              return (
                <Card key={p.id} className="border-border/50 hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${tc.color}`}>
                        <TypeIcon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-medium text-sm truncate">{p.label}</p>
                          <Badge variant="secondary" className={`text-[10px] flex-shrink-0 ${sc.color}`}>
                            <StatusIcon className="h-2.5 w-2.5 mr-1" />{sc.label}
                          </Badge>
                        </div>
                        <div className="flex gap-3 text-xs text-muted-foreground">
                          <span className={`flex items-center gap-1 ${tc.color.split(" ")[1]}`}>
                            <span className="font-medium">{tc.label}</span>
                          </span>
                          <span>Échéance : {new Date(p.dueDate).toLocaleDateString("fr-FR")}</span>
                          {p.paidDate && <span className="text-success">Payée le {new Date(p.paidDate).toLocaleDateString("fr-FR")}</span>}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-display font-bold">{fmt(p.amount)}</p>
                        {p.status === "pending" && (
                          <Button size="sm" className="gradient-primary text-primary-foreground text-xs h-7 mt-1">
                            Payer <ChevronRight className="h-3 w-3 ml-0.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Détail cotisations */}
        <TabsContent value="breakdown" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-medium">Détail des cotisations — Base {fmt(47850)}</CardTitle>
                  <InfoTooltip title="Détail des cotisations sociales" description="Décomposition de vos cotisations par organisme : maladie, retraite de base, retraite complémentaire, invalidité-décès, formation professionnelle." benefit="Comprendre la répartition permet d'anticiper les remboursements en cas de maladie ou de faire valoir vos droits à la retraite." />
                </div>
                <p className="text-xs text-muted-foreground">Taux moyen global : {socialContributions.rate}%</p>
              </div>
            </CardHeader>
            <CardContent>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left p-3 font-medium text-muted-foreground">Nature</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Taux</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Base</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {cotisationLines.map((line, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="p-3">
                        <p className="font-medium">{line.label}</p>
                        {line.note && <p className="text-[10px] text-muted-foreground mt-0.5">{line.note}</p>}
                      </td>
                      <td className="p-3 text-right">{line.rate > 0 ? `${line.rate}%` : "—"}</td>
                      <td className="p-3 text-right text-muted-foreground">{fmt(line.base)}</td>
                      <td className="p-3 text-right font-semibold">
                        {line.amount > 0 ? fmt(line.amount) : <span className="text-success">Exonéré</span>}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-muted/30 font-bold">
                    <td className="p-3">Total annuel estimé</td>
                    <td className="p-3 text-right">{socialContributions.rate}%</td>
                    <td className="p-3 text-right">{fmt(47850)}</td>
                    <td className="p-3 text-right text-lg font-display">{fmt(cotisationLines.reduce((s, l) => s + l.amount, 0))}</td>
                  </tr>
                </tbody>
              </table>
              <div className="flex items-start gap-2 mt-4 p-3 rounded-lg bg-info/5 border border-info/20">
                <Info className="h-4 w-4 text-info flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  Les cotisations sont calculées sur la base de votre chiffre d'affaires déclaré. L'estimation peut varier selon votre régime fiscal et votre situation personnelle.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Évolution */}
        <TabsContent value="history" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Cotisations par trimestre</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 16% 90%)" />
                    <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}€`} />
                    <Tooltip formatter={(v: number) => fmt(v)} />
                    <Bar dataKey="urssaf" stackId="a" fill="hsl(210 90% 56%)" name="URSSAF" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="retraite" stackId="a" fill="hsl(250 75% 57%)" name="Retraite" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <PiggyBank className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium">Conseil — Provision recommandée</p>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Pour éviter les mauvaises surprises, nous recommandons de provisionner {socialContributions.rate + 3}% de chaque encaissement sur un compte épargne dédié.
              </p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-lg bg-card">
                  <p className="text-[10px] text-muted-foreground mb-1">CA ce mois</p>
                  <p className="font-bold">{fmt(11750)}</p>
                </div>
                <div className="p-3 rounded-lg bg-card">
                  <p className="text-[10px] text-muted-foreground mb-1">À provisionner</p>
                  <p className="font-bold text-primary">{fmt(Math.round(11750 * (socialContributions.rate + 3) / 100))}</p>
                </div>
                <div className="p-3 rounded-lg bg-card">
                  <p className="text-[10px] text-muted-foreground mb-1">Taux conseillé</p>
                  <p className="font-bold">{socialContributions.rate + 3}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

    </motion.div>
  );
}
