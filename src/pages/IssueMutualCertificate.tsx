import { useState } from "react";
import { Server, Monitor, Trash2, ChevronDown, ChevronRight, Download, CheckCircle } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { ServerCertificateDialog, type ServerCertificate } from "@/components/certificates/ServerCertificateDialog";
import { ClientCertificateDialog, type ClientCertificate } from "@/components/certificates/ClientCertificateDialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type ServerWithStatus = ServerCertificate & { status: "pending" | "issued" };
type ClientWithStatus = ClientCertificate & { status: "pending" | "issued" };

export default function IssueMutualCertificate() {
  const [servers, setServers] = useState<ServerWithStatus[]>([]);
  const [clients, setClients] = useState<ClientWithStatus[]>([]);
  const [expandedServers, setExpandedServers] = useState<Set<string>>(new Set());

  const handleAddServer = (server: ServerCertificate) => {
    const serverWithStatus: ServerWithStatus = { ...server, status: "pending" };
    setServers((prev) => [...prev, serverWithStatus]);
    setExpandedServers((prev) => new Set([...prev, server.id]));
  };

  const handleAddClient = (client: ClientCertificate) => {
    const clientWithStatus: ClientWithStatus = { ...client, status: "pending" };
    setClients((prev) => [...prev, clientWithStatus]);
  };

  const handleDeleteServer = (serverId: string, serverName: string) => {
    const server = servers.find((s) => s.id === serverId);
    if (server?.status === "issued") {
      toast({
        title: "Cannot Delete",
        description: "Issued certificates cannot be deleted.",
        variant: "destructive",
      });
      return;
    }
    setServers((prev) => prev.filter((s) => s.id !== serverId));
    setClients((prev) => prev.filter((c) => c.serverId !== serverId));
    toast({
      title: "Server Deleted",
      description: `Server "${serverName}" and its clients have been removed.`,
      variant: "destructive",
    });
  };

  const handleDeleteClient = (clientId: string, clientName: string) => {
    const client = clients.find((c) => c.id === clientId);
    if (client?.status === "issued") {
      toast({
        title: "Cannot Delete",
        description: "Issued certificates cannot be deleted.",
        variant: "destructive",
      });
      return;
    }
    setClients((prev) => prev.filter((c) => c.id !== clientId));
    toast({
      title: "Client Deleted",
      description: `Client "${clientName}" has been removed.`,
      variant: "destructive",
    });
  };

  const toggleServer = (serverId: string) => {
    setExpandedServers((prev) => {
      const next = new Set(prev);
      if (next.has(serverId)) {
        next.delete(serverId);
      } else {
        next.add(serverId);
      }
      return next;
    });
  };

  const getClientsForServer = (serverId: string) => {
    return clients.filter((c) => c.serverId === serverId);
  };

  const getPendingServers = () => servers.filter((s) => s.status === "pending");

  const handleIssueCertificates = () => {
    const pendingServers = getPendingServers();
    if (pendingServers.length === 0) {
      toast({
        title: "No Pending Certificates",
        description: "Add server certificates to issue.",
        variant: "destructive",
      });
      return;
    }

    const pendingServerIds = new Set(pendingServers.map((s) => s.id));

    // Update servers to issued
    setServers((prev) =>
      prev.map((s) =>
        pendingServerIds.has(s.id) ? { ...s, status: "issued" as const } : s
      )
    );

    // Update clients of pending servers to issued
    setClients((prev) =>
      prev.map((c) =>
        pendingServerIds.has(c.serverId) && c.status === "pending"
          ? { ...c, status: "issued" as const }
          : c
      )
    );

    const pendingClientsCount = clients.filter(
      (c) => pendingServerIds.has(c.serverId) && c.status === "pending"
    ).length;

    // TODO: Integrate with REST API
    console.log("Issue Mutual Certificates:", { servers: pendingServers, clients });
    toast({
      title: "Certificates Issued",
      description: `${pendingServers.length} server(s) and ${pendingClientsCount} client(s) issued successfully.`,
    });
  };

  const handleDownloadServer = (server: ServerWithStatus) => {
    const certData = `-----BEGIN CERTIFICATE-----
Server Certificate: ${server.commonName}
Alias: ${server.alias}
Organization: ${server.organization}
Algorithm: ${server.keyPairAlgorithm}
Validity: ${server.validityInDays} days
CA: ${server.caAlias}
-----END CERTIFICATE-----`;

    downloadFile(certData, `${server.alias}-server.pem`);
    toast({
      title: "Download Started",
      description: `Downloading server certificate "${server.commonName}"`,
    });
  };

  const handleDownloadClient = (client: ClientWithStatus) => {
    const certData = `-----BEGIN CERTIFICATE-----
Client Certificate: ${client.commonName}
Alias: ${client.alias}
Organization: ${client.organization}
Algorithm: ${client.keyPairAlgorithm}
Validity: ${client.validityInDays} days
CA: ${client.caAlias}
-----END CERTIFICATE-----`;

    downloadFile(certData, `${client.alias}-client.pem`);
    toast({
      title: "Download Started",
      description: `Downloading client certificate "${client.commonName}"`,
    });
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "application/x-pem-file" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: "pending" | "issued") => {
    if (status === "issued") {
      return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Issued</Badge>;
    }
    return <Badge variant="secondary">Pending</Badge>;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Issue Mutual Certificate</h1>
            <p className="text-muted-foreground">Create server and client certificates for mutual TLS</p>
          </div>
          <ServerCertificateDialog onSuccess={handleAddServer} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Server & Client Pairs</CardTitle>
            <CardDescription>
              Add servers and their associated client certificates
            </CardDescription>
          </CardHeader>
          <CardContent>
            {servers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Server className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No server certificates added yet.</p>
                <p className="text-sm text-muted-foreground">Click "Add Server" to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {servers.map((server) => {
                  const serverClients = getClientsForServer(server.id);
                  const isExpanded = expandedServers.has(server.id);

                  return (
                    <Collapsible key={server.id} open={isExpanded}>
                      <div className="border rounded-lg overflow-hidden">
                        {/* Server Row */}
                        <div className="flex items-center justify-between p-4 bg-muted/30">
                          <CollapsibleTrigger
                            onClick={() => toggleServer(server.id)}
                            className="flex items-center gap-3 flex-1 text-left"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                            <Server className="h-5 w-5 text-primary" />
                            <div>
                              <p className="font-medium">{server.commonName}</p>
                              <p className="text-sm text-muted-foreground">
                                {server.organization} • {server.alias}
                              </p>
                            </div>
                          </CollapsibleTrigger>
                          <div className="flex items-center gap-3">
                            {getStatusBadge(server.status)}
                            <Badge variant="outline">{server.keyPairAlgorithm}</Badge>
                            <Badge variant="secondary">{serverClients.length} client(s)</Badge>
                            {server.status === "issued" && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                                    onClick={() => handleDownloadServer(server)}
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Download Server Certificate</TooltipContent>
                              </Tooltip>
                            )}
                            {server.status === "pending" && (
                              <ClientCertificateDialog
                                serverId={server.id}
                                serverName={server.commonName}
                                onSuccess={handleAddClient}
                              />
                            )}
                            {server.status === "pending" && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDeleteServer(server.id, server.commonName)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Delete Server</TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </div>

                        {/* Clients Table */}
                        <CollapsibleContent>
                          {serverClients.length > 0 ? (
                            <div className="border-t">
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-muted/10">
                                    <TableHead className="pl-12">Client Name</TableHead>
                                    <TableHead>Organization</TableHead>
                                    <TableHead>Algorithm</TableHead>
                                    <TableHead>Validity</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Alias</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {serverClients.map((client) => (
                                    <TableRow key={client.id}>
                                      <TableCell className="pl-12">
                                        <div className="flex items-center gap-2">
                                          <Monitor className="h-4 w-4 text-muted-foreground" />
                                          {client.commonName}
                                        </div>
                                      </TableCell>
                                      <TableCell>{client.organization}</TableCell>
                                      <TableCell>
                                        <Badge variant="outline">{client.keyPairAlgorithm}</Badge>
                                      </TableCell>
                                      <TableCell>{client.validityInDays} days</TableCell>
                                      <TableCell>{getStatusBadge(client.status)}</TableCell>
                                      <TableCell className="font-mono text-sm">{client.alias}</TableCell>
                                      <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                          {client.status === "issued" && (
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                                                  onClick={() => handleDownloadClient(client)}
                                                >
                                                  <Download className="h-4 w-4" />
                                                </Button>
                                              </TooltipTrigger>
                                              <TooltipContent>Download Client Certificate</TooltipContent>
                                            </Tooltip>
                                          )}
                                          {client.status === "pending" && (
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                  onClick={() => handleDeleteClient(client.id, client.commonName)}
                                                >
                                                  <Trash2 className="h-4 w-4" />
                                                </Button>
                                              </TooltipTrigger>
                                              <TooltipContent>Delete Client</TooltipContent>
                                            </Tooltip>
                                          )}
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          ) : (
                            <div className="p-6 text-center text-muted-foreground border-t">
                              <Monitor className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">No clients added to this server yet.</p>
                            </div>
                          )}
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {getPendingServers().length > 0 && (
          <div className="flex justify-end">
            <Button onClick={handleIssueCertificates} size="lg">
              Issue Pending Certificates
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
