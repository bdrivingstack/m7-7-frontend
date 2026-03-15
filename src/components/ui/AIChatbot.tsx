import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot, X, Send, Minimize2, Maximize2, Loader2,
  Sparkles, BookOpen, MessageCircle, ChevronRight,
  HelpCircle, Zap, CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface Message {
  id:        string;
  role:      "user" | "assistant";
  content:   string;
  timestamp: Date;
}

interface OnboardingStep {
  id:       string;
  title:    string;
  desc:     string;
  path?:    string;
  done:     boolean;
}

interface AIChatbotProps {
  orgName?:    string;
  activity?:   string;   // "auto-entrepreneur" | "freelance" | "sarl" | "sa" | ...
  userName?:   string;
  legalForm?:  string;
}

// ─── SUGGESTIONS PAR ACTIVITÉ ─────────────────────────────────────────────────

function getSuggestions(activity?: string): string[] {
  const base = [
    "Comment créer ma première facture ?",
    "Comment relancer un client qui ne paye pas ?",
    "Qu'est-ce qu'un avoir ?",
  ];

  if (!activity) return base;
  const a = activity.toLowerCase();

  if (a.includes("auto") || a.includes("micro")) return [
    "Comment calculer mes cotisations URSSAF ?",
    "Quand dois-je déclarer mon CA à l'URSSAF ?",
    "Suis-je concerné par la TVA ?",
    "Comment passer en facture électronique ?",
    ...base,
  ];

  if (a.includes("freelance") || a.includes("conseil") || a.includes("bnc")) return [
    "Comment facturer un acompte sur un projet ?",
    "Quelle TVA appliquer sur mes prestations ?",
    "Comment créer un devis et le convertir en facture ?",
    "Comment envoyer une relance automatique ?",
    ...base,
  ];

  if (a.includes("sarl") || a.includes("sas") || a.includes("sa")) return [
    "Comment gérer les paiements Stripe ?",
    "Comment inviter un comptable dans mon espace ?",
    "Comment configurer la facturation électronique ?",
    "Comment exporter mes données comptables ?",
    ...base,
  ];

  return base;
}

// ─── ÉTAPES ONBOARDING ────────────────────────────────────────────────────────

const ONBOARDING_STEPS: OnboardingStep[] = [
  { id:"profile",  title:"Compléter votre profil",      desc:"Ajoutez votre SIRET, logo et coordonnées",  path:"/app/settings/company", done:false },
  { id:"customer", title:"Créer votre premier client",   desc:"Ajoutez un client depuis l'annuaire officiel", path:"/app/customers/new",    done:false },
  { id:"invoice",  title:"Émettre votre première facture", desc:"Créez et envoyez une facture en 2 minutes", path:"/app/sales/invoices/new",done:false },
  { id:"payment",  title:"Enregistrer un paiement",      desc:"Marquez une facture comme payée",            path:"/app/sales/invoices",   done:false },
  { id:"einvoice", title:"Configurer la facture élec.",  desc:"Obligatoire en France dès sept. 2026",       path:"/app/settings/einvoicing",done:false },
];

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────

