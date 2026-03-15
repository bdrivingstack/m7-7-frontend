import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Search, CheckCircle, AlertTriangle, ExternalLink, Zap,
  RefreshCw, Settings, Plus, ArrowRight, Star, Lock,
  CreditCard, Building2, FileText, BarChart2, MessageSquare,
  ShoppingCart, Truck, Users, Landmark, Globe, Code2,
  Plug, Webhook, Key, Activity,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type IntegrationStatus = "connected" | "available" | "premium" | "coming_soon";
type IntegrationCategory =
  | "all" | "paiement" | "banque" | "comptabilite" | "ecommerce"
  | "crm" | "communication" | "facturation" | "api";

interface Integration {
  id: string;
  name: string;
  description: string;
  logo: string;        // emoji placeholder
  category: IntegrationCategory;
  status: IntegrationStatus;
  popular?: boolean;
  plan?: "pro" | "business" | "expert"; // required plan for premium
  lastSync?: string;
  syncCount?: number;  // nb syncs this month
  docsUrl?: string;
  features: string[];
}

// ─── DATA ─────────────────────────────────────────────────────────────────────

const integrations: Integration[] = [
  // Paiements
  {
    id: "stripe",
    name: "Stripe",
    description: "Acceptez les paiements par carte, lien de paiement et abonnements directement depuis LE BELVEDERE.",
    logo: "💳",
    category: "paiement",
    status: "connected",
    popular: true,
    lastSync: "2024-03-09T09:15:00",
    syncCount: 47,
    features: ["Paiements CB en ligne", "Liens de paiement", "Abonnements récurrents", "Remboursements automatiques"],
  },
  {
    id: "paypal",
    name: "PayPal",
    description: "Offrez à vos clients l'option de payer via PayPal ou PayPal Pay Later.",
    logo: "🅿️",
    category: "paiement",
    status: "available",
    popular: true,
    features: ["Paiement PayPal", "Pay Later", "Protection vendeur"],
  },
  {
    id: "gocardless",
    name: "GoCardless",
    description: "Automatisez les prélèvements SEPA pour vos contrats de maintenance récurrents.",
    logo: "🔄",
    category: "paiement",
    status: "available",
    features: ["Prélèvement SEPA", "Mandats en ligne", "Paiements récurrents"],
  },
  {
    id: "sumup",
    name: "SumUp",
    description: "Acceptez les paiements en personne avec votre terminal SumUp.",
    logo: "📱",
    category: "paiement",
    status: "coming_soon",
    features: ["Terminal CB", "Synchronisation automatique", "Rapports unifiés"],
  },

  // Banques
  {
    id: "qonto",
    name: "Qonto",
    description: "Synchronisation bancaire en temps réel, rapprochement automatique des transactions.",
    logo: "🏦",
    category: "banque",
    status: "connected",
    popular: true,
    lastSync: "2024-03-09T08:00:00",
    syncCount: 312,
    features: ["Sync temps réel", "Rapprochement auto", "Catégorisation IA", "Multi-comptes"],
  },
  {
    id: "bridge",
    name: "Bridge (Bankin)",
    description: "Connectez toutes vos banques françaises via l'agrégateur Bridge API.",
    logo: "🌉",
    category: "banque",
    status: "available",
    popular: true,
    features: ["200+ banques FR", "DSP2 compliant", "Transactions enrichies"],
  },
  {
    id: "boursorama",
    name: "Boursorama",
    description: "Synchronisation directe avec votre compte Boursorama Pro.",
    logo: "💰",
    category: "banque",
    status: "connected",
    lastSync: "2024-03-09T08:00:00",
    syncCount: 89,
    features: ["Sync quotidienne", "Historique 24 mois", "Notifications"],
  },

  // Comptabilité
  {
    id: "pennylane",
    name: "Pennylane",
    description: "Export automatique de vos écritures comptables vers votre comptable Pennylane.",
    logo: "📊",
    category: "comptabilite",
    status: "available",
    popular: true,
    features: ["Export FEC", "Synchronisation comptes", "Validation comptable"],
  },
  {
    id: "dougs",
    name: "Dougs",
    description: "Envoyez automatiquement vos justificatifs à votre expert-comptable Dougs.",
    logo: "📋",
    category: "comptabilite",
    status: "available",
    features: ["Justificatifs auto", "Clôture mensuelle", "Bilan en direct"],
  },
  {
    id: "sage",
    name: "Sage 100",
    description: "Synchronisation bidirectionnelle avec Sage 100 pour les grandes structures.",
    logo: "📈",
    category: "comptabilite",
    status: "premium",
    plan: "business",
    features: ["Sync bidirectionnelle", "Plan comptable custom", "Multi-sociétés"],
  },

  // E-commerce
  {
    id: "shopify",
    name: "Shopify",
    description: "Importez automatiquement les commandes Shopify et créez les factures correspondantes.",
    logo: "🛍️",
    category: "ecommerce",
    status: "available",
    popular: true,
    features: ["Import commandes", "Génération factures auto", "Gestion TVA EU", "Réconciliation paiements"],
  },
  {
    id: "woocommerce",
    name: "WooCommerce",
    description: "Connectez votre boutique WooCommerce pour synchroniser commandes et paiements.",
    logo: "🛒",
    category: "ecommerce",
    status: "available",
    features: ["Import commandes", "Webhook temps réel", "Support multi-devises"],
  },
  {
    id: "prestashop",
    name: "PrestaShop",
    description: "Module officiel PrestaShop pour une facturation automatique.",
    logo: "🏪",
    category: "ecommerce",
    status: "coming_soon",
    features: ["Import commandes", "Factures automatiques", "Avoirs auto"],
  },

  // CRM
  {
    id: "hubspot",
    name: "HubSpot CRM",
    description: "Synchronisez contacts et deals HubSpot. Créez des devis depuis vos opportunités CRM.",
    logo: "🎯",
    category: "crm",
    status: "available",
    popular: true,
    features: ["Sync contacts", "Deals → Devis", "Pipeline unifié", "Email tracking"],
  },
  {
    id: "salesforce",
    name: "Salesforce",
    description: "Intégration enterprise avec Salesforce CRM et facturation unifiée.",
    logo: "☁️",
    category: "crm",
    status: "premium",
    plan: "expert",
    features: ["Sync bidirectionnelle", "Workflows custom", "SSO", "Audit trail"],
  },
  {
    id: "pipedrive",
    name: "Pipedrive",
    description: "Transformez vos deals Pipedrive gagnés en devis en un clic.",
    logo: "🔧",
    category: "crm",
    status: "available",
    features: ["Deals → Devis", "Contacts sync", "Activités liées"],
  },

  // Communication
  {
    id: "slack",
    name: "Slack",
    description: "Recevez des notifications Slack pour les paiements reçus, factures en retard et alertes.",
    logo: "💬",
    category: "communication",
    status: "connected",
    lastSync: "2024-03-09T09:00:00",
    syncCount: 28,
    features: ["Alertes paiements", "Factures en retard", "Résumé hebdo", "Commandes slash"],
  },
  {
    id: "gmail",
    name: "Gmail / Google",
    description: "Envoyez vos factures et relances directement depuis votre adresse Gmail professionnelle.",
    logo: "📧",
    category: "communication",
    status: "available",
    popular: true,
    features: ["Envoi depuis Gmail", "Tracking ouvertures", "Templates HTML", "OAuth2"],
  },
  {
    id: "microsoft",
    name: "Microsoft 365",
    description: "Intégration Outlook pour l'envoi d'emails et OneDrive pour le stockage des PDF.",
    logo: "🪟",
    category: "communication",
    status: "available",
    features: ["Envoi Outlook", "Stockage OneDrive", "Teams notifications"],
  },

  // API
  {
    id: "zapier",
    name: "Zapier",
    description: "Connectez LE BELVEDERE à 6 000+ applications via Zapier sans aucune ligne de code.",
    logo: "⚡",
    category: "api",
    status: "available",
    popular: true,
    features: ["6 000+ apps", "Triggers & Actions", "Sans code", "Multi-steps"],
  },
  {
    id: "make",
    name: "Make (Integromat)",
    description: "Automatisations visuelles avancées avec Make pour les workflows complexes.",
    logo: "🔮",
    category: "api",
    status: "available",
    features: ["Scénarios visuels", "Transformations données", "Planification", "Webhooks"],
  },
  {
    id: "api",
    name: "API REST LE BELVEDERE",
    description: "Accès complet à l'API REST LE BELVEDERE avec authentification OAuth2 et webhooks.",
    logo: "🔌",
    category: "api",
    status: "connected",
    popular: true,
    features: ["REST API complète", "OAuth2", "Webhooks", "SDK JS/Python/PHP", "Rate limit : 1 000 req/min"],
  },
];

