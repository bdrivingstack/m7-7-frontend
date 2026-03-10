import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, ArrowRight, Zap, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

const plans = [
  {
    name: "Micro",
    monthlyPrice: 9,
    yearlyPrice: 7,
    desc: "Micro-entrepreneurs",
    color: "from-slate-500 to-slate-600",
    features: [
      { label: "Devis & factures illimités", ok: true },
      { label: "1 utilisateur", ok: true },
      { label: "Dashboard standard", ok: true },
      { label: "Export comptable basique", ok: true },
      { label: "Facture électronique (réception)", ok: true },
      { label: "IA basique", ok: true },
      { label: "Multi-utilisateurs", ok: false },
      { label: "Paiement en ligne", ok: false },
      { label: "Rapprochement bancaire", ok: false },
      { label: "Facture électronique (émission)", ok: false },
    ],
  },
  {
    name: "Pro",
    monthlyPrice: 29,
    yearlyPrice: 23,
    desc: "Freelances & TPE",
    popular: true,
    color: "from-violet-500 to-purple-600",
    features: [
      { label: "Tout Micro inclus", ok: true },
      { label: "5 utilisateurs", ok: true },
      { label: "Dashboard avancé", ok: true },
      { label: "Paiement en ligne (Stripe)", ok: true },
      { label: "Facturation récurrente", ok: true },
      { label: "Rapprochement bancaire", ok: true },
      { label: "IA relances + suggestions", ok: true },
      { label: "Productivité (kanban, temps)", ok: true },
      { label: "Multi-entités", ok: false },
      { label: "Facture électronique (émission)", ok: false },
    ],
  },
  {
    name: "Business",
    monthlyPrice: 79,
    yearlyPrice: 63,
    desc: "PME",
    color: "from-blue-500 to-cyan-600",
    features: [
      { label: "Tout Pro inclus", ok: true },
      { label: "Utilisateurs illimités", ok: true },
      { label: "Rôles avancés", ok: true },
      { label: "Multi-entités", ok: true },
      { label: "Facture électronique complète", ok: true },
      { label: "Forecast trésorerie IA", ok: true },
      { label: "Audit logs complets", ok: true },
      { label: "Intégrations avancées", ok: true },
      { label: "IA copilote financier", ok: true },
      { label: "SLA 99.9%", ok: true },
    ],
  },
  {
    name: "Expert",
    monthlyPrice: null,
    yearlyPrice: null,
    desc: "Cabinets & API",
    color: "from-emerald-500 to-teal-600",
    features: [
      { label: "Tout Business inclus", ok: true },
      { label: "Gestion multi-clients", ok: true },
      { label: "Accès cabinet", ok: true },
      { label: "API & webhooks", ok: true },
      { label: "Marque blanche partielle", ok: true },
      { label: "Permissions granulaires", ok: true },
      { label: "SLA dédié", ok: true },
      { label: "Import massif", ok: true },
      { label: "Support prioritaire", ok: true },
      { label: "Onboarding dédié", ok: true },
    ],
  },
];

