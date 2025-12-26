import { useEffect, useState } from "react";
import { Search, Trash2, Ban, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { CreateCADialog } from "@/components/ca/CreateCADialog";
import { caApi } from "@/lib/api";
import type { CertificateAuthority } from "@/lib/api/types";

export default function ViewCA() {
  const [cas, setCas] = useState<CertificateAuthority[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCAs = async () => {
    setIsLoading(true);
    try {
      const response = await caApi.list();
      if (Array.isArray(response)) {
        setCas(response);
      } else if (response && 'content' in response) {
        setCas(response.content);
      }
    } catch (error) {
      console.error("Failed to fetch CAs:", error);
      toast({
        title: "Error",
        description: "Failed to load Certificate Authorities",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCAs();
  }, []);

  const handleDelete = async (alias: string, commonName: string) => {
    try {
      await caApi.delete(alias);
      setCas((prev) => prev.filter((ca) => ca.alias !== alias));
      toast({
        title: "CA Deleted",
        description: `Certificate Authority "${commonName}" has been deleted.`,
      });
    } catch (error) {
      console.error("Failed to delete CA:", error);
      toast({
        title: "Error",
        description: "Failed to delete Certificate Authority",
        variant: "destructive",
      });
    }
  };

  const handleRevoke = async (alias: string, commonName: string) => {
    try {
      await caApi.revoke(alias);
      // Update local state
      setCas((prev) =>
        prev.map((ca) =>
          ca.alias === alias ? { ...ca, status: "REVOKED" as const } : ca
        )
      );
      toast({
        title: "CA Revoked",
        description: `Certificate Authority "${commonName}" has been revoked.`,
      });
    } catch (error) {
      console.error("Failed to revoke CA:", error);
      toast({
        title: "Error",
        description: "Failed to revoke Certificate Authority",
        variant: "destructive",
      });
    }
  };

  const filteredCAs = cas.filter(
    (ca) =>
      ca.commonName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ca.alias?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ca.organization?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: CertificateAuthority["status"]) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Active</Badge>;
      case "REVOKED":
        return <Badge variant="destructive">Revoked</Badge>;
      case "EXPIRED":
        return <Badge variant="secondary">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading CAs...</span>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">View Certificate Authorities</h1>
            <p className="text-muted-foreground">Manage your existing CAs</p>
          </div>
          <CreateCADialog onSuccess={fetchCAs} />
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search CAs..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Certificate Authorities</CardTitle>
            <CardDescription>View and manage your CAs</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredCAs.length === 0 ? (
              <div className="flex h-32 items-center justify-center text-muted-foreground">
                No Certificate Authorities found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Common Name</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Algorithm</TableHead>
                      <TableHead>Valid From</TableHead>
                      <TableHead>Valid To</TableHead>
                      <TableHead>Alias</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCAs.map((ca) => (
                      <TableRow key={ca.id}>
                        <TableCell className="font-medium">{ca.commonName}</TableCell>
                        <TableCell>{ca.organization || "-"}</TableCell>
                        <TableCell>{ca.signatureAlgorithm}</TableCell>
                        <TableCell>{new Date(ca.validFrom).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(ca.validTo).toLocaleDateString()}</TableCell>
                        <TableCell className="font-mono text-sm">{ca.alias}</TableCell>
                        <TableCell>{getStatusBadge(ca.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {ca.status === "ACTIVE" && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-amber-500 hover:text-amber-600 hover:bg-amber-500/10"
                                    onClick={() => handleRevoke(ca.alias, ca.commonName)}
                                  >
                                    <Ban className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Revoke CA</TooltipContent>
                              </Tooltip>
                            )}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => handleDelete(ca.alias, ca.commonName)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete CA</TooltipContent>
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
