import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ArrowRight, FileText, Scale, Shield, Clock, Globe, Receipt } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

const topics = [
  {
    icon: Receipt,
    color: "from-violet-500 to-purple-600",
    title: "Facture électronique 2026",
    desc: "La réforme e-facture rend obligatoire l'émission et la réception de factures au format électronique normalisé pour toutes les entreprises françaises.",
    items: ["Prêt pour le 1er septembre 2026", "Émission et réception natifs", "Connecteurs PPF et PDP", "E-reporting conforme", "Archivage légal 10 ans"],
  },
  {
    icon: Scale,
    color: "from-blue-500 to-cyan-600",
    title: "RGPD",
    desc: "Conformité totale au Règlement Général sur la Protection des Données. Vos données et celles de vos clients sont protégées.",
    items: ["Hébergement en Europe (UE)", "Droit à l'oubli", "Portabilité des données", "DPA disponible", "Registre des traitements"],
  },
  {
    icon: FileText,
    color: "from-emerald-500 to-teal-600",
    title: "Obligations comptables",
    desc: "LE BELVEDERE respecte les règles comptables françaises : numérotation chronologique, inaltérabilité, piste d'audit.",
    items: ["Numérotation unique et chronologique", "Inaltérabilité des factures validées", "Piste d'audit fiable", "Mentions légales automatiques", "Export FEC conforme"],
  },
  {
    icon: Globe,
    color: "from-orange-500 to-amber-600",
    title: "TVA & Fiscalité",
    desc: "Gestion de la TVA conforme à la réglementation française. Déclarations CA3, ventilation, mentions obligatoires.",
    items: ["TVA collectée / déductible", "Taux multiples (20%, 10%, 5,5%)", "Exonérations gérées", "Préparation CA3", "Archivage fiscal"],
  },
];

const timeline = [
  { date: "1er sept. 2026", label: "Grandes entreprises", status: "future", desc: "Obligation d'émission pour les grandes entreprises." },
  { date: "1er sept. 2027", label: "ETI", status: "future", desc: "Extension aux entreprises de taille intermédiaire." },
  { date: "1er sept. 2027", label: "PME & TPE", status: "future", desc: "Généralisation à toutes les entreprises." },
  { date: "Dès maintenant", label: "LE BELVEDERE prêt", status: "current", desc: "Activez la réception e-facture dès aujourd'hui." },
];

export default function CompliancePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(250_75%_57%_/_0.07),transparent_65%)]" />
        <motion.div className="container text-center" variants={stagger} initial="hidden" animate="visible">
          <motion.div variants={fadeUp}>
            <Badge variant="secondary" className="mb-6 text-xs px-3 py-1">
              <Scale className="h-3 w-3 mr-1" /> Conformité
            </Badge>
            <h1 className="text-4xl md:text-6xl font-display font-bold leading-[1.1] mb-6">
              Conforme aujourd'hui,<br />
              <span className="text-gradient">prêt pour demain</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              RGPD, e-facture 2026, obligations comptables françaises. LE BELVEDERE intègre les exigences réglementaires nativement.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Topics */}
      <section className="py-20 bg-card">
        <div className="container">
          <motion.div
            className="grid md:grid-cols-2 gap-6"
            variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
          >
            {topics.map((t, i) => (
              <motion.div key={t.title} variants={fadeUp} transition={{ delay: i * 0.08 }}>
                <Card className="h-full border-border/50 hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center mb-4 shadow-md`}>
                      <t.icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-display font-semibold text-lg mb-2">{t.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{t.desc}</p>
                    <div className="space-y-2">
                      {t.items.map((item) => (
                        <div key={item} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-3.5 w-3.5 text-success flex-shrink-0" />
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

      {/* E-facture timeline */}
      <section className="py-20">
        <div className="container max-w-3xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-display font-bold mb-3">Calendrier e-facture</h2>
            <p className="text-muted-foreground">La réforme s'applique progressivement. LE BELVEDERE vous y prépare dès maintenant.</p>
          </div>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
            <div className="space-y-6">
              {timeline.map((t) => (
                <div key={t.date} className="flex gap-5 pl-14 relative">
                  <div className={`absolute left-4 top-1 h-4 w-4 rounded-full border-2 ${t.status === "current" ? "bg-primary border-primary" : "bg-card border-border"}`} />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={t.status === "current" ? "default" : "secondary"} className="text-xs">
                        {t.date}
                      </Badge>
                      <span className="font-medium text-sm">{t.label}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-card">
        <div className="container text-center">
          <h2 className="text-3xl font-display font-bold mb-4">Anticipez la réforme</h2>
          <p className="text-muted-foreground mb-8">Activez la réception e-facture dès aujourd'hui, sans surcoût.</p>
          <div className="flex items-center justify-center gap-3">
            <Link to="/register">
              <Button size="lg" className="gradient-primary text-primary-foreground shadow-glow">
                Démarrer <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/e-invoicing">
              <Button variant="outline" size="lg">En savoir plus</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
