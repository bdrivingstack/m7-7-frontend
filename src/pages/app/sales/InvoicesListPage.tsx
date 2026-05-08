import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import {
  Search, Plus, Eye, Copy, MoreHorizontal, Send,
  Download, Loader2, RefreshCw,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useApi } from "@/hooks/useApi";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { InfoTooltip, DASHBOARD_TOOLTIPS } from "@/components/ui/InfoTooltip";
import { invoices as mockInvoices, invoiceStatusConfig, fmtEUR, type InvoiceStatus } from "@/lib/sales-data";
import { useDemo } from "@/contexts/DemoContext";

type StatusFilter = "all" | InvoiceStatus;

export default function InvoicesListPage() {
  const navigate = useNavigate();
  const demo     = useDemo();
  const isDemo   = !!demo?.isDemo;
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search,       setSearch]       = useState("");
  const [page,         setPage]         = useState(1);

  const queryParams = new URLSearchParams({
    page: String(page), limit: "20",
    ...(statusFilter !== "all" ? { status: statusFilter } : {}),
    ...(search ? { search } : {}),
  });
  const { data: apiData, loading, refetch } = useApi<any>(`/api/invoices?${queryParams}`, { skip: isDemo });

  // /demo/* → données mock · /app/* → API uniquement
  const invoices = isDemo
    ? mockInvoices
    : (apiData?.data ?? apiData?.invoices ?? []);
  const total    = apiData?.total ?? invoices.length;

  const filtered = !apiData
    ? invoices.filter((inv: any) => {
        if (statusFilter !== "all" && inv.status !== statusFilter) return false;
        if (search && !inv.number?.toLowerCase().includes(search.toLowerCase()) && !inv.client?.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      })
    : invoices;

  const totalPaid    = filtered.filter((i: any) => i.status === "paid").reduce((s: number, i: any) => s + (i.total ?? 0), 0);
  const totalPending = filtered.filter((i: any) => ["sent","partially_paid"].includes(i.status)).reduce((s: number, i: any) => s + ((i.total ?? 0) - (i.paidAmount ?? 0)), 0);
  const totalOverdue = filtered.filter((i: any) => i.status === "overdue").reduce((s: number, i: any) => s + (i.total ?? 0), 0);

  const statusFilters: { value: StatusFilter; label: string; count: number }[] = [
    { value: "all",            label: "Toutes",     count: total },
    { value: "draft",          label: "Brouillons", count: filtered.filter((i: any) => i.status === "draft").length },
    { value: "sent",           label: "Envoyées",   count: filtered.filter((i: any) => i.status === "sent").length },
    { value: "partially_paid", label: "Partielles", count: filtered.filter((i: any) => i.status === "partially_paid").length },
    { value: "paid",           label: "Payées",     count: filtered.filter((i: any) => i.status === "paid").length },
    { value: "overdue",        label: "En retard",  count: filtered.filter((i: any) => i.status === "overdue").length },
  ];

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleExport = () => {
    const rows = [
      ["N°", "Client", "Date", "Échéance", "Montant TTC", "Payé", "Statut"],
      ...filtered.map((i: any) => [
        i.number, i.client,
        new Date(i.date).toLocaleDateString("fr-FR"),
        new Date(i.dueDate).toLocaleDateString("fr-FR"),
        i.total, i.paidAmount ?? 0, i.status,
      ]),
    ];
    const csv  = rows.map(r => r.map(String).join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const a    = document.createElement("a");
    a.href     = URL.createObjectURL(blob);
    a.download = `factures_${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(a.href);
    toast({ title: "Export réussi", description: `${filtered.length} factures exportées.` });
  };

  const handleDuplicate = (inv: any) => {
    navigate(`/app/sales/invoices/new?duplicateFrom=${inv.id}`);
  };

  const handleSend = async (inv: any) => {
    if (isDemo) {
      toast({ title: "Envoi simulé", description: `Mode démo : ${inv.number} n'est pas réellement envoyée.` });
      return;
    }
    try {
      const res = await fetch(`/api/invoices/${inv.id}/send`, { method: "POST", credentials: "include" });
      if (res.ok) {
        toast({ title: "Facture envoyée", description: `${inv.number} a été envoyée au client.` });
        refetch();
      } else {
        const errData = await res.json().catch(() => ({}));
        toast({ title: "Erreur d'envoi", description: errData.message ?? "Impossible d'envoyer la facture.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erreur réseau", description: "Impossible de contacter le serveur.", variant: "destructive" });
    }
  };

  const handleDownloadPdf = (inv: any) => {
    toast({ title: "PDF en cours", description: `Génération du PDF de ${inv.number}…` });
    window.open(`/api/invoices/${inv.id}/pdf`, "_blank");
  };

  return (
    <motion.div className="p-6 space-y-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Factures</h1>
          <p className="text-sm text-muted-foreground">
            Gérez vos factures, suivez les paiements
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
            {loading ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5 mr-1.5" />}
            Actualiser
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-3.5 w-3.5 mr-1.5" />Exporter CSV
          </Button>
          <Link to="/app/sales/invoices/new">
            <Button size="sm" className="gradient-primary text-primary-foreground">
              <Plus className="h-3.5 w-3.5 mr-1.5" />Nouvelle facture
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-3.5 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Payé</p>
            <InfoTooltip title="Montant payé" description="Total des factures dont le statut est 'Payé' sur la liste filtrée." formula="Σ total des factures avec statut = PAID" benefit="Représente vos encaissements réels sur la période." />
          </div>
          <p className="text-xl font-display font-bold text-success">{fmtEUR(totalPaid)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-3.5 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">En attente</p>
            <InfoTooltip title="Montant en attente" description="Total des montants restants à percevoir sur les factures envoyées ou partiellement payées." formula="Σ (total − paidAmount) des factures SENT ou PARTIALLY_PAID" benefit="Anticipe vos prochaines entrées de trésorerie." />
          </div>
          <p className="text-xl font-display font-bold text-info">{fmtEUR(totalPending)}</p>
        </CardContent></Card>
        <Card className="border-destructive/20"><CardContent className="p-3.5 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">En retard</p>
            <InfoTooltip {...DASHBOARD_TOOLTIPS.facturesEnRetard} />
          </div>
          <p className="text-xl font-display font-bold text-destructive">{fmtEUR(totalOverdue)}</p>
        </CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher par n° ou client..." className="pl-9 h-8 text-sm"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1 flex-wrap">
          {statusFilters.map(f => (
            <Button key={f.value} variant={statusFilter === f.value ? "default" : "outline"} size="sm"
              className={`text-xs h-7 ${statusFilter === f.value ? "gradient-primary text-primary-foreground" : ""}`}
              onClick={() => setStatusFilter(f.value)}>
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
                <th className="text-left p-3 font-medium text-muted-foreground">Échéance</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Montant</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Payé</th>
                <th className="text-center p-3 font-medium text-muted-foreground">Statut</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv: any) => {
                const sc = invoiceStatusConfig[inv.status] ?? { label: inv.status, color: "" };
                return (
                  <tr key={inv.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="p-3">
                      <Link to={`/app/sales/invoices/${inv.id}`} className="font-mono font-medium text-primary hover:underline">
                        {inv.number}
                      </Link>
                      {inv.isRecurring && <Badge variant="secondary" className="ml-1.5 text-[9px]">Récurrent</Badge>}
                    </td>
                    <td className="p-3 font-medium">{inv.client}</td>
                    <td className="p-3 text-muted-foreground">{new Date(inv.date).toLocaleDateString("fr-FR")}</td>
                    <td className="p-3 text-muted-foreground">{new Date(inv.dueDate).toLocaleDateString("fr-FR")}</td>
                    <td className="p-3 text-right font-semibold">{fmtEUR(inv.total)}</td>
                    <td className="p-3 text-right">
                      {inv.paidAmount > 0
                        ? <span className="text-success">{fmtEUR(inv.paidAmount)}</span>
                        : <span className="text-muted-foreground">—</span>}
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
                          <DropdownMenuItem onClick={() => navigate(`/app/sales/invoices/${inv.id}`)}>
                            <Eye className="h-3 w-3 mr-2" />Voir
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(inv)}>
                            <Copy className="h-3 w-3 mr-2" />Dupliquer
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSend(inv)}>
                            <Send className="h-3 w-3 mr-2" />Envoyer
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownloadPdf(inv)}>
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
            <div className="text-center py-12 text-muted-foreground text-sm">Aucune facture trouvée</div>
          )}
        </div>
      </CardContent></Card>
    </motion.div>
  );
}
