import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app/AppSidebar";
import { Outlet, useNavigate, Link } from "react-router-dom";
import { Bell, Search, User, LogOut, Settings, Globe, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useApi } from "@/hooks/useApi";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Récupère le nombre de factures en retard pour les notifications
  const { data: dashData } = useApi<any>("/api/reports/dashboard?period=month");
  const overdueCount: number = dashData?.kpis?.invoicesOverdue ?? 0;
  const notifCount = overdueCount;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full overflow-x-hidden">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
          <header className="h-14 flex items-center justify-between border-b border-border bg-card/50 backdrop-blur-sm px-4 sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <div className="relative hidden md:block">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  className="w-64 pl-9 h-8 bg-secondary/50 border-0 text-sm focus-visible:ring-1"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">

              {/* Bouton voir le site public */}
              <Link to="/" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground hidden sm:flex">
                  <Globe className="h-3.5 w-3.5" />
                  Voir le site
                </Button>
              </Link>

              {/* Cloche notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-8 w-8">
                    <Bell className="h-4 w-4" />
                    {notifCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full gradient-primary text-[9px] font-bold text-primary-foreground flex items-center justify-center">
                        {notifCount > 9 ? "9+" : notifCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    {notifCount > 0 && (
                      <span className="text-xs text-muted-foreground font-normal">{notifCount} alerte(s)</span>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifCount === 0 ? (
                    <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                      <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-success/60" />
                      Aucune notification
                    </div>
                  ) : (
                    <>
                      {overdueCount > 0 && (
                        <DropdownMenuItem onClick={() => navigate("/app/sales/invoices")} className="flex items-start gap-2 py-2.5 cursor-pointer">
                          <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium">{overdueCount} facture{overdueCount > 1 ? "s" : ""} en retard</p>
                            <p className="text-xs text-muted-foreground">Cliquez pour gérer vos relances</p>
                          </div>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate("/app/sales/reminders")} className="text-xs text-primary justify-center">
                        Voir toutes les alertes →
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Menu utilisateur */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-primary/10">
                    <User className="h-4 w-4 text-primary" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {user && (
                    <>
                      <div className="px-2 py-1.5">
                        <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        <p className="text-[10px] text-primary font-medium mt-0.5">{user.orgName}</p>
                      </div>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={() => navigate("/app/settings/profile")}>
                    <Settings className="h-3.5 w-3.5 mr-2" />Paramètres
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/" target="_blank" rel="noopener noreferrer" className="flex items-center">
                      <Globe className="h-3.5 w-3.5 mr-2" />Voir le site
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="h-3.5 w-3.5 mr-2" />Se déconnecter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
