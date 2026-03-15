import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Shield, Lock, Key, Eye, Server, Globe, CheckCircle,
  ArrowRight, Zap, RefreshCw, AlertTriangle, Database,
  UserCheck, FileText, Bell,
} from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

const pillars = [
  {
    icon: Lock,
    color: "from-violet-500 to-purple-600",
    title: "Chiffrement bout en bout",
    desc: "AES-256 au repos, TLS 1.3 en transit. Toutes vos données sont chiffrées à chaque étape.",
    items: ["AES-256 au repos", "TLS 1.3 en transit", "Clés de chiffrement rotatives", "Secrets hors du code source"],
  },
  {
    icon: UserCheck,
    color: "from-blue-500 to-cyan-600",
    title: "Authentification forte",
    desc: "Cookies HttpOnly, SameSite Strict, rotation des tokens. Jamais de JWT en localStorage.",
    items: ["Cookies HttpOnly + Secure", "SameSite=Strict", "Refresh token rotation", "MFA disponible"],
  },
  {
    icon: Shield,
    color: "from-emerald-500 to-teal-600",
    title: "Protection applicative",
    desc: "CSP stricte, validation Zod côté client et serveur, rate limiting, anti-bruteforce.",
    items: ["Content Security Policy", "Validation Zod double", "Rate limiting", "Anti-bruteforce login"],
  },
  {
    icon: Globe,
    color: "from-orange-500 to-amber-600",
    title: "Infrastructure sécurisée",
    desc: "Déployé sur Vercel + Cloudflare WAF. DDoS protection, bot filtering, CDN mondial.",
    items: ["Cloudflare WAF", "DDoS protection", "Bot filtering", "Turnstile captcha"],
  },
  {
    icon: Database,
    color: "from-pink-500 to-rose-600",
    title: "Données & Conformité",
    desc: "Hébergement en Europe, sauvegardes PITR, isolation multi-tenant stricte.",
    items: ["Hébergement UE", "Backup PITR", "Isolation multi-tenant", "Conformité RGPD"],
  },
  {
    icon: Eye,
    color: "from-indigo-500 to-violet-600",
    title: "Audit & Traçabilité",
    desc: "Audit logs complets, historique de connexion, alertes d'activité suspecte.",
    items: ["Audit logs complets", "Historique sessions", "Alertes anomalies", "Logs d'accès admin"],
  },
];

const certifications = [
  { label: "RGPD", desc: "Données hébergées en Europe" },
  { label: "TLS 1.3", desc: "Chiffrement en transit" },
  { label: "AES-256", desc: "Chiffrement au repos" },
  { label: "Cloudflare WAF", desc: "Protection périmétrique" },
  { label: "CSP Strict", desc: "Protection XSS" },
  { label: "OWASP Top 10", desc: "Couverture des risques" },
];

const practices = [
  "Aucun secret dans le code source",
  "Variables d'environnement séparées dev/staging/prod",
  "Secret scanning GitHub activé",
  "Dependency scanning automatique",
  "Pre-commit hooks de sécurité",
  "Rotation obligatoire des clés API",
  "Révocation immédiate en cas de fuite",
  "Webhooks signés et vérifiés",
  "URLs signées pour les documents",
  "Idempotency keys sur les paiements",
  "Séparation admin plateforme / admin tenant",
  "Impersonation avec journalisation obligatoire",
];

export default function SecurityPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(250_75%_57%_/_0.07),transparent_65%)]" />
        <motion.div className="container text-center" variants={stagger} initial="hidden" animate="visible">
          <motion.div variants={fadeUp}>
            <Badge variant="secondary" className="mb-6 text-xs px-3 py-1">
              <Shield className="h-3 w-3 mr-1" /> Sécurité
            </Badge>
            <h1 className="text-4xl md:text-6xl font-display font-bold leading-[1.1] mb-6">
              Votre sécurité,<br />
              <span className="text-gradient">notre priorité absolue</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              LE BELVEDERE a été conçu dès le premier jour avec une architecture sécurisée. Chiffrement, isolation, audit, conformité — rien n'est laissé au hasard.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Pillars */}
      <section className="py-20 bg-card">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-display font-bold mb-3">6 piliers de sécurité</h2>
            <p className="text-muted-foreground">Une approche defense-in-depth à chaque couche.</p>
          </div>
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
            variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
          >
            {pillars.map((p, i) => (
              <motion.div key={p.title} variants={fadeUp} transition={{ delay: i * 0.06 }}>
                <Card className="h-full hover:shadow-lg transition-all border-border/50">
                  <CardContent className="p-6">
                    <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center mb-4 shadow-md`}>
                      <p.icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-display font-semibold mb-2">{p.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{p.desc}</p>
                    <div className="space-y-1.5">
                      {p.items.map((item) => (
                        <div key={item} className="flex items-center gap-2 text-xs">
                          <CheckCircle className="h-3 w-3 text-success flex-shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-display font-bold mb-3">Standards respectés</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
            {certifications.map((c) => (
              <div key={c.label} className="text-center p-4 rounded-xl border border-border/50 bg-card hover:border-primary/30 transition-colors">
                <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center mx-auto mb-2">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <p className="font-display font-semibold text-sm">{c.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dev practices */}
      <section className="py-20 bg-card">
        <div className="container max-w-3xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-display font-bold mb-3">Sécurité by design</h2>
            <p className="text-muted-foreground">Nos pratiques de développement sécurisé.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {practices.map((p) => (
              <div key={p} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-background text-sm">
                <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                <span>{p}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Responsible disclosure */}
      <section className="py-20">
        <div className="container max-w-2xl text-center">
          <AlertTriangle className="h-10 w-10 text-warning mx-auto mb-4" />
          <h2 className="text-2xl font-display font-bold mb-3">Divulgation responsable</h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Vous avez découvert une vulnérabilité ? Contactez-nous à{" "}
            <a href="mailto:security@m7app.fr" className="text-primary hover:underline">security@m7app.fr</a>.
            Nous nous engageons à répondre sous 48h et à traiter chaque rapport sérieusement.
          </p>
          <Link to="/contact">
            <Button variant="outline">Nous contacter</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
