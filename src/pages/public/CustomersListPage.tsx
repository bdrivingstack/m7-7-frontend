import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search, Plus, MoreHorizontal, Eye, Mail, FileText,
  TrendingUp, AlertTriangle, Users, Download, Filter,
  ExternalLink, Star,
} from "lucide-react";
import {
  customers, statusConfig, riskConfig, fmtEUR,
  type CustomerStatus, type RiskScore,
} from "@/lib/customers-data";
import { motion } from "framer-motion";

type StatusFilter = "all" | CustomerStatus;

export default function CustomersListPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [riskFilter, setRiskFilter] = useState<"all" | RiskScore>("all");

  const filtered = customers.filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (riskFilter !== "all" && c.riskScore !== riskFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!c.name.toLowerCase().includes(q) && !c.siret?.includes(q) && !c.contacts[0]?.email.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const totalRevenue = customers.reduce((s, c) => s + c.totalRevenue, 0);
  const totalUnpaid = customers.reduce((s, c) => s + c.totalUnpaid, 0);
  const atRisk = customers.filter((c) => c.riskScore === "high").length;
  const active = customers.filter((c) => c.status === "active").length;

  const statusFilters: { value: StatusFilter; label: string }[] = [
    { value: "all", label: `Tous (${customers.length})` },
    { value: "active", label: `Actifs (${customers.filter((c) => c.status === "active").length})` },
    { value: "at_risk", label: `À risque (${customers.filter((c) => c.status === "at_risk").length})` },
    { value: "inactive", label: `Inactifs (${customers.filter((c) => c.status === "inactive").length})` },
  ];

  return (
    <motion.div className="p-6 space-y-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Clients</h1>
          <p className="text-sm text-muted-foreground">Gérez vos clients et suivez leur activité</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="h-3.5 w-3.5 mr-1.5" />Exporter</Button>
          <Button size="sm" className="gradient-primary text-primary-foreground">
            <Plus className="h-3.5 w-3.5 mr-1.5" />Nouveau client
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Clients actifs</span>
            </div>
            <p className="text-2xl font-display font-bold">{active}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{customers.length} au total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">CA total</span>
            </div>
            <p className="text-2xl font-display font-bold">{fmtEUR(totalRevenue)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Tous clients confondus</p>
          </CardContent>
        </Card>
        <Card className="border-destructive/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
              <span className="text-xs text-muted-foreground">Impayés</span>
            </div>
            <p className="text-2xl font-display font-bold text-destructive">{fmtEUR(totalUnpaid)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{customers.filter((c) => c.totalUnpaid > 0).length} clients concernés</p>
          </CardContent>
        </Card>
        <Card className="border-warning/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-3.5 w-3.5 text-warning" />
              <span className="text-xs text-muted-foreground">À risque élevé</span>
            </div>
            <p className="text-2xl font-display font-bold text-warning">{atRisk}</p>
            <p className="text-xs text-muted-foreground mt-0.5">clients à surveiller</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un client..."
            className="pl-9 h-8 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {statusFilters.map((f) => (
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
          {(["all", "low", "medium", "high"] as const).map((r) => (
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
      <Card>
        <CardContent className="p-0">
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
                    <motion.tr
                      key={customer.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0">
                            {customer.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <Link
                              to={`/app/customers/${customer.id}`}
                              className="font-medium text-foreground hover:text-primary transition-colors"
                            >
                              {customer.name}
                            </Link>
                            <div className="flex gap-1 mt-0.5 flex-wrap">
                              {customer.tags.slice(0, 2).map((tag) => (
                                <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                                  {tag}
                                </span>
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
                        {customer.totalUnpaid > 0 ? (
                          <span className="text-destructive font-medium">{fmtEUR(customer.totalUnpaid)}</span>
                        ) : (
                          <span className="text-success">—</span>
                        )}
                      </td>
                      <td className="p-3 text-center hidden lg:table-cell">
                        <span className={`font-medium ${customer.averagePaymentDelay > 40 ? "text-destructive" : customer.averagePaymentDelay > 30 ? "text-warning" : "text-success"}`}>
                          {customer.averagePaymentDelay}j
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant="secondary" className={`text-[10px] ${sc.color}`}>{sc.label}</Badge>
                      </td>
                      <td className="p-3 text-center hidden lg:table-cell">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${rc.bg} ${rc.color}`}>
                          {rc.label}
                        </span>
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
                              <DropdownMenuItem>
                                <FileText className="h-3 w-3 mr-2" />Nouvelle facture
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="h-3 w-3 mr-2" />Envoyer un email
                              </DropdownMenuItem>
                              {customer.portalAccess && (
                                <DropdownMenuItem>
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
        </CardContent>
      </Card>
    </motion.div>
  );
}
