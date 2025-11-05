import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserX, Activity } from "lucide-react";

export default function DashboardPage() {
  const stats = [
    {
      title: "Total Contractors",
      value: "156",
      icon: Users,
      change: "+12%",
      changeType: "positive" as const,
    },
    {
      title: "Responsive",
      value: "98",
      icon: UserCheck,
      change: "+8%",
      changeType: "positive" as const,
    },
    {
      title: "Not Responsive",
      value: "23",
      icon: UserX,
      change: "-3%",
      changeType: "negative" as const,
    },
    {
      title: "Pending",
      value: "35",
      icon: Activity,
      change: "+5%",
      changeType: "positive" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your contractor sourcing platform
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span
                    className={
                      stat.changeType === "positive"
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {stat.change}
                  </span>{" "}
                  from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Charts and detailed analytics coming soon...
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Activity feed coming soon...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
