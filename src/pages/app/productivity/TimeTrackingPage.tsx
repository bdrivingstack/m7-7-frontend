import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Play, Pause, StopCircle, Plus, Clock, TrendingUp,
  CheckCircle, Euro, MoreHorizontal, Edit, Trash2,
  Calendar, Download, Timer, Zap,
} from "lucide-react";
import { timeEntries, fmtEUR, fmtHours } from "@/lib/productivity-data";
import { motion } from "framer-motion";

function pad(n: number) { return String(n).padStart(2, "0"); }
function fmtTimer(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

// Group entries by date
const grouped = timeEntries.reduce((acc, e) => {
  if (!acc[e.date]) acc[e.date] = [];
  acc[e.date].push(e);
  return acc;
}, {} as Record<string, typeof timeEntries>);

const dates = Object.keys(grouped).sort().reverse();

export default function TimeTrackingPage() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [currentTask, setCurrentTask] = useState("");
  const [billable, setBillable] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const totalMinutes = timeEntries.reduce((s, e) => s + e.duration, 0);
  const billableMinutes = timeEntries.filter((e) => e.billable).reduce((s, e) => s + e.duration, 0);
  const billedMinutes = timeEntries.filter((e) => e.billed).reduce((s, e) => s + e.duration, 0);
  const billableRevenue = timeEntries
    .filter((e) => e.billable && e.rate)
    .reduce((s, e) => s + (e.duration / 60) * (e.rate ?? 0), 0);

  return (
    <motion.div className="p-6 space-y-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Suivi du temps</h1>
          <p className="text-sm text-muted-foreground">Tracez vos heures, analysez votre rentabilité</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="h-3.5 w-3.5 mr-1.5" />Exporter</Button>
          <Button size="sm" className="gradient-primary text-primary-foreground">
            <Plus className="h-3.5 w-3.5 mr-1.5" />Entrée manuelle
          </Button>
        </div>
      </div>

      {/* Timer widget */}
      <Card className={`border-2 transition-colors ${running ? "border-primary/50 bg-primary/5" : "border-border/50"}`}>
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 w-full">
              <Input
                placeholder="Sur quoi travaillez-vous ?"
                className="border-0 bg-transparent text-sm font-medium placeholder:text-muted-foreground focus-visible:ring-0 px-0 h-auto text-base"
                value={currentTask}
                onChange={(e) => setCurrentTask(e.target.value)}
              />
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Switch checked={billable} onCheckedChange={setBillable} className="scale-75" />
                  <span>Facturable</span>
                </div>
                <span className="text-xs text-muted-foreground">Projet : sélectionner</span>
                <span className="text-xs text-muted-foreground">Client : sélectionner</span>
              </div>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0">
              <span className={`font-mono text-4xl font-bold tabular-nums transition-colors ${running ? "text-primary" : "text-foreground"}`}>
                {fmtTimer(elapsed)}
              </span>
              <div className="flex gap-2">
                {!running ? (
                  <Button
                    size="icon" className="h-12 w-12 gradient-primary text-primary-foreground rounded-full shadow-glow"
                    onClick={() => setRunning(true)}
                  >
                    <Play className="h-5 w-5 ml-0.5" />
                  </Button>
                ) : (
                  <>
                    <Button
                      size="icon" variant="outline" className="h-12 w-12 rounded-full"
                      onClick={() => setRunning(false)}
                    >
                      <Pause className="h-5 w-5" />
                    </Button>
                    <Button
                      size="icon" variant="destructive" className="h-12 w-12 rounded-full"
                      onClick={() => { setRunning(false); setElapsed(0); }}
                    >
                      <StopCircle className="h-5 w-5" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Total tracé</span>
            </div>
            <p className="text-2xl font-display font-bold">{fmtHours(totalMinutes / 60)}</p>
            <p className="text-xs text-muted-foreground">{timeEntries.length} entrées</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs text-muted-foreground">Facturable</span>
            </div>
            <p className="text-2xl font-display font-bold text-primary">{fmtHours(billableMinutes / 60)}</p>
            <p className="text-xs text-muted-foreground">{Math.round((billableMinutes / totalMinutes) * 100)}% du temps</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-3.5 w-3.5 text-success" />
              <span className="text-xs text-muted-foreground">Facturé</span>
            </div>
            <p className="text-2xl font-display font-bold text-success">{fmtHours(billedMinutes / 60)}</p>
            <p className="text-xs text-muted-foreground">{fmtHours((billableMinutes - billedMinutes) / 60)} à facturer</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-3.5 w-3.5 text-warning" />
              <span className="text-xs text-muted-foreground">CA facturable</span>
            </div>
            <p className="text-2xl font-display font-bold">{fmtEUR(billableRevenue)}</p>
            <p className="text-xs text-muted-foreground">
              TJM moyen {fmtEUR(Math.round(billableRevenue / (billableMinutes / 60 / 8)))} /j
            </p>
          </CardContent>
        </Card>
      </div>

      {/* To-bill alert */}
      {billableMinutes - billedMinutes > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-lg border border-warning/30 bg-warning/5">
          <Timer className="h-4 w-4 text-warning flex-shrink-0" />
          <div className="flex-1 text-sm">
            <span className="font-medium">{fmtHours((billableMinutes - billedMinutes) / 60)} d'heures facturables non encore facturées</span>
            <span className="text-muted-foreground"> — soit {fmtEUR(timeEntries.filter(e => e.billable && !e.billed && e.rate).reduce((s, e) => s + (e.duration / 60) * (e.rate ?? 0), 0))} à générer</span>
          </div>
          <Button size="sm" className="gradient-primary text-primary-foreground text-xs flex-shrink-0">
            Générer une facture
          </Button>
        </div>
      )}

      {/* Entries by day */}
      <div className="space-y-4">
        {dates.map((date) => {
          const dayEntries = grouped[date];
          const dayMinutes = dayEntries.reduce((s, e) => s + e.duration, 0);
          const dayBillable = dayEntries.filter(e => e.billable).reduce((s, e) => s + e.duration, 0);

          return (
            <div key={date}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-semibold">
                    {new Date(date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                  </h3>
                  <Badge variant="secondary" className="text-[10px]">{fmtHours(dayMinutes / 60)}</Badge>
                  {dayBillable < dayMinutes && (
                    <span className="text-[10px] text-muted-foreground">{fmtHours(dayBillable / 60)} facturable</span>
                  )}
                </div>
              </div>
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-border/50">
                    {dayEntries.map((entry) => (
                      <div key={entry.id} className="flex items-center gap-4 p-3.5 hover:bg-muted/20 transition-colors group">
                        {/* Color bar */}
                        <div className={`w-1 h-8 rounded-full flex-shrink-0 ${entry.billable ? "gradient-primary" : "bg-muted"}`} />

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{entry.taskTitle}</p>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                            {entry.projectName && <span className="text-primary">{entry.projectName}</span>}
                            {entry.clientName && <span>{entry.clientName}</span>}
                            {!entry.billable && (
                              <span className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Non facturable</span>
                            )}
                            {entry.billable && entry.billed && (
                              <span className="px-1.5 py-0.5 rounded bg-success/10 text-success">Facturé</span>
                            )}
                            {entry.billable && !entry.billed && (
                              <span className="px-1.5 py-0.5 rounded bg-warning/10 text-warning">À facturer</span>
                            )}
                          </div>
                        </div>

                        {/* Duration & rate */}
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-semibold">{fmtHours(entry.duration / 60)}</p>
                          {entry.rate && (
                            <p className="text-[10px] text-muted-foreground">
                              {fmtEUR((entry.duration / 60) * entry.rate)}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="text-xs">
                            <DropdownMenuItem><Edit className="h-3 w-3 mr-2" />Modifier</DropdownMenuItem>
                            <DropdownMenuItem><Play className="h-3 w-3 mr-2" />Relancer le timer</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive"><Trash2 className="h-3 w-3 mr-2" />Supprimer</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
