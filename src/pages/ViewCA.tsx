import { useEffect, useState } from "react";
import { Search, Trash2, Ban, Loader2, ArrowUp, ArrowDown } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { SearchBar } from "@/components/ui/search-bar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("ASC");

  const fetchCAs = async () => {
    setIsLoading(true);
    try {
      const response = await caApi.list({
        page: currentPage,
        size: pageSize,
        alias: searchQuery || undefined,
        sortBy,
        sortOrder,
      });
      let caList: CertificateAuthority[] = [];
      if (Array.isArray(response)) {
        caList = response;
        setTotalElements(response.length);
        setTotalPages(1);
      } else if (response && typeof response === 'object') {
        if ('results' in (response as Record<string, unknown>)) {
          // Handle custom pagination format: { results, total, page, size }
          caList = (response as { results: CertificateAuthority[] }).results;
          const total = (response as any).total || 0;
          const size = (response as any).size || pageSize;
          setTotalElements(total);
          setTotalPages(Math.ceil(total / size));
        } else if ('content' in (response as Record<string, unknown>)) {
          // Handle Spring Boot PageImpl format
          caList = (response as { content: CertificateAuthority[] }).content;
          setTotalPages((response as any).totalPages || 0);
          setTotalElements((response as any).totalElements || 0);
        }
      }
      // Parse distinguishedName to extract fields
      const parsedCAs = caList.map((ca) => {
        const dnParts = ca.distinguishedName?.split(',').reduce((acc, part) => {
          const [key, value] = part.trim().split('=');
          acc[key] = value;
          return acc;
        }, {} as Record<string, string>) || {};
        
        return {
          ...ca,
          commonName: dnParts['CN'] || ca.commonName || ca.alias,
          organization: dnParts['O'] || ca.organization,
          organizationalUnit: dnParts['OU'] || ca.organizationalUnit,
          locality: dnParts['L'] || ca.locality,
          state: dnParts['ST'] || ca.state,
          country: dnParts['C'] || ca.country,
          validFrom: ca.issuedAt || ca.validFrom,
          validTo: ca.expiresAt || ca.validTo,
        };
      });
      setCas(parsedCAs);
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
  }, [currentPage, pageSize, searchQuery, sortBy, sortOrder]);

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

  // Server-side search is now handled by the API
  const filteredCAs = cas;

  const getStatusBadge = (ca: CertificateAuthority) => {
    // Check revoked field first (from API response)
    if (ca.revoked === true) {
      return <Badge variant="destructive">Revoked</Badge>;
    }
    // Then check status field
    switch (ca.status) {
      case "ACTIVE":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Active</Badge>;
      case "REVOKED":
        return <Badge variant="destructive">Revoked</Badge>;
      case "EXPIRED":
        return <Badge variant="secondary">Expired</Badge>;
      default:
        // Default to Active if revoked is false and no status
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Active</Badge>;
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

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div>
                <CardTitle>Certificate Authorities ({totalElements} total)</CardTitle>
                <CardDescription>View and manage your CAs</CardDescription>
              </div>
              
              {/* Search Bar */}
              <SearchBar
                value={searchQuery}
                onChange={(value) => {
                  setSearchQuery(value);
                  setCurrentPage(0);
                }}
                placeholder="Search CAs by alias, common name, or organization..."
              />

              {/* Sorting Controls */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 border-t pt-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Sort by:</span>
                  <Select
                    value={sortBy}
                    onValueChange={(value) => {
                      setSortBy(value);
                      setCurrentPage(0);
                    }}
                  >
                    <SelectTrigger className="w-[180px] h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alias">Alias</SelectItem>
                      <SelectItem value="commonName">Common Name</SelectItem>
                      <SelectItem value="organization">Organization</SelectItem>
                      <SelectItem value="issuedAt">Issued Date</SelectItem>
                      <SelectItem value="expiresAt">Expiry Date</SelectItem>
                      <SelectItem value="keyAlgorithm">Algorithm</SelectItem>
                      <SelectItem value="createdAt">Created Date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Order:</span>
                  <div className="flex gap-1">
                    <Button
                      variant={sortOrder === "ASC" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setSortOrder("ASC");
                        setCurrentPage(0);
                      }}
                      className="h-9"
                    >
                      <ArrowUp className="h-4 w-4 mr-1" />
                      Ascending
                    </Button>
                    <Button
                      variant={sortOrder === "DESC" ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setSortOrder("DESC");
                        setCurrentPage(0);
                      }}
                      className="h-9"
                    >
                      <ArrowDown className="h-4 w-4 mr-1" />
                      Descending
                    </Button>
                  </div>
                </div>
              </div>
            </div>
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
                    {filteredCAs.map((ca, index) => (
                      <TableRow key={ca.id || ca.alias || index}>
                        <TableCell className="font-medium">{ca.commonName}</TableCell>
                        <TableCell>{ca.organization || "-"}</TableCell>
                        <TableCell>{ca.signatureAlgorithm}</TableCell>
                        <TableCell>{new Date(ca.validFrom).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(ca.validTo).toLocaleDateString()}</TableCell>
                        <TableCell className="font-mono text-sm">{ca.alias}</TableCell>
                        <TableCell>{getStatusBadge(ca)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {!ca.revoked && ca.status !== "REVOKED" && (
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
            {totalPages > 0 && (
              <DataTablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalElements={totalElements}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(0);
                }}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
