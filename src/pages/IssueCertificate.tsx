import { useState } from "react";
import { FileText, Trash2, Search, FileCheck, FileX, Download } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { IssueCertificateDialog, type CertificateRequest } from "@/components/certificates/IssueCertificateDialog";
import { format } from "date-fns";

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
  const [searchTerm, setSearchTerm] = useState("");

  const handleAddRequest = (request: CertificateRequest) => {
    setRequests((prev) => [...prev, request]);
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
