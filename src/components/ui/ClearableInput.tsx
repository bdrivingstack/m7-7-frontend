import { useRef, forwardRef, type InputHTMLAttributes } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClearableInputProps extends InputHTMLAttributes<HTMLInputElement> {
  value:       string;
  onClear:     () => void;
  leftIcon?:   React.ReactNode;
  rightIcon?:  React.ReactNode; // Icône droite autre que la croix (ex: œil mot de passe)
  inputClassName?: string;
  wrapperClassName?: string;
}

/**
 * ClearableInput
 * — Croix de reset visible UNIQUEMENT quand value.length > 0
 * — N'apparaît PAS au simple focus si le champ est vide
 * — Compatible avec tous les types d'input (text, email, search...)
 * — Accessible : aria-label sur le bouton clear
 */
const ClearableInput = forwardRef<HTMLInputElement, ClearableInputProps>(
  (
    {
      value,
      onClear,
      leftIcon,
      rightIcon,
      className,
      inputClassName,
      wrapperClassName,
      disabled,
      ...props
    },
    ref
  ) => {
    const hasValue   = String(value).length > 0;
    const hasLeft    = !!leftIcon;
    const hasRight   = !!rightIcon;

    return (
      <div className={cn("relative flex items-center", wrapperClassName)}>

        {/* Icône gauche optionnelle */}
        {hasLeft && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          value={value}
          disabled={disabled}
          className={cn(
            // Base shadcn Input
            "flex h-10 w-full rounded-md border border-input bg-background text-sm",
            "ring-offset-background transition-colors",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            // Padding adaptatif selon les icônes présentes
            hasLeft              ? "pl-9"  : "pl-3",
            // Droite : croix seule, icône seule, ou les deux
            hasValue && hasRight ? "pr-16" :
            hasValue || hasRight ? "pr-9"  : "pr-3",
            inputClassName,
            className,
          )}
          {...props}
        />

        {/* Zone droite : icône custom (ex: œil) + croix clear */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center pr-2 gap-0.5">

          {/* Icône droite custom — toujours visible */}
          {hasRight && (
            <span className="flex items-center justify-center h-7 w-7 text-muted-foreground">
              {rightIcon}
            </span>
          )}

          {/* Croix — UNIQUEMENT si value non vide */}
          {hasValue && !disabled && (
            <button
              type="button"
              onClick={onClear}
              aria-label="Effacer la saisie"
              tabIndex={-1}            // Ne pas capter le focus tab
              className="flex items-center justify-center h-7 w-7 rounded-md
                         text-muted-foreground/60 hover:text-muted-foreground
                         hover:bg-muted transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }
);

ClearableInput.displayName = "ClearableInput";

export { ClearableInput };
