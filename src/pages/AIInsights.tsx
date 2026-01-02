import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Shield, 
  RefreshCw, 
  CheckCircle2, 
  XCircle,
  Clock,
  Activity,
  FileWarning,
  Eye,
  EyeOff,
  ThumbsUp,
  Zap,
  BarChart3,
  Target,
  Layers
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Mock data for Predictive Renewal Failure Detection
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
    recommendedActions: [
      "Review recent configuration changes",
      "Validate email server accessibility"
    ],
    factors: [
      { name: "Config modification", impact: "Medium" },
      { name: "Server response time", impact: "Low" }
    ]
  },
  {
    id: 3,
    certificateName: "cdn.webapp.io",
    domain: "webapp.io",
    expiryDate: "2025-02-25",
    riskScore: 15,
    failureProbability: 0.08,
    trigger: "New renewal attempt",
    recommendedActions: [
      "No immediate action required",
      "Monitor for changes"
    ],
    factors: [
      { name: "Standard renewal cycle", impact: "Low" }
    ]
  }
];

// Mock data for Certificate Risk Scoring & Anomaly Detection
const anomalies = [
  {
    id: 1,
    type: "Issuance spike",
    description: "Unusual spike in certificate issuance detected",
    severity: "high",
    detectedAt: "2025-01-02T10:30:00Z",
    details: "47 certificates issued in the last hour, compared to average of 5/hour",
    affectedDomains: ["*.example.com", "*.test.example.com"],
    status: "active"
  },
  {
    id: 2,
    type: "Domain pattern anomaly",
    description: "Unusual domain naming pattern detected",
    severity: "medium",
    detectedAt: "2025-01-02T09:15:00Z",
    details: "Multiple certificates requested for sequential subdomains (test1, test2, test3...)",
    affectedDomains: ["test1.example.com", "test2.example.com", "test3.example.com"],
    status: "active"
  },
  {
    id: 3,
    type: "Rare CA-domain combination",
    description: "Domain using unusual Certificate Authority",
    severity: "low",
    detectedAt: "2025-01-01T18:00:00Z",
    details: "production.corp.com switched from DigiCert to Let's Encrypt",
    affectedDomains: ["production.corp.com"],
    status: "dismissed"
  }
];

// Mock data for Policy Drift Detection
const policyDrifts = [
  {
    id: 1,
    rule: "Manual override threshold exceeded",
    description: "25% of renewals were manually overridden in the last 30 days",
    threshold: "20%",
    current: "25%",
    detectedAt: "2025-01-02T00:00:00Z",
    suggestedTemplate: {
      name: "Flexible Renewal Policy",
      rules: [
        "Allow renewal 45 days before expiry (current: 30 days)",
        "Auto-approve renewals for verified domains",
        "Skip manual approval for certificates < 1 year validity"
      ]
    }
  },
  {
    id: 2,
    rule: "Repeated exception pattern",
    description: "Same exception applied 5 times in 30 days: 'Extended validation bypass'",
    threshold: "3 times / 30 days",
    current: "5 times / 30 days",
    detectedAt: "2025-01-01T12:00:00Z",
    suggestedTemplate: {
      name: "Streamlined EV Policy",
      rules: [
        "Auto-approve EV bypass for internal domains",
        "Require manual approval only for external-facing certificates",
        "Log all EV bypass decisions for audit"
      ]
    }
  }
];

