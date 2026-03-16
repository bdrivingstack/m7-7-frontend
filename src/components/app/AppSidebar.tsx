import {
  LayoutDashboard, FileText, CreditCard, Users,
  Bot, BarChart3, Plug, Settings, ChevronDown, Zap,
  Receipt, RefreshCw, Send, Link2, FileCheck, Landmark,
  ArrowLeftRight, Tags, ShoppingCart, Percent, PiggyBank,
  Building2, GitBranch, Wallet,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// ─── Définitions des items de navigation ─────────────────────────────────────

type NavItem = { title: string; url: string; icon: React.ElementType };

const facturationNav: NavItem[] = [
  { title: "Devis",                url: "/app/sales/quotes",        icon: FileCheck  },
  { title: "Factures",             url: "/app/sales/invoices",       icon: FileText   },
  { title: "Avoirs",               url: "/app/sales/credit-notes",   icon: Receipt    },
  { title: "Factures récurrentes", url: "/app/sales/recurring",      icon: RefreshCw  },
  { title: "Liens de paiement",    url: "/app/sales/payment-links",  icon: Link2      },
  { title: "Relances",             url: "/app/sales/reminders",      icon: Send       },
  { title: "E-Facturation",        url: "/app/sales/e-invoicing",    icon: Zap        },
  { title: "Templates",            url: "/app/sales/templates",      icon: FileText   },
];

const tresorerieNav: NavItem[] = [
  { title: "Paiements",     url: "/app/payments",                    icon: CreditCard     },
  { title: "Transactions",  url: "/app/accounting/transactions",     icon: ArrowLeftRight },
  { title: "Banques",       url: "/app/accounting/banks",            icon: Landmark       },
  { title: "Rapprochement", url: "/app/accounting/reconciliation",   icon: GitBranch      },
];

const comptabiliteNav: NavItem[] = [
  { title: "Recettes",    url: "/app/accounting/revenue-book",   icon: ShoppingCart },
  { title: "Dépenses",    url: "/app/accounting/purchases-book", icon: Wallet       },
  { title: "Catégories",  url: "/app/accounting/categories",     icon: Tags         },
  { title: "TVA",         url: "/app/accounting/vat",            icon: Percent      },
  { title: "Cotisations", url: "/app/accounting/social",         icon: PiggyBank    },
];

const clientsNav: NavItem[] = [
  { title: "Gestion Client", url: "/app/customers", icon: Users },
];

const analyseNav: NavItem[] = [
  { title: "Rapports", url: "/app/reports", icon: BarChart3 },
];

const autoNav: NavItem[] = [
  { title: "IA Assistant", url: "/app/ai",           icon: Bot  },
  { title: "Intégrations", url: "/app/integrations", icon: Plug },
];

// ─── Groupe collapsible réutilisable ─────────────────────────────────────────

function NavGroup({
  label, items, defaultPath, collapsed,
}: {
  label: string;
  items: NavItem[];
  defaultPath: string;
  collapsed: boolean;
}) {
  const location = useLocation();
  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <SidebarGroup>
      <Collapsible defaultOpen={location.pathname.includes(defaultPath)}>
        <CollapsibleTrigger className="w-full">
          <SidebarGroupLabel className="flex items-center justify-between cursor-pointer hover:text-sidebar-accent-foreground transition-colors">
            {!collapsed && <span>{label}</span>}
            {!collapsed && <ChevronDown className="h-3 w-3 opacity-60" />}
          </SidebarGroupLabel>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} size="sm">
                    <NavLink to={item.url}>
                      <item.icon className="h-3.5 w-3.5 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </Collapsible>
    </SidebarGroup>
  );
}

// ─── AppSidebar ───────────────────────────────────────────────────────────────

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <Sidebar collapsible="icon" className="border-r-0">

      {/* Logo */}
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0 shadow-glow">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-display font-bold text-sm text-sidebar-accent-foreground">M7Sept</span>
              <span className="text-[10px] text-sidebar-foreground/50 italic leading-tight">Cherchez, Trouvez et Optimisez.</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">

        {/* DASHBOARD */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/app/dashboard")}>
                  <NavLink to="/app/dashboard" end>
                    <LayoutDashboard className="h-4 w-4" />
                    {!collapsed && <span>Dashboard</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* FACTURATION */}
        <NavGroup label="Facturation"          items={facturationNav}  defaultPath="/app/sales"       collapsed={collapsed} />

        {/* PAIEMENTS & TRÉSORERIE */}
        <NavGroup label="Paiements & Trésorerie" items={tresorerieNav} defaultPath="/app/payments"    collapsed={collapsed} />

        {/* COMPTABILITÉ */}
        <NavGroup label="Comptabilité"         items={comptabiliteNav} defaultPath="/app/accounting"  collapsed={collapsed} />

        {/* CLIENTS */}
        <NavGroup label="Clients"              items={clientsNav}      defaultPath="/app/customers"   collapsed={collapsed} />

        {/* ANALYSE */}
        <NavGroup label="Analyse"              items={analyseNav}      defaultPath="/app/reports"     collapsed={collapsed} />

        {/* AUTOMATISATION */}
        <NavGroup label="Automatisation"       items={autoNav}         defaultPath="/app/ai"          collapsed={collapsed} />

        {/* PARAMÈTRES */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/app/settings")}>
                  <NavLink to="/app/settings/profile">
                    <Settings className="h-4 w-4" />
                    {!collapsed && <span>Paramètres</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>

      {/* Footer plan */}
      <SidebarFooter className="p-3">
        {!collapsed && (
          <div className="rounded-lg bg-sidebar-accent/50 p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-5 w-5 rounded-full gradient-primary flex items-center justify-center">
                <Building2 className="h-3 w-3 text-primary-foreground" />
              </div>
              <span className="text-xs font-medium text-sidebar-accent-foreground">Plan Pro</span>
            </div>
            <p className="text-[10px] text-sidebar-foreground/60">7/10 utilisateurs · 82% IA</p>
          </div>
        )}
      </SidebarFooter>

    </Sidebar>
  );
}
