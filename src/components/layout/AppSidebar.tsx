import { 
  Shield, 
  LayoutDashboard, 
  RefreshCw, 
  BarChart3, 
  LogOut, 
  FileKey, 
  Briefcase, 
  ShieldPlus, 
  Users, 
  Radar,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Key,
  Bell,
  Clock,
  FileText,
  Search,
  Settings,
  Zap,
  Layers,
  FolderCog,
  Award,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
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
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "ACME", url: "/acme-management", icon: Zap },
  { title: "Alerts", url: "/alerts", icon: Bell },
  { title: "My Requests", url: "/workspace/my-request", icon: Briefcase },
];

const certificateItems = [
  { title: "Certificates", url: "/ca-management/view", icon: FileKey },
  { title: "Issue Certificate", url: "/certificate-management/issue", icon: ShieldPlus },
  { title: "Renewals", url: "/renewals", icon: RefreshCw },
  { title: "Network Scan", url: "/network-scan", icon: Radar },
  { title: "Discovery", url: "/discovery", icon: Search },
];

const managementItems = [
  { title: "Jobs", url: "/jobs", icon: Clock },
  { title: "Users", url: "/user-management/manage", icon: Users },
  { title: "Bulk Operations", url: "/bulk-operations", icon: Layers },
  { title: "API Keys", url: "/api-keys", icon: Key },
  { title: "Reports", url: "/reports", icon: BarChart3 },
  { title: "Audit Logs", url: "/audit-logs", icon: FileText },
];

export function AppSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  
  const isCertificateActive = certificateItems.some(item => location.pathname.startsWith(item.url));
  const isManagementActive = managementItems.some(item => location.pathname.startsWith(item.url));
  const [certificateOpen, setCertificateOpen] = useState(isCertificateActive);
  const [managementOpen, setManagementOpen] = useState(isManagementActive);

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

      <SidebarContent className="flex flex-col px-2 py-4 overflow-y-auto">
        <SidebarMenu className="gap-1">
          {navItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink
                  to={item.url}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground/70 transition-all hover:bg-sidebar-accent hover:text-sidebar-foreground",
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

        {/* Certificate Section */}
        <Collapsible open={certificateOpen} onOpenChange={setCertificateOpen} className="mt-4">
          <CollapsibleTrigger
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground/70 transition-all hover:bg-sidebar-accent hover:text-sidebar-foreground w-full",
              isCollapsed && "justify-center px-0",
              isCertificateActive && "text-sidebar-primary font-medium"
            )}
          >
            <Award className="h-4 w-4 shrink-0" />
            {!isCollapsed && (
              <>
                <span className="truncate text-sm flex-1 text-left">Certificates</span>
                <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", certificateOpen && "rotate-180")} />
              </>
            )}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenu className="gap-1 mt-1 ml-2">
              {certificateItems.map((item) => (
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
          </CollapsibleContent>
        </Collapsible>

        {/* Management Section */}
        <Collapsible open={managementOpen} onOpenChange={setManagementOpen} className="mt-2">
          <CollapsibleTrigger
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground/70 transition-all hover:bg-sidebar-accent hover:text-sidebar-foreground w-full",
              isCollapsed && "justify-center px-0",
              isManagementActive && "text-sidebar-primary font-medium"
            )}
          >
            <FolderCog className="h-4 w-4 shrink-0" />
            {!isCollapsed && (
              <>
                <span className="truncate text-sm flex-1 text-left">Management</span>
                <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", managementOpen && "rotate-180")} />
              </>
            )}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenu className="gap-1 mt-1 ml-2">
              {managementItems.map((item) => (
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
          </CollapsibleContent>
        </Collapsible>
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