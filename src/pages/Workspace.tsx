import { useEffect, useState } from "react";
import { FileText, Search, Download, Clock, Loader2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { SearchBar } from "@/components/ui/search-bar";
import { certificatesApi } from "@/lib/api";
import type { CertificateResponse } from "@/lib/api/types";
import { useAuth } from "@/contexts/AuthContext";

export default function Workspace() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [certificates, setCertificates] = useState<CertificateResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("ASC");

  useEffect(() => {
    const fetchCertificates = async () => {
      setIsLoading(true);
      try {
        const data = await certificatesApi.getAll({
          page: currentPage,
          size: pageSize,
          search: searchQuery || undefined,
          sortBy,
          sortOrder,
        });
        
        if (data && typeof data === 'object' && 'content' in data) {
          setCertificates(Array.isArray(data.content) ? data.content : []);
          setTotalPages(data.totalPages || 0);
          setTotalElements(data.totalElements || 0);
        } else {
          setCertificates(Array.isArray(data) ? data : []);
          setTotalElements(Array.isArray(data) ? data.length : 0);
          setTotalPages(1);
        }
      } catch (error) {
        console.error("Failed to fetch certificates:", error);
        toast.error("Failed to load certificate requests");
        setCertificates([]);
        setTotalElements(0);
        setTotalPages(0);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCertificates();
  }, [user, currentPage, pageSize, searchQuery, sortBy, sortOrder]);

  const activeCount = certificates.filter((c) => !c.expired).length;
  const expiredCount = certificates.filter((c) => c.expired).length;
  const expiringCount = certificates.filter((c) => {
    if (c.expired || !c.validTo) return false;
    const daysLeft = Math.ceil((new Date(c.validTo).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysLeft > 0 && daysLeft <= 30;
  }).length;

  const getStatusBadge = (cert: CertificateResponse) => {
    if (cert.expired) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    if (!cert.validTo) {
      return <Badge variant="outline">Unknown</Badge>;
    }
    const daysLeft = Math.ceil((new Date(cert.validTo).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 0) {
      return <Badge variant="destructive">Expired</Badge>;
    } else if (daysLeft <= 30) {
      return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">Expiring Soon</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Active</Badge>;
    }
  };

  const handleDownload = (cert: CertificateResponse) => {
    // Use the actual certificate data if available
    const certContent = cert.certData || `-----BEGIN CERTIFICATE-----
Certificate ID: ${cert.id}
Name: ${cert.certificateName}
Common Name: ${cert.commonName || 'N/A'}
Issuer: ${cert.issuer || 'N/A'}
Serial Number: ${cert.serialNumber || 'N/A'}
Valid From: ${cert.validFrom || 'N/A'}
Valid To: ${cert.validTo || 'N/A'}
-----END CERTIFICATE-----`;

    const blob = new Blob([certContent], { type: "application/x-pem-file" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${cert.commonName?.replace(/\./g, "_").replace(/\*/g, "wildcard") || cert.certificateName?.replace(/\s+/g, "_") || `cert-${cert.id}`}.pem`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Certificate downloaded");
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading requests...</span>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Requests</h1>
            <p className="text-muted-foreground">View your certificates and their status</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalElements}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{activeCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{expiringCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Expired</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{expiredCount}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>My Certificates</CardTitle>
                  <CardDescription>
                    All your certificates and their status ({totalElements} total)
                  </CardDescription>
                </div>
                <SearchBar
                  value={searchQuery}
                  onChange={(value) => {
                    setSearchQuery(value);
                    setCurrentPage(0);
                  }}
                  placeholder="Search certificates..."
                />
              </div>
              {/* Sorting Controls */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
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
                      <SelectItem value="createdAt">Created Date</SelectItem>
                      <SelectItem value="certificateName">Name</SelectItem>
                      <SelectItem value="commonName">Common Name</SelectItem>
                      <SelectItem value="validFrom">Valid From</SelectItem>
                      <SelectItem value="validTo">Valid To</SelectItem>
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
            {certificates.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center text-center">
                <Clock className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No certificates found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {searchQuery ? "Try adjusting your search" : "Your certificates will appear here."}
                </p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Certificate Name</TableHead>
                      <TableHead>Common Name</TableHead>
                      <TableHead>Issuer</TableHead>
                      <TableHead>Serial Number</TableHead>
                      <TableHead>Valid From</TableHead>
                      <TableHead>Valid To</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certificates.map((cert) => (
                      <TableRow key={cert.id}>
                        <TableCell className="font-medium">{cert.certificateName}</TableCell>
                        <TableCell>{cert.commonName || "N/A"}</TableCell>
                        <TableCell>{cert.issuer || "N/A"}</TableCell>
                        <TableCell className="font-mono text-sm">{cert.serialNumber || "N/A"}</TableCell>
                        <TableCell>
                          {cert.validFrom ? new Date(cert.validFrom).toLocaleDateString() : "N/A"}
                        </TableCell>
                        <TableCell>
                          {cert.validTo ? new Date(cert.validTo).toLocaleDateString() : "N/A"}
                        </TableCell>
                        <TableCell>{getStatusBadge(cert)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDownload(cert)}
                            title="Download Certificate"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
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
