import { useState, useEffect, useRef } from "react";
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
  TrendingUp, AlertTriangle, Users, Download,
  ExternalLink, Loader2, RefreshCw, X, Building2,
} from "lucide-react";
import { useApi, API_BASE } from "@/hooks/useApi";
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

// ─── Fallbacks pour les vrais clients API (sans status/riskScore mock) ────────
const scFallback = { label: "—", color: "bg-muted text-muted-foreground" };
const rcFallback = { label: "—", color: "text-muted-foreground", bg: "bg-muted/50" };

// ─── Type retour API Sirene publique (data.gouv.fr) ──────────────────────────
interface SirenResult {
  nom_complet?: string;
  nom_raison_sociale?: string;
  siren: string;
  numero_tva_intra?: string;
  siege?: {
    siret?: string;
    adresse?: string;
    commune?: string;
    code_postal?: string;
  };
}

// ─── Clé TVA intracommunautaire — algorithme officiel INSEE ──────────────────
function computeTva(siren: string): string {
  const n = parseInt(siren, 10);
  if (isNaN(n)) return "";
  const key = (12 + 3 * (n % 97)) % 97;
  return `FR${String(key).padStart(2, "0")}${siren}`;
}

// ─── État initial du formulaire nouveau client ────────────────────────────────
const EMPTY_CUSTOMER = {
  name: "", email: "", phone: "",
  address: "", city: "", postalCode: "",
  siret: "", siren: "", tvaNumber: "",
};

