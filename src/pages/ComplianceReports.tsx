import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Download, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Shield, 
  TrendingUp, 
  Calendar,
  Loader2,
  RefreshCw
} from "lucide-react";
import { dashboardApi } from "@/lib/api";
import type { ComplianceScore, ComplianceViolation } from "@/lib/api/types";

export default function ComplianceReports() {
  const [loading, setLoading] = useState(true);
  const [selectedStandard, setSelectedStandard] = useState("PCI-DSS");
  const [complianceData, setComplianceData] = useState<ComplianceScore | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const standards = ["PCI-DSS", "SOC2", "GDPR", "HIPAA", "NIST"];

  useEffect(() => {
    fetchComplianceData();
  }, []);

  const fetchComplianceData = async () => {
    try {
      setLoading(true);
      const data = await dashboardApi.getComplianceScore();
      setComplianceData(data);
    } catch (error) {
      console.error("Failed to fetch compliance data:", error);
      toast.error("Failed to fetch compliance data");
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async (format: string) => {
    toast.success(`Exporting ${selectedStandard} report as ${format.toUpperCase()}`);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 70) return "text-yellow-500";
    return "text-red-500";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLIANT":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Compliant</Badge>;
      case "PARTIAL":
        return <Badge className="bg-yellow-500"><AlertTriangle className="h-3 w-3 mr-1" />Partial</Badge>;
      case "NON_COMPLIANT":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Non-Compliant</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return <Badge variant="destructive">Critical</Badge>;
      case "HIGH":
        return <Badge className="bg-orange-500">High</Badge>;
      case "MEDIUM":
        return <Badge className="bg-yellow-500">Medium</Badge>;
      case "LOW":
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  const score = complianceData?.overallScore || 0;
  const violations = complianceData?.violations || [];
  const breakdown = complianceData?.breakdown;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Compliance Reports</h1>
            <p className="text-muted-foreground">
              Monitor and report on certificate compliance across standards
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={fetchComplianceData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Select value={selectedStandard} onValueChange={setSelectedStandard}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {standards.map((std) => (
                  <SelectItem key={std} value={std}>{std}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => handleExportReport("pdf")}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" onClick={() => handleExportReport("csv")}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
                {score}%
              </div>
              <Progress value={score} className="mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Compliance Status</CardTitle>
            </CardHeader>
            <CardContent>
              {getStatusBadge(complianceData?.status || "PARTIAL")}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Compliant</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {complianceData?.compliantCount || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Non-Compliant</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {complianceData?.nonCompliantCount || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="violations">Violations ({violations.length})</TabsTrigger>
            <TabsTrigger value="breakdown">Score Breakdown</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{selectedStandard} Compliance Summary</CardTitle>
                <CardDescription>
                  Overall compliance status and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Overall Score</span>
                    <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
                      {score}%
                    </span>
                  </div>
                  <Progress value={score} className="h-3" />
                  <div className="grid gap-2 mt-4">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <span className="text-sm">
                        {score >= 90
                          ? "Your certificates meet the required compliance standards."
                          : "Some certificates require attention to meet compliance standards."}
                      </span>
                    </div>
                    {violations.length > 0 && (
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">
                          {violations.length} violation(s) require immediate attention.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="violations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Violations</CardTitle>
                <CardDescription>
                  Certificates that do not meet {selectedStandard} requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                {violations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p>No violations found</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Certificate ID</TableHead>
                        <TableHead>Host</TableHead>
                        <TableHead>Violation Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Severity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {violations.map((violation) => (
                        <TableRow key={`${violation.certificateId}-${violation.violationType}`}>
                          <TableCell className="font-mono">{violation.certificateId}</TableCell>
                          <TableCell className="font-medium">{violation.host}</TableCell>
                          <TableCell>{violation.violationType}</TableCell>
                          <TableCell className="max-w-xs truncate">{violation.description}</TableCell>
                          <TableCell>{getSeverityBadge(violation.severity)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="breakdown" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Score Breakdown</CardTitle>
                <CardDescription>
                  Detailed breakdown of compliance scores by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                {breakdown ? (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Key Length Compliance</span>
                        <span className={`font-bold ${getScoreColor(breakdown.keyLengthScore)}`}>
                          {breakdown.keyLengthScore}%
                        </span>
                      </div>
                      <Progress value={breakdown.keyLengthScore} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Algorithm Compliance</span>
                        <span className={`font-bold ${getScoreColor(breakdown.algorithmScore)}`}>
                          {breakdown.algorithmScore}%
                        </span>
                      </div>
                      <Progress value={breakdown.algorithmScore} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Validity Period Compliance</span>
                        <span className={`font-bold ${getScoreColor(breakdown.validityScore)}`}>
                          {breakdown.validityScore}%
                        </span>
                      </div>
                      <Progress value={breakdown.validityScore} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Lifecycle Management</span>
                        <span className={`font-bold ${getScoreColor(breakdown.lifecycleScore)}`}>
                          {breakdown.lifecycleScore}%
                        </span>
                      </div>
                      <Progress value={breakdown.lifecycleScore} className="h-2" />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No breakdown data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
