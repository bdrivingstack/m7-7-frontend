import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft, Mail, Phone, MapPin, FileText, Plus,
  Edit, ExternalLink, TrendingUp, Clock, AlertTriangle,
  CheckCircle, Building2, User, Send, Star, MoreHorizontal,
  CreditCard, MessageSquare, Shield, Zap,
} from "lucide-react";
import {
  customers, statusConfig, riskConfig, paymentTermsConfig,
  activityTypeConfig, fmtEUR,
} from "@/lib/customers-data";
import { motion } from "framer-motion";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { useDemo } from "@/contexts/DemoContext";
import { useApi } from "@/hooks/useApi";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function CustomerDetailPage() {
  const { id }  = useParams<{ id: string }>();
  const demo    = useDemo();
  const isDemo  = !!demo?.isDemo;

  // En mode réel, charger depuis l'API ; en démo, utiliser les données mock
  const { data: apiCustomer } = useApi<any>(`/api/customers/${id}`, { skip: isDemo });
  const mockMatch = customers.find((c) => c.id === id);
  const customer  = isDemo ? mockMatch : (apiCustomer?.data ?? apiCustomer ?? mockMatch);

  // ── État URSSAF / Avance immédiate crédit d'impôt ─────────────────────────
  const [urssafEnabled, setUrssafEnabled] = useState<boolean>(
    (customer as any)?.urssafSapEnabled ?? false
  );
  const [urssafSaving, setUrssafSaving] = useState(false);

  const handleUrssafToggle = async (enabled: boolean) => {
    setUrssafEnabled(enabled);
    setUrssafSaving(true);
    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urssafSapEnabled: enabled }),
      });
      if (res.ok) {
        toast({
          title: enabled ? "✅ Avance immédiate activée" : "Avance immédiate désactivée",
          description: enabled
            ? "Les factures de ce client seront automatiquement transmises à l'URSSAF une fois l'API connectée."
            : "Ce client ne bénéficiera plus de l'avance immédiate.",
        });
      } else {
        const errData = await res.json().catch(() => ({}));
        toast({
          title: "Erreur",
          description: errData.message ?? "Impossible de mettre à jour le paramètre URSSAF.",
          variant: "destructive",
        });
        setUrssafEnabled(!enabled); // Revert
      }
    } catch {
      toast({ title: "Erreur réseau", description: "Impossible de contacter le serveur.", variant: "destructive" });
      setUrssafEnabled(!enabled); // Revert
    } finally {
      setUrssafSaving(false);
    }
  };

  if (!customer) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Client introuvable.</p>
        <Link to="/app/customers">
          <Button variant="outline" className="mt-4">Retour aux clients</Button>
        </Link>
      </div>
    );
  }

  const sc = statusConfig[customer.status];
  const rc = riskConfig[customer.riskScore];
  const pt = paymentTermsConfig[customer.paymentTerms];

  return (
    <motion.div className="p-6 space-y-6" variants={container} initial="hidden" animate="show">

      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/app/customers">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
            {customer.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-display font-bold">{customer.name}</h1>
              <Badge variant="secondary" className={`text-[10px] ${sc.color}`}>{sc.label}</Badge>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${rc.bg} ${rc.color}`}>{rc.label}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {customer.type === "company" ? "Entreprise" : "Particulier"} • Client depuis {new Date(customer.createdAt).toLocaleDateString("fr-FR", { year: "numeric", month: "long" })}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Edit className="h-3.5 w-3.5 mr-1.5" />Modifier
          </Button>
          <Button size="sm" className="gradient-primary text-primary-foreground">
            <Plus className="h-3.5 w-3.5 mr-1.5" />Nouvelle facture
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="text-xs">
              <DropdownMenuItem><FileText className="h-3 w-3 mr-2" />Nouveau devis</DropdownMenuItem>
              <DropdownMenuItem><Mail className="h-3 w-3 mr-2" />Envoyer un email</DropdownMenuItem>
              <DropdownMenuItem><ExternalLink className="h-3 w-3 mr-2" />Ouvrir le portail</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      {/* ── Bannière URSSAF Avance immédiate ─────────────────────────────── */}
      <motion.div variants={item}>
        <div className={`rounded-xl border px-4 py-3 flex items-center justify-between gap-4 transition-all ${
          urssafEnabled
            ? "border-emerald-400/40 bg-emerald-50/60 dark:bg-emerald-950/20"
            : "border-border/60 bg-muted/20"
        }`}>
          <div className="flex items-center gap-3">
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
              urssafEnabled ? "bg-emerald-100 dark:bg-emerald-900/40" : "bg-muted"
            }`}>
              <Zap className={`h-4 w-4 ${urssafEnabled ? "text-emerald-600" : "text-muted-foreground"}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">Avance immédiate de crédit d'impôt</p>
                {urssafEnabled && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                    Actif
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {urssafEnabled
                  ? "Les factures seront transmises automatiquement à l'URSSAF (SAP) une fois l'API connectée."
                  : "Activez pour que ce client bénéficie du dispositif URSSAF — Services À la Personne."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {urssafEnabled && (
              <span className="text-[10px] text-muted-foreground hidden sm:block">
                🔗 API URSSAF en attente de connexion
              </span>
            )}
            {/* Switch */}
            <button
              type="button"
              disabled={urssafSaving}
              onClick={() => handleUrssafToggle(!urssafEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 ${
                urssafEnabled ? "bg-emerald-500" : "bg-input"
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                urssafEnabled ? "translate-x-6" : "translate-x-1"
              }`} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">CA total</span>
              <InfoTooltip title="CA total client" description="Chiffre d'affaires cumulé généré par ce client depuis le début de la relation commerciale." formula="Σ montants HT de toutes les factures payées de ce client" benefit="Identifier vos clients les plus rentables pour prioriser votre relation commerciale." />
            </div>
            <p className="text-xl font-display font-bold">{fmtEUR(customer.totalRevenue)}</p>
            <p className="text-xs text-muted-foreground">{customer.totalInvoices} factures</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-3.5 w-3.5 text-success" />
              <span className="text-xs text-muted-foreground">Encaissé</span>
              <InfoTooltip title="Montant encaissé" description="Total des paiements effectivement reçus de ce client." benefit="Différence entre CA total et montant encaissé = impayés en cours." />
            </div>
            <p className="text-xl font-display font-bold text-success">{fmtEUR(customer.totalPaid)}</p>
            <p className="text-xs text-muted-foreground">
              {customer.lastPaymentDate ? new Date(customer.lastPaymentDate).toLocaleDateString("fr-FR") : "—"}
            </p>
          </CardContent>
        </Card>
        <Card className={customer.totalUnpaid > 0 ? "border-destructive/30" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className={`h-3.5 w-3.5 ${customer.totalUnpaid > 0 ? "text-destructive" : "text-muted-foreground"}`} />
              <span className="text-xs text-muted-foreground">Impayés</span>
              <InfoTooltip title="Impayés en cours" description="Montant total des factures envoyées non encore réglées par ce client." benefit="Un impayé élevé par rapport au CA total peut indiquer un risque de crédit à surveiller." />
            </div>
            <p className={`text-xl font-display font-bold ${customer.totalUnpaid > 0 ? "text-destructive" : "text-muted-foreground"}`}>
              {customer.totalUnpaid > 0 ? fmtEUR(customer.totalUnpaid) : "—"}
            </p>
            <p className="text-xs text-muted-foreground">{customer.totalUnpaid > 0 ? "À relancer" : "Aucun impayé"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Délai moyen</span>
              <InfoTooltip title="Délai moyen de paiement" description="Nombre de jours moyen entre l'émission d'une facture et son règlement par ce client." formula="Moyenne de (date paiement − date facture) sur toutes les factures payées" benefit="Un délai > 30j peut signaler un client en difficulté ou de mauvaise foi. En dessous, c'est excellent." />
            </div>
            <p className={`text-xl font-display font-bold ${customer.averagePaymentDelay > 40 ? "text-destructive" : customer.averagePaymentDelay > 30 ? "text-warning" : "text-success"}`}>
              {customer.averagePaymentDelay}j
            </p>
            <p className="text-xs text-muted-foreground">de paiement</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={item}>
        <Tabs defaultValue="overview">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Vue générale</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="activity">Activité</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Infos entreprise */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Building2 className="h-4 w-4" />Informations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {customer.siret && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">SIRET</span>
                      <span className="font-mono">{customer.siret}</span>
                    </div>
                  )}
                  {customer.vatNumber && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">N° TVA</span>
                      <span className="font-mono">{customer.vatNumber}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Conditions paiement</span>
                    <span className="font-medium">{pt}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Score de risque</span>
                    <span className={`font-medium text-xs px-2 py-0.5 rounded-full ${rc.bg} ${rc.color}`}>{rc.label}</span>
                  </div>
                  <div className="pt-2 border-t border-border/50">
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <p>{customer.billingAddress.line1}</p>
                        {customer.billingAddress.line2 && <p>{customer.billingAddress.line2}</p>}
                        <p>{customer.billingAddress.zip} {customer.billingAddress.city}</p>
                        <p className="text-muted-foreground">{customer.billingAddress.country}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact principal */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />Contact principal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {customer.contacts.filter((c) => c.isPrimary).map((contact) => (
                    <div key={contact.id}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center text-sm font-medium">
                          {contact.name.split(" ").map((n) => n[0]).join("").substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{contact.name}</p>
                          <p className="text-xs text-muted-foreground">{contact.role}</p>
                        </div>
                        <Star className="h-3.5 w-3.5 text-warning ml-auto" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          <a href={`mailto:${contact.email}`} className="text-primary hover:underline">{contact.email}</a>
                        </div>
                        {contact.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                            <a href={`tel:${contact.phone}`} className="hover:text-primary">{contact.phone}</a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Portail client */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4" />Portail client
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {customer.portalAccess ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span className="text-sm font-medium text-success">Accès activé</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{customer.portalEmail}</p>
                      <Button variant="outline" size="sm" className="w-full">
                        <ExternalLink className="h-3.5 w-3.5 mr-1.5" />Ouvrir le portail
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">Le portail client n'est pas activé pour ce client.</p>
                      <Button size="sm" className="w-full gradient-primary text-primary-foreground">
                        Activer le portail
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tags */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {customer.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                    <Button variant="outline" size="sm" className="h-6 text-xs">
                      <Plus className="h-3 w-3 mr-1" />Ajouter
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Documents */}
          <TabsContent value="documents" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">{customer.totalInvoices} documents au total</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <FileText className="h-3.5 w-3.5 mr-1.5" />Nouveau devis
                </Button>
                <Button size="sm" className="gradient-primary text-primary-foreground">
                  <Plus className="h-3.5 w-3.5 mr-1.5" />Nouvelle facture
                </Button>
              </div>
            </div>
            <Card>
              <CardContent className="p-0">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left p-3 font-medium text-muted-foreground">Référence</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Type</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Montant</th>
                      <th className="text-center p-3 font-medium text-muted-foreground">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customer.activity
                      .filter((a) => a.ref && a.amount)
                      .map((a) => (
                        <tr key={a.id} className="border-b border-border/50 hover:bg-muted/20">
                          <td className="p-3">
                            <span className="font-mono text-primary hover:underline cursor-pointer">{a.ref}</span>
                          </td>
                          <td className="p-3 text-muted-foreground">
                            {a.ref?.startsWith("F") ? "Facture" : "Devis"}
                          </td>
                          <td className="p-3 text-muted-foreground">
                            {new Date(a.date).toLocaleDateString("fr-FR")}
                          </td>
                          <td className="p-3 text-right font-semibold">{fmtEUR(a.amount!)}</td>
                          <td className="p-3 text-center">
                            <Badge variant="secondary" className={`text-[10px] ${activityTypeConfig[a.type].color}`}>
                              {activityTypeConfig[a.type].label}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {customer.activity.filter((a) => a.ref).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-6 w-6 mx-auto mb-2 opacity-30" />
                    <p>Aucun document pour ce client</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contacts */}
          <TabsContent value="contacts" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">{customer.contacts.length} contact(s)</p>
              <Button size="sm" className="gradient-primary text-primary-foreground">
                <Plus className="h-3.5 w-3.5 mr-1.5" />Ajouter un contact
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {customer.contacts.map((contact) => (
                <Card key={contact.id} className={contact.isPrimary ? "border-primary/30" : "border-border/50"}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-sm font-medium flex-shrink-0">
                        {contact.name.split(" ").map((n) => n[0]).join("").substring(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{contact.name}</p>
                          {contact.isPrimary && <Star className="h-3.5 w-3.5 text-warning flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground">{contact.role}</p>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-2 text-xs">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <a href={`mailto:${contact.email}`} className="text-primary hover:underline truncate">{contact.email}</a>
                          </div>
                          {contact.phone && (
                            <div className="flex items-center gap-2 text-xs">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span>{contact.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Mail className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Activity */}
          <TabsContent value="activity" className="space-y-3">
            {customer.activity.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-6 w-6 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Aucune activité enregistrée</p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
                <div className="space-y-4">
                  {customer.activity.map((act) => {
                    const cfg = activityTypeConfig[act.type];
                    return (
                      <div key={act.id} className="flex gap-4 pl-12 relative">
                        <div className="absolute left-3 top-1 h-4 w-4 rounded-full bg-card border-2 border-border flex items-center justify-center text-[10px]">
                          {cfg.icon}
                        </div>
                        <div className="flex-1 pb-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium">{act.title}</p>
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                              {new Date(act.date).toLocaleDateString("fr-FR")}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{act.description}</p>
                          {act.amount && (
                            <p className="text-xs font-semibold mt-1">{fmtEUR(act.amount)}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Notes */}
          <TabsContent value="notes" className="space-y-4">
            <div className="flex justify-end">
              <Button size="sm" className="gradient-primary text-primary-foreground">
                <Plus className="h-3.5 w-3.5 mr-1.5" />Ajouter une note
              </Button>
            </div>
            {customer.notes.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="h-6 w-6 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Aucune note pour ce client</p>
              </div>
            ) : (
              customer.notes.map((note) => (
                <Card key={note.id} className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-[10px] font-bold">
                          {note.by[0]}
                        </div>
                        <span className="text-xs font-medium">{note.by}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(note.date).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed">{note.text}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
