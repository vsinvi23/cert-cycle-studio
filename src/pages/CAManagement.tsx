import { useEffect, useState } from "react";
import { Building2, Plus, Search, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { caApi } from "@/lib/api";
import type { CertificateAuthority } from "@/lib/api/types";
import { toast } from "@/hooks/use-toast";

export default function CAManagement() {
  const navigate = useNavigate();
  const [cas, setCas] = useState<CertificateAuthority[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCAs = async () => {
    setIsLoading(true);
    try {
      const response = await caApi.list();
      // Handle both paginated and array responses
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

  const filteredCAs = cas.filter(
    (ca) =>
      ca.commonName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ca.alias?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ca.organization?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <h1 className="text-2xl font-bold text-foreground">CA Management</h1>
            <p className="text-muted-foreground">Manage Certificate Authorities</p>
          </div>
          <Button className="gap-2" onClick={() => navigate("/ca-management/create")}>
            <Plus className="h-4 w-4" />
            Add CA
          </Button>
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
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No CAs configured</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add your first Certificate Authority to get started
                </p>
                <Button variant="outline" className="gap-2" onClick={() => navigate("/ca-management/create")}>
                  <Plus className="h-4 w-4" />
                  Add CA
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCAs.map((ca) => (
                  <div
                    key={ca.id}
                    className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/ca-management/view`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{ca.commonName}</p>
                        <p className="text-sm text-muted-foreground">
                          {ca.organization} • {ca.signatureAlgorithm}
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-mono text-muted-foreground">{ca.alias}</p>
                      <p className="text-xs text-muted-foreground">
                        Valid until {new Date(ca.validTo).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
