import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2, Shield, Save, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { rolesApi } from "@/lib/api";
import type { AvailablePermissions } from "@/lib/api/types";

export default function CreateRole() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [availablePermissions, setAvailablePermissions] = useState<AvailablePermissions | null>(null);
  const [formData, setFormData] = useState({
    name: "ROLE_",
    description: "",
    permissions: [] as string[],
  });

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      // Fetch permissions from API
      const permissions = await rolesApi.getAllPermissions();
      const data = {
        permissions: permissions,
        totalCount: permissions.length,
      };
      setAvailablePermissions(data);
    } catch (error) {
      console.error("Failed to fetch permissions:", error);
      toast({
        title: "Error",
        description: "Failed to load available permissions",
        variant: "destructive",
      });
    }
  };

  const handlePermissionToggle = (permission: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.startsWith("ROLE_")) {
      toast({
        title: "Invalid Role Name",
        description: "Role name must start with 'ROLE_'",
        variant: "destructive",
      });
      return;
    }

    if (formData.permissions.length === 0) {
      toast({
        title: "No Permissions Selected",
        description: "Please select at least one permission",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await rolesApi.createRole({
        name: formData.name,
        description: formData.description,
        permissions: formData.permissions,
      });

      toast({
        title: "Role Created",
        description: `Role "${formData.name}" has been created successfully`,
      });

      navigate("/manage-role");
    } catch (error: any) {
      console.error("Failed to create role:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create role",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const permissionCategories = availablePermissions?.categorized || {};

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/manage-role")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create New Role</h1>
            <p className="text-muted-foreground">Define a new role with custom permissions</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Role Details
                </CardTitle>
                <CardDescription>Basic information about the role</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Role Name *</Label>
                  <Input
                    id="name"
                    placeholder="ROLE_CERTIFICATE_MANAGER"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Role name must start with "ROLE_" prefix
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the role's purpose and responsibilities"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Permissions</CardTitle>
                <CardDescription>
                  Select permissions for this role ({formData.permissions.length} selected)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!availablePermissions ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(permissionCategories).map(([category, permissions]) => (
                      <div key={category} className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-semibold">
                            {category}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {permissions.length} permissions
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pl-4">
                          {permissions.map((permission) => (
                            <div key={permission} className="flex items-center space-x-2">
                              <Checkbox
                                id={permission}
                                checked={formData.permissions.includes(permission)}
                                onCheckedChange={() => handlePermissionToggle(permission)}
                              />
                              <Label
                                htmlFor={permission}
                                className="text-sm font-normal cursor-pointer"
                              >
                                {permission}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/manage-role")}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Role
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
