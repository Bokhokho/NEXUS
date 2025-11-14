"use client";

import { useState, useEffect, useMemo } from "react";
import { DataTable } from "@/components/dashboard/data-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExternalLink } from "lucide-react";
import * as ExcelJS from "exceljs";
import { mockTeamMembers } from "@/lib/mock-data";


const INACTIVE_STATUSES = new Set(["Submitted","Cancelled","Dropped"]);
const ACTIVE_STATUSES = new Set(["Quoted","In Progress"]);

const loadActive = (): Bid[] =>
  JSON.parse(localStorage.getItem("bids") || "[]");
const saveActive = (rows: Bid[]) =>
  localStorage.setItem("bids", JSON.stringify(rows));

const upsertById = (list: Bid[], row: Bid) => {
  const i = list.findIndex(r => r.id === row.id);
  if (i >= 0) list[i] = row; else list.push(row);
  return list;
};


/* same helper from Active (for date normalization) */
const toISO = (v: unknown): string => {
  if (!v) return "";
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  const s = String(v).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
    const [a, b, y] = s.split("/").map(Number);
    const [m, d] = a > 12 ? [b, a] : [a, b];
    if (!m || !d || !y) return "";
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }
  const d = new Date(s);
  return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
};

type Bid = {
  id: number;
  prime: string;
  projectTitle: string;
  client: string;
  setAside: string;
  dueDate: string;
  dueDateISO: string;
  dueTime: string;
  dueTimeMA: string;
  location: string;
  samLink: string;
  poc: string;
  status: string;
  notes: string;
};

type Filters = {
  prime: string;
  client: string;
  setAside: string;
  dueDate: string;
  location: string;
  poc: string;
  status: string;
};

