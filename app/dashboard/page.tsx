"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const [period, setPeriod] = useState<"week" | "month" | "year">("week");

  const [stats, setStats] = useState({
    submitted: 0,
    cancelled: 0,
    dropped: 0,
  });

  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem("nexusBids");
    if (!raw) return;

    const bids = JSON.parse(raw);
    const now = new Date();

    const filtered = bids.filter((b: any) => {
      const date = new Date(b.createdAt || b.date || Date.now());

      if (period === "week") {
        const diff = (now.getTime() - date.getTime()) / (1000 * 3600 * 24);
        return diff <= 7;
      }

      if (period === "month") {
        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      }

      if (period === "year") {
        return date.getFullYear() === now.getFullYear();
      }
    });

    // KPI Stats
    setStats({
      submitted: filtered.filter((b: any) => b.status === "Submitted").length,
      cancelled: filtered.filter((b: any) => b.status === "Cancelled").length,
      dropped: filtered.filter((b: any) => b.status === "Dropped").length,
    });

    // Chart Data (group by day)
    const grouped: Record<string, any> = {};

    filtered.forEach((b: any) => {
      const dateKey = new Date(
        b.createdAt || b.date || Date.now()
      ).toLocaleDateString();

      if (!grouped[dateKey]) {
        grouped[dateKey] = { date: dateKey, submitted: 0, cancelled: 0, dropped: 0 };
      }

      if (b.status === "Submitted") grouped[dateKey].submitted++;
      if (b.status === "Cancelled") grouped[dateKey].cancelled++;
      if (b.status === "Dropped") grouped[dateKey].dropped++;
    });

    setChartData(Object.values(grouped));
  }, [period]);

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">Dashboard Analytics</h1>

      {/* Period Selection */}
      <div className="flex gap-3">
        <Button
          variant={period === "week" ? "default" : "outline"}
          onClick={() => setPeriod("week")}
        >
          This Week
        </Button>
        <Button
          variant={period === "month" ? "default" : "outline"}
          onClick={() => setPeriod("month")}
        >
          This Month
        </Button>
        <Button
          variant={period === "year" ? "default" : "outline"}
          onClick={() => setPeriod("year")}
        >
          This Year
        </Button>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card shadow">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Submitted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold">{stats.submitted}</p>
          </CardContent>
        </Card>

        <Card className="bg-card shadow">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Cancelled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold">{stats.cancelled}</p>
          </CardContent>
        </Card>

        <Card className="bg-card shadow">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Dropped</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold">{stats.dropped}</p>
          </CardContent>
        </Card>
      </div>

      {/* BAR CHART */}
      <Card className="p-6 shadow">
        <CardHeader>
          <CardTitle>Bids Activity Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="submitted" fill="#7c3aed" />
                <Bar dataKey="cancelled" fill="#e11d48" />
                <Bar dataKey="dropped" fill="#475569" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* LINE CHART */}
      <Card className="p-6 shadow">
        <CardHeader>
          <CardTitle>Submission Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="submitted" stroke="#7c3aed" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
