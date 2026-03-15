import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Book, Code, Key, Webhook, ArrowRight, ChevronRight, Copy, Terminal, Globe } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

const sections = [
  {
    icon: Key, color: "from-violet-500 to-purple-600",
    title: "Authentification",
    desc: "API Keys, OAuth, JWT. Sécurisez vos intégrations.",
    links: ["Créer une clé API", "Scopes et permissions", "Rotation des clés", "Sécurité des tokens"],
  },
  {
    icon: Book, color: "from-blue-500 to-cyan-600",
    title: "Ressources",
    desc: "Factures, devis, clients, paiements. Toutes les entités.",
    links: ["Factures (invoices)", "Devis (quotes)", "Clients (customers)", "Paiements (payments)"],
  },
  {
    icon: Webhook, color: "from-emerald-500 to-teal-600",
    title: "Webhooks",
    desc: "Recevez des événements en temps réel dans votre système.",
    links: ["Configuration", "Événements disponibles", "Vérification de signature", "Retry logic"],
  },
  {
    icon: Globe, color: "from-orange-500 to-amber-600",
    title: "SDKs",
    desc: "Librairies officielles pour intégrer LE BELVEDERE  rapidement.",
    links: ["Node.js / TypeScript", "Python", "PHP", "REST pur"],
  },
];

const endpoints = [
  { method: "GET", path: "/v1/invoices", desc: "Lister les factures" },
  { method: "POST", path: "/v1/invoices", desc: "Créer une facture" },
  { method: "GET", path: "/v1/invoices/:id", desc: "Récupérer une facture" },
  { method: "PATCH", path: "/v1/invoices/:id", desc: "Modifier une facture" },
  { method: "POST", path: "/v1/invoices/:id/send", desc: "Envoyer une facture" },
  { method: "GET", path: "/v1/customers", desc: "Lister les clients" },
  { method: "POST", path: "/v1/customers", desc: "Créer un client" },
  { method: "GET", path: "/v1/payments", desc: "Lister les paiements" },
];

const methodColors: Record<string, string> = {
  GET: "bg-blue-500/10 text-blue-500",
  POST: "bg-emerald-500/10 text-emerald-500",
  PATCH: "bg-orange-500/10 text-orange-500",
  DELETE: "bg-red-500/10 text-red-500",
};

const codeExample = `curl -X GET https://api.m7app.fr/v1/invoices \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`;

export default function DocsPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(250_75%_57%_/_0.07),transparent_65%)]" />
        <motion.div className="container text-center" variants={stagger} initial="hidden" animate="visible">
          <motion.div variants={fadeUp}>
            <Badge variant="secondary" className="mb-6 text-xs px-3 py-1">
              <Code className="h-3 w-3 mr-1" /> Documentation
            </Badge>
            <h1 className="text-4xl md:text-5xl font-display font-bold leading-[1.1] mb-6">
              API <span className="text-gradient">LE BELVEDERE</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
              REST API complète pour intégrer LE BELVEDERE dans votre système. Webhooks, SDKs, documentation OpenAPI.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button className="gradient-primary text-primary-foreground shadow-glow">
                Explorer l'API <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline">OpenAPI Spec</Button>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Quick start */}
      <section className="py-16 bg-card">
        <div className="container max-w-2xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-display font-bold">Démarrage rapide</h2>
          </div>
          <Card className="border-border/50">
            <CardContent className="p-0 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-secondary">
                <Terminal className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Bash</span>
                <button className="ml-auto">
                  <Copy className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors" />
                </button>
              </div>
              <pre className="p-4 text-sm font-mono text-foreground/80 overflow-x-auto bg-background">
                <code>{codeExample}</code>
              </pre>
            </CardContent>
          </Card>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Key className="h-3.5 w-3.5" />
            <span>Générez votre clé API dans <span className="text-primary">Paramètres → API</span></span>
          </div>
        </div>
      </section>

      {/* Sections */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-display font-bold">Documentation</h2>
          </div>
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-5"
            variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
          >
            {sections.map((s, i) => (
              <motion.div key={s.title} variants={fadeUp} transition={{ delay: i * 0.06 }}>
                <Card className="h-full border-border/50 hover:shadow-lg transition-all cursor-pointer">
                  <CardContent className="p-5">
                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-4 shadow-md`}>
                      <s.icon className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="font-display font-semibold mb-1">{s.title}</h3>
                    <p className="text-xs text-muted-foreground mb-4">{s.desc}</p>
                    <div className="space-y-1.5">
                      {s.links.map((link) => (
                        <div key={link} className="flex items-center gap-1.5 text-xs text-primary hover:underline cursor-pointer">
                          <ChevronRight className="h-3 w-3 flex-shrink-0" />
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

      {/* Endpoints */}
      <section className="py-16 bg-card">
        <div className="container max-w-3xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-display font-bold">Endpoints principaux</h2>
          </div>
          <div className="space-y-2">
            {endpoints.map((ep) => (
              <div key={`${ep.method}-${ep.path}`} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-background hover:border-primary/30 transition-colors cursor-pointer group">
                <Badge className={`text-[10px] font-mono font-bold w-14 justify-center flex-shrink-0 ${methodColors[ep.method]}`}>
                  {ep.method}
                </Badge>
                <code className="text-sm font-mono text-foreground/80 flex-1">{ep.path}</code>
                <span className="text-xs text-muted-foreground hidden sm:block">{ep.desc}</span>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
