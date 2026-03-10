import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus, Search, MoreHorizontal, Clock, Calendar, Tag,
  Filter, Eye, Edit, Trash2, ChevronRight, Kanban,
} from "lucide-react";
import {
  tasks, taskStatusConfig, taskPriorityConfig, fmtHours,
  type TaskStatus,
} from "@/lib/productivity-data";
import { motion, Reorder } from "framer-motion";

const COLUMNS: TaskStatus[] = ["backlog", "todo", "in_progress", "review", "done"];

export default function KanbanBoardPage() {
  const [search, setSearch] = useState("");
  const [boardTasks, setBoardTasks] = useState(tasks);

  const filtered = boardTasks.filter((t) => {
    if (!search) return true;
    return t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.clientName?.toLowerCase().includes(search.toLowerCase()) ||
      t.projectName?.toLowerCase().includes(search.toLowerCase());
  });

  const byStatus = (status: TaskStatus) => filtered.filter((t) => t.status === status);

  const totalByStatus = COLUMNS.reduce((acc, s) => ({
    ...acc,
    [s]: tasks.filter((t) => t.status === s).length,
  }), {} as Record<TaskStatus, number>);

  return (
    <motion.div className="p-6 space-y-5" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Kanban</h1>
          <p className="text-sm text-muted-foreground">Visualisez et gérez vos tâches en cours</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Filtrer..." className="pl-8 h-8 text-sm w-48"
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm"><Filter className="h-3.5 w-3.5 mr-1.5" />Filtrer</Button>
          <Button size="sm" className="gradient-primary text-primary-foreground">
            <Plus className="h-3.5 w-3.5 mr-1.5" />Nouvelle tâche
          </Button>
        </div>
      </div>

      {/* Board */}
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-220px)]">
        {COLUMNS.map((status) => {
          const sc = taskStatusConfig[status];
          const colTasks = byStatus(status);
          return (
            <div key={status} className="flex-shrink-0 w-72">
              {/* Column header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${sc.bg} ${sc.color}`}>
                    {sc.label}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">
                    {totalByStatus[status]}
                  </span>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Cards */}
              <div className="space-y-2.5">
                {colTasks.map((task) => {
                  const pc = taskPriorityConfig[task.priority];
                  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date("2024-03-09") && task.status !== "done";
                  return (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ y: -1 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Card className={`border-border/60 shadow-sm hover:shadow-md transition-shadow cursor-pointer group ${isOverdue ? "border-destructive/40" : ""}`}>
                        <CardContent className="p-3.5 space-y-2.5">
                          {/* Top row */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <div className={`h-2 w-2 rounded-full flex-shrink-0 ${pc.dot}`} />
                              {task.tags.slice(0, 2).map((tag) => (
                                <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="text-xs">
                                <DropdownMenuItem><Eye className="h-3 w-3 mr-2" />Voir</DropdownMenuItem>
                                <DropdownMenuItem><Edit className="h-3 w-3 mr-2" />Modifier</DropdownMenuItem>
                                <DropdownMenuItem><ChevronRight className="h-3 w-3 mr-2" />Déplacer</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive"><Trash2 className="h-3 w-3 mr-2" />Supprimer</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          {/* Title */}
                          <p className="text-xs font-medium leading-snug">{task.title}</p>

                          {/* Project / Client */}
                          {(task.projectName || task.clientName) && (
                            <p className="text-[10px] text-muted-foreground truncate">
                              {task.projectName ?? task.clientName}
                            </p>
                          )}

                          {/* Footer */}
                          <div className="flex items-center justify-between gap-2 pt-0.5">
                            <div className="flex items-center gap-2">
                              {task.dueDate && (
                                <span className={`flex items-center gap-1 text-[10px] ${isOverdue ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                                  <Calendar className="h-2.5 w-2.5" />
                                  {new Date(task.dueDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                                </span>
                              )}
                              {task.timeEstimate && (
                                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                  <Clock className="h-2.5 w-2.5" />
                                  {fmtHours(task.timeSpent ?? 0)}/{fmtHours(task.timeEstimate)}
                                </span>
                              )}
                            </div>
                            {task.assignee && (
                              <div className="h-5 w-5 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-[8px] font-bold flex-shrink-0">
                                {task.assignee.split(" ").map((n) => n[0]).join("")}
                              </div>
                            )}
                          </div>

                          {/* Progress bar if time tracked */}
                          {task.timeEstimate && task.timeSpent !== undefined && task.timeSpent > 0 && (
                            <div className="h-1 rounded-full bg-secondary overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${(task.timeSpent / task.timeEstimate) > 1 ? "bg-destructive" : "gradient-primary"}`}
                                style={{ width: `${Math.min((task.timeSpent / task.timeEstimate) * 100, 100)}%` }}
                              />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}

                {/* Add card */}
                <button className="w-full p-2.5 rounded-lg border border-dashed border-border/60 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors flex items-center justify-center gap-1.5">
                  <Plus className="h-3.5 w-3.5" />Ajouter une tâche
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
