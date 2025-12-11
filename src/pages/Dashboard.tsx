import { FileKey, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppLayout } from "@/components/layout/AppLayout";

const stats = [
  {
    title: "Total Certificates",
    value: "0",
    description: "Across all domains",
    icon: FileKey,
    color: "text-primary",
  },
  {
    title: "Valid",
    value: "0",
    description: "Active certificates",
    icon: CheckCircle,
    color: "text-success",
  },
  {
    title: "Expiring Soon",
    value: "0",
    description: "Within 30 days",
    icon: Clock,
    color: "text-warning",
  },
  {
    title: "Expired",
    value: "0",
    description: "Requires attention",
    icon: AlertTriangle,
    color: "text-destructive",
  },
];

export default function Dashboard() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your certificate inventory and status
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest certificate events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-32 items-center justify-center text-muted-foreground">
                No recent activity
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Expirations</CardTitle>
              <CardDescription>Certificates expiring soon</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-32 items-center justify-center text-muted-foreground">
                No expiring certificates
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
