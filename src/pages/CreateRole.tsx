import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";

const permissions = [
  { id: "ca_create", label: "Create CA" },
  { id: "ca_view", label: "View CA" },
  { id: "ca_delete", label: "Delete CA" },
  { id: "ca_revoke", label: "Revoke CA" },
  { id: "cert_issue", label: "Issue Certificate" },
  { id: "cert_view", label: "View Certificate" },
  { id: "cert_revoke", label: "Revoke Certificate" },
  { id: "cert_delete", label: "Delete Certificate" },
  { id: "user_create", label: "Create User" },
  { id: "user_manage", label: "Manage User" },
  { id: "role_create", label: "Create Role" },
  { id: "role_manage", label: "Manage Role" },
];

const createRoleSchema = z.object({
  roleName: z.string().min(2, "Role name must be at least 2 characters").max(50),
  description: z.string().max(200).optional(),
  permissions: z.array(z.string()).min(1, "Select at least one permission"),
});

type CreateRoleFormValues = z.infer<typeof createRoleSchema>;

export default function CreateRole() {
  const navigate = useNavigate();

  const form = useForm<CreateRoleFormValues>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      roleName: "",
      description: "",
      permissions: [],
    },
  });

  const onSubmit = (data: CreateRoleFormValues) => {
    // TODO: Integrate with REST API
    console.log("Create Role:", data);
    toast({
      title: "Role Created",
      description: `Role "${data.roleName}" created successfully.`,
    });
    navigate("/user-management/manage-role");
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Create Role</h1>
            <p className="text-muted-foreground">Define a new role with permissions</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Role Details</CardTitle>
            <CardDescription>Enter the details for the new role</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <FormField
                    control={form.control}
                    name="roleName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Certificate Manager" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the role and its responsibilities..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="permissions"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">Permissions *</FormLabel>
                          <FormDescription>
                            Select the permissions for this role
                          </FormDescription>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {permissions.map((permission) => (
                            <FormField
                              key={permission.id}
                              control={form.control}
                              name="permissions"
                              render={({ field }) => (
                                <FormItem
                                  key={permission.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(permission.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, permission.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== permission.id
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    {permission.label}
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Role</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
