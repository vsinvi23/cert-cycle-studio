import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, FileText, Download, Calendar } from "lucide-react";
import { toast } from "sonner";
import { reportsApi } from "@/lib/api";
import type { AuditLog } from "@/lib/api/types";
import { DataTablePagination } from "@/components/ui/data-table-pagination";

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  // Sorting state
  const [sortBy, setSortBy] = useState("timestamp");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  
  // Date filtering state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchLogs();
  }, [page, pageSize, sortBy, sortOrder, startDate, endDate]);

  // Reset to page 0 when search changes
  useEffect(() => {
    if (page !== 0) {
      setPage(0);
    }
  }, [searchQuery]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const sort = `${sortBy},${sortOrder.toLowerCase()}`;
      const data = await reportsApi.getAuditLogs(page, pageSize, sort, startDate || undefined, endDate || undefined);
      
      if (data && typeof data === 'object' && 'content' in data) {
        setLogs(Array.isArray(data.content) ? data.content : []);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
      } else {
        setLogs([]);
        setTotalPages(0);
        setTotalElements(0);
      }
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
      toast.error("Failed to load audit logs");
      setLogs([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering for search (applies to current page)
  const filteredLogs = Array.isArray(logs) ? logs.filter(
    (log) =>
      !searchQuery ||
      log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.performedBy?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entityType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  // Calculate pagination for filtered results
  const displayTotalElements = searchQuery ? filteredLogs.length : totalElements;
  const displayTotalPages = searchQuery ? Math.ceil(filteredLogs.length / pageSize) : totalPages;

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      SUCCESS: "bg-green-500/10 text-green-500",
      FAILED: "bg-red-500/10 text-red-500",
      PENDING: "bg-yellow-500/10 text-yellow-500",
    };
    return <Badge className={colors[status] || ""}>{status}</Badge>;
  };

  const getActionBadge = (action: string) => {
    const colors: Record<string, string> = {
      CREATE: "bg-green-500/10 text-green-500",
      UPDATE: "bg-blue-500/10 text-blue-500",
      DELETE: "bg-red-500/10 text-red-500",
      REVOKE: "bg-orange-500/10 text-orange-500",
      RENEW: "bg-purple-500/10 text-purple-500",
      LOGIN: "bg-cyan-500/10 text-cyan-500",
      LOGOUT: "bg-gray-500/10 text-gray-500",
    };
    return <Badge className={colors[action] || "bg-gray-500/10 text-gray-500"}>{action}</Badge>;
  };

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
            <h1 className="text-3xl font-bold">Audit Logs</h1>
            <p className="text-muted-foreground">Complete audit trail of system activities</p>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{displayTotalElements}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Successful</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-500" />
                <span className="text-2xl font-bold">
                  {filteredLogs.filter((l) => l.status === "SUCCESS").length}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-red-500" />
                <span className="text-2xl font-bold">
                  {filteredLogs.filter((l) => l.status === "FAILED").length}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                <span className="text-2xl font-bold">
                  {filteredLogs.filter((l) => {
                    const today = new Date();
                    const logDate = new Date(l.timestamp);
                    return logDate.toDateString() === today.toDateString();
                  }).length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Activity Log</CardTitle>
                <CardDescription>All system activities and changes</CardDescription>
              </div>
              <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 w-[200px] h-9"
                  />
                </div>

                {/* Sorting Controls */}
                <div className="flex items-center gap-2">
                  <Label className="text-sm whitespace-nowrap">Sort by:</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px] h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="timestamp">Timestamp</SelectItem>
                      <SelectItem value="action">Action</SelectItem>
                      <SelectItem value="performedBy">User</SelectItem>
                      <SelectItem value="entityType">Entity Type</SelectItem>
                      <SelectItem value="ipAddress">IP Address</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Label className="text-sm whitespace-nowrap">Order:</Label>
                  <Button
                    variant={sortOrder === "ASC" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSortOrder("ASC")}
                    className="h-9"
                  >
                    Ascending
                  </Button>
                  <Button
                    variant={sortOrder === "DESC" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSortOrder("DESC")}
                    className="h-9"
                  >
                    Descending
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Performed By</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No audit logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>{getActionBadge(log.action)}</TableCell>
                      <TableCell>{log.entityType}</TableCell>
                      <TableCell className="max-w-xs truncate">{log.description}</TableCell>
                      <TableCell>{log.performedBy}</TableCell>
                      <TableCell className="font-mono text-sm">{log.ipAddress || "-"}</TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            <DataTablePagination
              currentPage={page}
              totalPages={displayTotalPages}
              pageSize={pageSize}
              totalItems={displayTotalElements}
              onPageChange={setPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setPage(0);
              }}
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
