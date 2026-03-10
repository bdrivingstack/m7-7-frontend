import { Outlet, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

const navLinks = [
  { label: "Fonctionnalités", href: "/features" },
  { label: "Tarifs", href: "/pricing" },
  { label: "Sécurité", href: "/security" },
  { label: "IA", href: "/ai" },
  { label: "Aide", href: "/help" },
];

export default function PublicLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 glass">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col leading-tight">
            <span className="font-bold text-base tracking-tight">M7Sept</span>
            <span className="text-[9px] text-muted-foreground italic hidden sm:block">Cherchez, Trouvez et Optimisez.</span>
          </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  location.pathname === link.href
                    ? "text-primary bg-primary/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Connexion</Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
                Essai gratuit
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <Outlet />
      <footer className="border-t border-border bg-card py-12">
        <div className="container grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-display font-semibold text-sm mb-3">Produit</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <Link to="/features" className="block hover:text-foreground">Fonctionnalités</Link>
              <Link to="/pricing" className="block hover:text-foreground">Tarifs</Link>
              <Link to="/ai" className="block hover:text-foreground">IA</Link>
              <Link to="/e-invoicing" className="block hover:text-foreground">Facture électronique</Link>
            </div>
          </div>
          <div>
            <h4 className="font-display font-semibold text-sm mb-3">Entreprise</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <Link to="/security" className="block hover:text-foreground">Sécurité</Link>
              <Link to="/compliance" className="block hover:text-foreground">Conformité</Link>
              <Link to="/docs" className="block hover:text-foreground">Documentation</Link>
            </div>
          </div>
          <div>
            <h4 className="font-display font-semibold text-sm mb-3">Support</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <Link to="/help" className="block hover:text-foreground">Centre d'aide</Link>
              <Link to="/docs" className="block hover:text-foreground">API</Link>
            </div>
          </div>
          <div>
            <h4 className="font-display font-semibold text-sm mb-3">Légal</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <a href="#" className="block hover:text-foreground">CGU</a>
              <a href="#" className="block hover:text-foreground">Confidentialité</a>
              <a href="#" className="block hover:text-foreground">Mentions légales</a>
            </div>
          </div>
        </div>
        <div className="container mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground">
          © 2024 M7:7. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}
