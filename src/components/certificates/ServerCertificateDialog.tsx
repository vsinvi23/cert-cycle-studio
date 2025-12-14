import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";
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

const availableCAs = [
  { value: "root-ca", label: "My Root CA (root-ca)" },
  { value: "intermediate-ca", label: "Intermediate CA (intermediate-ca)" },
];

const serverCertificateSchema = z.object({
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

export type ServerCertificate = z.infer<typeof serverCertificateSchema> & { id: string };

interface ServerCertificateDialogProps {
  onSuccess: (data: ServerCertificate) => void;
}

export function ServerCertificateDialog({ onSuccess }: ServerCertificateDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof serverCertificateSchema>>({
    resolver: zodResolver(serverCertificateSchema),
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

  const onSubmit = (data: z.infer<typeof serverCertificateSchema>) => {
    const serverCert: ServerCertificate = {
      ...data,
      id: crypto.randomUUID(),
    };
    toast({
      title: "Server Certificate Added",
      description: `Server certificate "${data.commonName}" added successfully.`,
    });
    form.reset();
    setOpen(false);
    onSuccess(serverCert);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Server
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Add Server Certificate</DialogTitle>
          <DialogDescription>Configure a server certificate for mutual TLS</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
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
                      <Input placeholder="server-cert" {...field} />
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
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Server</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
