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

const keyPairAlgorithms = [
  { value: "RSA2048", label: "RSA 2048" },
  { value: "RSA3072", label: "RSA 3072" },
  { value: "RSA4096", label: "RSA 4096" },
  { value: "ECDSA_P256", label: "ECDSA P256" },
  { value: "ECDSA_P384", label: "ECDSA P384" },
];

const issueCertificateSchema = z.object({
  commonName: z.string().min(1, "Common name is required").max(100),
  organization: z.string().min(1, "Organization is required").max(100),
  organizationalUnit: z.string().max(100).optional(),
  locality: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().min(2, "Country code is required").max(2, "Country must be 2 characters"),
  keyPairAlgorithm: z.string().min(1, "Key pair algorithm is required"),
  validityInDays: z.coerce.number().min(1, "Must be at least 1 day").max(36500, "Maximum 100 years"),
  alias: z.string().min(1, "Alias is required").max(50).regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
  passwordProtection: z.string().min(1, "Password protection is required").max(100),
  caAlias: z.string().min(1, "CA alias is required").max(50),
});

type IssueCertificateFormValues = z.infer<typeof issueCertificateSchema>;

export default function IssueCertificate() {
  const navigate = useNavigate();

  const form = useForm<IssueCertificateFormValues>({
    resolver: zodResolver(issueCertificateSchema),
    defaultValues: {
      commonName: "",
      organization: "",
      organizationalUnit: "",
      locality: "",
      state: "",
      country: "",
      keyPairAlgorithm: "RSA2048",
      validityInDays: 365,
      alias: "",
      passwordProtection: "",
      caAlias: "",
    },
  });

  const onSubmit = (data: IssueCertificateFormValues) => {
    // TODO: Integrate with REST API
    console.log("Issue Certificate:", data);
    toast({
      title: "Certificate Issued",
      description: `Certificate "${data.commonName}" issued successfully.`,
    });
    navigate("/certificate-management");
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Issue New Certificate</h1>
            <p className="text-muted-foreground">Create a new certificate for your organization</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Certificate Details</CardTitle>
            <CardDescription>Enter the details for your new certificate</CardDescription>
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
                          <Input placeholder="www.example.com" {...field} />
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
                    name="keyPairAlgorithm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Key Pair Algorithm *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select algorithm" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {keyPairAlgorithms.map((algo) => (
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
                          <Input type="number" placeholder="365" {...field} />
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
                          <Input placeholder="my-certificate" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="caAlias"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CA Alias *</FormLabel>
                        <FormControl>
                          <Input placeholder="root-ca" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="passwordProtection"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Password Protection *</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter password" {...field} />
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
                  <Button type="submit">Issue Certificate</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
