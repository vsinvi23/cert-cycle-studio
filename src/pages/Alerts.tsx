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
import { Loader2, Bell, Plus, Search, Mail, Webhook, MessageSquare, History } from "lucide-react";
import { toast } from "sonner";
import { alertsApi } from "@/lib/api";
import type { AlertConfiguration, AlertHistory } from "@/lib/api/types";

export default function Alerts() {
  const [alerts, setAlerts] = useState<AlertConfiguration[]>([]);
  const [history, setHistory] = useState<AlertHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"config" | "history">("config");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    alertType: "EXPIRATION" as const,
    enabled: true,
    thresholdDays: 30,
    emailRecipients: "",
    webhookUrl: "",
    slackWebhookUrl: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const historyData = await alertsApi.getHistory();
      setHistory(historyData || []);
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
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
    };
    return <Badge className={colors[type] || ""}>{type}</Badge>;
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
                      setFormData({ ...formData, alertType: value as "EXPIRATION" | "REVOCATION" | "ISSUANCE" | "COMPLIANCE" })
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{history.length}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Email Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-500" />
                <span className="text-2xl font-bold">
                  {history.filter(h => h.sentTo?.includes("@")).length}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Webhook Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Webhook className="h-5 w-5 text-purple-500" />
                <span className="text-2xl font-bold">
                  {history.filter(h => h.sentTo?.includes("http")).length}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Failed Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-red-500" />
                <span className="text-2xl font-bold">
                  {history.filter(h => h.deliveryStatus === "FAILED").length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <Button
            variant={activeTab === "config" ? "default" : "ghost"}
            onClick={() => setActiveTab("config")}
          >
            <Bell className="h-4 w-4 mr-2" />
            Configurations
          </Button>
          <Button
            variant={activeTab === "history" ? "default" : "ghost"}
            onClick={() => setActiveTab("history")}
          >
            <History className="h-4 w-4 mr-2" />
            Alert History
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search alerts..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {activeTab === "history" && (
          <Card>
            <CardHeader>
              <CardTitle>Alert History</CardTitle>
              <CardDescription>Recent alert deliveries and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Sent To</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Triggered At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No alert history found
                      </TableCell>
                    </TableRow>
                  ) : (
                    history.map((alert) => (
                      <TableRow key={alert.id}>
                        <TableCell>{getAlertTypeBadge(alert.alertType)}</TableCell>
                        <TableCell className="max-w-xs truncate">{alert.message}</TableCell>
                        <TableCell className="max-w-xs truncate">{alert.sentTo}</TableCell>
                        <TableCell>{getDeliveryStatusBadge(alert.deliveryStatus)}</TableCell>
                        <TableCell>{new Date(alert.triggeredAt).toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {activeTab === "config" && (
          <Card>
            <CardHeader>
              <CardTitle>Alert Configurations</CardTitle>
              <CardDescription>Manage your alert rules and delivery channels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Click "Create Alert" to set up your first alert configuration</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
