"use client";

import { mockActivities } from "@/lib/mock-data";
import { DataTable } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ActivityPage() {
  const columns = [
    {
      key: "timestamp",
      header: "Timestamp",
      cell: (activity: any) => (
        <span className="text-sm">{formatDateTime(activity.timestamp)}</span>
      ),
    },
    { key: "user", header: "User" },
    { key: "action", header: "Action" },
    { key: "details", header: "Details" },
    {
      key: "type",
      header: "Type",
      cell: (activity: any) => (
        <Badge variant="outline">{activity.type}</Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
        <p className="text-muted-foreground">
          Complete audit trail of all system actions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            All user actions with timestamps, filters, and export capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={mockActivities}
            columns={columns}
            searchKeys={["user", "action", "details"]}
            exportFilename="activity-log"
          />
        </CardContent>
      </Card>
    </div>
  );
}
