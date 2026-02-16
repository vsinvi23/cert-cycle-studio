import { useState, useEffect } from "react";
import { Lock, Search, Loader2, Shield, Copy, CheckCircle2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { rolesApi } from "@/lib/api";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Permissions() {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("ASC");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const data = await rolesApi.getAllPermissions();
      setPermissions(data || []);
    } catch (error) {
      console.error("Failed to fetch permissions:", error);
      toast({
        title: "Error",
        description: "Failed to load permissions",
        variant: "destructive",
      });
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  // Extract category from permission (e.g., "CERT_READ" -> "CERT")
  const getCategory = (permission: string): string => {
    const parts = permission.split("_");
    return parts.length > 1 ? parts[0] : "OTHER";
  };

  // Get unique categories
  const categories = Array.from(new Set(permissions.map(getCategory))).sort();

  // Filter and sort permissions
  const filteredPermissions = permissions.filter((permission) => {
    const matchesSearch = permission.toLowerCase().includes(searchQuery.toLowerCase());
    const category = getCategory(permission);
    const matchesCategory = categoryFilter === "all" || category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const sortedPermissions = [...filteredPermissions].sort((a, b) => {
    if (sortOrder === "ASC") {
      return a.localeCompare(b);
    }
    return b.localeCompare(a);
  });

  // Pagination
  const totalPages = Math.ceil(sortedPermissions.length / pageSize);
  const startIndex = page * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedPermissions = sortedPermissions.slice(startIndex, endIndex);

  // Group permissions by category for display
  const groupedPermissions = paginatedPermissions.reduce((acc, permission) => {
    const category = getCategory(permission);
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(permission);
    return acc;
  }, {} as Record<string, string[]>);

  const copyToClipboard = (permission: string) => {
    navigator.clipboard.writeText(permission);
    toast({
      title: "Copied",
      description: `Permission "${permission}" copied to clipboard`,
    });
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      CERT: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      CA: "bg-purple-500/10 text-purple-600 border-purple-500/20",
      USER: "bg-green-500/10 text-green-600 border-green-500/20",
      ROLE: "bg-orange-500/10 text-orange-600 border-orange-500/20",
      REPORT: "bg-pink-500/10 text-pink-600 border-pink-500/20",
      AUDIT: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      SYSTEM: "bg-red-500/10 text-red-600 border-red-500/20",
      DISCOVERY: "bg-teal-500/10 text-teal-600 border-teal-500/20",
      ALERT: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    };
    return colors[category] || "bg-gray-500/10 text-gray-600 border-gray-500/20";
  };

  const getCategoryDescription = (category: string): string => {
    const descriptions: Record<string, string> = {
      CERT: "Certificate Management",
      CA: "Certificate Authority",
      USER: "User Management",
      ROLE: "Role Management",
      REPORT: "Reports & Analytics",
      AUDIT: "Audit & Compliance",
      SYSTEM: "System Configuration",
      DISCOVERY: "Certificate Discovery",
      ALERT: "Alerts & Notifications",
    };
    return descriptions[category] || "Other Permissions";
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Lock className="h-6 w-6" />
              Permissions
            </h1>
            <p className="text-muted-foreground">
              Manage system permissions and access control
            </p>
          </div>
          <Button onClick={fetchPermissions} variant="outline">
            <Shield className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
            <CardDescription>Search and filter permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search permissions..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(0);
                  }}
                />
              </div>

              <Select
                value={categoryFilter}
                onValueChange={(value) => {
                  setCategoryFilter(value);
                  setPage(0);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {getCategoryDescription(cat)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={sortOrder}
                onValueChange={(value) => setSortOrder(value as "ASC" | "DESC")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ASC">A-Z (Ascending)</SelectItem>
                  <SelectItem value="DESC">Z-A (Descending)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(searchQuery || categoryFilter !== "all") && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Showing {sortedPermissions.length} of {permissions.length} permissions
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setCategoryFilter("all");
                    setPage(0);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Permissions List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Available Permissions</CardTitle>
                <CardDescription>
                  {sortedPermissions.length} permissions available
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-lg px-3 py-1">
                Total: {permissions.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : sortedPermissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Lock className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No permissions found</p>
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  {Object.entries(groupedPermissions).map(([category, perms]) => (
                    <div key={category}>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge
                          variant="outline"
                          className={`${getCategoryColor(category)} border`}
                        >
                          {category}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {getCategoryDescription(category)}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {perms.map((permission) => (
                          <div
                            key={permission}
                            className="group relative flex items-center justify-between gap-2 rounded-lg border bg-card p-3 hover:bg-accent/50 transition-colors"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                              <code className="text-sm font-mono truncate">
                                {permission}
                              </code>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 shrink-0"
                              onClick={() => copyToClipboard(permission)}
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <DataTablePagination
                    currentPage={page}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    totalElements={sortedPermissions.length}
                    onPageChange={setPage}
                    onPageSizeChange={(size) => {
                      setPageSize(size);
                      setPage(0);
                    }}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Permission Categories Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Permission Categories</CardTitle>
            <CardDescription>Distribution of permissions by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {categories.map((category) => {
                const count = permissions.filter((p) => getCategory(p) === category).length;
                return (
                  <div
                    key={category}
                    className="flex flex-col items-center gap-2 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => {
                      setCategoryFilter(category);
                      setPage(0);
                    }}
                  >
                    <Badge
                      variant="outline"
                      className={`${getCategoryColor(category)} border text-xs`}
                    >
                      {category}
                    </Badge>
                    <span className="text-2xl font-bold">{count}</span>
                    <span className="text-xs text-muted-foreground text-center">
                      {getCategoryDescription(category)}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
