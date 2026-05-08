import {
  LayoutDashboard, FileText, CreditCard, Users,
  Bot, BarChart3, Plug, ChevronDown, Zap,
  Receipt, RefreshCw, Send, Link2, FileCheck, Landmark,
  ArrowLeftRight, Tags, ShoppingCart, Percent, PiggyBank,
  GitBranch, Wallet,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

type NavItem = { title: string; url: string; icon: React.ElementType };

const facturationNav: NavItem[] = [
  { title: "Devis",                url: "/demo/sales/quotes",        icon: FileCheck  },
  { title: "Factures",             url: "/demo/sales/invoices",      icon: FileText   },
  { title: "Avoirs",               url: "/demo/sales/credit-notes",  icon: Receipt    },
  { title: "Factures récurrentes", url: "/demo/sales/recurring",     icon: RefreshCw  },
  { title: "Liens de paiement",    url: "/demo/sales/payment-links", icon: Link2      },
  { title: "Relances",             url: "/demo/sales/reminders",     icon: Send       },
  { title: "E-Facturation",        url: "/demo/sales/e-invoicing",   icon: Zap        },
  { title: "Templates",            url: "/demo/sales/templates",     icon: FileText   },
];

const tresorerieNav: NavItem[] = [
  { title: "Paiements",     url: "/demo/payments",                   icon: CreditCard     },
  { title: "Transactions",  url: "/demo/accounting/transactions",    icon: ArrowLeftRight },
  { title: "Banques",       url: "/demo/accounting/banks",           icon: Landmark       },
  { title: "Rapprochement", url: "/demo/accounting/reconciliation",  icon: GitBranch      },
];

const comptabiliteNav: NavItem[] = [
  { title: "Recettes",    url: "/demo/accounting/revenue-book",   icon: ShoppingCart },
  { title: "Dépenses",    url: "/demo/accounting/purchases-book", icon: Wallet       },
  { title: "Catégories",  url: "/demo/accounting/categories",     icon: Tags         },
  { title: "TVA",         url: "/demo/accounting/vat",            icon: Percent      },
  { title: "Cotisations", url: "/demo/accounting/social",         icon: PiggyBank    },
];

const clientsNav: NavItem[] = [
  { title: "Gestion Client", url: "/demo/customers", icon: Users },
];

const analyseNav: NavItem[] = [
  { title: "Rapports", url: "/demo/reports", icon: BarChart3 },
];

const autoNav: NavItem[] = [
  { title: "IA Assistant", url: "/demo/ai",           icon: Bot  },
  { title: "Intégrations", url: "/demo/integrations", icon: Plug },
];

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

export function DemoSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <Sidebar collapsible="icon" className="border-r-0">
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
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/demo/dashboard")}>
                  <NavLink to="/demo/dashboard">
                    <LayoutDashboard className="h-4 w-4" />
                    {!collapsed && <span>Dashboard</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <NavGroup label="Facturation"            items={facturationNav}  defaultPath="/demo/sales"      collapsed={collapsed} />
        <NavGroup label="Clients"                items={clientsNav}      defaultPath="/demo/customers"  collapsed={collapsed} />
        <NavGroup label="Paiements & Trésorerie" items={tresorerieNav}   defaultPath="/demo/payments"   collapsed={collapsed} />
        <NavGroup label="Comptabilité"           items={comptabiliteNav} defaultPath="/demo/accounting" collapsed={collapsed} />
        <NavGroup label="Analyse"                items={analyseNav}      defaultPath="/demo/reports"    collapsed={collapsed} />
        <NavGroup label="Automatisation"         items={autoNav}         defaultPath="/demo/ai"         collapsed={collapsed} />
      </SidebarContent>

      <SidebarFooter className="p-3">
        {!collapsed && (
          <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-0.5">Mode Démo</p>
            <p className="text-[10px] text-amber-600/70 dark:text-amber-400/70">Données fictives · Aucune sauvegarde</p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
