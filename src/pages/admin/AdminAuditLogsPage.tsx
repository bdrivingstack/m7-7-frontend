import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardList, Search, Download, Filter, Lock, AlertTriangle,
  CheckCircle, Trash2, Edit, Eye, Shield, CreditCard,
  Settings, User, Building2, Key, LogIn, LogOut, RefreshCw,
  Globe, Database, Zap, Clock, ChevronDown,
} from "lucide-react";
import { motion } from "framer-motion";

type LogSeverity = "info" | "warning" | "critical";
type LogActor = "admin" | "system" | "user" | "api";

interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  actorType: LogActor;
  actorIp: string;
  action: string;
  resource: string;
  orgId?: string;
  orgName?: string;
  detail: string;
  severity: LogSeverity;
  category: string;
}

const severityConfig: Record<LogSeverity, { label: string; color: string; dot: string }> = {
  info:     { label: "Info",     color: "bg-muted text-muted-foreground",         dot: "bg-muted-foreground" },
  warning:  { label: "Warning",  color: "bg-warning/10 text-warning",             dot: "bg-warning" },
  critical: { label: "Critique", color: "bg-destructive/10 text-destructive",     dot: "bg-destructive" },
};

const actorConfig: Record<LogActor, { color: string; icon: React.ElementType }> = {
  admin:  { color: "bg-destructive/10 text-destructive", icon: Shield },
  system: { color: "bg-blue-500/10 text-blue-500",       icon: Database },
  user:   { color: "bg-muted text-muted-foreground",     icon: User },
  api:    { color: "bg-violet-500/10 text-violet-500",   icon: Key },
};

const logs: AuditEntry[] = [
  { id:"L001", timestamp:"2024-03-09T09:42:15", actor:"super@m7seven.app", actorType:"admin", actorIp:"10.0.0.1", action:"FEATURE_FLAG_UPDATE", resource:"feature:ai_assistant", orgId:"all", orgName:"Globale", detail:"Flag 'ai_assistant' activé pour tous les tenants", severity:"warning", category:"feature-flags" },
  { id:"L002", timestamp:"2024-03-09T09:15:03", actor:"SYSTEM", actorType:"system", actorIp:"internal", action:"CERT_RENEWAL", resource:"cert:*.m7seven.app", detail:"Certificat TLS renouvelé automatiquement (Let's Encrypt)", severity:"info", category:"security" },
  { id:"L003", timestamp:"2024-03-09T08:55:41", actor:"admin@m7seven.app", actorType:"admin", actorIp:"92.184.x.x", action:"ORG_PLAN_UPGRADE", resource:"org:ACME Corp", orgId:"T1847", orgName:"ACME Corp", detail:"Plan Pro → Business (manuel)", severity:"warning", category:"billing" },
  { id:"L004", timestamp:"2024-03-09T08:30:12", actor:"SYSTEM", actorType:"system", actorIp:"internal", action:"IP_AUTOBLOCK", resource:"ip:185.234.219.xx", detail:"847 tentatives brute force — blocage automatique 24h", severity:"critical", category:"security" },
  { id:"L005", timestamp:"2024-03-09T07:12:00", actor:"super@m7seven.app", actorType:"admin", actorIp:"10.0.0.1", action:"ADMIN_LOGIN", resource:"backoffice", detail:"Connexion backoffice via 2FA TOTP", severity:"info", category:"auth" },
  { id:"L006", timestamp:"2024-03-08T18:03:22", actor:"api:prod-key-K2", actorType:"api", actorIp:"51.38.x.x", action:"BULK_EXPORT", resource:"invoices:org:T1203", orgId:"T1203", orgName:"Bernard & Fils", detail:"Export CSV 1 243 factures via API", severity:"warning", category:"data" },
  { id:"L007", timestamp:"2024-03-08T15:45:11", actor:"admin@m7seven.app", actorType:"admin", actorIp:"92.184.x.x", action:"USER_SUSPEND", resource:"user:thomas@dubois.fr", orgId:"T2201", orgName:"Dubois SAS", detail:"Suspension suite à violation des CGU", severity:"critical", category:"users" },
  { id:"L008", timestamp:"2024-03-08T12:00:00", actor:"SYSTEM", actorType:"system", actorIp:"internal", action:"DB_BACKUP", resource:"database:main", detail:"Sauvegarde quotidienne — 47 Go · chiffré AES-256", severity:"info", category:"infrastructure" },
  { id:"L009", timestamp:"2024-03-08T10:22:33", actor:"super@m7seven.app", actorType:"admin", actorIp:"10.0.0.1", action:"PLAN_PRICE_UPDATE", resource:"plan:micro", detail:"Prix Micro 7€ → 9€ (effectif le 01/04/2024)", severity:"critical", category:"billing" },
  { id:"L010", timestamp:"2024-03-07T16:11:05", actor:"SYSTEM", actorType:"system", actorIp:"internal", action:"INCIDENT_AUTO_RESOLVE", resource:"incident:INC-2024-012", detail:"Incident résolu automatiquement — latence DB revenue à la normale", severity:"info", category:"incidents" },
];

const categories = ["all","security","auth","billing","users","data","feature-flags","infrastructure","incidents"];

