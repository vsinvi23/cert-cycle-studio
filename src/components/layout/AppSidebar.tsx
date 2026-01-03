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
  Home,
  LucideIcon,
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
import { useState, useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
};

type NavTab = {
  id: string;
  label: string;
  icon: LucideIcon;
  items: NavItem[];
};

const navTabs: NavTab[] = [
  {
    id: "main",
    label: "Main",
    icon: Home,
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "ACME", url: "/acme-management", icon: Zap },
      { title: "Alerts", url: "/alerts", icon: Bell },
      { title: "My Requests", url: "/workspace/my-request", icon: Briefcase },
    ],
  },
  {
    id: "certificates",
    label: "Certificates",
    icon: Award,
    items: [
      { title: "Certificates", url: "/ca-management/view", icon: FileKey },
      { title: "Issue Certificate", url: "/certificate-management/issue", icon: ShieldPlus },
      { title: "Renewals", url: "/renewals", icon: RefreshCw },
      { title: "Network Scan", url: "/network-scan", icon: Radar },
      { title: "Discovery", url: "/discovery", icon: Search },
    ],
  },
  {
    id: "management",
    label: "Management",
    icon: FolderCog,
    items: [
      { title: "Jobs", url: "/jobs", icon: Clock },
      { title: "Users", url: "/user-management/manage", icon: Users },
      { title: "Bulk Operations", url: "/bulk-operations", icon: Layers },
      { title: "API Keys", url: "/api-keys", icon: Key },
      { title: "Reports", url: "/reports", icon: BarChart3 },
      { title: "Audit Logs", url: "/audit-logs", icon: FileText },
    ],
  },
];

export function AppSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  
  // Determine active tab based on current route
  const getActiveTab = () => {
    for (const tab of navTabs) {
      if (tab.items.some(item => location.pathname.startsWith(item.url))) {
        return tab.id;
      }
    }
    return "main";
  };
  
  const [activeTab, setActiveTab] = useState(getActiveTab);
  
  // Update active tab when route changes
  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const currentTabItems = navTabs.find(tab => tab.id === activeTab)?.items || [];

  return (
    <Sidebar 
      collapsible="icon" 
      className={cn(
        "border-r-0 transition-all duration-300",
        isCollapsed ? "w-16 min-w-16" : "w-60 min-w-60"
      )}
    >
      <SidebarHeader className="flex flex-col gap-3 px-3 py-4 border-b border-sidebar-border">
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
        
        {/* Icon Tabs */}
        <div className={cn(
          "flex gap-1 p-1 rounded-lg bg-sidebar-accent/50",
          isCollapsed ? "flex-col" : "flex-row"
        )}>
          {navTabs.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <Tooltip key={tab.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm transition-all",
                      isCollapsed ? "w-full" : "flex-1",
                      isActive 
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm" 
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    )}
                  >
                    <TabIcon className="h-4 w-4 shrink-0" />
                    {!isCollapsed && <span className="truncate">{tab.label}</span>}
                  </button>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right">
                    {tab.label}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </div>
      </SidebarHeader>

      <SidebarContent className="flex flex-col px-2 py-4 overflow-y-auto">
        <SidebarMenu className="gap-1">
          {currentTabItems.map((item) => {
            const ItemIcon = item.icon;
            return (
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
                    <ItemIcon className="h-4 w-4 shrink-0" />
                    {!isCollapsed && <span className="truncate text-sm">{item.title}</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
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
