import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Bot, Send, Sparkles, FileText, RefreshCw, TrendingUp,
  AlertTriangle, Lightbulb, MessageSquare, Zap, Clock,
  CheckCircle, ChevronRight, Copy, ThumbsUp, ThumbsDown,
  RotateCcw, Download, Star, Plus, X, Loader2,
  CreditCard, Users, BarChart2, Euro,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type Role = "user" | "assistant";

interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
  actions?: Action[];
  thinking?: boolean;
}

interface Action {
  label: string;
  icon: React.ElementType;
  variant?: "default" | "outline";
  onClick?: () => void;
}

interface Suggestion {
  id: string;
  category: string;
  categoryColor: string;
  icon: React.ElementType;
  label: string;
  prompt: string;
}

// ─── MOCK AI RESPONSES ────────────────────────────────────────────────────────

const aiResponses: Record<string, { content: string; actions?: Action[] }> = {
  default: {
    content: "Je suis votre assistant IA M7:7. Je peux vous aider à générer des documents, analyser vos finances, rédiger des relances ou détecter des anomalies dans vos données. Que puis-je faire pour vous ?",
  },
  facture: {
    content: `✅ **Facture générée avec succès**

J'ai créé la facture **F-2024-052** pour votre client **TechFlow SAS** :

- **Prestation :** 3 jours de conseil en architecture cloud
- **Tarif :** 750 € / jour
- **Sous-total HT :** 2 250 €
- **TVA 20% :** 450 €
- **Total TTC :** **2 700 €**

La facture a été pré-remplie avec les coordonnées de TechFlow SAS et votre RIB habituel. Voulez-vous l'envoyer directement ou la modifier d'abord ?`,
    actions: [
      { label: "Envoyer par email", icon: Send, variant: "default" },
      { label: "Modifier", icon: FileText, variant: "outline" },
      { label: "Télécharger PDF", icon: Download, variant: "outline" },
    ],
  },
  relance: {
    content: `📧 **Email de relance rédigé**

Voici la relance pour la facture **F-2024-038** (Innovatech · 1 200 € · 12 jours de retard) :

---

*Objet : Rappel de règlement — Facture F-2024-038*

Madame, Monsieur,

Sauf erreur de notre part, nous n'avons pas encore reçu le règlement de la facture **F-2024-038** d'un montant de **1 200 € TTC**, échue le **25 février 2024**.

Nous vous serions reconnaissants de bien vouloir procéder au règlement dans les meilleurs délais par virement bancaire.

Cordialement,

---

Souhaitez-vous ajuster le ton ou envoyer cette relance maintenant ?`,
    actions: [
      { label: "Envoyer maintenant", icon: Send, variant: "default" },
      { label: "Ton plus ferme", icon: AlertTriangle, variant: "outline" },
      { label: "Copier l'email", icon: Copy, variant: "outline" },
    ],
  },
  tresorie: {
    content: `📊 **Prévision de trésorerie — 60 jours**

Sur la base de vos données actuelles, voici votre projection :

| Période | Entrées prev. | Sorties prev. | Solde projeté |
|---------|--------------|--------------|---------------|
| Mars 2024 | 11 582 € | 4 200 € | **35 832 €** |
| Avril 2024 | ~14 800 € | ~9 000 € | **41 632 €** |

**Points d'attention :**
- ⚠️ 3 factures représentant **8 750 €** arrivent à échéance en mars
- ✅ Le contrat de maintenance Green Solutions (780 €/mois) est récurrent
- 💡 Si TechFlow règle en retard (-15j), le solde mars descend à **27 082 €**

**Ma recommandation :** Relancez TechFlow SAS maintenant pour sécuriser votre trésorerie de mars.`,
    actions: [
      { label: "Relancer TechFlow", icon: Send, variant: "default" },
      { label: "Voir le rapport complet", icon: BarChart2, variant: "outline" },
    ],
  },
  anomalie: {
    content: `🔍 **Analyse terminée — 2 anomalies détectées**

J'ai analysé vos 245 transactions des 90 derniers jours :

**🔴 Anomalie 1 — Transaction en double suspectée**
- Virement de 780 € le 01/03 et le 04/03 pour "Green Solutions - Maintenance"
- Ces deux transactions semblent correspondre à la même prestation
- **Action recommandée :** Vérifier avec le client

**🟡 Anomalie 2 — Transaction inhabituelle**
- Achat CB de 1 847 € le 28/02 sans catégorie ni justificatif
- Montant 3× supérieur à votre ticket moyen CB
- **Action recommandée :** Catégoriser et ajouter un justificatif

Aucun autre problème détecté. ✅`,
    actions: [
      { label: "Voir les transactions", icon: CreditCard, variant: "default" },
      { label: "Catégoriser maintenant", icon: RefreshCw, variant: "outline" },
    ],
  },
  catego: {
    content: `⚡ **Catégorisation automatique terminée**

J'ai traité **18 transactions** non catégorisées :

- ✅ **16 catégorisées** automatiquement avec une confiance > 90%
- ⚠️ **2 transactions** nécessitent votre validation (confiance < 70%)

**Détail des catégories assignées :**
- Charges de personnel : 3 transactions (6 200 €)
- Logiciels & SaaS : 5 transactions (1 240 €)
- Déplacements : 4 transactions (890 €)
- Honoraires externes : 4 transactions (4 800 €)

Temps économisé : ~45 minutes de saisie manuelle ⏱️`,
    actions: [
      { label: "Valider les 2 restantes", icon: CheckCircle, variant: "default" },
      { label: "Voir le détail", icon: FileText, variant: "outline" },
    ],
  },
};

