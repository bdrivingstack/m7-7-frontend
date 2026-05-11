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
  Plus, Search, MoreHorizontal, Copy, Edit, Trash2,
  FileText, Star, Eye, Download, CheckCircle, Layout,
  Mail, FileCheck,
} from "lucide-react";
import { motion } from "framer-motion";

type TemplateCategory = "invoice" | "quote" | "email" | "reminder";
type TemplateType = "document" | "email";

interface DocumentTemplate {
  id: string;
  name: string;
  category: "invoice" | "quote";
  description: string;
  lastUsed: string;
  usageCount: number;
  isDefault: boolean;
  isCustom: boolean;
  preview: string; // color accent
}

interface EmailTemplate {
  id: string;
  name: string;
  category: "email" | "reminder";
  subject: string;
  preview: string;
  lastUsed: string;
  usageCount: number;
  variables: string[];
  isDefault: boolean;
}

const docTemplates: DocumentTemplate[] = [
  { id: "DT1", name: "Facture standard", category: "invoice", description: "Modèle de facture classique avec logo, lignes détaillées et conditions de paiement.", lastUsed: "2024-03-08", usageCount: 47, isDefault: true, isCustom: false, preview: "from-violet-500 to-purple-600" },
  { id: "DT2", name: "Facture minimaliste", category: "invoice", description: "Design épuré et moderne, idéal pour les freelances et consultants.", lastUsed: "2024-03-01", usageCount: 12, isDefault: false, isCustom: true, preview: "from-slate-600 to-slate-800" },
  { id: "DT3", name: "Facture avec acompte", category: "invoice", description: "Inclut la section acompte versé et solde restant dû.", lastUsed: "2024-02-20", usageCount: 8, isDefault: false, isCustom: false, preview: "from-blue-500 to-cyan-600" },
  { id: "DT4", name: "Devis commercial", category: "quote", description: "Devis professionnel avec section présentation, offre et conditions.", lastUsed: "2024-03-06", usageCount: 31, isDefault: true, isCustom: false, preview: "from-emerald-500 to-teal-600" },
  { id: "DT5", name: "Devis avec options", category: "quote", description: "Propose plusieurs offres (base, intermédiaire, premium) au client.", lastUsed: "2024-02-28", usageCount: 9, isDefault: false, isCustom: true, preview: "from-orange-500 to-amber-600" },
  { id: "DT6", name: "Devis mission longue", category: "quote", description: "Format adapté aux missions longues avec planning et jalons.", lastUsed: "2024-02-15", usageCount: 4, isDefault: false, isCustom: true, preview: "from-pink-500 to-rose-600" },
];

const emailTemplates: EmailTemplate[] = [
  {
    id: "ET1", name: "Envoi de facture", category: "email",
    subject: "Facture {{number}} — {{company}}",
    preview: "Bonjour {{contact}}, veuillez trouver ci-joint la facture n°{{number}} d'un montant de {{amount}}...",
    lastUsed: "2024-03-08", usageCount: 47, isDefault: true,
    variables: ["contact", "number", "amount", "dueDate", "company"],
  },
  {
    id: "ET2", name: "Envoi de devis", category: "email",
    subject: "Devis {{number}} — {{subject}}",
    preview: "Bonjour {{contact}}, suite à notre échange, j'ai le plaisir de vous adresser notre proposition...",
    lastUsed: "2024-03-06", usageCount: 31, isDefault: true,
    variables: ["contact", "number", "subject", "amount", "validUntil"],
  },
  {
    id: "ET3", name: "Relance amicale (J+7)", category: "reminder",
    subject: "Rappel — Facture {{number}} arrive à échéance",
    preview: "Bonjour {{contact}}, nous vous rappelons que la facture {{number}} d'un montant de {{amount}} arrive à échéance le {{dueDate}}...",
    lastUsed: "2024-03-07", usageCount: 12, isDefault: true,
    variables: ["contact", "number", "amount", "dueDate"],
  },
  {
    id: "ET4", name: "Relance ferme (J+15)", category: "reminder",
    subject: "⚠️ Facture {{number}} — Paiement en retard",
    preview: "Bonjour {{contact}}, sauf erreur de notre part, nous n'avons pas encore reçu le règlement de la facture {{number}}...",
    lastUsed: "2024-03-02", usageCount: 8, isDefault: true,
    variables: ["contact", "number", "amount", "dueDate", "daysLate"],
  },
  {
    id: "ET5", name: "Mise en demeure (J+30)", category: "reminder",
    subject: "MISE EN DEMEURE — Facture {{number}} impayée",
    preview: "Monsieur/Madame, malgré nos relances, la facture {{number}} d'un montant de {{amount}} TTC reste impayée...",
    lastUsed: "2024-03-05", usageCount: 3, isDefault: true,
    variables: ["contact", "number", "amount", "daysLate", "penaltyRate"],
  },
  {
    id: "ET6", name: "Remerciement paiement", category: "email",
    subject: "Merci pour votre règlement — Facture {{number}}",
    preview: "Bonjour {{contact}}, nous avons bien reçu votre règlement de {{amount}} pour la facture {{number}}...",
    lastUsed: "2024-03-08", usageCount: 42, isDefault: false,
    variables: ["contact", "number", "amount"],
  },
];

