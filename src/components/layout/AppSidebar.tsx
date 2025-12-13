import { Shield, LayoutDashboard, RefreshCw, BarChart3, LogOut, Building2, FileBadge, FolderKanban, Plus, Eye, FileText, ArrowLeftRight, ClipboardList, Users, UserPlus, UserCog, ShieldPlus, ShieldCheck } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Create CA", url: "/ca-management/create", icon: Building2 },
  { title: "View CA", url: "/ca-management/view", icon: Eye },
  { title: "Issue Certificate", url: "/certificate-management/issue", icon: FileBadge },
  { title: "Mutual Certificate", url: "/certificate-management/mutual", icon: ArrowLeftRight },
  { title: "Renewals", url: "/renewals", icon: RefreshCw },
  { title: "My Requests", url: "/workspace/my-request", icon: FolderKanban },
  { title: "Users", url: "/user-management/manage", icon: Users },
  { title: "Roles", url: "/user-management/manage-role", icon: ShieldCheck },
  { title: "Reports", url: "/reports", icon: BarChart3 },
];

export function AppSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <TooltipProvider delayDuration={0}>
      <Sidebar 
        collapsible="icon" 
        className="border-r-0 w-16 min-w-16"
      >
        <SidebarHeader className="flex items-center justify-center py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary">
            <Shield className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
        </SidebarHeader>

        <SidebarContent className="flex flex-col items-center px-2 py-2">
          <SidebarMenu className="gap-1">
            {navItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-xl text-sidebar-foreground/70 transition-all hover:bg-sidebar-accent hover:text-sidebar-foreground"
                        )}
                        activeClassName="bg-sidebar-accent text-sidebar-primary"
                      >
                        <item.icon className="h-5 w-5" />
                      </NavLink>
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-foreground text-background">
                    {item.title}
                  </TooltipContent>
                </Tooltip>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="flex items-center justify-center py-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleLogout}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-sidebar-foreground/70 transition-all hover:bg-sidebar-accent hover:text-sidebar-foreground"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-foreground text-background">
              Logout
            </TooltipContent>
          </Tooltip>
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  );
}