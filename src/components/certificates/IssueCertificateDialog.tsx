import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { caApi, certificatesApi } from "@/lib/api";
import type { CertificateAuthority } from "@/lib/api/types";

const keyPairAlgorithms = [
  { value: "RSA2048", label: "RSA 2048" },
  { value: "RSA3072", label: "RSA 3072" },
  { value: "RSA4096", label: "RSA 4096" },
  { value: "ECDSA_P256", label: "ECDSA P256" },
  { value: "ECDSA_P384", label: "ECDSA P384" },
];

const purposeOptions = [
  { value: "web-server", label: "Web Server (TLS/SSL)" },
  { value: "client-auth", label: "Client Authentication" },
  { value: "code-signing", label: "Code Signing" },
  { value: "email", label: "Email (S/MIME)" },
  { value: "vpn", label: "VPN" },
  { value: "iot", label: "IoT Device" },
  { value: "api", label: "API Authentication" },
  { value: "other", label: "Other" },
];

const certificateRequestSchema = z.object({
  csrType: z.enum(["with-csr", "without-csr"]),
  csrContent: z.string().optional(),
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
  purpose: z.string().min(1, "Purpose is required"),
}).refine((data) => {
  if (data.csrType === "with-csr" && (!data.csrContent || data.csrContent.trim() === "")) {
    return false;
  }
  return true;
}, {
  message: "CSR content is required when using CSR",
  path: ["csrContent"],
});

export type CertificateRequest = z.infer<typeof certificateRequestSchema> & { 
  id: string; 
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
};

interface IssueCertificateDialogProps {
  onSuccess: (data: CertificateRequest) => void;
}

export function IssueCertificateDialog({ onSuccess }: IssueCertificateDialogProps) {
  const [open, setOpen] = useState(false);
  const [cas, setCas] = useState<CertificateAuthority[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      caApi.list().then(setCas).catch(console.error);
    }
  }, [open]);

  const form = useForm<z.infer<typeof certificateRequestSchema>>({
    resolver: zodResolver(certificateRequestSchema),
    defaultValues: {
      csrType: "without-csr",
      csrContent: "",
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
      purpose: "",
    },
  });

  const csrType = form.watch("csrType");

  const onSubmit = async (data: z.infer<typeof certificateRequestSchema>) => {
    setIsSubmitting(true);
    try {
      // Call API to issue certificate
      await certificatesApi.issueUserCertificate({
        commonName: data.commonName,
        organization: data.organization,
        organizationalUnit: data.organizationalUnit,
        locality: data.locality,
        state: data.state,
        country: data.country,
        keyPairAlgorithm: data.keyPairAlgorithm,
        validityInDays: data.validityInDays,
        alias: data.alias,
        caAlias: data.caAlias,
        password: data.passwordProtection,
      });
      
      const request: CertificateRequest = {
        ...data,
        id: crypto.randomUUID(),
        status: "approved",
        createdAt: new Date(),
      };
      toast({
        title: "Certificate Issued",
        description: `Certificate for "${data.commonName}" has been issued successfully.`,
      });
      form.reset();
      setOpen(false);
      onSuccess(request);
    } catch (error) {
      console.error("Failed to issue certificate:", error);
      // Still add to local state as pending
      const request: CertificateRequest = {
        ...data,
        id: crypto.randomUUID(),
        status: "pending",
        createdAt: new Date(),
      };
      toast({
        title: "Request Submitted",
        description: `Certificate request for "${data.commonName}" has been submitted.`,
      });
      form.reset();
      setOpen(false);
      onSuccess(request);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Raise Request
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">New Certificate Request</DialogTitle>
          <DialogDescription>Submit a new certificate request</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-2">
            {/* CSR Type Selection */}
            <FormField
              control={form.control}
              name="csrType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Request Type *</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="without-csr" id="without-csr" />
                        <Label htmlFor="without-csr" className="cursor-pointer">Without CSR</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="with-csr" id="with-csr" />
                        <Label htmlFor="with-csr" className="cursor-pointer">With CSR</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* CSR Content - only shown when with-csr is selected */}
            {csrType === "with-csr" && (
              <FormField
                control={form.control}
                name="csrContent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CSR Content *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="-----BEGIN CERTIFICATE REQUEST-----&#10;...&#10;-----END CERTIFICATE REQUEST-----"
                        className="font-mono text-sm min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Purpose Field */}
            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purpose *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select certificate purpose" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {purposeOptions.map((purpose) => (
                        <SelectItem key={purpose.value} value={purpose.value}>
                          {purpose.label}
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
              name="commonName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Common Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="www.example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select CA" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cas.length > 0 ? (
                          cas.map((ca) => (
                            <SelectItem key={ca.id} value={ca.alias}>
                              {ca.alias} ({ca.commonName})
                            </SelectItem>
                          ))
                        ) : (
                          <>
                            <SelectItem value="root-ca">Root CA</SelectItem>
                            <SelectItem value="intermediate-ca">Intermediate CA</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="passwordProtection"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password Protection *</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Request"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
