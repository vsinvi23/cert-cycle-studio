import { useState } from "react";
import { FileText, Search, Download, Clock } from "lucide-react";
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

interface PendingRequest {
  id: string;
  certificateAlias: string;
  commonName: string;
  type: "certificate" | "renewal" | "mutual";
  organization: string;
  requestedAt: string;
  status: "pending" | "approved" | "rejected";
}

export default function Workspace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [requests] = useState<PendingRequest[]>([
    // Sample data - will be replaced with API data
    {
      id: "1",
      certificateAlias: "web-server-prod",
      commonName: "api.example.com",
      type: "certificate",
      organization: "Example Corp",
      requestedAt: new Date().toISOString(),
      status: "pending",
    },
    {
      id: "2",
      certificateAlias: "client-auth",
      commonName: "client.example.com",
      type: "mutual",
      organization: "Example Corp",
      requestedAt: new Date(Date.now() - 86400000).toISOString(),
      status: "pending",
    },
    {
      id: "3",
      certificateAlias: "old-cert-renewal",
      commonName: "legacy.example.com",
      type: "renewal",
      organization: "Example Corp",
      requestedAt: new Date(Date.now() - 172800000).toISOString(),
      status: "approved",
    },
  ]);

  const filteredRequests = requests.filter(
    (r) =>
      r.certificateAlias.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.commonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.organization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;
  const rejectedCount = requests.filter((r) => r.status === "rejected").length;

  const getStatusBadge = (status: PendingRequest["status"]) => {
    const variants: Record<PendingRequest["status"], "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const getTypeBadge = (type: PendingRequest["type"]) => {
    const labels: Record<PendingRequest["type"], string> = {
      certificate: "Certificate",
      renewal: "Renewal",
      mutual: "Mutual TLS",
    };
    return (
      <Badge variant="outline">{labels[type]}</Badge>
    );
  };

  const handleDownload = (request: PendingRequest) => {
    const certContent = `-----BEGIN CERTIFICATE-----
Certificate Alias: ${request.certificateAlias}
Common Name: ${request.commonName}
Organization: ${request.organization}
Type: ${request.type}
Approved At: ${new Date().toISOString()}
-----END CERTIFICATE-----`;

    const blob = new Blob([certContent], { type: "application/x-pem-file" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${request.certificateAlias}.pem`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Certificate downloaded");
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Requests</h1>
            <p className="text-muted-foreground">View your certificate requests pending approval</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rejectedCount}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Certificate Requests</CardTitle>
                <CardDescription>
                  All your certificate requests and their approval status
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search requests..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredRequests.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center text-center">
                <Clock className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No requests found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your certificate requests will appear here.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Certificate Alias</TableHead>
                    <TableHead>Common Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.certificateAlias}</TableCell>
                      <TableCell>{request.commonName}</TableCell>
                      <TableCell>{getTypeBadge(request.type)}</TableCell>
                      <TableCell>{request.organization}</TableCell>
                      <TableCell>
                        {new Date(request.requestedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell className="text-right">
                        {request.status === "approved" && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDownload(request)}
                            title="Download Certificate"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        {request.status === "pending" && (
                          <span className="text-sm text-muted-foreground">Awaiting approval</span>
                        )}
                        {request.status === "rejected" && (
                          <span className="text-sm text-destructive">Request denied</span>
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
