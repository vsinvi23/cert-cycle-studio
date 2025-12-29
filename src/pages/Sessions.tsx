import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Monitor, LogOut, AlertTriangle, RefreshCw, Smartphone, Globe } from "lucide-react";
import { toast } from "sonner";
import { sessionsApi } from "@/lib/api";
import type { UserSession } from "@/lib/api/types";

export default function Sessions() {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [suspiciousActivity, setSuspiciousActivity] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
    checkSuspiciousActivity();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const data = await sessionsApi.getActive();
      setSessions(data || []);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkSuspiciousActivity = async () => {
    try {
      const result = await sessionsApi.detectSuspiciousActivity();
      setSuspiciousActivity(result);
    } catch (error) {
      console.error("Failed to check suspicious activity:", error);
    }
  };

  const handleTerminateSession = async (sessionId: number) => {
    try {
      await sessionsApi.terminate(sessionId);
      toast.success("Session terminated successfully");
      fetchSessions();
    } catch (error) {
      toast.error("Failed to terminate session");
    }
  };

  const handleTerminateAll = async () => {
    try {
      await sessionsApi.terminateAll();
      toast.success("All other sessions terminated");
      fetchSessions();
    } catch (error) {
      toast.error("Failed to terminate sessions");
    }
  };

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent?.toLowerCase().includes("mobile")) {
      return <Smartphone className="h-4 w-4" />;
    }
    return <Monitor className="h-4 w-4" />;
  };

  const activeCount = sessions.filter((s) => s.isActive).length;
  const uniqueIps = new Set(sessions.map((s) => s.ipAddress)).size;

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Session Management</h1>
            <p className="text-muted-foreground">Monitor and manage user sessions</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchSessions} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleTerminateAll} variant="destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Terminate All Others
            </Button>
          </div>
        </div>

        {/* Suspicious Activity Alert */}
        {suspiciousActivity && (
          <Card className="border-yellow-500 bg-yellow-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-yellow-600">
                <AlertTriangle className="h-5 w-5" />
                Suspicious Activity Detected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{suspiciousActivity}</p>
            </CardContent>
          </Card>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Monitor className="h-5 w-5 text-green-500" />
                <span className="text-2xl font-bold">{activeCount}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-500" />
                <span className="text-2xl font-bold">{sessions.length}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Unique IPs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-purple-500" />
                <span className="text-2xl font-bold">{uniqueIps}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sessions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Active Sessions</CardTitle>
            <CardDescription>View and manage your active sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>User Agent</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No active sessions found
                    </TableCell>
                  </TableRow>
                ) : (
                  sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>{getDeviceIcon(session.userAgent)}</TableCell>
                      <TableCell className="font-mono text-sm">{session.ipAddress}</TableCell>
                      <TableCell className="max-w-xs truncate text-sm">{session.userAgent}</TableCell>
                      <TableCell>{new Date(session.createdAt).toLocaleString()}</TableCell>
                      <TableCell>{new Date(session.lastActivityAt).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={session.isActive ? "bg-green-500/10 text-green-500" : "bg-gray-500/10 text-gray-500"}>
                          {session.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleTerminateSession(session.id)}
                        >
                          <LogOut className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
