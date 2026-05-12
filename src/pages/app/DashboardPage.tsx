import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InfoTooltip, DASHBOARD_TOOLTIPS } from "@/components/ui/InfoTooltip";
import AIChatbot from "@/components/ui/AIChatbot";
import {
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  Clock, AlertTriangle, CheckCircle, Users, Package,
  Bot, Filter, Download, RefreshCw, Loader2, WifiOff,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/contexts/AuthContext";
import { useDemo } from "@/contexts/DemoContext";

// Données mock — utilisées UNIQUEMENT en mode /demo/*
import {
  dashboardKPIs as mockKpi,
  revenueChartData as mockRevenue,
  cashflowForecast as mockCashflow,
  topClients as mockTopClients,
  recentInvoices as mockRecentInvoices,
  aiRecommendations as mockAiRec,
  topProducts as mockTopProducts,
} from "@/lib/mock-data";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
const pct = (n: number) => `${n > 0 ? "+" : ""}${n}%`;

const statusColors: Record<string, string> = {
  paid: "bg-success/10 text-success", sent: "bg-info/10 text-info",
  overdue: "bg-destructive/10 text-destructive", draft: "bg-muted text-muted-foreground",
  accepted: "bg-success/10 text-success", pending: "bg-warning/10 text-warning",
  rejected: "bg-destructive/10 text-destructive",
};
const statusLabels: Record<string, string> = {
  paid: "Payée", sent: "Envoyée", overdue: "En retard", draft: "Brouillon",
  accepted: "Accepté", pending: "En attente", rejected: "Refusé",
};
const alertIcons  = { warning: AlertTriangle, danger: AlertTriangle, info: Clock, success: CheckCircle };
const alertColors = { warning: "text-warning", danger: "text-destructive", info: "text-info", success: "text-success" };

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item      = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

export default function DashboardPage() {
  // ── Hooks (tous avant tout return conditionnel) ────────────────────────────
  const { user }   = useAuth();
  const demo       = useDemo();
  const isDemo     = !!demo?.isDemo;
  const [period, setPeriod] = useState<"month" | "quarter" | "year">("month");

  const { data: apiReport, loading: loadingReport, error: reportError, refetch: refetchReport }
    = useApi<any>(`/api/reports/dashboard?period=${period}`, { skip: isDemo });

  const loading = !isDemo && loadingReport;

  // ── Résolution des données ────────────────────────────────────────────────
  // /demo/* → données mock garanties · /app/* → API uniquement
  const kpi               = isDemo ? mockKpi          : (apiReport?.kpis             ?? null);
  const revenueChartData  = isDemo ? mockRevenue      : (apiReport?.revenueChart      ?? []);
  const cashflowForecast  = isDemo ? mockCashflow     : (apiReport?.cashflow          ?? []);
  const topClients        = isDemo ? mockTopClients   : (apiReport?.topClients        ?? []);
  const recentInvoices    = isDemo ? mockRecentInvoices : (apiReport?.recentInvoices  ?? []);
  const alerts            = isDemo ? []               : (apiReport?.alerts            ?? []);
  const aiRecommendations = isDemo ? mockAiRec        : (apiReport?.aiRecommendations ?? []);
  const topProducts       = isDemo ? mockTopProducts  : (apiReport?.topProducts       ?? []);

  // ── États loading / erreur (uniquement en mode réel) ─────────────────────
  if (!isDemo && loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] gap-4 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm">Chargement du tableau de bord…</p>
      </div>
    );
  }

  if (!isDemo && !loading && (reportError || !kpi)) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
          <WifiOff className="h-8 w-8 text-destructive" />
        </div>
        <div className="text-center">
          <p className="font-display font-semibold">Impossible de charger le tableau de bord</p>
          <p className="text-sm text-muted-foreground mt-1">
            {reportError ?? "Le serveur ne répond pas. Vérifiez votre connexion."}
          </p>
        </div>
        <Button variant="outline" onClick={refetchReport}>
          <RefreshCw className="h-4 w-4 mr-2" />Réessayer
        </Button>
      </div>
    );
  }

  // À partir d'ici, kpi est garanti non-null (isDemo=true ou API a répondu)
  const safeKpi = kpi!;

  const pieData = [
    { name: "Payées",     value: safeKpi.invoicesPaid    ?? 0, color: "hsl(152 60% 42%)" },
    { name: "En attente", value: safeKpi.invoicesPending ?? 0, color: "hsl(210 90% 56%)" },
    { name: "En retard",  value: safeKpi.invoicesOverdue ?? 0, color: "hsl(0 72% 55%)"   },
  ];

  return (
    <>
      <motion.div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-full overflow-x-hidden" variants={container} initial="hidden" animate="show">

        {/* Header */}
        <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-fluid-2xl font-display font-bold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              {user
                ? `Bonjour ${user.firstName} — ${user.orgName}`
                : "Vue d'ensemble de votre activité"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm"><Filter className="h-3.5 w-3.5 mr-1.5" />Filtres</Button>
            <Button variant="outline" size="sm"><Download className="h-3.5 w-3.5 mr-1.5" />Exporter</Button>
            <Button
              variant="outline" size="sm"
              onClick={refetchReport}
              disabled={loading || isDemo}
            >
              {loading
                ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                : <RefreshCw className="h-3.5 w-3.5 mr-1.5" />}
              Actualiser
            </Button>
          </div>
        </motion.div>

        {/* Period tabs */}
        <Tabs value={period} onValueChange={(v) => setPeriod(v as any)}>
          <TabsList>
            <TabsTrigger value="month">Ce mois</TabsTrigger>
            <TabsTrigger value="quarter">Trimestre</TabsTrigger>
            <TabsTrigger value="year">Année</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* KPI Grid */}
        <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
          <KPICard label="CA mensuel"    value={fmt(safeKpi.revenueMonthly ?? 0)} change={pct(safeKpi.revenueGrowth ?? 0)} up
            tooltip={<InfoTooltip {...DASHBOARD_TOOLTIPS.caHT} />} />
          <KPICard label="Encaissements" value={fmt(safeKpi.cashIn ?? 0)}
            icon={<ArrowUpRight className="h-4 w-4 text-success" />}
            tooltip={<InfoTooltip {...DASHBOARD_TOOLTIPS.caTTC} />} />
          <KPICard label="Décaissements" value={fmt(safeKpi.cashOut ?? 0)}
            icon={<ArrowDownRight className="h-4 w-4 text-destructive" />}
            tooltip={<InfoTooltip {...DASHBOARD_TOOLTIPS.tvaCollectee} icon="i" />} />
          <KPICard label="Résultat net"  value={fmt(safeKpi.netResult ?? 0)} change={pct(safeKpi.margin ?? 0)} up
            tooltip={<InfoTooltip {...DASHBOARD_TOOLTIPS.panierMoyen} />} />
          <KPICard label="Impayés" value={fmt(safeKpi.unpaid ?? 0)} sub={`${safeKpi.unpaidCount ?? 0} factures`} warning
            tooltip={<InfoTooltip {...DASHBOARD_TOOLTIPS.facturesEnRetard} icon="?" />} />
          <KPICard label="DSO" value={`${safeKpi.dso ?? 0}j`} sub="Délai moyen"
            tooltip={<InfoTooltip {...DASHBOARD_TOOLTIPS.delaiPaiement} />} />
        </motion.div>

        {/* Charts row */}
        <motion.div variants={item} className="grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-1.5">
                Évolution CA & Charges
                <InfoTooltip
                  title="Évolution CA & Charges"
                  description="Comparaison mensuelle entre votre chiffre d'affaires encaissé (PAID) et vos charges déclarées."
                  formula="CA = Σ factures PAID par mois · Charges = dépenses déclarées sur la même période"
                  benefit="Identifiez vos mois les plus performants et anticipez les creux de trésorerie." />
              </CardTitle>
            </CardHeader>
            <CardContent>
              {revenueChartData.length === 0 ? (
                <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
                  Aucune donnée sur cette période.
                </div>
              ) : (
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueChartData}>
                      <defs>
                        <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%"   stopColor="hsl(250 75% 57%)" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="hsl(250 75% 57%)" stopOpacity={0}   />
                        </linearGradient>
                        <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%"   stopColor="hsl(0 72% 55%)" stopOpacity={0.15} />
                          <stop offset="100%" stopColor="hsl(0 72% 55%)" stopOpacity={0}    />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 16% 90%)" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(220 10% 46%)" />
                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(220 10% 46%)" tickFormatter={(v) => `${v / 1000}k`} />
                      <Tooltip formatter={(v: number) => fmt(v)} />
                      <Area type="monotone" dataKey="revenue"  stroke="hsl(250 75% 57%)" fill="url(#gRev)" strokeWidth={2}   name="CA" />
                      <Area type="monotone" dataKey="expenses" stroke="hsl(0 72% 55%)"   fill="url(#gExp)" strokeWidth={1.5} name="Charges" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-1.5">
                État des factures
                <InfoTooltip
                  title="État des factures"
                  description="Répartition de toutes vos factures actives par statut sur la période sélectionnée."
                  formula="% = (nb factures par statut ÷ total) × 100"
                  benefit="Un ratio élevé de factures payées indique une bonne santé de trésorerie." />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-2">
                {pieData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                      <span className="text-muted-foreground">{d.name}</span>
                    </div>
                    <span className="font-medium">{d.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Forecast + Taux conversion */}
        <motion.div variants={item} className="grid lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-1.5">
                Trésorerie prévisionnelle
                <InfoTooltip {...DASHBOARD_TOOLTIPS.tresoreriePrevisionnelle} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cashflowForecast.length === 0 ? (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                  Aucune projection disponible.
                </div>
              ) : (
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cashflowForecast}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 16% 90%)" />
                      <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v / 1000}k`} />
                      <Tooltip formatter={(v: number) => fmt(v)} />
                      <Bar dataKey="pessimistic" fill="hsl(0 72% 55% / 0.3)"   radius={[4, 4, 0, 0]} name="Pessimiste" />
                      <Bar dataKey="realistic"   fill="hsl(250 75% 57% / 0.6)" radius={[4, 4, 0, 0]} name="Réaliste" />
                      <Bar dataKey="optimistic"  fill="hsl(152 60% 42% / 0.6)" radius={[4, 4, 0, 0]} name="Optimiste" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-1.5">
                Taux de conversion devis
                <InfoTooltip {...DASHBOARD_TOOLTIPS.tauxConversion} />
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[200px]">
              <div className="text-center">
                <div className="text-5xl font-display font-bold text-primary">
                  {safeKpi.quoteConversionRate ?? safeKpi.conversionRate ?? 0}
                  <span className="text-2xl">%</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">des devis envoyés acceptés</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bottom row */}
        <motion.div variants={item} className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Alertes */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <span>Alertes</span>
                <InfoTooltip
                  title="Alertes"
                  description="Notifications automatiques sur les factures en retard, devis expirés et seuils de TVA approchant."
                  benefit="Réagissez rapidement avant que les situations ne se dégradent." icon="?" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {alerts.length === 0 ? (
                <p className="text-xs text-muted-foreground">Aucune alerte active.</p>
              ) : (
                alerts.map((a: any, i: number) => {
                  const Icon = alertIcons[a.type as keyof typeof alertIcons] ?? AlertTriangle;
                  return (
                    <div key={i} className="flex gap-2.5 text-xs">
                      <Icon className={`h-3.5 w-3.5 mt-0.5 flex-shrink-0 ${alertColors[a.type as keyof typeof alertColors] ?? ""}`} />
                      <div>
                        <p className="font-medium">{a.title}</p>
                        <p className="text-muted-foreground">{a.description}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* AI Recommendations */}
          <Card className="border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Bot className="h-4 w-4 text-primary" />
                <span>Recommandations IA</span>
                <InfoTooltip
                  title="Recommandations IA"
                  description="Suggestions personnalisées générées par l'IA en analysant vos données : retards récurrents, opportunités de relance, optimisations."
                  benefit="Gagnez du temps sur les actions répétitives grâce aux suggestions contextuelles." />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {aiRecommendations.length === 0 ? (
                <p className="text-xs text-muted-foreground">Aucune recommandation disponible.</p>
              ) : (
                aiRecommendations.map((r: any, i: number) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-start gap-2">
                      <span className="text-sm">{r.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium">{r.title}</p>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">{r.description}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="h-6 text-[10px] w-full">{r.action}</Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Top Clients */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Top Clients</span>
                <InfoTooltip
                  title="Top Clients"
                  description="Classement de vos 5 meilleurs clients par chiffre d'affaires encaissé (factures PAID) sur la période."
                  formula="Tri par Σ totalTTC des factures PAID par client"
                  benefit="Identifiez vos clients stratégiques et adaptez votre relation commerciale." />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {topClients.length === 0 ? (
                <p className="text-xs text-muted-foreground">Aucun client sur cette période.</p>
              ) : (
                topClients.map((c: any, i: number) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">{i + 1}</div>
                      <div>
                        <p className="text-xs font-medium">{c.name}</p>
                        <p className="text-[10px] text-muted-foreground">{c.invoices} factures</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold">{fmt(c.revenue)}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Top Services */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span>Top Services</span>
                <InfoTooltip
                  title="Top Services"
                  description="Vos prestations ou produits les plus facturés en valeur sur la période."
                  formula="Tri par Σ totalHT des lignes de facture par désignation"
                  benefit="Concentrez vos efforts commerciaux sur ce qui génère le plus de valeur." />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {topProducts.length === 0 ? (
                <p className="text-xs text-muted-foreground">Aucune donnée de service disponible.</p>
              ) : (
                topProducts.map((p: any, i: number) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">{p.name}</span>
                      <span className="text-muted-foreground">{fmt(p.revenue)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full gradient-primary"
                        style={{ width: `${(p.revenue / topProducts[0].revenue) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Dernières factures */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-1.5">
                  Dernières factures
                  <InfoTooltip {...DASHBOARD_TOOLTIPS.invoices} />
                </CardTitle>
                <Link to="/app/sales/invoices"><Button variant="ghost" size="sm" className="text-xs">Voir tout →</Button></Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentInvoices.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Aucune facture récente.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium text-muted-foreground">N°</th>
                        <th className="text-left py-2 font-medium text-muted-foreground">Client</th>
                        <th className="text-left py-2 font-medium text-muted-foreground">Date</th>
                        <th className="text-right py-2 font-medium text-muted-foreground">Montant</th>
                        <th className="text-right py-2 font-medium text-muted-foreground">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentInvoices.map((inv: any) => (
                        <tr key={inv.id} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="py-2.5 font-mono">{inv.id}</td>
                          <td className="py-2.5">{inv.client}</td>
                          <td className="py-2.5 text-muted-foreground">
                            {new Date(inv.date).toLocaleDateString("fr-FR")}
                          </td>
                          <td className="py-2.5 text-right font-medium">{fmt(inv.amount)}</td>
                          <td className="py-2.5 text-right">
                            <Badge variant="secondary" className={`text-[10px] ${statusColors[inv.status] ?? ""}`}>
                              {statusLabels[inv.status] ?? inv.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

      </motion.div>

      <AIChatbot
        orgName={user?.orgName ?? "Mon Entreprise"}
        activity="freelance"
        userName={user?.firstName ?? ""}
      />
    </>
  );
}

// ─── KPICard ──────────────────────────────────────────────────────────────────
function KPICard({ label, value, change, up, sub, warning, icon, tooltip }: {
  label:    string;
  value:    string;
  change?:  string;
  up?:      boolean;
  sub?:     string;
  warning?: boolean;
  icon?:    React.ReactNode;
  tooltip?: React.ReactNode;
}) {
  return (
    <Card className={warning ? "border-warning/30" : ""}>
      <CardContent className="p-3.5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium leading-tight">{label}</span>
          <div className="flex items-center gap-1">
            {icon}
            {tooltip}
          </div>
        </div>
        <div className={`text-lg font-display font-bold ${warning ? "text-warning" : ""}`}>{value}</div>
        {change && (
          <div className={`flex items-center gap-1 text-[10px] mt-0.5 ${up ? "text-success" : "text-destructive"}`}>
            {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {change}
          </div>
        )}
        {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}
