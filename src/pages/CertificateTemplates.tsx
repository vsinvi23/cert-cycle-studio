import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, FileText, Edit, Trash2, Copy, Clock } from "lucide-react";
import type { CertificateTemplate } from "@/lib/api/types";

export default function CertificateTemplates() {
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CertificateTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    caAlias: "",
    algorithm: "RSA2048",
    keySize: 2048,
    validityDays: 365,
    subjectTemplate: "CN={{hostname}}, O={{organization}}, C={{country}}",
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      // Mock data
      const mockTemplates: CertificateTemplate[] = [
        {
          id: 1,
          name: "Standard Server Certificate",
          description: "Default template for web server certificates",
          caAlias: "InternalCA",
          algorithm: "RSA2048",
          keySize: 2048,
          validityDays: 365,
          subjectTemplate: "CN={{hostname}}, O=Company, C=US",
          createdAt: "2025-01-15T10:00:00Z",
        },
        {
          id: 2,
          name: "High Security Certificate",
          description: "For production and critical systems",
          caAlias: "ProductionCA",
          algorithm: "RSA4096",
          keySize: 4096,
          validityDays: 730,
          subjectTemplate: "CN={{hostname}}, OU={{department}}, O=Company, C=US",
          createdAt: "2025-02-01T09:00:00Z",
        },
        {
          id: 3,
          name: "Client Authentication",
          description: "For mTLS client certificates",
          caAlias: "InternalCA",
          algorithm: "ECDSA_P256",
          keySize: 256,
          validityDays: 180,
          subjectTemplate: "CN={{username}}, OU=Users, O=Company, C=US",
          createdAt: "2025-03-01T14:00:00Z",
        },
      ];
      setTemplates(mockTemplates);
    } catch (error) {
      toast.error("Failed to fetch templates");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!formData.name || !formData.caAlias) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      toast.success(editingTemplate ? "Template updated successfully" : "Template created successfully");
      setIsDialogOpen(false);
      setEditingTemplate(null);
      resetForm();
      fetchTemplates();
    } catch (error) {
      toast.error("Failed to save template");
    }
  };

  const handleEditTemplate = (template: CertificateTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || "",
      caAlias: template.caAlias,
      algorithm: template.algorithm,
      keySize: template.keySize,
      validityDays: template.validityDays,
      subjectTemplate: template.subjectTemplate || "",
    });
    setIsDialogOpen(true);
  };

  const handleDeleteTemplate = async (templateId: number) => {
    try {
      toast.success("Template deleted successfully");
      fetchTemplates();
    } catch (error) {
      toast.error("Failed to delete template");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      caAlias: "",
      algorithm: "RSA2048",
      keySize: 2048,
      validityDays: 365,
      subjectTemplate: "CN={{hostname}}, O={{organization}}, C={{country}}",
    });
  };

  const getAlgorithmBadge = (algorithm: string) => {
    if (algorithm.includes("4096")) return <Badge className="bg-green-500">High Security</Badge>;
    if (algorithm.includes("ECDSA")) return <Badge className="bg-blue-500">Modern</Badge>;
    return <Badge variant="secondary">Standard</Badge>;
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Certificate Templates</h1>
            <p className="text-muted-foreground">
              Create reusable certificate configurations for consistent issuance
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingTemplate(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingTemplate ? "Edit Template" : "Create New Template"}</DialogTitle>
                <DialogDescription>
                  Define a reusable certificate configuration
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Template Name *</Label>
                  <Input
                    placeholder="e.g., Standard Server Certificate"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Describe when to use this template"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Certificate Authority *</Label>
                    <Select
                      value={formData.caAlias}
                      onValueChange={(value) => setFormData({ ...formData, caAlias: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select CA" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="InternalCA">Internal CA</SelectItem>
                        <SelectItem value="ProductionCA">Production CA</SelectItem>
                        <SelectItem value="DevelopmentCA">Development CA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Algorithm</Label>
                    <Select
                      value={formData.algorithm}
                      onValueChange={(value) => setFormData({ ...formData, algorithm: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RSA2048">RSA 2048</SelectItem>
                        <SelectItem value="RSA3072">RSA 3072</SelectItem>
                        <SelectItem value="RSA4096">RSA 4096</SelectItem>
                        <SelectItem value="ECDSA_P256">ECDSA P-256</SelectItem>
                        <SelectItem value="ECDSA_P384">ECDSA P-384</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Validity (days)</Label>
                  <Input
                    type="number"
                    value={formData.validityDays}
                    onChange={(e) => setFormData({ ...formData, validityDays: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subject Template</Label>
                  <Textarea
                    placeholder="CN={{hostname}}, O={{organization}}, C={{country}}"
                    value={formData.subjectTemplate}
                    onChange={(e) => setFormData({ ...formData, subjectTemplate: e.target.value })}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use variables: {"{{hostname}}"}, {"{{organization}}"}, {"{{department}}"}, {"{{country}}"}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveTemplate}>
                  {editingTemplate ? "Update Template" : "Create Template"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{templates.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Security</CardTitle>
              <Badge className="bg-green-500 text-xs">RSA 4096+</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {templates.filter((t) => t.algorithm.includes("4096") || t.algorithm.includes("384")).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Validity</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(templates.reduce((acc, t) => acc + t.validityDays, 0) / templates.length || 0)} days
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Templates Table */}
        <Card>
          <CardHeader>
            <CardTitle>Templates</CardTitle>
            <CardDescription>Manage certificate templates for quick issuance</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>CA</TableHead>
                  <TableHead>Algorithm</TableHead>
                  <TableHead>Validity</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {template.description}
                    </TableCell>
                    <TableCell>{template.caAlias}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{template.algorithm}</span>
                        {getAlgorithmBadge(template.algorithm)}
                      </div>
                    </TableCell>
                    <TableCell>{template.validityDays} days</TableCell>
                    <TableCell>{new Date(template.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" title="Duplicate">
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditTemplate(template)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDeleteTemplate(template.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}