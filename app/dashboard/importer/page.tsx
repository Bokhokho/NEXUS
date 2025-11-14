"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Loader2, Search } from "lucide-react";
import { exportToExcel } from "@/lib/utils";

interface Contractor {
  name: string;
  address?: string;
  phone?: string;
  website?: string;
}

export default function ImporterPage() {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Contractor[]>([]);

  const fetchContractors = async () => {
    if (!keyword || !location) return alert("Please enter both keyword and location.");
    setLoading(true);
    try {
      const res = await fetch(`/api/maps?keyword=${encodeURIComponent(keyword)}&location=${encodeURIComponent(location)}`);
      if (!res.ok) throw new Error("Failed to fetch contractors");
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error(err);
      alert("Something went wrong while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => exportToExcel(results, "Contractors");

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Google Maps Importer</h1>
      <p className="text-muted-foreground">
        Search for contractors directly from Google Maps API and export results.
      </p>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Service (e.g. HVAC, Electrician)"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="max-w-xs"
        />
        <Input
          placeholder="City or State (e.g. Miami, FL)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="max-w-xs"
        />
        <Button onClick={fetchContractors} disabled={loading}>
          {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Search className="w-4 h-4 mr-2" />}
          Search
        </Button>
        {results.length > 0 && (
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Website</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                  {loading ? "Fetching data..." : "No results found"}
                </TableCell>
              </TableRow>
            ) : (
              results.map((r, i) => (
                <TableRow key={i}>
                  <TableCell>{r.name}</TableCell>
                  <TableCell>{r.address || "-"}</TableCell>
                  <TableCell>{r.phone || "-"}</TableCell>
                  <TableCell>
                    {r.website ? (
                      <a href={r.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                        {r.website}
                      </a>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
