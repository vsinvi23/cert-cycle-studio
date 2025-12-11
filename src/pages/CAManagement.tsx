import { Building2, Search } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateCADialog } from "@/components/ca/CreateCADialog";

export default function CAManagement() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">CA Management</h1>
            <p className="text-muted-foreground">Manage Certificate Authorities</p>
          </div>
          <CreateCADialog />
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
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No CAs configured</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add your first Certificate Authority to get started
              </p>
              <CreateCADialog />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