// ─── SUGGESTIONS ─────────────────────────────────────────────────────────────

const suggestions: Suggestion[] = [
  { id: "s1", category: "Facturation", categoryColor: "bg-violet-500/10 text-violet-600", icon: FileText, label: "Créer une facture", prompt: "Crée une facture pour 3 jours de conseil à 750€/j pour TechFlow SAS" },
  { id: "s2", category: "Relances", categoryColor: "bg-blue-500/10 text-blue-600", icon: MessageSquare, label: "Rédiger une relance", prompt: "Rédige une relance professionnelle pour la facture F-2024-038 en retard de 12 jours" },
  { id: "s3", category: "Trésorerie", categoryColor: "bg-emerald-500/10 text-emerald-600", icon: TrendingUp, label: "Prévision 60 jours", prompt: "Quelle sera ma trésorerie dans 60 jours au vu de mes données actuelles ?" },
  { id: "s4", category: "Comptabilité", categoryColor: "bg-orange-500/10 text-orange-600", icon: RefreshCw, label: "Catégoriser les transactions", prompt: "Catégorise automatiquement toutes mes transactions non traitées" },
  { id: "s5", category: "Analyse", categoryColor: "bg-red-500/10 text-red-600", icon: AlertTriangle, label: "Détecter les anomalies", prompt: "Analyse mes données et signale les anomalies ou transactions suspectes" },
  { id: "s6", category: "Clients", categoryColor: "bg-pink-500/10 text-pink-600", icon: Users, label: "Clients à risque", prompt: "Quels sont mes clients avec le plus de retards de paiement ?" },
];

// ─── CONTEXTUAL INSIGHTS ─────────────────────────────────────────────────────

