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
  KeyRound
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
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "View CA", url: "/ca-management/view", icon: Eye },
  { title: "Issue Certificate", url: "/certificate-management/issue", icon: FileKey },
  { title: "Mutual Certificate", url: "/certificate-management/mutual", icon: ShieldPlus },
  { title: "Renewals", url: "/renewals", icon: RefreshCw },
  { title: "Network Scan", url: "/network-scan", icon: Radar },
  { title: "My Requests", url: "/workspace/my-request", icon: Briefcase },
  { title: "Users", url: "/user-management/manage", icon: Users },
  { title: "Roles", url: "/user-management/manage-role", icon: UserCog },
  { title: "Reports", url: "/reports", icon: BarChart3 },
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
      <SidebarHeader className="flex items-center justify-between px-3 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary shrink-0">
            <Shield className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-sidebar-foreground">CertManager</span>
              <span className="text-xs text-sidebar-foreground/60">PKI Lifecycle</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="flex flex-col px-2 py-2">
        <SidebarMenu className="gap-1">
          {navItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink
                  to={item.url}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sidebar-foreground/70 transition-all hover:bg-sidebar-accent hover:text-sidebar-foreground",
                    isCollapsed && "justify-center px-0"
                  )}
                  activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="flex flex-col gap-2 px-2 py-4">
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sidebar-foreground/70 transition-all hover:bg-sidebar-accent hover:text-sidebar-foreground w-full",
            isCollapsed && "justify-center px-0"
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
        
        <button
          onClick={toggleSidebar}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sidebar-foreground/70 transition-all hover:bg-sidebar-accent hover:text-sidebar-foreground w-full",
            isCollapsed && "justify-center px-0"
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5 shrink-0" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5 shrink-0" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}