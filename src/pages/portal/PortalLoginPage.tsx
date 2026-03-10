import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Eye, EyeOff, Lock, Mail, Shield, AlertTriangle,
  CheckCircle, Loader2, ArrowRight, Smartphone,
  RefreshCw, Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── SECURITY NOTES (pour le dev) ──────────────────────────────────────────
// Ce composant simule le flux frontend.
// Côté backend à implémenter :
//   - Vérification email/password avec bcrypt.compare()
//   - Token CSRF dans un cookie SameSite=Strict HttpOnly
//   - Rate limiting : 5 tentatives max / 15min par IP (express-rate-limit)
//   - Journalisation de chaque tentative (IP, user-agent, timestamp)
//   - Session via cookie HttpOnly SameSite=Strict (jamais localStorage)
//   - 2FA TOTP validation via speakeasy ou otplib
//   - Réponse intentionnellement vague en cas d'erreur (pas "email inconnu")
// ────────────────────────────────────────────────────────────────────────────

type Step = "credentials" | "mfa" | "success";

const PASSWORD_RULES = [
  { test: (p: string) => p.length >= 8,                label: "8 caractères minimum" },
  { test: (p: string) => /[A-Z]/.test(p),              label: "1 majuscule" },
  { test: (p: string) => /[0-9]/.test(p),              label: "1 chiffre" },
];

