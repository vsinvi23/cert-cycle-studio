import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

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

interface CertificateDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  certificate: DiscoveredCertificate | null;
}

export function CertificateDetailsDialog({
  open,
  onOpenChange,
  certificate,
}: CertificateDetailsDialogProps) {
  if (!certificate) return null;

  const getStatusBadge = (status: DiscoveredCertificate["status"]) => {
    switch (status) {
      case "valid":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
            <CheckCircle className="mr-1 h-3 w-3" />
            Valid
          </Badge>
        );
      case "expiring":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Expiring Soon
          </Badge>
        );
      case "expired":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
            <XCircle className="mr-1 h-3 w-3" />
            Expired
          </Badge>
        );
      case "invalid":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
            <XCircle className="mr-1 h-3 w-3" />
            Invalid
          </Badge>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Certificate Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Endpoint</p>
              <p className="font-medium">{certificate.endpoint}:{certificate.port}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <div className="mt-1">{getStatusBadge(certificate.status)}</div>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Common Name</p>
            <p className="font-medium">{certificate.commonName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Issuer</p>
            <p className="font-medium">{certificate.issuer}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Valid From</p>
              <p className="font-medium">{certificate.validFrom}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Valid To</p>
              <p className="font-medium">{certificate.validTo}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Protocol</p>
              <Badge variant="outline">{certificate.protocol}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Days to Expiry</p>
              <p className={`font-medium ${
                certificate.daysToExpiry < 0
                  ? "text-red-600"
                  : certificate.daysToExpiry <= 30
                  ? "text-yellow-600"
                  : "text-green-600"
              }`}>
                {certificate.daysToExpiry < 0
                  ? `${Math.abs(certificate.daysToExpiry)} days ago`
                  : `${certificate.daysToExpiry} days`}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
