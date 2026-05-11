import {
  LayoutDashboard, Building2, Users, CreditCard, HeadphonesIcon,
  AlertTriangle, FileSearch, Plug, Flag, Bot, Shield, Scale,
  Zap, Activity, Settings, Receipt, Tag,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, useSidebar,
} from "@/components/ui/sidebar";

const adminNav = [
  { title: "Vue globale", url: "/admin", icon: LayoutDashboard },
  { title: "Organisations", url: "/admin/organizations", icon: Building2 },
  { title: "Utilisateurs", url: "/admin/users", icon: Users },
  { title: "Plans", url: "/admin/plans", icon: CreditCard },
  { title: "Facturation SaaS", url: "/admin/billing", icon: Receipt },
  { title: "Support", url: "/admin/support", icon: HeadphonesIcon },
  { title: "Incidents", url: "/admin/incidents", icon: AlertTriangle },
  { title: "Audit logs", url: "/admin/audit-logs", icon: FileSearch },
  { title: "Intégrations", url: "/admin/integrations", icon: Plug },
  { title: "Feature flags", url: "/admin/feature-flags", icon: Flag },
  { title: "IA & Quotas", url: "/admin/ai", icon: Bot },
  { title: "Sécurité", url: "/admin/security", icon: Shield },
  { title: "Conformité", url: "/admin/compliance", icon: Scale },
  { title: "E-Facture", url: "/admin/e-invoicing", icon: Zap },
  { title: "Monitoring", url: "/admin/monitoring", icon: Activity },
  { title: "Promotions", url: "/admin/promotions", icon: Tag },
  { title: "Paramètres", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const closeMobile = () => { if (isMobile) setOpenMobile(false); };

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-destructive/20 flex items-center justify-center flex-shrink-0">
            <Shield className="h-4 w-4 text-destructive" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-display font-bold text-sm text-sidebar-accent-foreground">LE BELVEDERE Admin</span>
              <span className="text-[10px] text-sidebar-foreground/60">Backoffice</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.url === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(item.url)}
                  >
                    <NavLink to={item.url} end={item.url === "/admin"} onClick={closeMobile}>
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
    </Sidebar>
  );
}
