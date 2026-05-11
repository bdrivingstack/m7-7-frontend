import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { Link, useNavigate } from "react-router-dom";
import {
  Search, Plus, Eye, Copy, Send, MoreHorizontal, Download,
  ArrowRight, Loader2, RefreshCw,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { quotes as mockQuotes, quoteStatusConfig, fmtEUR, type QuoteStatus } from "@/lib/sales-data";
import { useApi } from "@/hooks/useApi";
import { useDemo } from "@/contexts/DemoContext";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

type StatusFilter = "all" | QuoteStatus;

export default function QuotesListPage() {
  const navigate  = useNavigate();
  const demo      = useDemo();
  const isDemo    = !!demo?.isDemo;
  const prefix    = isDemo ? "/demo" : "/app";

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const queryParams = new URLSearchParams({
    page: String(page), limit: "20",
    ...(statusFilter !== "all" ? { status: statusFilter } : {}),
    ...(search ? { search } : {}),
  });
  const { data: apiData, loading, refetch } = useApi<any>(`/api/quotes?${queryParams}`, { skip: isDemo });

  const quotes = isDemo
    ? mockQuotes
    : (apiData?.data ?? apiData?.quotes ?? []);
  const total = apiData?.total ?? quotes.length;

  const filtered = !apiData
    ? quotes.filter((q: any) => {
        if (statusFilter !== "all" && q.status !== statusFilter) return false;
        if (search && !q.number?.toLowerCase().includes(search.toLowerCase()) && !q.client?.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      })
    : quotes;

  const totalPending  = filtered.filter((q: any) => q.status === "sent").reduce((s: number, q: any) => s + q.total, 0);
  const totalAccepted = filtered.filter((q: any) => q.status === "accepted").reduce((s: number, q: any) => s + q.total, 0);

  const statusFilters: { value: StatusFilter; label: string; count: number }[] = [
    { value: "all",      label: "Tous",       count: total },
    { value: "draft",    label: "Brouillons", count: filtered.filter((q: any) => q.status === "draft").length },
    { value: "sent",     label: "Envoyés",    count: filtered.filter((q: any) => q.status === "sent").length },
    { value: "accepted", label: "Acceptés",   count: filtered.filter((q: any) => q.status === "accepted").length },
    { value: "rejected", label: "Refusés",    count: filtered.filter((q: any) => q.status === "rejected").length },
    { value: "expired",  label: "Expirés",    count: filtered.filter((q: any) => q.status === "expired").length },
  ];

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleExport = () => {
    const rows = [
      ["N°", "Client", "Date", "Validité", "Montant TTC", "Statut"],
      ...filtered.map((q: any) => [
        q.number, q.client,
        new Date(q.date).toLocaleDateString("fr-FR"),
        new Date(q.validUntil).toLocaleDateString("fr-FR"),
        q.total, q.status,
      ]),
    ];
    const csv  = rows.map(r => r.map(String).join(";")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const a    = document.createElement("a");
    a.href     = URL.createObjectURL(blob);
    a.download = `devis_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(a.href);
    toast({ title: "Export réussi", description: `${filtered.length} devis exportés.` });
  };

  const handleSend = async (q: any) => {
    if (isDemo) {
      toast({ title: "Envoi simulé", description: `Mode démo : ${q.number} n'est pas réellement envoyé.` });
      return;
    }
    try {
      const res = await fetch(`/api/quotes/${q.id}/send`, { method: "POST", credentials: "include" });
      if (res.ok) {
        toast({ title: "Devis envoyé", description: `${q.number} a été envoyé au client.` });
        refetch();
      } else {
        const err = await res.json().catch(() => ({}));
        toast({ title: "Erreur d'envoi", description: err.message ?? "Impossible d'envoyer le devis.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erreur réseau", description: "Impossible de contacter le serveur.", variant: "destructive" });
    }
  };

  const handleConvert = async (q: any) => {
    if (isDemo) {
      toast({ title: "Conversion simulée", description: "Mode démo : redirection vers l'éditeur de facture." });
      navigate(`${prefix}/sales/invoices/new?fromQuote=${q.id}`);
      return;
    }
    try {
      const res = await fetch(`/api/quotes/${q.id}/convert`, { method: "POST", credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        toast({ title: "Facture créée", description: `Le devis ${q.number} a été converti.` });
        navigate(`${prefix}/sales/invoices/${data.id ?? ""}`);
        refetch();
      } else {
        const err = await res.json().catch(() => ({}));
        toast({ title: "Erreur de conversion", description: err.message ?? "Impossible de convertir le devis.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erreur réseau", description: "Impossible de contacter le serveur.", variant: "destructive" });
    }
  };

  const handleDownloadPdf = (q: any) => {
    toast({ title: "PDF en cours", description: `Génération du PDF de ${q.number}…` });
    window.open(`/api/quotes/${q.id}/pdf`, "_blank");
  };

  return (
    <motion.div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-full overflow-x-hidden" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-fluid-2xl font-display font-bold">Devis</h1>
          <p className="text-sm text-muted-foreground">Créez et suivez vos propositions commerciales</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
            {loading ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5 mr-1.5" />}
            Actualiser
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-3.5 w-3.5 mr-1.5" />Exporter CSV
          </Button>
          <Link to={`${prefix}/sales/quotes/new`}>
            <Button size="sm" className="gradient-primary text-primary-foreground">
              <Plus className="h-3.5 w-3.5 mr-1.5" />Nouveau devis
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-3.5 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">En attente</p>
              <InfoTooltip title="Devis en attente" description="Montant total des devis envoyés aux clients et qui n'ont pas encore reçu de réponse." benefit="Relancez les devis sans réponse après 5-7 jours pour améliorer votre taux de conversion." />
            </div>
            <p className="text-xl font-display font-bold text-info">{fmtEUR(totalPending)}</p>
          </CardContent>
        </Card>
        <Card className="border-success/20">
          <CardContent className="p-3.5 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Acceptés</p>
              <InfoTooltip title="Devis acceptés" description="Montant total des devis que vos clients ont acceptés. Ces devis peuvent être convertis en facture en 1 clic." formula="Σ montants des devis dont statut = ACCEPTED" benefit="Un devis accepté est un engagement commercial. Convertissez-le en facture rapidement pour déclencher le paiement." />
            </div>
            <p className="text-xl font-display font-bold text-success">{fmtEUR(totalAccepted)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par n° ou client..."
            className="pl-9 h-8 text-sm"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
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

      {/* Table */}
      <Card><CardContent className="p-0">
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
              {filtered.map((q: any) => {
                const sc = quoteStatusConfig[q.status] ?? { label: q.status, color: "" };
                return (
                  <tr key={q.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="p-3">
                      <Link
                        to={`${prefix}/sales/quotes/${q.id}`}
                        className="font-mono font-medium text-primary hover:underline"
                      >
                        {q.number}
                      </Link>
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
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="text-xs">
                          <DropdownMenuItem onClick={() => navigate(`${prefix}/sales/quotes/${q.id}`)}>
                            <Eye className="h-3 w-3 mr-2" />Voir
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`${prefix}/sales/quotes/new?duplicateFrom=${q.id}`)}>
                            <Copy className="h-3 w-3 mr-2" />Dupliquer
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSend(q)}>
                            <Send className="h-3 w-3 mr-2" />Envoyer
                          </DropdownMenuItem>
                          {q.status === "accepted" && !q.convertedInvoice && (
                            <DropdownMenuItem onClick={() => handleConvert(q)}>
                              <ArrowRight className="h-3 w-3 mr-2" />Convertir en facture
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleDownloadPdf(q)}>
                            <Download className="h-3 w-3 mr-2" />PDF
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">Aucun devis trouvé</div>
          )}
        </div>
      </CardContent></Card>
    </motion.div>
  );
}
