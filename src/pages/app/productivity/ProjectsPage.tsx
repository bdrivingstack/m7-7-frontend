import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus, Search, MoreHorizontal, Clock, Calendar,
  TrendingUp, AlertTriangle, CheckCircle, FolderOpen,
  Eye, Edit, Trash2, Users, Euro, BarChart2,
} from "lucide-react";
import {
  projects, projectStatusConfig, fmtEUR, fmtHours,
  type ProjectStatus,
} from "@/lib/productivity-data";
import { motion } from "framer-motion";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function ProjectsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ProjectStatus>("all");

  const filtered = projects.filter((p) => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.clientName.toLowerCase().includes(q);
    }
    return true;
  });

  const totalBudget = projects.filter(p => p.status !== "completed").reduce((s, p) => s + p.budget, 0);
  const totalSpent = projects.filter(p => p.status !== "completed").reduce((s, p) => s + p.spent, 0);
  const atRisk = projects.filter(p => p.status === "at_risk").length;
  const active = projects.filter(p => p.status === "active").length;

  return (
    <motion.div className="p-6 space-y-6" variants={container} initial="hidden" animate="show">

      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Projets</h1>
          <p className="text-sm text-muted-foreground">Suivez l'avancement et la rentabilité de vos projets</p>
        </div>
        <Button size="sm" className="gradient-primary text-primary-foreground">
          <Plus className="h-3.5 w-3.5 mr-1.5" />Nouveau projet
        </Button>
      </motion.div>

      {/* KPIs */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <FolderOpen className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs text-muted-foreground">Actifs</span>
            </div>
            <p className="text-2xl font-display font-bold">{active}</p>
            <p className="text-xs text-muted-foreground">{projects.length} total</p>
          </CardContent>
        </Card>
        <Card className={atRisk > 0 ? "border-destructive/30" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className={`h-3.5 w-3.5 ${atRisk > 0 ? "text-destructive" : "text-muted-foreground"}`} />
              <span className="text-xs text-muted-foreground">À risque</span>
            </div>
            <p className={`text-2xl font-display font-bold ${atRisk > 0 ? "text-destructive" : ""}`}>{atRisk}</p>
            <p className="text-xs text-muted-foreground">nécessite attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Euro className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Budget actif</span>
            </div>
            <p className="text-2xl font-display font-bold">{fmtEUR(totalBudget)}</p>
            <p className="text-xs text-muted-foreground">{fmtEUR(totalSpent)} consommé</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-3.5 w-3.5 text-success" />
              <span className="text-xs text-muted-foreground">Taux consommation</span>
            </div>
            <p className="text-2xl font-display font-bold">{Math.round((totalSpent / totalBudget) * 100)}%</p>
            <p className="text-xs text-muted-foreground">{fmtEUR(totalBudget - totalSpent)} restant</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div variants={item} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher..." className="pl-9 h-8 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1 flex-wrap">
          {(["all", "active", "at_risk", "paused", "completed"] as const).map((s) => (
            <Button
              key={s} variant={statusFilter === s ? "default" : "outline"} size="sm"
              className={`text-xs h-7 ${statusFilter === s ? "gradient-primary text-primary-foreground" : ""}`}
              onClick={() => setStatusFilter(s)}
            >
              {s === "all" ? "Tous" : projectStatusConfig[s].label}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Project cards */}
      <motion.div variants={container} className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((project) => {
          const sc = projectStatusConfig[project.status];
          const budgetPct = Math.round((project.spent / project.budget) * 100);
          const taskPct = project.tasksTotal > 0 ? Math.round((project.tasksDone / project.tasksTotal) * 100) : 0;
          const hoursPct = Math.round((project.hoursSpent / project.hoursEstimate) * 100);
          const daysLeft = Math.ceil((new Date(project.endDate).getTime() - new Date("2024-03-09").getTime()) / (1000 * 60 * 60 * 24));
          const overBudget = budgetPct > 90;
          const overTime = hoursPct > 90;

          return (
            <motion.div key={project.id} variants={item}>
              <Card className={`border-border/60 hover:shadow-md transition-shadow h-full ${project.status === "at_risk" ? "border-destructive/30" : ""}`}>
                <CardContent className="p-5 flex flex-col h-full">
                  {/* Top */}
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${project.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                        {project.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm leading-snug">{project.name}</p>
                        <p className="text-[11px] text-muted-foreground">{project.clientName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Badge variant="secondary" className={`text-[10px] ${sc.color}`}>{sc.label}</Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="text-xs">
                          <DropdownMenuItem><Eye className="h-3 w-3 mr-2" />Voir les détails</DropdownMenuItem>
                          <DropdownMenuItem><Edit className="h-3 w-3 mr-2" />Modifier</DropdownMenuItem>
                          <DropdownMenuItem><BarChart2 className="h-3 w-3 mr-2" />Rapport</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive"><Trash2 className="h-3 w-3 mr-2" />Archiver</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex gap-1 mb-4 flex-wrap">
                    {project.tags.map((tag) => (
                      <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{tag}</span>
                    ))}
                  </div>

                  {/* Metrics */}
                  <div className="space-y-3 flex-1">
                    {/* Budget */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Budget</span>
                        <span className={`font-medium ${overBudget ? "text-destructive" : ""}`}>
                          {fmtEUR(project.spent)} / {fmtEUR(project.budget)}
                          {overBudget && <AlertTriangle className="h-3 w-3 inline ml-1" />}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${budgetPct > 90 ? "bg-destructive" : budgetPct > 70 ? "bg-warning" : "bg-primary"}`}
                          style={{ width: `${Math.min(budgetPct, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Avancement tâches */}
                    {project.tasksTotal > 0 && (
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Tâches</span>
                          <span className="font-medium">{project.tasksDone} / {project.tasksTotal} ({taskPct}%)</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                          <div
                            className="h-full rounded-full bg-success transition-all"
                            style={{ width: `${taskPct}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Heures */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Heures</span>
                        <span className={`font-medium ${overTime ? "text-warning" : ""}`}>
                          {fmtHours(project.hoursSpent)} / {fmtHours(project.hoursEstimate)}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${hoursPct > 90 ? "bg-warning" : "bg-blue-500"}`}
                          style={{ width: `${Math.min(hoursPct, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {project.status === "completed"
                          ? `Terminé ${new Date(project.endDate).toLocaleDateString("fr-FR")}`
                          : daysLeft < 0
                          ? <span className="text-destructive font-medium">{Math.abs(daysLeft)}j de retard</span>
                          : `${daysLeft}j restants`}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(project.startDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
