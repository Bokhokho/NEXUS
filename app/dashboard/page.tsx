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
import { supabase } from "@/lib/supabaseClient";

export default function DashboardPage() {
  const [period, setPeriod] = useState<"week" | "month" | "year">("week");

  const [stats, setStats] = useState({
    submitted: 0,
    won: 0,
    lost: 0,
    cancelled: 0,
    dropped: 0,
  });

  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("inactive-bids")
          .select("payload, created_at");

        if (error) throw error;

        const rows = (data ?? []).map((r: any) => ({
          status: r.payload?.status ?? "",
          createdAt: r.created_at,
        }));

        const now = new Date();

        const filtered = rows.filter(({ createdAt }) => {
          const date = new Date(createdAt);
          if (period === "week") {
            return (now.getTime() - date.getTime()) / 86400000 <= 7;
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
          return true;
        });

        setStats({
          submitted: filtered.filter((b) => b.status === "Submitted").length,
          won: filtered.filter((b) => b.status === "Won").length,
          lost: filtered.filter((b) => b.status === "Lost").length,
          cancelled: filtered.filter((b) => b.status === "Cancelled").length,
          dropped: filtered.filter((b) => b.status === "Dropped").length,
        });

        const grouped: Record<string, any> = {};
        filtered.forEach(({ status, createdAt }) => {
          const key = new Date(createdAt).toLocaleDateString();
          if (!grouped[key]) {
            grouped[key] = { date: key, submitted: 0, won: 0, lost: 0, cancelled: 0, dropped: 0 };
          }
          if (status === "Submitted") grouped[key].submitted++;
          if (status === "Won") grouped[key].won++;
          if (status === "Lost") grouped[key].lost++;
          if (status === "Cancelled") grouped[key].cancelled++;
          if (status === "Dropped") grouped[key].dropped++;
        });

        setChartData(Object.values(grouped).sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        ));
      } catch (e) {
        console.error("Dashboard fetch failed:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [period]);

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">Dashboard Analytics</h1>

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

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-card shadow">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Submitted</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{loading ? "—" : stats.submitted}</p>
          </CardContent>
        </Card>

        <Card className="bg-card shadow border-green-500/30">
          <CardHeader>
            <CardTitle className="text-sm text-green-500">Won</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-500">{loading ? "—" : stats.won}</p>
          </CardContent>
        </Card>

        <Card className="bg-card shadow border-red-500/30">
          <CardHeader>
            <CardTitle className="text-sm text-red-500">Lost</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-red-500">{loading ? "—" : stats.lost}</p>
          </CardContent>
        </Card>

        <Card className="bg-card shadow">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Cancelled</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{loading ? "—" : stats.cancelled}</p>
          </CardContent>
        </Card>

        <Card className="bg-card shadow">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Dropped</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{loading ? "—" : stats.dropped}</p>
          </CardContent>
        </Card>
      </div>

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
                <Bar dataKey="won" fill="#16a34a" />
                <Bar dataKey="lost" fill="#dc2626" />
                <Bar dataKey="cancelled" fill="#e11d48" />
                <Bar dataKey="dropped" fill="#475569" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

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
                <Line
                  type="monotone"
                  dataKey="submitted"
                  stroke="#7c3aed"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
