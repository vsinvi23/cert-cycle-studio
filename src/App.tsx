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
import CreateCA from "./pages/CreateCA";
import ViewCA from "./pages/ViewCA";
import CertificateManagement from "./pages/CertificateManagement";
import IssueCertificate from "./pages/IssueCertificate";
import IssueMutualCertificate from "./pages/IssueMutualCertificate";
import Workspace from "./pages/Workspace";
import Certificates from "./pages/Certificates";
import Renewals from "./pages/Renewals";
import Reports from "./pages/Reports";
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
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ca-management"
              element={
                <ProtectedRoute>
                  <CAManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ca-management/create"
              element={
                <ProtectedRoute>
                  <CreateCA />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ca-management/view"
              element={
                <ProtectedRoute>
                  <ViewCA />
                </ProtectedRoute>
              }
            />
            <Route
              path="/certificate-management"
              element={
                <ProtectedRoute>
                  <CertificateManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/certificate-management/issue"
              element={
                <ProtectedRoute>
                  <IssueCertificate />
                </ProtectedRoute>
              }
            />
            <Route
              path="/certificate-management/mutual"
              element={
                <ProtectedRoute>
                  <IssueMutualCertificate />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workspace"
              element={
                <ProtectedRoute>
                  <Workspace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/certificates"
              element={
                <ProtectedRoute>
                  <Certificates />
                </ProtectedRoute>
              }
            />
            <Route
              path="/renewals"
              element={
                <ProtectedRoute>
                  <Renewals />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
