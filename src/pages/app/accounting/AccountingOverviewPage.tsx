import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import {
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, DollarSign,
  Landmark, ArrowUpRight, ArrowDownRight, Bot, Calendar, Percent,
  PiggyBank, GitBranch, FileText,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { accountingOverviewStats as stats, accountingCategories, vatSummary, socialContributions } from "@/lib/accounting-data";
import { revenueChartData } from "@/lib/mock-data";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const fmt = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

const revenueCats = accountingCategories.filter(c => c.type === "revenue");
const expenseCats = accountingCategories.filter(c => c.type === "expense");

const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function AccountingOverviewPage() {
  return (
    <motion.div className="p-6 space-y-6" variants={container} initial="hidden" animate="show">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Comptabilité</h1>
          <p className="text-sm text-muted-foreground">Vue générale de votre comptabilité simplifiée</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Calendar className="h-3.5 w-3.5 mr-1.5" />Mars 2024</Button>
          <Button variant="outline" size="sm"><FileText className="h-3.5 w-3.5 mr-1.5" />Exporter</Button>
        </div>
      </motion.div>

      {/* KPI row */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
        <KPICard label="Recettes" value={fmt(stats.totalRevenue)} icon={<ArrowUpRight className="h-4 w-4 text-success" />} tooltip={{ title: "Recettes", description: "Total des encaissements comptabilisés sur la période : factures payées + autres produits.", formula: "Σ factures PAID + produits exceptionnels", benefit: "Base de calcul de votre résultat et de vos cotisations sociales." }} />
        <KPICard label="Dépenses" value={fmt(stats.totalExpenses)} icon={<ArrowDownRight className="h-4 w-4 text-destructive" />} tooltip={{ title: "Dépenses", description: "Total des charges enregistrées sur la période : achats, frais généraux, salaires, etc.", formula: "Σ transactions catégorisées en charge", benefit: "Réduire vos charges augmente directement votre résultat net imposable." }} />
        <KPICard label="Résultat net" value={fmt(stats.netResult)} accent tooltip={{ title: "Résultat net", description: "Différence entre vos recettes et vos dépenses sur la période.", formula: "Recettes − Dépenses", benefit: "Un résultat positif = bénéfice. Un résultat négatif = déficit. Base de votre impôt sur les bénéfices." }} />
        <KPICard label="TVA à payer" value={fmt(stats.vatDue)} icon={<Percent className="h-4 w-4 text-warning" />} tooltip={{ title: "TVA nette à reverser", description: "Montant de TVA à déclarer et reverser à l'administration fiscale.", formula: "TVA collectée − TVA déductible", benefit: "À déclarer sur votre CA3 mensuelle ou trimestrielle selon votre régime." }} />
        <KPICard label="Non catégorisées" value={stats.uncategorized.toString()} warning link="/app/accounting/transactions" tooltip={{ title: "Transactions non catégorisées", description: "Transactions bancaires importées qui n'ont pas encore été associées à une catégorie comptable.", benefit: "Catégoriser ces transactions est indispensable pour avoir un résultat comptable fiable." }} />
        <KPICard label="Non rapprochées" value={stats.unreconciled.toString()} warning link="/app/accounting/reconciliation" tooltip={{ title: "Transactions non rapprochées", description: "Mouvements bancaires non encore associés à une facture ou dépense dans M7Sept.", benefit: "Le rapprochement bancaire garantit que vos livres comptables correspondent à votre solde réel." }} />
      </motion.div>

      {/* Charts */}
      <motion.div variants={item} className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              Recettes vs Dépenses
              <InfoTooltip title="Recettes vs Dépenses" description="Comparaison mensuelle de vos encaissements et de vos charges sur les 6 derniers mois." benefit="Un écart croissant entre recettes et dépenses indique une amélioration de votre rentabilité." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueChartData.slice(-6)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 16% 90%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v / 1000}k`} />
                  <Tooltip formatter={(v: number) => fmt(v)} />
                  <Bar dataKey="revenue" fill="hsl(250 75% 57%)" radius={[4, 4, 0, 0]} name="Recettes" />
                  <Bar dataKey="expenses" fill="hsl(0 72% 55% / 0.4)" radius={[4, 4, 0, 0]} name="Dépenses" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              Répartition recettes
              <InfoTooltip title="Répartition recettes par catégorie" description="Part de chaque activité dans votre chiffre d'affaires total sur la période." benefit="Visualisez votre dépendance aux différents types de missions et diversifiez si une catégorie représente plus de 50% du CA." />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={revenueCats} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="total">
                    {revenueCats.map((c, i) => <Cell key={i} fill={c.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => fmt(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 mt-2">
              {revenueCats.map(c => (
                <div key={c.id} className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full" style={{ background: c.color }} />
                    <span className="text-muted-foreground">{c.name}</span>
                  </div>
                  <span className="font-medium">{fmt(c.total)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* TVA + Cotisations + Alerts */}
      <motion.div variants={item} className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Percent className="h-4 w-4 text-warning" /> TVA
              <InfoTooltip title="Résumé TVA" description="Synthèse de votre TVA collectée, déductible et nette à reverser pour la période en cours." formula="TVA nette = TVA collectée − TVA déductible" benefit="Provisionnez chaque mois le montant de TVA nette pour éviter les difficultés de trésorerie à l'échéance." />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">TVA collectée</span>
              <span className="font-medium">{fmt(vatSummary.collected)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">TVA déductible</span>
              <span className="font-medium text-success">-{fmt(vatSummary.deductible)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between text-sm">
              <span className="font-medium">TVA nette à payer</span>
              <span className="font-bold text-warning">{fmt(vatSummary.due)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
              <Calendar className="h-3 w-3" />
              <span>Échéance : {new Date(vatSummary.deadline).toLocaleDateString("fr-FR")}</span>
            </div>
            <Link to="/app/accounting/vat">
              <Button variant="outline" size="sm" className="w-full text-xs mt-1">Détail TVA →</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <PiggyBank className="h-4 w-4 text-info" /> Cotisations sociales
              <InfoTooltip title="Cotisations sociales" description="Suivi de vos cotisations URSSAF, retraite et prévoyance : montant estimé, déjà payé et reste à payer." benefit="Gardez toujours de la trésorerie disponible pour les échéances URSSAF. Un retard entraîne des majorations de 5%." />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Estimé {socialContributions.period}</span>
              <span className="font-medium">{fmt(socialContributions.estimated)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Déjà payé</span>
              <span className="font-medium text-success">{fmt(socialContributions.paid)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between text-sm">
              <span className="font-medium">Reste à payer</span>
              <span className="font-bold text-info">{fmt(socialContributions.remaining)}</span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div className="h-full rounded-full bg-info" style={{ width: `${(socialContributions.paid / socialContributions.estimated) * 100}%` }} />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>Prochaine échéance : {new Date(socialContributions.nextDeadline).toLocaleDateString("fr-FR")}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" /> Suggestions IA
              <InfoTooltip title="Suggestions IA" description="Alertes et actions recommandées générées automatiquement par l'IA à partir de l'analyse de vos transactions et documents." benefit="Traitez ces suggestions régulièrement pour maintenir une comptabilité à jour et éviter les anomalies en fin d'exercice." />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <SuggestionItem icon="🏷️" text="3 transactions non catégorisées détectées. Catégoriser automatiquement ?" action="Catégoriser" />
            <SuggestionItem icon="🔗" text="Facture F-2024-045 peut être rapprochée de TX-005." action="Rapprocher" />
            <SuggestionItem icon="⚠️" text="Dépense Amazon inhabituelle. Vérifier la catégorie." action="Vérifier" />
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick links */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuickLink to="/app/accounting/revenue-book" icon={<ArrowUpRight className="h-5 w-5" />} label="Livre des recettes" count="8 entrées" />
        <QuickLink to="/app/accounting/transactions" icon={<Landmark className="h-5 w-5" />} label="Transactions" count="12 ce mois" />
        <QuickLink to="/app/accounting/categories" icon={<DollarSign className="h-5 w-5" />} label="Catégories" count="12 actives" />
        <QuickLink to="/app/accounting/reconciliation" icon={<GitBranch className="h-5 w-5" />} label="Rapprochement" count="3 en attente" />
      </motion.div>
    </motion.div>
  );
}

function KPICard({ label, value, icon, accent, warning, link, tooltip }: any) {
  const content = (
    <Card className={warning ? "border-warning/30" : accent ? "border-primary/20" : ""}>
      <CardContent className="p-3.5">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{label}</span>
            {tooltip && <InfoTooltip {...tooltip} size="sm" />}
          </div>
          {icon}
        </div>
        <div className={`text-lg font-display font-bold ${warning ? "text-warning" : accent ? "text-primary" : ""}`}>{value}</div>
      </CardContent>
    </Card>
  );
  return link ? <Link to={link}>{content}</Link> : content;
}

function SuggestionItem({ icon, text, action }: { icon: string; text: string; action: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex gap-2 text-xs">
        <span>{icon}</span>
        <span className="text-muted-foreground">{text}</span>
      </div>
      <Button variant="outline" size="sm" className="h-6 text-[10px] w-full">{action}</Button>
    </div>
  );
}

function QuickLink({ to, icon, label, count }: any) {
  return (
    <Link to={to}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">{icon}</div>
          <div>
            <p className="text-sm font-medium">{label}</p>
            <p className="text-[10px] text-muted-foreground">{count}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