const categoryConfig: Record<TemplateCategory, { label: string; color: string }> = {
  invoice: { label: "Facture", color: "bg-blue-500/10 text-blue-500" },
  quote: { label: "Devis", color: "bg-emerald-500/10 text-emerald-500" },
  email: { label: "Email", color: "bg-violet-500/10 text-violet-500" },
  reminder: { label: "Relance", color: "bg-orange-500/10 text-orange-500" },
};

export default function TemplatesPage() {
  const [search, setSearch] = useState("");
  const [docFilter, setDocFilter] = useState<"all" | "invoice" | "quote">("all");

  const filteredDocs = docTemplates.filter((t) => {
    if (docFilter !== "all" && t.category !== docFilter) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const filteredEmails = emailTemplates.filter((t) => {
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <motion.div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-full overflow-x-hidden" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-fluid-2xl font-display font-bold">Modèles</h1>
          <p className="text-sm text-muted-foreground">Documents et emails réutilisables</p>
        </div>
        <Button size="sm" className="gradient-primary text-primary-foreground">
          <Plus className="h-3.5 w-3.5 mr-1.5" />Nouveau modèle
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un modèle..."
          className="pl-9 h-8 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Tabs defaultValue="documents">
        <TabsList>
          <TabsTrigger value="documents" className="gap-2">
            <Layout className="h-3.5 w-3.5" />Documents PDF
          </TabsTrigger>
          <TabsTrigger value="emails" className="gap-2">
            <Mail className="h-3.5 w-3.5" />Emails & Relances
          </TabsTrigger>
        </TabsList>

        {/* Documents */}
        <TabsContent value="documents" className="space-y-4 mt-4">
          <div className="flex gap-1">
            {(["all", "invoice", "quote"] as const).map((f) => (
              <Button
                key={f}
                variant={docFilter === f ? "default" : "outline"}
                size="sm" className={`text-xs h-7 ${docFilter === f ? "gradient-primary text-primary-foreground" : ""}`}
                onClick={() => setDocFilter(f)}
              >
                {f === "all" ? "Tous" : f === "invoice" ? "Factures" : "Devis"}
              </Button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredDocs.map((t) => (
              <motion.div key={t.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-border/50 hover:shadow-md transition-shadow group overflow-hidden">
                  {/* Preview */}
                  <div className={`h-28 bg-gradient-to-br ${t.preview} relative`}>
                    <div className="absolute inset-0 flex items-center justify-center opacity-20">
                      <FileCheck className="h-16 w-16 text-white" />
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1">
                      {t.isDefault && (
                        <Badge className="text-[9px] bg-white/20 text-white border-0 backdrop-blur-sm">
                          <Star className="h-2.5 w-2.5 mr-0.5" />Défaut
                        </Badge>
                      )}
                      {t.isCustom && (
                        <Badge className="text-[9px] bg-white/20 text-white border-0 backdrop-blur-sm">
                          Personnalisé
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-sm">{t.name}</h3>
                        </div>
                        <Badge variant="secondary" className={`text-[10px] ${categoryConfig[t.category].color}`}>
                          {categoryConfig[t.category].label}
                        </Badge>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="text-xs">
                          <DropdownMenuItem><Eye className="h-3 w-3 mr-2" />Aperçu</DropdownMenuItem>
                          <DropdownMenuItem><Edit className="h-3 w-3 mr-2" />Modifier</DropdownMenuItem>
                          <DropdownMenuItem><Copy className="h-3 w-3 mr-2" />Dupliquer</DropdownMenuItem>
                          <DropdownMenuItem><Download className="h-3 w-3 mr-2" />Exporter</DropdownMenuItem>
                          {!t.isDefault && (
                            <DropdownMenuItem><CheckCircle className="h-3 w-3 mr-2" />Définir par défaut</DropdownMenuItem>
                          )}
                          {t.isCustom && (
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-3 w-3 mr-2" />Supprimer
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3 leading-relaxed line-clamp-2">{t.description}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{t.usageCount} utilisations</span>
                      <span>Utilisé le {new Date(t.lastUsed).toLocaleDateString("fr-FR")}</span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 text-xs h-7">
                        <Eye className="h-3 w-3 mr-1" />Aperçu
                      </Button>
                      <Button size="sm" className="flex-1 gradient-primary text-primary-foreground text-xs h-7">
                        Utiliser
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {/* Add new */}
            <Card className="border-dashed border-border/70 hover:border-primary/40 transition-colors cursor-pointer group">
              <CardContent className="flex flex-col items-center justify-center h-full min-h-64 text-center p-6">
                <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Plus className="h-5 w-5 text-primary-foreground" />
                </div>
                <p className="text-sm font-medium">Créer un modèle</p>
                <p className="text-xs text-muted-foreground mt-1">Personnalisez votre design</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Emails */}
        <TabsContent value="emails" className="space-y-3 mt-4">
          <div className="grid gap-3">
            {filteredEmails.map((t) => {
              const cc = categoryConfig[t.category];
              return (
                <motion.div key={t.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="border-border/50 hover:shadow-sm transition-shadow group">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${t.category === "reminder" ? "bg-orange-500/10" : "bg-violet-500/10"}`}>
                          {t.category === "reminder" ? (
                            <Mail className="h-4 w-4 text-orange-500" />
                          ) : (
                            <Mail className="h-4 w-4 text-violet-500" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-sm">{t.name}</h3>
                            <Badge variant="secondary" className={`text-[10px] ${cc.color}`}>{cc.label}</Badge>
                            {t.isDefault && (
                              <Badge variant="secondary" className="text-[10px] bg-muted text-muted-foreground">
                                Défaut
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Objet : {t.subject}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{t.preview}</p>

                          {/* Variables */}
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {t.variables.map((v) => (
                              <span key={v} className="text-[9px] px-1.5 py-0.5 rounded bg-secondary font-mono text-muted-foreground">
                                {`{{${v}}}`}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="text-right hidden sm:block">
                            <p className="text-xs text-muted-foreground">{t.usageCount} envois</p>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="text-xs">
                              <DropdownMenuItem><Eye className="h-3 w-3 mr-2" />Prévisualiser</DropdownMenuItem>
                              <DropdownMenuItem><Edit className="h-3 w-3 mr-2" />Modifier</DropdownMenuItem>
                              <DropdownMenuItem><Copy className="h-3 w-3 mr-2" />Dupliquer</DropdownMenuItem>
                              {!t.isDefault && (
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="h-3 w-3 mr-2" />Supprimer
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}

            {/* Add new email template */}
            <Card className="border-dashed border-border/70 hover:border-primary/40 transition-colors cursor-pointer group">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="h-9 w-9 rounded-lg gradient-primary flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                  <Plus className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">Créer un modèle d'email</p>
                  <p className="text-xs text-muted-foreground">Personnalisez vos communications</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
