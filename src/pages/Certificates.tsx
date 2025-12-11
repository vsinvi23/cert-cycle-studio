import { FileKey, Plus, Search } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Certificates() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Certificates</h1>
            <p className="text-muted-foreground">
              Manage your digital certificate inventory
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Certificate
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search certificates..." className="pl-10" />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Certificate Inventory</CardTitle>
            <CardDescription>
              All certificates managed by your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <FileKey className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No certificates yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Add your first certificate to start tracking expiration dates and renewals.
              </p>
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Add Certificate
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
