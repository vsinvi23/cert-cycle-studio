import { useState, useEffect } from "react";
import { Search, Bell, Settings, SlidersHorizontal, X, Building2, ChevronDown, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { DEFAULT_TENANTS, type TenantConfig } from "@/lib/api/apiConfig";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

export function AppHeader() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [tenants, setTenants] = useState<TenantConfig[]>(DEFAULT_TENANTS);
  const [activeTenant, setActiveTenant] = useState<TenantConfig | null>(null);
  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    dateRange: "all",
  });

  // Initialize active tenant from localStorage or default
  useEffect(() => {
    const savedTenantId = localStorage.getItem("activeTenantId");
    if (savedTenantId) {
      const saved = tenants.find(t => t.id === savedTenantId);
      if (saved) {
        setActiveTenant(saved);
        return;
      }
    }
    setActiveTenant(tenants[0]);
  }, [tenants]);

  const handleTenantChange = (tenant: TenantConfig) => {
    setActiveTenant(tenant);
    localStorage.setItem("activeTenantId", tenant.id);
    toast({
      title: "Tenant Switched",
      description: `Now using ${tenant.name}`,
    });
  };
  
  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  const hasActiveFilters = filters.type !== "all" || filters.status !== "all" || filters.dateRange !== "all";

  const clearFilters = () => {
    setFilters({ type: "all", status: "all", dateRange: "all" });
    setSearchQuery("");
  };

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-card px-6">
      {/* Tenant Selector */}
      <div className="flex-shrink-0">
        {activeTenant && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-3 px-3 py-2 h-auto border-border bg-background hover:bg-secondary">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Building2 className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium text-foreground">{activeTenant.name}</p>
                  <p className="text-xs text-muted-foreground">{activeTenant.domain}</p>
                </div>
                <Badge variant="secondary" className="hidden md:flex text-xs ml-1">{activeTenant.plan}</Badge>
                <ChevronDown className="h-4 w-4 text-muted-foreground ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-80 bg-popover border border-border shadow-lg z-[100]" sideOffset={5}>
              <DropdownMenuLabel className="text-foreground">Switch Tenant</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {tenants.map((tenant) => (
                <DropdownMenuItem
                  key={tenant.id}
                  onClick={() => handleTenantChange(tenant)}
                  className="flex items-center justify-between cursor-pointer py-3 focus:bg-accent"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{tenant.name}</p>
                      <p className="text-xs text-muted-foreground">{tenant.domain}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{tenant.plan}</Badge>
                    {activeTenant && tenant.id === activeTenant.id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      
      {/* Centered search with advanced filters */}
      <div className="flex-1 max-w-2xl">
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search certificates, CAs, requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 bg-secondary border-0 focus-visible:ring-1 focus-visible:ring-primary"
            />
            {(searchQuery || hasActiveFilters) && (
              <button
                onClick={clearFilters}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <Popover open={advancedOpen} onOpenChange={setAdvancedOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className={hasActiveFilters ? "border-primary text-primary" : ""}
              >
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-popover" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Advanced Search</h4>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Clear all
                    </Button>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={filters.type}
                      onValueChange={(value) => setFilters({ ...filters, type: value })}
                    >
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="certificate">Certificates</SelectItem>
                        <SelectItem value="ca">Certificate Authorities</SelectItem>
                        <SelectItem value="renewal">Renewals</SelectItem>
                        <SelectItem value="mutual">Mutual Certificates</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={filters.status}
                      onValueChange={(value) => setFilters({ ...filters, status: value })}
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="valid">Valid</SelectItem>
                        <SelectItem value="expiring">Expiring Soon</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="revoked">Revoked</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="dateRange">Date Range</Label>
                    <Select
                      value={filters.dateRange}
                      onValueChange={(value) => setFilters({ ...filters, dateRange: value })}
                    >
                      <SelectTrigger id="dateRange">
                        <SelectValue placeholder="Select range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="7days">Last 7 Days</SelectItem>
                        <SelectItem value="30days">Last 30 Days</SelectItem>
                        <SelectItem value="90days">Last 90 Days</SelectItem>
                        <SelectItem value="year">Last Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button className="w-full" onClick={() => setAdvancedOpen(false)}>
                  Apply Filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      {/* Right side controls */}
      <div className="flex-1 flex items-center justify-end gap-2">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Settings className="h-5 w-5" />
        </Button>
        <div className="ml-2 flex items-center gap-3">
          <Avatar className="h-9 w-9 bg-primary">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-foreground">{user?.name || "User"}</p>
            <p className="text-xs text-muted-foreground">{user?.username || "user"}</p>
          </div>
        </div>
      </div>
    </header>
  );
}