import { useState, useEffect } from "react";
import { FileText, Trash2, Search, FileCheck, FileX, Download, ArrowUp, ArrowDown } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/ui/search-bar";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { toast } from "@/hooks/use-toast";
import { IssueCertificateDialog, type CertificateRequest } from "@/components/certificates/IssueCertificateDialog";
import { format } from "date-fns";
import { certificatesApi, nmapApi } from "@/lib/api";
import type { NmapCertificateScan } from "@/lib/api/types";
import { extractContent } from "@/lib/api/types/pagination";

const purposeLabels: Record<string, string> = {
  "web-server": "Web Server",
  "client-auth": "Client Auth",
  "code-signing": "Code Signing",
  "email": "Email",
  "vpn": "VPN",
  "iot": "IoT Device",
  "api": "API Auth",
  "other": "Other",
};

export default function IssueCertificate() {
  const [requests, setRequests] = useState<CertificateRequest[]>([]);
  const [issuedCertificates, setIssuedCertificates] = useState<NmapCertificateScan[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Pagination state for issued certificates
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("ASC");
  const [portFilter, setPortFilter] = useState<string>("all");
  const [expiryFilter, setExpiryFilter] = useState<string>("all");

  // Load issued certificates on mount and when pagination changes
  useEffect(() => {
    loadIssuedCertificates();
  }, [currentPage, pageSize, searchTerm, sortBy, sortOrder, portFilter, expiryFilter]);

  const loadIssuedCertificates = async () => {
    try {
      setIsLoading(true);
      const data = await nmapApi.getAllCertificates({
        page: currentPage,
        size: pageSize,
        search: searchTerm || undefined,
        port: portFilter !== "all" ? portFilter : undefined,
        expiryDays: expiryFilter !== "all" ? parseInt(expiryFilter) : undefined,
        sortBy,
        sortOrder,
      });
      
      // Handle paginated response
      if (data && typeof data === 'object' && 'content' in data) {
        setIssuedCertificates(Array.isArray(data.content) ? data.content : []);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
      } else {
        // Fallback for non-paginated responses
        const certs = extractContent(data);
        setIssuedCertificates(certs);
        setTotalElements(certs.length);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Failed to load certificates:", error);
      toast({
        title: "Error",
        description: "Failed to load certificates from server",
        variant: "destructive",
      });
      setIssuedCertificates([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRequest = async (request: CertificateRequest) => {
    try {
      setIsLoading(true);
      
      // Issue certificate via API
      const issuedCert = await certificatesApi.issue({
        host: request.host,
        port: request.port,
        commonName: request.commonName,
        caAlias: request.caAlias || "intermediate ca",
        organization: request.organization,
        organizationalUnit: request.organizationalUnit,
        locality: request.locality,
        state: request.state,
        country: request.country,
        validityDays: request.validityInDays,
      });

      toast({
        title: "Certificate Issued",
        description: `Certificate for "${request.commonName}" has been issued successfully.`,
      });

      // Reload certificates
      await loadIssuedCertificates();
      
    } catch (error: any) {
      console.error("Failed to issue certificate:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to issue certificate",
        variant: "destructive",
      });
      
      // Still add to local requests for tracking
      setRequests((prev) => [...prev, request]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRequest = (requestId: string, commonName: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== requestId));
    toast({
      title: "Request Deleted",
      description: `Certificate request for "${commonName}" has been removed.`,
      variant: "destructive",
    });
  };

  const handleIssueRequest = (requestId: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId ? { ...r, status: "approved" as const } : r
      )
    );
    toast({
      title: "Certificate Issued",
      description: "Certificate has been issued successfully.",
    });
  };

  const handleDownload = (request: CertificateRequest) => {
    // TODO: Integrate with REST API to download actual certificate
    const certData = `-----BEGIN CERTIFICATE-----
Certificate: ${request.commonName}
Alias: ${request.alias}
Organization: ${request.organization}
Algorithm: ${request.keyPairAlgorithm}
Validity: ${request.validityInDays} days
-----END CERTIFICATE-----`;

    const blob = new Blob([certData], { type: "application/x-pem-file" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${request.alias}.pem`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download Started",
      description: `Downloading certificate "${request.commonName}"`,
    });
  };

  const filteredRequests = requests.filter((request) =>
    request.commonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.alias.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.organization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: CertificateRequest["status"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Issued</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Issue Certificate</h1>
            <p className="text-muted-foreground">Manage certificate requests</p>
          </div>
          <IssueCertificateDialog onSuccess={handleAddRequest} />
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search requests..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Issued Certificates from Server */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div>
                <CardTitle>Issued Certificates ({totalElements} total)</CardTitle>
                <CardDescription>
                  Certificates scanned and discovered from network
                </CardDescription>
              </div>
              
              {/* Search and Filters Row */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <SearchBar
                  value={searchTerm}
                  onChange={(value) => {
                    setSearchTerm(value);
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
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : issuedCertificates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No certificates found.</p>
                <p className="text-sm text-muted-foreground">Run a network scan to discover certificates.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Host</TableHead>
                      <TableHead>Algorithm</TableHead>
                      <TableHead>Key Size</TableHead>
                      <TableHead>Issuer</TableHead>
                      <TableHead>Valid From</TableHead>
                      <TableHead>Valid To</TableHead>
                      <TableHead>Ports</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {issuedCertificates.map((cert) => {
                        const daysToExpiry = cert.notAfter
                          ? Math.ceil(
                              (new Date(cert.notAfter).getTime() - new Date().getTime()) /
                                (1000 * 60 * 60 * 24)
                            )
                          : null;
                        const isExpired = daysToExpiry !== null && daysToExpiry < 0;
                        const isExpiring = daysToExpiry !== null && daysToExpiry > 0 && daysToExpiry <= 30;

                        return (
                          <TableRow key={cert.id}>
                            <TableCell className="font-medium">{cert.host || "-"}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{cert.algorithm || "Unknown"}</Badge>
                            </TableCell>
                            <TableCell>
                              {cert.publicKeySize ? `${cert.publicKeySize} bit` : "-"}
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">
                              {cert.issuerCA || "-"}
                            </TableCell>
                            <TableCell className="text-sm">
                              {cert.notBefore
                                ? format(new Date(cert.notBefore), "MMM d, yyyy")
                                : "-"}
                            </TableCell>
                            <TableCell className="text-sm">
                              {cert.notAfter
                                ? format(new Date(cert.notAfter), "MMM d, yyyy")
                                : "-"}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{cert.portsCsv || "-"}</Badge>
                            </TableCell>
                            <TableCell>
                              {cert.error ? (
                                <Badge variant="destructive">Error</Badge>
                              ) : isExpired ? (
                                <Badge variant="destructive">Expired</Badge>
                              ) : isExpiring ? (
                                <Badge className="bg-yellow-500/10 text-yellow-600">
                                  Expiring ({daysToExpiry}d)
                                </Badge>
                              ) : (
                                <Badge className="bg-green-500/10 text-green-600">Active</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </div>
            )}
            {!isLoading && totalPages > 0 && (
              <DataTablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalElements={totalElements}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(0);
                }}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Certificate Requests</CardTitle>
            <CardDescription>View and manage your certificate requests</CardDescription>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No certificate requests yet.</p>
                <p className="text-sm text-muted-foreground">Click "Raise Request" to submit a new request.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Common Name</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>CSR Type</TableHead>
                      <TableHead>Algorithm</TableHead>
                      <TableHead>Validity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {request.csrType === "with-csr" ? (
                              <FileCheck className="h-4 w-4 text-primary" />
                            ) : (
                              <FileX className="h-4 w-4 text-muted-foreground" />
                            )}
                            {request.commonName}
                          </div>
                        </TableCell>
                        <TableCell>{request.organization}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {purposeLabels[request.purpose] || request.purpose}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={request.csrType === "with-csr" ? "default" : "secondary"}>
                            {request.csrType === "with-csr" ? "With CSR" : "Without CSR"}
                          </Badge>
                        </TableCell>
                        <TableCell>{request.keyPairAlgorithm}</TableCell>
                        <TableCell>{request.validityInDays} days</TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {format(request.createdAt, "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {request.status === "pending" && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-500/10"
                                    onClick={() => handleIssueRequest(request.id)}
                                  >
                                    <FileCheck className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Issue Certificate</TooltipContent>
                              </Tooltip>
                            )}
                            {request.status === "approved" && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                                    onClick={() => handleDownload(request)}
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Download Certificate</TooltipContent>
                              </Tooltip>
                            )}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => handleDeleteRequest(request.id, request.commonName)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete Request</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
