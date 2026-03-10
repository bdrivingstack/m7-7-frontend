import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CreditCard, Search, Download, TrendingUp, TrendingDown,
  ArrowUpRight, ArrowDownRight, MoreHorizontal, Eye, Copy,
  RefreshCw, AlertTriangle, CheckCircle, Clock, Landmark,
  ExternalLink, Zap, Filter, ChevronRight, Building2,
  FileText, BarChart2, Wifi,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area,
} from "recharts";
import {
  payments, paymentAccounts, monthlyCashflow,
  paymentMethodConfig, paymentStatusConfig, fmtEUR,
  type PaymentStatus, type PaymentMethod,
} from "@/lib/payments-data";
import { motion } from "framer-motion";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

type StatusFilter = "all" | PaymentStatus;

export default function PaymentsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [methodFilter, setMethodFilter] = useState<"all" | PaymentMethod>("all");

  const filtered = payments.filter((p) => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (methodFilter !== "all" && p.method !== methodFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!p.client.toLowerCase().includes(q) && !p.reference.toLowerCase().includes(q) && !p.invoiceNumber?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // KPIs
  const totalReceived = payments.filter((p) => p.status === "completed").reduce((s, p) => s + p.amount, 0);
  const totalPending = payments.filter((p) => p.status === "pending").reduce((s, p) => s + p.amount, 0);
  const totalFees = payments.filter((p) => p.fees && p.fees > 0).reduce((s, p) => s + (p.fees ?? 0), 0);
  const totalAccounts = paymentAccounts.reduce((s, a) => s + a.balance, 0);
  const stripePending = paymentAccounts.find((a) => a.type === "stripe")?.pending ?? 0;

  // Monthly stats
  const currentMonthIn = monthlyCashflow[monthlyCashflow.length - 1].in;
  const prevMonthIn = monthlyCashflow[monthlyCashflow.length - 2].in;
  const growthPct = Math.round(((currentMonthIn - prevMonthIn) / prevMonthIn) * 100);

  return (
    <motion.div className="p-6 space-y-6" variants={container} initial="hidden" animate="show">

      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Paiements</h1>
          <p className="text-sm text-muted-foreground">Encaissements, virements et gestion des comptes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><RefreshCw className="h-3.5 w-3.5 mr-1.5" />Synchroniser</Button>
          <Button variant="outline" size="sm"><Download className="h-3.5 w-3.5 mr-1.5" />Exporter</Button>
          <Button size="sm" className="gradient-primary text-primary-foreground">
            <CreditCard className="h-3.5 w-3.5 mr-1.5" />Enregistrer un paiement
          </Button>
        </div>
      </motion.div>

      {/* Comptes bancaires */}
      <motion.div variants={item}>
        <div className="flex items-center gap-2 mb-3">
          <Landmark className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Comptes connectés</h2>
          <span className="text-xs text-muted-foreground ml-auto">Total : <span className="font-bold text-foreground">{fmtEUR(totalAccounts)}</span></span>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {paymentAccounts.map((acc) => (
            <Card key={acc.id} className={`border-border/50 ${acc.type === "stripe" ? "border-violet-500/20" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{acc.icon}</span>
                    <div>
                      <p className="font-medium text-sm">{acc.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-success" />
                        <span className="text-[10px] text-muted-foreground">
                          Synchro {new Date(acc.lastSync).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">{fmtEUR(acc.balance)}</p>
                  {acc.pending > 0 && (
                    <p className="text-xs text-warning mt-0.5">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {fmtEUR(acc.pending)} en attente
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* KPIs */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpRight className="h-3.5 w-3.5 text-success" />
              <span className="text-xs text-muted-foreground">Encaissé (total)</span>
            </div>
            <p className="text-2xl font-display font-bold text-success">{fmtEUR(totalReceived)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{payments.filter(p => p.status === "completed").length} transactions</p>
          </CardContent>
        </Card>
        <Card className="border-warning/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-3.5 w-3.5 text-warning" />
              <span className="text-xs text-muted-foreground">En attente</span>
            </div>
            <p className="text-2xl font-display font-bold text-warning">{fmtEUR(totalPending)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{payments.filter(p => p.status === "pending").length} paiement(s)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className={`h-3.5 w-3.5 ${growthPct >= 0 ? "text-success" : "text-destructive"}`} />
              <span className="text-xs text-muted-foreground">Ce mois vs N-1</span>
            </div>
            <p className={`text-2xl font-display font-bold ${growthPct >= 0 ? "text-success" : "text-destructive"}`}>
              {growthPct >= 0 ? "+" : ""}{growthPct}%
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{fmtEUR(currentMonthIn)} encaissés</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Frais Stripe/CB</span>
            </div>
            <p className="text-2xl font-display font-bold">{fmtEUR(totalFees)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">~{((totalFees / totalReceived) * 100).toFixed(1)}% du CA encaissé</p>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="cashflow">Cashflow</TabsTrigger>
          <TabsTrigger value="methods">Par moyen</TabsTrigger>
        </TabsList>

        {/* Transactions */}
        <TabsContent value="transactions" className="space-y-4 mt-4">

          {/* Alertes */}
          {payments.some(p => p.status === "failed" || p.status === "disputed") && (
            <div className="space-y-2">
              {payments.filter(p => p.status === "failed").map(p => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg border border-destructive/30 bg-destructive/5 text-sm">
                  <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
                  <div className="flex-1">
                    <span className="font-medium">Paiement échoué</span>
                    <span className="text-muted-foreground"> — {p.client} · {p.description} · </span>
                    <span className="font-semibold">{fmtEUR(p.amount)}</span>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs h-7 border-destructive/40 text-destructive">
                    Relancer
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..." className="pl-9 h-8 text-sm"
                value={search} onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-1 flex-wrap">
              {(["all", "completed", "pending", "failed", "refunded"] as const).map((s) => (
                <Button
                  key={s}
                  variant={statusFilter === s ? "default" : "outline"}
                  size="sm" className={`text-xs h-7 ${statusFilter === s ? "gradient-primary text-primary-foreground" : ""}`}
                  onClick={() => setStatusFilter(s)}
                >
                  {s === "all" ? "Tous" : paymentStatusConfig[s].label}
                  {s !== "all" && (
                    <span className="ml-1 opacity-70">({payments.filter(p => p.status === s).length})</span>
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left p-3 font-medium text-muted-foreground">Référence</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Client</th>
                      <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Description</th>
                      <th className="text-left p-3 font-medium text-muted-foreground hidden sm:table-cell">Date</th>
                      <th className="text-center p-3 font-medium text-muted-foreground">Moyen</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Montant</th>
                      <th className="text-right p-3 font-medium text-muted-foreground hidden lg:table-cell">Frais</th>
                      <th className="text-center p-3 font-medium text-muted-foreground">Statut</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((p) => {
                      const mc = paymentMethodConfig[p.method];
                      const sc = paymentStatusConfig[p.status];
                      return (
                        <motion.tr
                          key={p.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                        >
                          <td className="p-3">
                            <span className="font-mono font-medium text-primary">{p.reference}</span>
                            {p.invoiceNumber && (
                              <p className="text-[10px] text-muted-foreground mt-0.5">{p.invoiceNumber}</p>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-md gradient-primary flex items-center justify-center text-primary-foreground text-[9px] font-bold flex-shrink-0">
                                {p.client.substring(0, 2).toUpperCase()}
                              </div>
                              <Link to={`/app/customers/${p.clientId}`} className="font-medium hover:text-primary transition-colors">
                                {p.client}
                              </Link>
                            </div>
                          </td>
                          <td className="p-3 text-muted-foreground hidden md:table-cell max-w-[180px] truncate">
                            {p.description}
                          </td>
                          <td className="p-3 text-muted-foreground hidden sm:table-cell">
                            {new Date(p.date).toLocaleDateString("fr-FR")}
                          </td>
                          <td className="p-3 text-center">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${mc.bg} ${mc.color}`}>
                              <span>{mc.icon}</span>{mc.label}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <span className={`font-semibold text-sm ${p.status === "refunded" ? "text-muted-foreground line-through" : p.amount > 0 ? "text-success" : ""}`}>
                              {p.status === "refunded" ? "-" : "+"}{fmtEUR(Math.abs(p.amount))}
                            </span>
                          </td>
                          <td className="p-3 text-right hidden lg:table-cell text-muted-foreground">
                            {p.fees && p.fees > 0 ? (
                              <span className="text-destructive">-{fmtEUR(p.fees)}</span>
                            ) : "—"}
                          </td>
                          <td className="p-3 text-center">
                            <Badge variant="secondary" className={`text-[10px] ${sc.color}`}>{sc.label}</Badge>
                          </td>
                          <td className="p-3 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                  <MoreHorizontal className="h-3.5 w-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="text-xs">
                                <DropdownMenuItem><Eye className="h-3 w-3 mr-2" />Voir les détails</DropdownMenuItem>
                                {p.invoiceNumber && (
                                  <DropdownMenuItem><FileText className="h-3 w-3 mr-2" />Voir la facture</DropdownMenuItem>
                                )}
                                {p.stripeId && (
                                  <DropdownMenuItem><ExternalLink className="h-3 w-3 mr-2" />Voir sur Stripe</DropdownMenuItem>
                                )}
                                <DropdownMenuItem><Copy className="h-3 w-3 mr-2" />Copier la référence</DropdownMenuItem>
                                {p.status === "completed" && (
                                  <DropdownMenuItem><Download className="h-3 w-3 mr-2" />Reçu PDF</DropdownMenuItem>
                                )}
                                {p.status === "failed" && (
                                  <DropdownMenuItem className="text-warning"><RefreshCw className="h-3 w-3 mr-2" />Relancer</DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Aucun paiement trouvé</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cashflow */}
        <TabsContent value="cashflow" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Encaissements vs Décaissements — 6 mois</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyCashflow}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 16% 90%)" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v / 1000}k`} />
                      <Tooltip formatter={(v: number) => fmtEUR(v)} />
                      <Bar dataKey="in" fill="hsl(142 70% 45%)" radius={[4, 4, 0, 0]} name="Entrées" />
                      <Bar dataKey="out" fill="hsl(0 72% 55% / 0.5)" radius={[4, 4, 0, 0]} name="Sorties" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Cash net cumulé</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyCashflow}>
                      <defs>
                        <linearGradient id="netGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(250 75% 57%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(250 75% 57%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 16% 90%)" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v / 1000}k`} />
                      <Tooltip formatter={(v: number) => fmtEUR(v)} />
                      <Area type="monotone" dataKey="net" stroke="hsl(250 75% 57%)" fill="url(#netGradient)" strokeWidth={2} name="Net" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Synthèse mensuelle */}
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left p-3 font-medium text-muted-foreground">Période</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Entrées</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Sorties</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Net</th>
                    <th className="text-right p-3 font-medium text-muted-foreground hidden sm:table-cell">Marge</th>
                  </tr>
                </thead>
                <tbody>
                  {[...monthlyCashflow].reverse().map((m, i) => {
                    const margin = Math.round((m.net / m.in) * 100);
                    return (
                      <tr key={i} className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${i === 0 ? "font-medium" : ""}`}>
                        <td className="p-3">{m.month} 2024 {i === 0 && <Badge variant="secondary" className="ml-1 text-[9px]">Ce mois</Badge>}</td>
                        <td className="p-3 text-right text-success font-medium">+{fmtEUR(m.in)}</td>
                        <td className="p-3 text-right text-destructive">-{fmtEUR(m.out)}</td>
                        <td className={`p-3 text-right font-bold ${m.net >= 0 ? "text-success" : "text-destructive"}`}>
                          {m.net >= 0 ? "+" : ""}{fmtEUR(m.net)}
                        </td>
                        <td className="p-3 text-right hidden sm:table-cell">
                          <span className={`${margin > 40 ? "text-success" : margin > 25 ? "text-warning" : "text-destructive"}`}>
                            {margin}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Par moyen de paiement */}
        <TabsContent value="methods" className="space-y-4 mt-4">
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {(["virement", "stripe", "carte", "prelevement", "cheque"] as PaymentMethod[]).map((method) => {
              const mc = paymentMethodConfig[method];
              const methodPayments = payments.filter((p) => p.method === method && p.status === "completed");
              const total = methodPayments.reduce((s, p) => s + p.amount, 0);
              const fees = methodPayments.reduce((s, p) => s + (p.fees ?? 0), 0);
              const pct = total > 0 ? Math.round((total / totalReceived) * 100) : 0;

              if (methodPayments.length === 0 && method !== "virement") return null;

              return (
                <Card key={method} className="border-border/50">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-xl ${mc.bg}`}>
                        {mc.icon}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{mc.label}</p>
                        <p className="text-xs text-muted-foreground">{methodPayments.length} transaction(s)</p>
                      </div>
                    </div>
                    <p className="text-2xl font-display font-bold mb-1">{fmtEUR(total)}</p>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden mb-3">
                      <motion.div
                        className={`h-full rounded-full ${mc.bg.replace("bg-", "bg-").replace("/10", "")}`}
                        style={{ background: `hsl(var(--primary))`, opacity: 0.6 }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{pct}% du total encaissé</span>
                      {fees > 0 && <span className="text-destructive">Frais : -{fmtEUR(fees)}</span>}
                    </div>
                  </CardContent>
                </Card>
              );
            }).filter(Boolean)}
          </div>

          {/* Stripe connect panel */}
          <Card className="border-violet-500/20 bg-violet-500/5">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-violet-500/20 flex items-center justify-center text-xl">💳</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">Stripe Connect</p>
                      <div className="flex items-center gap-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-success" />
                        <span className="text-[10px] text-success">Connecté</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Solde disponible : {fmtEUR(paymentAccounts.find(a => a.type === "stripe")?.balance ?? 0)}
                      {stripePending > 0 && ` · En transit : ${fmtEUR(stripePending)}`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-xs">
                    <ExternalLink className="h-3 w-3 mr-1.5" />Dashboard Stripe
                  </Button>
                  <Button size="sm" className="gradient-primary text-primary-foreground text-xs">
                    <Zap className="h-3 w-3 mr-1.5" />Virer vers la banque
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
