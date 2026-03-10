// ─── VALIDATION RÈGLES ───────────────────────────────────────────────────────
// Partagées entre LoginPage, RegisterPage, et le backend (Zod)
// Le backend RE-VALIDE toujours — le frontend est une aide UX, pas une sécurité

export const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z0-9\-_.]+\.)+[a-zA-Z]{2,}))$/;

export const PASSWORD_RULES = [
  { id: "length",    test: (p: string) => p.length >= 8,              label: "8 caractères minimum" },
  { id: "uppercase", test: (p: string) => /[A-Z]/.test(p),            label: "1 lettre majuscule" },
  { id: "lowercase", test: (p: string) => /[a-z]/.test(p),            label: "1 lettre minuscule" },
  { id: "digit",     test: (p: string) => /[0-9]/.test(p),            label: "1 chiffre" },
  { id: "special",   test: (p: string) => /[@$!%*?&\-_#^]/.test(p),   label: "1 caractère spécial (@$!%*?&)" },
  { id: "noaccent",  test: (p: string) => !/[àâäéèêëîïôùûüç]/i.test(p), label: "Pas d'accents" },
];

export const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&\-_#^])[A-Za-z\d@$!%*?&\-_#^]{8,128}$/;

export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email.trim()) return { valid: false, error: "L'email est requis." };
  if (!EMAIL_REGEX.test(email)) return { valid: false, error: "Format d'email invalide." };
  return { valid: true };
}

export function validatePassword(password: string): { valid: boolean; failedRules: string[] } {
  const failedRules = PASSWORD_RULES.filter(r => !r.test(password)).map(r => r.id);
  return { valid: failedRules.length === 0, failedRules };
}

// ─── MESSAGES D'ERREUR BACKEND → FRONTEND ────────────────────────────────────
// Traduit les codes d'erreur du backend en messages lisibles

export type ApiErrorCode =
  | "INVALID_CREDENTIALS"
  | "ACCOUNT_LOCKED"
  | "ACCOUNT_NOT_VERIFIED"
  | "EMAIL_ALREADY_EXISTS"
  | "INVALID_2FA_CODE"
  | "TOKEN_EXPIRED"
  | "RATE_LIMITED"
  | "VALIDATION_ERROR"
  | "SERVER_ERROR"
  | "NETWORK_ERROR";

export const API_ERROR_MESSAGES: Record<ApiErrorCode, string> = {
  INVALID_CREDENTIALS:   "Identifiants incorrects. Vérifiez votre email et mot de passe.",
  ACCOUNT_LOCKED:        "Compte temporairement verrouillé suite à trop de tentatives. Réessayez dans 15 minutes.",
  ACCOUNT_NOT_VERIFIED:  "Votre email n'a pas été vérifié. Vérifiez votre boîte mail.",
  EMAIL_ALREADY_EXISTS:  "Cet email est déjà utilisé. Connectez-vous ou réinitialisez votre mot de passe.",
  INVALID_2FA_CODE:      "Code incorrect ou expiré. Les codes changent toutes les 30 secondes.",
  TOKEN_EXPIRED:         "Votre session a expiré. Veuillez vous reconnecter.",
  RATE_LIMITED:          "Trop de requêtes. Patientez quelques minutes avant de réessayer.",
  VALIDATION_ERROR:      "Données invalides. Vérifiez tous les champs.",
  SERVER_ERROR:          "Erreur serveur. Notre équipe a été notifiée. Réessayez dans quelques instants.",
  NETWORK_ERROR:         "Impossible de joindre le serveur. Vérifiez votre connexion internet.",
};

export function parseApiError(error: unknown): string {
  // Erreur réseau
  if (error instanceof TypeError && error.message === "Failed to fetch") {
    return API_ERROR_MESSAGES.NETWORK_ERROR;
  }

  // Erreur avec code structuré du backend
  if (typeof error === "object" && error !== null) {
    const e = error as { code?: string; message?: string; status?: number };

    if (e.code && e.code in API_ERROR_MESSAGES) {
      return API_ERROR_MESSAGES[e.code as ApiErrorCode];
    }

    // Fallback sur le message brut si lisible
    if (e.message && e.message.length < 200) {
      return e.message;
    }
  }

  return API_ERROR_MESSAGES.SERVER_ERROR;
}
