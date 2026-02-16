import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Bell, Plus, Search, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { SearchBar } from "@/components/ui/search-bar";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { alertsApi } from "@/lib/api";
import type { AlertConfiguration } from "@/lib/api/types";
import { extractContent } from "@/lib/api/types/pagination";

export default function Alerts() {
  const [alerts, setAlerts] = useState<AlertConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [searchQuery, setSearchQuery] = useState("");
  const [enabledFilter, setEnabledFilter] = useState<string>("all");

  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    alertType: "EXPIRATION" | "REVOCATION" | "ISSUANCE" | "COMPLIANCE" | "RENEWAL" | "SECURITY";
    enabled: boolean;
    thresholdDays: number;
    emailRecipients: string;
    webhookUrl: string;
    slackWebhookUrl: string;
  }>({
    name: "",
    alertType: "EXPIRATION",
    enabled: true,
    thresholdDays: 30,
    emailRecipients: "",
    webhookUrl: "",
    slackWebhookUrl: "",
  });

  useEffect(() => {
    fetchData();
  }, [
    page, pageSize, searchQuery, sortBy, sortOrder, enabledFilter
  ]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch alert configurations with pagination
      const configData = await alertsApi.getConfigurations({
        page: page,
        size: pageSize,
        search: searchQuery || undefined,
        sortBy: sortBy,
        sortOrder: sortOrder,
      });
      
      if (configData && typeof configData === 'object' && 'content' in configData) {
        setAlerts(Array.isArray(configData.content) ? configData.content : []);
        setTotalPages(configData.totalPages || 0);
        setTotalElements(configData.totalElements || 0);
      } else {
        const alertsList = extractContent(configData);
        setAlerts(alertsList);
        setTotalElements(alertsList.length);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
      setAlerts([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlert = async () => {
    try {
      await alertsApi.configure(formData);
      toast.success("Alert configuration created successfully");
      setDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error("Failed to create alert configuration");
    }
  };

  const getAlertTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      EXPIRATION: "bg-orange-500/10 text-orange-500",
      REVOCATION: "bg-red-500/10 text-red-500",
      ISSUANCE: "bg-green-500/10 text-green-500",
      COMPLIANCE: "bg-blue-500/10 text-blue-500",
      RENEWAL: "bg-purple-500/10 text-purple-500",
      SECURITY: "bg-pink-500/10 text-pink-500",
    };
    return <Badge className={colors[type] || ""}>{type}</Badge>;
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
      CRITICAL: "destructive",
      HIGH: "destructive",
      MEDIUM: "default",
      LOW: "secondary",
      INFO: "outline",
    };
    const colors: Record<string, string> = {
      CRITICAL: "bg-red-600",
      HIGH: "bg-orange-500",
      MEDIUM: "bg-yellow-500",
      LOW: "bg-blue-500",
      INFO: "bg-gray-500",
    };
    return <Badge variant={variants[severity]} className={colors[severity]}>{severity}</Badge>;
  };

  const getDeliveryStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      DELIVERED: "bg-green-500/10 text-green-500",
      PENDING: "bg-yellow-500/10 text-yellow-500",
      FAILED: "bg-red-500/10 text-red-500",
    };
    return <Badge className={colors[status] || ""}>{status}</Badge>;
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
            <h1 className="text-3xl font-bold">Alerts & Notifications</h1>
            <p className="text-muted-foreground">Configure and monitor certificate alerts</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Alert
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Alert Configuration</DialogTitle>
                <DialogDescription>Set up a new alert for certificate events</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Alert Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Certificate Expiration Warning"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="alertType">Alert Type</Label>
                  <Select
                    value={formData.alertType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, alertType: value as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EXPIRATION">Expiration</SelectItem>
                      <SelectItem value="REVOCATION">Revocation</SelectItem>
                      <SelectItem value="ISSUANCE">Issuance</SelectItem>
                      <SelectItem value="COMPLIANCE">Compliance</SelectItem>
                      <SelectItem value="RENEWAL">Renewal</SelectItem>
                      <SelectItem value="SECURITY">Security</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="threshold">Threshold (Days)</Label>
                  <Input
                    id="threshold"
                    type="number"
                    value={formData.thresholdDays}
                    onChange={(e) => setFormData({ ...formData, thresholdDays: parseInt(e.target.value) })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Recipients</Label>
                  <Input
                    id="email"
                    value={formData.emailRecipients}
                    onChange={(e) => setFormData({ ...formData, emailRecipients: e.target.value })}
                    placeholder="admin@example.com, ops@example.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="webhook">Webhook URL</Label>
                  <Input
                    id="webhook"
                    value={formData.webhookUrl}
                    onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
                    placeholder="https://hooks.example.com/alerts"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.enabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
                  />
                  <Label>Enabled</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateAlert}>Create Alert</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Card */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Configurations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{totalElements}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-green-500" />
                <span className="text-2xl font-bold">
                  {alerts.filter(a => a.enabled).length}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Expiration Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-orange-500" />
                <span className="text-2xl font-bold">
                  {alerts.filter(a => a.alertType === "EXPIRATION").length}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Security Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-red-500" />
                <span className="text-2xl font-bold">
                  {alerts.filter(a => a.alertType === "SECURITY" || a.alertType === "REVOCATION").length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alert Configurations */}
        <Card>
            <CardHeader>
              <div className="flex flex-col gap-4">
                <div>
                  <CardTitle>Alert Configurations ({totalElements} total)</CardTitle>
                  <CardDescription>Manage your alert rules and delivery channels</CardDescription>
                </div>
                
                {/* Search and Filters Row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <SearchBar
                    value={searchQuery}
                    onChange={(value) => {
                      setSearchQuery(value);
                      setPage(0);
                    }}
                    placeholder="Search by name, type..."
                  />
                  <Select value={enabledFilter} onValueChange={(value) => { setEnabledFilter(value); setPage(0); }}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="enabled">Enabled Only</SelectItem>
                      <SelectItem value="disabled">Disabled Only</SelectItem>
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
                        setPage(0);
                      }}
                    >
                      <SelectTrigger className="w-[180px] h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="alertType">Alert Type</SelectItem>
                        <SelectItem value="enabled">Status</SelectItem>
                        <SelectItem value="createdAt">Created Date</SelectItem>
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
                          setPage(0);
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
                          setPage(0);
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
              {alerts.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Click "Create Alert" to set up your first alert configuration</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Threshold</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alerts.map((alert) => (
                      <TableRow key={alert.id}>
                        <TableCell className="font-medium">{alert.name}</TableCell>
                        <TableCell>{getAlertTypeBadge(alert.alertType)}</TableCell>
                        <TableCell>{alert.thresholdDays ? `${alert.thresholdDays} days` : "-"}</TableCell>
                        <TableCell className="max-w-xs truncate">{alert.emailRecipients || "-"}</TableCell>
                        <TableCell>
                          <Badge className={alert.enabled ? "bg-green-500/10 text-green-500" : "bg-gray-500/10 text-gray-500"}>
                            {alert.enabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(alert.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              {alerts.length > 0 && totalPages > 0 && (
                <DataTablePagination
                  currentPage={page}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  totalElements={totalElements}
                  onPageChange={setPage}
                  onPageSizeChange={(size) => {
                    setPageSize(size);
                    setPage(0);
                  }}
                />
              )}
            </CardContent>
          </Card>
      </div>
    </AppLayout>
  );
}
