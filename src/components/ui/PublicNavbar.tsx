import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Zap, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { label: "Fonctionnalités", href: "/#features" },
  { label: "Tarifs",          href: "/#pricing" },
  { label: "Facturation élec.", href: "/#einvoicing" },
  { label: "URSSAF",          href: "/#urssaf" },
];

interface PublicNavbarProps {
  showClose?: boolean;       // Affiche la croix de fermeture (Login/Register)
  onClose?:   () => void;    // Action croix — par défaut navigate("/")
}

export default function PublicNavbar({ showClose = false, onClose }: PublicNavbarProps) {
  const [menuOpen, setMenuOpen]   = useState(false);
  const [scrolled, setScrolled]   = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Effet verre dépoli au scroll
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Fermer le menu mobile si navigation
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const handleClose = () => {
    if (onClose) onClose();
    else navigate("/");
  };

  const isLogin    = location.pathname === "/login";
  const isRegister = location.pathname === "/register";
  const isAuthPage = isLogin || isRegister;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || isAuthPage
          ? "bg-background/80 backdrop-blur-xl border-b border-border/60 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* ── Logo ─────────────────────────────────────────────────────── */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-base tracking-tight">LE BELVEDERE</span>
            <span className="text-[9px] text-muted-foreground italic hidden sm:block">Cherchez, Trouvez et Optimisez.</span>
          </div>
        </Link>

        {/* ── Nav liens — desktop ───────────────────────────────────────── */}
        {!isAuthPage && (
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              <a
                key={link.label}
                href={link.href}
                className="px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}

        {/* ── Actions droite ────────────────────────────────────────────── */}
        <div className="flex items-center gap-2">

          {/* Sur les pages auth → croix de fermeture */}
          {isAuthPage && showClose && (
            <button
              onClick={handleClose}
              className="h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Retour à l'accueil"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          {/* Sur les pages non-auth → boutons Connexion / Essai gratuit */}
          {!isAuthPage && (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="hidden sm:flex text-sm">
                  Connexion
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="text-sm gradient-primary text-primary-foreground">
                  Essai gratuit
                </Button>
              </Link>
            </>
          )}

          {/* Sur Login → lien vers Register */}
          {isLogin && !showClose && (
            <Link to="/register">
              <Button variant="outline" size="sm" className="text-sm">
                Créer un compte
              </Button>
            </Link>
          )}

          {/* Sur Register → lien vers Login */}
          {isRegister && !showClose && (
            <Link to="/login">
              <Button variant="outline" size="sm" className="text-sm">
                Se connecter
              </Button>
            </Link>
          )}

          {/* Menu burger mobile */}
          {!isAuthPage && (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
              aria-label="Menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}
        </div>
      </div>

      {/* ── Menu mobile ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {menuOpen && !isAuthPage && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur-xl overflow-hidden"
          >
            <nav className="px-4 py-3 space-y-1">
              {NAV_LINKS.map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-2 pb-1 flex flex-col gap-2">
                <Link to="/login">
                  <Button variant="outline" className="w-full">Se connecter</Button>
                </Link>
                <Link to="/register">
                  <Button className="w-full gradient-primary text-primary-foreground">
                    Essai gratuit
                  </Button>
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
