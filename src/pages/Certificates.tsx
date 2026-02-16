// Force rebuild - v2
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FileKey, Plus, RefreshCw, Loader2, Download, Eye, RotateCcw, XCircle, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchBar } from "@/components/ui/search-bar";
import { FilterSelect } from "@/components/ui/filter-select";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { toast } from "sonner";
import { certificatesApi } from "@/lib/api";
import type { CertificateResponse } from "@/lib/api/types";

export default function Certificates() {
  const [certificates, setCertificates] = useState<CertificateResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expiryFilter, setExpiryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("ASC");

  useEffect(() => {
    fetchCertificates();
  }, [currentPage, pageSize, searchQuery, expiryFilter, sortBy, sortOrder]);

  const fetchCertificates = async () => {
    console.log("[Certificates fetchCertificates] START - State values:", {
      currentPage,
      pageSize,
      searchQuery,
      expiryFilter,
      sortBy,
      sortOrder
    });
    
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        size: pageSize,
        search: searchQuery || undefined,
        expiryStatus: expiryFilter !== "all" ? expiryFilter as any : undefined,
        sortBy,
        sortOrder,
      };
      
      console.log("[Certificates] Calling API with params:", params);
      
      const data = await certificatesApi.getAll(params);
      
      console.log("[Certificates] API Response:", data);
      console.log("[Certificates] Has content?", 'content' in data);
      console.log("[Certificates] Data type:", typeof data);
      console.log("[Certificates] Is object?", data && typeof data === 'object');
      
      // Handle paginated response (Spring Boot PageImpl format)
      if (data && typeof data === 'object' && 'content' in data) {
        const extractedCerts = Array.isArray(data.content) ? data.content : [];
        console.log("[Certificates] ✅ Extracted certificates:", extractedCerts.length);
        console.log("[Certificates] Setting state - certs:", extractedCerts.length, "total:", data.totalElements, "pages:", data.totalPages);
        setCertificates(extractedCerts);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
        console.log("[Certificates] State updated successfully");
      } else {
        // Fallback for non-paginated responses
        console.log("[Certificates] ⚠️ Using fallback - treating as array");
        const certs = Array.isArray(data) ? data : [];
        setCertificates(certs);
        setTotalElements(certs.length);
        setTotalPages(1);
      }
    } catch (error: any) {
      console.error("Failed to fetch certificates:", error);
      toast.error("Failed to load certificates");
      setCertificates([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = async (certId: number) => {
    try {
      await certificatesApi.renew(certId);
      toast.success("Certificate renewed successfully");
      fetchCertificates();
    } catch (error) {
      toast.error("Failed to renew certificate");
    }
  };

  const handleRevoke = async (certId: number) => {
    try {
      await certificatesApi.revoke(certId, "SUPERSEDED");
      toast.success("Certificate revoked successfully");
      fetchCertificates();
    } catch (error) {
      toast.error("Failed to revoke certificate");
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(field);
      setSortOrder("ASC");
    }
    setCurrentPage(0); // Reset to first page when sorting
  };

  const expiryFilterOptions = [
    { label: "Active", value: "ACTIVE" },
    { label: "Expiring Soon", value: "EXPIRING_SOON" },
    { label: "Expired", value: "EXPIRED" },
  ];

  const getStatusBadge = (cert: CertificateResponse) => {
    if (cert.expired) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    const daysLeft = cert.validTo ? getDaysToExpiry(cert.validTo) : 0;
    if (daysLeft < 0) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    return <Badge className="bg-green-500/10 text-green-500">Active</Badge>;
  };

  const getDaysToExpiry = (validTo: string) => {
    const expiryDate = new Date(validTo);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getExpiryColor = (days: number) => {
    if (days < 0) return "text-red-600 dark:text-red-400";
    if (days <= 30) return "text-yellow-600 dark:text-yellow-400";
    return "text-green-600 dark:text-green-400";
  };

  console.log("[Certificates RENDER] loading:", loading, "certificates.length:", certificates.length, "totalElements:", totalElements);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Certificates</h1>
            <p className="text-muted-foreground">
              Manage your digital certificate inventory
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchCertificates} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Link to="/certificate-management/issue">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Certificate
              </Button>
            </Link>
          </div>
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
              <CardTitle className="text-sm font-medium text-muted-foreground">Current Page</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{certificates.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {certificates.filter((c) => !c.expired && c.validTo && getDaysToExpiry(c.validTo) > 0).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Expired</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {certificates.filter((c) => c.expired || (c.validTo && getDaysToExpiry(c.validTo) < 0)).length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div>
                <CardTitle>Certificate Inventory</CardTitle>
                <CardDescription>
                  All certificates managed by your organization ({totalElements} total)
                </CardDescription>
              </div>
              
              {/* Search and Filter Row */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <SearchBar
                  value={searchQuery}
                  onChange={(value) => {
                    setSearchQuery(value);
                    setCurrentPage(0);
                  }}
                  placeholder="Search certificates by name, CN, issuer..."
                />
                <FilterSelect
                  label="Status"
                  value={expiryFilter}
                  options={expiryFilterOptions}
                  onChange={(value) => {
                    setExpiryFilter(value);
                    setCurrentPage(0);
                  }}
                  placeholder="All Statuses"
                />
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
                      <SelectItem value="certificateName">Name</SelectItem>
                      <SelectItem value="commonName">Common Name</SelectItem>
                      <SelectItem value="validFrom">Valid From</SelectItem>
                      <SelectItem value="validTo">Valid To</SelectItem>
                      <SelectItem value="createdAt">Created Date</SelectItem>
                      <SelectItem value="issuer">Issuer</SelectItem>
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
            ) : certificates.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center text-center">
                <FileKey className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No certificates found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {searchQuery || expiryFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "Add your first certificate to start tracking expiration dates and renewals."}
                </p>
                {!searchQuery && expiryFilter === "all" && (
                  <Link to="/certificate-management/issue">
                    <Button className="mt-4">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Certificate
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("certificateName")}
                          className="h-8 px-2"
                        >
                          Name / Alias
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>Common Name</TableHead>
                      <TableHead>Issuer</TableHead>
                      <TableHead>Algorithm</TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("validFrom")}
                          className="h-8 px-2"
                        >
                          Valid From
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("validTo")}
                          className="h-8 px-2"
                        >
                          Valid To
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>Days Left</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certificates.map((cert) => {
                      const daysLeft = cert.validTo ? getDaysToExpiry(cert.validTo) : 0;
                      const isActive = !cert.expired && daysLeft > 0;
                      return (
                        <TableRow key={cert.id}>
                          <TableCell className="font-medium">{cert.certificateName || "-"}</TableCell>
                          <TableCell>{cert.commonName || "-"}</TableCell>
                          <TableCell className="max-w-[150px] truncate">{cert.issuer || "-"}</TableCell>
                          <TableCell>
                            <Badge variant="outline">RSA</Badge>
                          </TableCell>
                          <TableCell>{cert.validFrom ? new Date(cert.validFrom).toLocaleDateString() : "-"}</TableCell>
                          <TableCell>{cert.validTo ? new Date(cert.validTo).toLocaleDateString() : "-"}</TableCell>
                          <TableCell>
                            <span className={getExpiryColor(daysLeft)}>
                              {daysLeft < 0 ? `${Math.abs(daysLeft)} days ago` : `${daysLeft} days`}
                            </span>
                          </TableCell>
                          <TableCell>{getStatusBadge(cert)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" title="View Details">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" title="Download">
                                <Download className="h-4 w-4" />
                              </Button>
                              {isActive && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    title="Renew"
                                    onClick={() => handleRenew(cert.id)}
                                  >
                                    <RotateCcw className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    title="Revoke"
                                    onClick={() => handleRevoke(cert.id)}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
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
      </div>
    </AppLayout>
  );
}
