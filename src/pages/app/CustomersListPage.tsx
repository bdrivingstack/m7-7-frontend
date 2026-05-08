import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search, Plus, MoreHorizontal, Eye, Mail, FileText,
  TrendingUp, AlertTriangle, Users, Download, Filter,
  ExternalLink, Star, Loader2, RefreshCw,
} from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { useDemo } from "@/contexts/DemoContext";

// Mock data — utilisé uniquement en mode /demo/*
import {
  customers as mockCustomers, statusConfig, riskConfig, fmtEUR,
  type CustomerStatus, type RiskScore,
} from "@/lib/customers-data";

type StatusFilter = "all" | CustomerStatus;

export default function CustomersListPage() {
  const navigate  = useNavigate();
  const demo      = useDemo();
  const isDemo    = !!demo?.isDemo;
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [riskFilter,   setRiskFilter]   = useState<"all" | RiskScore>("all");
  const [page,         setPage]         = useState(1);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newCustomer,  setNewCustomer]  = useState({ name: "", email: "", phone: "", address: "", siret: "" });
  const [saving,       setSaving]       = useState(false);

  // ── API (ignorée en mode démo) ─────────────────────────────────────────────
  const queryParams = new URLSearchParams({
    page: String(page), limit: "20",
    ...(search       ? { search }               : {}),
    ...(statusFilter !== "all" ? { status: statusFilter } : {}),
    ...(riskFilter   !== "all" ? { risk: riskFilter }     : {}),
  });
  const { data: apiData, loading, refetch } = useApi<any>(`/api/customers?${queryParams}`, { skip: isDemo });

  // /demo/* → données mock · /app/* → API uniquement (jamais de fallback mock)
  const customers = isDemo
    ? mockCustomers
    : (apiData?.data ?? apiData?.customers ?? []);
  const total     = apiData?.total ?? customers.length;

  const filtered = !apiData
    ? customers.filter((c: any) => {
        if (statusFilter !== "all" && c.status !== statusFilter) return false;
        if (riskFilter   !== "all" && c.riskScore !== riskFilter) return false;
        if (search) {
          const q = search.toLowerCase();
          if (!c.name.toLowerCase().includes(q) && !c.siret?.includes(q) && !c.contacts?.[0]?.email?.toLowerCase().includes(q)) return false;
        }
        return true;
      })
    : customers;

  const totalRevenue = filtered.reduce((s: number, c: any) => s + (c.totalRevenue ?? 0), 0);
  const totalUnpaid  = filtered.reduce((s: number, c: any) => s + (c.totalUnpaid  ?? 0), 0);
  const atRisk       = filtered.filter((c: any) => c.riskScore === "high").length;
  const active       = filtered.filter((c: any) => c.status === "active").length;

  const statusFilters: { value: StatusFilter; label: string }[] = [
    { value: "all",      label: `Tous (${total})` },
    { value: "active",   label: `Actifs (${filtered.filter((c: any) => c.status === "active").length})` },
    { value: "at_risk",  label: `À risque (${filtered.filter((c: any) => c.status === "at_risk").length})` },
    { value: "inactive", label: `Inactifs (${filtered.filter((c: any) => c.status === "inactive").length})` },
  ];

  // ── Exporter CSV ──────────────────────────────────────────────────────────
  const handleExport = () => {
    const rows = [
      ["Nom", "Email", "CA total", "Impayés", "Statut", "Risque"],
      ...filtered.map((c: any) => [
        c.name,
        c.contacts?.[0]?.email ?? "",
        c.totalRevenue ?? 0,
        c.totalUnpaid ?? 0,
        c.status,
        c.riskScore,
      ]),
    ];
    const csv = rows.map(r => r.map(String).join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `clients_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Export réussi", description: `${filtered.length} clients exportés en CSV.` });
  };

  // ── Créer client ──────────────────────────────────────────────────────────
  const handleCreateCustomer = async () => {
    if (!newCustomer.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/customers", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCustomer),
      });
      if (res.ok) {
        const data = await res.json();
        toast({ title: "Client créé", description: `${newCustomer.name} a été ajouté avec succès.` });
        setShowNewModal(false);
        setNewCustomer({ name: "", email: "", phone: "", address: "", siret: "" });
        refetch();
        if (data?.id) navigate(`/app/customers/${data.id}`);
      } else {
        const errData = await res.json().catch(() => ({}));
        toast({
          title: "Erreur lors de la création",
          description: errData.message ?? "Impossible de créer le client. Vérifiez les informations saisies.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Erreur réseau",
        description: "Impossible de contacter le serveur. Vérifiez votre connexion.",
        variant: "destructive",
      });
      setShowNewModal(false);
    } finally {
      setSaving(false);
    }
  };

  // ── Actions ligne ─────────────────────────────────────────────────────────
  const handleNewInvoice = (customerId: string, customerName: string) => {
    navigate(`/app/sales/invoices/new?customerId=${customerId}&customerName=${encodeURIComponent(customerName)}`);
  };

  const handleSendEmail = (email: string) => {
    if (email) window.open(`mailto:${email}`);
    else toast({ title: "Pas d'email", description: "Ce client n'a pas d'adresse email renseignée.", variant: "destructive" });
  };

  return (
    <motion.div className="p-6 space-y-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Clients</h1>
          <p className="text-sm text-muted-foreground">
            Gérez vos clients et suivez leur activité
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
          <Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => setShowNewModal(true)}>
            <Plus className="h-3.5 w-3.5 mr-1.5" />Nouveau client
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2"><Users className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-xs text-muted-foreground">Clients actifs</span><InfoTooltip title="Clients actifs" description="Clients ayant au moins une facture émise ce trimestre et dont le statut est 'actif'." benefit="Suivre ce chiffre permet d'identifier une croissance ou une perte de clientèle." /></div>
          <p className="text-2xl font-display font-bold">{active}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{customers.length} au total</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2"><TrendingUp className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-xs text-muted-foreground">CA total</span><InfoTooltip title="Chiffre d'affaires total" description="Somme du CA HT généré par l'ensemble des clients filtrés sur toutes les périodes." formula="Σ totalRevenue de chaque client" benefit="Indique la valeur globale de votre portefeuille clients." /></div>
          <p className="text-2xl font-display font-bold">{fmtEUR(totalRevenue)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Tous clients confondus</p>
        </CardContent></Card>
        <Card className="border-destructive/20"><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2"><AlertTriangle className="h-3.5 w-3.5 text-destructive" /><span className="text-xs text-muted-foreground">Impayés</span><InfoTooltip title="Impayés clients" description="Total des montants dus non encore réglés par vos clients, toutes factures confondues." formula="Σ (totalDue des factures non payées par client)" benefit="Un impayé élevé signale un risque de trésorerie. Déclenchez des relances depuis la fiche client." /></div>
          <p className="text-2xl font-display font-bold text-destructive">{fmtEUR(totalUnpaid)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{customers.filter((c) => c.totalUnpaid > 0).length} clients concernés</p>
        </CardContent></Card>
        <Card className="border-warning/20"><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2"><AlertTriangle className="h-3.5 w-3.5 text-warning" /><span className="text-xs text-muted-foreground">À risque élevé</span><InfoTooltip title="Clients à risque élevé" description="Clients dont le score de risque est 'élevé' : délai de paiement long, impayés répétés, ou inactivité prolongée." benefit="Priorisez les relances sur ces clients et envisagez de revoir leurs conditions de paiement." /></div>
          <p className="text-2xl font-display font-bold text-warning">{atRisk}</p>
          <p className="text-xs text-muted-foreground mt-0.5">clients à surveiller</p>
        </CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher un client..." className="pl-9 h-8 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1 flex-wrap">
          {statusFilters.map((f) => (
            <Button key={f.value} variant={statusFilter === f.value ? "default" : "outline"} size="sm"
              className={`text-xs h-7 ${statusFilter === f.value ? "gradient-primary text-primary-foreground" : ""}`}
              onClick={() => setStatusFilter(f.value)}>{f.label}</Button>
          ))}
        </div>
        <div className="flex gap-1">
          {(["all", "low", "medium", "high"] as const).map((r) => (
            <Button key={r} variant={riskFilter === r ? "default" : "outline"} size="sm"
              className={`text-xs h-7 ${riskFilter === r ? "gradient-primary text-primary-foreground" : ""}`}
              onClick={() => setRiskFilter(r)}>
              {r === "all" ? "Tous risques" : riskConfig[r].label}
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
                <th className="text-left p-3 font-medium text-muted-foreground">Client</th>
                <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Contact principal</th>
                <th className="text-right p-3 font-medium text-muted-foreground">CA total</th>
                <th className="text-right p-3 font-medium text-muted-foreground hidden sm:table-cell">Impayés</th>
                <th className="text-center p-3 font-medium text-muted-foreground hidden lg:table-cell">Délai moyen</th>
                <th className="text-center p-3 font-medium text-muted-foreground">Statut</th>
                <th className="text-center p-3 font-medium text-muted-foreground hidden lg:table-cell">Risque</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((customer) => {
                const sc = statusConfig[customer.status];
                const rc = riskConfig[customer.riskScore];
                return (
                  <motion.tr key={customer.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0">
                          {customer.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <Link to={`/app/customers/${customer.id}`} className="font-medium text-foreground hover:text-primary transition-colors">{customer.name}</Link>
                          <div className="flex gap-1 mt-0.5 flex-wrap">
                            {customer.tags.slice(0, 2).map((tag) => (
                              <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{tag}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      <p className="font-medium">{customer.contacts[0]?.name}</p>
                      <p className="text-muted-foreground">{customer.contacts[0]?.email}</p>
                    </td>
                    <td className="p-3 text-right font-semibold">{fmtEUR(customer.totalRevenue)}</td>
                    <td className="p-3 text-right hidden sm:table-cell">
                      {customer.totalUnpaid > 0
                        ? <span className="text-destructive font-medium">{fmtEUR(customer.totalUnpaid)}</span>
                        : <span className="text-success">—</span>}
                    </td>
                    <td className="p-3 text-center hidden lg:table-cell">
                      <span className={`font-medium ${customer.averagePaymentDelay > 40 ? "text-destructive" : customer.averagePaymentDelay > 30 ? "text-warning" : "text-success"}`}>
                        {customer.averagePaymentDelay}j
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant="secondary" className={`text-[10px] ${sc.color}`}>{sc.label}</Badge>
                      {(customer as any).urssafSapEnabled && (
                        <span title="Avance immédiate crédit d'impôt URSSAF activée"
                          className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-0.5">
                          ⚡ URSSAF
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center hidden lg:table-cell">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${rc.bg} ${rc.color}`}>{rc.label}</span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/app/customers/${customer.id}`}>
                          <Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="h-3.5 w-3.5" /></Button>
                        </Link>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-3.5 w-3.5" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="text-xs">
                            <DropdownMenuItem onClick={() => handleNewInvoice(customer.id, customer.name)}>
                              <FileText className="h-3 w-3 mr-2" />Nouvelle facture
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSendEmail(customer.contacts[0]?.email)}>
                              <Mail className="h-3 w-3 mr-2" />Envoyer un email
                            </DropdownMenuItem>
                            {customer.portalAccess && (
                              <DropdownMenuItem onClick={() => toast({ title: "Portail client", description: "Lien portail copié dans le presse-papier." })}>
                                <ExternalLink className="h-3 w-3 mr-2" />Accès portail
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Aucun client trouvé</p>
            </div>
          )}
        </div>
      </CardContent></Card>

      {/* ── Modal Nouveau client ─────────────────────────────────────────── */}
      <Dialog open={showNewModal} onOpenChange={setShowNewModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nouveau client</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label className="text-xs">Nom / Raison sociale *</Label>
              <Input value={newCustomer.name} onChange={e => setNewCustomer(p => ({...p, name: e.target.value}))} placeholder="ACME SARL" className="h-8 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Email</Label>
                <Input type="email" value={newCustomer.email} onChange={e => setNewCustomer(p => ({...p, email: e.target.value}))} placeholder="contact@client.fr" className="h-8 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Téléphone</Label>
                <Input value={newCustomer.phone} onChange={e => setNewCustomer(p => ({...p, phone: e.target.value}))} placeholder="06 12 34 56 78" className="h-8 text-sm" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Adresse</Label>
              <Input value={newCustomer.address} onChange={e => setNewCustomer(p => ({...p, address: e.target.value}))} placeholder="12 rue de la Paix, 75001 Paris" className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">SIRET</Label>
              <Input value={newCustomer.siret} onChange={e => setNewCustomer(p => ({...p, siret: e.target.value}))} placeholder="123 456 789 00010" className="h-8 text-sm" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowNewModal(false)}>Annuler</Button>
            <Button size="sm" className="gradient-primary text-primary-foreground" onClick={handleCreateCustomer} disabled={saving || !newCustomer.name.trim()}>
              {saving ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Plus className="h-3.5 w-3.5 mr-1.5" />}
              Créer le client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
