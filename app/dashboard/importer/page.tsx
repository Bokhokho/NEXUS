"use client";

import { mockContractors } from "@/lib/mock-data";
import { DataTable } from "@/components/dashboard/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ImporterPage() {
  const columns = [
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone" },
    {
      key: "skills",
      header: "Skills",
      filterable: true,
      cell: (contractor: any) => (
        <div className="flex gap-1 flex-wrap">
          {contractor.skills.slice(0, 2).map((skill: string) => (
            <Badge key={skill} variant="secondary">
              {skill}
            </Badge>
          ))}
          {contractor.skills.length > 2 && (
            <Badge variant="outline">+{contractor.skills.length - 2}</Badge>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      filterable: true,
      filterOptions: ["responsive", "pending", "not_responsive"],
      cell: (contractor: any) => (
        <Badge
          variant={
            contractor.status === "responsive"
              ? "default"
              : contractor.status === "pending"
              ? "secondary"
              : "destructive"
          }
        >
          {contractor.status}
        </Badge>
      ),
    },
    { key: "location", header: "Location", filterable: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contractor Importer</h1>
          <p className="text-muted-foreground">
            Import and manage contractor profiles
          </p>
        </div>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Import Contractors
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Import History</CardTitle>
          <CardDescription>
            All imported contractors with search, sort, filter, and export (CSV/Excel) capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={mockContractors}
            columns={columns}
            searchKeys={["name", "email", "skills", "location"]}
            exportFilename="contractors"
          />
        </CardContent>
      </Card>
    </div>
  );
}
