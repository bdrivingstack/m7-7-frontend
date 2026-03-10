import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck, CheckCircle, AlertTriangle, XCircle, Download,
  FileText, Globe, Lock, Database, Eye, Clock, RefreshCw,
  Scale, Users, Server, ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";

const frameworks = [
  {
    id: "rgpd", name: "RGPD / GDPR", region: "🇪🇺 UE", score: 94, status: "conforme",
    lastAudit: "2024-02-15", nextAudit: "2024-08-15",
    checks: [
      { ok: true,  label: "Registre des traitements à jour" },
      { ok: true,  label: "Consentement explicite collecté" },
      { ok: true,  label: "Droit à l'oubli implémenté" },
      { ok: true,  label: "Droit à la portabilité (export JSON/CSV)" },
      { ok: true,  label: "DPO désigné" },
      { ok: true,  label: "Notification de violation sous 72h" },
      { ok: false, label: "Privacy by design — revue en cours", warn: "Audit prévu 01/04/2024" },
    ],
  },
  {
    id: "pci", name: "PCI-DSS v4.0", region: "🌍 Global", score: 88, status: "en_cours",
    lastAudit: "2024-01-10", nextAudit: "2024-07-10",
    checks: [
      { ok: true,  label: "Données cartes non stockées (Stripe tokenise)" },
      { ok: true,  label: "Réseau segmenté (DMZ)" },
      { ok: true,  label: "Logs d'accès aux données cartes" },
      { ok: false, label: "Scan ASV trimestriel", warn: "Prochain scan : 01/04/2024" },
      { ok: false, label: "Pen test annuel", warn: "Dernier : il y a 11 mois" },
    ],
  },
  {
    id: "iso27001", name: "ISO 27001", region: "🌍 Global", score: 79, status: "en_cours",
    lastAudit: "2023-11-01", nextAudit: "2024-11-01",
    checks: [
      { ok: true,  label: "SMSI documenté et approuvé" },
      { ok: true,  label: "Analyse des risques réalisée" },
      { ok: false, label: "Formation sécurité équipe", warn: "2/5 membres formés" },
      { ok: false, label: "Revue annuelle direction", warn: "À planifier" },
    ],
  },
  {
    id: "einvoice", name: "E-Facture FR 2026", region: "🇫🇷 France", score: 100, status: "conforme",
    lastAudit: "2024-03-01", nextAudit: "2024-09-01",
    checks: [
      { ok: true, label: "Format Factur-X (EN 16931) implémenté" },
      { ok: true, label: "Connexion Chorus Pro opérationnelle" },
      { ok: true, label: "Piste d'audit fiable (PAF) activée" },
      { ok: true, label: "Archivage 10 ans conforme" },
    ],
  },
];

const statusConfig = {
  conforme:  { label: "Conforme",  color: "bg-success/10 text-success",       icon: CheckCircle },
  en_cours:  { label: "En cours",  color: "bg-warning/10 text-warning",       icon: AlertTriangle },
  non_conf:  { label: "Non conforme", color: "bg-destructive/10 text-destructive", icon: XCircle },
};

