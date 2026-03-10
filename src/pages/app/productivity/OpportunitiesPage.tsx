import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus, Search, MoreHorizontal, TrendingUp, Target,
  CheckCircle, XCircle, Clock, Eye, Edit, Trash2,
  Phone, Mail, ArrowRight, Trophy, BarChart2,
} from "lucide-react";
import {
  opportunities, opportunityStageConfig, fmtEUR,
  type OpportunityStage,
} from "@/lib/productivity-data";
import { motion } from "framer-motion";

const PIPELINE_STAGES: OpportunityStage[] = ["lead", "contacted", "proposal", "negotiation"];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

export default function OpportunitiesPage() {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"pipeline" | "list">("pipeline");

  const active = opportunities.filter((o) => !["won", "lost"].includes(o.stage));
  const won = opportunities.filter((o) => o.stage === "won");
  const lost = opportunities.filter((o) => o.stage === "lost");

  const totalPipeline = active.reduce((s, o) => s + o.value * (o.probability / 100), 0);
  const totalWon = won.reduce((s, o) => s + o.value, 0);
  const winRate = Math.round((won.length / (won.length + lost.length)) * 100);

  const filtered = opportunities.filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return o.name.toLowerCase().includes(q) || o.clientName.toLowerCase().includes(q);
  });

  return (
    <motion.div className="p-6 space-y-6" variants={container} initial="hidden" animate="show">

      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Opportunités</h1>
          <p className="text-sm text-muted-foreground">Pipeline commercial et suivi des prospects</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Rechercher..." className="pl-8 h-8 text-sm w-48" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Button size="sm" className="gradient-primary text-primary-foreground">
            <Plus className="h-3.5 w-3.5 mr-1.5" />Nouvelle opportunité
          </Button>
        </div>
      </motion.div>

      {/* KPIs */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs text-muted-foreground">Pipeline pondéré</span>
            </div>
            <p className="text-2xl font-display font-bold">{fmtEUR(totalPipeline)}</p>
            <p className="text-xs text-muted-foreground">{active.length} opportunités actives</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Valeur brute</span>
            </div>
            <p className="text-2xl font-display font-bold">{fmtEUR(active.reduce((s, o) => s + o.value, 0))}</p>
            <p className="text-xs text-muted-foreground">si toutes gagnées</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-3.5 w-3.5 text-success" />
              <span className="text-xs text-muted-foreground">Gagnées (CA)</span>
            </div>
            <p className="text-2xl font-display font-bold text-success">{fmtEUR(totalWon)}</p>
            <p className="text-xs text-muted-foreground">{won.length} deal(s) closé(s)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart2 className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Taux de succès</span>
            </div>
            <p className="text-2xl font-display font-bold">{winRate}%</p>
            <p className="text-xs text-muted-foreground">{won.length}G / {lost.length}P sur {won.length + lost.length} closés</p>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs value={view} onValueChange={(v) => setView(v as any)}>
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="list">Liste</TabsTrigger>
        </TabsList>

        {/* Pipeline Kanban */}
        <TabsContent value="pipeline" className="mt-4">
          <div className="flex gap-4 overflow-x-auto pb-4">
            {PIPELINE_STAGES.map((stage) => {
              const sc = opportunityStageConfig[stage];
              const stageOpps = active.filter((o) => o.stage === stage);
              const stageValue = stageOpps.reduce((s, o) => s + o.value, 0);
              const stagePond = stageOpps.reduce((s, o) => s + o.value * (o.probability / 100), 0);

              return (
                <div key={stage} className="flex-shrink-0 w-72">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${sc.color}`}>{sc.label}</span>
                      <p className="text-[10px] text-muted-foreground mt-1">{stageOpps.length} · {fmtEUR(stageValue)} brut · {fmtEUR(stagePond)} pond.</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="space-y-2.5">
                    {stageOpps.map((opp) => {
                      const daysToClose = Math.ceil((new Date(opp.expectedClose).getTime() - new Date("2024-03-09").getTime()) / (1000 * 60 * 60 * 24));
                      return (
                        <motion.div key={opp.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          <Card className="border-border/60 hover:shadow-md transition-shadow cursor-pointer group">
                            <CardContent className="p-3.5 space-y-2.5">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-xs font-semibold leading-snug">{opp.name}</p>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100 flex-shrink-0">
                                      <MoreHorizontal className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="text-xs">
                                    <DropdownMenuItem><Eye className="h-3 w-3 mr-2" />Voir</DropdownMenuItem>
                                    <DropdownMenuItem><Edit className="h-3 w-3 mr-2" />Modifier</DropdownMenuItem>
                                    <DropdownMenuItem><CheckCircle className="h-3 w-3 mr-2 text-success" />Marquer Gagné</DropdownMenuItem>
                                    <DropdownMenuItem><XCircle className="h-3 w-3 mr-2 text-destructive" />Marquer Perdu</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>

                              <div className="flex items-center gap-2">
                                <div className="h-5 w-5 rounded gradient-primary flex items-center justify-center text-primary-foreground text-[8px] font-bold flex-shrink-0">
                                  {opp.clientName.substring(0, 2).toUpperCase()}
                                </div>
                                <span className="text-[10px] text-muted-foreground">{opp.clientName}</span>
                              </div>

                              <div className="flex items-center justify-between">
                                <p className="text-sm font-bold">{fmtEUR(opp.value)}</p>
                                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${opp.probability >= 70 ? "bg-success/10 text-success" : opp.probability >= 40 ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"}`}>
                                  {opp.probability}%
                                </span>
                              </div>

                              {/* Probability bar */}
                              <div className="h-1 rounded-full bg-secondary overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${opp.probability >= 70 ? "bg-success" : opp.probability >= 40 ? "bg-warning" : "bg-muted-foreground"}`}
                                  style={{ width: `${opp.probability}%` }}
                                />
                              </div>

                              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-2.5 w-2.5" />
                                  {daysToClose < 0
                                    ? <span className="text-destructive">En retard {Math.abs(daysToClose)}j</span>
                                    : `Closing dans ${daysToClose}j`}
                                </span>
                                <span>{opp.source}</span>
                              </div>

                              {/* Move to next stage */}
                              <button className="w-full flex items-center justify-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors py-0.5">
                                <ArrowRight className="h-2.5 w-2.5" />Passer à l'étape suivante
                              </button>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                    {stageOpps.length === 0 && (
                      <div className="border border-dashed border-border/60 rounded-lg p-6 text-center text-[11px] text-muted-foreground">
                        Aucune opportunité
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Won / Lost columns */}
            {([["won", won], ["lost", lost]] as const).map(([stage, opps]) => {
              const sc = opportunityStageConfig[stage];
              return (
                <div key={stage} className="flex-shrink-0 w-64">
                  <div className="mb-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${sc.color}`}>{sc.label}</span>
                    <p className="text-[10px] text-muted-foreground mt-1">{opps.length} · {fmtEUR(opps.reduce((s, o) => s + o.value, 0))}</p>
                  </div>
                  <div className="space-y-2">
                    {opps.map((opp) => (
                      <Card key={opp.id} className={`border-border/40 opacity-70 ${stage === "lost" ? "opacity-50" : ""}`}>
                        <CardContent className="p-3">
                          <p className="text-xs font-medium truncate">{opp.name}</p>
                          <p className="text-[10px] text-muted-foreground">{opp.clientName}</p>
                          <p className={`text-sm font-bold mt-1.5 ${stage === "won" ? "text-success" : "text-muted-foreground"}`}>
                            {fmtEUR(opp.value)}
                          </p>
                          {opp.notes && <p className="text-[9px] text-muted-foreground mt-1 italic truncate">{opp.notes}</p>}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* List view */}
        <TabsContent value="list" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left p-3 font-medium text-muted-foreground">Opportunité</th>
                    <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Client</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">Étape</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Valeur</th>
                    <th className="text-center p-3 font-medium text-muted-foreground hidden sm:table-cell">Proba.</th>
                    <th className="text-right p-3 font-medium text-muted-foreground hidden lg:table-cell">Valeur pond.</th>
                    <th className="text-right p-3 font-medium text-muted-foreground hidden sm:table-cell">Closing</th>
                    <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((opp) => {
                    const sc = opportunityStageConfig[opp.stage];
                    const daysToClose = Math.ceil((new Date(opp.expectedClose).getTime() - new Date("2024-03-09").getTime()) / (1000 * 60 * 60 * 24));
                    return (
                      <tr key={opp.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="p-3">
                          <p className="font-medium">{opp.name}</p>
                          <p className="text-[10px] text-muted-foreground">{opp.source}</p>
                        </td>
                        <td className="p-3 hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <div className="h-5 w-5 rounded gradient-primary flex items-center justify-center text-primary-foreground text-[8px] font-bold">
                              {opp.clientName.substring(0, 2).toUpperCase()}
                            </div>
                            {opp.clientName}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <Badge variant="secondary" className={`text-[10px] ${sc.color}`}>{sc.label}</Badge>
                        </td>
                        <td className="p-3 text-right font-semibold">{fmtEUR(opp.value)}</td>
                        <td className="p-3 text-center hidden sm:table-cell">
                          <span className={`font-medium ${opp.probability >= 70 ? "text-success" : opp.probability >= 40 ? "text-warning" : "text-muted-foreground"}`}>
                            {opp.probability}%
                          </span>
                        </td>
                        <td className="p-3 text-right hidden lg:table-cell text-primary font-medium">
                          {opp.stage === "won" ? fmtEUR(opp.value) : opp.stage === "lost" ? "—" : fmtEUR(Math.round(opp.value * opp.probability / 100))}
                        </td>
                        <td className="p-3 text-right hidden sm:table-cell">
                          <span className={daysToClose < 0 && !["won", "lost"].includes(opp.stage) ? "text-destructive font-medium" : "text-muted-foreground"}>
                            {new Date(opp.expectedClose).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-6 w-6"><Phone className="h-3 w-3" /></Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6"><Mail className="h-3 w-3" /></Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6"><MoreHorizontal className="h-3.5 w-3.5" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="text-xs">
                                <DropdownMenuItem><Eye className="h-3 w-3 mr-2" />Voir</DropdownMenuItem>
                                <DropdownMenuItem><Edit className="h-3 w-3 mr-2" />Modifier</DropdownMenuItem>
                                <DropdownMenuItem><CheckCircle className="h-3 w-3 mr-2 text-success" />Gagné</DropdownMenuItem>
                                <DropdownMenuItem><XCircle className="h-3 w-3 mr-2 text-destructive" />Perdu</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive"><Trash2 className="h-3 w-3 mr-2" />Supprimer</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