export default function AIChatbot({ orgName, activity, userName, legalForm }: AIChatbotProps) {
  const [open,      setOpen]      = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [tab,       setTab]       = useState<"chat" | "guide">("chat");
  const [messages,  setMessages]  = useState<Message[]>([]);
  const [input,     setInput]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [steps,     setSteps]     = useState<OnboardingStep[]>(ONBOARDING_STEPS);
  const [hasUnread, setHasUnread] = useState(false);

  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);
  const suggestions = getSuggestions(activity || legalForm);

  // Message de bienvenue personnalisé à l'ouverture
  useEffect(() => {
    if (open && messages.length === 0) {
      const activityLabel = activity?.includes("auto") ? "auto-entrepreneur"
        : activity?.includes("freelance") ? "freelance"
        : legalForm || "entrepreneur";

      const welcome: Message = {
        id:        "welcome",
        role:      "assistant",
        content:   `Bonjour ${userName || ""}${userName ? " 👋" : "👋"} ! Je suis votre assistant LE BELVEDERE, spécialisé en **gestion financière** pour les ${activityLabel}s.\n\nJe peux vous aider avec :\n• La facturation et les devis\n• Les relances clients\n• La TVA et les déclarations\n• La facture électronique (réforme 2026)\n• L'URSSAF et vos cotisations\n\nQue puis-je faire pour vous ?`,
        timestamp: new Date(),
      };
      setMessages([welcome]);
    }
  }, [open]);

  // Scroll auto en bas
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input à l'ouverture
  useEffect(() => {
    if (open && !minimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, minimized]);

  const sendMessage = useCallback(async (text?: string) => {
    const content = (text || input).trim();
    if (!content || loading) return;

    setInput("");
    const userMsg: Message = {
      id:        Date.now().toString(),
      role:      "user",
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      // Appel API Claude via Anthropic
      const systemPrompt = `Tu es l'assistant IA de LE BELVEDERE, une plateforme SaaS de gestion financière française.
Tu aides des ${activity || legalForm || "entrepreneurs"} à gérer leur facturation, leurs devis, leurs paiements, la TVA, l'URSSAF et la facturation électronique.
${orgName ? `L'entreprise s'appelle ${orgName}.` : ""}
${legalForm ? `Forme juridique : ${legalForm}.` : ""}

Règles :
- Réponds toujours en français, de façon concise et pratique
- Utilise des exemples chiffrés quand c'est utile
- Mentionne les spécificités françaises (TVA, URSSAF, Factur-X, etc.)
- Si une action est possible dans LE BELVEDERE, indique comment la faire
- Utilise des emojis avec modération pour la lisibilité
- Sois bienveillant et professionnel
- Réponds en maximum 150 mots sauf si une explication détaillée est vraiment nécessaire`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model:      "claude-sonnet-4-20250514",
          max_tokens: 600,
          system:     systemPrompt,
          messages:   [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: "user", content },
          ],
        }),
      });

      const data = await response.json();
      const assistantContent = data.content?.[0]?.text || "Désolé, je n'ai pas pu répondre. Réessayez.";

      const assistantMsg: Message = {
        id:        (Date.now() + 1).toString(),
        role:      "assistant",
        content:   assistantContent,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
      if (!open) setHasUnread(true);

    } catch {
      setMessages(prev => [...prev, {
        id:        "err-" + Date.now(),
        role:      "assistant",
        content:   "Une erreur réseau s'est produite. Vérifiez votre connexion et réessayez.",
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, activity, legalForm, orgName, open]);

  const toggleStep = (id: string) => {
    setSteps(s => s.map(step => step.id === id ? { ...step, done: !step.done } : step));
  };

  const doneCount = steps.filter(s => s.done).length;

  // ─── Bouton flottant ────────────────────────────────────────────────────
  return (
    <>
      {/* Bouton flottant */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{   scale: 0, opacity: 0 }}
            onClick={() => { setOpen(true); setHasUnread(false); }}
            className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-2xl bg-primary shadow-lg
                       flex items-center justify-center text-white
                       hover:scale-105 active:scale-95 transition-transform"
            aria-label="Ouvrir l'assistant"
          >
            <Bot className="h-6 w-6" />
            {hasUnread && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive
                               flex items-center justify-center text-[9px] font-bold text-white">
                !
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Fenêtre chatbot */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 0.95, y: 20  }}
            transition={{ duration: 0.2 }}
            className={cn(
              "fixed bottom-6 right-6 z-50 bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden",
              minimized ? "w-72 h-14" : "w-[380px] h-[560px]"
            )}
          >
            {/* ── Header ─────────────────────────────────────────────── */}
            <div className="flex items-center gap-3 px-4 py-3 bg-primary text-white flex-shrink-0">
              <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">Assistant LE BELVEDERE</p>
                {!minimized && (
                  <p className="text-[10px] text-white/70">
                    {loading ? "En train d'écrire..." : "En ligne • Répond en quelques secondes"}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setMinimized(m => !m)}
                  className="h-7 w-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  {minimized ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
                </button>
                <button onClick={() => setOpen(false)}
                  className="h-7 w-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {!minimized && (
              <>
                {/* ── Tabs ──────────────────────────────────────────── */}
                <div className="flex border-b border-border/60 flex-shrink-0">
                  {[
                    { id:"chat",  label:"Chat",   icon:MessageCircle },
                    { id:"guide", label:"Guide",   icon:BookOpen },
                  ].map(t => (
                    <button key={t.id} onClick={() => setTab(t.id as any)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors border-b-2",
                        tab === t.id
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      )}>
                      <t.icon className="h-3.5 w-3.5" />{t.label}
                    </button>
                  ))}
                </div>

                {/* ── TAB : CHAT ────────────────────────────────────── */}
                {tab === "chat" && (
                  <>
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
                      {messages.map(msg => (
                        <div key={msg.id}
                          className={cn("flex gap-2", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                          {msg.role === "assistant" && (
                            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Bot className="h-3.5 w-3.5 text-primary" />
                            </div>
                          )}
                          <div className={cn(
                            "max-w-[85%] rounded-xl px-3 py-2.5 text-xs leading-relaxed",
                            msg.role === "user"
                              ? "bg-primary text-white ml-auto"
                              : "bg-muted text-foreground"
                          )}>
                            {/* Rendu simple markdown bold */}
                            {msg.content.split("\n").map((line, i) => (
                              <span key={i} className="block">
                                {line.split(/\*\*(.*?)\*\*/g).map((part, j) =>
                                  j % 2 === 1
                                    ? <strong key={j}>{part}</strong>
                                    : part
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}

                      {/* Indicateur de frappe */}
                      {loading && (
                        <div className="flex gap-2">
                          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Bot className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <div className="bg-muted rounded-xl px-3 py-2.5 flex items-center gap-1">
                            {[0,1,2].map(i => (
                              <span key={i} className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 animate-bounce"
                                style={{ animationDelay: `${i * 0.15}s` }} />
                            ))}
                          </div>
                        </div>
                      )}
                      <div ref={bottomRef} />
                    </div>

                    {/* Suggestions rapides */}
                    {messages.length <= 1 && (
                      <div className="px-3 pb-2 flex gap-1.5 overflow-x-auto flex-shrink-0 scrollbar-hide">
                        {suggestions.slice(0, 3).map(s => (
                          <button key={s} onClick={() => sendMessage(s)}
                            className="flex-shrink-0 text-[10px] px-2.5 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors border border-border/60 whitespace-nowrap">
                            {s}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Input */}
                    <div className="px-3 pb-3 flex-shrink-0">
                      <div className="flex gap-2 bg-muted rounded-xl p-1">
                        <input
                          ref={inputRef}
                          value={input}
                          onChange={e => setInput(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                          placeholder="Posez votre question..."
                          className="flex-1 bg-transparent text-xs px-2 py-1.5 outline-none placeholder:text-muted-foreground/60"
                          disabled={loading}
                        />
                        <button
                          onClick={() => sendMessage()}
                          disabled={!input.trim() || loading}
                          className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white disabled:opacity-40 disabled:cursor-not-allowed transition-opacity flex-shrink-0"
                        >
                          {loading
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <Send    className="h-3.5 w-3.5" />
                          }
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* ── TAB : GUIDE ONBOARDING ────────────────────────── */}
                {tab === "guide" && (
                  <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
                    {/* Progression */}
                    <div className="rounded-xl bg-primary/5 border border-primary/20 px-4 py-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          <span className="text-sm font-semibold">Démarrage</span>
                        </div>
                        <span className="text-xs text-primary font-medium">{doneCount}/{steps.length}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-primary/20 overflow-hidden">
                        <div className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${(doneCount / steps.length) * 100}%` }} />
                      </div>
                    </div>

                    {/* Étapes */}
                    {steps.map((step, i) => (
                      <div key={step.id}
                        className={cn(
                          "rounded-xl border p-3 transition-all cursor-pointer",
                          step.done
                            ? "bg-success/5 border-success/30 opacity-70"
                            : "bg-card border-border hover:border-primary/50"
                        )}
                        onClick={() => toggleStep(step.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold",
                            step.done ? "bg-success text-white" : "bg-muted text-muted-foreground"
                          )}>
                            {step.done ? <CheckCircle className="h-3.5 w-3.5" /> : i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn("text-xs font-semibold", step.done && "line-through text-muted-foreground")}>
                              {step.title}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{step.desc}</p>
                          </div>
                          {!step.done && step.path && (
                            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    ))}

                    {doneCount === steps.length && (
                      <div className="rounded-xl bg-success/10 border border-success/30 px-4 py-3 text-center">
                        <Zap className="h-6 w-6 text-success mx-auto mb-1" />
                        <p className="text-sm font-semibold text-success">Félicitations ! 🎉</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Vous avez complété toutes les étapes de démarrage.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
