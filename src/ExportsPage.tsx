import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Download, FileSpreadsheet, FileText, Database, CheckCircle,
  Clock, Archive, Filter, Calendar, Building2, Package,
  Zap, History,
} from "lucide-react";
import { motion } from "framer-motion";

type ExportStatus = "ready" | "processing" | "done";
type ExportFormat = "csv" | "xlsx" | "pdf" | "fec" | "json";

interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  format: ExportFormat;
  icon: typeof FileText;
  category: "accounting" | "fiscal" | "reporting" | "integration";
  popular?: boolean;
}

interface ExportHistory {
  id: string;
  name: string;
  format: ExportFormat;
  period: string;
  createdAt: string;
  size: string;
  status: ExportStatus;
}

const formatConfig: Record<ExportFormat, { label: string; color: string }> = {
  csv: { label: "CSV", color: "bg-emerald-500/10 text-emerald-600" },
  xlsx: { label: "Excel", color: "bg-green-500/10 text-green-600" },
  pdf: { label: "PDF", color: "bg-red-500/10 text-red-500" },
  fec: { label: "FEC", color: "bg-blue-500/10 text-blue-500" },
  json: { label: "JSON", color: "bg-violet-500/10 text-violet-500" },
};

const exportTemplates: ExportTemplate[] = [
  {
    id: "E1", name: "Fichier des Écritures Comptables (FEC)",
    description: "Export réglementaire obligatoire pour le contrôle fiscal. Format DGFiP conforme.",
    format: "fec", icon: Database, category: "fiscal", popular: true,
  },
  {
    id: "E2", name: "Livre des recettes",
    description: "Ensemble des encaissements de la période avec catégories et références.",
    format: "xlsx", icon: FileSpreadsheet, category: "accounting", popular: true,
  },
  {
    id: "E3", name: "Journal des achats",
    description: "Toutes les dépenses et achats avec TVA déductible.",
    format: "xlsx", icon: FileSpreadsheet, category: "accounting",
  },
  {
    id: "E4", name: "Grand livre général",
    description: "Toutes les écritures comptables classées par compte.",
    format: "xlsx", icon: FileSpreadsheet, category: "accounting",
  },
  {
    id: "E5", name: "Déclaration de TVA (CA3)",
    description: "Export pré-rempli pour la déclaration TVA trimestrielle.",
    format: "pdf", icon: FileText, category: "fiscal", popular: true,
  },
  {
    id: "E6", name: "Tableau de bord financier",
    description: "KPIs, CA, marges, évolutions — rapport de gestion mensuel.",
    format: "pdf", icon: FileText, category: "reporting",
  },
  {
    id: "E7", name: "Transactions bancaires",
    description: "Toutes les transactions rapprochées avec leurs catégories.",
    format: "csv", icon: FileText, category: "accounting",
  },
  {
    id: "E8", name: "Export Sage / EBP",
    description: "Format compatible avec les logiciels de comptabilité Sage et EBP.",
    format: "csv", icon: Database, category: "integration",
  },
  {
    id: "E9", name: "Export QuickBooks",
    description: "Format IIF pour importation directe dans QuickBooks.",
    format: "csv", icon: Database, category: "integration",
  },
  {
    id: "E10", name: "Bilan simplifié",
    description: "Synthèse annuelle : actif, passif, résultat. Format comptable simplifié.",
    format: "pdf", icon: FileText, category: "fiscal",
  },
  {
    id: "E11", name: "Détail cotisations sociales",
    description: "Récapitulatif annuel URSSAF, retraite et prévoyance par période.",
    format: "xlsx", icon: FileSpreadsheet, category: "fiscal",
  },
  {
    id: "E12", name: "Données brutes JSON",
    description: "Export complet des données pour intégration API personnalisée.",
    format: "json", icon: Database, category: "integration",
  },
];

const exportHistory: ExportHistory[] = [
  { id: "H1", name: "FEC — Exercice 2023", format: "fec", period: "01/01/2023 – 31/12/2023", createdAt: "2024-02-15T10:30:00", size: "2.4 Mo", status: "done" },
  { id: "H2", name: "Livre des recettes — T1 2024", format: "xlsx", period: "01/01/2024 – 31/03/2024", createdAt: "2024-03-08T14:22:00", size: "84 Ko", status: "done" },
  { id: "H3", name: "Déclaration TVA CA3 — T4 2023", format: "pdf", period: "01/10/2023 – 31/12/2023", createdAt: "2024-01-14T09:15:00", size: "128 Ko", status: "done" },
  { id: "H4", name: "Export Sage — Déc 2023", format: "csv", period: "01/12/2023 – 31/12/2023", createdAt: "2024-01-05T16:40:00", size: "24 Ko", status: "done" },
  { id: "H5", name: "Bilan simplifié 2023", format: "pdf", period: "Exercice 2023", createdAt: "2024-02-01T11:00:00", size: "210 Ko", status: "done" },
];

const categoryConfig = {
  accounting: { label: "Comptabilité", color: "bg-blue-500/10 text-blue-500" },
  fiscal: { label: "Fiscal", color: "bg-orange-500/10 text-orange-500" },
  reporting: { label: "Reporting", color: "bg-violet-500/10 text-violet-500" },
  integration: { label: "Intégration", color: "bg-emerald-500/10 text-emerald-600" },
};

const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