export default function PortalLoginPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);

  // Simule la validation côté client (complément à la validation serveur)
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const pwdStrength = PASSWORD_RULES.filter((r) => r.test(password)).length;

  const handleCredentials = async () => {
    if (!emailValid || !password) return;
    setLoading(true);
    setError("");

    // Simule un appel API POST /portal/auth/login
    // Le serveur répond toujours "Identifiants incorrects" (jamais "email inconnu")
    await new Promise((r) => setTimeout(r, 900));

    if (email === "client@acme.fr" && password === "Demo1234") {
      setStep("mfa");
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 5) {
        setLocked(true);
        setError("Trop de tentatives. Compte temporairement verrouillé (15 min).");
      } else {
        // Message intentionnellement vague — ne pas indiquer si c'est l'email ou le mot de passe
        setError(`Identifiants incorrects. ${5 - newAttempts} tentative(s) restante(s).`);
      }
    }
    setLoading(false);
  };

  const handleMFA = async () => {
    if (otp.length !== 6) return;
    setLoading(true);
    setError("");
    await new Promise((r) => setTimeout(r, 700));

    // Simule validation TOTP — en prod : otplib.authenticator.verify({ token, secret })
    if (otp === "123456" || otp === "000000") {
      setStep("success");
      setTimeout(() => navigate("/portal"), 1200);
    } else {
      setError("Code invalide ou expiré. Les codes TOTP changent toutes les 30 secondes.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2.5 mb-8"
      >
        <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
          <Shield className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <p className="font-display font-bold text-lg leading-none">Espace Client</p>
          <p className="text-xs text-muted-foreground">Accès sécurisé à vos documents</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-sm"
      >
        <Card className="shadow-lg border-border/60">
          <CardContent className="p-6 space-y-5">

            {/* Step indicator */}
            <div className="flex items-center gap-2 justify-center">
              {(["credentials", "mfa"] as Step[]).map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                    step === s ? "gradient-primary text-primary-foreground shadow-glow" :
                    (step === "success" || (step === "mfa" && i === 0)) ? "bg-success text-success-foreground" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {(step === "success" || (step === "mfa" && i === 0))
                      ? <CheckCircle className="h-3 w-3" />
                      : i + 1}
                  </div>
                  {i < 1 && <div className={`h-px w-8 transition-all ${step !== "credentials" ? "bg-success" : "bg-border"}`} />}
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">

              {/* ── STEP 1 : Credentials ── */}
              {step === "credentials" && (
                <motion.div key="creds" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                  <div className="text-center">
                    <h1 className="font-display font-bold text-xl">Connexion</h1>
                    <p className="text-xs text-muted-foreground mt-0.5">Accédez à vos factures et documents</p>
                  </div>

                  {locked && (
                    <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/5 flex items-start gap-2 text-xs">
                      <Lock className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                      <span className="text-destructive font-medium">Compte verrouillé 15 minutes suite à trop de tentatives. Réessayez plus tard ou contactez votre prestataire.</span>
                    </div>
                  )}

                  {error && !locked && (
                    <div className="p-3 rounded-lg border border-warning/30 bg-warning/5 flex items-start gap-2 text-xs">
                      <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
                      <span className="text-warning">{error}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label className="text-xs">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="votre@email.fr"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-9 h-10 text-sm"
                        autoComplete="email"
                        disabled={locked}
                        onKeyDown={(e) => e.key === "Enter" && handleCredentials()}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Mot de passe</Label>
                      <button
                        className="text-[10px] text-primary hover:underline"
                        onClick={() => navigate("/forgot-password")}
                      >
                        Mot de passe oublié ?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={showPwd ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-9 pr-9 h-10 text-sm"
                        autoComplete="current-password"
                        disabled={locked}
                        onKeyDown={(e) => e.key === "Enter" && handleCredentials()}
                      />
                      <button
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPwd(!showPwd)}
                        tabIndex={-1}
                      >
                        {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    className="w-full gradient-primary text-primary-foreground h-10"
                    onClick={handleCredentials}
                    disabled={loading || !emailValid || !password || locked}
                  >
                    {loading
                      ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Vérification…</>
                      : <><span>Continuer</span><ArrowRight className="h-4 w-4 ml-2" /></>}
                  </Button>

                  {/* Demo helper */}
                  <div className="p-2.5 rounded-lg bg-muted/50 border border-border/40 text-[10px] text-muted-foreground text-center space-y-0.5">
                    <p className="font-medium">Démo : <code className="font-mono">client@acme.fr</code> / <code className="font-mono">Demo1234</code></p>
                    <p>Code OTP : <code className="font-mono">123456</code></p>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 2 : 2FA / OTP ── */}
              {step === "mfa" && (
                <motion.div key="mfa" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
                  <div className="text-center">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <Smartphone className="h-7 w-7 text-primary" />
                    </div>
                    <h1 className="font-display font-bold text-xl">Double authentification</h1>
                    <p className="text-xs text-muted-foreground mt-1">
                      Entrez le code à 6 chiffres de votre application d'authentification
                    </p>
                  </div>

                  {error && (
                    <div className="p-3 rounded-lg border border-warning/30 bg-warning/5 flex items-start gap-2 text-xs">
                      <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
                      <span className="text-warning">{error}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label className="text-xs">Code OTP (6 chiffres)</Label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      placeholder="123 456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="h-12 text-center text-xl font-mono tracking-[0.5em] letter-spacing-wide"
                      autoFocus
                      onKeyDown={(e) => e.key === "Enter" && handleMFA()}
                    />
                    <p className="text-[10px] text-muted-foreground text-center">
                      Le code expire dans 30 secondes · Utilisez Google Authenticator ou Authy
                    </p>
                  </div>

                  <Button
                    className="w-full gradient-primary text-primary-foreground h-10"
                    onClick={handleMFA}
                    disabled={loading || otp.length !== 6}
                  >
                    {loading
                      ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Vérification…</>
                      : <><Shield className="h-4 w-4 mr-2" />Valider le code</>}
                  </Button>

                  <button
                    className="w-full text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5"
                    onClick={() => { setStep("credentials"); setError(""); setOtp(""); }}
                  >
                    ← Retour
                  </button>
                </motion.div>
              )}

              {/* ── STEP 3 : Success ── */}
              {step === "success" && (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-3 py-4">
                  <div className="h-16 w-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto">
                    <CheckCircle className="h-8 w-8 text-success" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-lg">Connexion réussie</p>
                    <p className="text-xs text-muted-foreground">Redirection vers votre espace…</p>
                  </div>
                  <Loader2 className="h-5 w-5 animate-spin text-primary mx-auto" />
                </motion.div>
              )}

            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Security badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center gap-4 mt-4 text-[10px] text-muted-foreground"
        >
          <span className="flex items-center gap-1"><Lock className="h-3 w-3" />TLS 1.3</span>
          <span className="flex items-center gap-1"><Shield className="h-3 w-3" />2FA</span>
          <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3" />RGPD</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
