import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Bot, Zap, ArrowRight, CheckCircle, Sparkles,
  MessageSquare, TrendingUp, AlertTriangle, FileText,
  RefreshCw, PieChart, Lightbulb, Clock,
} from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

const capabilities = [
  {
    icon: FileText,
    color: "from-violet-500 to-purple-600",
    title: "Génération de documents",
    desc: "Décrivez votre besoin en langage naturel. L'IA génère un devis ou une facture prête à envoyer en quelques secondes.",
    example: "« Crée une facture pour 3 jours de conseil à 750€/j pour TechCorp »",
  },
  {
    icon: MessageSquare,
    color: "from-blue-500 to-cyan-600",
    title: "Relances intelligentes",
    desc: "L'IA rédige des emails de relance adaptés au contexte : montant, retard, historique client, ton souhaité.",
    example: "« Écris une relance ferme mais professionnelle pour la facture en retard de 15 jours »",
  },
  {
    icon: RefreshCw,
    color: "from-emerald-500 to-teal-600",
    title: "Catégorisation bancaire",
    desc: "Vos transactions sont catégorisées automatiquement grâce à l'IA. Gagnez des heures de comptabilité chaque mois.",
    example: "« Catégorise automatiquement toutes les transactions non traitées »",
  },
  {
    icon: TrendingUp,
    color: "from-orange-500 to-amber-600",
    title: "Forecast & prévisions",
    desc: "L'IA analyse vos tendances et vous donne une vision commentée de votre trésorerie à 30, 60 et 90 jours.",
    example: "« Quelle sera ma trésorerie dans 60 jours au vu de mes données actuelles ? »",
  },
  {
    icon: AlertTriangle,
    color: "from-red-500 to-rose-600",
    title: "Détection d'anomalies",
    desc: "Factures en double, transactions inhabituelles, montants suspects. L'IA vous alerte avant que ça devienne un problème.",
    example: "« Analyse mes données et signale les anomalies potentielles »",
  },
  {
    icon: Lightbulb,
    color: "from-pink-500 to-rose-600",
    title: "Recommandations actionnables",
    desc: "Chaque mois, l'IA vous propose des actions concrètes pour améliorer votre situation financière.",
    example: "« 3 clients n'ont pas été relancés depuis 30 jours. Voulez-vous que je génère les relances ? »",
  },
];

const chatExamples = [
  { role: "user", text: "Génère une facture pour Acme Corp, 5 jours de développement à 800€/j, paiement 30 jours" },
  { role: "ai", text: "✅ Facture FA-2024-047 créée pour Acme Corp — 4 000 € HT (4 800 € TTC). Voulez-vous l'envoyer par email directement ?" },
  { role: "user", text: "Quels clients ont des impayés depuis plus de 30 jours ?" },
  { role: "ai", text: "3 clients ont des impayés > 30j : Dupont SARL (2 340€), ABC Studio (890€), Innovatech (1 200€). Total : 4 430€. Voulez-vous que je génère les relances ?" },
];

const plans = [
  { plan: "Micro", features: ["Génération de documents", "Résumé mensuel basique"] },
  { plan: "Pro", features: ["Tout Micro +", "Relances intelligentes", "Catégorisation auto", "Recommandations"] },
  { plan: "Business", features: ["Tout Pro +", "Forecast trésorerie", "Détection d'anomalies", "Copilote financier"] },
];

export default function AIPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(250_75%_57%_/_0.1),transparent_65%)]" />
        <motion.div className="container text-center" variants={stagger} initial="hidden" animate="visible">
          <motion.div variants={fadeUp}>
            <Badge variant="secondary" className="mb-6 text-xs px-3 py-1">
              <Sparkles className="h-3 w-3 mr-1" /> IA Copilote
            </Badge>
            <h1 className="text-4xl md:text-6xl font-display font-bold leading-[1.1] mb-6">
              L'IA qui comprend<br />
              <span className="text-gradient">votre business</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Pas un chatbot générique. Un copilote financier qui connaît vos données, vos clients et vos habitudes pour vous aider à décider et agir.
            </p>
            <Link to="/register">
              <Button size="lg" className="gradient-primary text-primary-foreground shadow-glow">
                Essayer l'IA <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Chat demo */}
      <section className="py-16 bg-card">
        <div className="container max-w-2xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-display font-bold mb-2">Voyez l'IA en action</h2>
            <p className="text-sm text-muted-foreground">Des exemples réels de ce que vous pouvez faire.</p>
          </div>
          <div className="rounded-2xl border border-border bg-background overflow-hidden shadow-lg">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-card">
              <Bot className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">M7:7 IA Assistant</span>
              <Badge variant="secondary" className="ml-auto text-[10px]">En ligne</Badge>
            </div>
            <div className="p-4 space-y-3 min-h-48">
              {chatExamples.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "gradient-primary text-primary-foreground rounded-br-sm"
                      : "bg-secondary text-foreground rounded-bl-sm"
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="px-4 py-3 border-t border-border bg-card">
              <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2">
                <span className="text-sm text-muted-foreground flex-1">Posez une question à votre IA...</span>
                <Button size="sm" className="gradient-primary text-primary-foreground h-7 px-3 text-xs">Envoyer</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-display font-bold mb-3">6 capacités IA</h2>
            <p className="text-muted-foreground">Chaque fonctionnalité IA est directement reliée à vos données réelles.</p>
          </div>
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
            variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
          >
            {capabilities.map((c, i) => (
              <motion.div key={c.title} variants={fadeUp} transition={{ delay: i * 0.06 }}>
                <Card className="h-full border-border/50 hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center mb-4 shadow-md`}>
                      <c.icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-display font-semibold mb-2">{c.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{c.desc}</p>
                    <div className="bg-secondary/50 rounded-lg p-3 text-xs text-muted-foreground italic border border-border/50">
                      {c.example}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Plans */}
      <section className="py-20 bg-card">
        <div className="container max-w-3xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-display font-bold mb-2">IA disponible selon votre plan</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {plans.map((p) => (
              <Card key={p.plan} className="border-border/50">
                <CardContent className="p-5">
                  <h3 className="font-display font-semibold mb-3">{p.plan}</h3>
                  <div className="space-y-2">
                    {p.features.map((f) => (
                      <div key={f} className="flex items-center gap-2 text-xs">
                        <CheckCircle className="h-3 w-3 text-success flex-shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/pricing">
              <Button variant="outline">Voir tous les plans <ArrowRight className="ml-2 h-3.5 w-3.5" /></Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
