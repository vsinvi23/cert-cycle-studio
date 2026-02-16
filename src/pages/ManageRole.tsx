import { useState, useEffect } from "react";
import { Plus, Search, Trash2, Edit, Shield, Copy, Loader2, ArrowUpDown } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { rolesApi } from "@/lib/api";
import type { Role } from "@/lib/api/types";
import { DataTablePagination } from "@/components/ui/data-table-pagination";

export default function ManageRole() {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("ASC");
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; role: Role | null }>({
    open: false,
    role: null,
  });

  useEffect(() => {
    fetchRoles();
  }, [page, pageSize, sortBy, sortOrder, searchQuery]);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size: pageSize,
        sortBy,
        sortOrder,
      };

      const data = searchQuery.trim()
        ? await rolesApi.searchRoles(searchQuery, params)
        : await rolesApi.getAllRoles(params);

      setRoles(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
      toast({
        title: "Error",
        description: "Failed to load roles",
        variant: "destructive",
      });
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(0); // Reset to first page on search
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "ASC" ? "DESC" : "ASC"));
  };

  const handleClone = async (roleId: number, roleName: string) => {
    const newName = prompt(`Enter new name for cloned role (must start with ROLE_):`, `${roleName}_COPY`);
    if (!newName) return;

    if (!newName.startsWith("ROLE_")) {
      toast({
        title: "Invalid Name",
        description: "Role name must start with 'ROLE_'",
        variant: "destructive",
      });
      return;
    }

    try {
      await rolesApi.cloneRole(roleId, { newName });
      toast({
        title: "Role Cloned",
        description: `Role cloned as "${newName}"`,
      });
      fetchRoles();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to clone role",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.role) return;

    try {
      await rolesApi.deleteRole(deleteDialog.role.id);
      toast({
        title: "Role Deleted",
        description: `Role "${deleteDialog.role.name}" has been deleted`,
      });
      setDeleteDialog({ open: false, role: null });
      fetchRoles();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete role",
        variant: "destructive",
      });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Manage Roles</h1>
            <p className="text-muted-foreground">View and manage system roles</p>
          </div>
          <Button className="gap-2" onClick={() => navigate("/create-role")}>
            <Plus className="h-4 w-4" />
            Add Role
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search roles..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Roles</CardTitle>
                <CardDescription>{totalElements} total roles</CardDescription>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">Sort by:</span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px] h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="description">Description</SelectItem>
                      <SelectItem value="createdAt">Created Date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">Order:</span>
                  <div className="flex gap-1">
                    <Button
                      variant={sortOrder === "ASC" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSortOrder("ASC")}
                      className="h-9"
                    >
                      Ascending
                    </Button>
                    <Button
                      variant={sortOrder === "DESC" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSortOrder("DESC")}
                      className="h-9"
                    >
                      Descending
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : roles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Shield className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No roles found</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Role Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Permissions</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {roles.map((role) => (
                        <TableRow key={role.id}>
                          <TableCell className="font-medium">{role.name}</TableCell>
                          <TableCell className="max-w-xs truncate">{role.description}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {role.permissions.slice(0, 3).map((perm) => (
                                <Badge key={perm} variant="secondary" className="text-xs">
                                  {perm}
                                </Badge>
                              ))}
                              {role.permissions.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{role.permissions.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleClone(role.id, role.name)}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Clone Role</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => setDeleteDialog({ open: true, role })}
                                    disabled={role.isSystemRole}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {role.isSystemRole ? "System roles cannot be deleted" : "Delete Role"}
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="mt-4">
                  <DataTablePagination
                    currentPage={page}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    totalItems={totalElements}
                    onPageChange={setPage}
                    onPageSizeChange={(newSize) => {
                      setPageSize(newSize);
                      setPage(0);
                    }}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, role: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the role "{deleteDialog.role?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}

