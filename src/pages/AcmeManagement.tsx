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
import { Loader2, Globe, Plus, Search, CheckCircle, XCircle, RefreshCw, Zap } from "lucide-react";
import { toast } from "sonner";
import { acmeApi } from "@/lib/api";
import type { AcmeProvider, AcmeOrder } from "@/lib/api/types";

export default function AcmeManagement() {
  const [providers, setProviders] = useState<AcmeProvider[]>([]);
  const [orders, setOrders] = useState<AcmeOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state for new provider
  const [formData, setFormData] = useState({
    name: "",
    type: "LETS_ENCRYPT_STAGING" as AcmeProvider["type"],
    description: "",
    isActive: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [providersData, ordersData] = await Promise.all([
        acmeApi.getProviders(),
        acmeApi.getOrders(),
      ]);
      setProviders(providersData || []);
      setOrders(ordersData || []);
    } catch (error) {
      console.error("Failed to fetch ACME data:", error);
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
                <span className="text-2xl font-bold">{providers.length}</span>
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
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search providers..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>ACME Providers</CardTitle>
                <CardDescription>Configured certificate authorities for automated issuance</CardDescription>
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
