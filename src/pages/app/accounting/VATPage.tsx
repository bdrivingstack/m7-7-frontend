import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import {
  Percent, Calendar, CheckCircle, Clock, AlertTriangle,
  Download, TrendingUp, TrendingDown, FileText, ChevronRight,
  Info, ArrowUpRight, ArrowDownRight, ExternalLink,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line,
} from "recharts";
import { vatSummary } from "@/lib/accounting-data";
import { motion } from "framer-motion";
import { useDemo } from "@/contexts/DemoContext";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

type DeclarationStatus = "paid" | "filed" | "pending" | "upcoming";

interface VATDeclaration {
  id: string;
  period: string;
  periodLabel: string;
  collected: number;
  deductible: number;
  due: number;
  status: DeclarationStatus;
  deadline: string;
  filedDate?: string;
  paidDate?: string;
}

const declarations: VATDeclaration[] = [
  { id: "D1", period: "T4-2023", periodLabel: "T4 2023 (oct-déc)", collected: 4820, deductible: 1120, due: 3700, status: "paid", deadline: "2024-01-20", filedDate: "2024-01-15", paidDate: "2024-01-18" },
  { id: "D2", period: "T3-2023", periodLabel: "T3 2023 (jul-sep)", collected: 5120, deductible: 980, due: 4140, status: "paid", deadline: "2023-10-20", filedDate: "2023-10-12", paidDate: "2023-10-15" },
  { id: "D3", period: "T2-2023", periodLabel: "T2 2023 (avr-jun)", collected: 4380, deductible: 850, due: 3530, status: "paid", deadline: "2023-07-20", filedDate: "2023-07-10", paidDate: "2023-07-13" },
  { id: "D4", period: "T1-2024", periodLabel: "T1 2024 (jan-mar)", collected: vatSummary.collected, deductible: vatSummary.deductible, due: vatSummary.due, status: "pending", deadline: "2024-04-20" },
];

const statusConfig: Record<DeclarationStatus, { label: string; color: string; icon: typeof CheckCircle }> = {
  paid: { label: "Payée", color: "bg-success/10 text-success", icon: CheckCircle },
  filed: { label: "Déclarée", color: "bg-info/10 text-info", icon: FileText },
  pending: { label: "À déclarer", color: "bg-warning/10 text-warning", icon: Clock },
  upcoming: { label: "À venir", color: "bg-muted text-muted-foreground", icon: Calendar },
};

const monthlyVATData = [
  { month: "Oct", collected: 1580, deductible: 320, net: 1260 },
  { month: "Nov", collected: 1920, deductible: 410, net: 1510 },
  { month: "Déc", collected: 1320, deductible: 390, net: 930 },
  { month: "Jan", collected: 980, deductible: 265, net: 715 },
  { month: "Fév", collected: 1120, deductible: 290, net: 830 },
  { month: "Mar", collected: 1050, deductible: 270, net: 780 },
];

