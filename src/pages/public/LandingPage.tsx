import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Zap, ArrowRight, FileText, CreditCard, BarChart3, Bot, Shield,
  CheckCircle, Star, ChevronRight, Users, Receipt, TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

const features = [
  { icon: FileText, title: "Facturation intelligente", desc: "Devis, factures, avoirs, récurrence. Tout en quelques clics." },
  { icon: CreditCard, title: "Paiements intégrés", desc: "Liens de paiement, Stripe, SEPA. Encaissez sans friction." },
  { icon: BarChart3, title: "Pilotage financier", desc: "Dashboard temps réel, KPIs, forecast, trésorerie." },
  { icon: Bot, title: "IA copilote", desc: "Catégorisation auto, relances IA, détection d'anomalies." },
  { icon: Shield, title: "Sécurité renforcée", desc: "Chiffrement, RBAC, audit logs, conformité RGPD." },
  { icon: Receipt, title: "Facture électronique", desc: "Prêt pour 2026. Émission, réception, e-reporting." },
];

const stats = [
  { value: "12k+", label: "Entreprises" },
  { value: "2M+", label: "Factures créées" },
  { value: "99.9%", label: "Uptime" },
  { value: "4.9/5", label: "Satisfaction" },
];

const plans = [
  { name: "Micro", price: "9", desc: "Micro-entrepreneurs", features: ["Devis & factures", "1 utilisateur", "Dashboard standard", "Export comptable"] },
  { name: "Pro", price: "29", desc: "Freelances & TPE", popular: true, features: ["Tout Micro +", "Multi-utilisateurs", "IA relances", "Paiement en ligne", "Rapprochement bancaire"] },
  { name: "Business", price: "79", desc: "PME", features: ["Tout Pro +", "Rôles avancés", "Forecast trésorerie", "E-facture complète", "IA copilote financier"] },
  { name: "Expert", price: "Sur mesure", desc: "Cabinets & API", features: ["Tout Business +", "Multi-clients", "API & webhooks", "SLA dédié", "Marque blanche"] },
];

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(250_75%_57%_/_0.08),transparent_70%)]" />
        <motion.div className="container relative" variants={stagger} initial="hidden" animate="visible">
          <motion.div variants={fadeUp} className="text-center max-w-3xl mx-auto">
            <Badge variant="secondary" className="mb-6 text-xs font-medium px-3 py-1">
              <Zap className="h-3 w-3 mr-1" /> Nouveau : IA copilote financier intégré
            </Badge>
            <h1 className="text-4xl md:text-6xl font-display font-bold leading-[1.1] mb-6">
              La gestion financière{" "}
              <span className="text-gradient">simple et intelligente</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto leading-relaxed">
              Facturation, comptabilité, pilotage, IA. Tout ce qu'il faut pour gérer votre entreprise, sans complexité.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/register">
                <Button size="lg" className="gradient-primary text-primary-foreground shadow-glow text-sm px-8">
                  Démarrer gratuitement <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/features">
                <Button variant="outline" size="lg" className="text-sm px-8">Découvrir</Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-2xl mx-auto">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-display font-bold text-gradient">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-20 bg-card">
        <div className="container">
          <motion.div className="text-center mb-14" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-display font-bold mb-3">Tout pour piloter votre activité</h2>
            <p className="text-muted-foreground">Une suite complète, pensée pour les indépendants et les PME.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="h-full hover:shadow-md transition-shadow border-border/50">
                  <CardContent className="p-6">
                    <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center mb-4">
                      <f.icon className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <h3 className="font-display font-semibold mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-display font-bold mb-3">Des offres adaptées à votre taille</h2>
            <p className="text-muted-foreground">Commencez gratuitement, évoluez sans limite.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {plans.map((p) => (
              <Card key={p.name} className={`relative ${p.popular ? "border-primary shadow-glow" : "border-border/50"}`}>
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="gradient-primary text-primary-foreground text-[10px]">Populaire</Badge>
                  </div>
                )}
                <CardContent className="p-5 pt-6">
                  <h3 className="font-display font-semibold text-lg">{p.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{p.desc}</p>
                  <div className="mb-4">
                    {p.price === "Sur mesure" ? (
                      <span className="text-lg font-display font-bold">Sur mesure</span>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-display font-bold">{p.price}€</span>
                        <span className="text-xs text-muted-foreground">/mois</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 mb-5">
                    {p.features.map((f) => (
                      <div key={f} className="flex items-center gap-2 text-xs">
                        <CheckCircle className="h-3.5 w-3.5 text-success flex-shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                  <Button className={`w-full text-xs ${p.popular ? "gradient-primary text-primary-foreground" : ""}`} variant={p.popular ? "default" : "outline"} size="sm">
                    {p.price === "Sur mesure" ? "Nous contacter" : "Commencer"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-card">
        <div className="container text-center">
          <div className="max-w-xl mx-auto">
            <h2 className="text-3xl font-display font-bold mb-4">Prêt à simplifier votre gestion ?</h2>
            <p className="text-muted-foreground mb-6">Rejoignez des milliers d'entreprises qui font confiance à LE BELVEDERE.</p>
            <Link to="/register">
              <Button size="lg" className="gradient-primary text-primary-foreground shadow-glow">
                Essai gratuit 14 jours <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
