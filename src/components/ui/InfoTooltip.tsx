import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, HelpCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";

interface InfoTooltipProps {
  title:       string;         // Titre du popover
  description: string;         // Explication détaillée
  formula?:    string;         // Méthode de calcul (optionnel)
  benefit?:    string;         // Avantage / pourquoi c'est utile (optionnel)
  icon?:       "i" | "?";      // Style de l'icône
  size?:       "sm" | "md";
  className?:  string;
}

/**
 * InfoTooltip
 * — Survol → révèle l'icône i ou ?
 * — Clic → ouvre un popover avec titre + description + formule + avantage
 * — Clic n'importe où ailleurs → ferme le popover
 * — Monté dans un Portal pour éviter les overflow:hidden parents
 */
export function InfoTooltip({
  title,
  description,
  formula,
  benefit,
  icon = "i",
  size = "sm",
  className,
}: InfoTooltipProps) {
  const [hovered, setHovered] = useState(false);
  const [open,    setOpen]    = useState(false);
  const [pos,     setPos]     = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Calculer la position du popover
  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setPos({
      top:  rect.bottom + window.scrollY + 8,
      left: rect.left   + window.scrollX - 160 + rect.width / 2,
    });
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!open) updatePosition();
    setOpen(prev => !prev);
  };

  // Fermer au clic extérieur
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (buttonRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Fermer à l'Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const btnSize  = size === "sm" ? "h-4 w-4"     : "h-5 w-5";

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label={`En savoir plus sur ${title}`}
        className={cn(
          "inline-flex items-center justify-center rounded-full transition-all duration-150 flex-shrink-0",
          btnSize,
          open
            ? "text-primary bg-primary/10"
            : hovered
              ? "text-muted-foreground bg-muted"
              : "text-muted-foreground/30 hover:text-muted-foreground",
          className,
        )}
      >
        {icon === "i"
          ? <Info        className={iconSize} />
          : <HelpCircle  className={iconSize} />
        }
      </button>

      {/* Popover monté dans le body via Portal */}
      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0,  scale: 1 }}
              exit={{   opacity: 0, y: -6,  scale: 0.96 }}
              transition={{ duration: 0.15 }}
              style={{ position: "absolute", top: pos.top, left: pos.left, zIndex: 9999, width: 320 }}
              className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {icon === "i"
                      ? <Info       className="h-3.5 w-3.5 text-primary" />
                      : <HelpCircle className="h-3.5 w-3.5 text-primary" />
                    }
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="h-6 w-6 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Contenu */}
              <div className="px-4 py-3 space-y-3">
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>

                {formula && (
                  <div className="rounded-lg bg-muted/50 border border-border/60 px-3 py-2.5">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                      Méthode de calcul
                    </p>
                    <p className="text-xs text-foreground font-mono leading-relaxed">{formula}</p>
                  </div>
                )}

                {benefit && (
                  <div className="rounded-lg bg-primary/5 border border-primary/20 px-3 py-2.5">
                    <p className="text-[10px] uppercase tracking-wider text-primary font-semibold mb-1">
                      Pourquoi c'est utile
                    </p>
                    <p className="text-xs text-foreground leading-relaxed">{benefit}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}

// ─── Variantes prêtes à l'emploi pour le Dashboard ───────────────────────────

export const DASHBOARD_TOOLTIPS = {
  caHT: {
    title:       "Chiffre d'affaires HT",
    description: "Total des montants hors taxes de toutes les factures payées sur la période sélectionnée.",
    formula:     "Σ (totalHT des factures dont statut = PAID)",
    benefit:     "Indicateur principal de performance. Utilisé pour vos déclarations URSSAF et le suivi de croissance.",
  },
  caTTC: {
    title:       "Chiffre d'affaires TTC",
    description: "Total des montants toutes taxes comprises des factures payées. Inclut la TVA collectée.",
    formula:     "Σ (totalTTC des factures dont statut = PAID)",
    benefit:     "Montant réellement encaissé sur votre compte bancaire.",
  },
  tvaCollectee: {
    title:       "TVA collectée",
    description: "Montant total de TVA que vous avez facturé à vos clients et que vous devez reverser à l'État.",
    formula:     "Σ (totalTVA des factures dont statut = PAID)",
    benefit:     "À déclarer dans votre CA3 ou lors de votre déclaration de TVA trimestrielle/mensuelle.",
  },
  facturesEnRetard: {
    title:       "Factures en retard",
    description: "Factures dont la date d'échéance est dépassée et qui ne sont pas encore payées.",
    formula:     "Factures avec dueDate < aujourd'hui ET statut ≠ PAID/CANCELLED/CREDITED",
    benefit:     "Permet d'identifier rapidement les impayés et de déclencher des relances.",
  },
  tresoreriePrevisionnelle: {
    title:       "Trésorerie prévisionnelle",
    description: "Total des montants attendus sur les 90 prochains jours, basé sur les factures envoyées non payées.",
    formula:     "Σ (totalDue des factures dont dueDate ≤ aujourd'hui + 90j ET statut ≠ PAID)",
    benefit:     "Anticiper vos entrées de trésorerie pour gérer vos charges et investissements.",
  },
  tauxConversion: {
    title:       "Taux de conversion devis",
    description: "Pourcentage de devis envoyés qui ont été acceptés par les clients sur la période.",
    formula:     "(Devis ACCEPTED ÷ Devis SENT) × 100",
    benefit:     "Mesure l'efficacité commerciale. Un taux élevé indique une bonne adéquation offre/client.",
  },
  delaiPaiement: {
    title:       "Délai moyen de paiement",
    description: "Nombre de jours moyen entre l'émission d'une facture et son paiement effectif.",
    formula:     "Moyenne de (paidAt - issueDate) sur les factures PAID de la période",
    benefit:     "Un délai court améliore votre trésorerie. À comparer avec vos conditions de paiement (30j, 45j...)",
  },
  panierMoyen: {
    title:       "Panier moyen",
    description: "Montant moyen HT par facture payée sur la période sélectionnée.",
    formula:     "CA HT total ÷ Nombre de factures PAID",
    benefit:     "Identifier si vos prix augmentent ou diminuent dans le temps. Utile pour la stratégie tarifaire.",
  },
  // ─── Rubriques ──────────────────────────────────────────────────────────
  invoices: {
    title:       "Factures",
    description: "Documents légaux envoyés à vos clients réclamant le paiement d'une prestation ou vente.",
    benefit:     "Une facture verrouillée (envoyée) ne peut plus être modifiée — créez un avoir pour rectifier.",
    icon:        "?" as const,
  },
  quotes: {
    title:       "Devis",
    description: "Propositions commerciales envoyées à vos clients avant réalisation. Un devis accepté peut être converti en facture en 1 clic.",
    benefit:     "Les devis acceptés sont automatiquement archivés et liés à leur facture correspondante.",
    icon:        "?" as const,
  },
  payments: {
    title:       "Paiements",
    description: "Enregistrement de tous les règlements reçus, qu'ils soient manuels (virement, chèque) ou automatiques (Stripe).",
    benefit:     "Chaque paiement enregistré met automatiquement à jour le solde dû de la facture correspondante.",
    icon:        "?" as const,
  },
  creditNotes: {
    title:       "Avoirs",
    description: "Document légal annulant partiellement ou totalement une facture déjà émise.",
    benefit:     "Obligatoire en France pour corriger une facture envoyée. Ne pas supprimer une facture — créer un avoir.",
    icon:        "?" as const,
  },
  einvoicing: {
    title:       "Facturation électronique",
    description: "Depuis septembre 2026, toutes les entreprises françaises assujetties à la TVA doivent recevoir des factures au format électronique (Factur-X, UBL ou CII). L'émission devient obligatoire en 2027.",
    benefit:     "LE BELVEDERE gère automatiquement la soumission à votre PDP partenaire et l'archivage légal 10 ans.",
    icon:        "i" as const,
  },
  urssaf: {
    title:       "URSSAF",
    description: "Simulez vos cotisations sociales et déclarez votre chiffre d'affaires si vous êtes auto-entrepreneur.",
    formula:     "CA × taux cotisations (BNC: 21.1% — BIC services: 21.2% — BIC vente: 12.3%)",
    benefit:     "La déclaration tierce évite les oublis et pénalités. Les simulations sont basées sur l'API officielle Mon Entreprise.",
    icon:        "?" as const,
  },
} as const;
