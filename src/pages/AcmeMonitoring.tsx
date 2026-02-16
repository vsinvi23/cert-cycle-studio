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
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Webhook, Plus, Search, CheckCircle, XCircle, RefreshCw, Activity, TestTube } from "lucide-react";
import { toast } from "sonner";
import { acmeMonitoringApi } from "@/lib/api";
import type { AcmeWebhook, AcmeMetrics, AcmeDashboardSummary } from "@/lib/api/types";

export default function AcmeMonitoring() {
  const [webhooks, setWebhooks] = useState<AcmeWebhook[]>([]);
  const [metrics, setMetrics] = useState<AcmeMetrics | null>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Form state for new webhook
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    events: [] as string[],
    isActive: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [webhooksData, metricsData, dashboardData] = await Promise.all([
        acmeMonitoringApi.getAllWebhooks(),
        acmeMonitoringApi.getLatestMetrics(),
        acmeMonitoringApi.getDashboard(),
      ]);
      setWebhooks(webhooksData || []);
      
      // Handle metrics response - API returns array, we want first item
      if (Array.isArray(metricsData) && metricsData.length > 0) {
        setMetrics(metricsData[0]);
      } else {
        setMetrics(null);
      }
      
      setDashboard(dashboardData);
    } catch (error) {
      console.error("Failed to fetch ACME monitoring data:", error);
    } finally {
      setLoading(false);
    }
  };

  const availableEvents = [
    "ORDER_CREATED",
    "ORDER_COMPLETED",
    "ORDER_FAILED",
    "CHALLENGE_VALIDATED",
    "CERTIFICATE_ISSUED",
  ];

  const handleCreateWebhook = async () => {
    if (!formData.url) {
      toast.error("Webhook URL is required");
      return;
    }

    try {
      await acmeMonitoringApi.createWebhook(formData);
      toast.success("Webhook created successfully");
      setDialogOpen(false);
      setFormData({ name: "", url: "", events: [], isActive: true });
      fetchData();
    } catch (error) {
      toast.error("Failed to create webhook");
    }
  };

  const toggleEvent = (event: string) => {
    setFormData((prev) => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter((e) => e !== event)
        : [...prev.events, event],
    }));
  };

  const handleTestWebhook = async (id: number) => {
    try {
      const result = await acmeMonitoringApi.testWebhook(id);
      if (result.success) {
        toast.success("Webhook test successful");
      } else {
        toast.error(`Webhook test failed: ${result.message}`);
      }
    } catch (error) {
      toast.error("Failed to test webhook");
    }
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
            <h1 className="text-3xl font-bold">ACME Monitoring</h1>
            <p className="text-muted-foreground">Monitor ACME operations and configure webhooks</p>
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
                  Add Webhook
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Webhook</DialogTitle>
                  <DialogDescription>Configure a new webhook for ACME events</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Webhook Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Slack Notifications"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="url">Webhook URL *</Label>
                    <Input
                      id="url"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      placeholder="https://hooks.example.com/acme"
                      required
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label>Events to Monitor</Label>
                    <div className="space-y-2">
                      {availableEvents.map((event) => (
                        <div key={event} className="flex items-center space-x-2">
                          <Checkbox
                            id={event}
                            checked={formData.events.includes(event)}
                            onCheckedChange={() => toggleEvent(event)}
                          />
                          <Label
                            htmlFor={event}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {event.replace(/_/g, " ")}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {formData.events.length === 0 && (
                      <p className="text-xs text-muted-foreground">
                        Select at least one event to monitor
                      </p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreateWebhook}>Add Webhook</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders (Month)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{dashboard?.current_month?.total_orders_created || 0}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Health Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-2xl font-bold">{(dashboard?.health_score || 0).toFixed(1)}%</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Webhooks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Webhook className="h-5 w-5 text-blue-500" />
                <span className="text-2xl font-bold">{webhooks.filter((w) => w.isActive).length}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Low Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-yellow-500" />
                <span className="text-2xl font-bold">{dashboard?.low_performance_count || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Metrics Summary */}
        {metrics && (
          <Card>
            <CardHeader>
              <CardTitle>Latest Metrics</CardTitle>
              <CardDescription>ACME operation statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Orders Created</p>
                  <p className="text-2xl font-bold">{metrics.ordersCreated}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Orders Succeeded</p>
                  <p className="text-2xl font-bold text-green-500">{metrics.ordersSucceeded}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Orders Failed</p>
                  <p className="text-2xl font-bold text-red-500">{metrics.ordersFailed}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Avg Issuance Time</p>
                  <p className="text-2xl font-bold">{metrics.avgIssuanceTime?.toFixed(1)}s</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="webhooks">
          <TabsList>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="challenges">Challenge Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="webhooks" className="space-y-4">
            <div className="flex gap-4 items-center">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search webhooks..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={activeFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveFilter('all')}
                >
                  All
                </Button>
                <Button
                  variant={activeFilter === 'active' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveFilter('active')}
                >
                  Active
                </Button>
                <Button
                  variant={activeFilter === 'inactive' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveFilter('inactive')}
                >
                  Inactive
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Configured Webhooks</CardTitle>
                <CardDescription>Manage webhook endpoints for ACME notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead>Events</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Failures</TableHead>
                      <TableHead>Last Triggered</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      // Filter webhooks based on search and status
                      const filtered = webhooks.filter((webhook) => {
                        const eventsStr = Array.isArray(webhook.events)
                          ? webhook.events.join(', ')
                          : webhook.events || '';
                        const matchesSearch = !searchQuery || 
                          webhook.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          webhook.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          eventsStr.toLowerCase().includes(searchQuery.toLowerCase());
                        
                        const matchesStatus = 
                          activeFilter === 'all' ||
                          (activeFilter === 'active' && webhook.isActive) ||
                          (activeFilter === 'inactive' && !webhook.isActive);
                        
                        return matchesSearch && matchesStatus;
                      });

                      if (filtered.length === 0) {
                        return (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                              No webhooks found
                            </TableCell>
                          </TableRow>
                        );
                      }

                      return filtered.map((webhook) => {
                        const events = Array.isArray(webhook.events) ? webhook.events : [];
                        
                        return (
                          <TableRow key={webhook.id}>
                            <TableCell className="font-medium">{webhook.name || 'Unnamed Webhook'}</TableCell>
                            <TableCell className="max-w-xs truncate font-mono text-sm">{webhook.url}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {events.length > 0 ? (
                                  events.map((event) => (
                                    <Badge key={event} variant="outline" className="text-xs">
                                      {event.replace(/_/g, ' ')}
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-xs text-muted-foreground">No events</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={webhook.isActive ? "bg-green-500/10 text-green-500" : "bg-gray-500/10 text-gray-500"}>
                                {webhook.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {webhook.failureCount > 0 ? (
                                <Badge variant="destructive">{webhook.failureCount}</Badge>
                              ) : (
                                <span className="text-muted-foreground">0</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {webhook.lastTriggered
                                ? new Date(webhook.lastTriggered).toLocaleString()
                                : "Never"}
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleTestWebhook(webhook.id)}
                              >
                                <TestTube className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      });
                    })()}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="challenges" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Challenge Statistics</CardTitle>
                <CardDescription>Breakdown of challenge types and success rates</CardDescription>
              </CardHeader>
              <CardContent>
                {metrics ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">HTTP-01 Challenges</p>
                      <p className="text-3xl font-bold">{metrics.http01Challenges}</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">DNS-01 Challenges</p>
                      <p className="text-3xl font-bold">{metrics.dns01Challenges}</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">TLS-ALPN-01 Challenges</p>
                      <p className="text-3xl font-bold">{metrics.tlsAlpn01Challenges}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No metrics available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
