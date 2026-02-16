import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { certificatesApi } from "@/lib/api";
import type { CertificateResponse } from "@/lib/api/types";

const renewalSchema = z.object({
  certificateId: z.coerce.number().min(1, "Please select a certificate"),
  reason: z.string().optional(),
});

type RenewalFormData = z.infer<typeof renewalSchema>;

export interface RenewalRequest extends RenewalFormData {
  id: string;
  status: "pending" | "in-progress" | "completed" | "rejected";
  createdAt: string;
  certificateAlias?: string;
  certificateType?: string;
  currentExpiryDate?: string;
  newValidityDays?: string;
  priority?: string;
}

interface CreateRenewalDialogProps {
  onSubmit?: (data: RenewalRequest) => void;
  onSuccess?: () => void;
  children?: React.ReactNode;
}

export function CreateRenewalDialog({ onSubmit, onSuccess, children }: CreateRenewalDialogProps) {
  const [open, setOpen] = useState(false);
  const [certificates, setCertificates] = useState<CertificateResponse[]>([]);
  const [isLoadingCerts, setIsLoadingCerts] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      fetchCertificates();
    }
  }, [open]);

  const fetchCertificates = async () => {
    setIsLoadingCerts(true);
    try {
      const data = await certificatesApi.getAll({ page: 0, size: 1000 });
      const certs = data && typeof data === 'object' && 'content' in data 
        ? Array.isArray(data.content) ? data.content : []
        : Array.isArray(data) ? data : [];
      setCertificates(certs);
    } catch (error) {
      console.error("Failed to fetch certificates:", error);
      toast.error("Failed to load certificates");
      setCertificates([]);
    } finally {
      setIsLoadingCerts(false);
    }
  };

  const form = useForm<RenewalFormData>({
    resolver: zodResolver(renewalSchema),
    defaultValues: {
      certificateId: 0,
      reason: "",
    },
  });

  const handleSubmit = async (data: RenewalFormData) => {
    setIsSubmitting(true);
    try {
      // Call the renewal API
      await certificatesApi.renew(data.certificateId);
      
      toast.success("Certificate renewed successfully");
      
      // Call onSuccess callback to refresh parent data
      if (onSuccess) {
        onSuccess();
      }
      
      // Also create a renewal request object for backward compatibility
      if (onSubmit) {
        const cert = certificates.find(c => c.id === data.certificateId);
        const renewalRequest: RenewalRequest = {
          ...data,
          id: crypto.randomUUID(),
          status: "completed",
          createdAt: new Date().toISOString(),
          certificateAlias: cert?.commonName || cert?.certificateName || `cert-${data.certificateId}`,
          certificateType: "server",
          currentExpiryDate: cert?.validTo || "",
          newValidityDays: "365",
          priority: "medium",
        };
        onSubmit(renewalRequest);
      }
      
      form.reset();
      setOpen(false);
    } catch (error: any) {
      console.error("Failed to renew certificate:", error);
      toast.error(error?.response?.data?.message || "Failed to renew certificate");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Renewal Request
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Renewal Request</DialogTitle>
          <DialogDescription>
            Select a certificate to renew. The renewal will be processed immediately.
          </DialogDescription>
        </DialogHeader>
        
        {isLoadingCerts ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-sm text-muted-foreground">Loading certificates...</span>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="certificateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Certificate *</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))} 
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a certificate to renew" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {certificates.length === 0 ? (
                          <SelectItem value="0" disabled>No certificates available</SelectItem>
                        ) : (
                          certificates.map((cert) => (
                            <SelectItem key={cert.id} value={cert.id.toString()}>
                              {cert.commonName || cert.certificateName || `Certificate ${cert.id}`}
                              {cert.validTo && ` (Expires: ${new Date(cert.validTo).toLocaleDateString()})`}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Renewal (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter reason for renewal (optional)"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Renewing...
                    </>
                  ) : (
                    "Renew Certificate"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
