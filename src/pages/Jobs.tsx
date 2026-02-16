import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Loader2, PlayCircle, CheckCircle, XCircle, Clock, RefreshCw, ArrowUp, ArrowDown, Search } from "lucide-react";
import { toast } from "sonner";
import { SearchBar } from "@/components/ui/search-bar";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { jobsApi } from "@/lib/api";
import type { BackgroundJob } from "@/lib/api/types";
import { extractContent } from "@/lib/api/types/pagination";

export default function Jobs() {
  const [jobs, setJobs] = useState<BackgroundJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"my" | "running" | "recent">("my");

  // Pagination state
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("ASC");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [hoursFilter, setHoursFilter] = useState<number>(24);

  useEffect(() => {
    fetchJobs();
  }, [activeTab, page, pageSize, sortBy, sortOrder, statusFilter, hoursFilter]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size: pageSize,
        sortBy,
        sortOrder,
        status: statusFilter !== "all" ? statusFilter : undefined,
      };

      let response;
      switch (activeTab) {
        case "running":
          response = await jobsApi.getByStatus("RUNNING", params);
          break;
        case "recent":
          response = await jobsApi.getRecent({ ...params, hours: hoursFilter });
          break;
        default:
          response = await jobsApi.getMyJobs(params);
      }

      if (response && typeof response === 'object' && 'content' in response) {
        setJobs(Array.isArray(response.content) ? response.content : []);
        setTotalPages(response.totalPages || 0);
        setTotalElements(response.totalElements || 0);
      } else {
        const jobsList = extractContent(response);
        setJobs(jobsList);
        setTotalElements(jobsList.length);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
      toast.error("Failed to load jobs");
      setJobs([]);
      setTotalElements(0);
      setTotalPages(0);
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

  // Calculate summary from current page data
  const runningCount = jobs.filter((j) => j.status === "RUNNING").length;
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
                <span className="text-2xl font-bold">{totalElements}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">All jobs</p>
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
              <p className="text-xs text-muted-foreground mt-1">On current page</p>
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
              <p className="text-xs text-muted-foreground mt-1">On current page</p>
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
              <p className="text-xs text-muted-foreground mt-1">On current page</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <Button variant={activeTab === "my" ? "default" : "ghost"} onClick={() => { setActiveTab("my"); setPage(0); }}>
            My Jobs
          </Button>
          <Button variant={activeTab === "running" ? "default" : "ghost"} onClick={() => { setActiveTab("running"); setPage(0); }}>
            Running
          </Button>
          <Button variant={activeTab === "recent" ? "default" : "ghost"} onClick={() => { setActiveTab("recent"); setPage(0); }}>
            Recent
          </Button>
        </div>

        {/* Jobs Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div>
                <CardTitle>Jobs List ({totalElements} total)</CardTitle>
                <CardDescription>View and track background job progress</CardDescription>
              </div>

              {/* Filters Row */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Select 
                  value={statusFilter} 
                  onValueChange={(value) => { 
                    setStatusFilter(value); 
                    setPage(0); 
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="RUNNING">Running</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                  </SelectContent>
                </Select>

                {activeTab === "recent" && (
                  <Select 
                    value={hoursFilter.toString()} 
                    onValueChange={(value) => { 
                      setHoursFilter(parseInt(value)); 
                      setPage(0); 
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Time Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">Last 12 Hours</SelectItem>
                      <SelectItem value="24">Last 24 Hours</SelectItem>
                      <SelectItem value="48">Last 48 Hours</SelectItem>
                      <SelectItem value="72">Last 72 Hours</SelectItem>
                      <SelectItem value="168">Last 7 Days</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Sorting Controls */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 border-t pt-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Sort by:</span>
                  <Select
                    value={sortBy}
                    onValueChange={(value) => {
                      setSortBy(value);
                      setPage(0);
                    }}
                  >
                    <SelectTrigger className="w-[180px] h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Created Date</SelectItem>
                      <SelectItem value="updatedAt">Updated Date</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                      <SelectItem value="jobType">Job Type</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Order:</span>
                  <div className="flex gap-1">
                    <Button
                      variant={sortOrder === "ASC" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setSortOrder("ASC");
                        setPage(0);
                      }}
                      className="h-9"
                    >
                      <ArrowUp className="h-4 w-4 mr-1" />
                      Ascending
                    </Button>
                    <Button
                      variant={sortOrder === "DESC" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setSortOrder("DESC");
                        setPage(0);
                      }}
                      className="h-9"
                    >
                      <ArrowDown className="h-4 w-4 mr-1" />
                      Descending
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead>Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No jobs found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  jobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-mono text-sm">{job.id}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{job.jobType || "UNKNOWN"}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(job.status)}</TableCell>
                      <TableCell className="w-32">
                        <div className="space-y-1">
                          <Progress value={job.progress || 0} className="h-2" />
                          <span className="text-xs text-muted-foreground">{job.progress || 0}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {job.createdAt ? new Date(job.createdAt).toLocaleString() : "-"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {job.updatedAt ? new Date(job.updatedAt).toLocaleString() : "-"}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-sm">
                        {job.result || "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {jobs.length > 0 && totalPages > 0 && (
              <DataTablePagination
                currentPage={page}
                totalPages={totalPages}
                pageSize={pageSize}
                totalElements={totalElements}
                onPageChange={setPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setPage(0);
                }}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
