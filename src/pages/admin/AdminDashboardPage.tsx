import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2, Users, CreditCard, TrendingUp, TrendingDown,
  AlertTriangle, Activity, Bot, Flag, Shield, HeadphonesIcon,
} from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { adminStats } from "@/lib/mock-data";
import { motion } from "framer-motion";

const fmt = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

const mrrData = [
  { month: "Jul", mrr: 38000 }, { month: "Aoû", mrr: 39500 }, { month: "Sep", mrr: 41200 },
  { month: "Oct", mrr: 43800 }, { month: "Nov", mrr: 46000 }, { month: "Déc", mrr: 48500 },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

export default function AdminDashboardPage() {
  return (
    <motion.div className="p-6 space-y-6" variants={container} initial="hidden" animate="show">
      <motion.div variants={item}>
        <h1 className="text-2xl font-display font-bold">Backoffice SaaS</h1>
        <p className="text-sm text-muted-foreground">Vue globale de la plateforme M7:7</p>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
        <StatCard label="Organisations" value={adminStats.totalOrgs.toString()} sub={`${adminStats.activeOrgs} actives`} icon={<Building2 className="h-4 w-4 text-primary" />} />
        <StatCard label="Utilisateurs" value={adminStats.totalUsers.toString()} icon={<Users className="h-4 w-4 text-info" />} />
        <StatCard label="MRR" value={fmt(adminStats.mrr)} change="+8.2%" up icon={<TrendingUp className="h-4 w-4 text-success" />} />
        <StatCard label="Churn" value={`${adminStats.churn}%`} icon={<TrendingDown className="h-4 w-4 text-warning" />} />
        <StatCard label="Tickets ouverts" value={adminStats.activeTickets.toString()} icon={<HeadphonesIcon className="h-4 w-4 text-muted-foreground" />} />
        <StatCard label="Incidents critiques" value={adminStats.criticalIncidents.toString()} icon={<AlertTriangle className="h-4 w-4 text-success" />} ok />
      </motion.div>

      <motion.div variants={item} className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Évolution MRR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mrrData}>
                  <defs>
                    <linearGradient id="gMrr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(250 75% 57%)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(250 75% 57%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v / 1000}k€`} />
                  <Tooltip formatter={(v: number) => fmt(v)} />
                  <Area type="monotone" dataKey="mrr" stroke="hsl(250 75% 57%)" fill="url(#gMrr)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Métriques clés</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <MetricRow label="ARR" value={fmt(adminStats.arr)} />
            <MetricRow label="Conversion Trial → Paid" value={`${adminStats.trialConversion}%`} />
            <MetricRow label="Usage IA aujourd'hui" value={adminStats.aiUsageToday.toLocaleString("fr-FR") + " req"} />
            <MetricRow label="Quota IA utilisé" value={`${adminStats.aiQuotaUsed}%`} />
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div className="h-full rounded-full gradient-primary" style={{ width: `${adminStats.aiQuotaUsed}%` }} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item} className="grid md:grid-cols-3 gap-4">
        <QuickActionCard icon={<Flag className="h-5 w-5" />} title="Feature Flags" count="12 actifs" to="/admin/feature-flags" />
        <QuickActionCard icon={<Shield className="h-5 w-5" />} title="Sécurité" count="0 alerte" to="/admin/security" />
        <QuickActionCard icon={<Bot className="h-5 w-5" />} title="IA & Quotas" count={`${adminStats.aiQuotaUsed}% utilisé`} to="/admin/ai" />
      </motion.div>
    </motion.div>
  );
}

function StatCard({ label, value, sub, change, up, icon, ok }: any) {
  return (
    <Card>
      <CardContent className="p-3.5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{label}</span>
          {icon}
        </div>
        <div className={`text-lg font-display font-bold ${ok ? "text-success" : ""}`}>{value}</div>
        {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
        {change && <p className={`text-[10px] ${up ? "text-success" : "text-destructive"}`}>{change}</p>}
      </CardContent>
    </Card>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function QuickActionCard({ icon, title, count, to }: any) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-5 flex items-center gap-4">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">{icon}</div>
        <div>
          <p className="font-medium text-sm">{title}</p>
          <p className="text-xs text-muted-foreground">{count}</p>
        </div>
      </CardContent>
    </Card>
  );
}
