import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus, Search, MoreHorizontal, Clock, Calendar,
  CheckCircle, AlertTriangle, ListTodo, Eye, Edit,
  Trash2, Filter, Download, Kanban,
} from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import {
  tasks, taskStatusConfig, taskPriorityConfig, fmtHours,
  type TaskStatus, type TaskPriority,
} from "@/lib/productivity-data";
import { motion } from "framer-motion";

export default function TasksPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | TaskStatus>("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | TaskPriority>("all");
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const filtered = tasks.filter((t) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!t.title.toLowerCase().includes(q) && !t.clientName?.toLowerCase().includes(q) && !t.projectName?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const done = tasks.filter((t) => t.status === "done").length;
  const overdue = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date("2024-03-09") && t.status !== "done").length;
  const urgent = tasks.filter((t) => t.priority === "urgent" && t.status !== "done").length;
  const totalHours = tasks.reduce((s, t) => s + (t.timeEstimate ?? 0), 0);

  const toggleCheck = (id: string) => {
    const next = new Set(checked);
    next.has(id) ? next.delete(id) : next.add(id);
    setChecked(next);
  };

  return (
    <motion.div className="p-6 space-y-5" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-fluid-2xl font-display font-bold">Tâches</h1>
          <p className="text-sm text-muted-foreground">Toutes vos tâches en vue liste</p>
        </div>
        <div className="flex gap-2">
          <RouterLink to="/app/productivity/board">
            <Button variant="outline" size="sm"><Kanban className="h-3.5 w-3.5 mr-1.5" />Vue Kanban</Button>
          </RouterLink>
          <Button size="sm" className="gradient-primary text-primary-foreground">
            <Plus className="h-3.5 w-3.5 mr-1.5" />Nouvelle tâche
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <ListTodo className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Total</span>
            </div>
            <p className="text-fluid-2xl font-display font-bold">{tasks.length}</p>
            <p className="text-xs text-muted-foreground">{done} terminées</p>
          </CardContent>
        </Card>
        <Card className={overdue > 0 ? "border-destructive/30" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className={`h-3.5 w-3.5 ${overdue > 0 ? "text-destructive" : "text-muted-foreground"}`} />
              <span className="text-xs text-muted-foreground">En retard</span>
            </div>
            <p className={`text-2xl font-display font-bold ${overdue > 0 ? "text-destructive" : ""}`}>{overdue}</p>
            <p className="text-xs text-muted-foreground">tâche(s) en retard</p>
          </CardContent>
        </Card>
        <Card className={urgent > 0 ? "border-warning/30" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className={`h-3.5 w-3.5 ${urgent > 0 ? "text-warning" : "text-muted-foreground"}`} />
              <span className="text-xs text-muted-foreground">Urgentes</span>
            </div>
            <p className={`text-2xl font-display font-bold ${urgent > 0 ? "text-warning" : ""}`}>{urgent}</p>
            <p className="text-xs text-muted-foreground">priorité urgente</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Heures estimées</span>
            </div>
            <p className="text-fluid-2xl font-display font-bold">{totalHours}h</p>
            <p className="text-xs text-muted-foreground">{tasks.filter(t => t.timeEstimate).length} tâches</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher..." className="pl-9 h-8 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1 flex-wrap">
          {(["all", "backlog", "todo", "in_progress", "review", "done"] as const).map((s) => (
            <Button
              key={s} variant={statusFilter === s ? "default" : "outline"} size="sm"
              className={`text-xs h-7 ${statusFilter === s ? "gradient-primary text-primary-foreground" : ""}`}
              onClick={() => setStatusFilter(s)}
            >
              {s === "all" ? "Toutes" : taskStatusConfig[s].label}
            </Button>
          ))}
        </div>
        <div className="flex gap-1">
          {(["all", "urgent", "high", "medium", "low"] as const).map((p) => (
            <Button
              key={p} variant={priorityFilter === p ? "default" : "outline"} size="sm"
              className={`text-xs h-7 ${priorityFilter === p ? "gradient-primary text-primary-foreground" : ""}`}
              onClick={() => setPriorityFilter(p)}
            >
              {p === "all" ? "Priorités" : taskPriorityConfig[p].label}
            </Button>
          ))}
        </div>
      </div>

      {/* Task list */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border/50">
            {filtered.map((task) => {
              const sc = taskStatusConfig[task.status];
              const pc = taskPriorityConfig[task.priority];
              const isOverdue = task.dueDate && new Date(task.dueDate) < new Date("2024-03-09") && task.status !== "done";
              const isDone = task.status === "done";
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`flex items-center gap-3 p-3.5 hover:bg-muted/20 transition-colors group ${isDone ? "opacity-60" : ""}`}
                >
                  {/* Checkbox */}
                  <Checkbox
                    checked={checked.has(task.id) || isDone}
                    onCheckedChange={() => toggleCheck(task.id)}
                    className="flex-shrink-0"
                  />

                  {/* Priority dot */}
                  <div className={`h-2 w-2 rounded-full flex-shrink-0 ${pc.dot}`} />

                  {/* Main content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm font-medium ${isDone ? "line-through text-muted-foreground" : ""}`}>
                        {task.title}
                      </p>
                      {task.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-[10px] text-muted-foreground flex-wrap">
                      {task.projectName && <span className="text-primary">{task.projectName}</span>}
                      {task.clientName && <span>{task.clientName}</span>}
                      {task.dueDate && (
                        <span className={`flex items-center gap-1 ${isOverdue ? "text-destructive font-medium" : ""}`}>
                          <Calendar className="h-2.5 w-2.5" />
                          {new Date(task.dueDate).toLocaleDateString("fr-FR")}
                          {isOverdue && " — En retard"}
                        </span>
                      )}
                      {task.timeEstimate && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />
                          {task.timeSpent ? `${fmtHours(task.timeSpent)} / ` : ""}{fmtHours(task.timeEstimate)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status badge */}
                  <Badge variant="secondary" className={`text-[10px] hidden sm:flex ${sc.color} ${sc.bg}`}>
                    {sc.label}
                  </Badge>

                  {/* Assignee */}
                  {task.assignee && (
                    <div className="h-6 w-6 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-[9px] font-bold flex-shrink-0 hidden sm:flex">
                      {task.assignee.split(" ").map((n) => n[0]).join("")}
                    </div>
                  )}

                  {/* Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="text-xs">
                      <DropdownMenuItem><Edit className="h-3 w-3 mr-2" />Modifier</DropdownMenuItem>
                      <DropdownMenuItem><CheckCircle className="h-3 w-3 mr-2" />Marquer terminé</DropdownMenuItem>
                      <DropdownMenuItem><Clock className="h-3 w-3 mr-2" />Logger du temps</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive"><Trash2 className="h-3 w-3 mr-2" />Supprimer</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </motion.div>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <ListTodo className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Aucune tâche trouvée</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
