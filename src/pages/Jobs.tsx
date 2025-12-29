import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Loader2, PlayCircle, CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { jobsApi } from "@/lib/api";
import type { BackgroundJob } from "@/lib/api/types";

export default function Jobs() {
  const [jobs, setJobs] = useState<BackgroundJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"my" | "running" | "recent">("my");

  useEffect(() => {
    fetchJobs();
  }, [activeTab]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      let data: BackgroundJob[];
      switch (activeTab) {
        case "running":
          data = await jobsApi.getRunning();
          break;
        case "recent":
          data = await jobsApi.getRecent();
          break;
        default:
          data = await jobsApi.getMyJobs();
      }
      setJobs(data || []);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { icon: React.ReactNode; className: string }> = {
      PENDING: { icon: <Clock className="h-3 w-3 mr-1" />, className: "bg-yellow-500/10 text-yellow-500" },
      RUNNING: { icon: <PlayCircle className="h-3 w-3 mr-1" />, className: "bg-blue-500/10 text-blue-500" },
      COMPLETED: { icon: <CheckCircle className="h-3 w-3 mr-1" />, className: "bg-green-500/10 text-green-500" },
      FAILED: { icon: <XCircle className="h-3 w-3 mr-1" />, className: "bg-red-500/10 text-red-500" },
    };
    const { icon, className } = config[status] || { icon: null, className: "" };
    return (
      <Badge className={`flex items-center ${className}`}>
        {icon}
        {status}
      </Badge>
    );
  };

  const runningCount = jobs.filter((j) => j.running).length;
  const completedCount = jobs.filter((j) => j.status === "COMPLETED").length;
  const failedCount = jobs.filter((j) => j.status === "FAILED").length;

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
            <h1 className="text-3xl font-bold">Background Jobs</h1>
            <p className="text-muted-foreground">Track async job status and progress</p>
          </div>
          <Button onClick={fetchJobs} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{jobs.length}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Running</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-blue-500" />
                <span className="text-2xl font-bold">{runningCount}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-2xl font-bold">{completedCount}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="text-2xl font-bold">{failedCount}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <Button variant={activeTab === "my" ? "default" : "ghost"} onClick={() => setActiveTab("my")}>
            My Jobs
          </Button>
          <Button variant={activeTab === "running" ? "default" : "ghost"} onClick={() => setActiveTab("running")}>
            Running
          </Button>
          <Button variant={activeTab === "recent" ? "default" : "ghost"} onClick={() => setActiveTab("recent")}>
            Recent (24h)
          </Button>
        </div>

        {/* Jobs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Jobs List</CardTitle>
            <CardDescription>View and track background job progress</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No jobs found
                    </TableCell>
                  </TableRow>
                ) : (
                  jobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-mono text-sm">{job.jobId}</TableCell>
                      <TableCell>{job.jobType}</TableCell>
                      <TableCell>{getStatusBadge(job.status)}</TableCell>
                      <TableCell className="w-32">
                        <div className="space-y-1">
                          <Progress value={job.progress} className="h-2" />
                          <span className="text-xs text-muted-foreground">{job.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {job.startedAt ? new Date(job.startedAt).toLocaleString() : "-"}
                      </TableCell>
                      <TableCell>
                        {job.durationSeconds ? `${job.durationSeconds}s` : "-"}
                      </TableCell>
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
