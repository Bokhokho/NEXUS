"use client";

import * as React from "react";
import { Download, Filter, Search, FileSpreadsheet, FileText } from "lucide-react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { exportToCSV, exportToExcel } from "@/lib/utils";

interface Column<T> {
  key: string;
  header: string;
  cell?: (item: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  filterOptions?: string[];
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchKeys?: string[];
  exportFilename?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchKeys = [],
  exportFilename = "export",
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc");
  const [columnFilters, setColumnFilters] = React.useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = React.useState(false);

  const filterableColumns = columns.filter(col => col.filterable === true);

  const filteredData = React.useMemo(() => {
    let result = data;

    if (searchTerm) {
      result = result.filter((item) =>
        searchKeys.some((key) => {
          const value = item[key];
          return value
            ?.toString()
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        })
      );
    }

    Object.entries(columnFilters).forEach(([key, value]) => {
      if (value && value !== "all") {
        result = result.filter((item) => {
          const itemValue = item[key];
          if (Array.isArray(itemValue)) {
            return itemValue.some(v => v.toString().toLowerCase() === value.toLowerCase());
          }
          return itemValue?.toString().toLowerCase() === value.toLowerCase();
        });
      }
    });

    return result;
  }, [data, searchTerm, searchKeys, columnFilters]);

  const sortedData = React.useMemo(() => {
    if (!sortKey) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal === bVal) return 0;
      
      const comparison = aVal > bVal ? 1 : -1;
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredData, sortKey, sortDirection]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const handleExportCSV = () => {
    exportToCSV(sortedData, exportFilename);
  };

  const handleExportExcel = () => {
    exportToExcel(sortedData, exportFilename);
  };

  const getUniqueFilterValues = (key: string): string[] => {
    const values = new Set<string>();
    data.forEach((item) => {
      const value = item[key];
      if (Array.isArray(value)) {
        value.forEach(v => values.add(v.toString()));
      } else if (value !== null && value !== undefined) {
        values.add(value.toString());
      }
    });
    return Array.from(values).sort();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        {filterableColumns.length > 0 && (
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters {Object.values(columnFilters).filter(v => v && v !== "all").length > 0 && `(${Object.values(columnFilters).filter(v => v && v !== "all").length})`}
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleExportCSV}>
              <FileText className="mr-2 h-4 w-4" />
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportExcel}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export as Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {showFilters && filterableColumns.length > 0 && (
        <div className="p-4 border rounded-lg bg-muted/50 space-y-3">
          <div className="font-medium text-sm">Filter by:</div>
          <div className="grid gap-4 md:grid-cols-3">
            {filterableColumns.map((column) => (
              <div key={column.key} className="space-y-2">
                <label className="text-sm font-medium">{column.header}</label>
                <Select
                  value={columnFilters[column.key] || "all"}
                  onValueChange={(value) =>
                    setColumnFilters((prev) => ({
                      ...prev,
                      [column.key]: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {(column.filterOptions || getUniqueFilterValues(column.key)).map(
                      (option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setColumnFilters({})}
          >
            Clear all filters
          </Button>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  onClick={() =>
                    column.sortable !== false && handleSort(column.key)
                  }
                  className={
                    column.sortable !== false
                      ? "cursor-pointer hover:bg-muted/50"
                      : ""
                  }
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {sortKey === column.key && (
                      <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center text-muted-foreground"
                >
                  No results found
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((item, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      {column.cell
                        ? column.cell(item)
                        : item[column.key]?.toString() || "-"}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {sortedData.length} of {data.length} results
      </div>
    </div>
  );
}
