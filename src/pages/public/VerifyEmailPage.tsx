import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_BASE } from "@/hooks/useApi";

type Status = "loading" | "success" | "error" | "expired";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    if (!token) { setStatus("error"); return; }

    fetch(`${API_BASE}/api/auth/verify-email?token=${token}`)
      .then(async (res) => {
        if (res.ok) {
          setStatus("success");
        } else {
          const data = await res.json().catch(() => ({}));
          setStatus(data.code === "TOKEN_EXPIRED" ? "expired" : "error");
        }
      })
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm bg-card border border-border/60 rounded-2xl shadow-lg p-8 text-center space-y-5">

        {status === "loading" && (
          <>
            <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
            <p className="font-semibold text-lg">Vérification en cours…</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="h-16 w-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <h1 className="font-display font-bold text-xl">Email vérifié !</h1>
            <p className="text-sm text-muted-foreground">Votre compte est activé. Vous pouvez maintenant vous connecter.</p>
            <Button asChild className="w-full gradient-primary text-primary-foreground font-semibold">
              <Link to="/login">Se connecter</Link>
            </Button>
          </>
        )}

        {status === "expired" && (
          <>
            <div className="h-16 w-16 rounded-2xl bg-warning/10 flex items-center justify-center mx-auto">
              <Mail className="h-8 w-8 text-warning" />
            </div>
            <h1 className="font-display font-bold text-xl">Lien expiré</h1>
            <p className="text-sm text-muted-foreground">Ce lien de vérification a expiré (valide 24h). Connectez-vous pour en recevoir un nouveau.</p>
            <Button asChild className="w-full gradient-primary text-primary-foreground font-semibold">
              <Link to="/login">Aller à la connexion</Link>
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="font-display font-bold text-xl">Lien invalide</h1>
            <p className="text-sm text-muted-foreground">Ce lien est invalide ou a déjà été utilisé.</p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/login">Retour à la connexion</Link>
            </Button>
          </>
        )}

      </div>
    </div>
  );
}