const dataMap = [
  { type: "Données personnelles clients",  storage: "AWS eu-west-3 (Paris)", retention: "Durée contrat + 5 ans", encrypted: true, gdpr: true },
  { type: "Factures & documents",          storage: "AWS eu-west-3 (Paris)", retention: "10 ans (légal)",        encrypted: true, gdpr: true },
  { type: "Logs d'audit",                  storage: "AWS eu-west-3 (Paris)", retention: "12 à 84 mois",          encrypted: true, gdpr: true },
  { type: "Données bancaires",             storage: "Stripe (tokenisé)",     retention: "Non stockées",          encrypted: true, gdpr: true },
  { type: "Mots de passe",                 storage: "DB (bcrypt + salt)",    retention: "Durée compte",          encrypted: true, gdpr: true },
  { type: "Données analytiques",           storage: "Interne — anonymisé",   retention: "24 mois",               encrypted: true, gdpr: false },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

export default function AdminCompliancePage() {
  const globalScore = Math.round(frameworks.reduce((acc, f) => acc + f.score, 0) / frameworks.length);

  return (
    <motion.div className="p-6 space-y-6" variants={container} initial="hidden" animate="show">
      <motion.div variants={item} className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold">Conformité & Compliance</h1>
          <p className="text-sm text-muted-foreground">RGPD · PCI-DSS · ISO 27001 · E-Facture</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-xs">
            <Download className="h-3.5 w-3.5 mr-1.5" />Rapport de conformité PDF
          </Button>
        </div>
      </motion.div>

      {/* Global score */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-primary/20 bg-primary/5 col-span-2 lg:col-span-1">
          <CardContent className="p-5 flex flex-col items-center justify-center text-center h-full">
            <Scale className="h-8 w-8 text-primary mb-2" />
            <p className="text-3xl font-display font-bold">{globalScore}<span className="text-lg">/100</span></p>
            <p className="text-xs font-medium mt-0.5">Score global</p>
          </CardContent>
        </Card>
        {[
          { label: "Frameworks suivis", value: frameworks.length.toString(), icon: ShieldCheck, color: "text-primary" },
          { label: "Checks passés",     value: `${frameworks.flatMap(f=>f.checks).filter(c=>c.ok).length}`, icon: CheckCircle, color: "text-success" },
          { label: "Actions requises",  value: `${frameworks.flatMap(f=>f.checks).filter(c=>!c.ok).length}`, icon: AlertTriangle, color: "text-warning" },
        ].map((s) => (
          <Card key={s.label}><CardContent className="p-4">
            <s.icon className={`h-5 w-5 mb-2 ${s.color}`} />
            <p className="text-2xl font-display font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </CardContent></Card>
        ))}
      </motion.div>

      {/* Frameworks */}
      <motion.div variants={item} className="grid md:grid-cols-2 gap-4">
        {frameworks.map((fw) => {
          const sc = statusConfig[fw.status as keyof typeof statusConfig];
          const StatusIcon = sc.icon;
          const passCount = fw.checks.filter((c) => c.ok).length;
          return (
            <Card key={fw.id} className={`border-border/60 ${fw.status === "conforme" ? "border-success/30" : "border-warning/20"}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-sm font-bold">{fw.name}</CardTitle>
                      <span className="text-xs">{fw.region}</span>
                    </div>
                    <Badge variant="secondary" className={`text-[10px] mt-1 inline-flex items-center gap-1 ${sc.color}`}>
                      <StatusIcon className="h-2.5 w-2.5" />{sc.label}
                    </Badge>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-2xl font-display font-bold ${fw.score >= 90 ? "text-success" : fw.score >= 75 ? "text-warning" : "text-destructive"}`}>
                      {fw.score}%
                    </p>
                    <p className="text-[10px] text-muted-foreground">{passCount}/{fw.checks.length} checks</p>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 rounded-full bg-muted mt-2">
                  <div
                    className={`h-1.5 rounded-full transition-all ${fw.score >= 90 ? "bg-success" : fw.score >= 75 ? "bg-warning" : "bg-destructive"}`}
                    style={{ width: `${fw.score}%` }}
                  />
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-1.5">
                {fw.checks.map((check, i) => (
                  <div key={i} className={`flex items-start gap-2 text-xs p-2 rounded ${check.ok ? "" : "bg-warning/5 border border-warning/20 rounded-lg"}`}>
                    {check.ok
                      ? <CheckCircle className="h-3 w-3 text-success flex-shrink-0 mt-0.5" />
                      : <AlertTriangle className="h-3 w-3 text-warning flex-shrink-0 mt-0.5" />}
                    <div>
                      <span className={check.ok ? "text-muted-foreground" : "font-medium"}>{check.label}</span>
                      {(check as any).warn && <p className="text-[10px] text-warning mt-0.5">{(check as any).warn}</p>}
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2 text-[10px] text-muted-foreground border-t border-border/40">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Dernier audit : {fw.lastAudit}</span>
                  <span className="flex items-center gap-1"><RefreshCw className="h-3 w-3" />Prochain : {fw.nextAudit}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Data map / Register */}
      <motion.div variants={item}>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Database className="h-4 w-4" />Registre des traitements (RGPD Art. 30)
              </CardTitle>
              <Button variant="outline" size="sm" className="text-xs">
                <Download className="h-3.5 w-3.5 mr-1.5" />Exporter
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left p-3 font-medium text-muted-foreground">Type de données</th>
                  <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Lieu de stockage</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Rétention</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">Chiffré</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">Base légale</th>
                </tr>
              </thead>
              <tbody>
                {dataMap.map((row) => (
                  <tr key={row.type} className="border-b border-border/40 hover:bg-muted/20">
                    <td className="p-3 font-medium">{row.type}</td>
                    <td className="p-3 text-muted-foreground hidden md:table-cell">{row.storage}</td>
                    <td className="p-3 text-muted-foreground">{row.retention}</td>
                    <td className="p-3 text-center">
                      {row.encrypted ? <CheckCircle className="h-4 w-4 text-success mx-auto" /> : <XCircle className="h-4 w-4 text-destructive mx-auto" />}
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant="secondary" className={`text-[9px] ${row.gdpr ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                        {row.gdpr ? "Contrat" : "Intérêt légitime"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Data residency */}
      <motion.div variants={item}>
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">Résidence des données — 100% Europe</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Toutes les données sont stockées et traitées dans des datacenters AWS <strong>eu-west-3 (Paris)</strong>.
                  Aucune donnée n'est transférée hors UE. Sous-traitants certifiés SCCs (Standard Contractual Clauses).
                </p>
              </div>
              <Button variant="outline" size="sm" className="text-xs flex-shrink-0">
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />DPA
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
