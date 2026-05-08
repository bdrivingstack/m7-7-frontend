import { useState } from "react";
import { Mail, Phone, MapPin, Clock, MessageSquare, Send, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

const contactInfos = [
  {
    icon: Mail,
    title: "Email",
    value: "contact@m7sept.fr",
    subtitle: "Réponse sous 24h ouvrées",
    href: "mailto:contact@m7sept.fr",
  },
  {
    icon: Phone,
    title: "Téléphone",
    value: "+33 1 00 00 00 00",
    subtitle: "Lun–Ven 9h–18h",
    href: "tel:+33100000000",
  },
  {
    icon: MapPin,
    title: "Adresse",
    value: "1 rue de la Paix",
    subtitle: "75001 Paris, France",
  },
  {
    icon: Clock,
    title: "Support",
    value: "support@m7sept.fr",
    subtitle: "Réponse sous 48h ouvrées",
    href: "mailto:support@m7sept.fr",
  },
];

type Sent = "idle" | "sending" | "done";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Sent>("idle");

  const valid = name.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && subject.trim() && message.trim().length >= 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setStatus("sending");
    // Simulation envoi — à brancher sur POST /api/contact en production
    await new Promise((r) => setTimeout(r, 1200));
    setStatus("done");
  };

  return (
    <div className="py-16 px-4">
      <div className="container max-w-5xl mx-auto">

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl gradient-primary shadow-glow mb-4">
            <MessageSquare className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-display font-bold mb-3">Contactez-nous</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Une question, un projet, un problème ? Notre équipe est là pour vous aider.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">

          {/* Formulaire */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              {status === "done" ? (
                <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                  <div className="h-16 w-16 rounded-2xl bg-success/10 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-success" />
                  </div>
                  <h2 className="font-display font-bold text-xl">Message envoyé !</h2>
                  <p className="text-sm text-muted-foreground">
                    Nous vous répondrons dans les 24h ouvrées.
                  </p>
                  <Button variant="outline" className="mt-2" onClick={() => {
                    setStatus("idle"); setName(""); setEmail(""); setSubject(""); setMessage("");
                  }}>
                    Envoyer un autre message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h2 className="font-display font-semibold text-lg mb-4">Envoyer un message</h2>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Nom complet *</Label>
                      <Input
                        placeholder="Jean Dupont"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={status === "sending"}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Email *</Label>
                      <Input
                        type="email"
                        placeholder="jean@example.fr"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={status === "sending"}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Sujet *</Label>
                    <Input
                      placeholder="Question sur la facturation, tarifs, intégration…"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      disabled={status === "sending"}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Message *</Label>
                    <Textarea
                      placeholder="Décrivez votre demande en détail…"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={5}
                      disabled={status === "sending"}
                      className="resize-none"
                    />
                    <p className="text-[10px] text-muted-foreground text-right">{message.length} / 2000</p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full gradient-primary text-primary-foreground shadow-glow"
                    disabled={!valid || status === "sending"}
                  >
                    {status === "sending" ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Envoi en cours…</>
                    ) : (
                      <><Send className="h-4 w-4 mr-2" />Envoyer le message</>
                    )}
                  </Button>

                  <p className="text-[10px] text-muted-foreground text-center">
                    * Champs obligatoires. Vos données sont traitées conformément à notre{" "}
                    <a href="/privacy" className="text-primary hover:underline">politique de confidentialité</a>.
                  </p>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Infos contact */}
          <div className="space-y-4">
            {contactInfos.map((info) => (
              <div key={info.title} className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <info.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{info.title}</p>
                  {info.href ? (
                    <a href={info.href} className="font-medium text-sm hover:text-primary transition-colors">
                      {info.value}
                    </a>
                  ) : (
                    <p className="font-medium text-sm">{info.value}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5">{info.subtitle}</p>
                </div>
              </div>
            ))}

            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <p className="text-sm font-medium mb-1">Vous êtes déjà client ?</p>
              <p className="text-xs text-muted-foreground mb-3">
                Accédez au support prioritaire directement depuis votre dashboard.
              </p>
              <Button variant="outline" size="sm" asChild>
                <a href="/login">Accéder à mon espace</a>
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
