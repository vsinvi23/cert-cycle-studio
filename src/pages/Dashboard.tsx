import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  FileKey, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Shield, 
  Activity, 
  Loader2, 
  RefreshCw,
  Server,
  Database,
  Zap,
  ArrowRight,
  Plus,
  Search,
  Key,
  Bell,
  Brain,
  TrendingUp,
  Eye,
  EyeOff,
  ThumbsUp,
  Target,
  Layers,
  FileWarning
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { dashboardApi, healthApi, reportsApi } from "@/lib/api";
import type { DashboardMetrics, ExpiringCertificate, CertificateHealth, ComplianceScore, SystemHealth, AuditLog } from "@/lib/api/types";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

// AI Insights Mock Data
const renewalPredictions = [
  {
    id: 1,
    certificateName: "api.example.com",
    domain: "example.com",
    expiryDate: "2025-02-15",
    riskScore: 85,
    failureProbability: 0.72,
    trigger: "Daily batch run",
    recommendedActions: [
      "Verify DNS records are accessible",
      "Check ACME account credentials",
      "Ensure port 80/443 is open for validation"
    ],
    factors: [
      { name: "Previous failure history", impact: "High" },
      { name: "DNS propagation issues", impact: "Medium" },
      { name: "Rate limit approaching", impact: "Low" }
    ]
  },
  {
    id: 2,
    certificateName: "mail.company.org",
    domain: "company.org",
    expiryDate: "2025-02-20",
    riskScore: 45,
    failureProbability: 0.28,
    trigger: "Config change",
    recommendedActions: ["Review recent configuration changes"],
    factors: [{ name: "Config modification", impact: "Medium" }]
  },
  {
    id: 3,
    certificateName: "cdn.webapp.io",
    domain: "webapp.io",
    expiryDate: "2025-02-25",
    riskScore: 15,
    failureProbability: 0.08,
    trigger: "New renewal attempt",
    recommendedActions: ["No immediate action required"],
    factors: [{ name: "Standard renewal cycle", impact: "Low" }]
  }
];

const initialAnomalies = [
  {
    id: 1,
    type: "Issuance spike",
    description: "47 certificates issued in the last hour vs avg 5/hour",
    severity: "high",
    detectedAt: "2025-01-02T10:30:00Z",
    affectedDomains: ["*.example.com"],
    status: "active"
  },
  {
    id: 2,
    type: "Domain pattern anomaly",
    description: "Sequential subdomains detected (test1, test2, test3...)",
    severity: "medium",
    detectedAt: "2025-01-02T09:15:00Z",
    affectedDomains: ["test1.example.com", "test2.example.com"],
    status: "active"
  }
];

