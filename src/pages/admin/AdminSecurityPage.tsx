import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Shield, ShieldAlert, ShieldCheck, AlertTriangle, Lock,
  Globe, Activity, Zap, Eye, EyeOff, RefreshCw,
  CheckCircle, XCircle, Clock, Wifi, MapPin, User,
  Key, Ban, Cpu, Database, Server, Download, Search,
  TrendingUp, TrendingDown, Info, BarChart2, Layers,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell,
} from "recharts";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const attackTimeline = [
  { time: "00:00", blocked: 12, passed: 0 },
  { time: "04:00", blocked: 8,  passed: 0 },
  { time: "08:00", blocked: 34, passed: 1 },
  { time: "10:00", blocked: 67, passed: 0 },
  { time: "12:00", blocked: 89, passed: 2 },
  { time: "14:00", blocked: 45, passed: 0 },
  { time: "16:00", blocked: 120,passed: 1 },
  { time: "18:00", blocked: 78, passed: 0 },
  { time: "20:00", blocked: 23, passed: 0 },
  { time: "Now",   blocked: 31, passed: 0 },
];

const threatTypes = [
  { name: "Brute force",      count: 284, color: "#ef4444" },
  { name: "Scraping",         count: 156, color: "#f97316" },
  { name: "SQL injection",    count: 43,  color: "#eab308" },
  { name: "XSS tentatifs",    count: 31,  color: "#a855f7" },
  { name: "Rate limit",       count: 198, color: "#3b82f6" },
  { name: "Auth invalide",    count: 412, color: "#6366f1" },
];

const blockedIPs = [
  { ip: "185.234.219.xx", country: "🇷🇺 RU", reason: "Brute force",     hits: 847,  since: "Il y a 2h",  auto: true },
  { ip: "45.155.205.xx",  country: "🇨🇳 CN", reason: "SQL injection",   hits: 43,   since: "Il y a 4h",  auto: true },
  { ip: "103.75.189.xx",  country: "🇻🇳 VN", reason: "Scraping massif", hits: 2341, since: "Hier",        auto: true },
  { ip: "192.168.1.xx",   country: "🇫🇷 FR", reason: "Manuel — test",   hits: 5,    since: "Il y a 3j",  auto: false },
];

const securityChecks = [
  { label: "TLS 1.3 enforced (TLS 1.0/1.1 désactivés)",   ok: true  },
  { label: "HSTS max-age=31536000 includeSubDomains",       ok: true  },
  { label: "Content-Security-Policy configuré",            ok: true  },
  { label: "X-Frame-Options: DENY",                        ok: true  },
  { label: "Referrer-Policy: strict-origin",               ok: true  },
  { label: "Cookies HttpOnly + SameSite=Strict",           ok: true  },
  { label: "Rate limiting API actif (1 000 req/min)",      ok: true  },
  { label: "WAF actif (Cloudflare)",                       ok: true  },
  { label: "DDoS protection niveau 3",                     ok: true  },
  { label: "Secrets non exposés dans les réponses API",    ok: true  },
  { label: "JWT expirant 15 min (refresh token 7j)",       ok: true  },
  { label: "SQL paramétré (pas d'interpolation)",          ok: true  },
  { label: "2FA obligatoire pour les admins",              ok: true  },
  { label: "Rotation des clés de chiffrement AES-256",     ok: false, warn: "Dernière rotation : il y a 94j (rec. < 90j)" },
  { label: "Scan de vulnérabilités (dernière semaine)",    ok: false, warn: "Dernier scan : il y a 12j — planifier" },
];

const recentAlerts = [
  { level: "critical", msg: "Brute force détecté — 847 tentatives sur /auth/login",    time: "Il y a 2h",   ip: "185.234.219.xx", blocked: true },
  { level: "warning",  msg: "Pic de trafic API inhabituel — org tenant #1847",          time: "Il y a 5h",   ip: "—",              blocked: false },
  { level: "info",     msg: "Certificat TLS *.LE BELVEDERE renouvelé automatiquement", time: "Hier",        ip: "—",              blocked: false },
  { level: "warning",  msg: "Tentative d'accès backoffice avec token expiré",          time: "Il y a 2j",   ip: "78.24.55.xx",    blocked: true },
  { level: "info",     msg: "Audit de sécurité Snyk — 0 vulnérabilité critique",       time: "Il y a 3j",   ip: "—",              blocked: false },
];