export default function AIInsights() {
  const [selectedPrediction, setSelectedPrediction] = useState<typeof renewalPredictions[0] | null>(null);
  const [anomalyList, setAnomalyList] = useState(anomalies);
  const [selectedDrift, setSelectedDrift] = useState<typeof policyDrifts[0] | null>(null);
  const [lastBatchRun, setLastBatchRun] = useState("2025-01-02T08:00:00Z");

  const getRiskColor = (score: number) => {
    if (score >= 70) return "text-destructive";
    if (score >= 40) return "text-yellow-500";
    return "text-green-500";
  };

  const getRiskBadge = (score: number) => {
    if (score >= 70) return <Badge variant="destructive">High Risk</Badge>;
    if (score >= 40) return <Badge className="bg-yellow-500">Medium Risk</Badge>;
    return <Badge className="bg-green-500">Low Risk</Badge>;
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high":
        return <Badge variant="destructive">High</Badge>;
      case "medium":
        return <Badge className="bg-yellow-500">Medium</Badge>;
      default:
        return <Badge variant="secondary">Low</Badge>;
    }
  };

  const handleDismissAnomaly = (id: number) => {
    setAnomalyList(prev => 
      prev.map(a => a.id === id ? { ...a, status: "dismissed" } : a)
    );
  };

  const handleMarkExpected = (id: number) => {
    setAnomalyList(prev => 
      prev.map(a => a.id === id ? { ...a, status: "expected" } : a)
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            AI Insights
          </h1>
          <p className="text-muted-foreground mt-1">
            Predictive analytics and anomaly detection for certificate management
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          Last batch run: {formatDate(lastBatchRun)}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Renewal Risk Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {renewalPredictions.filter(p => p.riskScore >= 40).length}
            </div>
            <p className="text-xs text-muted-foreground">
              certificates at elevated risk
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Anomalies</CardTitle>
            <Activity className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {anomalyList.filter(a => a.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">
              requiring attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Policy Drifts</CardTitle>
            <Layers className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{policyDrifts.length}</div>
            <p className="text-xs text-muted-foreground">
              detected in last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Important Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>AI Analysis Mode</AlertTitle>
        <AlertDescription>
          AI insights are read-only and advisory. They do NOT alter ARI schedules, initiate renewals, 
          or modify any system configurations automatically.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="renewal" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="renewal" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Renewal Predictions
          </TabsTrigger>
          <TabsTrigger value="anomaly" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Anomaly Detection
          </TabsTrigger>
          <TabsTrigger value="drift" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Policy Drift
          </TabsTrigger>
        </TabsList>

        {/* Predictive Renewal Failure Detection */}
        <TabsContent value="renewal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Predictive Renewal Failure Detection
              </CardTitle>
              <CardDescription>
                AI-powered analysis of renewal success probability. Triggered by new renewal attempts, 
                config changes, or daily batch runs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Certificate</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Trigger</TableHead>
                    <TableHead>Risk Score</TableHead>
                    <TableHead>Failure Probability</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {renewalPredictions.map((prediction) => (
                    <TableRow key={prediction.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{prediction.certificateName}</div>
                          <div className="text-sm text-muted-foreground">{prediction.domain}</div>
                        </div>
                      </TableCell>
                      <TableCell>{prediction.expiryDate}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{prediction.trigger}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={prediction.riskScore} 
                            className="w-16 h-2"
                          />
                          <span className={getRiskColor(prediction.riskScore)}>
                            {prediction.riskScore}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getRiskBadge(prediction.riskScore)}
                          <span className="text-sm">
                            {(prediction.failureProbability * 100).toFixed(0)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedPrediction(prediction)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Certificate Risk Scoring & Anomaly Detection */}
        <TabsContent value="anomaly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Certificate Risk Scoring & Anomaly Detection
              </CardTitle>
              <CardDescription>
                Detects issuance spikes, domain pattern anomalies, and rare CA-domain combinations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {anomalyList.map((anomaly) => (
                <Card 
                  key={anomaly.id} 
                  className={`${anomaly.status !== 'active' ? 'opacity-60' : ''}`}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          {anomaly.type === "Issuance spike" && <Zap className="h-5 w-5 text-yellow-500" />}
                          {anomaly.type === "Domain pattern anomaly" && <FileWarning className="h-5 w-5 text-orange-500" />}
                          {anomaly.type === "Rare CA-domain combination" && <Shield className="h-5 w-5 text-blue-500" />}
                          <h4 className="font-semibold">{anomaly.type}</h4>
                          {getSeverityBadge(anomaly.severity)}
                          {anomaly.status === "dismissed" && (
                            <Badge variant="secondary">Dismissed</Badge>
                          )}
                          {anomaly.status === "expected" && (
                            <Badge className="bg-green-500">Expected Behavior</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{anomaly.description}</p>
                        <p className="text-sm">{anomaly.details}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {anomaly.affectedDomains.map((domain, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {domain}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Detected: {formatDate(anomaly.detectedAt)}
                        </p>
                      </div>
                      {anomaly.status === "active" && (
                        <div className="flex flex-col gap-2 ml-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDismissAnomaly(anomaly.id)}
                          >
                            <EyeOff className="h-4 w-4 mr-1" />
                            Dismiss
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleMarkExpected(anomaly.id)}
                          >
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            Mark Expected
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Policy Drift Detection */}
        <TabsContent value="drift" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Policy Drift Detection
              </CardTitle>
              <CardDescription>
                Detects when manual overrides exceed 20% or the same exception is applied ≥3 times in 30 days
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {policyDrifts.map((drift) => (
                <Card key={drift.id}>
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-yellow-500" />
                          <h4 className="font-semibold">{drift.rule}</h4>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedDrift(drift)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Suggested Policy
                        </Button>
                      </div>
                      <p className="text-sm">{drift.description}</p>
                      <div className="flex gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Threshold: </span>
                          <span className="font-medium">{drift.threshold}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Current: </span>
                          <span className="font-medium text-destructive">{drift.current}</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Detected: {formatDate(drift.detectedAt)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Prediction Details Dialog */}
      <Dialog open={!!selectedPrediction} onOpenChange={() => setSelectedPrediction(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Renewal Prediction Details
            </DialogTitle>
            <DialogDescription>
              Detailed risk analysis for {selectedPrediction?.certificateName}
            </DialogDescription>
          </DialogHeader>
          {selectedPrediction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-sm text-muted-foreground">Risk Score</div>
                    <div className={`text-3xl font-bold ${getRiskColor(selectedPrediction.riskScore)}`}>
                      {selectedPrediction.riskScore}%
                    </div>
                    <Progress value={selectedPrediction.riskScore} className="mt-2" />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-sm text-muted-foreground">Failure Probability</div>
                    <div className="text-3xl font-bold">
                      {(selectedPrediction.failureProbability * 100).toFixed(0)}%
                    </div>
                    <Progress value={selectedPrediction.failureProbability * 100} className="mt-2" />
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Contributing Factors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedPrediction.factors.map((factor, idx) => (
                      <div key={idx} className="flex items-center justify-between py-1 border-b last:border-0">
                        <span>{factor.name}</span>
                        <Badge 
                          variant={factor.impact === "High" ? "destructive" : factor.impact === "Medium" ? "default" : "secondary"}
                        >
                          {factor.impact} Impact
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Recommended Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {selectedPrediction.recommendedActions.map((action, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-primary">•</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  This prediction is advisory only. It does NOT alter ARI schedule or initiate any renewal actions.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Policy Drift Template Dialog */}
      <Dialog open={!!selectedDrift} onOpenChange={() => setSelectedDrift(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Suggested Policy Template
            </DialogTitle>
            <DialogDescription>
              Read-only policy suggestion based on detected drift patterns
            </DialogDescription>
          </DialogHeader>
          {selectedDrift && (
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{selectedDrift.suggestedTemplate.name}</CardTitle>
                  <CardDescription>
                    Based on analysis of {selectedDrift.rule.toLowerCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Suggested Rules:</h4>
                    <ul className="space-y-2">
                      {selectedDrift.suggestedTemplate.rules.map((rule, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm bg-muted/50 p-2 rounded">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>Read-Only Suggestion</AlertTitle>
                <AlertDescription>
                  This is a suggested policy template based on detected patterns. Review with your security team 
                  before implementing any policy changes manually.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