const policyDrifts = [
  {
    id: 1,
    rule: "Manual override threshold exceeded",
    description: "25% of renewals manually overridden (threshold: 20%)",
    current: "25%",
    suggestedTemplate: {
      name: "Flexible Renewal Policy",
      rules: ["Allow renewal 45 days before expiry", "Auto-approve for verified domains"]
    }
  },
  {
    id: 2,
    rule: "Repeated exception pattern",
    description: "Same exception applied 5 times in 30 days",
    current: "5 times",
    suggestedTemplate: {
      name: "Streamlined EV Policy",
      rules: ["Auto-approve EV bypass for internal domains"]
    }
  }
];

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [expiringCerts, setExpiringCerts] = useState<ExpiringCertificate[]>([]);
  const [health, setHealth] = useState<CertificateHealth | null>(null);
  const [compliance, setCompliance] = useState<ComplianceScore | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [recentActivity, setRecentActivity] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // AI Insights state
  const [anomalies, setAnomalies] = useState(initialAnomalies);
  const [selectedPrediction, setSelectedPrediction] = useState<typeof renewalPredictions[0] | null>(null);
  const [selectedDrift, setSelectedDrift] = useState<typeof policyDrifts[0] | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [metricsData, expiringData, healthData, complianceData] = await Promise.all([
        dashboardApi.getMetrics(),
        dashboardApi.getExpiringCertificates(30),
        dashboardApi.getCertificateHealth(),
        dashboardApi.getComplianceScore(),
      ]);
      
      setMetrics(metricsData);
      setExpiringCerts(Array.isArray(expiringData) ? expiringData : []);
      setHealth(healthData);
      setCompliance(complianceData);

      // Fetch system health and recent activity separately (non-blocking)
      try {
        const [sysHealth, activity] = await Promise.all([
          healthApi.check(),
          reportsApi.getAuditLogs(),
        ]);
        setSystemHealth(sysHealth);
        setRecentActivity(Array.isArray(activity) ? activity.slice(0, 5) : []);
      } catch {
        // These are non-critical, ignore failures
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError("Failed to load dashboard data. Please check your API connection.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const stats = [
    {
      title: "Total Certificates",
      value: metrics?.totalCertificates ?? 0,
      description: "Across all domains",
      icon: FileKey,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Active",
      value: metrics?.activeCertificates ?? 0,
      description: "Valid certificates",
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Expiring Soon",
      value: metrics?.expiringIn30Days ?? 0,
      description: "Within 30 days",
      icon: Clock,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      title: "Expired",
      value: metrics?.expiredCertificates ?? 0,
      description: "Requires attention",
      icon: AlertTriangle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
  ];

  const quickActions = [
    { title: "Issue Certificate", icon: Plus, url: "/certificate-management/issue", color: "bg-primary" },
    { title: "Network Scan", icon: Search, url: "/network-scan", color: "bg-blue-500" },
    { title: "Manage API Keys", icon: Key, url: "/api-keys", color: "bg-purple-500" },
    { title: "View Alerts", icon: Bell, url: "/alerts", color: "bg-orange-500" },
  ];

  const getSeverityBadge = (severity: ExpiringCertificate["severity"]) => {
    switch (severity) {
      case "CRITICAL":
        return <Badge variant="destructive">Critical</Badge>;
      case "WARNING":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">Warning</Badge>;
      case "INFO":
        return <Badge variant="secondary">Info</Badge>;
    }
  };

  const getHealthStatusColor = (status: CertificateHealth["status"] | undefined) => {
    switch (status) {
      case "EXCELLENT": return "text-green-500";
      case "GOOD": return "text-blue-500";
      case "WARNING": return "text-yellow-500";
      case "CRITICAL": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const getSystemStatusColor = (status: SystemHealth["status"] | undefined) => {
    switch (status) {
      case "UP": return "bg-green-500";
      case "DEGRADED": return "bg-yellow-500";
      case "DOWN": return "bg-red-500";
      default: return "bg-muted";
    }
  };

  // AI Insights helpers
  const getRiskColor = (score: number) => {
    if (score >= 70) return "text-destructive";
    if (score >= 40) return "text-yellow-500";
    return "text-green-500";
  };

  const getRiskBadge = (score: number) => {
    if (score >= 70) return <Badge variant="destructive">High Risk</Badge>;
    if (score >= 40) return <Badge className="bg-yellow-500 text-white">Medium Risk</Badge>;
    return <Badge className="bg-green-500 text-white">Low Risk</Badge>;
  };

  const handleDismissAnomaly = (id: number) => {
    setAnomalies(prev => prev.map(a => a.id === id ? { ...a, status: "dismissed" } : a));
  };

  const handleMarkExpected = (id: number) => {
    setAnomalies(prev => prev.map(a => a.id === id ? { ...a, status: "expected" } : a));
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading dashboard...</span>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Active Tenant Banner */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-lg">Acme Corporation</h2>
                  <Badge className="bg-green-500 text-white text-xs">Active</Badge>
                </div>
                <p className="text-sm text-muted-foreground">acme.certaxis.io • Enterprise Plan</p>
              </div>
            </div>
            <Link to="/settings">
              <Button variant="outline" size="sm">
                Manage Tenant
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of your certificate inventory and status
            </p>
          </div>
          <Button variant="outline" onClick={fetchDashboardData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
          {quickActions.map((action) => (
            <Link key={action.title} to={action.url}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${action.color}`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-sm font-medium">{action.title}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* System Health & Recent Activity Row */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* System Health */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Server className="h-4 w-4" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Overall Status</span>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${getSystemStatusColor(systemHealth?.status)}`} />
                  <span className="text-sm font-medium">{systemHealth?.status || "Unknown"}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Database className="h-3 w-3" />
                  Database
                </span>
                <Badge variant={systemHealth?.database?.status === "UP" ? "outline" : "destructive"} className="text-xs">
                  {systemHealth?.database?.status || "—"}
                </Badge>
              </div>
              {systemHealth?.redis && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    Redis Cache
                  </span>
                  <Badge variant={systemHealth.redis.status === "UP" ? "outline" : "destructive"} className="text-xs">
                    {systemHealth.redis.status}
                  </Badge>
                </div>
              )}
              {systemHealth?.acme && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">ACME Providers</span>
                  <span className="text-sm font-medium">{systemHealth.acme.activeProviders} active</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4" />
                Recent Activity
              </CardTitle>
              <Link to="/audit-logs">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-2">
                  {recentActivity.map((log) => (
                    <div key={log.id} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                      <div className="flex-1">
                        <span className="font-medium">{log.action}</span>
                        <span className="text-muted-foreground"> · {log.entityType}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                        <Badge variant={log.status === "SUCCESS" ? "outline" : "destructive"} className="text-xs">
                          {log.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-24 items-center justify-center text-muted-foreground text-sm">
                  No recent activity
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Health & Compliance Row */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Health Score Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Certificate Health
              </CardTitle>
              <CardDescription>Overall health score and status</CardDescription>
            </CardHeader>
            <CardContent>
              {health ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Health Score</span>
                    <span className={`text-2xl font-bold ${getHealthStatusColor(health.status)}`}>
                      {health.healthScore}/100
                    </span>
                  </div>
                  <Progress value={health.healthScore} className="h-2" />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Strong Algorithms</p>
                      <p className="font-medium text-green-500">{health.strongAlgorithmCount}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Weak Algorithms</p>
                      <p className="font-medium text-destructive">{health.weakAlgorithmCount}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Recently Issued</p>
                      <p className="font-medium">{health.recentlyIssuedCount}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Older than 1 Year</p>
                      <p className="font-medium">{health.oldCertificatesCount}</p>
                    </div>
                  </div>
                  {health.recommendations && health.recommendations.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Recommendations</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {health.recommendations.slice(0, 3).map((rec, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex h-32 items-center justify-center text-muted-foreground">
                  No health data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Compliance Score Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Compliance Score
              </CardTitle>
              <CardDescription>Security compliance overview</CardDescription>
            </CardHeader>
            <CardContent>
              {compliance ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Score</span>
                    <span className="text-2xl font-bold text-primary">
                      {compliance.overallScore}%
                    </span>
                  </div>
                  <Progress value={compliance.overallScore} className="h-2" />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Compliant</p>
                      <p className="font-medium text-green-500">{compliance.compliantCount}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Non-Compliant</p>
                      <p className="font-medium text-destructive">{compliance.nonCompliantCount}</p>
                    </div>
                  </div>
                  {compliance.breakdown && (
                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Key Length</span>
                        <span>{compliance.breakdown.keyLengthScore}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Algorithm</span>
                        <span>{compliance.breakdown.algorithmScore}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Validity</span>
                        <span>{compliance.breakdown.validityScore}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Lifecycle</span>
                        <span>{compliance.breakdown.lifecycleScore}%</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex h-32 items-center justify-center text-muted-foreground">
                  No compliance data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Expiring Certificates */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upcoming Expirations</CardTitle>
              <CardDescription>Certificates expiring in the next 30 days</CardDescription>
            </div>
            <Link to="/renewals">
              <Button variant="outline" size="sm">
                Manage Renewals <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {expiringCerts.length > 0 ? (
              <div className="space-y-3">
                {expiringCerts.slice(0, 5).map((cert) => (
                  <div
                    key={cert.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{cert.host}</p>
                      <p className="text-sm text-muted-foreground">
                        Issuer: {cert.issuerCA} · {cert.algorithm}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {cert.daysUntilExpiry} days
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(cert.expiresAt).toLocaleDateString()}
                        </p>
                      </div>
                      {getSeverityBadge(cert.severity)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center text-muted-foreground">
                No expiring certificates
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Insights Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI Insights
            </CardTitle>
            <CardDescription>
              Predictive analytics and anomaly detection (read-only, does NOT alter schedules or initiate renewals)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="renewal" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="renewal" className="text-xs sm:text-sm">
                  <TrendingUp className="h-3 w-3 mr-1 hidden sm:inline" />
                  Renewal Predictions
                </TabsTrigger>
                <TabsTrigger value="anomaly" className="text-xs sm:text-sm">
                  <Activity className="h-3 w-3 mr-1 hidden sm:inline" />
                  Anomaly Detection
                </TabsTrigger>
                <TabsTrigger value="drift" className="text-xs sm:text-sm">
                  <Target className="h-3 w-3 mr-1 hidden sm:inline" />
                  Policy Drift
                </TabsTrigger>
              </TabsList>

              {/* Renewal Predictions Tab */}
              <TabsContent value="renewal" className="space-y-3">
                {renewalPredictions.map((prediction) => (
                  <div key={prediction.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex-1">
                      <p className="font-medium">{prediction.certificateName}</p>
                      <p className="text-sm text-muted-foreground">
                        Expires: {prediction.expiryDate} · Trigger: {prediction.trigger}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <Progress value={prediction.riskScore} className="w-16 h-2" />
                          <span className={`text-sm font-medium ${getRiskColor(prediction.riskScore)}`}>
                            {prediction.riskScore}%
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Failure: {(prediction.failureProbability * 100).toFixed(0)}%
                        </p>
                      </div>
                      {getRiskBadge(prediction.riskScore)}
                      <Button variant="ghost" size="sm" onClick={() => setSelectedPrediction(prediction)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </TabsContent>

              {/* Anomaly Detection Tab */}
              <TabsContent value="anomaly" className="space-y-3">
                {anomalies.map((anomaly) => (
                  <div key={anomaly.id} className={`rounded-lg border p-3 ${anomaly.status !== 'active' ? 'opacity-50' : ''}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {anomaly.type === "Issuance spike" ? (
                            <Zap className="h-4 w-4 text-yellow-500" />
                          ) : (
                            <FileWarning className="h-4 w-4 text-orange-500" />
                          )}
                          <span className="font-medium">{anomaly.type}</span>
                          <Badge variant={anomaly.severity === "high" ? "destructive" : "secondary"}>
                            {anomaly.severity}
                          </Badge>
                          {anomaly.status !== "active" && (
                            <Badge variant="outline">{anomaly.status}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{anomaly.description}</p>
                        <div className="flex gap-1 mt-1">
                          {anomaly.affectedDomains.map((d, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{d}</Badge>
                          ))}
                        </div>
                      </div>
                      {anomaly.status === "active" && (
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleDismissAnomaly(anomaly.id)}>
                            <EyeOff className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleMarkExpected(anomaly.id)}>
                            <ThumbsUp className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </TabsContent>

              {/* Policy Drift Tab */}
              <TabsContent value="drift" className="space-y-3">
                {policyDrifts.map((drift) => (
                  <div key={drift.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          <span className="font-medium">{drift.rule}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{drift.description}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setSelectedDrift(drift)}>
                        <Layers className="h-4 w-4 mr-1" />
                        View Suggestion
                      </Button>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Prediction Details Dialog */}
        <Dialog open={!!selectedPrediction} onOpenChange={() => setSelectedPrediction(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Renewal Prediction Details</DialogTitle>
              <DialogDescription>{selectedPrediction?.certificateName}</DialogDescription>
            </DialogHeader>
            {selectedPrediction && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Risk Score</p>
                    <p className={`text-2xl font-bold ${getRiskColor(selectedPrediction.riskScore)}`}>
                      {selectedPrediction.riskScore}%
                    </p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Failure Probability</p>
                    <p className="text-2xl font-bold">
                      {(selectedPrediction.failureProbability * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Contributing Factors</p>
                  {selectedPrediction.factors.map((f, i) => (
                    <div key={i} className="flex justify-between py-1 text-sm">
                      <span>{f.name}</span>
                      <Badge variant={f.impact === "High" ? "destructive" : "secondary"}>{f.impact}</Badge>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Recommended Actions</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {selectedPrediction.recommendedActions.map((a, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500 mt-1" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    This prediction is advisory only. It does NOT alter ARI schedule or initiate renewals.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Policy Drift Dialog */}
        <Dialog open={!!selectedDrift} onOpenChange={() => setSelectedDrift(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Suggested Policy Template</DialogTitle>
              <DialogDescription>{selectedDrift?.suggestedTemplate.name} (Read-only)</DialogDescription>
            </DialogHeader>
            {selectedDrift && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Suggested Rules</p>
                  <ul className="space-y-2">
                    {selectedDrift.suggestedTemplate.rules.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm bg-muted/50 p-2 rounded">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    This is a read-only suggestion. Review with your security team before implementing changes.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
