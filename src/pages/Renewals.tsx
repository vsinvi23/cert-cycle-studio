import { useState } from "react";
import { RefreshCw, Search, Trash2, Download, CheckCircle, XCircle } from "lucide-react";
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

export default function Renewals() {
  const [requests, setRequests] = useState<RenewalRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const handleAddRequest = (request: RenewalRequest) => {
    setRequests((prev) => [...prev, request]);
  };

  const handleDeleteRequest = (id: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    toast.success("Request deleted");
  };

  const handleApprove = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "completed" as const } : r))
    );
    toast.success("Renewal request approved");
  };

  const handleReject = (id: string) => {
    setRequests((prev) =>
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

  const filteredRequests = requests.filter(
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
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800",
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[priority] || ""}`}>
        {priority}
      </span>
    );
  };

  const statusCounts = {
    pending: requests.filter((r) => r.status === "pending").length,
    inProgress: requests.filter((r) => r.status === "in-progress").length,
    completed: requests.filter((r) => r.status === "completed").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Renewal Requests</h1>
            <p className="text-muted-foreground">
              Track and manage certificate renewal requests
            </p>
          </div>
          <CreateRenewalDialog onSubmit={handleAddRequest} />
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusCounts.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusCounts.inProgress}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusCounts.completed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusCounts.rejected}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Renewal Requests</CardTitle>
                <CardDescription>
                  All certificate renewal requests and their status
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
                <RefreshCw className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No renewal requests</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Click "New Renewal Request" to create one.
                </p>
              </div>
            ) : (
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
                                onClick={() => handleApprove(request.id)}
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
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
