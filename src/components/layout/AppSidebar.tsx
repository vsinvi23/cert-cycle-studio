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
  ChevronDown,
  ChevronUp,
  Key,
  Bell,
  Clock,
  FileText,
  Search,
  Settings,
  Zap,
  Layers,
  Award,
  FolderCog,
  PanelLeftClose,
  PanelLeft,
  ShieldCheck,
  Activity,
  TrendingUp,
  CheckCircle2,
  Globe,
  Cpu,
  Lock,
  UserCog,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";

// Permission requirements for menu items
const PERMISSION_MAP: Record<string, string[]> = {
  "Certificates": ["CERT_READ"],
  "Issue Certificate": ["CERT_CREATE"],
  "Renewals": ["CERT_READ"],
  "Network Scan": ["CERT_READ"],
  "Users": ["USER_MANAGE"],
  "Roles": ["USER_MANAGE"],
  "Bulk Operations": ["CERT_CREATE", "CERT_UPDATE"],
  "API Keys": ["SYSTEM_CONFIG"],
  "Reports": ["CERT_READ"],
  "Audit Logs": ["AUDIT_READ"],
};
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "My Requests", url: "/workspace/my-request", icon: Briefcase },
];

// Certificate Management
const certificateItems = [
  { title: "Certificates", url: "/ca-management/view", icon: FileKey },
  { title: "Issue Certificate", url: "/certificate-management/issue", icon: ShieldPlus },
  { title: "Renewals", url: "/renewals", icon: RefreshCw },
  { title: "Certificate Templates", url: "/certificate-templates", icon: FileText },
];

// Discovery & Scanning
const discoveryItems = [
  { title: "Network Scan", url: "/network-scan", icon: Radar },
  { title: "Discovery", url: "/discovery", icon: Search },
];

// ACME & Integration
const acmeItems = [
  { title: "ACME Management", url: "/acme-management", icon: Zap },
  { title: "ACME Monitoring", url: "/acme-monitoring", icon: Activity },
];

// Operations & Jobs
const operationsItems = [
  { title: "Bulk Operations", url: "/bulk-operations", icon: Layers },
  { title: "Background Jobs", url: "/jobs", icon: Clock },
];

// Security & Access Control
const securityItems = [
  { title: "Users", url: "/user-management/manage", icon: Users },
  { title: "Roles", url: "/manage-role", icon: Shield },
  { title: "Permissions", url: "/permissions", icon: Lock },
  { title: "API Keys", url: "/api-keys", icon: Key },
  { title: "Sessions", url: "/sessions", icon: UserCog },
];

// Monitoring & Alerts
const monitoringItems = [
  { title: "Alerts", url: "/alerts", icon: Bell },
  { title: "Rate Limits", url: "/rate-limits", icon: TrendingUp },
];

// Reports & Compliance
const reportsItems = [
  { title: "Reports", url: "/reports", icon: BarChart3 },
  { title: "Compliance", url: "/compliance", icon: CheckCircle2 },
  { title: "Audit Logs", url: "/audit-logs", icon: FileText },
];

