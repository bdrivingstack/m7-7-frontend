import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Receipt, CheckCircle, ArrowRight, Clock, Shield, FileText, Globe, Bell } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

const features = [
  {
    icon: FileText, color: "from-violet-500 to-purple-600",
    title: "Émission e-facture",
    desc: "Émettez vos factures au format Factur-X, UBL ou CII. Transmission automatique via PPF ou PDP.",
    items: ["Format Factur-X", "Format UBL / CII", "Transmission PPF", "Connecteurs PDP", "Suivi des statuts"],
  },
  {
    icon: Receipt, color: "from-blue-500 to-cyan-600",
    title: "Réception e-facture",
    desc: "Recevez et traitez les factures fournisseurs électroniques directement dans M7:7.",
    items: ["Import automatique", "Rapprochement commandes", "Validation workflow", "Archivage légal", "Traçabilité complète"],
  },
  {
    icon: Globe, color: "from-emerald-500 to-teal-600",
    title: "E-reporting",
    desc: "Transmettez les données de transactions à l'administration fiscale. M7:7 gère tout automatiquement.",
    items: ["Transactions B2B", "Transactions B2C", "Données de paiement", "Envoi automatique", "Journal des transmissions"],
  },
  {
    icon: Shield, color: "from-orange-500 to-amber-600",
    title: "Centre de conformité",
    desc: "Suivez votre niveau de conformité en temps réel. Alertes, statuts, historique réglementaire.",
    items: ["Dashboard conformité", "Alertes réglementaires", "Statuts documentaires", "Audit trail", "Rapport de conformité"],
  },
];

const timeline = [
  { date: "1er sept. 2026", label: "Grandes entreprises & ETI", obligation: "Émission obligatoire", reception: "Réception obligatoire", highlight: false },
  { date: "1er sept. 2027", label: "PME & TPE & Micro", obligation: "Émission obligatoire", reception: "Réception obligatoire (déjà actif)", highlight: true },
];

const formats = [
  { name: "Factur-X", desc: "PDF enrichi avec données XML intégrées. Standard franco-allemand.", status: "Supporté" },
  { name: "UBL 2.1", desc: "Universal Business Language. Standard européen.", status: "Supporté" },
  { name: "CII", desc: "Cross Industry Invoice. Norme UN/CEFACT.", status: "Supporté" },
  { name: "Chorus Pro", desc: "Plateforme de facturation public.", status: "À venir" },
];

export default function EInvoicingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(250_75%_57%_/_0.07),transparent_65%)]" />
        <motion.div className="container text-center" variants={stagger} initial="hidden" animate="visible">
          <motion.div variants={fadeUp}>
            <Badge variant="secondary" className="mb-6 text-xs px-3 py-1">
              <Receipt className="h-3 w-3 mr-1" /> Facture Électronique
            </Badge>
            <h1 className="text-4xl md:text-6xl font-display font-bold leading-[1.1] mb-6">
              Prêt pour la réforme<br />
              <span className="text-gradient">e-facture 2026</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              L'obligation de facturation électronique arrive. M7:7 intègre nativement l'émission, la réception, le e-reporting et la conformité PPF/PDP.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link to="/register">
                <Button size="lg" className="gradient-primary text-primary-foreground shadow-glow">
                  Activer maintenant <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/compliance">
                <Button variant="outline" size="lg">Voir la conformité</Button>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-20 bg-card">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-display font-bold mb-3">Une solution complète</h2>
            <p className="text-muted-foreground">Émission, réception, e-reporting, conformité. Tout en un.</p>
          </div>
          <motion.div
            className="grid md:grid-cols-2 gap-6"
            variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
          >
            {features.map((f, i) => (
              <motion.div key={f.title} variants={fadeUp} transition={{ delay: i * 0.08 }}>
                <Card className="h-full border-border/50 hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-md`}>
                      <f.icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{f.desc}</p>
                    <div className="space-y-1.5">
                      {f.items.map((item) => (
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

      {/* Formats */}
      <section className="py-20">
        <div className="container max-w-3xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-display font-bold mb-2">Formats supportés</h2>
          </div>
          <div className="space-y-3">
            {formats.map((f) => (
              <div key={f.name} className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card hover:border-primary/30 transition-colors">
                <div>
                  <p className="font-medium text-sm">{f.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
                </div>
                <Badge variant={f.status === "Supporté" ? "default" : "secondary"} className="text-xs">
                  {f.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-card">
        <div className="container max-w-3xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-display font-bold mb-3">Calendrier d'application</h2>
            <p className="text-muted-foreground">La réforme s'applique progressivement. Anticipez dès maintenant.</p>
          </div>
          <div className="space-y-4">
            {timeline.map((t) => (
              <Card key={t.date} className={`border-border/50 ${t.highlight ? "border-primary/30" : ""}`}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                      <Clock className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">{t.date}</Badge>
                        <span className="font-medium text-sm">{t.label}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        <div className="text-xs text-muted-foreground"><span className="text-foreground font-medium">Émission :</span> {t.obligation}</div>
                        <div className="text-xs text-muted-foreground"><span className="text-foreground font-medium">Réception :</span> {t.reception}</div>
                      </div>
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
          <Bell className="h-10 w-10 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-display font-bold mb-4">N'attendez pas 2026</h2>
          <p className="text-muted-foreground mb-8">Activez la réception e-facture dès aujourd'hui. C'est inclus dans tous les plans.</p>
          <Link to="/register">
            <Button size="lg" className="gradient-primary text-primary-foreground shadow-glow">
              Commencer gratuitement <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
