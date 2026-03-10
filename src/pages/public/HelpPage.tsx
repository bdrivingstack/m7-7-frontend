import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { HelpCircle, Search, Book, MessageSquare, Video, ArrowRight, ChevronRight, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

const categories = [
  {
    icon: Zap, color: "from-violet-500 to-purple-600",
    title: "Démarrage rapide",
    articles: 12,
    desc: "Créez votre premier devis en 5 minutes.",
    links: ["Créer votre compte", "Configurer votre entreprise", "Première facture", "Inviter un collaborateur"],
  },
  {
    icon: Book, color: "from-blue-500 to-cyan-600",
    title: "Facturation",
    articles: 28,
    desc: "Devis, factures, avoirs, relances.",
    links: ["Créer un devis", "Convertir en facture", "Gérer les relances", "Factures récurrentes"],
  },
  {
    icon: MessageSquare, color: "from-emerald-500 to-teal-600",
    title: "Paiements",
    articles: 15,
    desc: "Stripe, liens de paiement, remboursements.",
    links: ["Connecter Stripe", "Créer un lien de paiement", "Gérer les remboursements", "Échéanciers"],
  },
  {
    icon: Video, color: "from-orange-500 to-amber-600",
    title: "Comptabilité",
    articles: 20,
    desc: "Banque, TVA, catégories, exports.",
    links: ["Connexion bancaire", "Catégoriser les transactions", "Déclarer la TVA", "Export FEC"],
  },
  {
    icon: HelpCircle, color: "from-pink-500 to-rose-600",
    title: "IA & Automatisation",
    articles: 10,
    desc: "Tout sur le copilote IA.",
    links: ["Premiers pas avec l'IA", "Catégorisation automatique", "Relances IA", "Forecast trésorerie"],
  },
  {
    icon: Book, color: "from-indigo-500 to-violet-600",
    title: "Paramètres & Sécurité",
    articles: 18,
    desc: "Compte, utilisateurs, sécurité.",
    links: ["Gérer les utilisateurs", "Configurer les rôles", "Activer le MFA", "Audit logs"],
  },
];

const popularArticles = [
  "Comment créer ma première facture ?",
  "Comment connecter mon compte bancaire ?",
  "Comment activer le paiement en ligne ?",
  "Comment préparer ma déclaration de TVA ?",
  "Comment inviter un collaborateur ?",
  "Comment utiliser l'IA pour les relances ?",
  "Comment exporter mes données comptables ?",
  "Qu'est-ce que la facture électronique ?",
];

export default function HelpPage() {
  const [search, setSearch] = useState("");

  return (
    <div>
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(250_75%_57%_/_0.07),transparent_65%)]" />
        <motion.div className="container text-center max-w-2xl mx-auto" variants={stagger} initial="hidden" animate="visible">
          <motion.div variants={fadeUp}>
            <Badge variant="secondary" className="mb-6 text-xs px-3 py-1">
              <HelpCircle className="h-3 w-3 mr-1" /> Centre d'aide
            </Badge>
            <h1 className="text-4xl md:text-5xl font-display font-bold leading-[1.1] mb-6">
              Comment pouvons-nous<br />
              <span className="text-gradient">vous aider ?</span>
            </h1>
            <div className="relative mt-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Chercher un article, une fonctionnalité..."
                className="pl-11 h-12 text-sm rounded-xl border-border bg-card shadow-md"
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-card">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-display font-bold">Parcourir par catégorie</h2>
          </div>
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
            variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
          >
            {categories.map((cat, i) => (
              <motion.div key={cat.title} variants={fadeUp} transition={{ delay: i * 0.06 }}>
                <Card className="h-full border-border/50 hover:shadow-lg transition-all cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-md flex-shrink-0`}>
                        <cat.icon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h3 className="font-display font-semibold">{cat.title}</h3>
                        <p className="text-xs text-muted-foreground">{cat.articles} articles</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{cat.desc}</p>
                    <div className="space-y-1.5">
                      {cat.links.map((link) => (
                        <div key={link} className="flex items-center gap-1.5 text-xs text-primary hover:underline cursor-pointer">
                          <ChevronRight className="h-3 w-3" />
                          <span>{link}</span>
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

      {/* Popular articles */}
      <section className="py-16">
        <div className="container max-w-2xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-display font-bold">Articles populaires</h2>
          </div>
          <div className="space-y-2">
            {popularArticles.map((article) => (
              <div key={article} className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card hover:border-primary/30 transition-colors cursor-pointer group">
                <span className="text-sm">{article}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 bg-card">
        <div className="container text-center max-w-xl mx-auto">
          <MessageSquare className="h-10 w-10 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-display font-bold mb-3">Vous n'avez pas trouvé ?</h2>
          <p className="text-muted-foreground mb-6">Notre équipe support répond en moins de 4h les jours ouvrés.</p>
          <div className="flex items-center justify-center gap-3">
            <Button className="gradient-primary text-primary-foreground shadow-glow">
              Contacter le support <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Link to="/docs">
              <Button variant="outline">Documentation API</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
