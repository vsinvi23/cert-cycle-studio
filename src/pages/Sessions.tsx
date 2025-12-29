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
  const [suspiciousActivities, setSuspiciousActivities] = useState<SuspiciousActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sessionsData, analyticsData, suspiciousData] = await Promise.all([
        sessionsApi.getActive(),
        sessionsApi.getAnalytics().catch(() => null),
        sessionsApi.detectSuspiciousActivity().catch(() => null),
      ]);
      setSessions(sessionsData || []);
      
      // Parse analytics if it's a string
      if (typeof analyticsData === 'string') {
        try {
          setAnalytics(JSON.parse(analyticsData));
        } catch {
          setAnalytics(null);
        }
      } else {
        setAnalytics(analyticsData as SessionAnalytics | null);
      }

      // Parse suspicious activity if it's a string
      if (typeof suspiciousData === 'string') {
        try {
          const parsed = JSON.parse(suspiciousData);
          setSuspiciousActivities(Array.isArray(parsed) ? parsed : [parsed]);
        } catch {
          setSuspiciousActivities([]);
        }
      } else if (Array.isArray(suspiciousData)) {
        setSuspiciousActivities(suspiciousData);
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

  const activeCount = sessions.filter((s) => s.isActive).length;
  const uniqueIps = new Set(sessions.map((s) => s.ipAddress)).size;
  const mobileCount = sessions.filter((s) => 
    s.userAgent?.toLowerCase().includes("mobile") || 
    s.userAgent?.toLowerCase().includes("android")
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
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                <span className="text-2xl font-bold">{suspiciousActivities.length}</span>
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
                Session Analytics
              </CardTitle>
              <CardDescription>Insights into session patterns and device usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm font-medium mb-3">Device Breakdown</p>
                  {analytics.deviceBreakdown && Object.entries(analytics.deviceBreakdown).map(([device, count]) => (
                    <div key={device} className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">{device}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={(count / analytics.totalSessions) * 100} className="w-20 h-2" />
                        <span className="text-sm font-medium w-8">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-medium mb-3">Session Stats</p>
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
                      <span className="text-sm text-muted-foreground">Avg Duration</span>
                      <span className="font-medium">{Math.round(analytics.averageSessionDuration / 60)} min</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-3">Login Frequency</p>
                  {analytics.loginFrequency && Object.entries(analytics.loginFrequency).slice(0, 5).map(([date, count]) => (
                    <div key={date} className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">{date}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
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
              {suspiciousActivities.length > 0 && (
                <Badge variant="destructive" className="ml-2">{suspiciousActivities.length}</Badge>
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
                            <Badge className={session.isActive ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"}>
                              {session.isActive ? "Active" : "Inactive"}
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
                  Suspicious Activity
                </CardTitle>
                <CardDescription>Users with unusual session patterns that may indicate security risks</CardDescription>
              </CardHeader>
              <CardContent>
                {suspiciousActivities.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Shield className="h-16 w-16 text-green-500/50 mb-4" />
                    <h3 className="text-lg font-medium">No Suspicious Activity</h3>
                    <p className="text-muted-foreground">All sessions appear normal</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {suspiciousActivities.map((activity, index) => (
                      <Card key={index} className="border-destructive/50">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{activity.username}</span>
                                {getRiskBadge(activity.riskLevel)}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {activity.uniqueIps} unique IPs
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  Last active: {new Date(activity.lastActivityAt).toLocaleString()}
                                </span>
                              </div>
                              {activity.ipAddresses && activity.ipAddresses.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {activity.ipAddresses.slice(0, 5).map((ip, i) => (
                                    <Badge key={i} variant="outline" className="font-mono text-xs">
                                      {ip}
                                    </Badge>
                                  ))}
                                  {activity.ipAddresses.length > 5 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{activity.ipAddresses.length - 5} more
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                            <Button variant="outline" size="sm">
                              Investigate
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
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