export default function InactiveBidsPage() {
  const [mounted, setMounted] = useState(false);

  const [bids, setBids] = useState<Bid[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("inactiveBids");
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  const [filters, setFilters] = useState<Filters>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("inactiveBidFilters");
      return stored
        ? JSON.parse(stored)
        : {
            prime: "",
            client: "",
            setAside: "",
            dueDate: "",
            location: "",
            poc: "",
            status: "",
          };
    }
    return {
      prime: "",
      client: "",
      setAside: "",
      dueDate: "",
      location: "",
      poc: "",
      status: "",
    };
  });

  const [appliedFilters, setAppliedFilters] = useState<Filters>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("inactiveBidAppliedFilters");
      return stored
        ? JSON.parse(stored)
        : {
            prime: "",
            client: "",
            setAside: "",
            dueDate: "",
            location: "",
            poc: "",
            status: "",
          };
    }
    return {
      prime: "",
      client: "",
      setAside: "",
      dueDate: "",
      location: "",
      poc: "",
      status: "",
    };
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Bid | null>(null);
  const [form, setForm] = useState<Omit<Bid, "id">>({
    prime: "",
    projectTitle: "",
    client: "",
    setAside: "",
    dueDate: "",
    dueDateISO: "",
    dueTime: "",
    dueTimeMA: "",
    location: "",
    samLink: "",
    poc: "",
    status: "",
    notes: "",
  });

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("inactiveBids", JSON.stringify(bids));
    localStorage.setItem("inactiveBidFilters", JSON.stringify(filters));
    localStorage.setItem(
      "inactiveBidAppliedFilters",
      JSON.stringify(appliedFilters)
    );
  }, [bids, filters, appliedFilters, mounted]);

  // backfill old records without ISO
  useEffect(() => {
    if (!mounted) return;
    setBids(prev =>
      prev.map(b => (b.dueDateISO ? b : { ...b, dueDateISO: toISO(b.dueDate) }))
    );
  }, [mounted]);

  const resetForm = () =>
    setForm({
      prime: "",
      projectTitle: "",
      client: "",
      setAside: "",
      dueDate: "",
      dueDateISO: "",
      dueTime: "",
      dueTimeMA: "",
      location: "",
      samLink: "",
      poc: "",
      status: "",
      notes: "",
    });

  const handleSave = () => {
    const base = { ...form, dueDateISO: toISO(form.dueDate) };
    if (editing) {
      setBids(prev =>
        prev.map(b => (b.id === editing.id ? { ...editing, ...base } : b))
      );
    } else {
      setBids(prev => [...prev, { id: Date.now(), ...base }]);
    }
    setOpen(false);
    setEditing(null);
    resetForm();
  };

  const handleEdit = (bid: Bid) => {
    setEditing(bid);
    setForm(bid);
    setOpen(true);
  };

  const handleDelete = (id: number) => {
    const pass = prompt("Enter admin password to delete:");
    if (pass === "admin123") {
      setBids(prev => prev.filter(b => b.id !== id));
    } else {
      alert("Access denied.");
    }
  };

  // Excel import (optional for inactive; same mapping)
  const handleImportExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const workbook = new ExcelJS.Workbook();
    const arrayBuffer = await file.arrayBuffer();
    await workbook.xlsx.load(arrayBuffer);
    const sheet = workbook.worksheets[0];

    const rows: Bid[] = [];
    sheet.eachRow((row, index) => {
      if (index === 1) return;
      const values = Array.isArray(row.values) ? row.values.slice(1) : [];
      const [
        solicitationName,
        client,
        dueDate,
        dueTime,
        setAside,
        location,
        link,
        poc,
        notes,
      ] = values as (string | number | Date | null | undefined)[];

      let dueTimeMA = "";
      if (dueTime) {
        try {
          const m = (dueTime as string)
            .replace(/\s/g, "")
            .match(/(\d{1,2}):(\d{2})(AM|PM)/i);
          if (m) {
            const [, hour, minute, ampm] = m;
            let h = parseInt(hour, 10);
            if (ampm.toUpperCase() === "PM" && h < 12) h += 12;
            if (ampm.toUpperCase() === "AM" && h === 12) h = 0;
            h = (h + 1) % 24;
            dueTimeMA = `${h.toString().padStart(2, "0")}:${minute}`;
          } else {
            dueTimeMA = String(dueTime);
          }
        } catch {
          dueTimeMA = String(dueTime);
        }
      }

      rows.push({
        id: Date.now() + index,
        prime: "",
        projectTitle: String(solicitationName || ""),
        client: String(client || ""),
        setAside: String(setAside || ""),
        dueDate: String(dueDate || ""),
        dueDateISO: toISO(dueDate),
        dueTime: String(dueTime || ""),
        dueTimeMA,
        location: String(location || ""),
        samLink: String(link || ""),
        poc: String(poc || ""),
        status: "Submitted", // typical inactive default
        notes: String(notes || ""),
      });
    });

    setBids(prev => [...prev, ...rows]);
    event.target.value = "";
  };

  const teamOptions = mockTeamMembers.map(m => m.name);

  const filteredBids = useMemo(() => {
    return bids.filter(b =>
      Object.entries(appliedFilters).every(([key, value]) => {
        if (!value) return true;
        if (key === "dueDate") {
          return String(b.dueDateISO ?? "").startsWith(String(value));
        }
        const val = String((b as any)[key] ?? "").toLowerCase();
        return val.includes(String(value).toLowerCase());
      })
    );
  }, [bids, appliedFilters]);

  const columns = [
    { key: "prime", header: "Prime", accessorKey: "prime" },
    { key: "projectTitle", header: "Project Title", accessorKey: "projectTitle" },
    { key: "client", header: "Client", accessorKey: "client" },
    { key: "setAside", header: "Set-Aside", accessorKey: "setAside" },
    {
      key: "dueDate",
      header: "Due Date",
      accessorKey: "dueDateISO",
      cell: (bid: Bid) => bid.dueDate || bid.dueDateISO,
    },
    { key: "dueTime", header: "Due Time", accessorKey: "dueTime" },
    { key: "dueTimeMA", header: "Due Time (MA)", accessorKey: "dueTimeMA" },
    { key: "location", header: "Location", accessorKey: "location" },
    {
      key: "samLink",
      header: "SAM Link",
      cell: (bid: Bid) =>
        bid.samLink ? (
          <Button
            asChild
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <a
              href={bid.samLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 flex items-center gap-1"
            >
              <ExternalLink className="w-4 h-4" />
              Visit
            </a>
          </Button>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    { key: "poc", header: "POC", accessorKey: "poc" },
    {
      key: "status",
      header: "Status",
      cell: (bid: Bid) => (
        <Select
      value={bid.status}
      onValueChange={(value: string) => {
        if (ACTIVE_STATUSES.has(value)) {
          // move back to Active
          setBids(prev => {
            const moving = prev.find(b => b.id === bid.id);
            if (!moving) return prev;
            const updated = { ...moving, status: value };

            const curActive = loadActive();
            const nextActive = upsertById([...curActive], updated); // dedupe
            saveActive(nextActive);

            return prev.filter(b => b.id !== bid.id); // remove from Inactive
          });
          } else {
            // stay in Inactive but update status
            setBids(prev =>
              prev.map(b => (b.id === bid.id ? { ...b, status: value } : b))
            );
          }
        }}
        >
        <SelectTrigger className="w-[160px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {/* show ALL statuses so you can send it back */}
          <SelectItem value="Quoted">Quoted</SelectItem>
          <SelectItem value="In Progress">In Progress</SelectItem>
          <SelectItem value="Submitted">Submitted</SelectItem>
          <SelectItem value="Cancelled">Cancelled</SelectItem>
          <SelectItem value="Dropped">Dropped</SelectItem>
        </SelectContent>
      </Select>
      ),
    },
    
    { key: "notes", header: "Notes", accessorKey: "notes" },
    {
      key: "actions",
      header: "Actions",
      cell: (bid: Bid) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleEdit(bid)}>
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDelete(bid.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const clearFilters = () => {
    const empty: Filters = {
      prime: "",
      client: "",
      setAside: "",
      dueDate: "",
      location: "",
      poc: "",
      status: "",
    };
    setFilters(empty);
    setAppliedFilters(empty);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inactive Bids</h1>
          <p className="text-muted-foreground">
            All bids marked Submitted, Cancelled, or Dropped
          </p>
        </div>

        <div className="flex gap-2">
          <input
            type="file"
            accept=".xlsx"
            onChange={handleImportExcel}
            className="hidden"
            id="excel-input"
          />
          <Button asChild variant="secondary">
            <label htmlFor="excel-input" className="cursor-pointer">
              Import from Excel
            </label>
          </Button>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditing(null); resetForm(); }}>
                Add Bid
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editing ? "Edit Bid" : "Add New Bid"}
                </DialogTitle>
              </DialogHeader>

              <div className="grid gap-3 py-4">
                <Select
                  value={form.prime}
                  onValueChange={(v) => setForm({ ...form, prime: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Prime" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EBG">EBG</SelectItem>
                    <SelectItem value="STRLC">STRLC</SelectItem>
                    <SelectItem value="AMB">AMB</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Project Title"
                  value={form.projectTitle}
                  onChange={(e) =>
                    setForm({ ...form, projectTitle: e.target.value })
                  }
                />

                <Input
                  placeholder="Client"
                  value={form.client}
                  onChange={(e) => setForm({ ...form, client: e.target.value })}
                />

                <Select
                  value={form.setAside}
                  onValueChange={(v) => setForm({ ...form, setAside: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Set-Aside" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SB">SB</SelectItem>
                    <SelectItem value="SDVOSB">SDVOSB</SelectItem>
                    <SelectItem value="WOSB">WOSB</SelectItem>
                    <SelectItem value="UNRES">UNRES</SelectItem>
                    <SelectItem value="INDIAN">INDIAN</SelectItem>
                    <SelectItem value="8(a)">8(a)</SelectItem>
                    <SelectItem value="VOSB">VOSB</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Due Date"
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      dueDate: e.target.value,
                      dueDateISO: toISO(e.target.value),
                    })
                  }
                />

                <Input
                  placeholder="Due Time"
                  value={form.dueTime}
                  onChange={(e) => setForm({ ...form, dueTime: e.target.value })}
                />

                <Input
                  placeholder="Due Time (MA)"
                  value={form.dueTimeMA}
                  onChange={(e) =>
                    setForm({ ...form, dueTimeMA: e.target.value })
                  }
                />

                <Input
                  placeholder="Location"
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                />

                <Input
                  placeholder="SAM Link"
                  value={form.samLink}
                  onChange={(e) =>
                    setForm({ ...form, samLink: e.target.value })
                  }
                />

                <Select
                  value={form.poc}
                  onValueChange={(v) => setForm({ ...form, poc: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="POC" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamOptions.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Submitted">Submitted</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                    <SelectItem value="Dropped">Dropped</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Notes"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />

                <Button onClick={handleSave}>
                  {editing ? "Save Changes" : "Add Bid"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg items-end">
        <Select
          value={filters.prime}
          onValueChange={(v) => setFilters((f) => ({ ...f, prime: v }))}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Prime" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EBG">EBG</SelectItem>
            <SelectItem value="STRLC">STRLC</SelectItem>
            <SelectItem value="AMB">AMB</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Client"
          value={filters.client}
          onChange={(e) =>
            setFilters((f) => ({ ...f, client: e.target.value }))
          }
          className="w-[150px]"
        />

        <Select
          value={filters.setAside}
          onValueChange={(v) => setFilters((f) => ({ ...f, setAside: v }))}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Set-Aside" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SB">SB</SelectItem>
            <SelectItem value="SDVOSB">SDVOSB</SelectItem>
            <SelectItem value="WOSB">WOSB</SelectItem>
            <SelectItem value="UNRES">UNRES</SelectItem>
            <SelectItem value="INDIAN">INDIAN</SelectItem>
            <SelectItem value="8(a)">8(a)</SelectItem>
            <SelectItem value="VOSB">VOSB</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={filters.dueDate}
          onChange={(e) =>
            setFilters((f) => ({ ...f, dueDate: e.target.value }))
          }
          className="w-[160px]"
        />

        <Input
          placeholder="Location"
          value={filters.location}
          onChange={(e) =>
            setFilters((f) => ({ ...f, location: e.target.value }))
          }
          className="w-[150px]"
        />

        <Select
          value={filters.poc}
          onValueChange={(v) => setFilters((f) => ({ ...f, poc: v }))}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="POC" />
          </SelectTrigger>
          <SelectContent>
            {teamOptions.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.status}
          onValueChange={(v) => setFilters((f) => ({ ...f, status: v }))}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Submitted">Submitted</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
            <SelectItem value="Dropped">Dropped</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="default" onClick={() => setAppliedFilters(filters)}>
          Search
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            const empty: Filters = {
              prime: "",
              client: "",
              setAside: "",
              dueDate: "",
              location: "",
              poc: "",
              status: "",
            };
            setFilters(empty);
            setAppliedFilters(empty);
          }}
        >
          Clear Filters
        </Button>
      </div>

      {mounted && <DataTable columns={columns} data={filteredBids} />}
    </div>
  );
}