const alertConfig = {
  critical: { color: "bg-destructive/10 text-destructive border-destructive/30", icon: ShieldAlert },
  warning:  { color: "bg-warning/10 text-warning border-warning/30",             icon: AlertTriangle },
  info:     { color: "bg-primary/10 text-primary border-primary/30",             icon: Info },
};

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function AdminSecurityPage() {
  const [search, setSearch] = useState("");
  const [newIp, setNewIp] = useState("");
  const [autoBlock, setAutoBlock] = useState(true);
  const [geoBlock, setGeoBlock] = useState(false);

  const score = 91;
  const passedChecks = securityChecks.filter((c) => c.ok).length;

  return (
    <motion.div className="p-6 space-y-6" variants={container} initial="hidden" animate="show">

      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-destructive" />
            Centre de sécurité
          </h1>
          <p className="text-sm text-muted-foreground">Surveillance temps réel · Threat intelligence · Hardening</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-xs">
            <Download className="h-3.5 w-3.5 mr-1.5" />Rapport PDF
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />Actualiser
          </Button>
        </div>
      </motion.div>

      {/* Score + KPIs */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Score card */}
        <Card className={`col-span-2 lg:col-span-1 border-2 ${score >= 90 ? "border-success/40 bg-success/5" : score >= 70 ? "border-warning/40 bg-warning/5" : "border-destructive/40 bg-destructive/5"}`}>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
            <ShieldCheck className={`h-8 w-8 mb-2 ${score >= 90 ? "text-success" : "text-warning"}`} />
            <p className="text-3xl font-display font-bold">{score}<span className="text-lg">/100</span></p>
            <p className="text-xs font-medium mt-0.5">Score sécurité</p>
            <p className={`text-[10px] mt-1 ${score >= 90 ? "text-success" : "text-warning"}`}>
              {score >= 90 ? "Excellent" : "Bon"}
            </p>
          </CardContent>
        </Card>

        {[
          { label: "Attaques bloquées (24h)", value: "487",  icon: Ban,      color: "text-destructive", trend: "+12%" },
          { label: "IPs bloquées",            value: "1 243",icon: Globe,    color: "text-warning",     trend: "+3" },
          { label: "Uptime",                  value: "99.97%",icon: Server,  color: "text-success",     trend: "30j" },
          { label: "Checks OK",               value: `${passedChecks}/${securityChecks.length}`,icon: CheckCircle, color: "text-success", trend: "hardening" },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                <span className="text-[10px] text-muted-foreground">{kpi.trend}</span>
              </div>
              <p className="text-2xl font-display font-bold">{kpi.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Charts row */}
      <motion.div variants={item} className="grid lg:grid-cols-3 gap-4">
        {/* Attack timeline */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-destructive" />
              Attaques bloquées aujourd'hui (toutes les 2h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={attackTimeline}>
                <defs>
                  <linearGradient id="attackGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Area type="monotone" dataKey="blocked" stroke="#ef4444" fill="url(#attackGrad)" strokeWidth={2} name="Bloquées" />
                <Area type="monotone" dataKey="passed" stroke="#f97316" fill="none" strokeWidth={1.5} strokeDasharray="4 2" name="Passées" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Threat types */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-warning" />
              Types de menaces (7j)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={threatTypes} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} width={90} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Bar dataKey="count" radius={3} name="Occurrences">
                  {threatTypes.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Security Hardening Checklist */}
      <motion.div variants={item}>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Layers className="h-4 w-4" />Hardening Checklist
                <Badge variant="secondary" className="text-[10px] bg-success/10 text-success">{passedChecks}/{securityChecks.length} OK</Badge>
              </CardTitle>
              <Button variant="outline" size="sm" className="text-xs">
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />Relancer les checks
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-1.5">
              {securityChecks.map((check, i) => (
                <div key={i} className={`flex items-start gap-2 p-2.5 rounded-lg border text-xs ${check.ok ? "border-success/20 bg-success/5" : "border-warning/30 bg-warning/5"}`}>
                  {check.ok
                    ? <CheckCircle className="h-3.5 w-3.5 text-success flex-shrink-0 mt-0.5" />
                    : <AlertTriangle className="h-3.5 w-3.5 text-warning flex-shrink-0 mt-0.5" />}
                  <div>
                    <p className={check.ok ? "text-muted-foreground" : "font-medium"}>{check.label}</p>
                    {check.warn && <p className="text-[10px] text-warning mt-0.5">{check.warn}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Alertes récentes */}
      <motion.div variants={item}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-destructive" />Alertes de sécurité récentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentAlerts.map((alert, i) => {
              const cfg = alertConfig[alert.level as keyof typeof alertConfig];
              const Icon = cfg.icon;
              return (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border text-xs ${cfg.color}`}>
                  <Icon className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{alert.msg}</p>
                    <div className="flex items-center gap-3 mt-1 text-[10px] opacity-80">
                      {alert.ip !== "—" && <span className="flex items-center gap-1"><Wifi className="h-2.5 w-2.5" />{alert.ip}</span>}
                      <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5" />{alert.time}</span>
                    </div>
                  </div>
                  {alert.blocked && (
                    <Badge variant="secondary" className="text-[9px] bg-destructive/20 text-destructive flex-shrink-0">Bloqué</Badge>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>

      {/* IP Blocklist */}
      <motion.div variants={item}>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Ban className="h-4 w-4 text-destructive" />
                Liste de blocage IP
                <Badge variant="secondary" className="text-[10px]">1 243 IPs</Badge>
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Blocage automatique</span>
                <Switch checked={autoBlock} onCheckedChange={setAutoBlock} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Add IP */}
            <div className="flex gap-2">
              <Input
                placeholder="IP ou CIDR à bloquer (ex: 185.234.0.0/16)"
                className="h-8 text-sm font-mono flex-1"
                value={newIp}
                onChange={(e) => setNewIp(e.target.value)}
              />
              <Button size="sm" variant="destructive" className="text-xs flex-shrink-0">
                <Ban className="h-3.5 w-3.5 mr-1.5" />Bloquer
              </Button>
            </div>

            {/* Table */}
            <div className="rounded-lg border border-border/50 overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted/30 border-b">
                    <th className="text-left p-2.5 font-medium text-muted-foreground">Adresse IP</th>
                    <th className="text-center p-2.5 font-medium text-muted-foreground">Pays</th>
                    <th className="text-left p-2.5 font-medium text-muted-foreground">Raison</th>
                    <th className="text-right p-2.5 font-medium text-muted-foreground">Hits</th>
                    <th className="text-right p-2.5 font-medium text-muted-foreground hidden md:table-cell">Depuis</th>
                    <th className="text-center p-2.5 font-medium text-muted-foreground">Type</th>
                    <th className="text-right p-2.5 font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {blockedIPs.map((ip) => (
                    <tr key={ip.ip} className="border-b border-border/30 hover:bg-muted/20">
                      <td className="p-2.5 font-mono font-medium">{ip.ip}</td>
                      <td className="p-2.5 text-center">{ip.country}</td>
                      <td className="p-2.5 text-muted-foreground">{ip.reason}</td>
                      <td className="p-2.5 text-right font-semibold text-destructive">{ip.hits.toLocaleString()}</td>
                      <td className="p-2.5 text-right text-muted-foreground hidden md:table-cell">{ip.since}</td>
                      <td className="p-2.5 text-center">
                        <Badge variant="secondary" className={ip.auto ? "text-[9px] bg-destructive/10 text-destructive" : "text-[9px] bg-muted text-muted-foreground"}>
                          {ip.auto ? "Auto" : "Manuel"}
                        </Badge>
                      </td>
                      <td className="p-2.5 text-right">
                        <Button variant="ghost" size="sm" className="text-[10px] h-6 text-muted-foreground hover:text-success">
                          Débloquer
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Geo-blocking + TLS config */}
      <motion.div variants={item} className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4" />Blocage géographique
              </CardTitle>
              <Switch checked={geoBlock} onCheckedChange={setGeoBlock} />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {geoBlock ? (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Pays bloqués (aucune connexion autorisée) :</p>
                {["🇰🇵 Corée du Nord", "🇮🇷 Iran"].map((country) => (
                  <div key={country} className="flex items-center justify-between p-2 rounded bg-destructive/5 border border-destructive/20">
                    <span className="text-xs">{country}</span>
                    <Button variant="ghost" size="sm" className="text-[10px] h-6 text-muted-foreground">Retirer</Button>
                  </div>
                ))}
                <Input placeholder="Ajouter un pays…" className="h-8 text-sm" />
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Activez pour restreindre l'accès à certains pays.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Lock className="h-4 w-4" />Configuration TLS & Chiffrement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            {[
              { label: "Protocoles autorisés",   value: "TLS 1.2, TLS 1.3",       ok: true },
              { label: "Cipher suites",           value: "ECDHE-RSA-AES256-GCM",   ok: true },
              { label: "Certificat",              value: "*.m7seven.app · Let's Encrypt · ✓ Valide 87j", ok: true },
              { label: "HSTS preload",            value: "Activé — max-age=31536000", ok: true },
              { label: "Chiffrement données",     value: "AES-256-GCM at rest",    ok: true },
              { label: "Chiffrement transit",     value: "TLS 1.3 in-transit",     ok: true },
              { label: "Rotation clés",           value: "Dernière : il y a 94j",  ok: false },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between py-1 border-b border-border/30 last:border-0">
                <span className="text-muted-foreground">{row.label}</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-medium font-mono text-[10px]">{row.value}</span>
                  {row.ok
                    ? <CheckCircle className="h-3 w-3 text-success flex-shrink-0" />
                    : <AlertTriangle className="h-3 w-3 text-warning flex-shrink-0" />}
                </div>
              </div>
            ))}
            <Button size="sm" className="w-full mt-2 text-xs gradient-primary text-primary-foreground">
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />Forcer la rotation des clés
            </Button>
          </CardContent>
        </Card>
      </motion.div>

    </motion.div>
  );
}
