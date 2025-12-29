import { 
  Shield, 
  LayoutDashboard, 
  RefreshCw, 
  BarChart3, 
  LogOut, 
  FileKey, 
  Briefcase, 
  Eye, 
  ShieldPlus, 
  Users, 
  UserCog, 
  Radar,
  ChevronLeft,
  ChevronRight,
  Key,
  Bell,
  Clock,
  Activity,
  FileText,
  Search,
  Settings,
  FileCheck,
  Zap,
  Monitor,
  Layers
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const navSections = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Certificate Management",
    items: [
      { title: "View CA", url: "/ca-management/view", icon: Eye },
      { title: "Issue Certificate", url: "/certificate-management/issue", icon: FileKey },
      { title: "Mutual Certificate", url: "/certificate-management/mutual", icon: ShieldPlus },
      { title: "Renewals", url: "/renewals", icon: RefreshCw },
      { title: "Templates", url: "/certificate-templates", icon: Layers },
    ],
  },
  {
    title: "Discovery & Scan",
    items: [
      { title: "Network Scan", url: "/network-scan", icon: Radar },
      { title: "Discovery", url: "/discovery", icon: Search },
    ],
  },
  {
    title: "ACME",
    items: [
      { title: "ACME Management", url: "/acme-management", icon: Zap },
      { title: "ACME Monitoring", url: "/acme-monitoring", icon: Monitor },
    ],
  },
  {
    title: "Operations",
    items: [
      { title: "Bulk Operations", url: "/bulk-operations", icon: Layers },
      { title: "Background Jobs", url: "/jobs", icon: Clock },
      { title: "Alerts", url: "/alerts", icon: Bell },
    ],
  },
  {
    title: "Security & Access",
    items: [
      { title: "API Keys", url: "/api-keys", icon: Key },
      { title: "Sessions", url: "/sessions", icon: Activity },
      { title: "Rate Limits", url: "/rate-limits", icon: Clock },
      { title: "Users", url: "/user-management/manage", icon: Users },
      { title: "Roles", url: "/user-management/manage-role", icon: UserCog },
    ],
  },
  {
    title: "Reports & Audit",
    items: [
      { title: "Reports", url: "/reports", icon: BarChart3 },
      { title: "Compliance", url: "/compliance", icon: FileCheck },
      { title: "Audit Logs", url: "/audit-logs", icon: FileText },
    ],
  },
  {
    title: "Workspace",
    items: [
      { title: "My Requests", url: "/workspace/my-request", icon: Briefcase },
    ],
  },
];

export function AppSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Sidebar 
      collapsible="icon" 
      className={cn(
        "border-r-0 transition-all duration-300",
        isCollapsed ? "w-16 min-w-16" : "w-60 min-w-60"
      )}
    >
      <SidebarHeader className="flex items-center justify-between px-3 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary shrink-0">
            <Shield className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-sidebar-foreground">CertAxis</span>
              <span className="text-xs text-sidebar-foreground/60">PKI Lifecycle</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="flex flex-col px-2 py-2 overflow-y-auto">
        {navSections.map((section, sectionIdx) => (
          <div key={section.title} className="mb-2">
            {!isCollapsed && (
              <div className="px-3 py-2 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
                {section.title}
              </div>
            )}
            <SidebarMenu className="gap-0.5">
              {section.items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground/70 transition-all hover:bg-sidebar-accent hover:text-sidebar-foreground",
                        isCollapsed && "justify-center px-0"
                      )}
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!isCollapsed && <span className="truncate text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
            {sectionIdx < navSections.length - 1 && !isCollapsed && (
              <Separator className="my-2 opacity-50" />
            )}
          </div>
        ))}
      </SidebarContent>

      <SidebarFooter className="flex flex-col gap-1 px-2 py-3 border-t border-sidebar-border">
        <NavLink
          to="/settings"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground/70 transition-all hover:bg-sidebar-accent hover:text-sidebar-foreground",
            isCollapsed && "justify-center px-0"
          )}
          activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
        >
          <Settings className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span className="text-sm">Settings</span>}
        </NavLink>
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground/70 transition-all hover:bg-sidebar-accent hover:text-sidebar-foreground w-full",
            isCollapsed && "justify-center px-0"
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span className="text-sm">Logout</span>}
        </button>
        
        <button
          onClick={toggleSidebar}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground/70 transition-all hover:bg-sidebar-accent hover:text-sidebar-foreground w-full mt-1",
            isCollapsed && "justify-center px-0"
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 shrink-0" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 shrink-0" />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}