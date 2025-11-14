"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  password: string;
  contractors: number;
}

export default function TeamPage() {
  const router = useRouter();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);

  const [form, setForm] = useState({
    name: "",
    role: "",
    email: "",
    password: "",
    contractors: 0,
  });

  // Verify access (Admin only)
    useEffect(() => {
      const user = localStorage.getItem("nexusUser");

      if (!user) {
        router.push("/gate");
        return;
      }

      const parsed = JSON.parse(user);

      if (parsed.role !== "Admin") {
        router.push("/dashboard");
      }
    }, []);


  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("nexusTeam");
    if (saved) {
      setTeam(JSON.parse(saved));
    } else {
      const defaultTeam: TeamMember[] = [
        {
          id: "oussama",
          name: "Oussama Ahizoune",
          role: "Admin",
          email: "oussama@sorcerer.com",
          password: "nexus001",
          contractors: 0,
        },
        {
          id: "aicha",
          name: "Aicha",
          role: "Senior Recruiter",
          email: "aicha@sorcerer.com",
          password: "nexus002",
          contractors: 12,
        },
        {
          id: "hamid",
          name: "Hamid",
          role: "Tech Recruiter",
          email: "hamid@sorcerer.com",
          password: "nexus003",
          contractors: 8,
        },
        {
          id: "rabi3a",
          name: "Rabi3a",
          role: "Recruiter",
          email: "rabi3a@sorcerer.com",
          password: "nexus004",
          contractors: 10,
        },
      ];
      setTeam(defaultTeam);
      localStorage.setItem("nexusTeam", JSON.stringify(defaultTeam));
    }
  }, []);

  const saveTeam = (updated: TeamMember[]) => {
    setTeam(updated);
    localStorage.setItem("nexusTeam", JSON.stringify(updated));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      const updated = team.map((t) =>
        t.id === editing.id ? { ...t, ...form } : t
      );
      saveTeam(updated);
    } else {
      const newMember = {
        ...form,
        id: form.name.toLowerCase().replace(/\s+/g, "-"),
      };
      saveTeam([...team, newMember]);
    }
    setForm({ name: "", role: "", email: "", password: "", contractors: 0 });
    setEditing(null);
    setOpen(false);
  };

  const handleEdit = (member: TeamMember) => {
    setEditing(member);
    setForm(member);
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    const updated = team.filter((t) => t.id !== id);
    saveTeam(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Team Management</h1>
          <p className="text-muted-foreground">
            Manage team members and their assignments
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 text-white hover:bg-purple-700">
              + Add Team Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit Team Member" : "Add Team Member"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Role</Label>
                <Input
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Password</Label>
                <Input
                  type="text"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label>Contractors</Label>
                <Input
                  type="number"
                  value={form.contractors}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      contractors: Number(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <Button type="submit" className="w-full">
                {editing ? "Update Member" : "Add Member"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {team.map((member) => (
          <Card key={member.id} className="shadow-sm">
            <CardHeader>
              <CardTitle>{member.name}</CardTitle>
              <CardDescription>{member.role}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">{member.email}</p>
              <p className="text-sm">Contractors: {member.contractors}</p>
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(member)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(member.id)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
