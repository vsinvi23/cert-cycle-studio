import { useEffect, useState } from "react";
import { FileKey, AlertTriangle, CheckCircle, Clock, Shield, Activity, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppLayout } from "@/components/layout/AppLayout";
import { dashboardApi } from "@/lib/api";
import type { DashboardMetrics, ExpiringCertificate, CertificateHealth, ComplianceScore } from "@/lib/api/types";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [expiringCerts, setExpiringCerts] = useState<ExpiringCertificate[]>([]);
  const [health, setHealth] = useState<CertificateHealth | null>(null);
  const [compliance, setCompliance] = useState<ComplianceScore | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Failed to load dashboard data. Please check your API connection.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = [
    {
      title: "Total Certificates",
      value: metrics?.totalCertificates ?? 0,
      description: "Across all domains",
      icon: FileKey,
      color: "text-primary",
    },
    {
      title: "Active",
      value: metrics?.activeCertificates ?? 0,
      description: "Valid certificates",
      icon: CheckCircle,
      color: "text-green-500",
    },
    {
      title: "Expiring Soon",
      value: metrics?.expiringIn30Days ?? 0,
      description: "Within 30 days",
      icon: Clock,
      color: "text-yellow-500",
    },
    {
      title: "Expired",
      value: metrics?.expiredCertificates ?? 0,
      description: "Requires attention",
      icon: AlertTriangle,
      color: "text-destructive",
    },
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your certificate inventory and status
          </p>
        </div>

        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

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
          <CardHeader>
            <CardTitle>Upcoming Expirations</CardTitle>
            <CardDescription>Certificates expiring in the next 30 days</CardDescription>
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
                        Issuer: {cert.issuerCA} • {cert.algorithm}
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
      </div>
    </AppLayout>
  );
}
