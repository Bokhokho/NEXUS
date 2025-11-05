"use client";

import { mockContractors } from "@/lib/mock-data";
import { DataTable } from "@/components/dashboard/data-table";
import { StatsChart } from "@/components/dashboard/stats-chart";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export default function ResponsivePage() {
  const responsiveContractors = mockContractors.filter(
    (c) => c.status === "responsive"
  );

  const chartData = mockContractors.reduce((acc, contractor) => {
    const member = contractor.assignedTo;
    const existing = acc.find((item) => item.name === member);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: member, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const columns = [
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone" },
    {
      key: "skills",
      header: "Skills",
      cell: (contractor: any) => (
        <div className="flex gap-1 flex-wrap">
          {contractor.skills.map((skill: string) => (
            <Badge key={skill} variant="secondary">
              {skill}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: "rate",
      header: "Rate",
      cell: (contractor: any) => `$${contractor.rate}/hr`,
    },
    {
      key: "lastContact",
      header: "Last Contact",
      cell: (contractor: any) => formatDate(contractor.lastContact),
    },
    { key: "assignedTo", header: "Assigned To" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Responsive Contractors
        </h1>
        <p className="text-muted-foreground">
          Contractors who have responded and are ready to engage
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <StatsChart
          title="Contractors by Team Member"
          data={chartData}
          type="pie"
        />
        <StatsChart
          title="Response Rate Trend"
          data={[
            { name: "Week 1", value: 12 },
            { name: "Week 2", value: 18 },
            { name: "Week 3", value: 24 },
            { name: "Week 4", value: 30 },
          ]}
          type="line"
        />
      </div>

      <DataTable
        data={responsiveContractors}
        columns={columns}
        searchKeys={["name", "email", "skills", "location"]}
        exportFilename="responsive-contractors"
      />
    </div>
  );
}
