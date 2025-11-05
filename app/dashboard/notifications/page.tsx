"use client";

import { mockNotifications } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";
import { CheckCheck, Bell, AlertTriangle, Info, CheckCircle } from "lucide-react";

export default function NotificationsPage() {
  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "error":
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            View all your notifications and alerts
          </p>
        </div>
        <Button variant="outline">
          <CheckCheck className="mr-2 h-4 w-4" />
          Mark All as Read
        </Button>
      </div>

      <div className="space-y-3">
        {mockNotifications.map((notification) => (
          <Card
            key={notification.id}
            className={notification.read ? "opacity-60" : ""}
          >
            <CardContent className="flex items-start gap-4 p-4">
              <div className="mt-0.5">{getIcon(notification.type)}</div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {notification.message}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(notification.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!notification.read && (
                  <Badge variant="secondary">New</Badge>
                )}
                <Button variant="ghost" size="sm">
                  {notification.read ? "Unread" : "Mark Read"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