// Detailed VAT lines for current period
const vatLines = [
  { label: "Ventes de services (taux 20%)", base: 15300, vatRate: 20, vat: 3060, type: "collected" as const },
  { label: "Ventes de services (taux 10%)", base: 900, vatRate: 10, vat: 90, type: "collected" as const },
  { label: "Achats logiciels & SaaS", base: 1250, vatRate: 20, vat: 250, type: "deductible" as const },
  { label: "Achats matériel", base: 1480, vatRate: 20, vat: 296, type: "deductible" as const },
  { label: "Charges locatives", base: 950, vatRate: 20, vat: 190, type: "deductible" as const },
  { label: "Frais divers déductibles", base: 445, vatRate: 20, vat: 89, type: "deductible" as const },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function VATPage() {
  const demo   = useDemo();
  const isDemo = !!demo?.isDemo;
  const [selectedPeriod, setSelectedPeriod] = useState("T1-2024");

  const vatDeclarations = isDemo ? declarations : [];
  const EMPTY_DECL: VATDeclaration = { id: "—", period: "—", periodLabel: "—", collected: 0, deductible: 0, due: 0, status: "upcoming", deadline: new Date().toISOString() };
  const current = vatDeclarations.find((d) => d.period === selectedPeriod) ?? EMPTY_DECL;
  const sc = statusConfig[current.status];
  const StatusIcon = sc.icon;

  const daysUntilDeadline = Math.ceil(
    (new Date(current.deadline).getTime() - new Date("2024-03-09").getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <motion.div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-full overflow-x-hidden" variants={container} initial="hidden" animate="show">

      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-fluid-2xl font-display font-bold">TVA</h1>
          <p className="text-sm text-muted-foreground">Gestion et déclaration de la TVA</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="h-3.5 w-3.5 mr-1.5" />Exporter</Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/app/sales/invoices">
              <FileText className="h-3.5 w-3.5 mr-1.5" />Voir mes factures
            </Link>
          </Button>
          <Button size="sm" className="gradient-primary text-primary-foreground"
            onClick={() => window.open("https://www.impots.gouv.fr", "_blank")}>
            <ExternalLink className="h-3.5 w-3.5 mr-1.5" />impots.gouv.fr
          </Button>
        </div>
      </motion.div>

      {!isDemo && (
        <motion.p variants={item} className="text-xs text-muted-foreground">
          Aucune déclaration TVA disponible. La gestion TVA sera alimentée automatiquement à partir de vos factures encaissées et de vos dépenses professionnelles.
        </motion.p>
      )}

      {/* Current period banner */}
      <motion.div variants={item}>
        <Card className={`border-2 ${current.status === "pending" ? "border-warning/40 bg-warning/5" : "border-success/30 bg-success/5"}`}>
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${current.status === "pending" ? "bg-warning/20" : "bg-success/20"}`}>
                  <Percent className={`h-6 w-6 ${current.status === "pending" ? "text-warning" : "text-success"}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display font-bold text-lg">TVA {current.periodLabel}</h2>
                    <Badge variant="secondary" className={`text-[10px] ${sc.color}`}>
                      <StatusIcon className="h-2.5 w-2.5 mr-1" />{sc.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Échéance : {new Date(current.deadline).toLocaleDateString("fr-FR")}</span>
                    {current.status === "pending" && (
                      <span className={`font-medium ${daysUntilDeadline < 15 ? "text-destructive" : "text-warning"}`}>
                        — {daysUntilDeadline} jours restants
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-6 text-center">
                <div>
                  <div className="flex items-center justify-center gap-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Collectée</p>
                    <InfoTooltip title="TVA collectée" description="TVA que vous avez facturée à vos clients sur la période. Vous la devez à l'État." formula="Σ TVA de toutes les factures émises et payées" benefit="Ce montant doit être reversé à l'administration fiscale lors de votre déclaration." />
                  </div>
                  <p className="text-fluid-xl font-display font-bold">{fmt(current.collected)}</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Déductible</p>
                    <InfoTooltip title="TVA déductible" description="TVA que vous avez payée sur vos achats et dépenses professionnelles. Elle vient en déduction de la TVA collectée." formula="Σ TVA des factures d'achat / dépenses professionnelles" benefit="Plus vous avez de dépenses professionnelles avec TVA, moins vous en reversez à l'État." />
                  </div>
                  <p className="text-xl font-display font-bold text-success">-{fmt(current.deductible)}</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">À payer</p>
                    <InfoTooltip title="TVA nette à reverser" description="Montant final à déclarer et payer à l'administration fiscale sur la période." formula="TVA collectée − TVA déductible" benefit="À régler avant la date limite de votre déclaration pour éviter les pénalités de retard." />
                  </div>
                  <p className="text-2xl font-display font-bold text-warning">{fmt(current.due)}</p>
                </div>
              </div>
              {current.status === "pending" && (
                <Button className="gradient-primary text-primary-foreground" size="sm">
                  Déclarer maintenant <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="detail">
        <TabsList>
          <TabsTrigger value="detail">Détail de la période</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
          <TabsTrigger value="evolution">Évolution</TabsTrigger>
        </TabsList>

        {/* Détail */}
        <TabsContent value="detail" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* TVA collectée */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <ArrowUpRight className="h-4 w-4 text-primary" />TVA collectée
                  <span className="text-lg font-bold ml-auto">{fmt(vatLines.filter(l => l.type === "collected").reduce((s, l) => s + l.vat, 0))}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {vatLines.filter((l) => l.type === "collected").map((line, i) => (
                  <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg hover:bg-muted/40 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{line.label}</p>
                      <p className="text-muted-foreground">Base HT : {fmt(line.base)} × {line.vatRate}%</p>
                    </div>
                    <span className="font-semibold ml-4">{fmt(line.vat)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* TVA déductible */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <ArrowDownRight className="h-4 w-4 text-success" />TVA déductible
                  <span className="text-lg font-bold text-success ml-auto">-{fmt(vatLines.filter(l => l.type === "deductible").reduce((s, l) => s + l.vat, 0))}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {vatLines.filter((l) => l.type === "deductible").map((line, i) => (
                  <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg hover:bg-muted/40 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{line.label}</p>
                      <p className="text-muted-foreground">Base HT : {fmt(line.base)} × {line.vatRate}%</p>
                    </div>
                    <span className="font-semibold text-success ml-4">-{fmt(line.vat)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <Card className="border-primary/20">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-sm">Récapitulatif de la déclaration CA3</h3>
                <Button variant="outline" size="sm" className="text-xs"><Download className="h-3 w-3 mr-1.5" />Télécharger CA3</Button>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-xl bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">TVA brute collectée</p>
                  <p className="text-fluid-2xl font-display font-bold">{fmt(current.collected)}</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-success/5 border border-success/20">
                  <p className="text-xs text-muted-foreground mb-1">TVA déductible</p>
                  <p className="text-2xl font-display font-bold text-success">-{fmt(current.deductible)}</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-warning/5 border border-warning/30">
                  <p className="text-xs text-muted-foreground mb-1">TVA nette à reverser</p>
                  <p className="text-2xl font-display font-bold text-warning">{fmt(current.due)}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 mt-4 p-3 rounded-lg bg-info/5 border border-info/20">
                <Info className="h-4 w-4 text-info flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  La déclaration CA3 doit être déposée avant le {new Date(current.deadline).toLocaleDateString("fr-FR")} sur impots.gouv.fr. Le paiement est dû à la même date.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Historique */}
        <TabsContent value="history" className="space-y-3 mt-4">
          {vatDeclarations.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="py-10 text-center text-muted-foreground text-sm">
                <Percent className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p>Aucune déclaration TVA disponible</p>
                <p className="text-xs mt-1">La TVA sera alimentée depuis vos factures encaissées.</p>
              </CardContent>
            </Card>
          )}
          {vatDeclarations.map((decl) => {
            const sc2 = statusConfig[decl.status];
            const Icon2 = sc2.icon;
            return (
              <Card
                key={decl.id}
                className={`border-border/50 hover:shadow-sm transition-shadow cursor-pointer ${selectedPeriod === decl.period ? "border-primary/40 bg-primary/5" : ""}`}
                onClick={() => setSelectedPeriod(decl.period)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${sc2.color}`}>
                        <Icon2 className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{decl.periodLabel}</p>
                        <p className="text-xs text-muted-foreground">
                          Échéance : {new Date(decl.deadline).toLocaleDateString("fr-FR")}
                          {decl.filedDate && ` • Déclarée le ${new Date(decl.filedDate).toLocaleDateString("fr-FR")}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-right">
                      <div className="hidden sm:block">
                        <p className="text-[10px] text-muted-foreground">Collectée</p>
                        <p className="text-sm font-medium">{fmt(decl.collected)}</p>
                      </div>
                      <div className="hidden sm:block">
                        <p className="text-[10px] text-muted-foreground">Déductible</p>
                        <p className="text-sm font-medium text-success">-{fmt(decl.deductible)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground">Nette</p>
                        <p className="text-lg font-display font-bold">{fmt(decl.due)}</p>
                      </div>
                      <Badge variant="secondary" className={`text-[10px] ${sc2.color}`}>{sc2.label}</Badge>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Évolution */}
        <TabsContent value="evolution" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium">TVA mensuelle — 6 derniers mois</CardTitle>
                <InfoTooltip title="TVA mensuelle — 6 derniers mois" description="Évolution mois par mois de la TVA collectée (sur ventes), déductible (sur achats) et nette à reverser." benefit="Repérez les mois à forte TVA nette pour provisionner à l'avance et éviter les tensions de trésorerie." />
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyVATData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 16% 90%)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}€`} />
                    <Tooltip formatter={(v: number) => fmt(v)} />
                    <Bar dataKey="collected" fill="hsl(250 75% 57%)" radius={[4, 4, 0, 0]} name="Collectée" />
                    <Bar dataKey="deductible" fill="hsl(142 70% 45% / 0.5)" radius={[4, 4, 0, 0]} name="Déductible" />
                    <Bar dataKey="net" fill="hsl(38 92% 50% / 0.7)" radius={[4, 4, 0, 0]} name="Nette" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid sm:grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-4 w-4 text-muted-foreground mx-auto mb-2" />
                <div className="flex items-center justify-center gap-1 mb-1">
                  <p className="text-xs text-muted-foreground">Moyenne collectée / mois</p>
                  <InfoTooltip title="Moyenne TVA collectée / mois" description="Moyenne mensuelle de la TVA facturée à vos clients sur les 6 derniers mois." benefit="Utilisez cette moyenne pour estimer votre TVA collectée des prochains mois et anticiper votre déclaration." />
                </div>
                <p className="text-fluid-xl font-display font-bold">{fmt(Math.round(monthlyVATData.reduce((s, m) => s + m.collected, 0) / monthlyVATData.length))}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingDown className="h-4 w-4 text-success mx-auto mb-2" />
                <div className="flex items-center justify-center gap-1 mb-1">
                  <p className="text-xs text-muted-foreground">Moyenne déductible / mois</p>
                  <InfoTooltip title="Moyenne TVA déductible / mois" description="Moyenne mensuelle de la TVA récupérable sur vos achats et dépenses professionnelles." benefit="Plus cette moyenne est élevée, moins vous reversez à l'État. Assurez-vous de collecter toutes vos factures d'achat." />
                </div>
                <p className="text-xl font-display font-bold text-success">{fmt(Math.round(monthlyVATData.reduce((s, m) => s + m.deductible, 0) / monthlyVATData.length))}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Percent className="h-4 w-4 text-warning mx-auto mb-2" />
                <div className="flex items-center justify-center gap-1 mb-1">
                  <p className="text-xs text-muted-foreground">Moyenne nette / mois</p>
                  <InfoTooltip title="Moyenne TVA nette / mois" description="Moyenne mensuelle du montant que vous devrez reverser à l'État lors de votre prochaine déclaration." formula="Moyenne collectée − Moyenne déductible" benefit="Provisionnez ce montant chaque mois pour ne jamais être pris au dépourvu à l'échéance." />
                </div>
                <p className="text-xl font-display font-bold text-warning">{fmt(Math.round(monthlyVATData.reduce((s, m) => s + m.net, 0) / monthlyVATData.length))}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
