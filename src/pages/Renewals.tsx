import { useState, useEffect } from "react";
import { RefreshCw, Search, Trash2, Download, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { CreateRenewalDialog, RenewalRequest } from "@/components/renewals/CreateRenewalDialog";
import { toast } from "sonner";
import { certificatesApi } from "@/lib/api";
import type { Certificate, AutoRenewConfiguration } from "@/lib/api/types";

export default function Renewals() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [renewalRequests, setRenewalRequests] = useState<RenewalRequest[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await certificatesApi.getAll();
      // Filter certificates that are expiring soon (within 60 days) or expired
      const expiringCerts = (data || []).filter((cert) => {
        const expiryDate = new Date(cert.validTo);
        const today = new Date();
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry <= 60 || cert.status === "EXPIRED";
      });
      setCertificates(expiringCerts);
    } catch (error) {
      console.error("Failed to fetch certificates:", error);
      toast.error("Failed to load renewal data");
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
    // Find the certificate by alias and renew it
    const cert = certificates.find(c => c.alias === request.certificateAlias || c.commonName === request.certificateAlias);
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

  const filteredCerts = certificates.filter(
    (cert) =>
      cert.commonName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.alias?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <CardTitle className="text-sm font-medium">Expiring Certificates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{certificates.length}</div>
              <p className="text-xs text-muted-foreground">Within 60 days</p>
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
              <CardTitle className="text-sm font-medium">Critical</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {certificates.filter((c) => getDaysToExpiry(c.validTo) <= 7).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Expiring Certificates from API */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Certificates Requiring Renewal</CardTitle>
                <CardDescription>
                  Certificates expiring within 60 days
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredCerts.length === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center text-center">
                <CheckCircle className="h-12 w-12 text-green-500/50" />
                <h3 className="mt-4 text-lg font-semibold">All certificates are healthy</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  No certificates expiring within 60 days
                </p>
              </div>
            ) : (
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
                  {filteredCerts.map((cert) => {
                    const daysLeft = getDaysToExpiry(cert.validTo);
                    return (
                      <TableRow key={cert.id}>
                        <TableCell className="font-medium">{cert.alias || cert.certificateName || "-"}</TableCell>
                        <TableCell>{cert.commonName || cert.host || "-"}</TableCell>
                        <TableCell className="max-w-[150px] truncate">{cert.issuer || cert.issuerCA || "-"}</TableCell>
                        <TableCell>{new Date(cert.validTo).toLocaleDateString()}</TableCell>
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
