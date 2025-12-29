import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Plus, Search, Cloud, Server, Folder, Network, Play, Pause, RefreshCw, Calendar, CheckCircle, XCircle, Clock } from "lucide-react";
import type { DiscoveryConfiguration, DiscoveryResult } from "@/lib/api/types";

export default function Discovery() {
  const [configurations, setConfigurations] = useState<DiscoveryConfiguration[]>([]);
  const [results, setResults] = useState<DiscoveryResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("configurations");
  const [formData, setFormData] = useState({
    name: "",
    discoveryType: "LDAP" as "LDAP" | "CLOUD" | "FILESYSTEM" | "NETWORK",
    schedule: "0 0 * * *",
    enabled: true,
    configuration: {} as Record<string, string>,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Mock configurations
      const mockConfigs: DiscoveryConfiguration[] = [
        {
          id: 1,
          name: "AWS Certificate Discovery",
          discoveryType: "CLOUD",
          configuration: { provider: "AWS", regions: "us-east-1,us-west-2" },
          schedule: "0 2 * * *",
          enabled: true,
          lastRun: "2025-12-28T02:00:00Z",
          nextRun: "2025-12-29T02:00:00Z",
          createdAt: "2025-01-15T10:00:00Z",
        },
        {
          id: 2,
          name: "Active Directory Scan",
          discoveryType: "LDAP",
          configuration: { server: "ldap.company.com", baseDN: "dc=company,dc=com" },
          schedule: "0 3 * * *",
          enabled: true,
          lastRun: "2025-12-28T03:00:00Z",
          nextRun: "2025-12-29T03:00:00Z",
          createdAt: "2025-02-01T09:00:00Z",
        },
        {
          id: 3,
          name: "Server Filesystem Scan",
          discoveryType: "FILESYSTEM",
          configuration: { paths: "/etc/ssl,/opt/certificates", extensions: ".pem,.crt,.pfx" },
          schedule: "0 4 * * *",
          enabled: false,
          lastRun: "2025-12-25T04:00:00Z",
          createdAt: "2025-03-01T14:00:00Z",
        },
      ];

      const mockResults: DiscoveryResult[] = [
        {
          id: 1,
          configurationId: 1,
          certificatesFound: 45,
          newCertificates: 12,
          existingCertificates: 33,
          status: "COMPLETED",
          startedAt: "2025-12-28T02:00:00Z",
          completedAt: "2025-12-28T02:15:00Z",
          details: [],
        },
        {
          id: 2,
          configurationId: 2,
          certificatesFound: 78,
          newCertificates: 5,
          existingCertificates: 73,
          status: "COMPLETED",
          startedAt: "2025-12-28T03:00:00Z",
          completedAt: "2025-12-28T03:08:00Z",
          details: [],
        },
        {
          id: 3,
          configurationId: 1,
          certificatesFound: 0,
          newCertificates: 0,
          existingCertificates: 0,
          status: "RUNNING",
          startedAt: "2025-12-29T02:00:00Z",
          details: [],
        },
      ];

      setConfigurations(mockConfigs);
      setResults(mockResults);
    } catch (error) {
      toast.error("Failed to fetch discovery data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConfiguration = async () => {
    if (!formData.name) {
      toast.error("Please enter a name");
      return;
    }
    try {
      toast.success("Discovery configuration created");
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error("Failed to create configuration");
    }
  };

  const handleRunDiscovery = async (configId: number) => {
    toast.success("Discovery scan started");
  };

  const getDiscoveryTypeIcon = (type: string) => {
    switch (type) {
      case "CLOUD": return <Cloud className="h-4 w-4" />;
      case "LDAP": return <Server className="h-4 w-4" />;
      case "FILESYSTEM": return <Folder className="h-4 w-4" />;
      case "NETWORK": return <Network className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case "RUNNING":
        return <Badge className="bg-blue-500"><RefreshCw className="h-3 w-3 mr-1 animate-spin" />Running</Badge>;
      case "FAILED":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Certificate Discovery</h1>
            <p className="text-muted-foreground">
              Automatically discover certificates across your infrastructure
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Discovery Source
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Discovery Source</DialogTitle>
                <DialogDescription>
                  Configure a new certificate discovery source
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    placeholder="e.g., AWS Production"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Discovery Type</Label>
                  <Select
                    value={formData.discoveryType}
                    onValueChange={(value: "LDAP" | "CLOUD" | "FILESYSTEM" | "NETWORK") =>
                      setFormData({ ...formData, discoveryType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CLOUD">Cloud Provider (AWS/Azure/GCP)</SelectItem>
                      <SelectItem value="LDAP">LDAP/Active Directory</SelectItem>
                      <SelectItem value="FILESYSTEM">Filesystem Scan</SelectItem>
                      <SelectItem value="NETWORK">Network Scan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Schedule (Cron)</Label>
                  <Input
                    placeholder="0 2 * * *"
                    value={formData.schedule}
                    onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Example: "0 2 * * *" runs daily at 2 AM
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <Label>Enabled</Label>
                  <Switch
                    checked={formData.enabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateConfiguration}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Discovery Sources</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{configurations.length}</div>
              <p className="text-xs text-muted-foreground">
                {configurations.filter((c) => c.enabled).length} active
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Discovered</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {results.reduce((acc, r) => acc + r.certificatesFound, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New This Week</CardTitle>
              <Plus className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {results.reduce((acc, r) => acc + r.newCertificates, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Running Scans</CardTitle>
              <RefreshCw className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {results.filter((r) => r.status === "RUNNING").length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="configurations">Configurations</TabsTrigger>
            <TabsTrigger value="results">Scan Results</TabsTrigger>
          </TabsList>

          <TabsContent value="configurations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Discovery Configurations</CardTitle>
                <CardDescription>Manage your certificate discovery sources</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Run</TableHead>
                      <TableHead>Next Run</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {configurations.map((config) => (
                      <TableRow key={config.id}>
                        <TableCell className="font-medium">{config.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getDiscoveryTypeIcon(config.discoveryType)}
                            <span>{config.discoveryType}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{config.schedule}</TableCell>
                        <TableCell>
                          <Badge variant={config.enabled ? "default" : "secondary"}>
                            {config.enabled ? "Active" : "Disabled"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {config.lastRun ? new Date(config.lastRun).toLocaleString() : "Never"}
                        </TableCell>
                        <TableCell>
                          {config.nextRun ? new Date(config.nextRun).toLocaleString() : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRunDiscovery(config.id)}
                              title="Run Now"
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" title={config.enabled ? "Disable" : "Enable"}>
                              {config.enabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Scan Results</CardTitle>
                <CardDescription>View the results of recent discovery scans</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Configuration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Certificates Found</TableHead>
                      <TableHead>New</TableHead>
                      <TableHead>Existing</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result) => {
                      const config = configurations.find((c) => c.id === result.configurationId);
                      const duration = result.completedAt
                        ? Math.round(
                            (new Date(result.completedAt).getTime() - new Date(result.startedAt).getTime()) / 1000
                          )
                        : null;
                      return (
                        <TableRow key={result.id}>
                          <TableCell className="font-medium">{config?.name || "Unknown"}</TableCell>
                          <TableCell>{getStatusBadge(result.status)}</TableCell>
                          <TableCell>{result.certificatesFound}</TableCell>
                          <TableCell className="text-green-600">+{result.newCertificates}</TableCell>
                          <TableCell>{result.existingCertificates}</TableCell>
                          <TableCell>{new Date(result.startedAt).toLocaleString()}</TableCell>
                          <TableCell>
                            {result.status === "RUNNING" ? (
                              <div className="flex items-center gap-2">
                                <Progress value={50} className="w-16" />
                                <span className="text-sm">Running...</span>
                              </div>
                            ) : duration ? (
                              `${duration}s`
                            ) : (
                              "-"
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
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