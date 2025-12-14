import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

interface DiscoveredCertificate {
  id: string;
  endpoint: string;
  port: number;
  commonName: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  daysToExpiry: number;
  protocol: string;
  status: "valid" | "expiring" | "expired" | "invalid";
}

interface RequestCertificateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  certificate: DiscoveredCertificate | null;
}

export function RequestCertificateDialog({
  open,
  onOpenChange,
  certificate,
}: RequestCertificateDialogProps) {
  const [formData, setFormData] = useState({
    commonName: certificate?.commonName || "",
    organization: "",
    organizationalUnit: "",
    validityDays: "365",
    priority: "normal",
    reason: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate request submission
    toast({
      title: "Certificate Request Submitted",
      description: `Request for ${formData.commonName} has been submitted for approval.`,
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request New Certificate</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="commonName">Common Name</Label>
            <Input
              id="commonName"
              value={formData.commonName}
              onChange={(e) => setFormData({ ...formData, commonName: e.target.value })}
              placeholder="e.g., api.company.com"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="organization">Organization</Label>
              <Input
                id="organization"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                placeholder="Company Name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organizationalUnit">Organizational Unit</Label>
              <Input
                id="organizationalUnit"
                value={formData.organizationalUnit}
                onChange={(e) => setFormData({ ...formData, organizationalUnit: e.target.value })}
                placeholder="IT Department"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="validityDays">Validity Period (Days)</Label>
              <Input
                id="validityDays"
                type="number"
                value={formData.validityDays}
                onChange={(e) => setFormData({ ...formData, validityDays: e.target.value })}
                min="30"
                max="3650"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Request</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Explain why this certificate is needed..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Submit Request</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
