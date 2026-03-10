import {
  LayoutDashboard, FileText, CreditCard, Calculator, Users, Kanban,
  Bot, BarChart3, Plug, Settings, ChevronDown, Zap,
  Receipt, RefreshCw, Send, Link2, FileCheck, Landmark,
  ArrowLeftRight, Tags, BookOpen, ShoppingCart, Percent, PiggyBank,
  Building2, GitBranch,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton,
  SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const mainNav = [
  { title: "Dashboard", url: "/app/dashboard", icon: LayoutDashboard },
];

const salesNav = [
  { title: "Devis", url: "/app/sales/quotes", icon: FileCheck },
  { title: "Factures", url: "/app/sales/invoices", icon: FileText },
  { title: "Avoirs", url: "/app/sales/credit-notes", icon: Receipt },
  { title: "Récurrence", url: "/app/sales/recurring", icon: RefreshCw },
  { title: "Relances", url: "/app/sales/reminders", icon: Send },
  { title: "Liens de paiement", url: "/app/sales/payment-links", icon: Link2 },
  { title: "Templates", url: "/app/sales/templates", icon: FileText },
  { title: "E-Facture", url: "/app/sales/e-invoicing", icon: Zap },
];

const accountingNav = [
  { title: "Vue générale", url: "/app/accounting/overview", icon: BookOpen },
  { title: "Recettes", url: "/app/accounting/revenue-book", icon: ShoppingCart },
  { title: "Achats", url: "/app/accounting/purchases-book", icon: ShoppingCart },
  { title: "Banques", url: "/app/accounting/banks", icon: Landmark },
  { title: "Transactions", url: "/app/accounting/transactions", icon: ArrowLeftRight },
  { title: "Catégories", url: "/app/accounting/categories", icon: Tags },
  { title: "TVA", url: "/app/accounting/vat", icon: Percent },
  { title: "Cotisations", url: "/app/accounting/social", icon: PiggyBank },
  { title: "Rapprochement", url: "/app/accounting/reconciliation", icon: GitBranch },
];

const otherNav = [
  { title: "Paiements", url: "/app/payments", icon: CreditCard },
  { title: "Clients", url: "/app/customers", icon: Users },
  { title: "Productivité", url: "/app/productivity/board", icon: Kanban },
  { title: "IA Assistant", url: "/app/ai", icon: Bot },
  { title: "Rapports", url: "/app/reports", icon: BarChart3 },
  { title: "Intégrations", url: "/app/integrations", icon: Plug },
  { title: "Paramètres", url: "/app/settings/profile", icon: Settings },
];

export function AppSidebar() {
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
        {/* Main */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} end>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Ventes */}
        <SidebarGroup>
          <Collapsible defaultOpen={location.pathname.includes("/app/sales")}>
            <CollapsibleTrigger className="w-full">
              <SidebarGroupLabel className="flex items-center justify-between cursor-pointer hover:text-sidebar-accent-foreground">
                {!collapsed && "Ventes"}
                {!collapsed && <ChevronDown className="h-3 w-3" />}
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {salesNav.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive(item.url)} size="sm">
                        <NavLink to={item.url}>
                          <item.icon className="h-3.5 w-3.5" />
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

        {/* Comptabilité */}
        <SidebarGroup>
          <Collapsible defaultOpen={location.pathname.includes("/app/accounting")}>
            <CollapsibleTrigger className="w-full">
              <SidebarGroupLabel className="flex items-center justify-between cursor-pointer hover:text-sidebar-accent-foreground">
                {!collapsed && "Comptabilité"}
                {!collapsed && <ChevronDown className="h-3 w-3" />}
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {accountingNav.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive(item.url)} size="sm">
                        <NavLink to={item.url}>
                          <item.icon className="h-3.5 w-3.5" />
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

        {/* Other modules */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {otherNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

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
