import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  User, Building2, Users, Shield, CreditCard, Palette,
  Mail, Landmark, Hash, Globe, Percent, Zap, ClipboardList, Code2,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const settingsNav = [
  { label: "Mon profil",       path: "/app/settings/profile",     icon: User },
  { label: "Entreprise",       path: "/app/settings/company",     icon: Building2 },
  { label: "Utilisateurs",     path: "/app/settings/users",       icon: Users },
  { label: "Sécurité",         path: "/app/settings/security",    icon: Shield },
  { label: "Facturation",      path: "/app/settings/billing",     icon: CreditCard },
  { label: "Marque & design",  path: "/app/settings/branding",    icon: Palette },
  { label: "Email",            path: "/app/settings/email",       icon: Mail },
  { label: "Paiement",         path: "/app/settings/payment",     icon: Landmark },
  { label: "Numérotation",     path: "/app/settings/numbering",   icon: Hash },
  { label: "Langue & région",  path: "/app/settings/languages",   icon: Globe },
  { label: "TVA",              path: "/app/settings/vat",         icon: Percent },
  { label: "E-Facture",        path: "/app/settings/e-invoicing", icon: Zap },
  { label: "Journaux d'audit", path: "/app/settings/audit-logs",  icon: ClipboardList },
  { label: "API & Webhooks",   path: "/app/settings/api",         icon: Code2 },
];

export default function SettingsLayout() {
  const location = useLocation();

  return (
    <div className="flex min-h-full">
      {/* Settings sidebar */}
      <aside className="w-56 flex-shrink-0 border-r border-border/50 bg-muted/20 p-3 hidden md:block">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-2 mb-2 mt-1">
          Paramètres
        </p>
        <nav className="space-y-0.5">
          {settingsNav.map((item) => {
            const active = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-all",
                  active
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                <item.icon className={cn("h-3.5 w-3.5 flex-shrink-0", active ? "text-primary" : "")} />
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight className="h-3 w-3 opacity-60" />}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Page content */}
      <div className="flex-1 min-w-0 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
