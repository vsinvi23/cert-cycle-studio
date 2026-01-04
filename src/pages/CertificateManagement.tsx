import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FileBadge, Plus, Search, RefreshCw, Loader2, Eye, RotateCcw, XCircle, Download, Shield } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { certificatesApi, certificateOperationsApi } from "@/lib/api";
import type { Certificate } from "@/lib/api/types";

export default function CertificateManagement() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const data = await certificatesApi.getAll();
      setCertificates(data || []);
    } catch (error) {
      console.error("Failed to fetch certificates:", error);
      toast.error("Failed to load certificates");
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

  const handleValidate = async (certId: number) => {
    try {
      const result = await certificateOperationsApi.validate(certId);
      toast.success(`Validation complete: ${result}`);
    } catch (error) {
      toast.error("Failed to validate certificate");
    }
  };

  const filteredCerts = certificates.filter((cert) => {
    const matchesSearch =
      cert.commonName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.alias?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.issuer?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "active") return matchesSearch && cert.status === "ACTIVE";
    if (activeTab === "expired") return matchesSearch && cert.status === "EXPIRED";
    if (activeTab === "revoked") return matchesSearch && cert.status === "REVOKED";
    return matchesSearch;
  });

  const getStatusBadge = (status: Certificate["status"]) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-500/10 text-green-500">Active</Badge>;
      case "EXPIRED":
        return <Badge variant="destructive">Expired</Badge>;
      case "REVOKED":
        return <Badge variant="secondary">Revoked</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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
            <h1 className="text-2xl font-bold text-foreground">Certificate Management</h1>
            <p className="text-muted-foreground">Issue, revoke, and manage certificates</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchCertificates}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Link to="/certificate-management/issue">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Issue Certificate
              </Button>
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Managed</CardTitle>
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
                {certificates.filter((c) => c.status === "ACTIVE").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Expiring Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">
                {certificates.filter((c) => {
                  const days = getDaysToExpiry(c.validTo);
                  return days > 0 && days <= 30 && c.status === "ACTIVE";
                }).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Revoked</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">
                {certificates.filter((c) => c.status === "REVOKED").length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All ({certificates.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({certificates.filter((c) => c.status === "ACTIVE").length})</TabsTrigger>
            <TabsTrigger value="expired">Expired ({certificates.filter((c) => c.status === "EXPIRED").length})</TabsTrigger>
            <TabsTrigger value="revoked">Revoked ({certificates.filter((c) => c.status === "REVOKED").length})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search certificates..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Managed Certificates</CardTitle>
                <CardDescription>All certificates under management</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredCerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-muted p-4 mb-4">
                      <FileBadge className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">No certificates found</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {searchQuery
                        ? "Try a different search term"
                        : "Issue your first certificate to get started"}
                    </p>
                    {!searchQuery && (
                      <Link to="/certificate-management/issue">
                        <Button variant="outline" className="gap-2">
                          <Plus className="h-4 w-4" />
                          Issue Certificate
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Alias / Name</TableHead>
                        <TableHead>Common Name</TableHead>
                        <TableHead>Issuer</TableHead>
                        <TableHead>Algorithm</TableHead>
                        <TableHead>Valid To</TableHead>
                        <TableHead>Days Left</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCerts.map((cert) => {
                        const daysLeft = getDaysToExpiry(cert.validTo);
                        return (
                          <TableRow key={cert.id}>
                            <TableCell className="font-medium">{cert.alias || cert.certificateName || "-"}</TableCell>
                            <TableCell>{cert.commonName || cert.host || "-"}</TableCell>
                            <TableCell className="max-w-[150px] truncate">{cert.issuer || cert.issuerCA || "-"}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{cert.algorithm || "RSA"}</Badge>
                            </TableCell>
                            <TableCell>{new Date(cert.validTo).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <span className={getExpiryColor(daysLeft)}>
                                {daysLeft < 0 ? `${Math.abs(daysLeft)} days ago` : `${daysLeft} days`}
                              </span>
                            </TableCell>
                            <TableCell>{getStatusBadge(cert.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="Validate"
                                  onClick={() => handleValidate(cert.id)}
                                >
                                  <Shield className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" title="View">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" title="Download">
                                  <Download className="h-4 w-4" />
                                </Button>
                                {cert.status === "ACTIVE" && (
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
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
