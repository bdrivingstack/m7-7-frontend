import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { FileText, CreditCard, FolderOpen, User, LogOut, Shield, Bell, Menu, X, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
const portalNav = [
  { label:"Tableau de bord", path:"/portal",           icon:Building2, exact:true },
  { label:"Factures",        path:"/portal/invoices",  icon:FileText },
  { label:"Devis",           path:"/portal/quotes",    icon:FileText },
  { label:"Paiements",       path:"/portal/payments",  icon:CreditCard },
  { label:"Documents",       path:"/portal/documents", icon:FolderOpen },
  { label:"Mon profil",      path:"/portal/profile",   icon:User },
];
const SESSION = { clientName:"Jean Dupont", company:"ACME Corp", email:"jean@acme.fr", initials:"JD", pendingInvoices:2, pendingQuotes:1 };
export default function PortalLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleLogout = () => navigate("/portal/login");
  return (
    <div className="min-h-screen bg-muted/20 flex flex-col">
      <header className="h-14 flex items-center justify-between border-b border-border bg-card/80 backdrop-blur-sm px-4 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button className="md:hidden text-muted-foreground hover:text-foreground" onClick={()=>setMobileOpen(!mobileOpen)}>
            {mobileOpen?<X className="h-5 w-5"/>:<Menu className="h-5 w-5"/>}
          </button>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg gradient-primary flex items-center justify-center shadow-glow"><Shield className="h-3.5 w-3.5 text-primary-foreground"/></div>
            <div className="hidden sm:block"><p className="font-display font-semibold text-sm leading-none">Espace Client</p><p className="text-[10px] text-muted-foreground">{SESSION.company}</p></div>
          </div>
          <nav className="hidden md:flex items-center gap-1 ml-4">
            {portalNav.map(item=>{
              const active = item.exact ? location.pathname==="/portal" : location.pathname.startsWith(item.path) && item.path!=="/portal";
              return (
                <NavLink key={item.path} to={item.path}
                  className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all relative",
                    active?"bg-primary/10 text-primary font-semibold":"text-muted-foreground hover:text-foreground hover:bg-muted/60")}>
                  <item.icon className="h-3.5 w-3.5"/>{item.label}
                  {item.label==="Factures"&&SESSION.pendingInvoices>0&&<span className="absolute -top-1 -right-1 h-4 w-4 rounded-full gradient-primary text-[9px] font-bold text-primary-foreground flex items-center justify-center">{SESSION.pendingInvoices}</span>}
                </NavLink>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative h-8 w-8"><Bell className="h-4 w-4"/><span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full gradient-primary text-[9px] font-bold text-primary-foreground flex items-center justify-center">{SESSION.pendingInvoices+SESSION.pendingQuotes}</span></Button>
          <div className="flex items-center gap-2 pl-2 border-l border-border">
            <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold">{SESSION.initials}</div>
            <div className="hidden sm:block text-xs"><p className="font-semibold leading-none">{SESSION.clientName}</p><p className="text-muted-foreground leading-none mt-0.5">{SESSION.email}</p></div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={handleLogout} title="Se déconnecter"><LogOut className="h-4 w-4"/></Button>
          </div>
        </div>
      </header>
      {mobileOpen&&<div className="md:hidden border-b border-border bg-card p-3 space-y-1">
        {portalNav.map(item=>(
          <NavLink key={item.path} to={item.path} onClick={()=>setMobileOpen(false)} className={({isActive})=>cn("flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all",isActive?"bg-primary/10 text-primary font-semibold":"text-muted-foreground hover:bg-muted/60")}>
            <item.icon className="h-4 w-4"/>{item.label}
          </NavLink>
        ))}
        <button onClick={handleLogout} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/5 w-full"><LogOut className="h-4 w-4"/>Se déconnecter</button>
      </div>}
      <main className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6"><Outlet/></main>
      <footer className="border-t border-border/40 py-3 px-6 text-center">
        <span className="flex items-center justify-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><Shield className="h-3 w-3"/>TLS 1.3</span>
          <span>·</span><span>Session expire après 8h</span>
          <span>·</span><a href="#" className="hover:underline">Confidentialité</a>
        </span>
      </footer>
    </div>
  );
}
