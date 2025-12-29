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
  FileText, 
  Download, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Shield, 
  TrendingUp, 
  Calendar 
} from "lucide-react";
import { reportsApi } from "@/lib/api";

interface ComplianceData {
  standard: string;
  score: number;
  status: "COMPLIANT" | "PARTIAL" | "NON_COMPLIANT";
  findings: { compliant: number; nonCompliant: number; warnings: number };
  violations: Array<{
    id: number;
    certificateId: number;
    domain: string;
    issue: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    remediation: string;
  }>;
}

export default function ComplianceReports() {
  const [loading, setLoading] = useState(true);
  const [selectedStandard, setSelectedStandard] = useState("PCI-DSS");
  const [complianceData, setComplianceData] = useState<ComplianceData[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  const standards = ["PCI-DSS", "SOC2", "GDPR", "HIPAA", "NIST"];

  useEffect(() => {
    fetchComplianceData();
  }, []);

  const fetchComplianceData = async () => {
    try {
      setLoading(true);
      // Mock data
      const mockData: ComplianceData[] = [
        {
          standard: "PCI-DSS",
          score: 94.5,
          status: "COMPLIANT",
          findings: { compliant: 210, nonCompliant: 12, warnings: 23 },
          violations: [
            {
              id: 1,
              certificateId: 45,
              domain: "old-api.example.com",
              issue: "Certificate uses SHA-1 signature algorithm",
              severity: "HIGH",
              remediation: "Renew with SHA-256 or higher",
            },
            {
              id: 2,
              certificateId: 67,
              domain: "legacy.example.com",
              issue: "Certificate key size below 2048 bits",
              severity: "CRITICAL",
              remediation: "Issue new certificate with RSA 2048+ or ECC",
            },
          ],
        },
        {
          standard: "SOC2",
          score: 89.2,
          status: "PARTIAL",
          findings: { compliant: 185, nonCompliant: 22, warnings: 38 },
          violations: [
            {
              id: 3,
              certificateId: 89,
              domain: "internal.example.com",
              issue: "Self-signed certificate in production",
              severity: "MEDIUM",
              remediation: "Replace with CA-signed certificate",
            },
          ],
        },
        {
          standard: "GDPR",
          score: 97.8,
          status: "COMPLIANT",
          findings: { compliant: 245, nonCompliant: 5, warnings: 12 },
          violations: [],
        },
        {
          standard: "HIPAA",
          score: 91.3,
          status: "PARTIAL",
          findings: { compliant: 198, nonCompliant: 18, warnings: 29 },
          violations: [
            {
              id: 4,
              certificateId: 112,
              domain: "health-api.example.com",
              issue: "Certificate expires within 30 days",
              severity: "MEDIUM",
              remediation: "Schedule immediate renewal",
            },
          ],
        },
        {
          standard: "NIST",
          score: 86.5,
          status: "PARTIAL",
          findings: { compliant: 172, nonCompliant: 28, warnings: 45 },
          violations: [],
        },
      ];
      setComplianceData(mockData);
    } catch (error) {
      toast.error("Failed to fetch compliance data");
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async (format: string) => {
    try {
      toast.success(`Exporting ${selectedStandard} report as ${format.toUpperCase()}`);
      // API call would go here
    } catch (error) {
      toast.error("Failed to export report");
    }
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

  const currentData = complianceData.find((d) => d.standard === selectedStandard);

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
            <h1 className="text-3xl font-bold tracking-tight">Compliance Reports</h1>
            <p className="text-muted-foreground">
              Monitor and report on certificate compliance across standards
            </p>
          </div>
          <div className="flex items-center gap-4">
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
        <div className="grid gap-4 md:grid-cols-5">
          {complianceData.map((data) => (
            <Card
              key={data.standard}
              className={`cursor-pointer transition-all ${
                selectedStandard === data.standard ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setSelectedStandard(data.standard)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  {data.standard}
                  {getStatusBadge(data.status)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${getScoreColor(data.score)}`}>
                  {data.score}%
                </div>
                <Progress value={data.score} className="mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>

        {currentData && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="violations">Violations ({currentData.violations.length})</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Compliant</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {currentData.findings.compliant}
                    </div>
                    <p className="text-xs text-muted-foreground">certificates</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Non-Compliant</CardTitle>
                    <XCircle className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {currentData.findings.nonCompliant}
                    </div>
                    <p className="text-xs text-muted-foreground">certificates</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Warnings</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">
                      {currentData.findings.warnings}
                    </div>
                    <p className="text-xs text-muted-foreground">certificates</p>
                  </CardContent>
                </Card>
              </div>

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
                      <span className={`text-2xl font-bold ${getScoreColor(currentData.score)}`}>
                        {currentData.score}%
                      </span>
                    </div>
                    <Progress value={currentData.score} className="h-3" />
                    <div className="grid gap-2 mt-4">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        <span className="text-sm">
                          {currentData.score >= 90
                            ? "Your certificates meet the required compliance standards."
                            : "Some certificates require attention to meet compliance standards."}
                        </span>
                      </div>
                      {currentData.violations.length > 0 && (
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm">
                            {currentData.violations.length} violation(s) require immediate attention.
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
                  {currentData.violations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                      <p>No violations found for {selectedStandard}</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Domain</TableHead>
                          <TableHead>Issue</TableHead>
                          <TableHead>Severity</TableHead>
                          <TableHead>Remediation</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentData.violations.map((violation) => (
                          <TableRow key={violation.id}>
                            <TableCell className="font-medium">{violation.domain}</TableCell>
                            <TableCell>{violation.issue}</TableCell>
                            <TableCell>{getSeverityBadge(violation.severity)}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {violation.remediation}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Compliance History</CardTitle>
                  <CardDescription>
                    Track compliance score changes over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { date: "2025-12-29", score: currentData.score, change: 2.3 },
                      { date: "2025-12-22", score: currentData.score - 2.3, change: -1.5 },
                      { date: "2025-12-15", score: currentData.score - 0.8, change: 3.8 },
                      { date: "2025-12-08", score: currentData.score - 4.6, change: 1.2 },
                    ].map((entry, idx) => (
                      <div key={idx} className="flex items-center justify-between border-b pb-2">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{entry.date}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`font-bold ${getScoreColor(entry.score)}`}>
                            {entry.score.toFixed(1)}%
                          </span>
                          <span
                            className={`text-sm flex items-center ${
                              entry.change >= 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            <TrendingUp
                              className={`h-3 w-3 mr-1 ${entry.change < 0 ? "rotate-180" : ""}`}
                            />
                            {entry.change >= 0 ? "+" : ""}
                            {entry.change}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AppLayout>
  );
}