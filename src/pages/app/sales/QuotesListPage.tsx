import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import {
  Search, Plus, Eye, Copy, Send, MoreHorizontal, Download,
  ArrowRight, FileText,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { quotes, quoteStatusConfig, fmtEUR, type QuoteStatus } from "@/lib/sales-data";
import { motion } from "framer-motion";

type StatusFilter = "all" | QuoteStatus;

export default function QuotesListPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");

  const filtered = quotes.filter(q => {
    if (statusFilter !== "all" && q.status !== statusFilter) return false;
    if (search && !q.number.toLowerCase().includes(search.toLowerCase()) && !q.client.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalPending = quotes.filter(q => q.status === "sent").reduce((s, q) => s + q.total, 0);
  const totalAccepted = quotes.filter(q => q.status === "accepted").reduce((s, q) => s + q.total, 0);

  const statusFilters: { value: StatusFilter; label: string; count: number }[] = [
    { value: "all", label: "Tous", count: quotes.length },
    { value: "draft", label: "Brouillons", count: quotes.filter(q => q.status === "draft").length },
    { value: "sent", label: "Envoyés", count: quotes.filter(q => q.status === "sent").length },
    { value: "accepted", label: "Acceptés", count: quotes.filter(q => q.status === "accepted").length },
    { value: "rejected", label: "Refusés", count: quotes.filter(q => q.status === "rejected").length },
    { value: "expired", label: "Expirés", count: quotes.filter(q => q.status === "expired").length },
  ];

  return (
    <motion.div className="p-6 space-y-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Devis</h1>
          <p className="text-sm text-muted-foreground">Créez et suivez vos propositions commerciales</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="h-3.5 w-3.5 mr-1.5" />Exporter</Button>
          <Link to="/app/sales/quotes/new">
            <Button size="sm" className="gradient-primary text-primary-foreground">
              <Plus className="h-3.5 w-3.5 mr-1.5" />Nouveau devis
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-3.5 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">En attente</p>
            <p className="text-xl font-display font-bold text-info">{fmtEUR(totalPending)}</p>
          </CardContent>
        </Card>
        <Card className="border-success/20">
          <CardContent className="p-3.5 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Acceptés</p>
            <p className="text-xl font-display font-bold text-success">{fmtEUR(totalAccepted)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher..." className="pl-9 h-8 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1 flex-wrap">
          {statusFilters.map(f => (
            <Button
              key={f.value}
              variant={statusFilter === f.value ? "default" : "outline"}
              size="sm"
              className={`text-xs h-7 ${statusFilter === f.value ? "gradient-primary text-primary-foreground" : ""}`}
              onClick={() => setStatusFilter(f.value)}
            >
              {f.label} ({f.count})
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left p-3 font-medium text-muted-foreground">N°</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Client</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Validité</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Montant</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">Statut</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(q => {
                  const sc = quoteStatusConfig[q.status];
                  return (
                    <tr key={q.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="p-3">
                        <Link to={`/app/sales/quotes/${q.id}`} className="font-mono font-medium text-primary hover:underline">{q.number}</Link>
                      </td>
                      <td className="p-3 font-medium">{q.client}</td>
                      <td className="p-3 text-muted-foreground">{new Date(q.date).toLocaleDateString("fr-FR")}</td>
                      <td className="p-3 text-muted-foreground">{new Date(q.validUntil).toLocaleDateString("fr-FR")}</td>
                      <td className="p-3 text-right font-semibold">{fmtEUR(q.total)}</td>
                      <td className="p-3 text-center">
                        <Badge variant="secondary" className={`text-[10px] ${sc.color}`}>{sc.label}</Badge>
                        {q.convertedInvoice && (
                          <Badge variant="secondary" className="ml-1 text-[9px] bg-primary/10 text-primary">→ {q.convertedInvoice}</Badge>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-3.5 w-3.5" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="text-xs">
                            <DropdownMenuItem><Eye className="h-3 w-3 mr-2" />Voir</DropdownMenuItem>
                            <DropdownMenuItem><Copy className="h-3 w-3 mr-2" />Dupliquer</DropdownMenuItem>
                            <DropdownMenuItem><Send className="h-3 w-3 mr-2" />Envoyer</DropdownMenuItem>
                            {q.status === "accepted" && !q.convertedInvoice && (
                              <DropdownMenuItem><ArrowRight className="h-3 w-3 mr-2" />Convertir en facture</DropdownMenuItem>
                            )}
                            <DropdownMenuItem><Download className="h-3 w-3 mr-2" />PDF</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
