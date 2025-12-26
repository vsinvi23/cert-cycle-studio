import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Radar, Shield, AlertTriangle, CheckCircle, XCircle, Loader2, Globe, Eye, FilePlus, Filter } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { CertificateDetailsDialog } from "@/components/network-scan/CertificateDetailsDialog";
import { RequestCertificateDialog } from "@/components/network-scan/RequestCertificateDialog";
import { networkScanApi } from "@/lib/api";
import type { NmapCertificateScan } from "@/lib/api/types";

interface DiscoveredCertificate {
  id: string;
  endpoint: string;
  port: number;
  commonName: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  daysToExpiry: number;
  protocol: string;
  status: "valid" | "expiring" | "expired" | "invalid";
}

export default function NetworkScan() {
  const [networkRange, setNetworkRange] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [discoveredCerts, setDiscoveredCerts] = useState<DiscoveredCertificate[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [protocolFilter, setProtocolFilter] = useState<string>("all");
  const [selectedCert, setSelectedCert] = useState<DiscoveredCertificate | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);

  const calculateDaysToExpiry = (validTo: string): number => {
    const expiryDate = new Date(validTo);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatus = (daysToExpiry: number): DiscoveredCertificate["status"] => {
    if (daysToExpiry < 0) return "expired";
    if (daysToExpiry <= 30) return "expiring";
    return "valid";
  };

  const mapApiResponseToDiscoveredCert = (cert: NmapCertificateScan): DiscoveredCertificate => {
    const daysToExpiry = calculateDaysToExpiry(cert.validTo);
    return {
      id: String(cert.id),
      endpoint: cert.host,
      port: cert.port,
      commonName: cert.commonName,
      issuer: cert.issuer,
      validFrom: cert.validFrom,
      validTo: cert.validTo,
      daysToExpiry,
      protocol: `TLS (${cert.algorithm})`,
      status: getStatus(daysToExpiry),
    };
  };

  const handleScan = async () => {
    if (!networkRange.trim()) {
      toast({
        title: "Network Range Required",
        description: "Please enter a network range or IP address to scan.",
        variant: "destructive",
      });
      return;
    }

    setIsScanning(true);
    setDiscoveredCerts([]);

    try {
      const results = await networkScanApi.scan({
        targets: networkRange,
        ports: "443,8443,8080",
      });

      const mappedCerts = (Array.isArray(results) ? results : [results]).map(mapApiResponseToDiscoveredCert);
      setDiscoveredCerts(mappedCerts);
      
      toast({
        title: "Scan Complete",
        description: `Discovered ${mappedCerts.length} certificate endpoints.`,
      });
    } catch (error) {
      console.error("Scan failed:", error);
      toast({
        title: "Scan Failed",
        description: "Failed to perform network scan. Please check your connection.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const getStatusBadge = (status: DiscoveredCertificate["status"]) => {
    switch (status) {
      case "valid":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
            <CheckCircle className="mr-1 h-3 w-3" />
            Valid
          </Badge>
        );
      case "expiring":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Expiring Soon
          </Badge>
        );
      case "expired":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
            <XCircle className="mr-1 h-3 w-3" />
            Expired
          </Badge>
        );
      case "invalid":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
            <XCircle className="mr-1 h-3 w-3" />
            Invalid
          </Badge>
        );
    }
  };

  const getExpiryColor = (days: number) => {
    if (days < 0) return "text-red-600 dark:text-red-400";
    if (days <= 30) return "text-yellow-600 dark:text-yellow-400";
    return "text-green-600 dark:text-green-400";
  };

  const filteredCerts = discoveredCerts.filter((cert) => {
    const matchesSearch =
      cert.endpoint.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.commonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.issuer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || cert.status === statusFilter;
    const matchesProtocol = protocolFilter === "all" || cert.protocol === protocolFilter;
    return matchesSearch && matchesStatus && matchesProtocol;
  });

  const uniqueProtocols = [...new Set(discoveredCerts.map((c) => c.protocol))];

  const validCount = discoveredCerts.filter((c) => c.status === "valid").length;
  const expiringCount = discoveredCerts.filter((c) => c.status === "expiring").length;
  const expiredCount = discoveredCerts.filter((c) => c.status === "expired").length;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Network Certificate Scanner</h1>
          <p className="text-muted-foreground">
            Discover and analyze SSL/TLS certificates across your network
          </p>
        </div>

        {/* Scan Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radar className="h-5 w-5 text-primary" />
              Network Scan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Enter network range (e.g., 192.168.1.0/24) or IP address"
                  value={networkRange}
                  onChange={(e) => setNetworkRange(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button onClick={handleScan} disabled={isScanning}>
                {isScanning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Radar className="mr-2 h-4 w-4" />
                    Start Scan
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        {discoveredCerts.length > 0 && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Discovered</p>
                  <p className="text-2xl font-bold">{discoveredCerts.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valid</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{validCount}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900">
                  <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Expiring Soon</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{expiringCount}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900">
                  <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Expired</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">{expiredCount}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results Table */}
        {discoveredCerts.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Discovered Certificates
                </CardTitle>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="valid">Valid</SelectItem>
                        <SelectItem value="expiring">Expiring</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="invalid">Invalid</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={protocolFilter} onValueChange={setProtocolFilter}>
                      <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="Protocol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Protocols</SelectItem>
                        {uniqueProtocols.map((protocol) => (
                          <SelectItem key={protocol} value={protocol}>
                            {protocol}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search certificates..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Common Name</TableHead>
                    <TableHead>Issuer</TableHead>
                    <TableHead>Protocol</TableHead>
                    <TableHead>Valid From</TableHead>
                    <TableHead>Valid To</TableHead>
                    <TableHead>Days to Expiry</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCerts.map((cert) => (
                    <TableRow key={cert.id}>
                      <TableCell className="font-medium">
                        {cert.endpoint}:{cert.port}
                      </TableCell>
                      <TableCell>{cert.commonName}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{cert.issuer}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{cert.protocol}</Badge>
                      </TableCell>
                      <TableCell>{cert.validFrom}</TableCell>
                      <TableCell>{cert.validTo}</TableCell>
                      <TableCell>
                        <span className={getExpiryColor(cert.daysToExpiry)}>
                          {cert.daysToExpiry < 0
                            ? `${Math.abs(cert.daysToExpiry)} days ago`
                            : `${cert.daysToExpiry} days`}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(cert.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedCert(cert);
                              setDetailsDialogOpen(true);
                            }}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedCert(cert);
                              setRequestDialogOpen(true);
                            }}
                            title="Request Certificate"
                          >
                            <FilePlus className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredCerts.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  No certificates found matching your search.
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isScanning && discoveredCerts.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Radar className="h-16 w-16 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">No Scan Results</h3>
              <p className="text-muted-foreground">
                Enter a network range above and start scanning to discover certificate endpoints.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Scanning State */}
        {isScanning && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
              <h3 className="mt-4 text-lg font-medium">Scanning Network...</h3>
              <p className="text-muted-foreground">
                Discovering SSL/TLS endpoints in {networkRange}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Dialogs */}
        <CertificateDetailsDialog
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          certificate={selectedCert}
        />
        <RequestCertificateDialog
          open={requestDialogOpen}
          onOpenChange={setRequestDialogOpen}
          certificate={selectedCert}
        />
      </div>
    </AppLayout>
  );
}
