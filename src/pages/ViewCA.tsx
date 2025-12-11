import { Plus, Search, Trash2, Ban } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
import { toast } from "@/hooks/use-toast";

// Sample data - replace with API call
const sampleCAs = [
  {
    id: "1",
    commonName: "My Root CA",
    organization: "My Organization",
    organizationalUnit: "IT Department",
    locality: "San Francisco",
    state: "California",
    country: "US",
    signatureAlgorithm: "RSA2048",
    validityInDays: 3650,
    alias: "root-ca",
  },
  {
    id: "2",
    commonName: "Intermediate CA",
    organization: "My Organization",
    organizationalUnit: "Security",
    locality: "New York",
    state: "New York",
    country: "US",
    signatureAlgorithm: "RSA4096",
    validityInDays: 1825,
    alias: "intermediate-ca",
  },
];

export default function ViewCA() {
  const navigate = useNavigate();

  const handleDelete = (alias: string, commonName: string) => {
    // TODO: Integrate with REST API
    console.log("Delete CA:", alias);
    toast({
      title: "CA Deleted",
      description: `Certificate Authority "${commonName}" has been deleted.`,
      variant: "destructive",
    });
  };

  const handleRevoke = (alias: string, commonName: string) => {
    // TODO: Integrate with REST API
    console.log("Revoke CA:", alias);
    toast({
      title: "CA Revoked",
      description: `Certificate Authority "${commonName}" has been revoked.`,
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">View Certificate Authorities</h1>
            <p className="text-muted-foreground">Manage your existing CAs</p>
          </div>
          <Button className="gap-2" onClick={() => navigate("/ca-management/create")}>
            <Plus className="h-4 w-4" />
            Add CA
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search CAs..." className="pl-9" />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Certificate Authorities</CardTitle>
            <CardDescription>View and manage your CAs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Common Name</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Organizational Unit</TableHead>
                    <TableHead>Locality</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Algorithm</TableHead>
                    <TableHead>Validity (Days)</TableHead>
                    <TableHead>Alias</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleCAs.map((ca) => (
                    <TableRow key={ca.id}>
                      <TableCell className="font-medium">{ca.commonName}</TableCell>
                      <TableCell>{ca.organization}</TableCell>
                      <TableCell>{ca.organizationalUnit}</TableCell>
                      <TableCell>{ca.locality}</TableCell>
                      <TableCell>{ca.state}</TableCell>
                      <TableCell>{ca.country}</TableCell>
                      <TableCell>{ca.signatureAlgorithm}</TableCell>
                      <TableCell>{ca.validityInDays}</TableCell>
                      <TableCell className="font-mono text-sm">{ca.alias}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
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
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
