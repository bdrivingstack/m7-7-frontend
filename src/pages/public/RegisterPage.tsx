import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ClearableInput } from "@/components/ui/ClearableInput";
import PublicNavbar from "@/components/ui/PublicNavbar";
import {
  Eye, EyeOff, Lock, Mail, AlertTriangle, User,
  Building2, CheckCircle, Loader2, ArrowRight, Shield, XCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { EMAIL_REGEX, PASSWORD_RULES, parseApiError } from "@/lib/auth-validation";

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
function SuccessBox({ message }: { message: string }) {
  if (!message) return null;
  return (
    <motion.div initial={{ opacity:0,y:-6 }} animate={{ opacity:1,y:0 }}
      className="flex items-start gap-2.5 p-3 rounded-lg border border-success/30 bg-success/5 text-xs text-success">
      <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" /><span>{message}</span>
    </motion.div>
  );
}
function PwdRule({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-1.5 text-[10px] transition-colors ${ok ? "text-success" : "text-muted-foreground"}`}>
      {ok ? <CheckCircle className="h-3 w-3 flex-shrink-0" /> : <XCircle className="h-3 w-3 flex-shrink-0 opacity-40" />}
      <span>{label}</span>
    </div>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [firstName,    setFirstName]    = useState("");
  const [lastName,     setLastName]     = useState("");
  const [company,      setCompany]      = useState("");
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [confirm,      setConfirm]      = useState("");
  const [showPwd,      setShowPwd]      = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [cgu,          setCgu]          = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");
  const [success,      setSuccess]      = useState("");
  const [pwdFocused,   setPwdFocused]   = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [submitted,    setSubmitted]    = useState(false);

  const emailValid   = EMAIL_REGEX.test(email);
  const pwdRules     = PASSWORD_RULES.map(r => ({ ...r, ok: r.test(password) }));
  const pwdValid     = pwdRules.every(r => r.ok);
  const confirmValid = confirm === password && confirm.length > 0;

  const handleRegister = useCallback(async () => {
    setSubmitted(true); setError("");
    if (!firstName.trim()) { setError("Le prénom est requis.");              return; }
    if (!lastName.trim())  { setError("Le nom est requis.");                 return; }
    if (!company.trim())   { setError("Le nom de l'entreprise est requis."); return; }
    if (!emailValid)       { setError("Format d'email invalide.");           return; }
    if (!pwdValid)         { setError("Le mot de passe ne respecte pas tous les critères."); return; }
    if (!confirmValid)     { setError("Les mots de passe ne correspondent pas."); return; }
    if (!cgu)              { setError("Vous devez accepter les conditions générales."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method:"POST", headers:{"Content-Type":"application/json"}, credentials:"include",
        body: JSON.stringify({ firstName:firstName.trim(), lastName:lastName.trim(), company:company.trim(), email:email.trim().toLowerCase(), password }),
      });
      const ct = res.headers.get("content-type");
      if (!ct?.includes("application/json")) {
        throw new TypeError("Failed to fetch");
      }
      const data = await res.json();
      if (!res.ok) { setError(parseApiError(data)); return; }
      setSuccess("Compte créé ! Vérifiez votre boîte mail pour activer votre compte.");
      setTimeout(() => navigate("/login"), 3000);
    } catch(err) { setError(parseApiError(err)); }
    finally     { setLoading(false); }
  }, [firstName, lastName, company, email, password, confirm, emailValid, pwdValid, confirmValid, cgu, navigate]);

  const onKey = (e: React.KeyboardEvent) => { if (e.key === "Enter") handleRegister(); };

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar showClose />
      <div className="min-h-screen flex items-center justify-center p-4 pt-24 pb-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(250_75%_57%_/_0.06),transparent_70%)]" />
        <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} className="w-full max-w-md relative">

          <div className="flex flex-col items-center mb-8">
            <h1 className="text-2xl font-display font-bold">Créer votre compte</h1>
            <p className="text-xs text-muted-foreground mt-1">Essai gratuit 14 jours · Sans engagement · Sans CB</p>
          </div>

          <div className="bg-card border border-border/60 rounded-2xl shadow-lg p-6 space-y-4">
            <AnimatePresence>
              {error   && <ErrorBox   message={error} />}
              {success && <SuccessBox message={success} />}
            </AnimatePresence>

            {/* Prénom + Nom */}
            <div className="grid grid-cols-2 gap-3">
              {([
                { id:"firstName", label:"Prénom", value:firstName, set:setFirstName, placeholder:"Jean" },
                { id:"lastName",  label:"Nom",    value:lastName,  set:setLastName,  placeholder:"Dupont" },
              ] as const).map(f => (
                <div key={f.id} className="space-y-1.5">
                  <Label htmlFor={f.id} className="text-xs font-medium">{f.label}</Label>
                  <ClearableInput id={f.id} placeholder={f.placeholder}
                    value={f.value}
                    onChange={e => { f.set(e.target.value); setError(""); }}
                    onKeyDown={onKey}
                    onClear={() => { f.set(""); setError(""); }}
                    leftIcon={<User className="h-3.5 w-3.5" />}
                    disabled={loading}
                    inputClassName={`h-9 text-sm ${submitted && !f.value ? "border-destructive" : ""}`}
                  />
                  {submitted && !f.value && <p className="text-[10px] text-destructive">{f.label} requis</p>}
                </div>
              ))}
            </div>

            {/* Entreprise */}
            <div className="space-y-1.5">
              <Label htmlFor="company" className="text-xs font-medium">Nom de l'entreprise</Label>
              <ClearableInput id="company" placeholder="Mon Entreprise SAS"
                value={company}
                onChange={e => { setCompany(e.target.value); setError(""); }}
                onKeyDown={onKey}
                onClear={() => { setCompany(""); setError(""); }}
                leftIcon={<Building2 className="h-4 w-4" />}
                disabled={loading}
                autoComplete="organization"
                inputClassName={`h-10 text-sm ${submitted && !company ? "border-destructive" : ""}`}
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium">Email professionnel</Label>
              <ClearableInput id="email" type="email" placeholder="vous@entreprise.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(""); }}
                onBlur={() => setEmailTouched(true)}
                onKeyDown={onKey}
                onClear={() => { setEmail(""); setError(""); setEmailTouched(false); }}
                leftIcon={<Mail className="h-4 w-4" />}
                rightIcon={emailTouched && email
                  ? emailValid
                    ? <CheckCircle className="h-4 w-4 text-success" />
                    : <XCircle    className="h-4 w-4 text-destructive" />
                  : undefined
                }
                disabled={loading}
                autoComplete="email"
                inputClassName={`h-10 text-sm ${emailTouched && email && !emailValid ? "border-destructive" : emailTouched && emailValid ? "border-success" : ""}`}
              />
              {emailTouched && email && !emailValid && (
                <div className="space-y-0.5 p-2 rounded-lg bg-muted/50 border border-border/50">
                  <PwdRule ok={email.includes("@")} label="Contient un @" />
                  <PwdRule ok={email.includes(".")} label="Contient un point" />
                  <PwdRule ok={EMAIL_REGEX.test(email)} label="Format email valide" />
                </div>
              )}
              {emailTouched && emailValid && (
                <p className="text-[10px] text-success flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />Format email correct
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium">Mot de passe</Label>
              <ClearableInput id="password" type={showPwd ? "text" : "password"} placeholder="••••••••"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                onFocus={() => setPwdFocused(true)}
                onBlur={() => setPwdFocused(password.length > 0)}
                onKeyDown={onKey}
                onClear={() => { setPassword(""); setError(""); setPwdFocused(false); }}
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1} aria-label={showPwd ? "Masquer" : "Afficher"}>
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                disabled={loading}
                autoComplete="new-password"
                inputClassName={`h-10 text-sm ${password && !pwdValid ? "border-warning" : password && pwdValid ? "border-success" : ""}`}
              />
              <AnimatePresence>
                {(pwdFocused || (submitted && !pwdValid)) && (
                  <motion.div initial={{ opacity:0,height:0 }} animate={{ opacity:1,height:"auto" }}
                    exit={{ opacity:0,height:0 }}
                    className="p-3 rounded-lg bg-muted/50 border border-border/50 space-y-1.5">
                    <p className="text-[10px] font-semibold text-muted-foreground mb-1.5">Critères du mot de passe :</p>
                    {pwdRules.map(rule => <PwdRule key={rule.id} ok={rule.ok} label={rule.label} />)}
                    {pwdValid && (
                      <p className="text-[10px] text-success font-semibold flex items-center gap-1 pt-1 border-t border-border/40 mt-1">
                        <CheckCircle className="h-3 w-3" />Mot de passe valide
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Confirm */}
            <div className="space-y-1.5">
              <Label htmlFor="confirm" className="text-xs font-medium">Confirmer le mot de passe</Label>
              <ClearableInput id="confirm" type={showConfirm ? "text" : "password"} placeholder="••••••••"
                value={confirm}
                onChange={e => { setConfirm(e.target.value); setError(""); }}
                onKeyDown={onKey}
                onClear={() => { setConfirm(""); setError(""); }}
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}>
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                disabled={loading}
                autoComplete="new-password"
                inputClassName={`h-10 text-sm ${confirm && !confirmValid ? "border-destructive" : confirm && confirmValid ? "border-success" : ""}`}
              />
              {confirm && !confirmValid && (
                <p className="text-[10px] text-destructive flex items-center gap-1">
                  <XCircle className="h-3 w-3" />Les mots de passe ne correspondent pas
                </p>
              )}
              {confirm && confirmValid && (
                <p className="text-[10px] text-success flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />Mots de passe identiques
                </p>
              )}
            </div>

            {/* CGU */}
            <div className="flex items-start gap-2.5">
              <input type="checkbox" id="cgu" checked={cgu} onChange={e => setCgu(e.target.checked)}
                className="mt-0.5 rounded border-border accent-primary" />
              <label htmlFor="cgu" className="text-xs text-muted-foreground cursor-pointer leading-relaxed">
                J'accepte les{" "}
                <a href="/terms" className="text-primary hover:underline" target="_blank">conditions générales</a>{" "}
                et la{" "}
                <a href="/privacy" className="text-primary hover:underline" target="_blank">politique de confidentialité</a>.
              </label>
            </div>
            {submitted && !cgu && (
              <p className="text-[10px] text-destructive flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />Vous devez accepter les conditions générales
              </p>
            )}

            <Button className="w-full gradient-primary text-primary-foreground h-10 font-semibold"
              onClick={handleRegister} disabled={loading}>
              {loading
                ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Création du compte…</>
                : <><span>Démarrer l'essai gratuit</span><ArrowRight className="h-4 w-4 ml-2" /></>}
            </Button>
            <p className="text-[10px] text-muted-foreground text-center">
              🔒 Vos données sont chiffrées et hébergées en France (AWS Paris · RGPD)
            </p>
          </div>

          <p className="text-center mt-5 text-xs text-muted-foreground">
            Déjà un compte ?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">Se connecter</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