const insights = [
  { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10", text: "3 factures impayées depuis +30j — 8 750 €", cta: "Relancer", prompt: "Rédige les relances pour mes 3 factures impayées depuis plus de 30 jours" },
  { icon: RefreshCw, color: "text-warning", bg: "bg-warning/10", text: "18 transactions non catégorisées", cta: "Catégoriser", prompt: "Catégorise automatiquement toutes mes transactions non traitées" },
  { icon: TrendingUp, color: "text-primary", bg: "bg-primary/10", text: "CA mars en baisse de 28% vs février", cta: "Analyser", prompt: "Analyse pourquoi mon CA de mars est en baisse par rapport à février" },
];

// ─── UTILS ───────────────────────────────────────────────────────────────────

function getAIResponse(prompt: string): { content: string; actions?: Action[] } {
  const p = prompt.toLowerCase();
  if (p.includes("facture") && (p.includes("crée") || p.includes("génère") || p.includes("cree") || p.includes("genere"))) return aiResponses.facture;
  if (p.includes("relance")) return aiResponses.relance;
  if (p.includes("trésorerie") || p.includes("tresorerie") || p.includes("60 jours") || p.includes("prévision") || p.includes("prevision")) return aiResponses.tresorie;
  if (p.includes("anomalie") || p.includes("suspect") || p.includes("double")) return aiResponses.anomalie;
  if (p.includes("catégoris") || p.includes("categoris") || p.includes("transaction")) return aiResponses.catego;
  return aiResponses.default;
}

function renderContent(text: string) {
  // Simple markdown-like renderer
  const lines = text.split("\n");
  return lines.map((line, i) => {
    if (line.startsWith("**") && line.endsWith("**")) {
      return <p key={i} className="font-bold">{line.slice(2, -2)}</p>;
    }
    if (line.startsWith("- ")) {
      return <li key={i} className="ml-3">{renderInline(line.slice(2))}</li>;
    }
    if (line.startsWith("|")) {
      // Table row — simplified
      const cells = line.split("|").filter(Boolean).map(c => c.trim());
      if (cells.every(c => c.match(/^[-\s]+$/))) return null;
      return (
        <tr key={i}>
          {cells.map((c, ci) => (
            <td key={ci} className="border border-border/40 px-2 py-1 text-xs" dangerouslySetInnerHTML={{ __html: c.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
          ))}
        </tr>
      );
    }
    if (line.trim() === "---") return <hr key={i} className="border-border/40 my-2" />;
    if (line.trim() === "") return <br key={i} />;
    return <p key={i}>{renderInline(line)}</p>;
  });
}

function renderInline(text: string) {
  // Bold
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**")
      ? <strong key={i}>{p.slice(2, -2)}</strong>
      : p
  );
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      timestamp: new Date(),
      content: `Bonjour ! Je suis votre assistant IA M7:7. 👋\n\nJe connais toutes vos données financières en temps réel et je peux vous aider à :\n\n- **Générer** devis, factures et relances en langage naturel\n- **Analyser** votre trésorerie et détecter des anomalies\n- **Catégoriser** automatiquement vos transactions bancaires\n- **Prévoir** votre cashflow sur 30, 60 ou 90 jours\n\nQue puis-je faire pour vous aujourd'hui ?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (prompt?: string) => {
    const text = (prompt ?? input).trim();
    if (!text || loading) return;

    setInput("");
    setShowSuggestions(false);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    // Thinking placeholder
    const thinkingId = (Date.now() + 1).toString();
    const thinkingMsg: Message = {
      id: thinkingId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      thinking: true,
    };

    setMessages((prev) => [...prev, userMsg, thinkingMsg]);
    setLoading(true);

    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));

    const response = getAIResponse(text);

    setMessages((prev) =>
      prev.map((m) =>
        m.id === thinkingId
          ? { ...m, content: response.content, actions: response.actions, thinking: false }
          : m
      )
    );
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearConversation = () => {
    setMessages([{
      id: "welcome-new",
      role: "assistant",
      timestamp: new Date(),
      content: `Conversation réinitialisée. Comment puis-je vous aider ?`,
    }]);
    setShowSuggestions(true);
  };

  const hasTableRow = (content: string) => content.includes("|");

  return (
    <div className="h-[calc(100vh-64px)] flex">

      {/* ── Sidebar insights ── */}
      <div className="hidden xl:flex flex-col w-72 border-r border-border/50 bg-muted/20 p-4 gap-4 flex-shrink-0 overflow-y-auto">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Insights IA du jour</p>
          <div className="space-y-2">
            {insights.map((ins, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="border-border/40 hover:border-primary/30 transition-colors cursor-pointer group"
                  onClick={() => sendMessage(ins.prompt)}>
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <div className={`h-7 w-7 rounded-lg ${ins.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <ins.icon className={`h-3.5 w-3.5 ${ins.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium leading-snug">{ins.text}</p>
                        <p className="text-[10px] text-primary mt-1 group-hover:underline flex items-center gap-0.5">
                          {ins.cta} <ChevronRight className="h-2.5 w-2.5" />
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Actions rapides</p>
          <div className="space-y-1.5">
            {suggestions.map((s) => (
              <button
                key={s.id}
                onClick={() => sendMessage(s.prompt)}
                className="w-full flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-background border border-transparent hover:border-border/50 transition-all text-left group"
              >
                <div className={`h-6 w-6 rounded-md ${s.categoryColor.replace("text-", "bg-").replace("600", "500/10")} flex items-center justify-center flex-shrink-0`}>
                  <s.icon className={`h-3 w-3 ${s.categoryColor.split(" ")[1]}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{s.label}</p>
                  <p className="text-[9px] text-muted-foreground">{s.category}</p>
                </div>
                <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Usage */}
        <div className="mt-auto">
          <Card className="border-border/40 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-3.5 w-3.5 text-primary" />
                <p className="text-xs font-semibold">Crédits IA</p>
              </div>
              <div className="h-1.5 rounded-full bg-background overflow-hidden mb-1.5">
                <div className="h-full w-[18%] rounded-full gradient-primary" />
              </div>
              <p className="text-[10px] text-muted-foreground">18 / 100 requêtes utilisées ce mois</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Main chat area ── */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Chat header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/50 bg-background/80 backdrop-blur flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <Bot className="h-4.5 w-4.5 text-primary-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm">M7 AI Assistant</p>
                <div className="flex items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-success" />
                  <span className="text-[10px] text-success">En ligne</span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">Accès complet à vos données financières</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="text-xs" onClick={clearConversation}>
              <RotateCcw className="h-3 w-3 mr-1.5" />Nouvelle conv.
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Download className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                {/* Avatar */}
                {msg.role === "assistant" ? (
                  <div className="h-8 w-8 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 mt-0.5 shadow-glow">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-xs">
                    JD
                  </div>
                )}

                <div className={`flex flex-col gap-2 max-w-[75%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  {/* Bubble */}
                  <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "gradient-primary text-primary-foreground rounded-tr-sm"
                      : "bg-muted/50 border border-border/50 rounded-tl-sm"
                  }`}>
                    {msg.thinking ? (
                      <div className="flex items-center gap-2 py-1">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Analyse en cours…</span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {hasTableRow(msg.content) ? (
                          <div className="space-y-1">
                            {msg.content.split("\n").some(l => l.startsWith("|")) ? (
                              <>
                                {msg.content.split("\n").filter(l => !l.startsWith("|") && !l.match(/^\|[-\s|]+\|$/)).map((line, i) => (
                                  <p key={i} className="text-sm">{renderInline(line)}</p>
                                ))}
                                <div className="overflow-x-auto mt-2">
                                  <table className="border-collapse text-xs w-full">
                                    <tbody>
                                      {msg.content.split("\n").filter(l => l.startsWith("|")).map((line, i) => {
                                        if (line.match(/^\|[-\s|]+\|$/)) return null;
                                        const cells = line.split("|").filter(Boolean).map(c => c.trim());
                                        return (
                                          <tr key={i} className={i === 0 ? "font-semibold bg-muted/60" : "hover:bg-muted/30"}>
                                            {cells.map((c, ci) => (
                                              <td key={ci} className="border border-border/50 px-2 py-1.5 text-xs"
                                                dangerouslySetInnerHTML={{ __html: c.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
                                            ))}
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </>
                            ) : renderContent(msg.content)}
                          </div>
                        ) : (
                          <div className="space-y-1">{renderContent(msg.content)}</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {msg.actions.map((action, i) => (
                        <Button
                          key={i}
                          size="sm"
                          variant={action.variant ?? "outline"}
                          className={`text-xs h-7 ${action.variant === "default" ? "gradient-primary text-primary-foreground" : ""}`}
                        >
                          <action.icon className="h-3 w-3 mr-1.5" />
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  )}

                  {/* Feedback / timestamp */}
                  {msg.role === "assistant" && !msg.thinking && (
                    <div className="flex items-center gap-3 px-1">
                      <span className="text-[10px] text-muted-foreground">
                        {msg.timestamp.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <div className="flex items-center gap-1">
                        <button className="text-muted-foreground hover:text-success transition-colors">
                          <ThumbsUp className="h-3 w-3" />
                        </button>
                        <button className="text-muted-foreground hover:text-destructive transition-colors">
                          <ThumbsDown className="h-3 w-3" />
                        </button>
                        <button className="text-muted-foreground hover:text-foreground transition-colors ml-1">
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Suggestions chips — shown when conversation is fresh */}
          {showSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-2 pt-2"
            >
              {suggestions.slice(0, 4).map((s) => (
                <button
                  key={s.id}
                  onClick={() => sendMessage(s.prompt)}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-border/60 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all"
                >
                  <s.icon className="h-3 w-3" />
                  {s.label}
                </button>
              ))}
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="flex-shrink-0 p-4 border-t border-border/50 bg-background/80 backdrop-blur">
          <div className="flex gap-3 items-end max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                placeholder="Décrivez ce que vous voulez faire… (ex: Crée une facture pour 2j de dev à 800€/j pour Acme Corp)"
                className="resize-none text-sm min-h-[44px] max-h-32 pr-4 py-3"
                rows={1}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 128) + "px";
                }}
                onKeyDown={handleKeyDown}
              />
            </div>
            <Button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="gradient-primary text-primary-foreground h-11 w-11 flex-shrink-0 p-0"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            Entrée pour envoyer · Maj+Entrée pour un saut de ligne · L'IA peut faire des erreurs, vérifiez les informations importantes
          </p>
        </div>
      </div>
    </div>
  );
}
