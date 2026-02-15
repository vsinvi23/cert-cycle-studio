import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Radar, Shield, AlertTriangle, CheckCircle, XCircle, Loader2, Globe, Eye, FilePlus, Filter, RefreshCw, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { SearchBar } from "@/components/ui/search-bar";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { CertificateDetailsDialog } from "@/components/network-scan/CertificateDetailsDialog";
import { RequestCertificateDialog } from "@/components/network-scan/RequestCertificateDialog";
import { networkScanApi, nmapApi } from "@/lib/api";
import type { NmapCertificateScan } from "@/lib/api/types";

interface DiscoveredCertificate {
  id: string;
  endpoint: string;
  port: number;
  commonName: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  daysToExpiry: number;
  protocol: string;
  status: "valid" | "expiring" | "expired" | "invalid";
}

export default function NetworkScan() {
  // Scan tab state
  const [networkRange, setNetworkRange] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [discoveredCerts, setDiscoveredCerts] = useState<DiscoveredCertificate[]>([]);
  
  // Certificate list tab state (paginated from backend)
  const [allCertificates, setAllCertificates] = useState<NmapCertificateScan[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [portFilter, setPortFilter] = useState<string>("all");
  const [expiryFilter, setExpiryFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("ASC");
  
  // Legacy scan results filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [protocolFilter, setProtocolFilter] = useState<string>("all");
  
  // Dialog state
  const [selectedCert, setSelectedCert] = useState<DiscoveredCertificate | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);

  // Fetch all certificates from backend with pagination
  useEffect(() => {
    fetchAllCertificates();
  }, [currentPage, pageSize, searchQuery, portFilter, expiryFilter, sortBy, sortOrder]);

  const fetchAllCertificates = async () => {
    setLoading(true);
    try {
      const data = await nmapApi.getAllCertificates({
        page: currentPage,
        size: pageSize,
        search: searchQuery || undefined,
        port: portFilter !== "all" ? portFilter : undefined,
        expiryDays: expiryFilter !== "all" ? parseInt(expiryFilter) : undefined,
        sortBy,
        sortOrder,
      });
      
      // Handle paginated response (Spring Boot PageImpl format)
      if (data && typeof data === 'object' && 'content' in data) {
        setAllCertificates(Array.isArray(data.content) ? data.content : []);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
      } else {
        // Fallback for non-paginated responses
        const certs = Array.isArray(data) ? data : [];
        setAllCertificates(certs);
        setTotalElements(certs.length);
        setTotalPages(1);
      }
    } catch (error: any) {
      console.error("Failed to fetch certificates:", error);
      toast.error("Failed to load certificates");
      setAllCertificates([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const calculateDaysToExpiry = (validTo: string): number => {
    const expiryDate = new Date(validTo);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatus = (daysToExpiry: number): DiscoveredCertificate["status"] => {
    if (daysToExpiry < 0) return "expired";
    if (daysToExpiry <= 30) return "expiring";
    return "valid";
  };

  const mapApiResponseToDiscoveredCert = (cert: NmapCertificateScan): DiscoveredCertificate | null => {
    // Skip certificates with errors or missing data
    if (cert.error || !cert.notAfter || !cert.notBefore) {
      return null;
    }
    
    const daysToExpiry = calculateDaysToExpiry(cert.notAfter);
    const ports = cert.portsCsv?.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p)) || [];
    
    return {
      id: String(cert.id),
      endpoint: cert.host,
      port: ports[0] || 443,
      commonName: cert.host, // Use host as commonName since it's not in the response
      issuer: cert.issuerCA || 'Unknown',
      validFrom: cert.notBefore,
      validTo: cert.notAfter,
      daysToExpiry,
      protocol: `TLS (${cert.algorithm || 'Unknown'})`,
      status: getStatus(daysToExpiry),
    };
  };

  const handleScan = async () => {
    if (!networkRange.trim()) {
      toast.error("Please enter a network range or IP address to scan.");
      return;
    }

    setIsScanning(true);
    setDiscoveredCerts([]);

    try {
      // Parse the network range input into target objects
      const targetHosts = networkRange.split(',').map(t => t.trim()).filter(Boolean);
      
      const targets = targetHosts.map(input => {
        // Check if input contains a port (format: host:port)
        const portMatch = input.match(/^(.+):(\d+)$/);
        
        if (portMatch) {
          // User specified a port, use only that port
          const host = portMatch[1];
          const port = parseInt(portMatch[2]);
          return {
            host,
            ports: [{ port }]
          };
        } else {
          // No port specified, scan without ports (let backend handle default behavior)
          return {
            host: input,
            ports: []
          };
        }
      });
      
      const results = await networkScanApi.scan({
        targets,
      });

      const mappedCerts = (Array.isArray(results) ? results : [results])
        .map(mapApiResponseToDiscoveredCert)
        .filter((cert): cert is DiscoveredCertificate => cert !== null);
      
      setDiscoveredCerts(mappedCerts);
      
      toast.success(`Discovered ${mappedCerts.length} certificate endpoints.`);
    } catch (error) {
      console.error("Scan failed:", error);
      toast.error("Failed to perform network scan. Please check your connection.");
    } finally {
      setIsScanning(false);
    }
  };

  const getStatusBadge = (status: DiscoveredCertificate["status"]) => {
    switch (status) {
      case "valid":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
            <CheckCircle className="mr-1 h-3 w-3" />
            Valid
          </Badge>
        );
      case "expiring":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Expiring Soon
          </Badge>
        );
      case "expired":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
            <XCircle className="mr-1 h-3 w-3" />
            Expired
          </Badge>
        );
      case "invalid":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
            <XCircle className="mr-1 h-3 w-3" />
            Invalid
          </Badge>
        );
    }
  };

  const getExpiryColor = (days: number) => {
    if (days < 0) return "text-red-600 dark:text-red-400";
    if (days <= 30) return "text-yellow-600 dark:text-yellow-400";
    return "text-green-600 dark:text-green-400";
  };

  const filteredCerts = discoveredCerts.filter((cert) => {
    const matchesSearch =
      cert.endpoint.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.commonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.issuer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || cert.status === statusFilter;
    const matchesProtocol = protocolFilter === "all" || cert.protocol === protocolFilter;
    return matchesSearch && matchesStatus && matchesProtocol;
  });

  const uniqueProtocols = [...new Set(discoveredCerts.map((c) => c.protocol))];

  const validCount = allCertificates.filter((c) => !c.error && c.notAfter && calculateDaysToExpiry(c.notAfter) > 30).length;
  const expiringCount = allCertificates.filter((c) => !c.error && c.notAfter && calculateDaysToExpiry(c.notAfter) > 0 && calculateDaysToExpiry(c.notAfter) <= 30).length;
  const expiredCount = allCertificates.filter((c) => !c.error && c.notAfter && calculateDaysToExpiry(c.notAfter) < 0).length;

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(field);
      setSortOrder("ASC");
    }
    setCurrentPage(0);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Network Certificate Scanner</h1>
            <p className="text-muted-foreground">
              Discover and analyze SSL/TLS certificates across your network
            </p>
          </div>
          <Button variant="outline" onClick={fetchAllCertificates}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalElements}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Valid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{validCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Expiring Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{expiringCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Expired</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{expiredCount}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="certificates" className="space-y-4">
          <TabsList>
            <TabsTrigger value="certificates">
              <Globe className="mr-2 h-4 w-4" />
              All Certificates
            </TabsTrigger>
            <TabsTrigger value="scan">
              <Radar className="mr-2 h-4 w-4" />
              Network Scan
            </TabsTrigger>
          </TabsList>

          {/* All Certificates Tab */}
          <TabsContent value="certificates" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4">
                  <CardTitle>Scanned Certificates ({totalElements} total)</CardTitle>
                  
                  {/* Search and Filters Row */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <SearchBar
                      value={searchQuery}
                      onChange={(value) => {
                        setSearchQuery(value);
                        setCurrentPage(0);
                      }}
                      placeholder="Search by host, IP, issuer..."
                    />
                    <Select value={portFilter} onValueChange={(value) => { setPortFilter(value); setCurrentPage(0); }}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Port" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Ports</SelectItem>
                        <SelectItem value="443">443</SelectItem>
                        <SelectItem value="8443">8443</SelectItem>
                        <SelectItem value="8080">8080</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={expiryFilter} onValueChange={(value) => { setExpiryFilter(value); setCurrentPage(0); }}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Expiry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sorting Controls */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 border-t pt-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">Sort by:</span>
                      <Select
                        value={sortBy}
                        onValueChange={(value) => {
                          setSortBy(value);
                          setCurrentPage(0);
                        }}
                      >
                        <SelectTrigger className="w-[180px] h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="id">ID</SelectItem>
                          <SelectItem value="host">Host</SelectItem>
                          <SelectItem value="createdAt">Created Date</SelectItem>
                          <SelectItem value="notBefore">Valid From</SelectItem>
                          <SelectItem value="notAfter">Valid To</SelectItem>
                          <SelectItem value="algorithm">Algorithm</SelectItem>
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
                            setCurrentPage(0);
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
                            setCurrentPage(0);
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
                {loading ? (
                  <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : allCertificates.length === 0 ? (
                  <div className="flex h-64 flex-col items-center justify-center text-center">
                    <Globe className="h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-semibold">No certificates found</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {searchQuery || portFilter !== "all" || expiryFilter !== "all"
                        ? "Try adjusting your search or filters"
                        : "Run a network scan to discover certificates"}
                    </p>
                  </div>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Host</TableHead>
                          <TableHead>Ports</TableHead>
                          <TableHead>Issuer</TableHead>
                          <TableHead>Algorithm</TableHead>
                          <TableHead>Valid From</TableHead>
                          <TableHead>Valid To</TableHead>
                          <TableHead>Days Left</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allCertificates.map((cert) => {
                          const daysLeft = cert.notAfter ? calculateDaysToExpiry(cert.notAfter) : 0;
                          const status = cert.error ? "error" : daysLeft < 0 ? "expired" : daysLeft <= 30 ? "expiring" : "valid";
                          return (
                            <TableRow key={cert.id}>
                              <TableCell className="font-medium">{cert.host}</TableCell>
                              <TableCell>{cert.portsCsv || "-"}</TableCell>
                              <TableCell className="max-w-[150px] truncate">{cert.issuerCA || "-"}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{cert.algorithm || "Unknown"}</Badge>
                              </TableCell>
                              <TableCell>{cert.notBefore ? new Date(cert.notBefore).toLocaleDateString() : "-"}</TableCell>
                              <TableCell>{cert.notAfter ? new Date(cert.notAfter).toLocaleDateString() : "-"}</TableCell>
                              <TableCell>
                                <span className={
                                  daysLeft < 0 
                                    ? "text-red-600 dark:text-red-400" 
                                    : daysLeft <= 30 
                                    ? "text-yellow-600 dark:text-yellow-400" 
                                    : "text-green-600 dark:text-green-400"
                                }>
                                  {cert.error ? "Error" : daysLeft < 0 ? `${Math.abs(daysLeft)} days ago` : `${daysLeft} days`}
                                </span>
                              </TableCell>
                              <TableCell>
                                {status === "valid" && (
                                  <Badge className="bg-green-500/10 text-green-500">Valid</Badge>
                                )}
                                {status === "expiring" && (
                                  <Badge className="bg-yellow-500/10 text-yellow-500">Expiring</Badge>
                                )}
                                {status === "expired" && (
                                  <Badge variant="destructive">Expired</Badge>
                                )}
                                {status === "error" && (
                                  <Badge variant="destructive">Error</Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                    <DataTablePagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      pageSize={pageSize}
                      totalElements={totalElements}
                      onPageChange={setCurrentPage}
                      onPageSizeChange={setPageSize}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Network Scan Tab */}
          <TabsContent value="scan" className="space-y-4">
            {/* Scan Input */}
            <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radar className="h-5 w-5 text-primary" />
              Network Scan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter host (e.g., example.com) or host:port (e.g., example.com:443)"
                  value={networkRange}
                  onChange={(e) => setNetworkRange(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button onClick={handleScan} disabled={isScanning}>
                {isScanning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Radar className="mr-2 h-4 w-4" />
                    Start Scan
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        {discoveredCerts.length > 0 && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Discovered</p>
                  <p className="text-2xl font-bold">{discoveredCerts.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valid</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{validCount}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900">
                  <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Expiring Soon</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{expiringCount}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900">
                  <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Expired</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{expiredCount}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results Table */}
        {discoveredCerts.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Discovered Certificates
                </CardTitle>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="valid">Valid</SelectItem>
                        <SelectItem value="expiring">Expiring</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="invalid">Invalid</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={protocolFilter} onValueChange={setProtocolFilter}>
                      <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="Protocol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Protocols</SelectItem>
                        {uniqueProtocols.map((protocol) => (
                          <SelectItem key={protocol} value={protocol}>
                            {protocol}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search certificates..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Common Name</TableHead>
                    <TableHead>Issuer</TableHead>
                    <TableHead>Protocol</TableHead>
                    <TableHead>Valid From</TableHead>
                    <TableHead>Valid To</TableHead>
                    <TableHead>Days to Expiry</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCerts.map((cert) => (
                    <TableRow key={cert.id}>
                      <TableCell className="font-medium">
                        {cert.endpoint}:{cert.port}
                      </TableCell>
                      <TableCell>{cert.commonName}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{cert.issuer}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{cert.protocol}</Badge>
                      </TableCell>
                      <TableCell>{cert.validFrom}</TableCell>
                      <TableCell>{cert.validTo}</TableCell>
                      <TableCell>
                        <span className={getExpiryColor(cert.daysToExpiry)}>
                          {cert.daysToExpiry < 0
                            ? `${Math.abs(cert.daysToExpiry)} days ago`
                            : `${cert.daysToExpiry} days`}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(cert.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedCert(cert);
                              setDetailsDialogOpen(true);
                            }}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedCert(cert);
                              setRequestDialogOpen(true);
                            }}
                            title="Request Certificate"
                          >
                            <FilePlus className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredCerts.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  No certificates found matching your search.
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isScanning && discoveredCerts.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Radar className="h-16 w-16 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">No Scan Results</h3>
              <p className="text-muted-foreground">
                Enter a network range above and start scanning to discover certificate endpoints.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Scanning State */}
        {isScanning && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
              <h3 className="mt-4 text-lg font-medium">Scanning Network...</h3>
              <p className="text-muted-foreground">
                Discovering SSL/TLS endpoints in {networkRange}
              </p>
            </CardContent>
          </Card>
        )}
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <CertificateDetailsDialog
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          certificate={selectedCert}
        />
        <RequestCertificateDialog
          open={requestDialogOpen}
          onOpenChange={setRequestDialogOpen}
          certificate={selectedCert}
        />
      </div>
    </AppLayout>
  );
}
