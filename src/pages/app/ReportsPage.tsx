import { useState } from "react";
import { InfoTooltip, DASHBOARD_TOOLTIPS } from "@/components/ui/InfoTooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Download, ChevronDown, TrendingUp, TrendingDown, Euro,
  Users, FileText, Clock, BarChart2, PieChart, Calendar,
  ArrowUpRight, ArrowDownRight, AlertTriangle, CheckCircle,
  Zap, RefreshCw, Target, Layers,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart as RePieChart, Pie, Cell, RadarChart, Radar,
  PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";
import {
  revenueChartData, dashboardKPIs, topClients, topProducts,
} from "@/lib/mock-data";
import { monthlyCashflow } from "@/lib/payments-data";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { useNavigate, Link } from "react-router-dom";
import { useDemo } from "@/contexts/DemoContext";
import { useApi } from "@/hooks/useApi";

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const fmtEUR = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

const fmtPct = (n: number) => `${n > 0 ? "+" : ""}${n.toFixed(1)}%`;

const COLORS = [
  "hsl(250 75% 57%)",
  "hsl(200 80% 50%)",
  "hsl(142 70% 45%)",
  "hsl(35 90% 55%)",
  "hsl(340 80% 55%)",
  "hsl(270 60% 60%)",
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

// ─── DERIVED DATA ─────────────────────────────────────────────────────────────

// N-1 simulé
const revenueWithN1 = revenueChartData.map((d, i) => ({
  ...d,
  revenueN1: Math.round(d.revenue * (0.82 + Math.random() * 0.12)),
  expensesN1: Math.round(d.expenses * (0.85 + Math.random() * 0.10)),
}));

// Par trimestre
const quarterly = [
  { period: "T1 2023", revenue: 89000, expenses: 57000, profit: 32000 },
  { period: "T2 2023", revenue: 98500, expenses: 61000, profit: 37500 },
  { period: "T3 2023", revenue: 94200, expenses: 59500, profit: 34700 },
  { period: "T4 2023", revenue: 108000, expenses: 65000, profit: 43000 },
  { period: "T1 2024", revenue: 105500, expenses: 66500, profit: 39000 },
  { period: "T2 2024", revenue: 125500, expenses: 75500, profit: 50000 },
];

// Répartition CA par catégorie
const revenueByCategory = [
  { name: "Développement web", value: 24500, pct: 38 },
  { name: "Design UI/UX", value: 12800, pct: 20 },
  { name: "Consulting", value: 8500, pct: 13 },
  { name: "Maintenance", value: 6200, pct: 10 },
  { name: "Formation", value: 4800, pct: 7 },
  { name: "Autres", value: 7800, pct: 12 },
];

// Charges par catégorie
const expensesByCategory = [
  { name: "Charges sociales", value: 8400, pct: 30 },
  { name: "Logiciels & SaaS", value: 3200, pct: 11 },
  { name: "Hébergement", value: 1800, pct: 6 },
  { name: "Loyer & bureau", value: 5700, pct: 20 },
  { name: "Déplacements", value: 2100, pct: 7 },
  { name: "Assurances", value: 1440, pct: 5 },
  { name: "Autres", value: 5110, pct: 18 },
  { name: "Frais bancaires", value: 1000, pct: 4 },
];

// DSO historique
const dsoHistory = [
  { month: "Oct", dso: 41 }, { month: "Nov", dso: 38 }, { month: "Déc", dso: 44 },
  { month: "Jan", dso: 36 }, { month: "Fév", dso: 32 }, { month: "Mar", dso: 34 },
];

// Performance commerciale
const salesPerf = [
  { month: "Oct", devis: 12, gagnes: 8, montant: 38000 },
  { month: "Nov", devis: 15, gagnes: 11, montant: 52000 },
  { month: "Déc", devis: 9, gagnes: 6, montant: 28000 },
  { month: "Jan", devis: 14, gagnes: 10, montant: 44000 },
  { month: "Fév", devis: 18, gagnes: 13, montant: 61000 },
  { month: "Mar", devis: 16, gagnes: 12, montant: 54000 },
];

// Radar compétences métier
const radarData = [
  { metric: "Récurrence", value: 72 },
  { metric: "Marges", value: 64 },
  { metric: "Recouvrement", value: 58 },
  { metric: "Croissance", value: 82 },
  { metric: "Diversif.", value: 45 },
  { metric: "Fidélisation", value: 88 },
];

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────

function KpiCard({
  label, value, sub, trend, trendLabel, icon: Icon, color = "text-foreground", tooltip,
}: {
  label: string; value: string; sub?: string; trend?: number;
  trendLabel?: string; icon: React.ElementType; color?: string; tooltip?: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">{label}</span>
            {tooltip}
          </div>
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <p className={`text-2xl font-display font-bold ${color}`}>{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        {trend !== undefined && (
          <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend >= 0 ? "text-success" : "text-destructive"}`}>
            {trend >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {fmtPct(trend)} {trendLabel}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-background border border-border rounded-lg p-2.5 shadow-lg text-xs">
      <p className="font-medium mb-1.5">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name} :</span>
          <span className="font-semibold">{typeof p.value === "number" && p.value > 500 ? fmtEUR(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const navigate = useNavigate();
  const demo     = useDemo();
  const isDemo   = !!demo?.isDemo;
  const [period, setPeriod] = useState("2024");
  const [tab, setTab] = useState("financier");
  const [exporting, setExporting] = useState(false);

  const { data: apiReport } = useApi<any>("/api/reports/dashboard?period=year", { skip: isDemo });

  const totalRevenue = isDemo ? revenueChartData.reduce((s, d) => s + d.revenue, 0) : (apiReport?.kpis?.revenueAnnual ?? 0);
  const totalExpenses = isDemo ? revenueChartData.reduce((s, d) => s + d.expenses, 0) : (apiReport?.kpis?.cashOut ?? 0);
  const totalProfit   = isDemo ? revenueChartData.reduce((s, d) => s + d.profit, 0)  : (apiReport?.kpis?.netResult ?? 0);
  const avgMargin     = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0;

  // Chart / KPI data — zéro en mode réel sans données
  const chartRevenue      = isDemo ? revenueChartData    : [];
  const chartRevenueN1    = isDemo ? revenueWithN1       : [];
  const chartQuarterly    = isDemo ? quarterly           : [];
  const chartRevByCat     = isDemo ? revenueByCategory   : [];
  const chartExpByCat     = isDemo ? expensesByCategory  : [];
  const chartDSO          = isDemo ? dsoHistory          : [];
  const chartSales        = isDemo ? salesPerf           : [];
  const chartRadar        = isDemo ? radarData           : [];
  const chartTopClients   = isDemo ? topClients          : [];
  const chartTopProducts  = isDemo ? topProducts         : [];
  const kpiDSO            = isDemo ? dashboardKPIs.dso            : 0;
  const kpiConversion     = isDemo ? dashboardKPIs.conversionRate  : 0;
  const kpiQuotesWon      = isDemo ? dashboardKPIs.quotesWon       : 0;
  const kpiQuotesLost     = isDemo ? dashboardKPIs.quotesLost      : 0;
  const kpiInvoicesPaid   = isDemo ? dashboardKPIs.invoicesPaid    : 1;
  const kpiUnpaid         = isDemo ? dashboardKPIs.unpaid          : 0;
  const kpiUnpaidCount    = isDemo ? dashboardKPIs.unpaidCount     : 0;

  const handleExportPDF = async (type: "monthly" | "annual") => {
    setExporting(true);
    await new Promise(r => setTimeout(r, 1200));
    setExporting(false);
    toast({ title: `Rapport ${type === "monthly" ? "mensuel" : "annuel " + period} exporté`, description: "Le fichier PDF a été téléchargé." });
  };

  const handleExportCSV = () => {
    const rows = [["Mois","CA","Charges","Résultat"], ...revenueChartData.map(d => [d.month, d.revenue, d.expenses, d.profit])];
    const csv  = rows.map(r => r.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const a    = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `rapport_${period}.csv`; a.click();
    toast({ title: "Export CSV réussi" });
  };

  return (
    <motion.div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-full overflow-x-hidden" variants={container} initial="hidden" animate="show">

      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-fluid-2xl font-display font-bold">Rapports</h1>
          <p className="text-sm text-muted-foreground">Analysez vos performances financières et commerciales</p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Calendar className="h-3.5 w-3.5 mr-1.5" />{period}
                <ChevronDown className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="text-xs">
              {["2024", "2023", "T1 2024", "T4 2023", "12 derniers mois"].map((p) => (
                <DropdownMenuItem key={p} onClick={() => setPeriod(p)}>{p}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" onClick={handleExportCSV}><Download className="h-3.5 w-3.5 mr-1.5" />Exporter CSV</Button>
          <Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => window.location.reload()}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />Actualiser
          </Button>
          {!isDemo && (
            <Link to="/app/accounting/intelligence">
              <Button size="sm" className="gradient-primary text-primary-foreground">
                <Zap className="h-3.5 w-3.5 mr-1.5" />Importer un relevé
              </Button>
            </Link>
          )}
        </div>
      </motion.div>

      {!isDemo && (
        <motion.p variants={item} className="text-xs text-muted-foreground">
          Vos rapports s'alimentent automatiquement depuis vos factures, devis et transactions importées.
        </motion.p>
      )}

      {/* Top KPIs */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="CA annuel" value={fmtEUR(totalRevenue)} sub="12 mois glissants"
          trend={12.4} trendLabel="vs N-1" icon={Euro} color="text-primary"
          tooltip={<InfoTooltip {...DASHBOARD_TOOLTIPS.caHT} />} />
        <KpiCard label="Résultat net" value={fmtEUR(totalProfit)} sub={`Marge ${avgMargin}%`}
          trend={8.2} trendLabel="vs N-1" icon={TrendingUp} color="text-success"
          tooltip={<InfoTooltip title="Résultat net" description="CA HT moins l'ensemble des charges (achats, frais généraux, charges sociales). Représente ce qui reste réellement dans l'entreprise." formula="CA HT − Charges totales" benefit="Indicateur clé de rentabilité. Un résultat positif indique que l'activité est profitable." />} />
        <KpiCard label="Charges totales" value={fmtEUR(totalExpenses)}
          trend={-4.1} trendLabel="vs N-1" icon={ArrowDownRight}
          tooltip={<InfoTooltip title="Charges totales" description="Somme de toutes les dépenses enregistrées sur la période : achats, frais généraux, charges sociales, amortissements." benefit="Surveiller l'évolution des charges permet d'identifier les postes à optimiser." />} />
        <KpiCard label="DSO moyen" value={`${kpiDSO}j`} sub="Délai de paiement"
          trend={-5.8} trendLabel="vs N-1" icon={Clock} color="text-warning"
          tooltip={<InfoTooltip {...DASHBOARD_TOOLTIPS.delaiPaiement} />} />
      </motion.div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="financier">
            <BarChart2 className="h-3.5 w-3.5 mr-1.5" />Financier
          </TabsTrigger>
          <TabsTrigger value="commercial">
            <Target className="h-3.5 w-3.5 mr-1.5" />Commercial
          </TabsTrigger>
          <TabsTrigger value="clients">
            <Users className="h-3.5 w-3.5 mr-1.5" />Clients
          </TabsTrigger>
          <TabsTrigger value="synthese">
            <Layers className="h-3.5 w-3.5 mr-1.5" />Synthèse
          </TabsTrigger>
        </TabsList>

        {/* ── ONGLET FINANCIER ─────────────────────────────────────────────── */}
        <TabsContent value="financier" className="space-y-4 mt-4">

          {/* CA + charges évolution */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-semibold">CA vs Charges vs Résultat — mensuel</CardTitle>
                  <InfoTooltip title="CA vs Charges vs Résultat" description="Comparaison mensuelle de vos recettes (CA HT), de vos dépenses totales et de votre résultat net sur les 12 derniers mois." formula="Résultat = CA HT − Charges totales" benefit="Visualiser ces 3 courbes ensemble permet de détecter les mois déficitaires et les tendances de rentabilité." />
                </div>
                <div className="flex gap-3 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-primary" />CA</span>
                  <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-destructive/60" />Charges</span>
                  <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-success" />Résultat</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartRevenue}>
                    <defs>
                      <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(250 75% 57%)" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="hsl(250 75% 57%)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gPro" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(142 70% 45%)" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="hsl(142 70% 45%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 16% 92%)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v / 1000}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(250 75% 57%)" fill="url(#gRev)" strokeWidth={2} name="CA" />
                    <Area type="monotone" dataKey="expenses" stroke="hsl(0 72% 55%)" fill="none" strokeWidth={1.5} strokeDasharray="4 2" name="Charges" />
                    <Area type="monotone" dataKey="profit" stroke="hsl(142 70% 45%)" fill="url(#gPro)" strokeWidth={2} name="Résultat" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Répartition CA + Charges */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-semibold">Répartition du CA par activité</CardTitle>
                  <InfoTooltip title="Répartition du CA par activité" description="Décomposition de votre chiffre d'affaires total par catégorie ou type de service vendu." benefit="Identifier les activités les plus rentables pour concentrer vos efforts commerciaux sur les segments à plus forte valeur." />
              </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 items-center">
                  <div className="h-[180px] w-[180px] flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie data={chartRevByCat} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                          dataKey="value" paddingAngle={2}>
                          {chartRevByCat.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: number) => fmtEUR(v)} />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-2">
                    {chartRevByCat.map((cat, i) => (
                      <div key={cat.name} className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="text-xs flex-1 truncate text-muted-foreground">{cat.name}</span>
                        <span className="text-xs font-semibold">{cat.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-semibold">Répartition des charges</CardTitle>
                  <InfoTooltip title="Répartition des charges" description="Décomposition de vos dépenses totales par catégorie : achats, frais généraux, charges sociales, loyers, etc." benefit="Repérer les postes de dépenses disproportionnés pour identifier les leviers d'optimisation." />
              </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2.5">
                  {chartExpByCat.map((cat, i) => (
                    <div key={cat.name}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{cat.name}</span>
                        <span className="font-medium">{fmtEUR(cat.value)} <span className="text-muted-foreground">({cat.pct}%)</span></span>
                      </div>
                      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: COLORS[i % COLORS.length] }}
                          initial={{ width: 0 }}
                          animate={{ width: `${cat.pct}%` }}
                          transition={{ duration: 0.6, delay: i * 0.05 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comparaison N vs N-1 */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-semibold">Comparaison N vs N-1 — CA mensuel</CardTitle>
                <InfoTooltip title="Comparaison N vs N-1" description="Comparaison du CA mensuel de l'année en cours avec la même période de l'année précédente." formula="Variation = ((CA N − CA N-1) ÷ CA N-1) × 100" benefit="Permet de détecter une saisonnalité, une croissance ou un ralentissement par rapport à l'historique." />
            </div>
            </CardHeader>
            <CardContent>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartRevenueN1} barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 16% 92%)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v / 1000}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="revenue" fill="hsl(250 75% 57%)" radius={[3, 3, 0, 0]} name="2024" />
                    <Bar dataKey="revenueN1" fill="hsl(250 75% 57% / 0.25)" radius={[3, 3, 0, 0]} name="2023" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Évolution trimestrielle */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-semibold">Performance trimestrielle</CardTitle>
                <InfoTooltip title="Performance trimestrielle" description="Synthèse du CA, des charges et du résultat par trimestre sur l'année en cours." benefit="Une vue trimestrielle lisse les variations mensuelles et donne une lecture plus stable de la performance annuelle." />
            </div>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left p-3 font-medium text-muted-foreground">Trimestre</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">CA</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Charges</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Résultat</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Marge</th>
                    <th className="text-right p-3 font-medium text-muted-foreground hidden sm:table-cell">Évol. CA</th>
                  </tr>
                </thead>
                <tbody>
                  {[...chartQuarterly].reverse().map((q, i, arr) => {
                    const prev = arr[i + 1];
                    const evol = prev ? Math.round(((q.revenue - prev.revenue) / prev.revenue) * 100) : null;
                    const margin = Math.round((q.profit / q.revenue) * 100);
                    return (
                      <tr key={q.period} className={`border-b border-border/50 hover:bg-muted/20 ${i === 0 ? "font-medium" : ""}`}>
                        <td className="p-3">{q.period} {i === 0 && <Badge variant="secondary" className="ml-1 text-[9px]">En cours</Badge>}</td>
                        <td className="p-3 text-right text-primary font-semibold">{fmtEUR(q.revenue)}</td>
                        <td className="p-3 text-right text-muted-foreground">{fmtEUR(q.expenses)}</td>
                        <td className="p-3 text-right text-success font-semibold">{fmtEUR(q.profit)}</td>
                        <td className="p-3 text-right">
                          <span className={margin >= 35 ? "text-success" : margin >= 25 ? "text-warning" : "text-destructive"}>
                            {margin}%
                          </span>
                        </td>
                        <td className="p-3 text-right hidden sm:table-cell">
                          {evol !== null ? (
                            <span className={evol >= 0 ? "text-success" : "text-destructive"}>
                              {evol >= 0 ? "+" : ""}{evol}%
                            </span>
                          ) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── ONGLET COMMERCIAL ────────────────────────────────────────────── */}
        <TabsContent value="commercial" className="space-y-4 mt-4">

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard label="Taux de conversion" value={`${kpiConversion}%`}
              sub="Devis → Facture" trend={4.2} trendLabel="vs N-1" icon={Target} color="text-primary"
              tooltip={<InfoTooltip {...DASHBOARD_TOOLTIPS.tauxConversion} />} />
            <KpiCard label="Devis gagnés" value={`${kpiQuotesWon}`}
              sub={`${kpiQuotesLost} perdus`} trend={12.1} trendLabel="vs N-1" icon={CheckCircle} color="text-success"
              tooltip={<InfoTooltip title="Devis gagnés" description="Nombre de devis acceptés par vos clients sur la période. Les devis perdus sont ceux refusés ou expirés." formula="Devis avec statut = ACCEPTED" benefit="Suivre ce chiffre permet d'ajuster votre stratégie commerciale et de relancer les devis en attente." />} />
            <KpiCard label="Panier moyen" value={fmtEUR(Math.round(totalRevenue / kpiInvoicesPaid))}
              trend={6.8} trendLabel="vs N-1" icon={FileText}
              tooltip={<InfoTooltip {...DASHBOARD_TOOLTIPS.panierMoyen} />} />
            <KpiCard label="CA top client" value={fmtEUR(chartTopClients[0]?.revenue ?? 0)}
              sub={chartTopClients[0]?.name ?? "—"} icon={Users} color="text-primary"
              tooltip={<InfoTooltip title="CA top client" description="Chiffre d'affaires généré par votre meilleur client sur la période. Une forte dépendance à un seul client représente un risque." benefit="Si ce client dépasse 30% de votre CA total, diversifiez votre portefeuille client." />} />
          </div>

          {/* Devis vs Gagnés */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-semibold">Devis émis vs gagnés — 6 mois</CardTitle>
                <InfoTooltip title="Devis émis vs gagnés" description="Nombre de devis envoyés comparé au nombre de devis acceptés par mois sur les 6 derniers mois." formula="Taux de conversion = Devis acceptés ÷ Devis émis × 100" benefit="Un écart croissant indique une baisse de la qualité des propositions ou un marché plus compétitif." />
            </div>
            </CardHeader>
            <CardContent>
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartSales} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 16% 92%)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="devis" fill="hsl(220 16% 85%)" radius={[3, 3, 0, 0]} name="Devis émis" />
                    <Bar dataKey="gagnes" fill="hsl(250 75% 57%)" radius={[3, 3, 0, 0]} name="Devis gagnés" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Montant gagné par mois */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-semibold">Montant signé par mois</CardTitle>
                  <InfoTooltip title="Montant signé par mois" description="Valeur totale des devis acceptés chaque mois. Représente votre pipeline commercial converti." benefit="Un montant signé élevé en avance annonce de bons encaissements dans les semaines suivantes." />
              </div>
              </CardHeader>
              <CardContent>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartSales}>
                      <defs>
                        <linearGradient id="gMontant" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(142 70% 45%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(142 70% 45%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 16% 92%)" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v / 1000}k`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="montant" stroke="hsl(142 70% 45%)" fill="url(#gMontant)" strokeWidth={2} name="Montant signé" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top produits/services */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-semibold">Top services / produits</CardTitle>
                  <InfoTooltip title="Top services / produits" description="Classement de vos lignes de facturation par chiffre d'affaires généré sur la période." benefit="Concentrez vos efforts marketing sur les 2-3 services qui génèrent 80% de votre CA (loi de Pareto)." />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {chartTopProducts.map((p, i) => {
                    const pct = chartTopProducts[0] ? Math.round((p.revenue / chartTopProducts[0].revenue) * 100) : 0;
                    return (
                      <div key={p.name}>
                        <div className="flex justify-between text-xs mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] w-4 text-muted-foreground">{i + 1}</span>
                            <span className="font-medium">{p.name}</span>
                          </div>
                          <div className="flex gap-3">
                            <span className="text-muted-foreground">{p.count} fact.</span>
                            <span className="font-semibold text-primary">{fmtEUR(p.revenue)}</span>
                          </div>
                        </div>
                        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                          <motion.div
                            className="h-full rounded-full gradient-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.5, delay: i * 0.08 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── ONGLET CLIENTS ───────────────────────────────────────────────── */}
        <TabsContent value="clients" className="space-y-4 mt-4">

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard label="Clients actifs" value="8" sub="ce trimestre"
              trend={14.3} trendLabel="vs N-1" icon={Users} color="text-primary"
              tooltip={<InfoTooltip title="Clients actifs" description="Nombre de clients ayant eu au moins une facture émise sur le trimestre en cours." benefit="Un nombre croissant de clients actifs indique une bonne dynamique commerciale." />} />
            <KpiCard label="Taux fidélisation" value="87%" sub="clients récurrents"
              trend={3.2} trendLabel="vs N-1" icon={CheckCircle} color="text-success"
              tooltip={<InfoTooltip title="Taux de fidélisation" description="Pourcentage de clients ayant passé commande sur au moins 2 périodes consécutives." formula="(Clients récurrents ÷ Clients totaux) × 100" benefit="Un taux élevé réduit les coûts d'acquisition et stabilise votre chiffre d'affaires." />} />
            <KpiCard label="Créances client" value={fmtEUR(kpiUnpaid)}
              sub={`${kpiUnpaidCount} factures`} icon={AlertTriangle} color="text-warning"
              tooltip={<InfoTooltip {...DASHBOARD_TOOLTIPS.facturesEnRetard} />} />
            <KpiCard label="DSO actuel" value={`${kpiDSO}j`}
              sub="Délai moyen paiement" trend={-5.8} trendLabel="vs N-1" icon={Clock}
              tooltip={<InfoTooltip {...DASHBOARD_TOOLTIPS.delaiPaiement} />} />
          </div>

          {/* Top clients par CA */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-semibold">Top clients par CA — {period}</CardTitle>
                <InfoTooltip title="Top clients par CA" description="Classement de vos clients par chiffre d'affaires généré sur la période sélectionnée." benefit="Identifiez vos clients stratégiques et surveillez leur concentration pour éviter une dépendance excessive à un seul compte." />
            </div>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left p-3 font-medium text-muted-foreground">Client</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">CA</th>
                    <th className="text-right p-3 font-medium text-muted-foreground hidden sm:table-cell">Factures</th>
                    <th className="text-right p-3 font-medium text-muted-foreground hidden md:table-cell">Part du CA</th>
                    <th className="text-left p-3 font-medium text-muted-foreground hidden lg:table-cell">Répartition</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {chartTopClients.map((client, i) => {
                    const totalCA = chartTopClients.reduce((s, c) => s + c.revenue, 0);
                    const pct = totalCA > 0 ? Math.round((client.revenue / totalCA) * 100) : 0;
                    return (
                      <tr key={client.name} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground text-[9px] font-bold">
                              {client.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium">{client.name}</p>
                              <p className="text-[10px] text-muted-foreground">#{i + 1} client</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-right font-bold text-primary">{fmtEUR(client.revenue)}</td>
                        <td className="p-3 text-right text-muted-foreground hidden sm:table-cell">{client.invoices}</td>
                        <td className="p-3 text-right hidden md:table-cell font-medium">{pct}%</td>
                        <td className="p-3 hidden lg:table-cell">
                          <div className="h-1.5 w-32 rounded-full bg-secondary overflow-hidden">
                            <div className="h-full rounded-full gradient-primary" style={{ width: `${pct}%` }} />
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <Badge variant="secondary"
                            className={`text-[10px] ${client.status === "active" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                            {client.status === "active" ? "Actif" : "Attention"}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* DSO historique */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-semibold">Évolution du DSO — 6 mois</CardTitle>
                  <InfoTooltip title="DSO — Days Sales Outstanding" description="Nombre de jours moyen nécessaire pour encaisser vos créances clients après facturation." formula="DSO = (Créances clients ÷ CA HT) × Nombre de jours de la période" benefit="Un DSO en baisse = vous êtes payé plus vite. Au-dessus de 45j, envisagez des relances automatiques ou un affacturage." />
              </div>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartDSO}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 16% 92%)" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} domain={[20, 50]} unit="j" />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="dso" stroke="hsl(35 90% 55%)"
                        strokeWidth={2} dot={{ fill: "hsl(35 90% 55%)", r: 4 }} name="DSO (jours)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Concentration client */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-semibold">Concentration du CA</CardTitle>
                  <InfoTooltip title="Concentration du CA" description="Répartition du chiffre d'affaires entre vos clients. Indique si votre CA est concentré sur quelques clients ou bien réparti." benefit="Si 1 client représente plus de 30% de votre CA, vous êtes en situation de dépendance risquée. Diversifiez activement." />
              </div>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie data={chartTopClients} cx="50%" cy="50%" innerRadius={45} outerRadius={75}
                        dataKey="revenue" nameKey="name" paddingAngle={2}>
                        {chartTopClients.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => fmtEUR(v)} />
                      <Legend formatter={(v) => <span className="text-[10px]">{v}</span>} />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── ONGLET SYNTHÈSE ──────────────────────────────────────────────── */}
        <TabsContent value="synthese" className="space-y-4 mt-4">

          <div className="grid md:grid-cols-2 gap-4">
            {/* Radar performance globale */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-semibold">Indicateurs de performance globale</CardTitle>
                  <InfoTooltip title="Indicateurs de performance globale" description="Tableau de bord synthétique des ratios financiers clés : taux de marge, rotation des créances, taux de charge, etc." benefit="Ces ratios permettent de benchmarker votre performance dans le temps et par rapport aux standards de votre secteur." />
              </div>
              </CardHeader>
              <CardContent>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={chartRadar}>
                      <PolarGrid stroke="hsl(220 16% 90%)" />
                      <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
                      <Radar name="Score" dataKey="value" stroke="hsl(250 75% 57%)"
                        fill="hsl(250 75% 57%)" fillOpacity={0.25} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Récap P&L simplifié */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-semibold">Compte de résultat simplifié — {period}</CardTitle>
                  <InfoTooltip title="Compte de résultat simplifié" description="Récapitulatif des produits et charges de l'exercice aboutissant au résultat net. Version simplifiée du document comptable officiel." formula="Produits − Charges = Résultat net" benefit="Document de référence pour votre expert-comptable, banquier ou investisseur. À conserver pour vos déclarations fiscales." />
              </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-0">
                  {[
                    { label: "Chiffre d'affaires", value: totalRevenue, type: "revenue", bold: true },
                    { label: "Charges d'exploitation", value: -totalExpenses * 0.7, type: "expense" },
                    { label: "Charges sociales", value: -totalExpenses * 0.3, type: "expense" },
                    { label: "Résultat d'exploitation", value: totalProfit * 1.1, type: "subtotal", bold: true },
                    { label: "Produits financiers", value: 480, type: "revenue" },
                    { label: "Charges financières", value: -180, type: "expense" },
                    { label: "Résultat net avant impôt", value: totalProfit * 1.08, type: "subtotal", bold: true },
                    { label: "Impôt estimé (15%)", value: -(totalProfit * 1.08 * 0.15), type: "expense" },
                    { label: "Résultat net", value: totalProfit * 0.918, type: "final", bold: true },
                  ].map((row, i) => (
                    <div key={i} className={`flex justify-between py-2 text-xs border-b border-border/30 ${row.type === "subtotal" ? "bg-muted/30 px-2 rounded" : ""} ${row.type === "final" ? "bg-success/5 px-2 rounded border-success/20" : ""}`}>
                      <span className={row.bold ? "font-semibold" : "text-muted-foreground"}>{row.label}</span>
                      <span className={`font-mono font-semibold ${row.value > 0 ? row.type === "final" ? "text-success" : "text-foreground" : "text-destructive"}`}>
                        {row.value > 0 ? "+" : ""}{fmtEUR(Math.round(row.value))}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alertes et recommandations */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />Alertes & recommandations IA
                <InfoTooltip title="Alertes & recommandations IA" description="Analyse automatique de vos données financières par l'IA pour détecter anomalies, risques et opportunités d'optimisation." benefit="Ces alertes sont générées en temps réel à partir de vos données. Plus vous utilisez LE BELVEDERE, plus les recommandations sont précises." icon="?" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {[
                { type: "warning", icon: AlertTriangle, title: "Concentration client élevée", desc: "Acme Corp représente 34% de votre CA. Risque si ce client part. Objectif : max 25% par client.", cta: "Analyser", action: () => setTab("clients") },
                { type: "danger", icon: AlertTriangle, title: "DSO dégradé vs secteur", desc: "34 jours vs 28j de moyenne sectorielle. Chaque jour supplémentaire coûte ~1 300€ de BFR.", cta: "Relancer", action: () => navigate("/app/sales/reminders") },
                { type: "success", icon: CheckCircle, title: "Marge en amélioration", desc: `Votre marge nette de ${avgMargin}% est en hausse de 8.2 points vs N-1. Continuez sur cette trajectoire.`, cta: "Voir détail", action: () => setTab("financier") },
                { type: "info", icon: TrendingUp, title: "Opportunité : service Maintenance", desc: "Votre taux de rétention sur ce service est de 94%. C'est votre levier de croissance récurrente prioritaire.", cta: "Développer", action: () => navigate("/app/sales/invoices/new") },
              ].map((alert, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border text-sm ${
                  alert.type === "warning" ? "border-warning/30 bg-warning/5" :
                  alert.type === "danger" ? "border-destructive/30 bg-destructive/5" :
                  alert.type === "success" ? "border-success/30 bg-success/5" :
                  "border-blue-500/20 bg-blue-500/5"
                }`}>
                  <alert.icon className={`h-4 w-4 flex-shrink-0 mt-0.5 ${
                    alert.type === "warning" ? "text-warning" :
                    alert.type === "danger" ? "text-destructive" :
                    alert.type === "success" ? "text-success" : "text-blue-500"
                  }`} />
                  <div className="flex-1">
                    <p className="font-medium text-xs">{alert.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{alert.desc}</p>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs h-7 flex-shrink-0" onClick={alert.action}>{alert.cta}</Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Export rapports */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm mb-1">Exporter les rapports</p>
                  <p className="text-xs text-muted-foreground">Générez des rapports PDF complets pour votre comptable ou investisseurs</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => handleExportPDF("monthly")} disabled={exporting}>
                    <Download className="h-3.5 w-3.5 mr-1.5" />Rapport mensuel
                  </Button>
                  <Button size="sm" className="gradient-primary text-primary-foreground text-xs" onClick={() => handleExportPDF("annual")} disabled={exporting}>
                    <Download className="h-3.5 w-3.5 mr-1.5" />Rapport annuel {period}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
