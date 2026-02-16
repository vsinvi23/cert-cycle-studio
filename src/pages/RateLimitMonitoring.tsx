import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Shield, Search, AlertTriangle, TrendingUp, RefreshCw, ArrowUpDown, ArrowUp, ArrowDown, Filter, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { rateLimitApi } from "@/lib/api";
import type { RateLimitViolation, RateLimitMetrics } from "@/lib/api/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTablePagination } from "@/components/ui/data-table-pagination";

type SortField = 'violatedAt' | 'ipAddress' | 'endpoint' | 'userTier';
type SortOrder = 'asc' | 'desc';

export default function RateLimitMonitoring() {
  const [violations, setViolations] = useState<RateLimitViolation[]>([]);
  const [metrics, setMetrics] = useState<RateLimitMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  
  // Sorting state
  const [sortField, setSortField] = useState<SortField>('violatedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  
  // Filter state
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

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

  // Apply filters
  const filteredViolations = violations.filter((v) => {
    // Search filter
    const matchesSearch = !searchQuery || 
      v.ipAddress?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.endpoint?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.method?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Tier filter
    const matchesTier = tierFilter === 'all' || 
      (tierFilter === 'none' && !v.userTier) ||
      v.userTier === tierFilter;
    
    // Date filter
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const violationDate = new Date(v.violatedAt);
      const now = new Date();
      const hoursDiff = (now.getTime() - violationDate.getTime()) / (1000 * 60 * 60);
      
      switch (dateFilter) {
        case '1h':
          matchesDate = hoursDiff <= 1;
          break;
        case '24h':
          matchesDate = hoursDiff <= 24;
          break;
        case '7d':
          matchesDate = hoursDiff <= 168;
          break;
        case '30d':
          matchesDate = hoursDiff <= 720;
          break;
      }
    }
    
    return matchesSearch && matchesTier && matchesDate;
  });
  
  // Apply sorting
  const sortedViolations = [...filteredViolations].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'violatedAt':
        comparison = new Date(a.violatedAt).getTime() - new Date(b.violatedAt).getTime();
        break;
      case 'ipAddress':
        comparison = (a.ipAddress || '').localeCompare(b.ipAddress || '');
        break;
      case 'endpoint':
        comparison = (a.endpoint || '').localeCompare(b.endpoint || '');
        break;
      case 'userTier':
        comparison = (a.userTier || '').localeCompare(b.userTier || '');
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });
  
  // Apply pagination
  const totalPages = Math.ceil(sortedViolations.length / pageSize);
  const paginatedViolations = sortedViolations.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );
  
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setCurrentPage(0);
  };
  
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };
  
  // Get unique tiers for filter
  const uniqueTiers = Array.from(new Set(violations.map(v => v.userTier).filter(Boolean)));

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
                  {metrics?.uniqueIps || new Set(violations.map((v) => v.ipAddress)).size}
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

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
            <CardDescription>Filter and search violations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search IP, endpoint, method..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(0);
                  }}
                />
              </div>
              
              <Select value={tierFilter} onValueChange={(value) => { setTierFilter(value); setCurrentPage(0); }}>
                <SelectTrigger>
                  <SelectValue placeholder="User Tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="none">No Tier</SelectItem>
                  {uniqueTiers.map(tier => (
                    <SelectItem key={tier} value={tier}>{tier}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={dateFilter} onValueChange={(value) => { setDateFilter(value); setCurrentPage(0); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Showing {sortedViolations.length > 0 ? currentPage * pageSize + 1 : 0}-{Math.min((currentPage + 1) * pageSize, sortedViolations.length)} of {sortedViolations.length} violations
              </p>
              {(searchQuery || tierFilter !== 'all' || dateFilter !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setTierFilter('all');
                    setDateFilter('all');
                    setCurrentPage(0);
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Violations Table */}
        <Card>
          <CardHeader>
            <CardTitle>Violation History</CardTitle>
            <CardDescription>Sortable and paginated violation records</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('ipAddress')}
                      className="h-8 px-2 hover:bg-muted"
                    >
                      IP Address
                      {getSortIcon('ipAddress')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('endpoint')}
                      className="h-8 px-2 hover:bg-muted"
                    >
                      Endpoint
                      {getSortIcon('endpoint')}
                    </Button>
                  </TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('userTier')}
                      className="h-8 px-2 hover:bg-muted"
                    >
                      User Tier
                      {getSortIcon('userTier')}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('violatedAt')}
                      className="h-8 px-2 hover:bg-muted"
                    >
                      Time
                      {getSortIcon('violatedAt')}
                    </Button>
                  </TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedViolations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      {violations.length === 0 ? 'No violations found' : 'No violations match your filters'}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedViolations.map((violation) => (
                    <TableRow key={violation.id}>
                      <TableCell className="font-mono text-sm">{violation.ipAddress}</TableCell>
                      <TableCell className="max-w-xs truncate">{violation.endpoint}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{violation.method}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{violation.violationType}</Badge>
                      </TableCell>
                      <TableCell>
                        {violation.userTier ? (
                          <Badge variant="outline">{violation.userTier}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(violation.violatedAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                        {violation.notes || '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            
            {/* Pagination Controls */}
            <DataTablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalElements={sortedViolations.length}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(0);
              }}
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
