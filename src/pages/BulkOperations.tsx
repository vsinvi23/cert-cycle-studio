import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Layers, Upload, Download, CheckCircle, XCircle, RefreshCw, Copy, FileCheck } from "lucide-react";
import { toast } from "sonner";
import { bulkApi, certificatesApi } from "@/lib/api";
import type { Certificate, BulkOperationResult } from "@/lib/api/types";

export default function BulkOperations() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCerts, setSelectedCerts] = useState<number[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"issue" | "renew" | "revoke">("issue");
  const [operationResult, setOperationResult] = useState<BulkOperationResult | null>(null);

  // Form state for bulk issue
  const [hostsInput, setHostsInput] = useState("");
  const [revokeReason, setRevokeReason] = useState("");

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
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (type: "issue" | "renew" | "revoke") => {
    setDialogType(type);
    setDialogOpen(true);
    setOperationResult(null);
  };

  const handleBulkIssue = async () => {
    const hosts = hostsInput.split("\n").filter((h) => h.trim());
    if (hosts.length === 0) {
      toast.error("Please enter at least one host");
      return;
    }

    try {
      const result = await bulkApi.issueCertificates({ certificateRequests: hosts });
      setOperationResult(result);
      toast.success(`Bulk issue completed: ${result.successCount}/${result.totalCount} succeeded`);
      fetchCertificates();
    } catch (error) {
      toast.error("Bulk issue failed");
    }
  };

  const handleBulkRenew = async () => {
    if (selectedCerts.length === 0) {
      toast.error("Please select certificates to renew");
      return;
    }

    try {
      const result = await bulkApi.renewCertificates({ certificateIds: selectedCerts });
      setOperationResult(result);
      toast.success(`Bulk renew completed: ${result.successCount}/${result.totalCount} succeeded`);
      fetchCertificates();
      setSelectedCerts([]);
    } catch (error) {
      toast.error("Bulk renew failed");
    }
  };

  const handleBulkRevoke = async () => {
    if (selectedCerts.length === 0) {
      toast.error("Please select certificates to revoke");
      return;
    }

    try {
      const result = await bulkApi.revokeCertificates({ 
        certificateIds: selectedCerts, 
        reason: revokeReason || undefined 
      });
      setOperationResult(result);
      toast.success(`Bulk revoke completed: ${result.successCount}/${result.totalCount} succeeded`);
      fetchCertificates();
      setSelectedCerts([]);
    } catch (error) {
      toast.error("Bulk revoke failed");
    }
  };

  const toggleCertSelection = (id: number) => {
    setSelectedCerts((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedCerts(certificates.map((c) => c.id));
  };

  const clearSelection = () => {
    setSelectedCerts([]);
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
            <h1 className="text-3xl font-bold">Bulk Operations</h1>
            <p className="text-muted-foreground">Perform batch operations on certificates</p>
          </div>
          <Button onClick={fetchCertificates} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => openDialog("issue")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-green-500" />
                Bulk Issue
              </CardTitle>
              <CardDescription>Issue multiple certificates at once</CardDescription>
            </CardHeader>
          </Card>
          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => openDialog("renew")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-blue-500" />
                Bulk Renew
              </CardTitle>
              <CardDescription>Renew selected certificates</CardDescription>
            </CardHeader>
          </Card>
          <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => openDialog("revoke")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                Bulk Revoke
              </CardTitle>
              <CardDescription>Revoke selected certificates</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Selection Info */}
        {selectedCerts.length > 0 && (
          <Card className="border-primary bg-primary/5">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-primary" />
                  <span className="font-medium">{selectedCerts.length} certificates selected</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={clearSelection}>
                    Clear Selection
                  </Button>
                  <Button size="sm" onClick={() => openDialog("renew")}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Renew Selected
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => openDialog("revoke")}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Revoke Selected
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Certificates List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Certificates</CardTitle>
                <CardDescription>Select certificates for bulk operations</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={selectAll}>
                Select All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {certificates.length === 0 ? (
                <p className="col-span-full text-center text-muted-foreground py-8">
                  No certificates found
                </p>
              ) : (
                certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedCerts.includes(cert.id)
                        ? "border-primary bg-primary/5"
                        : "hover:border-muted-foreground/50"
                    }`}
                    onClick={() => toggleCertSelection(cert.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{cert.commonName || cert.host}</p>
                        <p className="text-sm text-muted-foreground">{cert.issuer || cert.issuerCA}</p>
                      </div>
                      <Badge
                        className={
                          cert.status === "ACTIVE"
                            ? "bg-green-500/10 text-green-500"
                            : cert.status === "EXPIRED"
                            ? "bg-red-500/10 text-red-500"
                            : "bg-gray-500/10 text-gray-500"
                        }
                      >
                        {cert.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Expires: {new Date(cert.validTo).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {dialogType === "issue" && "Bulk Issue Certificates"}
                {dialogType === "renew" && "Bulk Renew Certificates"}
                {dialogType === "revoke" && "Bulk Revoke Certificates"}
              </DialogTitle>
              <DialogDescription>
                {dialogType === "issue" && "Enter hostnames (one per line) to issue certificates"}
                {dialogType === "renew" && `Renew ${selectedCerts.length} selected certificates`}
                {dialogType === "revoke" && `Revoke ${selectedCerts.length} selected certificates`}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              {dialogType === "issue" && (
                <div className="grid gap-2">
                  <Label>Hostnames (one per line)</Label>
                  <Textarea
                    value={hostsInput}
                    onChange={(e) => setHostsInput(e.target.value)}
                    placeholder="example.com&#10;api.example.com&#10;*.example.com"
                    rows={6}
                  />
                </div>
              )}

              {dialogType === "revoke" && (
                <div className="grid gap-2">
                  <Label>Revocation Reason (optional)</Label>
                  <Input
                    value={revokeReason}
                    onChange={(e) => setRevokeReason(e.target.value)}
                    placeholder="e.g., Key compromise, CA compromise, etc."
                  />
                </div>
              )}

              {operationResult && (
                <Card className="mt-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Operation Result</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{operationResult.successCount} succeeded</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span>{operationResult.failedCount} failed</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              {dialogType === "issue" && (
                <Button onClick={handleBulkIssue}>
                  <Upload className="h-4 w-4 mr-2" />
                  Issue Certificates
                </Button>
              )}
              {dialogType === "renew" && (
                <Button onClick={handleBulkRenew}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Renew Certificates
                </Button>
              )}
              {dialogType === "revoke" && (
                <Button variant="destructive" onClick={handleBulkRevoke}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Revoke Certificates
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