export function AppSidebar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  
  const isCertificateActive = certificateItems.some(item => location.pathname.startsWith(item.url));
  const isDiscoveryActive = discoveryItems.some(item => location.pathname.startsWith(item.url));
  const isAcmeActive = acmeItems.some(item => location.pathname.startsWith(item.url));
  const isOperationsActive = operationsItems.some(item => location.pathname.startsWith(item.url));
  const isSecurityActive = securityItems.some(item => location.pathname.startsWith(item.url));
  const isMonitoringActive = monitoringItems.some(item => location.pathname.startsWith(item.url));
  const isReportsActive = reportsItems.some(item => location.pathname.startsWith(item.url));
  
  const [certificatesOpen, setCertificatesOpen] = useState(isCertificateActive);
  const [discoveryOpen, setDiscoveryOpen] = useState(isDiscoveryActive);
  const [acmeOpen, setAcmeOpen] = useState(isAcmeActive);
  const [operationsOpen, setOperationsOpen] = useState(isOperationsActive);
  const [securityOpen, setSecurityOpen] = useState(isSecurityActive);
  const [monitoringOpen, setMonitoringOpen] = useState(isMonitoringActive);
  const [reportsOpen, setReportsOpen] = useState(isReportsActive);

  // Keep sections open when navigating to their items
  useEffect(() => {
    if (isCertificateActive) setCertificatesOpen(true);
    if (isDiscoveryActive) setDiscoveryOpen(true);
    if (isAcmeActive) setAcmeOpen(true);
    if (isOperationsActive) setOperationsOpen(true);
    if (isSecurityActive) setSecurityOpen(true);
    if (isMonitoringActive) setMonitoringOpen(true);
    if (isReportsActive) setReportsOpen(true);
  }, [isCertificateActive, isDiscoveryActive, isAcmeActive, isOperationsActive, isSecurityActive, isMonitoringActive, isReportsActive]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const renderNavItem = (item: { title: string; url: string; icon: React.ElementType }, isSubItem = false) => {
    const Icon = item.icon;
    
    if (isCollapsed) {
      return (
        <Tooltip key={item.title}>
          <TooltipTrigger asChild>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink
                  to={item.url}
                  className="flex items-center justify-center rounded-lg p-2.5 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  activeClassName="bg-sidebar-primary/10 text-sidebar-primary"
                >
                  <Icon className="h-5 w-5" />
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {item.title}
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild>
          <NavLink
            to={item.url}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
              isSubItem && "py-2 text-sm"
            )}
            activeClassName="bg-sidebar-primary/10 text-sidebar-primary font-medium"
          >
            <Icon className={cn("shrink-0", isSubItem ? "h-4 w-4" : "h-5 w-5")} />
            <span className="truncate">{item.title}</span>
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  const renderCollapsibleSection = (
    title: string,
    icon: React.ElementType,
    items: { title: string; url: string; icon: React.ElementType }[],
    isOpen: boolean,
    setIsOpen: (open: boolean) => void,
    isActive: boolean
  ) => {
    const Icon = icon;

    if (isCollapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => toggleSidebar()}
              className={cn(
                "flex w-full items-center justify-center rounded-lg p-2.5 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
                isActive && "bg-sidebar-primary/10 text-sidebar-primary"
              )}
            >
              <Icon className="h-5 w-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {title}
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
              isActive && "bg-sidebar-primary/10 text-sidebar-primary"
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="flex-1 truncate text-left font-medium">{title}</span>
            {isOpen ? (
              <ChevronUp className="h-4 w-4 shrink-0 text-sidebar-foreground/50" />
            ) : (
              <ChevronDown className="h-4 w-4 shrink-0 text-sidebar-foreground/50" />
            )}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
          <SidebarMenu className="mt-1 space-y-0.5 border-l-2 border-sidebar-border ml-5 pl-3">
            {items.map((item) => renderNavItem(item, true))}
          </SidebarMenu>
        </CollapsibleContent>
      </Collapsible>
    );
  };

  return (
    <Sidebar 
      collapsible="icon" 
      className={cn(
        "border-r border-sidebar-border bg-sidebar transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sidebar-primary to-sidebar-primary/80 shadow-lg">
            <Shield className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="truncate font-bold text-sidebar-foreground">CertAxis</span>
              <span className="truncate text-xs text-sidebar-foreground/60">PKI Lifecycle Manager</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="flex flex-col gap-2 overflow-y-auto p-3">
        {/* Main Navigation */}
        <SidebarMenu className="space-y-1">
          {navItems.map((item) => renderNavItem(item))}
        </SidebarMenu>

        {/* Certificate Management */}
        <div className="mt-2">
          {renderCollapsibleSection(
            "Certificates",
            Award,
            certificateItems,
            certificatesOpen,
            setCertificatesOpen,
            isCertificateActive
          )}
        </div>

        {/* Discovery & Scanning */}
        <div className="mt-1">
          {renderCollapsibleSection(
            "Discovery",
            Search,
            discoveryItems,
            discoveryOpen,
            setDiscoveryOpen,
            isDiscoveryActive
          )}
        </div>

        {/* ACME & Integration */}
        <div className="mt-1">
          {renderCollapsibleSection(
            "ACME",
            Zap,
            acmeItems,
            acmeOpen,
            setAcmeOpen,
            isAcmeActive
          )}
        </div>

        {/* Operations & Jobs */}
        <div className="mt-1">
          {renderCollapsibleSection(
            "Operations",
            Cpu,
            operationsItems,
            operationsOpen,
            setOperationsOpen,
            isOperationsActive
          )}
        </div>

        {/* Security & Access Control */}
        <div className="mt-1">
          {renderCollapsibleSection(
            "Security",
            Lock,
            securityItems,
            securityOpen,
            setSecurityOpen,
            isSecurityActive
          )}
        </div>

        {/* Monitoring & Alerts */}
        <div className="mt-1">
          {renderCollapsibleSection(
            "Monitoring",
            Activity,
            monitoringItems,
            monitoringOpen,
            setMonitoringOpen,
            isMonitoringActive
          )}
        </div>

        {/* Reports & Compliance */}
        <div className="mt-1">
          {renderCollapsibleSection(
            "Reports",
            BarChart3,
            reportsItems,
            reportsOpen,
            setReportsOpen,
            isReportsActive
          )}
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <SidebarMenu className="space-y-1">
          {/* Settings */}
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/settings"
                      className="flex items-center justify-center rounded-lg p-2.5 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
                      activeClassName="bg-sidebar-primary/10 text-sidebar-primary"
                    >
                      <Settings className="h-5 w-5" />
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium">
                Settings
              </TooltipContent>
            </Tooltip>
          ) : (
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink
                  to="/settings"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  activeClassName="bg-sidebar-primary/10 text-sidebar-primary font-medium"
                >
                  <Settings className="h-5 w-5 shrink-0" />
                  <span>Settings</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          {/* Logout */}
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <SidebarMenuItem>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center rounded-lg p-2.5 text-sidebar-foreground/70 transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </SidebarMenuItem>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium">
                Logout
              </TooltipContent>
            </Tooltip>
          ) : (
            <SidebarMenuItem>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground/70 transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-5 w-5 shrink-0" />
                <span>Logout</span>
              </button>
            </SidebarMenuItem>
          )}

          {/* Collapse Toggle */}
          {isCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <SidebarMenuItem>
                  <button
                    onClick={toggleSidebar}
                    className="flex w-full items-center justify-center rounded-lg p-2.5 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  >
                    <PanelLeft className="h-5 w-5" />
                  </button>
                </SidebarMenuItem>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium">
                Expand Sidebar
              </TooltipContent>
            </Tooltip>
          ) : (
            <SidebarMenuItem>
              <button
                onClick={toggleSidebar}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
              >
                <PanelLeftClose className="h-5 w-5 shrink-0" />
                <span>Collapse</span>
              </button>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
