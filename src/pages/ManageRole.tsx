import { Plus, Search, Trash2, Edit } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

// Sample data - replace with API call
const sampleRoles = [
  {
    id: "1",
    roleName: "Admin",
    description: "Full system access",
    permissions: ["ca_create", "ca_view", "ca_delete", "ca_revoke", "cert_issue", "cert_view", "cert_revoke", "cert_delete", "user_create", "user_manage", "role_create", "role_manage"],
    usersCount: 2,
  },
  {
    id: "2",
    roleName: "Certificate Manager",
    description: "Manage certificates and CAs",
    permissions: ["ca_create", "ca_view", "cert_issue", "cert_view", "cert_revoke"],
    usersCount: 5,
  },
  {
    id: "3",
    roleName: "Viewer",
    description: "Read-only access",
    permissions: ["ca_view", "cert_view"],
    usersCount: 10,
  },
];

export default function ManageRole() {
  const navigate = useNavigate();

  const handleEdit = (roleId: string) => {
    // TODO: Integrate with REST API
    console.log("Edit role:", roleId);
    toast({
      title: "Edit Role",
      description: "Edit functionality coming soon.",
    });
  };

  const handleDelete = (roleId: string, roleName: string) => {
    // TODO: Integrate with REST API
    console.log("Delete role:", roleId);
    toast({
      title: "Role Deleted",
      description: `Role "${roleName}" has been deleted.`,
      variant: "destructive",
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Manage Roles</h1>
            <p className="text-muted-foreground">View and manage system roles</p>
          </div>
          <Button className="gap-2" onClick={() => navigate("/user-management/create-role")}>
            <Plus className="h-4 w-4" />
            Add Role
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search roles..." className="pl-9" />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Roles</CardTitle>
            <CardDescription>All defined roles in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleRoles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">{role.roleName}</TableCell>
                      <TableCell className="max-w-xs truncate">{role.description}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {role.permissions.slice(0, 3).map((perm) => (
                            <Badge key={perm} variant="secondary" className="text-xs">
                              {perm.replace("_", " ")}
                            </Badge>
                          ))}
                          {role.permissions.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{role.permissions.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{role.usersCount}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleEdit(role.id)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit Role</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleDelete(role.id, role.roleName)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete Role</TooltipContent>
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
