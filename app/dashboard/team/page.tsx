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
}

export default function TeamPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [form, setForm] = useState({ name: "", role: "", email: "" });

  // Password dialog state
  const [pwOpen, setPwOpen] = useState(false);
  const [pwTarget, setPwTarget] = useState<TeamMember | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((s) => {
        if (s?.role === "Admin") {
          setIsAdmin(true);
          fetch("/api/auth/team")
            .then((r) => r.json())
            .then((data) => setTeam(data))
            .catch(() => {});
        } else {
          router.replace("/dashboard");
        }
      })
      .catch(() => router.replace("/dashboard"));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      setTeam((prev) =>
        prev.map((t) => (t.id === editing.id ? { ...t, ...form } : t))
      );
    } else {
      const newMember: TeamMember = {
        ...form,
        id: form.name.toLowerCase().replace(/\s+/g, "-"),
        email: form.email,
      };
      setTeam((prev) => [...prev, newMember]);
    }
    setForm({ name: "", role: "", email: "" });
    setEditing(null);
    setOpen(false);
  };

  const handleEdit = (member: TeamMember) => {
    setEditing(member);
    setForm({ name: member.name, role: member.role, email: member.email });
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    setTeam((prev) => prev.filter((t) => t.id !== id));
  };

  const openSetPassword = (member: TeamMember) => {
    setPwTarget(member);
    setNewPassword("");
    setConfirmPassword("");
    setPwError("");
    setPwSuccess("");
    setPwOpen(true);
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");

    if (newPassword.length < 6) {
      setPwError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("Passwords do not match.");
      return;
    }

    setPwLoading(true);
    try {
      const res = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: pwTarget!.id, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwError(data.error || "Failed to set password.");
      } else {
        setPwSuccess(`Password updated for ${pwTarget!.name}.`);
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setPwError("Network error. Please try again.");
    } finally {
      setPwLoading(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Team Management</h1>
          <p className="text-muted-foreground">
            Manage team members and their permissions
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
              <Button type="submit" className="w-full">
                {editing ? "Update Member" : "Add Member"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Set Password Dialog */}
      <Dialog open={pwOpen} onOpenChange={setPwOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Set Password — {pwTarget?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSetPassword} className="space-y-4 mt-4">
            <div>
              <Label>New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Min. 6 characters"
              />
            </div>
            <div>
              <Label>Confirm Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Repeat password"
              />
            </div>
            {pwError && <p className="text-sm text-red-500">{pwError}</p>}
            {pwSuccess && <p className="text-sm text-green-500">{pwSuccess}</p>}
            <Button type="submit" className="w-full" disabled={pwLoading}>
              {pwLoading ? "Saving…" : "Set Password"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {team.map((member) => (
          <Card key={member.id} className="shadow-sm">
            <CardHeader>
              <CardTitle>{member.name}</CardTitle>
              <CardDescription>{member.role}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">{member.email}</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                <Button size="sm" variant="outline" onClick={() => handleEdit(member)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openSetPassword(member)}
                >
                  Set Password
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
