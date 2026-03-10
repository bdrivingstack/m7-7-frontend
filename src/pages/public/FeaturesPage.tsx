import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText, CreditCard, BarChart3, Bot, Shield, Receipt,
  Users, Clock, ArrowRight, CheckCircle, Zap, Globe,
  RefreshCw, Bell, Lock, Database, TrendingUp, PieChart,
  Kanban, Timer, Target, Mail, Webhook, Key,
} from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

const modules = [
  {
    icon: FileText,
    color: "from-violet-500 to-purple-600",
    title: "Facturation complète",
    desc: "Devis, factures, avoirs, acomptes, bons de commande. Conversion en 1 clic, verrouillage automatique des factures validées.",
    features: ["Numérotation automatique", "Prévisualisation PDF", "Envoi email intégré", "Historique des statuts", "Modèles personnalisables"],
  },
  {
    icon: CreditCard,
    color: "from-emerald-500 to-teal-600",
    title: "Paiements intégrés",
    desc: "Stripe natif, liens de paiement, paiements partiels, échéanciers, relances automatiques.",
    features: ["Liens de paiement", "Paiements partiels", "Échéanciers", "Pénalités configurables", "Webhooks sécurisés"],
  },
  {
    icon: BarChart3,
    color: "from-blue-500 to-cyan-600",
    title: "Comptabilité simplifiée",
    desc: "Livre des recettes, livre des achats, rapprochement bancaire, TVA, charges sociales.",
    features: ["Connexion bancaire", "Catégorisation IA", "Déclaration TVA", "Exports FEC/CSV", "Rapprochement auto"],
  },
  {
    icon: TrendingUp,
    color: "from-orange-500 to-amber-600",
    title: "Dashboard & Reporting",
    desc: "Cockpit de pilotage temps réel. CA, marge, trésorerie prévisionnelle, DSO, top clients.",
    features: ["KPIs en temps réel", "Forecast 30/60/90j", "Rapports exportables", "Comparaisons périodes", "Widgets personnalisables"],
  },
  {
    icon: Bot,
    color: "from-pink-500 to-rose-600",
    title: "IA copilote",
    desc: "Génération de documents, catégorisation bancaire, détection d'anomalies, recommandations actionnables.",
    features: ["Génération de devis", "Relances intelligentes", "Détection d'anomalies", "Forecast commenté", "Conseils actionnables"],
  },
  {
    icon: Receipt,
    color: "from-indigo-500 to-violet-600",
    title: "Facture électronique",
    desc: "Architecture prête pour 2026. Émission, réception, e-reporting, conformité PPF/PDP.",
    features: ["Émission e-facture", "Réception e-facture", "E-reporting", "Centre de conformité", "Archivage légal"],
  },
  {
    icon: Kanban,
    color: "from-teal-500 to-emerald-600",
    title: "Productivité",
    desc: "Board kanban, tâches, suivi du temps, projets, opportunités. Tout lié à vos clients et factures.",
    features: ["Board kanban", "Suivi du temps", "Gestion de projets", "CRM opportunités", "Assignation équipe"],
  },
  {
    icon: Users,
    color: "from-cyan-500 to-blue-600",
    title: "Portail client",
    desc: "Espace client externe sécurisé. Consultation, signature, paiement, téléchargement.",
    features: ["Consultation devis", "Signature électronique", "Paiement en ligne", "Historique documents", "Profil client"],
  },
  {
    icon: Globe,
    color: "from-violet-500 to-indigo-600",
    title: "Intégrations",
    desc: "Banques, Stripe, email, stockage, webhooks, API. Connectez votre écosystème.",
    features: ["API REST", "Webhooks signés", "Clés API", "Open Banking", "Stripe natif"],
  },
];

const allFeatures = [
  { cat: "Ventes", items: ["Devis", "Factures", "Avoirs", "Acomptes", "Bons de commande", "Récurrence", "Abonnements", "Relances auto", "Liens de paiement", "Modèles"] },
  { cat: "Comptabilité", items: ["Livre des recettes", "Livre des achats", "Transactions", "Catégories", "TVA", "Charges sociales", "Rapprochement", "Exports FEC"] },
  { cat: "Pilotage", items: ["Dashboard KPIs", "Forecast trésorerie", "DSO", "Rentabilité", "Top clients", "Rapports avancés", "Exports PDF/CSV"] },
  { cat: "IA", items: ["Génération documents", "Catégorisation auto", "Détection anomalies", "Relances IA", "Résumé mensuel", "Recommandations"] },
  { cat: "Sécurité", items: ["RBAC", "Audit logs", "MFA", "Sessions sécurisées", "Chiffrement", "RGPD", "Signed URLs"] },
  { cat: "Intégrations", items: ["Stripe", "Open Banking", "Resend email", "API REST", "Webhooks", "Stockage cloud"] },
];

export default function FeaturesPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(250_75%_57%_/_0.07),transparent_65%)]" />
        <motion.div className="container text-center" variants={stagger} initial="hidden" animate="visible">
          <motion.div variants={fadeUp}>
            <Badge variant="secondary" className="mb-6 text-xs px-3 py-1">
              <Zap className="h-3 w-3 mr-1" /> Fonctionnalités
            </Badge>
            <h1 className="text-4xl md:text-6xl font-display font-bold leading-[1.1] mb-6">
              Tout ce dont vous avez<br />
              <span className="text-gradient">besoin, rien de plus</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Une plateforme unifiée pour facturer, encaisser, piloter et automatiser. Simple pour les micro-entrepreneurs, puissant pour les PME.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link to="/register">
                <Button size="lg" className="gradient-primary text-primary-foreground shadow-glow">
                  Démarrer gratuitement <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outline" size="lg">Voir les tarifs</Button>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Modules */}
      <section className="py-20 bg-card">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-display font-bold mb-3">9 modules intégrés</h2>
            <p className="text-muted-foreground">Une suite cohérente, pas un patchwork d'outils.</p>
          </div>
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
            variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
          >
            {modules.map((m, i) => (
              <motion.div key={m.title} variants={fadeUp} transition={{ delay: i * 0.05 }}>
                <Card className="h-full hover:shadow-lg transition-all border-border/50 group">
                  <CardContent className="p-6">
                    <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center mb-4 shadow-md group-hover:scale-105 transition-transform`}>
                      <m.icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-display font-semibold mb-2">{m.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{m.desc}</p>
                    <div className="space-y-1.5">
                      {m.features.map((f) => (
                        <div key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle className="h-3 w-3 text-success flex-shrink-0" />
                          <span>{f}</span>
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

      {/* Feature matrix */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-display font-bold mb-3">Toutes les fonctionnalités</h2>
            <p className="text-muted-foreground">Un aperçu complet de ce qui est disponible.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allFeatures.map((cat) => (
              <div key={cat.cat}>
                <h3 className="font-display font-semibold text-sm text-primary mb-3 uppercase tracking-wide">{cat.cat}</h3>
                <div className="space-y-2">
                  {cat.items.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-3.5 w-3.5 text-success flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-card">
        <div className="container text-center">
          <h2 className="text-3xl font-display font-bold mb-4">Convaincu ?</h2>
          <p className="text-muted-foreground mb-8">14 jours d'essai gratuit, sans carte bancaire.</p>
          <Link to="/register">
            <Button size="lg" className="gradient-primary text-primary-foreground shadow-glow">
              Commencer maintenant <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
