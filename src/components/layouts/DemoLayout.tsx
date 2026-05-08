import { Outlet, Link } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DemoSidebar } from "@/components/app/DemoSidebar";
import { DemoProvider } from "@/contexts/DemoContext";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function DemoLayout() {
  return (
    <DemoProvider>
      <SidebarProvider>
        <div className="min-h-screen flex flex-col w-full">

          {/* Bande démo visible en permanence */}
          <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-300/40 dark:border-amber-500/20 px-4 py-1.5 flex items-center justify-between gap-3 flex-shrink-0 z-40">
            <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="font-semibold">MODE DÉMO</span>
              <span className="opacity-70 hidden sm:inline">— Données fictives. Aucune action n'est sauvegardée.</span>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-xs border-amber-400/40 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40"
                >
                  Connexion
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="h-6 text-xs gradient-primary text-primary-foreground shadow-glow">
                  Essai gratuit
                </Button>
              </Link>
            </div>
          </div>

          {/* Corps principal avec sidebar */}
          <div className="flex flex-1 overflow-hidden">
            <DemoSidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <header className="h-14 flex items-center justify-between border-b border-border bg-card/50 backdrop-blur-sm px-4 sticky top-0 z-30">
                <div className="flex items-center gap-3">
                  <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 border border-amber-300/40 dark:border-amber-500/20">
                    <div className="h-5 w-5 rounded-full bg-amber-400/30 flex items-center justify-center text-[10px] font-bold text-amber-700 dark:text-amber-400">
                      D
                    </div>
                    <span className="text-xs text-amber-700 dark:text-amber-400 font-medium hidden sm:block">
                      Compte démo
                    </span>
                  </div>
                </div>
              </header>
              <main className="flex-1 overflow-auto">
                <Outlet />
              </main>
            </div>
          </div>

        </div>
      </SidebarProvider>
    </DemoProvider>
  );
}
