import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, 
  Monitor, 
  LogOut, 
  AlertTriangle, 
  RefreshCw, 
  Smartphone, 
  Globe,
  Clock,
  Shield,
  Users,
  MapPin
} from "lucide-react";
import { toast } from "sonner";
import { sessionsApi } from "@/lib/api";
import type { UserSession, SessionAnalytics, SuspiciousActivity } from "@/lib/api/types";
import { Progress } from "@/components/ui/progress";

export default function Sessions() {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [analytics, setAnalytics] = useState<SessionAnalytics | null>(null);
  const [suspiciousActivity, setSuspiciousActivity] = useState<SuspiciousActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [analyticsData, suspiciousData] = await Promise.all([
        sessionsApi.getAnalytics().catch(() => null),
        sessionsApi.detectSuspiciousActivity().catch(() => null),
      ]);
      
      // Set analytics data
      if (analyticsData) {
        setAnalytics(analyticsData);
        // Extract sessions from analytics response
        setSessions(analyticsData.currentActiveSessions || []);
      }

      // Set suspicious activity data (single object, not array)
      if (suspiciousData) {
        setSuspiciousActivity(suspiciousData);
      }
    } catch (error) {
      console.error("Failed to fetch session data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTerminateSession = async (sessionId: number) => {
    try {
      await sessionsApi.terminate(sessionId);
      toast.success("Session terminated successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to terminate session");
    }
  };

  const handleTerminateAll = async () => {
    try {
      await sessionsApi.terminateAll();
      toast.success("All other sessions terminated");
      fetchData();
    } catch (error) {
      toast.error("Failed to terminate sessions");
    }
  };

  const getDeviceIcon = (userAgent: string) => {
    const ua = userAgent?.toLowerCase() || "";
    if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
      return <Smartphone className="h-4 w-4" />;
    }
    return <Monitor className="h-4 w-4" />;
  };

  const getDeviceType = (userAgent: string) => {
    const ua = userAgent?.toLowerCase() || "";
    if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
      return "Mobile";
    }
    return "Desktop";
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case "HIGH":
        return <Badge variant="destructive">High Risk</Badge>;
      case "MEDIUM":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">Medium</Badge>;
      case "LOW":
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="secondary">{level}</Badge>;
    }
  };

  const activeCount = analytics?.activeSessions || sessions.filter((s) => s.active).length;
  const uniqueIps = analytics?.uniqueIpAddresses || new Set(sessions.map((s) => s.ipAddress)).size;
  const mobileCount = sessions.filter((s) => 
    s.userAgent?.toLowerCase().includes("mobile") || 
    s.userAgent?.toLowerCase().includes("android") ||
    s.userAgent?.toLowerCase().includes("iphone")
  ).length;

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
            <p className="text-muted-foreground">Monitor and manage user sessions across devices</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleTerminateAll} variant="destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Terminate All Others
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                  <Users className="h-5 w-5 text-green-500" />
                </div>
                <span className="text-2xl font-bold">{activeCount}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Unique IPs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                  <Globe className="h-5 w-5 text-blue-500" />
                </div>
                <span className="text-2xl font-bold">{uniqueIps}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Mobile Devices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                  <Smartphone className="h-5 w-5 text-purple-500" />
                </div>
                <span className="text-2xl font-bold">{mobileCount}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Suspicious Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${suspiciousActivity?.suspicious ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                  <AlertTriangle className={`h-5 w-5 ${suspiciousActivity?.suspicious ? 'text-red-500' : 'text-green-500'}`} />
                </div>
                <span className="text-2xl font-bold">{suspiciousActivity?.suspicious ? 'Yes' : 'No'}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Card */}
        {analytics && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Session Analytics for {analytics.username}
              </CardTitle>
              <CardDescription>Insights into session patterns and device usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm font-medium mb-3">Session Overview</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Sessions</span>
                      <span className="font-medium">{analytics.totalSessions}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Active Sessions</span>
                      <span className="font-medium">{analytics.activeSessions}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Terminated</span>
                      <span className="font-medium">{analytics.terminatedSessions}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Expired</span>
                      <span className="font-medium">{analytics.expiredSessions}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-3">Session Details</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Avg Duration</span>
                      <span className="font-medium">{Math.round(analytics.averageSessionDurationMinutes)} min</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Unique IPs</span>
                      <span className="font-medium">{analytics.uniqueIpAddresses}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Active Devices</span>
                      <span className="font-medium">{analytics.currentActiveSessions?.length || 0}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-3">Security Status</p>
                  <div className="space-y-2">
                    {suspiciousActivity && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Multiple IPs</span>
                          <Badge variant={suspiciousActivity.multipleIpAddresses ? "destructive" : "outline"}>
                            {suspiciousActivity.multipleIpAddresses ? "Yes" : "No"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Concurrent Sessions</span>
                          <Badge variant={suspiciousActivity.suspiciousConcurrentSessions ? "destructive" : "outline"}>
                            {suspiciousActivity.activeConcurrentSessions}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Recent Count</span>
                          <Badge variant={suspiciousActivity.unusualSessionCount ? "destructive" : "outline"}>
                            {suspiciousActivity.recentSessionCount}
                          </Badge>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs for Sessions and Suspicious Activity */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="active">Active Sessions</TabsTrigger>
            <TabsTrigger value="suspicious">
              Suspicious Activity
              {suspiciousActivity?.suspicious && (
                <Badge variant="destructive" className="ml-2">!</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <Card>
              <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>View and manage all active user sessions</CardDescription>
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
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getDeviceIcon(session.userAgent)}
                              <span className="text-sm">{getDeviceType(session.userAgent)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{session.ipAddress}</TableCell>
                          <TableCell className="max-w-xs truncate text-sm">{session.userAgent}</TableCell>
                          <TableCell className="text-sm">{new Date(session.createdAt).toLocaleString()}</TableCell>
                          <TableCell className="text-sm">{new Date(session.lastActivityAt).toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge className={session.active ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"}>
                              {session.active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleTerminateSession(session.id)}
                              className="text-destructive hover:text-destructive"
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
          </TabsContent>

          <TabsContent value="suspicious">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Suspicious Activity Detection
                </CardTitle>
                <CardDescription>Real-time analysis of unusual session patterns for {suspiciousActivity?.username}</CardDescription>
              </CardHeader>
              <CardContent>
                {!suspiciousActivity?.suspicious ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Shield className="h-16 w-16 text-green-500/50 mb-4" />
                    <h3 className="text-lg font-medium">No Suspicious Activity Detected</h3>
                    <p className="text-muted-foreground">All sessions appear normal and secure</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Card className="border-destructive/50 bg-destructive/5">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-4 flex-1">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-5 w-5 text-destructive" />
                              <span className="font-medium text-lg">{suspiciousActivity.username}</span>
                              <Badge variant="destructive">Suspicious Activity Detected</Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                                  <div className="flex items-center gap-2">
                                    <Globe className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">Multiple IP Addresses</span>
                                  </div>
                                  <Badge variant={suspiciousActivity.multipleIpAddresses ? "destructive" : "outline"}>
                                    {suspiciousActivity.multipleIpAddresses ? "Yes" : "No"}
                                  </Badge>
                                </div>
                                
                                <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">Unique IP Addresses</span>
                                  </div>
                                  <span className="font-medium">{suspiciousActivity.uniqueIpAddresses}</span>
                                </div>
                                
                                <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                                  <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">Concurrent Sessions</span>
                                  </div>
                                  <Badge variant={suspiciousActivity.suspiciousConcurrentSessions ? "destructive" : "outline"}>
                                    {suspiciousActivity.activeConcurrentSessions}
                                  </Badge>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">Recent Session Count</span>
                                  </div>
                                  <span className="font-medium">{suspiciousActivity.recentSessionCount}</span>
                                </div>
                                
                                <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                                  <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">Unusual Session Count</span>
                                  </div>
                                  <Badge variant={suspiciousActivity.unusualSessionCount ? "destructive" : "outline"}>
                                    {suspiciousActivity.unusualSessionCount ? "Yes" : "No"}
                                  </Badge>
                                </div>
                                
                                <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                                  <div className="flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">Suspicious Concurrent</span>
                                  </div>
                                  <Badge variant={suspiciousActivity.suspiciousConcurrentSessions ? "destructive" : "outline"}>
                                    {suspiciousActivity.suspiciousConcurrentSessions ? "Yes" : "No"}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                              <AlertTriangle className="h-5 w-5 text-destructive" />
                              <div>
                                <p className="text-sm font-medium">Security Recommendation</p>
                                <p className="text-sm text-muted-foreground">This account shows signs of suspicious activity. Review the session details and consider terminating suspicious sessions.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
