import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Globe, Plus, Search, CheckCircle, XCircle, RefreshCw, Zap, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { SearchBar } from "@/components/ui/search-bar";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { acmeApi } from "@/lib/api";
import type { AcmeProvider, AcmeOrder } from "@/lib/api/types";
import { extractContent } from "@/lib/api/types/pagination";

export default function AcmeManagement() {
  const [providers, setProviders] = useState<AcmeProvider[]>([]);
  const [orders, setOrders] = useState<AcmeOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Pagination state for providers
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("ASC");
  const [enabledFilter, setEnabledFilter] = useState<string>("all");

  // Form state for new provider
  const [formData, setFormData] = useState({
    name: "",
    type: "LETS_ENCRYPT_STAGING" as AcmeProvider["type"],
    description: "",
    isActive: true,
  });

  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize, searchQuery, sortBy, sortOrder, enabledFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch providers with pagination
      try {
        const providersData = await acmeApi.getProviders({
          page: currentPage,
          size: pageSize,
          search: searchQuery || undefined,
          enabled: enabledFilter !== "all" ? enabledFilter === "active" : undefined,
          sortBy,
          sortOrder,
        });
        console.log("Providers data:", providersData);
        
        // Handle paginated response
        if (providersData && typeof providersData === 'object' && 'content' in providersData) {
          const providersList = Array.isArray(providersData.content) ? providersData.content : [];
          setProviders(providersList);
          setTotalPages(providersData.totalPages || 0);
          setTotalElements(providersData.totalElements || 0);
        } else {
          const providersList = extractContent(providersData);
          setProviders(providersList);
          setTotalElements(providersList.length);
          setTotalPages(1);
        }
      } catch (error) {
        console.error("Failed to fetch providers:", error);
        toast.error("Failed to load ACME providers");
        setProviders([]);
        setTotalElements(0);
        setTotalPages(0);
      }

      // Fetch orders separately so failure doesn't block providers
      try {
        const ordersData = await acmeApi.getOrders();
        console.log("Orders data:", ordersData);
        setOrders(Array.isArray(ordersData) ? ordersData : []);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        // Don't show error toast for orders, just log it
        setOrders([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProvider = async () => {
    try {
      await acmeApi.createProvider(formData);
      toast.success("ACME provider created successfully");
      setDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error("Failed to create ACME provider");
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { className: string }> = {
      PENDING: { className: "bg-yellow-500/10 text-yellow-500" },
      PROCESSING: { className: "bg-blue-500/10 text-blue-500" },
      READY: { className: "bg-green-500/10 text-green-500" },
      VALID: { className: "bg-green-500/10 text-green-500" },
      INVALID: { className: "bg-red-500/10 text-red-500" },
      EXPIRED: { className: "bg-gray-500/10 text-gray-500" },
    };
    return <Badge className={config[status]?.className || ""}>{status}</Badge>;
  };

  const getProviderTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      LETS_ENCRYPT_PRODUCTION: "bg-green-500/10 text-green-500",
      LETS_ENCRYPT_STAGING: "bg-blue-500/10 text-blue-500",
      ZEROSSL: "bg-purple-500/10 text-purple-500",
      BUYPASS: "bg-orange-500/10 text-orange-500",
      CUSTOM: "bg-gray-500/10 text-gray-500",
    };
    return <Badge className={colors[type] || ""}>{type.replace(/_/g, " ")}</Badge>;
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">ACME Management</h1>
            <p className="text-muted-foreground">Manage ACME providers and certificate orders</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Provider
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add ACME Provider</DialogTitle>
                  <DialogDescription>Configure a new ACME certificate provider</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Provider Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Let's Encrypt Production"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Provider Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: AcmeProvider["type"]) =>
                        setFormData({ ...formData, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LETS_ENCRYPT_STAGING">Let's Encrypt (Staging)</SelectItem>
                        <SelectItem value="LETS_ENCRYPT_PRODUCTION">Let's Encrypt (Production)</SelectItem>
                        <SelectItem value="ZEROSSL">ZeroSSL</SelectItem>
                        <SelectItem value="BUYPASS">Buypass</SelectItem>
                        <SelectItem value="CUSTOM">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Optional description"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreateProvider}>Add Provider</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Providers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{totalElements}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Providers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-2xl font-bold">{providers.filter((p) => p.isActive).length}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">On current page</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-500" />
                <span className="text-2xl font-bold">{orders.length}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-yellow-500" />
                <span className="text-2xl font-bold">{orders.filter((o) => o.status === "PENDING").length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="providers">
          <TabsList>
            <TabsTrigger value="providers">Providers</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="providers" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4">
                  <div>
                    <CardTitle>ACME Providers ({totalElements} total)</CardTitle>
                    <CardDescription>Configured certificate authorities for automated issuance</CardDescription>
                  </div>
                  
                  {/* Search and Filters Row */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <SearchBar
                      value={searchQuery}
                      onChange={(value) => {
                        setSearchQuery(value);
                        setCurrentPage(0);
                      }}
                      placeholder="Search by name, description, URL..."
                    />
                    <Select value={enabledFilter} onValueChange={(value) => { setEnabledFilter(value); setCurrentPage(0); }}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active Only</SelectItem>
                        <SelectItem value="inactive">Inactive Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sorting Controls */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 border-t pt-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">Sort by:</span>
                      <Select
                        value={sortBy}
                        onValueChange={(value) => {
                          setSortBy(value);
                          setCurrentPage(0);
                        }}
                      >
                        <SelectTrigger className="w-[180px] h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="name">Name</SelectItem>
                          <SelectItem value="type">Type</SelectItem>
                          <SelectItem value="createdAt">Created Date</SelectItem>
                          <SelectItem value="updatedAt">Updated Date</SelectItem>
                          <SelectItem value="rateLimitPerWeek">Rate Limit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">Order:</span>
                      <div className="flex gap-1">
                        <Button
                          variant={sortOrder === "ASC" ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setSortOrder("ASC");
                            setCurrentPage(0);
                          }}
                          className="h-9"
                        >
                          <ArrowUp className="h-4 w-4 mr-1" />
                          Ascending
                        </Button>
                        <Button
                          variant={sortOrder === "DESC" ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setSortOrder("DESC");
                            setCurrentPage(0);
                          }}
                          className="h-9"
                        >
                          <ArrowDown className="h-4 w-4 mr-1" />
                          Descending
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Directory URL</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {providers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          No providers configured
                        </TableCell>
                      </TableRow>
                    ) : (
                      providers.map((provider) => (
                        <TableRow key={provider.id}>
                          <TableCell className="font-medium">{provider.name}</TableCell>
                          <TableCell>{getProviderTypeBadge(provider.type)}</TableCell>
                          <TableCell className="max-w-xs truncate font-mono text-sm">
                            {provider.directoryUrl}
                          </TableCell>
                          <TableCell>
                            <Badge className={provider.isActive ? "bg-green-500/10 text-green-500" : "bg-gray-500/10 text-gray-500"}>
                              {provider.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(provider.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                {totalPages > 0 && (
                  <DataTablePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    totalElements={totalElements}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={(size) => {
                      setPageSize(size);
                      setCurrentPage(0);
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Certificate Orders</CardTitle>
                <CardDescription>ACME certificate order history</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Domains</TableHead>
                      <TableHead>Challenge Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expires</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          No orders found
                        </TableCell>
                      </TableRow>
                    ) : (
                      orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-sm">{order.orderId}</TableCell>
                          <TableCell>{order.domains}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{order.challengeType}</Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                          <TableCell>{new Date(order.expiresAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
