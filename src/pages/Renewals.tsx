import { useState, useEffect } from "react";
import { RefreshCw, Search, Trash2, Download, CheckCircle, XCircle, Loader2, ArrowUp, ArrowDown } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/ui/search-bar";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { CreateRenewalDialog, RenewalRequest } from "@/components/renewals/CreateRenewalDialog";
import { toast } from "sonner";
import { certificatesApi } from "@/lib/api";
import type { CertificateResponse } from "@/lib/api/types";
import { extractContent } from "@/lib/api/types/pagination";

export default function Renewals() {
  const [certificates, setCertificates] = useState<CertificateResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [renewalRequests, setRenewalRequests] = useState<RenewalRequest[]>([]);
  
  // Pagination state for expiring certificates
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [sortBy, setSortBy] = useState("validTo");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("ASC");

  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize, searchQuery, sortBy, sortOrder]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await certificatesApi.getAll({
        page: currentPage,
        size: pageSize,
        search: searchQuery || undefined,
        sortBy,
        sortOrder,
      });
      
      // Handle paginated response
      if (data && typeof data === 'object' && 'content' in data) {
        const allCerts = Array.isArray(data.content) ? data.content : [];
        setCertificates(allCerts);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
      } else {
        // Fallback for non-paginated responses
        const certs = extractContent(data);
        setCertificates(certs);
        setTotalElements(certs.length);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Failed to fetch certificates:", error);
      toast.error("Failed to load renewal data");
      setCertificates([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRequest = (request: RenewalRequest) => {
    setRenewalRequests((prev) => [...prev, request]);
  };

  const handleRenewCertificate = async (certId: number) => {
    try {
      await certificatesApi.renew(certId);
      toast.success("Certificate renewed successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to renew certificate");
    }
  };

  const handleEnableAutoRenew = async (certId: number) => {
    try {
      await certificatesApi.enableAutoRenew({ certificateId: certId, renewBeforeDays: 30 });
      toast.success("Auto-renewal enabled");
      fetchData();
    } catch (error) {
      toast.error("Failed to enable auto-renewal");
    }
  };

  const handleDeleteRequest = (id: string) => {
    setRenewalRequests((prev) => prev.filter((r) => r.id !== id));
    toast.success("Request deleted");
  };

  const handleApprove = async (request: RenewalRequest) => {
    // Find the certificate by commonName and renew it
    const cert = certificates.find(c => c.commonName === request.certificateAlias || c.certificateName === request.certificateAlias);
    if (cert) {
      await handleRenewCertificate(cert.id);
      setRenewalRequests((prev) =>
        prev.map((r) => (r.id === request.id ? { ...r, status: "completed" as const } : r))
      );
    } else {
      setRenewalRequests((prev) =>
        prev.map((r) => (r.id === request.id ? { ...r, status: "completed" as const } : r))
      );
      toast.success("Renewal request approved");
    }
  };

  const handleReject = (id: string) => {
    setRenewalRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "rejected" as const } : r))
    );
    toast.success("Renewal request rejected");
  };

  const handleDownload = (request: RenewalRequest) => {
    const certContent = `-----BEGIN CERTIFICATE-----
Certificate Alias: ${request.certificateAlias}
Certificate Type: ${request.certificateType}
New Validity: ${request.newValidityDays} days
Renewed At: ${new Date().toISOString()}
-----END CERTIFICATE-----`;

    const blob = new Blob([certContent], { type: "application/x-pem-file" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${request.certificateAlias}-renewed.pem`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Certificate downloaded");
  };

  const getDaysToExpiry = (validTo: string) => {
    const expiryDate = new Date(validTo);
    const today = new Date();
    return Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getExpiryBadge = (days: number) => {
    if (days < 0) return <Badge variant="destructive">Expired</Badge>;
    if (days <= 7) return <Badge variant="destructive">Critical ({days} days)</Badge>;
    if (days <= 30) return <Badge className="bg-yellow-500">Expiring ({days} days)</Badge>;
    return <Badge variant="secondary">{days} days</Badge>;
  };

  const filteredRequests = renewalRequests.filter(
    (r) =>
      r.certificateAlias.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.certificateType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: RenewalRequest["status"]) => {
    const variants: Record<RenewalRequest["status"], "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      "in-progress": "default",
      completed: "outline",
      rejected: "destructive",
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
      medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
      high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100",
      critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[priority] || ""}`}>
        {priority}
      </span>
    );
  };

  const statusCounts = {
    pending: renewalRequests.filter((r) => r.status === "pending").length,
    inProgress: renewalRequests.filter((r) => r.status === "in-progress").length,
    completed: renewalRequests.filter((r) => r.status === "completed").length,
    rejected: renewalRequests.filter((r) => r.status === "rejected").length,
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Renewal Management</h1>
            <p className="text-muted-foreground">
              Track and manage certificate renewals
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchData}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <CreateRenewalDialog onSubmit={handleAddRequest} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Certificates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalElements}</div>
              <p className="text-xs text-muted-foreground">In system</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusCounts.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{statusCounts.completed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">
                {certificates.filter((c) => c.validTo && getDaysToExpiry(c.validTo) <= 30 && getDaysToExpiry(c.validTo) > 0).length}
              </div>
              <p className="text-xs text-muted-foreground">Within 30 days</p>
            </CardContent>
          </Card>
        </div>

        {/* Expiring Certificates from API */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div>
                <CardTitle>All Certificates ({totalElements} total)</CardTitle>
                <CardDescription>
                  Manage and renew your certificates
                </CardDescription>
              </div>
              
              {/* Search Bar */}
              <SearchBar
                value={searchQuery}
                onChange={(value) => {
                  setSearchQuery(value);
                  setCurrentPage(0);
                }}
                placeholder="Search by name, common name, serial..."
              />

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
                      <SelectItem value="validTo">Expiry Date</SelectItem>
                      <SelectItem value="validFrom">Valid From</SelectItem>
                      <SelectItem value="commonName">Common Name</SelectItem>
                      <SelectItem value="certificateName">Certificate Name</SelectItem>
                      <SelectItem value="issuer">Issuer</SelectItem>
                      <SelectItem value="serialNumber">Serial Number</SelectItem>
                      <SelectItem value="createdAt">Created Date</SelectItem>
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
            {!loading && certificates.length === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center text-center">
                <CheckCircle className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No certificates found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  No certificates match your current filters
                </p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name / Alias</TableHead>
                      <TableHead>Common Name</TableHead>
                      <TableHead>Issuer</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certificates.map((cert) => {
                    const daysLeft = cert.validTo ? getDaysToExpiry(cert.validTo) : 0;
                    return (
                      <TableRow key={cert.id}>
                        <TableCell className="font-medium">{cert.certificateName || cert.commonName || "-"}</TableCell>
                        <TableCell>{cert.commonName || "-"}</TableCell>
                        <TableCell className="max-w-[150px] truncate">{cert.issuer || "-"}</TableCell>
                        <TableCell>{cert.validTo ? new Date(cert.validTo).toLocaleDateString() : "-"}</TableCell>
                        <TableCell>{getExpiryBadge(daysLeft)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleRenewCertificate(cert.id)}
                            >
                              <RefreshCw className="h-4 w-4 mr-1" />
                              Renew
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEnableAutoRenew(cert.id)}
                            >
                              Auto-Renew
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {totalPages > 0 && (
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
              </>
            )}
          </CardContent>
        </Card>

        {/* Manual Renewal Requests */}
        {renewalRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Manual Renewal Requests</CardTitle>
              <CardDescription>
                Renewal requests created manually
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Certificate Alias</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Current Expiry</TableHead>
                    <TableHead>New Validity</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.certificateAlias}</TableCell>
                      <TableCell>{request.certificateType}</TableCell>
                      <TableCell>{request.currentExpiryDate}</TableCell>
                      <TableCell>{request.newValidityDays} days</TableCell>
                      <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>
                        {new Date(request.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {request.status === "pending" && (
                            <>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleApprove(request)}
                                title="Approve"
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleReject(request.id)}
                                title="Reject"
                              >
                                <XCircle className="h-4 w-4 text-red-600" />
                              </Button>
                            </>
                          )}
                          {request.status === "completed" && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDownload(request)}
                              title="Download Certificate"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          {request.status !== "completed" && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDeleteRequest(request.id)}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
