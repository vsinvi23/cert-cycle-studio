import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Settings, Mail, Shield, Database, Bell, Key, Clock, Server, RefreshCw, Save, Building2, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function SystemSettings() {
  const [settings, setSettings] = useState({
    // General
    systemName: "CertAxis",
    defaultCertificateValidity: 365,
    defaultRenewalThreshold: 30,
    
    // Email
    smtpHost: "smtp.company.com",
    smtpPort: 587,
    smtpUsername: "certaxis@company.com",
    smtpSecure: true,
    emailFromName: "CertAxis Alerts",
    
    // Security
    jwtExpiration: 86400000,
    maxLoginAttempts: 5,
    lockoutDuration: 300,
    mfaEnabled: false,
    passwordMinLength: 12,
    sessionTimeout: 1800,
    maxConcurrentSessions: 5,
    
    // Rate Limiting
    rateLimitEnabled: true,
    rateLimitPerUser: 100,
    rateLimitGlobal: 1000,
    
    // Auto Renewal
    autoRenewalEnabled: true,
    autoRenewalCheckInterval: 24,
    autoRenewalThreshold: 30,
    
    // Redis Cache
    redisEnabled: false,
    redisHost: "localhost",
    redisPort: 6379,
    cacheTtl: 300,

    // Tenant
    tenantName: "Acme Corporation",
    tenantId: "tenant-001",
    tenantDomain: "acme.certaxis.io",
    tenantPlan: "Enterprise",
    tenantMaxCertificates: 10000,
    tenantMaxUsers: 500,
  });

  const tenants = [
    { id: "tenant-001", name: "Acme Corporation", domain: "acme.certaxis.io", plan: "Enterprise", status: "active" },
    { id: "tenant-002", name: "TechStart Inc", domain: "techstart.certaxis.io", plan: "Professional", status: "active" },
    { id: "tenant-003", name: "Global Systems", domain: "global.certaxis.io", plan: "Enterprise", status: "active" },
  ];

  const handleSave = async (section: string) => {
    try {
      toast.success(`${section} settings saved successfully`);
    } catch (error) {
      toast.error(`Failed to save ${section} settings`);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground">
            Configure CertAxis system-wide settings and integrations
          </p>
        </div>

        <Tabs defaultValue="tenant">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="tenant"><Building2 className="h-4 w-4 mr-2" />Tenant</TabsTrigger>
            <TabsTrigger value="general"><Settings className="h-4 w-4 mr-2" />General</TabsTrigger>
            <TabsTrigger value="email"><Mail className="h-4 w-4 mr-2" />Email</TabsTrigger>
            <TabsTrigger value="security"><Shield className="h-4 w-4 mr-2" />Security</TabsTrigger>
            <TabsTrigger value="renewal"><RefreshCw className="h-4 w-4 mr-2" />Auto-Renewal</TabsTrigger>
            <TabsTrigger value="ratelimit"><Clock className="h-4 w-4 mr-2" />Rate Limits</TabsTrigger>
            <TabsTrigger value="cache"><Database className="h-4 w-4 mr-2" />Cache</TabsTrigger>
          </TabsList>

          <TabsContent value="tenant" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tenant Configuration</CardTitle>
                <CardDescription>View and manage tenant settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Active Tenant</h4>
                  <div className="rounded-lg border p-4 bg-primary/5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                          <Building2 className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="font-semibold">{settings.tenantName}</p>
                          <p className="text-sm text-muted-foreground">{settings.tenantDomain}</p>
                        </div>
                      </div>
                      <Badge className="bg-green-500 text-white">Active</Badge>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Tenant ID</p>
                        <p className="font-mono text-sm">{settings.tenantId}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Plan</p>
                        <p className="font-medium">{settings.tenantPlan}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Max Certificates</p>
                        <p className="font-medium">{settings.tenantMaxCertificates.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Tenant Settings</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Tenant Name</Label>
                      <Input
                        value={settings.tenantName}
                        onChange={(e) => setSettings({ ...settings, tenantName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Domain</Label>
                      <Input
                        value={settings.tenantDomain}
                        onChange={(e) => setSettings({ ...settings, tenantDomain: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Certificates</Label>
                      <Input
                        type="number"
                        value={settings.tenantMaxCertificates}
                        onChange={(e) => setSettings({ ...settings, tenantMaxCertificates: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Users</Label>
                      <Input
                        type="number"
                        value={settings.tenantMaxUsers}
                        onChange={(e) => setSettings({ ...settings, tenantMaxUsers: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Available Tenants</h4>
                  <div className="space-y-2">
                    {tenants.map((tenant) => (
                      <div
                        key={tenant.id}
                        className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-colors hover:bg-muted/50 ${
                          tenant.id === settings.tenantId ? "border-primary bg-primary/5" : ""
                        }`}
                        onClick={() => setSettings({ 
                          ...settings, 
                          tenantId: tenant.id, 
                          tenantName: tenant.name, 
                          tenantDomain: tenant.domain,
                          tenantPlan: tenant.plan
                        })}
                      >
                        <div className="flex items-center gap-3">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{tenant.name}</p>
                            <p className="text-sm text-muted-foreground">{tenant.domain}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{tenant.plan}</Badge>
                          {tenant.id === settings.tenantId && (
                            <CheckCircle className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={() => handleSave("Tenant")}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Configure basic system parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>System Name</Label>
                    <Input
                      value={settings.systemName}
                      onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Default Certificate Validity (days)</Label>
                    <Input
                      type="number"
                      value={settings.defaultCertificateValidity}
                      onChange={(e) =>
                        setSettings({ ...settings, defaultCertificateValidity: parseInt(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Default Renewal Threshold (days before expiry)</Label>
                    <Input
                      type="number"
                      value={settings.defaultRenewalThreshold}
                      onChange={(e) =>
                        setSettings({ ...settings, defaultRenewalThreshold: parseInt(e.target.value) })
                      }
                    />
                  </div>
                </div>
                <Button onClick={() => handleSave("General")}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Email Configuration</CardTitle>
                <CardDescription>Configure SMTP settings for email alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>SMTP Host</Label>
                    <Input
                      value={settings.smtpHost}
                      onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>SMTP Port</Label>
                    <Input
                      type="number"
                      value={settings.smtpPort}
                      onChange={(e) => setSettings({ ...settings, smtpPort: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>SMTP Username</Label>
                    <Input
                      value={settings.smtpUsername}
                      onChange={(e) => setSettings({ ...settings, smtpUsername: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>From Name</Label>
                    <Input
                      value={settings.emailFromName}
                      onChange={(e) => setSettings({ ...settings, emailFromName: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Use TLS/SSL</Label>
                    <p className="text-sm text-muted-foreground">Enable secure connection</p>
                  </div>
                  <Switch
                    checked={settings.smtpSecure}
                    onCheckedChange={(checked) => setSettings({ ...settings, smtpSecure: checked })}
                  />
                </div>
                <Button onClick={() => handleSave("Email")}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Configure authentication and authorization settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Session Management</h4>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Session Timeout (seconds)</Label>
                      <Input
                        type="number"
                        value={settings.sessionTimeout}
                        onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Concurrent Sessions</Label>
                      <Input
                        type="number"
                        value={settings.maxConcurrentSessions}
                        onChange={(e) =>
                          setSettings({ ...settings, maxConcurrentSessions: parseInt(e.target.value) })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>JWT Expiration (ms)</Label>
                      <Input
                        type="number"
                        value={settings.jwtExpiration}
                        onChange={(e) => setSettings({ ...settings, jwtExpiration: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h4 className="font-medium">Login Security</h4>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Max Login Attempts</Label>
                      <Input
                        type="number"
                        value={settings.maxLoginAttempts}
                        onChange={(e) => setSettings({ ...settings, maxLoginAttempts: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Lockout Duration (seconds)</Label>
                      <Input
                        type="number"
                        value={settings.lockoutDuration}
                        onChange={(e) => setSettings({ ...settings, lockoutDuration: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Min Password Length</Label>
                      <Input
                        type="number"
                        value={settings.passwordMinLength}
                        onChange={(e) => setSettings({ ...settings, passwordMinLength: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Multi-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">Require MFA for all users</p>
                    </div>
                    <Switch
                      checked={settings.mfaEnabled}
                      onCheckedChange={(checked) => setSettings({ ...settings, mfaEnabled: checked })}
                    />
                  </div>
                </div>
                
                <Button onClick={() => handleSave("Security")}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="renewal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Auto-Renewal Settings</CardTitle>
                <CardDescription>Configure automatic certificate renewal</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Auto-Renewal</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically renew certificates before expiration
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoRenewalEnabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, autoRenewalEnabled: checked })}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Check Interval (hours)</Label>
                    <Input
                      type="number"
                      value={settings.autoRenewalCheckInterval}
                      onChange={(e) =>
                        setSettings({ ...settings, autoRenewalCheckInterval: parseInt(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Renewal Threshold (days before expiry)</Label>
                    <Input
                      type="number"
                      value={settings.autoRenewalThreshold}
                      onChange={(e) =>
                        setSettings({ ...settings, autoRenewalThreshold: parseInt(e.target.value) })
                      }
                    />
                  </div>
                </div>
                <Button onClick={() => handleSave("Auto-Renewal")}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ratelimit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Rate Limiting</CardTitle>
                <CardDescription>Configure API rate limits to prevent abuse</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Rate Limiting</Label>
                    <p className="text-sm text-muted-foreground">
                      Limit API requests per user and globally
                    </p>
                  </div>
                  <Switch
                    checked={settings.rateLimitEnabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, rateLimitEnabled: checked })}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Requests per User (per minute)</Label>
                    <Input
                      type="number"
                      value={settings.rateLimitPerUser}
                      onChange={(e) =>
                        setSettings({ ...settings, rateLimitPerUser: parseInt(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Global Limit (per minute)</Label>
                    <Input
                      type="number"
                      value={settings.rateLimitGlobal}
                      onChange={(e) =>
                        setSettings({ ...settings, rateLimitGlobal: parseInt(e.target.value) })
                      }
                    />
                  </div>
                </div>
                <Button onClick={() => handleSave("Rate Limits")}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cache" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Redis Cache</CardTitle>
                <CardDescription>Configure Redis caching for improved performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Redis Cache</Label>
                    <p className="text-sm text-muted-foreground">
                      Use Redis for caching dashboard metrics and lookups
                    </p>
                  </div>
                  <Switch
                    checked={settings.redisEnabled}
                    onCheckedChange={(checked) => setSettings({ ...settings, redisEnabled: checked })}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Redis Host</Label>
                    <Input
                      value={settings.redisHost}
                      onChange={(e) => setSettings({ ...settings, redisHost: e.target.value })}
                      disabled={!settings.redisEnabled}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Redis Port</Label>
                    <Input
                      type="number"
                      value={settings.redisPort}
                      onChange={(e) => setSettings({ ...settings, redisPort: parseInt(e.target.value) })}
                      disabled={!settings.redisEnabled}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cache TTL (seconds)</Label>
                    <Input
                      type="number"
                      value={settings.cacheTtl}
                      onChange={(e) => setSettings({ ...settings, cacheTtl: parseInt(e.target.value) })}
                      disabled={!settings.redisEnabled}
                    />
                  </div>
                </div>
                <Button onClick={() => handleSave("Cache")}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}