const faqs = [
  { q: "Y a-t-il un engagement ?", a: "Non. Vous pouvez annuler à tout moment. En annulant, vous gardez l'accès jusqu'à la fin de la période payée." },
  { q: "Puis-je changer de plan ?", a: "Oui, vous pouvez upgrader ou downgrader à tout moment. Le changement est proratisé automatiquement." },
  { q: "Les données sont-elles sécurisées ?", a: "Absolument. Chiffrement AES-256 au repos, TLS en transit, hébergement en Europe, conformité RGPD. Consultez notre page Sécurité." },
  { q: "Qu'est-ce que la facturation électronique ?", a: "La réforme e-facture 2026 rend obligatoire l'émission et la réception de factures au format électronique normalisé. M7:7 est déjà prêt." },
  { q: "L'IA est-elle incluse dans tous les plans ?", a: "Une IA basique est incluse dès le plan Micro. L'IA avancée (copilote financier, forecast, détection d'anomalies) est disponible à partir du plan Pro." },
  { q: "Comment fonctionne l'essai gratuit ?", a: "14 jours sans carte bancaire. Accès complet au plan Pro. À l'issue de l'essai, choisissez votre plan ou passez en Micro gratuit." },
];

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);

  return (
    <div>
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(250_75%_57%_/_0.07),transparent_65%)]" />
        <motion.div className="container text-center" variants={stagger} initial="hidden" animate="visible">
          <motion.div variants={fadeUp}>
            <Badge variant="secondary" className="mb-6 text-xs px-3 py-1">
              <Zap className="h-3 w-3 mr-1" /> Tarifs
            </Badge>
            <h1 className="text-4xl md:text-6xl font-display font-bold leading-[1.1] mb-6">
              Des offres pour<br />
              <span className="text-gradient">chaque étape</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
              Commencez gratuitement, évoluez sans friction. Pas de surprise, pas d'engagement.
            </p>
            {/* Toggle */}
            <div className="inline-flex items-center gap-3 bg-secondary rounded-xl p-1.5 mb-2">
              <button
                onClick={() => setYearly(false)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${!yearly ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
              >
                Mensuel
              </button>
              <button
                onClick={() => setYearly(true)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${yearly ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
              >
                Annuel
              </button>
            </div>
            {yearly && <p className="text-xs text-success font-medium">2 mois offerts avec l'abonnement annuel</p>}
          </motion.div>
        </motion.div>
      </section>

      {/* Plans */}
      <section className="pb-20">
        <div className="container">
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto"
            variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
          >
            {plans.map((plan) => (
              <motion.div key={plan.name} variants={fadeUp}>
                <Card className={`relative h-full flex flex-col ${plan.popular ? "border-primary shadow-glow" : "border-border/50"}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="gradient-primary text-primary-foreground text-[10px] shadow-glow">Populaire</Badge>
                    </div>
                  )}
                  <CardContent className="p-6 flex flex-col flex-1">
                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4 shadow-md`}>
                      <Zap className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="font-display font-bold text-xl">{plan.name}</h3>
                    <p className="text-xs text-muted-foreground mb-4">{plan.desc}</p>
                    <div className="mb-6">
                      {plan.monthlyPrice === null ? (
                        <span className="text-2xl font-display font-bold">Sur mesure</span>
                      ) : (
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-display font-bold">
                            {yearly ? plan.yearlyPrice : plan.monthlyPrice}€
                          </span>
                          <span className="text-xs text-muted-foreground">/mois</span>
                        </div>
                      )}
                      {yearly && plan.monthlyPrice && (
                        <p className="text-xs text-muted-foreground line-through mt-0.5">{plan.monthlyPrice}€/mois</p>
                      )}
                    </div>
                    <div className="space-y-2.5 mb-6 flex-1">
                      {plan.features.map((f) => (
                        <div key={f.label} className="flex items-start gap-2 text-xs">
                          {f.ok ? (
                            <CheckCircle className="h-3.5 w-3.5 text-success flex-shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5 text-muted-foreground/40 flex-shrink-0 mt-0.5" />
                          )}
                          <span className={f.ok ? "" : "text-muted-foreground/50"}>{f.label}</span>
                        </div>
                      ))}
                    </div>
                    <Link to="/register">
                      <Button
                        className={`w-full text-xs ${plan.popular ? "gradient-primary text-primary-foreground shadow-glow" : ""}`}
                        variant={plan.popular ? "default" : "outline"}
                        size="sm"
                      >
                        {plan.monthlyPrice === null ? "Nous contacter" : "Commencer — 14j gratuit"}
                        <ArrowRight className="ml-1.5 h-3 w-3" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-card">
        <div className="container max-w-3xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-display font-bold mb-3">Questions fréquentes</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <Card key={faq.q} className="border-border/50">
                <CardContent className="p-5">
                  <div className="flex gap-3">
                    <HelpCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm mb-1.5">{faq.q}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container text-center">
          <h2 className="text-3xl font-display font-bold mb-4">Prêt à démarrer ?</h2>
          <p className="text-muted-foreground mb-8">14 jours d'essai gratuit, sans carte bancaire requise.</p>
          <Link to="/register">
            <Button size="lg" className="gradient-primary text-primary-foreground shadow-glow">
              Essai gratuit <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
