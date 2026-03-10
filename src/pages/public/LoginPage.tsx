import { useState, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ClearableInput } from "@/components/ui/ClearableInput";
import PublicNavbar from "@/components/ui/PublicNavbar";
import {
  Eye, EyeOff, Lock, Mail, AlertTriangle,
  CheckCircle, Loader2, ArrowRight, Smartphone, Shield, Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { EMAIL_REGEX, parseApiError, API_ERROR_MESSAGES } from "@/lib/auth-validation";
import { useAuth } from "@/contexts/AuthContext";

const MAX_ATTEMPTS     = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;
const OTP_LENGTH       = 6;
type Step = "credentials" | "mfa" | "success";

function ErrorBox({ message }: { message: string }) {
  if (!message) return null;
  return (
    <motion.div initial={{ opacity:0,y:-6,height:0 }} animate={{ opacity:1,y:0,height:"auto" }}
      exit={{ opacity:0,height:0 }}
      className="flex items-start gap-2.5 p-3 rounded-lg border border-destructive/30 bg-destructive/5 text-xs text-destructive"
      role="alert" aria-live="polite">
      <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" /><span>{message}</span>
    </motion.div>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refresh } = useAuth();
  const [step,        setStep]        = useState<Step>("credentials");
  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [showPwd,     setShowPwd]     = useState(false);
  const [otp,         setOtp]         = useState("");
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [attempts,    setAttempts]    = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const otpRef = useRef<HTMLInputElement>(null);

  const emailValid       = EMAIL_REGEX.test(email);
  const isLocked         = lockedUntil !== null && Date.now() < lockedUntil;
  const lockRemainingMin = lockedUntil ? Math.ceil((lockedUntil - Date.now()) / 60000) : 0;

  const handleLogin = useCallback(async () => {
    if (isLocked || loading) return;
    if (!email || !password) { setError("Veuillez remplir tous les champs."); return; }
    if (!emailValid)         { setError("Format d'email invalide."); return; }
    setLoading(true); setError("");
    try {
      const res  = await fetch("/api/auth/login", {
        method:"POST", headers:{"Content-Type":"application/json"},
        credentials:"include",
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        const na = attempts + 1; setAttempts(na);
        if (na >= MAX_ATTEMPTS || data.code === "ACCOUNT_LOCKED") {
          setLockedUntil(Date.now() + LOCK_DURATION_MS);
          setError(API_ERROR_MESSAGES.ACCOUNT_LOCKED);
        } else {
          const rem = MAX_ATTEMPTS - na;
          setError(`${parseApiError(data)} (${rem} tentative${rem > 1 ? "s" : ""} restante${rem > 1 ? "s" : ""})`);
        }
        return;
      }
      if (data.requiresMfa) { setStep("mfa"); setTimeout(() => otpRef.current?.focus(), 100); }
      else {
        setStep("success");
        // On recharge l'utilisateur dans AuthContext AVANT de naviguer
        // pour que ProtectedRoute voie user != null
        await refresh();
        const from = (location.state as any)?.from ?? "/app/dashboard";
        navigate(from, { replace: true });
      }
    } catch(err) { setError(parseApiError(err)); }
    finally     { setLoading(false); }
  }, [email, password, emailValid, attempts, isLocked, loading, navigate]);

  const handleMfa = useCallback(async () => {
    if (loading || otp.length !== OTP_LENGTH) return;
    setLoading(true); setError("");
    try {
      const res  = await fetch("/api/auth/2fa/verify", {
        method:"POST", headers:{"Content-Type":"application/json"},
        credentials:"include", body: JSON.stringify({ code: otp }),
      });
      const data = await res.json();
      if (!res.ok) { setOtp(""); setError(parseApiError(data)); otpRef.current?.focus(); return; }
      setStep("success");
      await refresh();
      navigate("/app/dashboard", { replace: true });
    } catch(err) { setError(parseApiError(err)); }
    finally     { setLoading(false); }
  }, [otp, loading, navigate]);

  const onKey = (e: React.KeyboardEvent, fn: () => void) => { if (e.key === "Enter") fn(); };

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar showClose />
      <div className="min-h-screen flex items-center justify-center p-4 pt-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(250_75%_57%_/_0.06),transparent_70%)]" />
        <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} className="w-full max-w-sm relative">

          <div className="flex flex-col items-center mb-8">
            <h1 className="text-2xl font-display font-bold">
              {step === "mfa" ? "Double authentification" : "Connexion"}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              {step === "mfa" ? "Code à 6 chiffres de votre application" : "Accédez à votre espace M7Sept"}
            </p>
          </div>

          <div className="bg-card border border-border/60 rounded-2xl shadow-lg p-6 space-y-4">
            <AnimatePresence mode="wait">

              {step === "credentials" && (
                <motion.div key="creds" initial={{ opacity:0,x:-8 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:-8 }} className="space-y-4">
                  {isLocked && (
                    <div className="flex items-start gap-2.5 p-3 rounded-lg border border-destructive/30 bg-destructive/5 text-xs text-destructive" role="alert">
                      <Clock className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <span>Compte verrouillé — réessayez dans <strong>{lockRemainingMin} minute{lockRemainingMin > 1 ? "s" : ""}</strong>.</span>
                    </div>
                  )}
                  <AnimatePresence>{error && !isLocked && <ErrorBox message={error} />}</AnimatePresence>

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-medium">Email professionnel</Label>
                    <ClearableInput id="email" type="email" placeholder="vous@entreprise.com"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError(""); }}
                      onKeyDown={e => onKey(e, handleLogin)}
                      onClear={() => { setEmail(""); setError(""); }}
                      leftIcon={<Mail className="h-4 w-4" />}
                      disabled={isLocked || loading}
                      autoComplete="email"
                      inputClassName={email && !emailValid ? "border-destructive" : ""}
                    />
                    {email && !emailValid && (
                      <p className="text-[10px] text-destructive flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />Format d'email invalide
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-xs font-medium">Mot de passe</Label>
                      <Link to="/forgot-password" className="text-[10px] text-primary hover:underline" tabIndex={-1}>Mot de passe oublié ?</Link>
                    </div>
                    <ClearableInput id="password" type={showPwd ? "text" : "password"} placeholder="••••••••"
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError(""); }}
                      onKeyDown={e => onKey(e, handleLogin)}
                      onClear={() => { setPassword(""); setError(""); }}
                      leftIcon={<Lock className="h-4 w-4" />}
                      rightIcon={
                        <button type="button" onClick={() => setShowPwd(!showPwd)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          tabIndex={-1} aria-label={showPwd ? "Masquer" : "Afficher"}>
                          {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      }
                      disabled={isLocked || loading}
                      autoComplete="current-password"
                    />
                  </div>

                  <Button className="w-full gradient-primary text-primary-foreground h-10 font-semibold"
                    onClick={handleLogin} disabled={loading || isLocked || !email || !password}>
                    {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Vérification…</>
                      : <><span>Se connecter</span><ArrowRight className="h-4 w-4 ml-2" /></>}
                  </Button>
                  {attempts > 0 && attempts < MAX_ATTEMPTS && !isLocked && (
                    <p className="text-center text-[10px] text-warning">
                      {MAX_ATTEMPTS - attempts} tentative{MAX_ATTEMPTS - attempts > 1 ? "s" : ""} avant verrouillage
                    </p>
                  )}
                </motion.div>
              )}

              {step === "mfa" && (
                <motion.div key="mfa" initial={{ opacity:0,x:8 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:8 }} className="space-y-4">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                    <Smartphone className="h-7 w-7 text-primary" />
                  </div>
                  <AnimatePresence>{error && <ErrorBox message={error} />}</AnimatePresence>
                  <div className="space-y-1.5">
                    <Label htmlFor="otp" className="text-xs font-medium">Code à 6 chiffres</Label>
                    <ClearableInput id="otp" ref={otpRef} type="text" inputMode="numeric" pattern="[0-9]*"
                      maxLength={OTP_LENGTH} placeholder="000 000"
                      value={otp}
                      onChange={e => { setOtp(e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH)); setError(""); }}
                      onKeyDown={e => onKey(e, handleMfa)}
                      onClear={() => { setOtp(""); setError(""); }}
                      autoComplete="one-time-code"
                      inputClassName="h-14 text-center text-2xl font-mono tracking-[0.6em]"
                    />
                    <p className="text-[10px] text-muted-foreground text-center">Code valide 30 secondes · Google Authenticator ou Authy</p>
                  </div>
                  <Button className="w-full gradient-primary text-primary-foreground h-10 font-semibold"
                    onClick={handleMfa} disabled={loading || otp.length !== OTP_LENGTH}>
                    {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Vérification…</>
                      : <><Shield className="h-4 w-4 mr-2" />Valider le code</>}
                  </Button>
                  <button className="w-full text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => { setStep("credentials"); setError(""); setOtp(""); }}>← Retour</button>
                </motion.div>
              )}

              {step === "success" && (
                <motion.div key="success" initial={{ opacity:0,scale:0.95 }} animate={{ opacity:1,scale:1 }} className="text-center space-y-3 py-6">
                  <div className="h-16 w-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto">
                    <CheckCircle className="h-8 w-8 text-success" />
                  </div>
                  <p className="font-display font-bold text-lg">Connexion réussie !</p>
                  <Loader2 className="h-5 w-5 animate-spin text-primary mx-auto" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {step === "credentials" && (
            <p className="text-center mt-5 text-xs text-muted-foreground">
              Pas encore de compte ?{" "}
              <Link to="/register" className="text-primary hover:underline font-medium">Essai gratuit 14 jours</Link>
            </p>
          )}
          <div className="flex items-center justify-center gap-4 mt-4 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><Lock className="h-3 w-3" />TLS 1.3</span>
            <span className="flex items-center gap-1"><Shield className="h-3 w-3" />2FA</span>
            <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3" />RGPD</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
