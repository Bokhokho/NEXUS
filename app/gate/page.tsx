"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type TeamMember = { id: string; name: string; role: string };

export default function GatePage() {
  const [password, setPassword] = useState("");
  const [identity, setIdentity] = useState("");
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    // Load team list (names/roles only, no passwords)
    fetch("/api/auth/team")
      .then((r) => r.json())
      .then((data) => setTeam(data))
      .catch(() => {});

    // If already logged in, redirect
    fetch("/api/auth/session")
      .then((r) => { if (r.ok) router.push("/dashboard"); })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: identity, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Login failed.");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-950 via-slate-900 to-slate-950 p-4">
      <Card className="w-full max-w-md shadow-2xl border border-white/10">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
            <Image src="/logo.png" alt="NEXUS Logo" width={55} height={55} priority />
          </div>

          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            NEXUS
          </CardTitle>

          <CardDescription>Smart contractor sourcing platform</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Select Identity</Label>
              <Select value={identity} onValueChange={setIdentity}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your identity" />
                </SelectTrigger>
                <SelectContent>
                  {team.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name} — {member.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white"
              size="lg"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Enter Platform"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
