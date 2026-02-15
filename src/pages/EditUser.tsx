import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2, X, Plus } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { usersApi, rolesApi } from "@/lib/api";
import type { Role } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
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

const departments = [
  "Engineering",
  "IT",
  "HR",
  "Finance",
  "Marketing",
  "Operations",
  "Sales",
  "IT Operations",
  "Security & Compliance",
  "IT Department",
  "Human Resources",
  "Management",
  "External Contractors",
  "Pending Assignment",
];

const editUserSchema = z.object({
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  firstName: z.string().max(100).optional().or(z.literal("")),
  lastName: z.string().max(100).optional().or(z.literal("")),
  department: z.string().optional(),
  phoneNumber: z.string().optional().or(z.literal("")),
});

type EditUserFormValues = z.infer<typeof editUserSchema>;

export default function EditUser() {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [currentRoles, setCurrentRoles] = useState<Role[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [roleToRemove, setRoleToRemove] = useState<Role | null>(null);
  const [isRoleActionLoading, setIsRoleActionLoading] = useState(false);

  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      department: "",
      phoneNumber: "",
    },
  });

  useEffect(() => {
    if (userId) {
      loadUser();
      fetchRoles();
    }
  }, [userId]);

  const fetchRoles = async () => {
    try {
      const data = await rolesApi.getAllRoles();
      // Extract content array from paginated response
      if (data && typeof data === 'object' && 'content' in data) {
        setAvailableRoles(Array.isArray(data.content) ? data.content : []);
      } else {
        setAvailableRoles(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch roles:", error);
      toast({
        title: "Error",
        description: "Failed to load roles",
        variant: "destructive",
      });
    }
  };

  const loadUser = async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const user = await usersApi.getUserById(parseInt(userId));
      setUsername(user.username);
      setCurrentRoles(user.roles || []);
      form.reset({
        email: user.email || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        department: user.department || "",
        phoneNumber: user.phoneNumber || "",
      });
    } catch (error: any) {
      console.error("Failed to load user:", error);
      toast({
        title: "Error",
        description: "Failed to load user details. Please try again.",
        variant: "destructive",
      });
      navigate("/user-management/manage");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: EditUserFormValues) => {
    if (!userId) return;

    setIsSubmitting(true);
    try {
      await usersApi.updateUser(parseInt(userId), {
        email: data.email || undefined,
        firstName: data.firstName || undefined,
        lastName: data.lastName || undefined,
        department: data.department || undefined,
        phoneNumber: data.phoneNumber || undefined,
      });

      toast({
        title: "User Updated",
        description: `User "${username}" updated successfully.`,
      });
      navigate("/user-management/manage");
    } catch (error: any) {
      console.error("Failed to update user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddRole = async () => {
    if (!userId || !selectedRoleId) return;

    setIsRoleActionLoading(true);
    try {
      await usersApi.assignRole(parseInt(userId), selectedRoleId);
      
      // Add role to current roles
      const addedRole = availableRoles.find(r => r.id === selectedRoleId);
      if (addedRole) {
        setCurrentRoles([...currentRoles, addedRole]);
      }
      
      setSelectedRoleId(null);
      toast({
        title: "Role Assigned",
        description: "Role assigned successfully.",
      });
    } catch (error: any) {
      console.error("Failed to assign role:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRoleActionLoading(false);
    }
  };

  const handleRemoveRole = async (role: Role) => {
    if (!userId) return;

    setIsRoleActionLoading(true);
    try {
      await usersApi.removeRole(parseInt(userId), role.id);
      
      // Remove role from current roles
      setCurrentRoles(currentRoles.filter(r => r.id !== role.id));
      setRoleToRemove(null);
      
      toast({
        title: "Role Removed",
        description: "Role removed successfully.",
      });
    } catch (error: any) {
      console.error("Failed to remove role:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRoleActionLoading(false);
    }
  };

  const getAvailableRolesToAdd = () => {
    const currentRoleIds = currentRoles.map(r => r.id);
    return availableRoles.filter(r => !currentRoleIds.includes(r.id));
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading user...</span>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Edit User</h1>
            <p className="text-muted-foreground">Update user profile: {username}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Details</CardTitle>
            <CardDescription>Update the user information below</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <div className="text-sm text-muted-foreground">
                      <strong>Username:</strong> {username} (cannot be changed)
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+1-555-0123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Department</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select department (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {departments.map((dept) => (
                              <SelectItem key={dept} value={dept}>
                                {dept}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSubmitting ? "Updating..." : "Update User"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Role Management</CardTitle>
            <CardDescription>Assign or remove roles for this user</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-3">Current Roles</h3>
              {currentRoles.length === 0 ? (
                <p className="text-sm text-muted-foreground">No roles assigned</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {currentRoles.map((role) => (
                    <Badge key={role.id} variant="secondary" className="flex items-center gap-2">
                      {role.name.replace("ROLE_", "")}
                      <button
                        onClick={() => setRoleToRemove(role)}
                        disabled={isRoleActionLoading}
                        className="ml-1 hover:text-destructive focus:outline-none"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3">Add Role</h3>
              <div className="flex gap-2">
                <Select
                  value={selectedRoleId?.toString() || ""}
                  onValueChange={(value) => setSelectedRoleId(parseInt(value))}
                  disabled={isRoleActionLoading || getAvailableRolesToAdd().length === 0}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder={getAvailableRolesToAdd().length === 0 ? "All roles assigned" : "Select a role to add"} />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableRolesToAdd().map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        <div>
                          <div className="font-medium">{role.name.replace("ROLE_", "")}</div>
                          <div className="text-xs text-muted-foreground">{role.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  onClick={handleAddRole}
                  disabled={!selectedRoleId || isRoleActionLoading}
                >
                  {isRoleActionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!roleToRemove} onOpenChange={() => setRoleToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove the role "{roleToRemove?.name.replace("ROLE_", "")}" from this user?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRoleActionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => roleToRemove && handleRemoveRole(roleToRemove)}
              disabled={isRoleActionLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRoleActionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
