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

export default function ContractsPage() {
  const router = useRouter();
  const [contracts, setContracts] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const [form, setForm] = useState({
    poc: "",
    prime: "",
    project: "",
    client: "",
    contractNumber: "",
    amount: "",
    cost: "",
    pop: "",
    subcontractor: "",
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
    const saved = localStorage.getItem("nexusContracts");
    if (saved) setContracts(JSON.parse(saved));
  }, []);

  const saveDB = (list: any[]) => {
    setContracts(list);
    localStorage.setItem("nexusContracts", JSON.stringify(list));
  };

  const submitForm = (e: any) => {
    e.preventDefault();
    if (editing) {
      const updated = contracts.map((r) =>
        r.id === editing.id ? { ...r, ...form } : r
      );
      saveDB(updated);
    } else {
      saveDB([...contracts, { id: crypto.randomUUID(), ...form }]);
    }

    setForm({
      poc: "",
      prime: "",
      project: "",
      client: "",
      contractNumber: "",
      amount: "",
      cost: "",
      pop: "",
      subcontractor: "",
    });

    setEditing(null);
    setOpen(false);
  };

  const columns = [
    { key: "poc", header: "POC", sortable: true },
    { key: "prime", header: "Prime", sortable: true },
    { key: "project", header: "Project", sortable: true },
    { key: "client", header: "Client", sortable: true },
    { key: "contractNumber", header: "Contract #", sortable: true },
    { key: "amount", header: "Total Amount", sortable: true },
    { key: "cost", header: "Total Cost", sortable: true },
    { key: "pop", header: "POP", sortable: true },
    { key: "subcontractor", header: "Subcontractor", sortable: true },
    {
      key: "actions",
      header: "Actions",
      cell: (row: any) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => { setEditing(row); setForm(row); setOpen(true); }}>
            Edit
          </Button>
          <Button size="sm" variant="destructive" onClick={() => saveDB(contracts.filter((r) => r.id !== row.id))}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Contracts</h1>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add Contract</Button>
          </DialogTrigger>

          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Contract" : "Add Contract"}</DialogTitle>
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
                {editing ? "Save Changes" : "Add Contract"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable data={contracts} columns={columns} searchKeys={["project", "client", "prime"]} />
    </div>
  );
}
