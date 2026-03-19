"use client";

import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Loader2, Search } from "lucide-react";
import { exportToExcel } from "@/lib/utils";

type Source = "SAM.gov" | "OpenStreetMap" | "USASpending.gov";

interface Contractor {
  name: string;
  address: string;
  phone: string;
  website: string;
  source: Source;
  naics?: string;
  extra?: string;
}

const SOURCE_STYLES: Record<Source, string> = {
  "SAM.gov": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "OpenStreetMap": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  "USASpending.gov": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

const SOURCE_DESCRIPTIONS: Record<Source, string> = {
  "SAM.gov": "Registered federal contractors",
  "OpenStreetMap": "Locally listed active businesses",
  "USASpending.gov": "Companies with past federal contract awards",
};

export default function ImporterPage() {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Contractor[]>([]);
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  const fetchContractors = async () => {
    if (!keyword || !location) return alert("Please enter both keyword and location.");
    setLoading(true);
    setResults([]);
    try {
      const res = await fetch(
        `/api/importer?keyword=${encodeURIComponent(keyword)}&location=${encodeURIComponent(location)}`
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error(err);
      alert("Something went wrong while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(
    () => (sourceFilter === "all" ? results : results.filter((r) => r.source === sourceFilter)),
    [results, sourceFilter]
  );

  const countBySource = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of results) counts[r.source] = (counts[r.source] || 0) + 1;
    return counts;
  }, [results]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Contractor Importer</h1>
        <p className="text-muted-foreground">
          Search across SAM.gov, OpenStreetMap, and USASpending.gov simultaneously — all free, no API billing.
        </p>
      </div>

      {/* Source legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {(Object.keys(SOURCE_STYLES) as Source[]).map((s) => (
          <span key={s} className={`px-2.5 py-1 rounded-full font-medium ${SOURCE_STYLES[s]}`}>
            {s} — {SOURCE_DESCRIPTIONS[s]}
          </span>
        ))}
      </div>

      {/* Search bar */}
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Service (e.g. HVAC, Electrician)"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchContractors()}
          className="max-w-xs"
        />
        <Input
          placeholder="City, State (e.g. Miami, FL)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchContractors()}
          className="max-w-xs"
        />
        <Button onClick={fetchContractors} disabled={loading}>
          {loading ? (
            <Loader2 className="animate-spin w-4 h-4 mr-2" />
          ) : (
            <Search className="w-4 h-4 mr-2" />
          )}
          Search
        </Button>
        {filtered.length > 0 && (
          <Button variant="outline" onClick={() => exportToExcel(filtered, "Contractors")}>
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
        )}
      </div>

      {/* Results summary + source filter */}
      {results.length > 0 && (
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-sm text-muted-foreground">{results.length} total results:</span>
          {(Object.keys(SOURCE_STYLES) as Source[]).map((s) =>
            countBySource[s] ? (
              <span
                key={s}
                className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${SOURCE_STYLES[s]}`}
              >
                {s}: {countBySource[s]}
              </span>
            ) : null
          )}
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-[170px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="SAM.gov">SAM.gov only</SelectItem>
              <SelectItem value="OpenStreetMap">OpenStreetMap only</SelectItem>
              <SelectItem value="USASpending.gov">USASpending.gov only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Results table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Website</TableHead>
              <TableHead>Extra</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  {loading
                    ? "Fetching from SAM.gov, OpenStreetMap, and USASpending.gov..."
                    : "No results yet — enter a keyword and location above."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((r, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap ${SOURCE_STYLES[r.source]}`}
                    >
                      {r.source}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">{r.name || "-"}</TableCell>
                  <TableCell className="text-sm">{r.address || "-"}</TableCell>
                  <TableCell className="text-sm">{r.phone || "-"}</TableCell>
                  <TableCell>
                    {r.website ? (
                      <a
                        href={r.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline text-sm"
                      >
                        Visit
                      </a>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {r.extra
                      ? r.extra
                      : r.naics
                      ? `NAICS: ${r.naics}`
                      : "-"}
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
