import { Bell, Search, ChevronDown, Building2, Shield } from "lucide-react";
import { useLocation } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useRole, type UserRole } from "@/contexts/RoleContext";
import { cn } from "@/lib/utils";

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Overview", subtitle: "" },
  "/marketplace": { title: "Data Catalog", subtitle: "" },
  "/upload": { title: "Submit Data", subtitle: "" },
  "/connectors": { title: "Connectors", subtitle: "" },
  "/institutions": { title: "Schools", subtitle: "" },
  "/settings": { title: "Settings", subtitle: "" },
};

const TopBar = () => {
  const location = useLocation();
  const page = pageMeta[location.pathname] || pageMeta["/"];
  const { user, role, setRole, isRegulator } = useRole();

  return (
    <header className="h-14 bg-card border-b border-border flex items-center px-4 gap-3 flex-shrink-0 z-10">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />

      <div className="w-px h-6 bg-border" />

      <div className="flex items-center gap-1.5 text-sm">
        <span className="text-muted-foreground text-xs">KHDA</span>
        <span className="text-muted-foreground text-xs">/</span>
        <span className="font-semibold text-foreground text-xs">{page.title}</span>
      </div>

      <div className="flex-1" />

      {/* Role Switcher */}
      <div className="flex items-center gap-1 p-1 bg-muted rounded-lg border border-border">
        {([
          { value: "regulator", label: "Inspector", icon: Shield },
          { value: "institution", label: "School", icon: Building2 },
        ] as { value: UserRole; label: string; icon: typeof Shield }[]).map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setRole(value)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200",
              role === value
                ? "bg-card shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            style={role === value && value === "regulator" ? { color: "hsl(340 56% 40%)" } : role === value && value === "institution" ? { color: "hsl(152 69% 31%)" } : {}}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative hidden lg:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search…"
          className="pl-8 pr-3 py-1.5 text-xs bg-muted rounded-lg border border-border w-48 focus:outline-none focus:ring-2 focus:ring-ring focus:w-64 transition-all"
        />
      </div>

      {/* Notifications */}
      <button className="relative w-8 h-8 rounded-lg hover:bg-muted transition-colors flex items-center justify-center">
        <Bell className="w-4 h-4 text-muted-foreground" />
        <span className="absolute top-1 right-1 w-2 h-2 rounded-full ring-1 ring-card" style={{ background: "hsl(340 56% 40%)" }} />
      </button>

      {/* User avatar */}
      <button className="flex items-center gap-2 pl-3 border-l border-border">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
          style={{ background: isRegulator ? "hsl(340 56% 40%)" : "hsl(152 69% 28%)" }}
        >
          {user.avatar}
        </div>
        <div className="hidden lg:block text-left">
          <div className="text-xs font-semibold text-foreground leading-tight">{user.name}</div>
          <div className="text-[10px] leading-tight flex items-center gap-1">
            <span
              className="font-semibold"
              style={{ color: isRegulator ? "hsl(340 56% 40%)" : "hsl(152 69% 31%)" }}
            >
              {user.badge}
            </span>
            <span className="text-muted-foreground">· {user.org}</span>
          </div>
        </div>
        <ChevronDown className="w-3 h-3 text-muted-foreground" />
      </button>
    </header>
  );
};

export default TopBar;