export default function ExportsPage() {
  const [catFilter, setCatFilter] = useState<"all" | "accounting" | "fiscal" | "reporting" | "integration">("all");
  const [periodStart, setPeriodStart] = useState("2024-01-01");
  const [periodEnd, setPeriodEnd] = useState("2024-03-31");
  const [generating, setGenerating] = useState<string | null>(null);

  const filtered = exportTemplates.filter((t) => {
    if (catFilter !== "all" && t.category !== catFilter) return false;
    return true;
  });

  const handleGenerate = (id: string) => {
    setGenerating(id);
    setTimeout(() => setGenerating(null), 2000);
  };

  return (
    <motion.div className="p-6 space-y-6" variants={container} initial="hidden" animate="show">

      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold">Exports comptables</h1>
          <p className="text-sm text-muted-foreground">Exportez vos données dans les formats réglementaires et métiers</p>
        </div>
        <Button variant="outline" size="sm">
          <History className="h-3.5 w-3.5 mr-1.5" />Historique
        </Button>
      </motion.div>

      {/* Period selector */}
      <motion.div variants={item}>
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary flex-shrink-0" />
                <p className="text-sm font-medium">Période par défaut</p>
              </div>
              <div className="flex gap-3 flex-wrap flex-1">
                <div>
                  <Label className="text-xs">Du</Label>
                  <Input
                    type="date" className="mt-1 h-8 text-sm w-40"
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs">Au</Label>
                  <Input
                    type="date" className="mt-1 h-8 text-sm w-40"
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs">Raccourcis</Label>
                  <div className="flex gap-1 mt-1">
                    {["T1 2024", "T4 2023", "Année 2023"].map((shortcut) => (
                      <Button key={shortcut} variant="outline" size="sm" className="text-xs h-8">
                        {shortcut}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Popular */}
      <motion.div variants={item}>
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-4 w-4 text-warning" />
          <h2 className="text-sm font-semibold">Export rapides</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {exportTemplates.filter((t) => t.popular).map((t) => {
            const fc = formatConfig[t.format];
            const cc = categoryConfig[t.category];
            const Icon = t.icon;
            const isGenerating = generating === t.id;
            return (
              <Card key={t.id} className="border-border/50 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="h-9 w-9 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                      <Icon className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm leading-tight">{t.name}</p>
                      <div className="flex gap-1 mt-1">
                        <Badge variant="secondary" className={`text-[9px] ${fc.color}`}>{fc.label}</Badge>
                        <Badge variant="secondary" className={`text-[9px] ${cc.color}`}>{cc.label}</Badge>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{t.description}</p>
                  <Button
                    className="w-full gradient-primary text-primary-foreground text-xs" size="sm"
                    onClick={() => handleGenerate(t.id)}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <><Clock className="h-3 w-3 mr-1.5 animate-spin" />Génération...</>
                    ) : (
                      <><Download className="h-3 w-3 mr-1.5" />Générer l'export</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </motion.div>

      <Separator />

      {/* All exports */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Tous les exports</h2>
          <div className="flex gap-1">
            {(["all", "accounting", "fiscal", "reporting", "integration"] as const).map((c) => (
              <Button
                key={c}
                variant={catFilter === c ? "default" : "outline"}
                size="sm" className={`text-xs h-7 ${catFilter === c ? "gradient-primary text-primary-foreground" : ""}`}
                onClick={() => setCatFilter(c)}
              >
                {c === "all" ? "Tous" : categoryConfig[c].label}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((t) => {
            const fc = formatConfig[t.format];
            const cc = categoryConfig[t.category];
            const Icon = t.icon;
            const isGenerating = generating === t.id;
            return (
              <Card key={t.id} className="border-border/50 hover:shadow-sm transition-shadow group">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 group-hover:gradient-primary transition-all">
                      <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm leading-tight mb-1">{t.name}</p>
                      <div className="flex gap-1 mb-2">
                        <Badge variant="secondary" className={`text-[9px] ${fc.color}`}>{fc.label}</Badge>
                        <Badge variant="secondary" className={`text-[9px] ${cc.color}`}>{cc.label}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{t.description}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline" className="w-full text-xs mt-3 h-7" size="sm"
                    onClick={() => handleGenerate(t.id)}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <><Clock className="h-3 w-3 mr-1.5 animate-spin" />Génération...</>
                    ) : (
                      <><Download className="h-3 w-3 mr-1.5" />Télécharger</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </motion.div>

      {/* History */}
      <motion.div variants={item}>
        <div className="flex items-center gap-2 mb-3">
          <Archive className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Exports récents</h2>
        </div>
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left p-3 font-medium text-muted-foreground">Nom</th>
                  <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Période</th>
                  <th className="text-left p-3 font-medium text-muted-foreground hidden sm:table-cell">Généré le</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">Format</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Taille</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {exportHistory.map((h) => {
                  const fc = formatConfig[h.format];
                  return (
                    <tr key={h.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3.5 w-3.5 text-success flex-shrink-0" />
                          <span className="font-medium">{h.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground hidden md:table-cell">{h.period}</td>
                      <td className="p-3 text-muted-foreground hidden sm:table-cell">
                        {new Date(h.createdAt).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant="secondary" className={`text-[10px] ${fc.color}`}>{fc.label}</Badge>
                      </td>
                      <td className="p-3 text-right text-muted-foreground">{h.size}</td>
                      <td className="p-3 text-right">
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
