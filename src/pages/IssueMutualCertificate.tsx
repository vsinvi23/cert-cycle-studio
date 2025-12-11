import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";

const keyPairAlgorithms = [
  { value: "RSA2048", label: "RSA 2048" },
  { value: "RSA3072", label: "RSA 3072" },
  { value: "RSA4096", label: "RSA 4096" },
  { value: "ECDSA_P256", label: "ECDSA P256" },
  { value: "ECDSA_P384", label: "ECDSA P384" },
];

// Sample CAs - replace with API call
const availableCAs = [
  { value: "root-ca", label: "My Root CA (root-ca)" },
  { value: "intermediate-ca", label: "Intermediate CA (intermediate-ca)" },
];

const certificateSchema = z.object({
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

const mutualCertificateSchema = z.object({
  server: certificateSchema,
  clients: z.array(certificateSchema).min(1, "At least one client certificate is required"),
});

type MutualCertificateFormValues = z.infer<typeof mutualCertificateSchema>;

const defaultCertificate = {
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
};

export default function IssueMutualCertificate() {
  const navigate = useNavigate();

  const form = useForm<MutualCertificateFormValues>({
    resolver: zodResolver(mutualCertificateSchema),
    defaultValues: {
      server: { ...defaultCertificate },
      clients: [{ ...defaultCertificate }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "clients",
  });

  const onSubmit = (data: MutualCertificateFormValues) => {
    // TODO: Integrate with REST API
    console.log("Issue Mutual Certificate:", data);
    toast({
      title: "Mutual Certificates Issued",
      description: `Server and ${data.clients.length} client certificate(s) issued successfully.`,
    });
    navigate("/certificate-management");
  };

  const CertificateFields = ({ prefix, title }: { prefix: string; title: string }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name={`${prefix}.commonName` as any}
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
        name={`${prefix}.organization` as any}
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
        name={`${prefix}.organizationalUnit` as any}
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
        name={`${prefix}.locality` as any}
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
        name={`${prefix}.state` as any}
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
        name={`${prefix}.country` as any}
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
        name={`${prefix}.keyPairAlgorithm` as any}
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
        name={`${prefix}.validityInDays` as any}
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
        name={`${prefix}.alias` as any}
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
        name={`${prefix}.caAlias` as any}
        render={({ field }) => (
          <FormItem>
            <FormLabel>CA Alias *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select CA" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {availableCAs.map((ca) => (
                  <SelectItem key={ca.value} value={ca.value}>
                    {ca.label}
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
        name={`${prefix}.passwordProtection` as any}
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
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Issue Mutual Certificate</h1>
            <p className="text-muted-foreground">Create server and client certificates for mutual TLS</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Server Certificate */}
            <Card>
              <CardHeader>
                <CardTitle>Server Certificate</CardTitle>
                <CardDescription>Enter the details for the server certificate</CardDescription>
              </CardHeader>
              <CardContent>
                <CertificateFields prefix="server" title="Server" />
              </CardContent>
            </Card>

            {/* Client Certificates */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Client Certificates</CardTitle>
                    <CardDescription>Add one or more client certificates</CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ ...defaultCertificate })}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Client
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {fields.map((field, index) => (
                  <div key={field.id}>
                    {index > 0 && <Separator className="mb-6" />}
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-medium text-foreground">Client {index + 1}</h4>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </Button>
                      )}
                    </div>
                    <CertificateFields prefix={`clients.${index}`} title={`Client ${index + 1}`} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit">Issue Certificates</Button>
            </div>
          </form>
        </Form>
      </div>
    </AppLayout>
  );
}