const categoryConfig: Record<IntegrationCategory, { label: string; icon: React.ElementType }> = {
  all:            { label: "Toutes",         icon: Plug },
  paiement:       { label: "Paiement",       icon: CreditCard },
  banque:         { label: "Banque",          icon: Landmark },
  comptabilite:   { label: "Comptabilité",   icon: BarChart2 },
  ecommerce:      { label: "E-commerce",     icon: ShoppingCart },
  crm:            { label: "CRM",            icon: Users },
  communication:  { label: "Communication",  icon: MessageSquare },
  api:            { label: "API & Dev",      icon: Code2 },
};

const statusConfig: Record<IntegrationStatus, { label: string; color: string }> = {
  connected:    { label: "Connecté",      color: "bg-success/10 text-success" },
  available:    { label: "Disponible",    color: "bg-muted text-muted-foreground" },
  premium:      { label: "Premium",       color: "bg-amber-500/10 text-amber-500" },
  coming_soon:  { label: "Bientôt",       color: "bg-blue-500/10 text-blue-500" },
};

const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function IntegrationsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<IntegrationCategory>("all");
  const [selected, setSelected] = useState<Integration | null>(null);
  const [enabledMap, setEnabledMap] = useState<Record<string, boolean>>({
    stripe: true, qonto: true, boursorama: true, slack: true, api: true,
  });

  const filtered = integrations.filter((i) => {
    if (category !== "all" && i.category !== category) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!i.name.toLowerCase().includes(q) && !i.description.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const connected = integrations.filter((i) => i.status === "connected");
  const popular = integrations.filter((i) => i.popular && i.status !== "connected").slice(0, 4);

  const toggle = (id: string) =>
    setEnabledMap((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <motion.div className="p-6 space-y-6" variants={container} initial="hidden" animate="show">

      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Intégrations</h1>
          <p className="text-sm text-muted-foreground">Connectez vos outils et automatisez vos flux de données</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Webhook className="h-3.5 w-3.5 mr-1.5" />Webhooks
          </Button>
          <Button variant="outline" size="sm">
            <Key className="h-3.5 w-3.5 mr-1.5" />Clés API
          </Button>
        </div>
      </motion.div>

      {/* Connexions actives */}
      <motion.div variants={item}>
        <div className="flex items-center gap-2 mb-3">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Connexions actives</h2>
          <Badge variant="secondary" className="text-[10px]">{connected.length}</Badge>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {connected.map((intg) => (
            <Card
              key={intg.id}
              className="border-success/20 hover:border-success/40 cursor-pointer transition-all hover:shadow-sm"
              onClick={() => setSelected(intg)}
            >
              <CardContent className="p-3.5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{intg.logo}</span>
                    <div>
                      <p className="font-semibold text-xs">{intg.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-success" />
                        <span className="text-[10px] text-success">Actif</span>
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={enabledMap[intg.id] ?? false}
                    onCheckedChange={() => toggle(intg.id)}
                    className="scale-75 flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                {intg.lastSync && (
                  <p className="text-[10px] text-muted-foreground">
                    Sync {new Date(intg.lastSync).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    {intg.syncCount && ` · ${intg.syncCount} ce mois`}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Add integration */}
          <Card className="border-dashed border-border/60 hover:border-primary/40 cursor-pointer transition-all group"
            onClick={() => setCategory("all")}>
            <CardContent className="p-3.5 flex flex-col items-center justify-center h-full min-h-[80px] text-center">
              <Plus className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors mb-1" />
              <p className="text-xs text-muted-foreground group-hover:text-primary transition-colors">Ajouter</p>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Marketplace */}
      <motion.div variants={item} className="space-y-4">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <Zap className="h-4 w-4 text-muted-foreground" />Marketplace
        </h2>

        {/* Search + category filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une intégration…"
              className="pl-9 h-8 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1 flex-wrap">
            {(Object.keys(categoryConfig) as IntegrationCategory[]).map((cat) => {
              const cc = categoryConfig[cat];
              return (
                <Button
                  key={cat}
                  variant={category === cat ? "default" : "outline"}
                  size="sm"
                  className={`text-xs h-7 gap-1.5 ${category === cat ? "gradient-primary text-primary-foreground" : ""}`}
                  onClick={() => setCategory(cat)}
                >
                  <cc.icon className="h-3 w-3" />
                  {cc.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Grid */}
        <motion.div
          variants={container}
          className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((intg) => {
              const sc = statusConfig[intg.status];
              const isConnected = intg.status === "connected";
              const isPremium = intg.status === "premium";
              const isSoon = intg.status === "coming_soon";

              return (
                <motion.div
                  key={intg.id}
                  variants={item}
                  layout
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card
                    className={`h-full border-border/60 hover:shadow-md transition-all cursor-pointer group
                      ${isConnected ? "border-success/20" : ""}
                      ${isPremium ? "border-amber-500/20" : ""}
                    `}
                    onClick={() => !isSoon && setSelected(intg)}
                  >
                    <CardContent className="p-4 flex flex-col h-full">
                      {/* Top */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{intg.logo}</span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-semibold text-sm">{intg.name}</p>
                              {intg.popular && (
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400 flex-shrink-0" />
                              )}
                            </div>
                            <Badge variant="secondary" className={`text-[9px] mt-0.5 ${sc.color}`}>
                              {sc.label}
                            </Badge>
                          </div>
                        </div>
                        {isPremium && <Lock className="h-4 w-4 text-amber-500 flex-shrink-0" />}
                      </div>

                      {/* Description */}
                      <p className="text-xs text-muted-foreground leading-relaxed flex-1 line-clamp-2 mb-3">
                        {intg.description}
                      </p>

                      {/* Features */}
                      <div className="space-y-1 mb-3">
                        {intg.features.slice(0, 3).map((f) => (
                          <div key={f} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                            <CheckCircle className="h-2.5 w-2.5 text-success flex-shrink-0" />
                            {f}
                          </div>
                        ))}
                      </div>

                      {/* CTA */}
                      <div className="mt-auto">
                        {isConnected ? (
                          <Button variant="outline" size="sm" className="w-full text-xs h-7 text-success border-success/30 hover:bg-success/5">
                            <Settings className="h-3 w-3 mr-1.5" />Configurer
                          </Button>
                        ) : isSoon ? (
                          <Button disabled size="sm" className="w-full text-xs h-7" variant="outline">
                            Bientôt disponible
                          </Button>
                        ) : isPremium ? (
                          <Button size="sm" className="w-full text-xs h-7 bg-amber-500 hover:bg-amber-600 text-white">
                            <Lock className="h-3 w-3 mr-1.5" />Passer en {intg.plan}
                          </Button>
                        ) : (
                          <Button size="sm" className="w-full text-xs h-7 gradient-primary text-primary-foreground group-hover:opacity-90">
                            <Plus className="h-3 w-3 mr-1.5" />Connecter
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Plug className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Aucune intégration trouvée pour "{search}"</p>
          </div>
        )}
      </motion.div>

      {/* API & Webhooks banner */}
      <motion.div variants={item}>
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center shadow-glow flex-shrink-0">
                  <Code2 className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold">API REST & Webhooks LE BELVEDERE</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Accès complet à toutes vos données · OAuth2 · SDK disponibles · 1 000 req/min
                  </p>
                  <div className="flex gap-2 mt-2">
                    {["JavaScript", "Python", "PHP", "Go"].map((lang) => (
                      <span key={lang} className="text-[10px] px-1.5 py-0.5 rounded bg-background border border-border font-mono">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button variant="outline" size="sm" className="text-xs">
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" />Documentation
                </Button>
                <Button size="sm" className="gradient-primary text-primary-foreground text-xs">
                  <Key className="h-3.5 w-3.5 mr-1.5" />Gérer les clés API
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-md">
          {selected && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl">{selected.logo}</span>
                  <div>
                    <DialogTitle className="text-lg">{selected.name}</DialogTitle>
                    <Badge variant="secondary" className={`text-[10px] mt-1 ${statusConfig[selected.status].color}`}>
                      {statusConfig[selected.status].label}
                    </Badge>
                  </div>
                </div>
                <DialogDescription className="text-sm leading-relaxed">
                  {selected.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 pt-2">
                {/* Fonctionnalités */}
                <div>
                  <p className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">Fonctionnalités</p>
                  <div className="space-y-1.5">
                    {selected.features.map((f) => (
                      <div key={f} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-3.5 w-3.5 text-success flex-shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sync info if connected */}
                {selected.status === "connected" && selected.lastSync && (
                  <div className="p-3 rounded-lg bg-success/5 border border-success/20 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="h-2 w-2 rounded-full bg-success" />
                      <span className="font-medium text-success">Connecté et actif</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Dernière synchro : {new Date(selected.lastSync).toLocaleString("fr-FR")}
                    </p>
                    {selected.syncCount && (
                      <p className="text-xs text-muted-foreground">
                        {selected.syncCount} synchronisations ce mois
                      </p>
                    )}
                  </div>
                )}

                {/* Premium gate */}
                {selected.status === "premium" && (
                  <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Lock className="h-3.5 w-3.5 text-amber-500" />
                      <span className="text-xs font-semibold text-amber-500">Disponible en plan {selected.plan}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Passez à un plan supérieur pour débloquer cette intégration.
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  {selected.status === "connected" ? (
                    <>
                      <Button variant="outline" size="sm" className="flex-1 text-xs">
                        <RefreshCw className="h-3.5 w-3.5 mr-1.5" />Forcer la sync
                      </Button>
                      <Button size="sm" className="flex-1 text-xs gradient-primary text-primary-foreground">
                        <Settings className="h-3.5 w-3.5 mr-1.5" />Configurer
                      </Button>
                    </>
                  ) : selected.status === "premium" ? (
                    <Button size="sm" className="w-full text-xs bg-amber-500 hover:bg-amber-600 text-white">
                      Passer en plan {selected.plan} <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                    </Button>
                  ) : selected.status === "available" ? (
                    <>
                      <Button variant="outline" size="sm" className="flex-1 text-xs">
                        <ExternalLink className="h-3.5 w-3.5 mr-1.5" />Docs
                      </Button>
                      <Button size="sm" className="flex-1 text-xs gradient-primary text-primary-foreground">
                        <Zap className="h-3.5 w-3.5 mr-1.5" />Connecter maintenant
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
