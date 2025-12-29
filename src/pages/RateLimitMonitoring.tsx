import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Shield, Search, AlertTriangle, TrendingUp, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { rateLimitApi } from "@/lib/api";
import type { RateLimitViolation, RateLimitMetrics } from "@/lib/api/types";

export default function RateLimitMonitoring() {
  const [violations, setViolations] = useState<RateLimitViolation[]>([]);
  const [metrics, setMetrics] = useState<RateLimitMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [violationsData, metricsData] = await Promise.all([
        rateLimitApi.getAllViolations(),
        rateLimitApi.getMetrics(),
      ]);
      setViolations(violationsData || []);
      setMetrics(metricsData);
    } catch (error) {
      console.error("Failed to fetch rate limit data:", error);
      toast.error("Failed to load rate limit data");
    } finally {
      setLoading(false);
    }
  };

  const filteredViolations = violations.filter(
    (v) =>
      v.ipAddress?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.endpoint?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <h1 className="text-3xl font-bold">Rate Limit Monitoring</h1>
            <p className="text-muted-foreground">Monitor rate limit violations and abuse patterns</p>
          </div>
          <Button onClick={fetchData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Violations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <span className="text-2xl font-bold">{metrics?.totalViolations || violations.length}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Unique IPs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-500" />
                <span className="text-2xl font-bold">
                  {new Set(violations.map((v) => v.ipAddress)).size}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Top Endpoint</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                <span className="text-sm font-medium truncate">
                  {Object.entries(metrics?.violationsByEndpoint || {}).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Top Offenders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span className="text-2xl font-bold">{metrics?.topOffenders?.length || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Offenders */}
        {metrics?.topOffenders && metrics.topOffenders.length > 0 && (
          <Card className="border-red-500/50 bg-red-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Top Offenders
              </CardTitle>
              <CardDescription>IPs with the highest number of violations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {metrics.topOffenders.map((offender, idx) => (
                  <Badge key={idx} variant="destructive" className="font-mono">
                    {offender.ip}: {offender.count} violations
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by IP or endpoint..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Violations Table */}
        <Card>
          <CardHeader>
            <CardTitle>Violation History</CardTitle>
            <CardDescription>All rate limit violations</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>User Tier</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredViolations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No violations found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredViolations.map((violation) => (
                    <TableRow key={violation.id}>
                      <TableCell className="font-mono text-sm">{violation.ipAddress}</TableCell>
                      <TableCell className="max-w-xs truncate">{violation.endpoint}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{violation.method}</Badge>
                      </TableCell>
                      <TableCell>{violation.violationType}</TableCell>
                      <TableCell>{violation.userTier || "-"}</TableCell>
                      <TableCell>{new Date(violation.violatedAt).toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
