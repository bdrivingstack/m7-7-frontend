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
  Plus, Search, MoreHorizontal, Copy, ExternalLink,
  Link2, CheckCircle, Clock, XCircle, TrendingUp,
  CreditCard, Share2, Eye, BarChart2, Trash2,
} from "lucide-react";
import { fmtEUR } from "@/lib/sales-data";
import { motion } from "framer-motion";
import { useDemo } from "@/contexts/DemoContext";
import { toast } from "@/hooks/use-toast";

type LinkStatus = "active" | "paid" | "expired";

interface PaymentLink {
  id: string; title: string; client?: string; amount: number;
  status: LinkStatus; createdAt: string; expiresAt?: string;
  paidAt?: string; url: string; views: number;
  relatedInvoice?: string; description?: string;
}

const statusConfig: Record<LinkStatus, { label: string; color: string; icon: typeof CheckCircle }> = {
  active:  { label: "Actif",   color: "bg-success/10 text-success",           icon: Clock },
  paid:    { label: "Payé",    color: "bg-success/10 text-success",           icon: CheckCircle },
  expired: { label: "Expiré", color: "bg-muted text-muted-foreground",       icon: XCircle },
};

const paymentLinks: PaymentLink[] = [
  { id: "PL1", title: "Facture F-2024-046", client: "TechFlow SAS", amount: 2400, status: "active", createdAt: "2024-03-05", expiresAt: "2024-04-05", url: "https://pay.m7app.fr/pl_abc123", views: 4, relatedInvoice: "F-2024-046", description: "Mission consulting Q1" },
  { id: "PL2", title: "Acompte Acme Corp", client: "Acme Corp", amount: 3500, status: "paid", createdAt: "2024-02-20", paidAt: "2024-02-22", url: "https://pay.m7app.fr/pl_def456", views: 2, relatedInvoice: "F-2024-042" },
  { id: "PL3", title: "Formation React", client: "StartupXYZ", amount: 1200, status: "paid", createdAt: "2024-02-28", paidAt: "2024-03-01", url: "https://pay.m7app.fr/pl_ghi789", views: 3, description: "Formation 2 jours" },
  { id: "PL4", title: "Devis D-2024-030", client: "NewCo", amount: 2400, status: "active", createdAt: "2024-03-04", expiresAt: "2024-04-04", url: "https://pay.m7app.fr/pl_jkl012", views: 1 },
  { id: "PL5", title: "Prestation urgente", client: "Digital Wave", amount: 850, status: "expired", createdAt: "2024-02-01", expiresAt: "2024-03-01", url: "https://pay.m7app.fr/pl_mno345", views: 6 },
];

