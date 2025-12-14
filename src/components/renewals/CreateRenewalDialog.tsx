import { useState } from "react";
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
import { Plus } from "lucide-react";
import { toast } from "sonner";

const renewalSchema = z.object({
  certificateAlias: z.string().min(1, "Certificate alias is required"),
  certificateType: z.string().min(1, "Certificate type is required"),
  currentExpiryDate: z.string().min(1, "Current expiry date is required"),
  newValidityDays: z.string().min(1, "New validity period is required"),
  reason: z.string().min(1, "Reason for renewal is required"),
  priority: z.string().min(1, "Priority is required"),
});

type RenewalFormData = z.infer<typeof renewalSchema>;

export interface RenewalRequest extends RenewalFormData {
  id: string;
  status: "pending" | "in-progress" | "completed" | "rejected";
  createdAt: string;
}

interface CreateRenewalDialogProps {
  onSubmit: (data: RenewalRequest) => void;
  children?: React.ReactNode;
}

export function CreateRenewalDialog({ onSubmit, children }: CreateRenewalDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<RenewalFormData>({
    resolver: zodResolver(renewalSchema),
    defaultValues: {
      certificateAlias: "",
      certificateType: "",
      currentExpiryDate: "",
      newValidityDays: "365",
      reason: "",
      priority: "",
    },
  });

  const handleSubmit = (data: RenewalFormData) => {
    const renewalRequest: RenewalRequest = {
      ...data,
      id: crypto.randomUUID(),
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    onSubmit(renewalRequest);
    toast.success("Renewal request created successfully");
    form.reset();
    setOpen(false);
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
            Submit a request to renew an existing certificate
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="certificateAlias"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Certificate Alias</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter certificate alias" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="certificateType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Certificate Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select certificate type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="server">Server Certificate</SelectItem>
                      <SelectItem value="client">Client Certificate</SelectItem>
                      <SelectItem value="mutual">Mutual TLS Certificate</SelectItem>
                      <SelectItem value="ca">CA Certificate</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currentExpiryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Expiry Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newValidityDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Validity Period (Days)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="365" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
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
                  <FormLabel>Reason for Renewal</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Explain why this certificate needs renewal"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Submit Request</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
