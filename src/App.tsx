import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CAManagement from "./pages/CAManagement";
import ViewCA from "./pages/ViewCA";
import CertificateManagement from "./pages/CertificateManagement";
import IssueCertificate from "./pages/IssueCertificate";
import IssueMutualCertificate from "./pages/IssueMutualCertificate";
import Workspace from "./pages/Workspace";
import Certificates from "./pages/Certificates";
import Renewals from "./pages/Renewals";
import NetworkScan from "./pages/NetworkScan";
import Reports from "./pages/Reports";
import CreateUser from "./pages/CreateUser";
import ManageUser from "./pages/ManageUser";
import CreateRole from "./pages/CreateRole";
import ManageRole from "./pages/ManageRole";
import Alerts from "./pages/Alerts";
import Jobs from "./pages/Jobs";
import Sessions from "./pages/Sessions";
import RateLimitMonitoring from "./pages/RateLimitMonitoring";
import AcmeManagement from "./pages/AcmeManagement";
import AcmeMonitoring from "./pages/AcmeMonitoring";
import BulkOperations from "./pages/BulkOperations";
import AuditLogs from "./pages/AuditLogs";
import ApiKeys from "./pages/ApiKeys";
import CertificateTemplates from "./pages/CertificateTemplates";
import Discovery from "./pages/Discovery";
import SystemSettings from "./pages/SystemSettings";
import ComplianceReports from "./pages/ComplianceReports";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            
            {/* Dashboard */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            
            {/* CA Management */}
            <Route path="/ca-management" element={<ProtectedRoute><CAManagement /></ProtectedRoute>} />
            <Route path="/ca-management/view" element={<ProtectedRoute><ViewCA /></ProtectedRoute>} />
            
            {/* Certificate Management */}
            <Route path="/certificate-management" element={<ProtectedRoute><CertificateManagement /></ProtectedRoute>} />
            <Route path="/certificate-management/issue" element={<ProtectedRoute><IssueCertificate /></ProtectedRoute>} />
            <Route path="/certificate-management/mutual" element={<ProtectedRoute><IssueMutualCertificate /></ProtectedRoute>} />
            <Route path="/certificate-templates" element={<ProtectedRoute><CertificateTemplates /></ProtectedRoute>} />
            <Route path="/renewals" element={<ProtectedRoute><Renewals /></ProtectedRoute>} />
            <Route path="/certificates" element={<ProtectedRoute><Certificates /></ProtectedRoute>} />
            
            {/* Discovery & Scanning */}
            <Route path="/network-scan" element={<ProtectedRoute><NetworkScan /></ProtectedRoute>} />
            <Route path="/discovery" element={<ProtectedRoute><Discovery /></ProtectedRoute>} />
            
            {/* ACME */}
            <Route path="/acme-management" element={<ProtectedRoute><AcmeManagement /></ProtectedRoute>} />
            <Route path="/acme-monitoring" element={<ProtectedRoute><AcmeMonitoring /></ProtectedRoute>} />
            
            {/* Operations */}
            <Route path="/bulk-operations" element={<ProtectedRoute><BulkOperations /></ProtectedRoute>} />
            <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
            <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
            
            {/* Security & Access */}
            <Route path="/api-keys" element={<ProtectedRoute><ApiKeys /></ProtectedRoute>} />
            <Route path="/sessions" element={<ProtectedRoute><Sessions /></ProtectedRoute>} />
            <Route path="/rate-limits" element={<ProtectedRoute><RateLimitMonitoring /></ProtectedRoute>} />
            <Route path="/user-management/create" element={<ProtectedRoute><CreateUser /></ProtectedRoute>} />
            <Route path="/user-management/manage" element={<ProtectedRoute><ManageUser /></ProtectedRoute>} />
            <Route path="/user-management/create-role" element={<ProtectedRoute><CreateRole /></ProtectedRoute>} />
            <Route path="/user-management/manage-role" element={<ProtectedRoute><ManageRole /></ProtectedRoute>} />
            
            {/* Reports & Audit */}
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/compliance" element={<ProtectedRoute><ComplianceReports /></ProtectedRoute>} />
            <Route path="/audit-logs" element={<ProtectedRoute><AuditLogs /></ProtectedRoute>} />
            
            {/* Workspace */}
            <Route path="/workspace" element={<ProtectedRoute><Workspace /></ProtectedRoute>} />
            <Route path="/workspace/my-request" element={<ProtectedRoute><Workspace /></ProtectedRoute>} />
            
            {/* Settings */}
            <Route path="/settings" element={<ProtectedRoute><SystemSettings /></ProtectedRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;