export default function PaymentLinksPage() {
  const demo   = useDemo();
  const isDemo = !!demo?.isDemo;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | LinkStatus>("all");
  const [copied, setCopied] = useState<string | null>(null);

  // ── Mode réel : aucun backend payment-links pour l'instant ──────────────────
  if (!isDemo) {
    return (
      <motion.div
        className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center"
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      >
        <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
          <Link2 className="h-10 w-10 text-primary/50" />
        </div>
        <h2 className="text-xl font-display font-bold mb-2">Liens de paiement</h2>
        <p className="text-sm text-muted-foreground max-w-md mb-2">
          Aucun lien de paiement configuré.
        </p>
        <p className="text-xs text-muted-foreground max-w-sm mb-6">
          Les liens de paiement Stripe seront disponibles une fois l'intégration Stripe configurée.
          Configurez Stripe dans vos intégrations pour activer cette fonctionnalité.
        </p>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/app/integrations">Configurer Stripe</Link>
          </Button>
          <Button size="sm" className="gradient-primary text-primary-foreground"
            onClick={() => toast({ title: "Bientôt disponible", description: "Configurez d'abord l'intégration Stripe pour créer des liens de paiement." })}>
            <Plus className="h-3.5 w-3.5 mr-1.5" />Créer un lien
          </Button>
        </div>
      </motion.div>
    );
  }

  // ── Mode démo ────────────────────────────────────────────────────────────────
  const filtered = paymentLinks.filter(l => {
    if (statusFilter !== "all" && l.status !== statusFilter) return false;
    if (search && !l.title.toLowerCase().includes(search.toLowerCase()) && !l.client?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalPaid    = paymentLinks.filter(l => l.status === "paid").reduce((s, l) => s + l.amount, 0);
  const totalPending = paymentLinks.filter(l => l.status === "active").reduce((s, l) => s + l.amount, 0);
  const conversionRate = Math.round((paymentLinks.filter(l => l.status === "paid").length / paymentLinks.length) * 100);

  const copyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <motion.div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-full overflow-x-hidden" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-fluid-2xl font-display font-bold">Liens de paiement</h1>
          <p className="text-sm text-muted-foreground">Encaissez en partageant un lien sécurisé</p>
        </div>
        <Button size="sm" className="gradient-primary text-primary-foreground">
          <Plus className="h-3.5 w-3.5 mr-1.5" />Créer un lien
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Link2,     label: "Liens actifs",        value: paymentLinks.filter(l => l.status === "active").length, color: "" },
          { icon: Clock,     label: "En attente",          value: fmtEUR(totalPending), color: "text-warning" },
          { icon: CheckCircle, label: "Encaissé",          value: fmtEUR(totalPaid),   color: "text-success" },
          { icon: BarChart2, label: "Taux de conversion",  value: `${conversionRate}%`, color: "" },
        ].map(({ icon: Icon, label, value, color }) => (
          <Card key={label}><CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2"><Icon className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-xs text-muted-foreground">{label}</span></div>
            <p className={`text-2xl font-display font-bold ${color}`}>{value}</p>
          </CardContent></Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher..." className="pl-9 h-8 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1">
          {(["all", "active", "paid", "expired"] as const).map(s => (
            <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm"
              className={`text-xs h-7 ${statusFilter === s ? "gradient-primary text-primary-foreground" : ""}`}
              onClick={() => setStatusFilter(s)}>
              {s === "all" ? "Tous" : statusConfig[s as LinkStatus].label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(link => {
          const sc = statusConfig[link.status];
          const StatusIcon = sc.icon;
          return (
            <motion.div key={link.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-border/50 hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${link.status === "paid" ? "bg-success/10" : link.status === "active" ? "gradient-primary" : "bg-muted"}`}>
                    <CreditCard className={`h-4 w-4 ${link.status === "paid" ? "text-success" : link.status === "active" ? "text-primary-foreground" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-medium text-sm">{link.title}</p>
                      <Badge variant="secondary" className={`text-[10px] ${sc.color}`}>
                        <StatusIcon className="h-2.5 w-2.5 mr-1" />{sc.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {link.client && <span>{link.client}</span>}
                      <span>Créé le {new Date(link.createdAt).toLocaleDateString("fr-FR")}</span>
                      {link.paidAt && <span className="text-success">Payé le {new Date(link.paidAt).toLocaleDateString("fr-FR")}</span>}
                    </div>
                  </div>
                  <p className="text-lg font-display font-bold flex-shrink-0">{fmtEUR(link.amount)}</p>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {link.status === "active" && (
                      <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => copyLink(link.url, link.id)}>
                        {copied === link.id ? <><CheckCircle className="h-3 w-3 mr-1 text-success" />Copié</> : <><Copy className="h-3 w-3 mr-1" />Copier</>}
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-3.5 w-3.5" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="text-xs">
                        <DropdownMenuItem><Eye className="h-3 w-3 mr-2" />Voir</DropdownMenuItem>
                        <DropdownMenuItem><Copy className="h-3 w-3 mr-2" />Dupliquer</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive"><Trash2 className="h-3 w-3 mr-2" />Supprimer</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Link2 className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Aucun lien trouvé</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
