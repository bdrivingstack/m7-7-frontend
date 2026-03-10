import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Zap, AlertTriangle, CheckCircle, Loader2, ArrowRight, Shield, Lock, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { EMAIL_REGEX, PASSWORD_RULES, parseApiError, API_ERROR_MESSAGES } from "@/lib/auth-validation";

type Step = "email" | "sent" | "reset" | "done";

function ErrorBox({ message }: { message: string }) {
  if (!message) return null;
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
      className="flex items-start gap-2.5 p-3 rounded-lg border border-destructive/30 bg-destructive/5 text-xs text-destructive" role="alert">
      <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" /><span>{message}</span>
    </motion.div>
  );
}

function PwdRule({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-1.5 text-[10px] transition-colors ${ok ? "text-success" : "text-muted-foreground"}`}>
      <CheckCircle className={`h-3 w-3 flex-shrink-0 ${ok ? "opacity-100" : "opacity-30"}`} />
      <span>{label}</span>
    </div>
  );
}

export default function ForgotPasswordPage() {
  const [step, setStep]           = useState<Step>("email");
  const [email, setEmail]         = useState("");
  const [newPwd, setNewPwd]       = useState("");
  const [confirm, setConfirm]     = useState("");
  const [showPwd, setShowPwd]     = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const emailValid = EMAIL_REGEX.test(email);
  const pwdRules   = PASSWORD_RULES.map(r => ({ ...r, ok: r.test(newPwd) }));
  const pwdValid   = pwdRules.every(r => r.ok);
  const confirmOk  = newPwd === confirm && confirm.length > 0;

  const handleSendEmail = async () => {
    if (!emailValid) { setError("Format d'email invalide."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      // Réponse toujours 200 — ne pas révéler si l'email existe ou non (sécurité)
      setStep("sent");
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPwd = async () => {
    if (!pwdValid)   { setError("Le mot de passe ne respecte pas les critères."); return; }
    if (!confirmOk)  { setError("Les mots de passe ne correspondent pas."); return; }
    setLoading(true); setError("");
    try {
      // Le token est dans l'URL — récupéré via useSearchParams en prod
      const token = new URLSearchParams(window.location.search).get("token") || "demo-token";
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: newPwd }),
      });
      const data = await res.json();
      if (!res.ok) { setError(parseApiError(data)); return; }
      setStep("done");
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(250_75%_57%_/_0.06),transparent_70%)]" />
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm relative">

        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-2xl gradient-primary flex items-center justify-center shadow-glow mb-3">
            <Zap className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-display font-bold">Mot de passe oublié</h1>
          <p className="text-xs text-muted-foreground mt-1">
            {step === "sent" ? "Email envoyé !" : step === "done" ? "Mot de passe réinitialisé" : "Réinitialisez votre accès"}
          </p>
        </div>

        <div className="bg-card border border-border/60 rounded-2xl shadow-lg p-6 space-y-4">
          <AnimatePresence mode="wait">

            {/* STEP 1 — Saisie email */}
            {step === "email" && (
              <motion.div key="email-step" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <p className="text-xs text-muted-foreground">Entrez votre email pour recevoir un lien de réinitialisation.</p>
                <AnimatePresence>{error && <ErrorBox message={error} />}</AnimatePresence>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="email" placeholder="vous@entreprise.com" value={email}
                      onChange={e => { setEmail(e.target.value); setError(""); }}
                      onKeyDown={e => e.key === "Enter" && handleSendEmail()}
                      className="pl-9 h-10 text-sm" autoComplete="email" disabled={loading} />
                  </div>
                </div>
                <Button className="w-full gradient-primary text-primary-foreground h-10 font-semibold"
                  onClick={handleSendEmail} disabled={loading || !emailValid}>
                  {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Envoi…</>
                    : <><span>Envoyer le lien</span><ArrowRight className="h-4 w-4 ml-2" /></>}
                </Button>
                {/* Sécurité : même message que l'email existe ou non */}
                <p className="text-[10px] text-muted-foreground text-center">
                  Un email sera envoyé si ce compte existe.
                </p>
              </motion.div>
            )}

            {/* STEP 2 — Email envoyé */}
            {step === "sent" && (
              <motion.div key="sent-step" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4">
                <div className="h-14 w-14 rounded-2xl bg-success/10 flex items-center justify-center mx-auto">
                  <Mail className="h-7 w-7 text-success" />
                </div>
                <div>
                  <p className="font-semibold">Email envoyé !</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Si <strong>{email}</strong> est associé à un compte, vous recevrez un lien valable <strong>15 minutes</strong>.
                  </p>
                </div>
                <div className="text-xs text-muted-foreground p-3 rounded-lg bg-muted/30 border border-border/50">
                  Vérifiez vos spams si vous ne voyez pas l'email.
                </div>
                {/* Pour la démo, lien simulé vers reset */}
                <Button variant="outline" size="sm" className="text-xs" onClick={() => setStep("reset")}>
                  (Démo) Simuler le clic sur le lien reçu →
                </Button>
              </motion.div>
            )}

            {/* STEP 3 — Nouveau mot de passe */}
            {step === "reset" && (
              <motion.div key="reset-step" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <p className="text-xs text-muted-foreground">Choisissez un nouveau mot de passe sécurisé.</p>
                <AnimatePresence>{error && <ErrorBox message={error} />}</AnimatePresence>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Nouveau mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type={showPwd ? "text" : "password"} placeholder="••••••••" value={newPwd}
                      onChange={e => { setNewPwd(e.target.value); setError(""); }}
                      className="pl-9 pr-10 h-10 text-sm" autoComplete="new-password" disabled={loading} />
                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" tabIndex={-1}>
                      {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {newPwd && (
                    <div className="p-2.5 rounded-lg bg-muted/50 border border-border/50 space-y-1.5">
                      {pwdRules.map(r => <PwdRule key={r.id} ok={r.ok} label={r.label} />)}
                    </div>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Confirmer</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="password" placeholder="••••••••" value={confirm}
                      onChange={e => { setConfirm(e.target.value); setError(""); }}
                      className={`pl-9 h-10 text-sm ${confirm && !confirmOk ? "border-destructive" : confirm && confirmOk ? "border-success" : ""}`}
                      autoComplete="new-password" disabled={loading} />
                  </div>
                  {confirm && !confirmOk && <p className="text-[10px] text-destructive">Les mots de passe ne correspondent pas</p>}
                </div>
                <Button className="w-full gradient-primary text-primary-foreground h-10 font-semibold"
                  onClick={handleResetPwd} disabled={loading || !pwdValid || !confirmOk}>
                  {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Enregistrement…</>
                    : "Réinitialiser le mot de passe"}
                </Button>
              </motion.div>
            )}

            {/* STEP 4 — Done */}
            {step === "done" && (
              <motion.div key="done-step" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4">
                <div className="h-14 w-14 rounded-2xl bg-success/10 flex items-center justify-center mx-auto">
                  <CheckCircle className="h-7 w-7 text-success" />
                </div>
                <div>
                  <p className="font-semibold text-success">Mot de passe réinitialisé !</p>
                  <p className="text-xs text-muted-foreground mt-1">Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
                </div>
                <Link to="/login">
                  <Button className="w-full gradient-primary text-primary-foreground h-10 font-semibold">Se connecter</Button>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center mt-5 text-xs text-muted-foreground">
          <Link to="/login" className="text-primary hover:underline">← Retour à la connexion</Link>
        </p>
      </motion.div>
    </div>
  );
}
