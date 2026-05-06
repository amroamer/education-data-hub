import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, ShoppingBag, Upload, Plug, Building2,
  GraduationCap, Shield, ChevronRight, Settings,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarHeader,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useRole } from "@/contexts/RoleContext";
import { cn } from "@/lib/utils";

const regulatorNav = [
  { to: "/", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/marketplace", label: "Data Catalog", icon: ShoppingBag },
  { to: "/institutions", label: "Schools", icon: Building2 },
  { to: "/connectors", label: "Connectors", icon: Plug },
  { to: "/settings", label: "Settings", icon: Settings },
];

const institutionNav = [
  { to: "/", label: "My Dashboard", icon: LayoutDashboard, end: true },
  { to: "/upload", label: "Submit Data", icon: Upload },
  { to: "/marketplace", label: "Browse Datasets", icon: ShoppingBag },
  { to: "/connectors", label: "My Connectors", icon: Plug },
  { to: "/settings", label: "Settings", icon: Settings },
];

const AppSidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { isRegulator } = useRole();
  const navItems = isRegulator ? regulatorNav : institutionNav;

  const isActive = (to: string, end?: boolean) =>
    end ? location.pathname === to : location.pathname === to || location.pathname.startsWith(to + "/");

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      {/* Logo */}
      <SidebarHeader className="sidebar-shell border-b border-sidebar-border px-3 py-4">
        <div className={cn("flex items-center gap-2.5 transition-all", collapsed && "justify-center")}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "hsl(340 56% 40%)" }}>
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="text-white text-[13px] font-semibold leading-tight whitespace-nowrap">KHDA</div>
              <div className="text-sidebar-foreground text-[10px] opacity-60 whitespace-nowrap">Data Platform</div>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* Nav */}
      <SidebarContent className="sidebar-shell py-3">
        {!collapsed && (
          <div className="text-[9px] font-semibold uppercase tracking-widest text-sidebar-foreground/40 px-4 mb-1">
            {isRegulator ? "Inspector Tools" : "School Workspace"}
          </div>
        )}
        <SidebarMenu className="px-2 space-y-0.5">
          {navItems.map(({ to, label, icon: Icon, end }) => {
            const active = isActive(to, end);
            return (
              <SidebarMenuItem key={to}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton asChild isActive={active}>
                      <NavLink
                        to={to}
                        end={end}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150 w-full",
                          active
                            ? "border-l-2"
                            : "text-sidebar-foreground hover:text-white",
                          collapsed && "justify-center px-2"
                        )}
                        style={active
                          ? { background: "hsl(214 55% 20%)", paddingLeft: collapsed ? undefined : "calc(0.75rem - 2px)", color: "hsl(340 56% 60%)", borderColor: "hsl(340 56% 40%)" }
                          : {}}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        {!collapsed && <span>{label}</span>}
                        {!collapsed && active && <ChevronRight className="w-3 h-3 ml-auto opacity-50" />}
                      </NavLink>
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right" className="text-xs">
                      {label}
                    </TooltipContent>
                  )}
                </Tooltip>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="sidebar-shell border-t border-sidebar-border px-3 py-3">
        <div className={cn("flex items-center gap-2 text-sidebar-foreground/50", collapsed && "justify-center")}>
          <Shield className="w-3.5 h-3.5 flex-shrink-0" />
          {!collapsed && <span className="text-[10px]">ISO 27001 · SOC 2</span>}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
