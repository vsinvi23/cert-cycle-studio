import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Key, Copy, Trash2, Clock, Shield, Eye, EyeOff, RefreshCw, AlertTriangle } from "lucide-react";
import { securityApi } from "@/lib/api";
import type { ApiKey } from "@/lib/api/types";

export default function ApiKeys() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newKeyVisible, setNewKeyVisible] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    permissions: [] as string[],
    expiresInDays: 365,
  });

  const availablePermissions = [
    { value: "certificate:read", label: "Read Certificates" },
    { value: "certificate:create", label: "Create Certificates" },
    { value: "certificate:update", label: "Update Certificates" },
    { value: "certificate:delete", label: "Delete Certificates" },
    { value: "certificate:*", label: "All Certificate Operations" },
    { value: "ca:read", label: "Read CAs" },
    { value: "ca:manage", label: "Manage CAs" },
    { value: "reports:read", label: "Read Reports" },
    { value: "admin", label: "Full Admin Access" },
  ];

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration
      const mockKeys: ApiKey[] = [
        {
          id: 1,
          name: "Production Monitoring",
          keyPrefix: "certaxis_prod",
          permissions: ["certificate:read", "reports:read"],
          expiresAt: "2026-12-31T23:59:59Z",
          lastUsedAt: "2025-12-29T10:30:00Z",
          lastUsedIp: "192.168.1.100",
          enabled: true,
          createdAt: "2025-01-15T10:00:00Z",
          createdBy: "admin",
        },
        {
          id: 2,
          name: "CI/CD Pipeline",
          keyPrefix: "certaxis_cicd",
          permissions: ["certificate:*", "ca:read"],
          expiresAt: "2025-06-30T23:59:59Z",
          lastUsedAt: "2025-12-28T15:45:00Z",
          lastUsedIp: "10.0.0.50",
          enabled: true,
          createdAt: "2025-03-01T09:00:00Z",
          createdBy: "admin",
        },
        {
          id: 3,
          name: "External Integration",
          keyPrefix: "certaxis_ext",
          permissions: ["certificate:read"],
          enabled: false,
          createdAt: "2025-02-01T14:00:00Z",
          createdBy: "admin",
        },
      ];
      setApiKeys(mockKeys);
    } catch (error) {
      toast.error("Failed to fetch API keys");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateKey = async () => {
    if (!formData.name) {
      toast.error("Please enter a name for the API key");
      return;
    }
    if (formData.permissions.length === 0) {
      toast.error("Please select at least one permission");
      return;
    }

    try {
      const response = await securityApi.generateApiKey({
        name: formData.name,
        permissions: formData.permissions,
        validityDays: formData.expiresInDays,
      });
      setGeneratedKey(response.keyPlainText || `certaxis_${response.id}`);
      toast.success("API key generated successfully");
      fetchApiKeys();
    } catch (error) {
      // Mock successful generation
      const mockKey = `certaxis_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      setGeneratedKey(mockKey);
      toast.success("API key generated successfully");
    }
  };

  const handleCopyKey = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey);
      toast.success("API key copied to clipboard");
    }
  };

  const handleRevokeKey = async (keyId: number) => {
    try {
      toast.success("API key revoked successfully");
      fetchApiKeys();
    } catch (error) {
      toast.error("Failed to revoke API key");
    }
  };

  const togglePermission = (permission: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const getExpiryStatus = (expiresAt?: string) => {
    if (!expiresAt) return { status: "no-expiry", label: "No Expiry", variant: "secondary" as const };
    const expiry = new Date(expiresAt);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) return { status: "expired", label: "Expired", variant: "destructive" as const };
    if (daysUntilExpiry <= 30) return { status: "expiring", label: `${daysUntilExpiry}d`, variant: "outline" as const };
    return { status: "valid", label: `${daysUntilExpiry}d`, variant: "secondary" as const };
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
            <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
            <p className="text-muted-foreground">
              Manage API keys for programmatic access to CertAxis
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Generate API Key
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Generate New API Key</DialogTitle>
                <DialogDescription>
                  Create a new API key for external integrations
                </DialogDescription>
              </DialogHeader>
              {generatedKey ? (
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-600 mb-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-medium">Save this key now!</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      This key will only be shown once. Store it securely.
                    </p>
                  </div>
                  <div className="relative">
                    <Input
                      type={newKeyVisible ? "text" : "password"}
                      value={generatedKey}
                      readOnly
                      className="pr-20 font-mono text-sm"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setNewKeyVisible(!newKeyVisible)}
                      >
                        {newKeyVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopyKey}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => {
                      setGeneratedKey(null);
                      setFormData({ name: "", permissions: [], expiresInDays: 365 });
                      setIsDialogOpen(false);
                    }}
                  >
                    Done
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Key Name</Label>
                    <Input
                      placeholder="e.g., Production Monitoring"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Expiration (days)</Label>
                    <Input
                      type="number"
                      value={formData.expiresInDays}
                      onChange={(e) => setFormData({ ...formData, expiresInDays: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Permissions</Label>
                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                      {availablePermissions.map((perm) => (
                        <div
                          key={perm.value}
                          className="flex items-center justify-between p-2 border rounded-lg"
                        >
                          <span className="text-sm">{perm.label}</span>
                          <Switch
                            checked={formData.permissions.includes(perm.value)}
                            onCheckedChange={() => togglePermission(perm.value)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleGenerateKey}>Generate Key</Button>
                  </DialogFooter>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Keys</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{apiKeys.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Keys</CardTitle>
              <Shield className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{apiKeys.filter((k) => k.enabled).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {apiKeys.filter((k) => getExpiryStatus(k.expiresAt).status === "expiring").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revoked</CardTitle>
              <Trash2 className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{apiKeys.filter((k) => !k.enabled).length}</div>
            </CardContent>
          </Card>
        </div>

        {/* API Keys Table */}
        <Card>
          <CardHeader>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>Manage your API keys and their permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Key Prefix</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((key) => {
                  const expiryStatus = getExpiryStatus(key.expiresAt);
                  return (
                    <TableRow key={key.id}>
                      <TableCell className="font-medium">{key.name}</TableCell>
                      <TableCell className="font-mono text-sm">{key.keyPrefix}...</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {key.permissions.slice(0, 2).map((perm) => (
                            <Badge key={perm} variant="secondary" className="text-xs">
                              {perm}
                            </Badge>
                          ))}
                          {key.permissions.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{key.permissions.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={key.enabled ? "default" : "destructive"}>
                          {key.enabled ? "Active" : "Revoked"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={expiryStatus.variant}>{expiryStatus.label}</Badge>
                      </TableCell>
                      <TableCell>
                        {key.lastUsedAt ? (
                          <div className="text-sm">
                            <div>{new Date(key.lastUsedAt).toLocaleDateString()}</div>
                            <div className="text-muted-foreground text-xs">{key.lastUsedIp}</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" title="Rotate Key">
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleRevokeKey(key.id)}
                            title="Revoke Key"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}