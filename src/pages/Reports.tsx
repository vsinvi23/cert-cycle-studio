import { useEffect, useState } from "react";
import { BarChart3, Download, FileText, Shield, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { reportsApi, dashboardApi } from "@/lib/api";
import type { ComplianceScore, CertificateHealth } from "@/lib/api/types";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function Reports() {
  const [compliance, setCompliance] = useState<ComplianceScore | null>(null);
  const [health, setHealth] = useState<CertificateHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [exportFormat, setExportFormat] = useState("json");
  const [complianceStandard, setComplianceStandard] = useState("PCI-DSS");
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [complianceData, healthData] = await Promise.all([
          dashboardApi.getComplianceScore(),
          dashboardApi.getCertificateHealth(),
        ]);
        setCompliance(complianceData);
        setHealth(healthData);
      } catch (error) {
        console.error("Failed to fetch reports data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const report = await reportsApi.getInventoryReport(exportFormat);
      
      // Create download
      const blob = new Blob([typeof report === 'string' ? report : JSON.stringify(report, null, 2)], {
        type: exportFormat === 'json' ? 'application/json' : exportFormat === 'csv' ? 'text/csv' : 'application/pdf'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-inventory.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: `Report exported as ${exportFormat.toUpperCase()}`,
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleComplianceReport = async () => {
    setIsExporting(true);
    try {
      const report = await reportsApi.getComplianceReport(complianceStandard);
      
      const blob = new Blob([typeof report === 'string' ? report : JSON.stringify(report, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compliance-report-${complianceStandard.toLowerCase()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Compliance Report Generated",
        description: `${complianceStandard} compliance report downloaded`,
      });
    } catch (error) {
      console.error("Compliance report failed:", error);
      toast({
        title: "Report Failed",
        description: "Failed to generate compliance report.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "EXCELLENT": return "text-green-500";
      case "GOOD": return "text-blue-500";
      case "WARNING": return "text-yellow-500";
      case "CRITICAL": return "text-destructive";
      case "COMPLIANT": return "text-green-500";
      case "PARTIAL": return "text-yellow-500";
      case "NON_COMPLIANT": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading reports...</span>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
            <p className="text-muted-foreground">
              Analytics and compliance reporting
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExport} disabled={isExporting}>
              {isExporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Export Inventory
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Health Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Certificate Health Distribution
              </CardTitle>
              <CardDescription>Overview of certificate health</CardDescription>
            </CardHeader>
            <CardContent>
              {health ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Health Score</span>
                    <span className={`text-2xl font-bold ${getStatusColor(health.status)}`}>
                      {health.healthScore}/100
                    </span>
                  </div>
                  <Progress value={health.healthScore} className="h-3" />
                  
                  <div className="mt-6 space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">Algorithm Distribution</p>
                    {health.algorithmDistribution && Object.entries(health.algorithmDistribution).map(([algo, count]) => (
                      <div key={algo} className="flex items-center justify-between text-sm">
                        <span>{algo}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">Key Size Distribution</p>
                    {health.keySizeDistribution && Object.entries(health.keySizeDistribution).map(([size, count]) => (
                      <div key={size} className="flex items-center justify-between text-sm">
                        <span>{size} bits</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex h-64 flex-col items-center justify-center text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    No certificate data available
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Compliance Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Compliance Summary
                  </CardTitle>
                  <CardDescription>Certificate compliance metrics</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={complianceStandard} onValueChange={setComplianceStandard}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PCI-DSS">PCI-DSS</SelectItem>
                      <SelectItem value="SOC2">SOC 2</SelectItem>
                      <SelectItem value="GDPR">GDPR</SelectItem>
                      <SelectItem value="NIST">NIST</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="outline" onClick={handleComplianceReport} disabled={isExporting}>
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {compliance ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Compliance Score</span>
                    <span className={`text-2xl font-bold ${getStatusColor(compliance.status)}`}>
                      {compliance.overallScore}%
                    </span>
                  </div>
                  <Progress value={compliance.overallScore} className="h-3" />
                  
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="rounded-lg border p-3">
                      <p className="text-sm text-muted-foreground">Compliant</p>
                      <p className="text-xl font-bold text-green-500">{compliance.compliantCount}</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-sm text-muted-foreground">Non-Compliant</p>
                      <p className="text-xl font-bold text-destructive">{compliance.nonCompliantCount}</p>
                    </div>
                  </div>

                  {compliance.breakdown && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Breakdown</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Key Length</span>
                          <span className="font-medium">{compliance.breakdown.keyLengthScore}%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Algorithm</span>
                          <span className="font-medium">{compliance.breakdown.algorithmScore}%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Validity</span>
                          <span className="font-medium">{compliance.breakdown.validityScore}%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Lifecycle</span>
                          <span className="font-medium">{compliance.breakdown.lifecycleScore}%</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {compliance.violations && compliance.violations.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-muted-foreground mb-2">Recent Violations</p>
                      <div className="space-y-2">
                        {compliance.violations.slice(0, 3).map((v, i) => (
                          <div key={i} className="text-sm rounded-lg border p-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{v.host}</span>
                              <Badge variant={v.severity === "CRITICAL" ? "destructive" : "secondary"}>
                                {v.severity}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{v.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex h-32 items-center justify-center text-muted-foreground">
                  No compliance data available yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