export default function CustomersListPage() {
  const navigate  = useNavigate();
  const demo      = useDemo();
  const isDemo    = !!demo?.isDemo;

  // ── Filtres & pagination ───────────────────────────────────────────────────
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [riskFilter,   setRiskFilter]   = useState<"all" | RiskScore>("all");
  const [page,         setPage]         = useState(1);

  // ── Modal nouveau client ───────────────────────────────────────────────────
  const [showNewModal,   setShowNewModal]   = useState(false);
  const [newCustomer,    setNewCustomer]    = useState(EMPTY_CUSTOMER);
  const [companyLocked,  setCompanyLocked]  = useState(false);
  const [saving,         setSaving]         = useState(false);

  // ── SIREN autocomplete ─────────────────────────────────────────────────────
  const [sirenQuery,    setSirenQuery]    = useState("");
  const [sirenResults,  setSirenResults]  = useState<SirenResult[]>([]);
  const [showSirenDrop, setShowSirenDrop] = useState(false);
  const [sirenLoading,  setSirenLoading]  = useState(false);
  const sirenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── API ────────────────────────────────────────────────────────────────────
  const queryParams = new URLSearchParams({
    page: String(page), limit: "20",
    ...(search                    ? { search }               : {}),
    ...(statusFilter !== "all"    ? { status: statusFilter } : {}),
    ...(riskFilter   !== "all"    ? { risk: riskFilter }     : {}),
  });
  const { data: apiData, loading, refetch } = useApi<any>(
    `/api/customers?${queryParams}`,
    { skip: isDemo },
  );

  // /demo/* → données mock · /app/* → API uniquement
  const customers = isDemo
    ? mockCustomers
    : (apiData?.data ?? apiData?.customers ?? []);
  const total = apiData?.meta?.total ?? apiData?.total ?? customers.length;

  const filtered = !apiData
    ? customers.filter((c: any) => {
        if (statusFilter !== "all" && c.status !== statusFilter) return false;
        if (riskFilter   !== "all" && c.riskScore !== riskFilter) return false;
        if (search) {
          const q = search.toLowerCase();
          if (
            !c.name?.toLowerCase().includes(q) &&
            !c.siret?.includes(q) &&
            !c.email?.toLowerCase().includes(q)
          ) return false;
        }
        return true;
      })
    : customers;

  const totalRevenue = filtered.reduce((s: number, c: any) => s + (c.totalRevenue ?? 0), 0);
  const totalUnpaid  = filtered.reduce((s: number, c: any) => s + (c.totalUnpaid  ?? 0), 0);
  const atRisk       = filtered.filter((c: any) => c.riskScore === "high").length;
  const active       = filtered.filter((c: any) => c.status   === "active").length;

  const statusFilters: { value: StatusFilter; label: string }[] = [
    { value: "all",      label: `Tous (${total})` },
    { value: "active",   label: `Actifs (${filtered.filter((c: any) => c.status === "active").length})` },
    { value: "at_risk",  label: `À risque (${filtered.filter((c: any) => c.status === "at_risk").length})` },
    { value: "inactive", label: `Inactifs (${filtered.filter((c: any) => c.status === "inactive").length})` },
  ];

  // ── Export CSV ────────────────────────────────────────────────────────────
  const handleExport = () => {
    const rows = [
      ["Nom", "Email", "CA total", "Impayés", "Statut", "Risque"],
      ...filtered.map((c: any) => [
        c.name ?? "",
        c.email ?? c.contacts?.[0]?.email ?? "",
        c.totalRevenue ?? 0,
        c.totalUnpaid  ?? 0,
        c.status   ?? "",
        c.riskScore ?? "",
      ]),
    ];
    const csv  = rows.map(r => r.map(String).join(";")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `clients_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Export réussi", description: `${filtered.length} clients exportés en CSV.` });
  };

  // ── SIREN — debounce 350ms ─────────────────────────────────────────────────
  const searchSiren = (q: string) => {
    if (sirenTimerRef.current) clearTimeout(sirenTimerRef.current);
    if (q.length < 2) {
      setSirenResults([]);
      setShowSirenDrop(false);
      return;
    }
    sirenTimerRef.current = setTimeout(async () => {
      setSirenLoading(true);
      try {
        const res  = await fetch(`${API_BASE}/api/siren-search?q=${encodeURIComponent(q)}`, {
          credentials: "include",
        });
        const data = await res.json();
        const results: SirenResult[] = data.results ?? [];
        setSirenResults(results);
        setShowSirenDrop(results.length > 0);
      } catch {
        setSirenResults([]);
      } finally {
        setSirenLoading(false);
      }
    }, 350);
  };

  // ── SIREN — sélection entreprise ─────────────────────────────────────────
  const selectCompany = (company: SirenResult) => {
    const siege = company.siege ?? {};
    const siren = company.siren ?? "";
    const tva   = company.numero_tva_intra || computeTva(siren);

    setNewCustomer(p => ({
      ...p,
      name:       company.nom_complet || company.nom_raison_sociale || "",
      siren,
      siret:      siege.siret        || "",
      tvaNumber:  tva,
      address:    siege.adresse      || "",
      city:       siege.commune      || "",
      postalCode: siege.code_postal  || "",
    }));
    setCompanyLocked(true);
    setSirenQuery("");
    setSirenResults([]);
    setShowSirenDrop(false);
  };

  const resetCompany = () => {
    setCompanyLocked(false);
    setNewCustomer(p => ({
      ...p,
      name: "", siren: "", siret: "", tvaNumber: "",
      address: "", city: "", postalCode: "",
    }));
  };

  const closeModal = () => {
    setShowNewModal(false);
    setNewCustomer(EMPTY_CUSTOMER);
    setCompanyLocked(false);
    setSirenQuery("");
    setSirenResults([]);
    setShowSirenDrop(false);
  };

  // ── Créer client ──────────────────────────────────────────────────────────
  const handleCreateCustomer = async () => {
    if (!newCustomer.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/customers`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCustomer),
      });
      if (res.ok) {
        const data = await res.json();
        toast({ title: "Client créé", description: `${newCustomer.name} a été ajouté avec succès.` });
        closeModal();
        refetch();
        const createdId = data?.data?.id ?? data?.id;
        if (createdId) navigate(`/app/customers/${createdId}`);
      } else {
        const errData = await res.json().catch(() => ({}));
        toast({
          title: "Erreur lors de la création",
          description: errData.message ?? "Impossible de créer le client.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Erreur réseau",
        description: "Impossible de contacter le serveur.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // ── Actions ligne ─────────────────────────────────────────────────────────
  const handleNewInvoice = (customerId: string, customerName: string) => {
    navigate(`/app/sales/invoices/new?customerId=${customerId}&customerName=${encodeURIComponent(customerName)}`);
  };

  const handleSendEmail = (email?: string) => {
    if (email) window.open(`mailto:${email}`);
    else toast({ title: "Pas d'email", description: "Ce client n'a pas d'adresse email renseignée.", variant: "destructive" });
  };

  // ── Locked field style ────────────────────────────────────────────────────
  const lockedCls = "bg-secondary/60 text-muted-foreground cursor-default select-none";

  return (
    <motion.div
      className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-full overflow-x-hidden"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-fluid-2xl font-display font-bold">Clients</h1>
          <p className="text-sm text-muted-foreground">Gérez vos clients et suivez leur activité</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={refetch} disabled={loading}>
            {loading
              ? <Loader2 className="h-3.5 w-3.5 sm:mr-1.5 animate-spin" />
              : <RefreshCw className="h-3.5 w-3.5 sm:mr-1.5" />}
            <span className="hidden sm:inline">Actualiser</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-3.5 w-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline">Exporter CSV</span>
          </Button>
          <Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => setShowNewModal(true)}>
            <Plus className="h-3.5 w-3.5 mr-1.5" />Nouveau client
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Clients actifs</span>
            <InfoTooltip title="Clients actifs" description="Clients ayant au moins une facture émise ce trimestre et dont le statut est 'actif'." benefit="Suivre ce chiffre permet d'identifier une croissance ou une perte de clientèle." />
          </div>
          <p className="text-fluid-2xl font-display font-bold">{active}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{customers.length} au total</p>
        </CardContent></Card>

        <Card><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">CA total</span>
            <InfoTooltip title="Chiffre d'affaires total" description="Somme du CA HT généré par l'ensemble des clients filtrés." formula="Σ totalRevenue de chaque client" benefit="Indique la valeur globale de votre portefeuille clients." />
          </div>
          <p className="text-fluid-2xl font-display font-bold">{fmtEUR(totalRevenue)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Tous clients confondus</p>
        </CardContent></Card>

        <Card className="border-destructive/20"><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
            <span className="text-xs text-muted-foreground">Impayés</span>
            <InfoTooltip title="Impayés clients" description="Total des montants dus non encore réglés." formula="Σ (totalDue des factures non payées)" benefit="Un impayé élevé signale un risque de trésorerie." />
          </div>
          <p className="text-2xl font-display font-bold text-destructive">{fmtEUR(totalUnpaid)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{filtered.filter((c: any) => (c.totalUnpaid ?? 0) > 0).length} clients concernés</p>
        </CardContent></Card>

        <Card className="border-warning/20"><CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-3.5 w-3.5 text-warning" />
            <span className="text-xs text-muted-foreground">À risque élevé</span>
            <InfoTooltip title="Clients à risque élevé" description="Clients dont le score de risque est 'élevé'." benefit="Priorisez les relances sur ces clients." />
          </div>
          <p className="text-2xl font-display font-bold text-warning">{atRisk}</p>
          <p className="text-xs text-muted-foreground mt-0.5">clients à surveiller</p>
        </CardContent></Card>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un client..."
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
              {f.label}
            </Button>
          ))}
        </div>
        <div className="flex gap-1">
          {(["all", "low", "medium", "high"] as const).map(r => (
            <Button
              key={r}
              variant={riskFilter === r ? "default" : "outline"}
              size="sm"
              className={`text-xs h-7 ${riskFilter === r ? "gradient-primary text-primary-foreground" : ""}`}
              onClick={() => setRiskFilter(r)}
            >
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
              {filtered.map((customer: any) => {
                // Null-safe : les vrais clients API n'ont pas status/riskScore/contacts
                const sc = statusConfig[customer.status as CustomerStatus] ?? scFallback;
                const rc = riskConfig[customer.riskScore as RiskScore]    ?? rcFallback;
                const contactEmail = customer.contacts?.[0]?.email ?? customer.email ?? "";
                const contactName  = customer.contacts?.[0]?.name  ?? "";
                return (
                  <motion.tr
                    key={customer.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0">
                          {(customer.name ?? "?").substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <Link
                            to={`/app/customers/${customer.id}`}
                            className="font-medium text-foreground hover:text-primary transition-colors"
                          >
                            {customer.name}
                          </Link>
                          <div className="flex gap-1 mt-0.5 flex-wrap">
                            {(customer.tags ?? []).slice(0, 2).map((tag: string) => (
                              <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{tag}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      {contactName && <p className="font-medium">{contactName}</p>}
                      {contactEmail && <p className="text-muted-foreground">{contactEmail}</p>}
                      {!contactName && !contactEmail && <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="p-3 text-right font-semibold">{fmtEUR(customer.totalRevenue ?? 0)}</td>
                    <td className="p-3 text-right hidden sm:table-cell">
                      {(customer.totalUnpaid ?? 0) > 0
                        ? <span className="text-destructive font-medium">{fmtEUR(customer.totalUnpaid)}</span>
                        : <span className="text-success">—</span>}
                    </td>
                    <td className="p-3 text-center hidden lg:table-cell">
                      {customer.averagePaymentDelay != null
                        ? <span className={`font-medium ${customer.averagePaymentDelay > 40 ? "text-destructive" : customer.averagePaymentDelay > 30 ? "text-warning" : "text-success"}`}>
                            {customer.averagePaymentDelay}j
                          </span>
                        : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant="secondary" className={`text-[10px] ${sc.color}`}>{sc.label}</Badge>
                      {customer.urssafSapEnabled && (
                        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-0.5 mt-1">
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
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="text-xs">
                            <DropdownMenuItem onClick={() => handleNewInvoice(customer.id, customer.name)}>
                              <FileText className="h-3 w-3 mr-2" />Nouvelle facture
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSendEmail(contactEmail)}>
                              <Mail className="h-3 w-3 mr-2" />Envoyer un email
                            </DropdownMenuItem>
                            {customer.portalAccess && (
                              <DropdownMenuItem onClick={() => toast({ title: "Portail client", description: "Lien portail copié." })}>
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

      {/* ── Modal Nouveau client ──────────────────────────────────────────────── */}
      <Dialog open={showNewModal} onOpenChange={(open) => { if (!open) closeModal(); }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouveau client</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-1">

            {/* ── Recherche SIREN ──────────────────────────────── */}
            <div className="relative">
              <Label className="text-xs mb-1.5 block text-muted-foreground">
                Rechercher une entreprise
              </Label>
              <div className="relative">
                {sirenLoading
                  ? <Loader2 className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground animate-spin" />
                  : <Search   className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />}
                <Input
                  placeholder="Nom, SIREN… ex : Belvedere Digital"
                  className="pl-8 pr-8 h-8 text-sm"
                  value={sirenQuery}
                  onChange={e => { setSirenQuery(e.target.value); searchSiren(e.target.value); }}
                  onFocus={() => sirenResults.length > 0 && setShowSirenDrop(true)}
                  onBlur={() => setTimeout(() => setShowSirenDrop(false), 200)}
                />
                {sirenQuery && (
                  <button
                    type="button"
                    onClick={() => { setSirenQuery(""); setSirenResults([]); setShowSirenDrop(false); }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Dropdown résultats */}
              {showSirenDrop && sirenResults.length > 0 && (
                <div className="absolute z-50 w-full mt-1 rounded-lg border border-border bg-card shadow-lg overflow-hidden">
                  {sirenResults.slice(0, 6).map((c, i) => (
                    <button
                      key={i}
                      type="button"
                      className="w-full text-left px-3 py-2.5 hover:bg-muted/50 transition-colors border-b border-border/40 last:border-0 flex items-start gap-2.5"
                      onMouseDown={() => selectCompany(c)}
                    >
                      <div className="h-7 w-7 rounded-md gradient-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Building2 className="h-3.5 w-3.5 text-primary-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {c.nom_complet || c.nom_raison_sociale}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          SIREN {c.siren}{c.siege?.commune ? ` · ${c.siege.commune}` : ""}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Raison sociale ────────────────────────────────── */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Nom / Raison sociale *</Label>
                {companyLocked && (
                  <button
                    type="button"
                    onClick={resetCompany}
                    className="text-[10px] text-primary hover:underline transition-colors"
                  >
                    Changer d'entreprise
                  </button>
                )}
              </div>
              <Input
                value={newCustomer.name}
                onChange={e => !companyLocked && setNewCustomer(p => ({ ...p, name: e.target.value }))}
                readOnly={companyLocked}
                placeholder={companyLocked ? "" : "ACME SARL"}
                className={`h-8 text-sm transition-colors ${companyLocked ? lockedCls : ""}`}
              />
            </div>

            {/* ── SIREN / SIRET / TVA ───────────────────────────── */}
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">SIREN</Label>
                <Input
                  value={newCustomer.siren}
                  onChange={e => !companyLocked && setNewCustomer(p => ({ ...p, siren: e.target.value }))}
                  readOnly={companyLocked}
                  placeholder="123456789"
                  className={`h-8 text-sm ${companyLocked ? lockedCls : ""}`}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">SIRET</Label>
                <Input
                  value={newCustomer.siret}
                  onChange={e => !companyLocked && setNewCustomer(p => ({ ...p, siret: e.target.value }))}
                  readOnly={companyLocked}
                  placeholder="12345678900010"
                  className={`h-8 text-sm ${companyLocked ? lockedCls : ""}`}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">N° TVA</Label>
                <Input
                  value={newCustomer.tvaNumber}
                  onChange={e => !companyLocked && setNewCustomer(p => ({ ...p, tvaNumber: e.target.value }))}
                  readOnly={companyLocked}
                  placeholder="FR12345678901"
                  className={`h-8 text-sm ${companyLocked ? lockedCls : ""}`}
                />
              </div>
            </div>

            {/* ── Email / Téléphone ─────────────────────────────── */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Email</Label>
                <Input
                  type="email"
                  value={newCustomer.email}
                  onChange={e => setNewCustomer(p => ({ ...p, email: e.target.value }))}
                  placeholder="contact@client.fr"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Téléphone</Label>
                <Input
                  value={newCustomer.phone}
                  onChange={e => setNewCustomer(p => ({ ...p, phone: e.target.value }))}
                  placeholder="06 12 34 56 78"
                  className="h-8 text-sm"
                />
              </div>
            </div>

            {/* ── Adresse ──────────────────────────────────────── */}
            <div className="space-y-1">
              <Label className="text-xs">Adresse</Label>
              <Input
                value={newCustomer.address}
                onChange={e => !companyLocked && setNewCustomer(p => ({ ...p, address: e.target.value }))}
                readOnly={companyLocked}
                placeholder="12 rue de la Paix"
                className={`h-8 text-sm ${companyLocked ? lockedCls : ""}`}
              />
            </div>

            {/* ── Ville / Code postal ───────────────────────────── */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Ville</Label>
                <Input
                  value={newCustomer.city}
                  onChange={e => !companyLocked && setNewCustomer(p => ({ ...p, city: e.target.value }))}
                  readOnly={companyLocked}
                  placeholder="Paris"
                  className={`h-8 text-sm ${companyLocked ? lockedCls : ""}`}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Code postal</Label>
                <Input
                  value={newCustomer.postalCode}
                  onChange={e => !companyLocked && setNewCustomer(p => ({ ...p, postalCode: e.target.value }))}
                  readOnly={companyLocked}
                  placeholder="75001"
                  className={`h-8 text-sm ${companyLocked ? lockedCls : ""}`}
                />
              </div>
            </div>

            {/* ── Note ─────────────────────────────────────────── */}
            <p className="text-[10px] text-muted-foreground pt-1">
              Entreprise introuvable ?{" "}
              <a
                href="mailto:contact@m7sept.fr"
                className="text-primary hover:underline"
              >
                Contactez notre équipe
              </a>
              {" "}— nous mettrons à jour vos informations manuellement.
            </p>

          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={closeModal}>
              Annuler
            </Button>
            <Button
              size="sm"
              className="gradient-primary text-primary-foreground"
              onClick={handleCreateCustomer}
              disabled={saving || !newCustomer.name.trim()}
            >
              {saving
                ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                : <Plus    className="h-3.5 w-3.5 mr-1.5" />}
              Créer le client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