export default function AdminAuditLogsPage() {
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState<"all"|LogSeverity>("all");
  const [category, setCategory] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = logs.filter((l) => {
    if (severity !== "all" && l.severity !== severity) return false;
    if (category !== "all" && l.category !== category) return false;
    if (search) {
      const q = search.toLowerCase();
      return l.actor.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.resource.toLowerCase().includes(q) ||
        l.detail.toLowerCase().includes(q) ||
        (l.orgName?.toLowerCase().includes(q) ?? false);
    }
    return true;
  });

  return (
    <motion.div className="p-6 space-y-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold">Journaux d'audit</h1>
          <p className="text-sm text-muted-foreground">Traçabilité immuable de toutes les actions plateforme</p>
        </div>
        <Button variant="outline" size="sm" className="text-xs">
          <Download className="h-3.5 w-3.5 mr-1.5" />Exporter (CSV / SIEM)
        </Button>
      </div>

      {/* Immutability notice */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-3.5 flex items-start gap-3">
          <Lock className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-xs space-y-0.5">
            <p className="font-semibold text-primary">Journaux immuables — Compliance & RGPD</p>
            <p className="text-muted-foreground">
              Ces logs sont en <strong>lecture seule</strong>, signés cryptographiquement (HMAC-SHA256) et répliqués
              sur 3 zones AWS. Conservation : <strong>12 mois</strong> (Plan Pro) · <strong>36 mois</strong> (Business)
              · <strong>84 mois</strong> (Expert / RGPD). Aucun admin ne peut les supprimer.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Événements aujourd'hui", value: "1 847", color: "text-foreground" },
          { label: "Warnings (7j)",          value: "23",    color: "text-warning" },
          { label: "Critiques (7j)",         value: "5",     color: "text-destructive" },
        ].map((s) => (
          <Card key={s.label}><CardContent className="p-4">
            <p className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </CardContent></Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Acteur, action, ressource…" className="pl-9 h-8 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1 flex-wrap">
          {(["all", "info", "warning", "critical"] as const).map((s) => (
            <Button key={s} variant={severity === s ? "default" : "outline"} size="sm"
              className={`text-xs h-7 ${severity === s ? "gradient-primary text-primary-foreground" : ""}`}
              onClick={() => setSeverity(s)}>
              {s === "all" ? "Tous niveaux" : severityConfig[s].label}
            </Button>
          ))}
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-8 text-xs border border-input rounded-md px-2.5 bg-background focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c === "all" ? "Toutes catégories" : c}</option>
          ))}
        </select>
      </div>

      {/* Log table */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-center p-3 font-medium text-muted-foreground w-6">⬤</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Horodatage</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Acteur</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Action</th>
                <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Ressource</th>
                <th className="text-left p-3 font-medium text-muted-foreground hidden lg:table-cell">Organisation</th>
                <th className="text-center p-3 font-medium text-muted-foreground">Sévérité</th>
                <th className="w-6 p-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => {
                const sc = severityConfig[log.severity];
                const ac = actorConfig[log.actorType];
                const ActorIcon = ac.icon;
                const isExpanded = expanded === log.id;
                return (
                  <>
                    <tr
                      key={log.id}
                      className={`border-b border-border/40 hover:bg-muted/20 cursor-pointer transition-colors ${isExpanded ? "bg-muted/30" : ""}`}
                      onClick={() => setExpanded(isExpanded ? null : log.id)}
                    >
                      <td className="p-3 text-center">
                        <div className={`h-2 w-2 rounded-full mx-auto ${sc.dot}`} />
                      </td>
                      <td className="p-3 font-mono text-muted-foreground whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString("fr-FR", {
                          day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit"
                        })}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium ${ac.color}`}>
                            <ActorIcon className="h-2.5 w-2.5" />
                            {log.actorType}
                          </span>
                          <span className="font-medium truncate max-w-[120px]">{log.actor}</span>
                        </div>
                      </td>
                      <td className="p-3 font-mono font-medium text-[10px]">{log.action}</td>
                      <td className="p-3 text-muted-foreground hidden md:table-cell truncate max-w-[140px]">{log.resource}</td>
                      <td className="p-3 hidden lg:table-cell">
                        {log.orgName && (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Building2 className="h-3 w-3 flex-shrink-0" />{log.orgName}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant="secondary" className={`text-[9px] ${sc.color}`}>{sc.label}</Badge>
                      </td>
                      <td className="p-3">
                        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${log.id}-detail`} className="border-b border-border/40 bg-muted/20">
                        <td colSpan={8} className="px-6 py-3">
                          <div className="grid sm:grid-cols-4 gap-3 text-xs">
                            <div><p className="text-muted-foreground mb-0.5">ID événement</p><code className="font-mono font-bold">{log.id}</code></div>
                            <div><p className="text-muted-foreground mb-0.5">Adresse IP</p><code className="font-mono">{log.actorIp}</code></div>
                            <div><p className="text-muted-foreground mb-0.5">Catégorie</p><Badge variant="secondary" className="text-[10px]">{log.category}</Badge></div>
                            <div><p className="text-muted-foreground mb-0.5">Timestamp UTC</p><code className="font-mono">{log.timestamp}</code></div>
                            <div className="sm:col-span-4">
                              <p className="text-muted-foreground mb-0.5">Détail</p>
                              <p className="font-medium">{log.detail}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <ClipboardList className="h-10 w-10 mx-auto mb-2 opacity-20" />
              <p className="text-sm">Aucun log correspondant</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
