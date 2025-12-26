import { useEffect, useState } from "react";
import { FileText, Search, Download, Clock, Loader2 } from "lucide-react";
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
import { toast } from "sonner";
import { certificatesApi } from "@/lib/api";
import type { Certificate } from "@/lib/api/types";
import { useAuth } from "@/contexts/AuthContext";

export default function Workspace() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCertificates = async () => {
      setIsLoading(true);
      try {
        // Fetch all certificates (user-specific endpoint would use user ID)
        const certs = await certificatesApi.getAll();
        setCertificates(Array.isArray(certs) ? certs : []);
      } catch (error) {
        console.error("Failed to fetch certificates:", error);
        toast.error("Failed to load certificate requests");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCertificates();
  }, [user]);

  const filteredCertificates = certificates.filter(
    (c) =>
      c.host?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.issuerCA?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.algorithm?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingCount = certificates.filter((c) => c.status === "ACTIVE").length;
  const approvedCount = certificates.filter((c) => c.status === "ACTIVE").length;
  const expiredCount = certificates.filter((c) => c.status === "EXPIRED").length;
  const revokedCount = certificates.filter((c) => c.status === "REVOKED").length;

  const getStatusBadge = (status: Certificate["status"]) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Active</Badge>;
      case "EXPIRED":
        return <Badge variant="secondary">Expired</Badge>;
      case "REVOKED":
        return <Badge variant="destructive">Revoked</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleDownload = (cert: Certificate) => {
    const certContent = `-----BEGIN CERTIFICATE-----
Certificate ID: ${cert.id}
Host: ${cert.host}
Issuer CA: ${cert.issuerCA}
Algorithm: ${cert.algorithm}
Valid From: ${cert.validFrom}
Valid To: ${cert.validTo}
-----END CERTIFICATE-----`;

    const blob = new Blob([certContent], { type: "application/x-pem-file" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${cert.host?.replace(/\./g, "_") || `cert-${cert.id}`}.pem`;
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
              <div className="text-2xl font-bold">{certificates.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{approvedCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Expired</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{expiredCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Revoked</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{revokedCount}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>My Certificates</CardTitle>
                <CardDescription>
                  All your certificates and their status
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search certificates..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredCertificates.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center text-center">
                <Clock className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No certificates found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your certificates will appear here.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Host</TableHead>
                    <TableHead>Issuer CA</TableHead>
                    <TableHead>Algorithm</TableHead>
                    <TableHead>Valid From</TableHead>
                    <TableHead>Valid To</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCertificates.map((cert) => (
                    <TableRow key={cert.id}>
                      <TableCell className="font-mono text-sm">{cert.id}</TableCell>
                      <TableCell className="font-medium">{cert.host}</TableCell>
                      <TableCell>{cert.issuerCA}</TableCell>
                      <TableCell>{cert.algorithm}</TableCell>
                      <TableCell>
                        {new Date(cert.validFrom).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(cert.validTo).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(cert.status)}</TableCell>
                      <TableCell className="text-right">
                        {cert.status === "ACTIVE" && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDownload(cert)}
                            title="Download Certificate"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        {cert.status === "EXPIRED" && (
                          <span className="text-sm text-muted-foreground">Renewal needed</span>
                        )}
                        {cert.status === "REVOKED" && (
                          <span className="text-sm text-destructive">Revoked</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
