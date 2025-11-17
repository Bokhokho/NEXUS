"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { DataTable } from "@/components/dashboard/data-table";

export default function PastPerformancesPage() {
  const router = useRouter();
  const [records, setRecords] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const [form, setForm] = useState({
    prime: "",
    project: "",
    client: "",
    contractNumber: "",
    startDate: "",
    endDate: "",
    amount: "",
    pocName: "",
    pocPhone: "",
    pocEmail: "",
    location: "",
    description: "",
  });

  // Admin-only access
  useEffect(() => {
    const raw = localStorage.getItem("nexusUser");
    if (!raw) return router.push("/gate");

    const user = JSON.parse(raw);
    if (user.role !== "Admin") router.push("/dashboard");
  }, []);

  // Load DB
  useEffect(() => {
    const saved = localStorage.getItem("nexusPastPerformances");
    if (saved) setRecords(JSON.parse(saved));
  }, []);

  const saveDB = (list: any[]) => {
    setRecords(list);
    localStorage.setItem("nexusPastPerformances", JSON.stringify(list));
  };

  const submitForm = (e: any) => {
    e.preventDefault();
    if (editing) {
      const updated = records.map((r) => (r.id === editing.id ? { ...r, ...form } : r));
      saveDB(updated);
    } else {
      const newRec = { id: crypto.randomUUID(), ...form };
      saveDB([...records, newRec]);
    }

    setForm({
      prime: "",
      project: "",
      client: "",
      contractNumber: "",
      startDate: "",
      endDate: "",
      amount: "",
      pocName: "",
      pocPhone: "",
      pocEmail: "",
      location: "",
      description: "",
    });
    setEditing(null);
    setOpen(false);
  };

  const columns = [
    { key: "prime", header: "Prime", sortable: true },
    { key: "project", header: "Project Name", sortable: true },
    { key: "client", header: "Client", sortable: true },
    { key: "contractNumber", header: "Contract #", sortable: true },
    { key: "startDate", header: "Start Date", sortable: true },
    { key: "endDate", header: "Completion", sortable: true },
    { key: "amount", header: "Amount ($)", sortable: true },
    { key: "location", header: "Location", sortable: true },
    {
      key: "actions",
      header: "Actions",
      cell: (row: any) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => { setEditing(row); setForm(row); setOpen(true); }}>
            Edit
          </Button>
          <Button size="sm" variant="destructive" onClick={() => saveDB(records.filter((r) => r.id !== row.id))}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Past Performances</h1>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add Record</Button>
          </DialogTrigger>

          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Record" : "Add Past Performance"}</DialogTitle>
            </DialogHeader>

            <form onSubmit={submitForm} className="space-y-3 mt-4 max-h-[75vh] overflow-y-auto pr-2">
              {Object.keys(form).map((key) => (
                <div key={key}>
                  <Label>{key.replace(/([A-Z])/g, " $1")}</Label>
                  <Input
                    value={(form as any)[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  />
                </div>
              ))}

              <Button type="submit" className="w-full">
                {editing ? "Save Changes" : "Add Record"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable data={records} columns={columns} searchKeys={["prime", "project", "client", "location"]} />
    </div>
  );
}
