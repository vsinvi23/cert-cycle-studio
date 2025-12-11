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

const signatureAlgorithms = [
  { value: "RSA2048", label: "RSA 2048" },
  { value: "RSA3072", label: "RSA 3072" },
  { value: "RSA4096", label: "RSA 4096" },
  { value: "ECDSA_P256", label: "ECDSA P256" },
  { value: "ECDSA_P384", label: "ECDSA P384" },
];

const createCASchema = z.object({
  commonName: z.string().min(1, "Common name is required").max(100),
  organization: z.string().min(1, "Organization is required").max(100),
  organizationalUnit: z.string().max(100).optional(),
  locality: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().min(2, "Country code is required").max(2, "Country must be 2 characters"),
  signatureAlgorithm: z.string().min(1, "Signature algorithm is required"),
  validityInDays: z.coerce.number().min(1, "Must be at least 1 day").max(36500, "Maximum 100 years"),
  alias: z.string().min(1, "Alias is required").max(50).regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
});

type CreateCAFormValues = z.infer<typeof createCASchema>;

export default function CreateCA() {
  const navigate = useNavigate();

  const form = useForm<CreateCAFormValues>({
    resolver: zodResolver(createCASchema),
    defaultValues: {
      commonName: "",
      organization: "",
      organizationalUnit: "",
      locality: "",
      state: "",
      country: "",
      signatureAlgorithm: "RSA2048",
      validityInDays: 3650,
      alias: "",
    },
  });

  const onSubmit = (data: CreateCAFormValues) => {
    // TODO: Integrate with REST API
    console.log("Create CA:", data);
    toast({
      title: "CA Created",
      description: `Certificate Authority "${data.commonName}" created successfully.`,
    });
    navigate("/ca-management/view");
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Create Certificate Authority</h1>
            <p className="text-muted-foreground">Configure a new CA for your organization</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>CA Details</CardTitle>
            <CardDescription>Enter the details for your new Certificate Authority</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="commonName"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Common Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="My Root CA" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="organization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization *</FormLabel>
                        <FormControl>
                          <Input placeholder="My Organization" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="organizationalUnit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organizational Unit</FormLabel>
                        <FormControl>
                          <Input placeholder="IT Department" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="locality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Locality</FormLabel>
                        <FormControl>
                          <Input placeholder="San Francisco" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="California" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country Code *</FormLabel>
                        <FormControl>
                          <Input placeholder="US" maxLength={2} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="signatureAlgorithm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Signature Algorithm *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select algorithm" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {signatureAlgorithms.map((algo) => (
                              <SelectItem key={algo.value} value={algo.value}>
                                {algo.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="validityInDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Validity (Days) *</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="3650" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="alias"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alias *</FormLabel>
                        <FormControl>
                          <Input placeholder="root-ca" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create CA</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
