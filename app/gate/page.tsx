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

export default function GatePage() {
  const [password, setPassword] = useState("");
  const [identity, setIdentity] = useState("");
  const [team, setTeam] = useState<any[]>([]);
  const [error, setError] = useState("");

  const router = useRouter();

  useEffect(() => {
    let savedTeam = localStorage.getItem("nexusTeam");

    if (!savedTeam) {
      const defaultAdmin = [
        {
          id: "oussama",
          name: "Oussama Ahizoune",
          email: "oussama@nexus.com",
          role: "Admin",
          password: "admin123",
          initials: "OA",
        },
      ];
      localStorage.setItem("nexusTeam", JSON.stringify(defaultAdmin));
      savedTeam = JSON.stringify(defaultAdmin);
    }

    setTeam(JSON.parse(savedTeam));

    const existing = localStorage.getItem("nexusUser");
    if (existing) router.push("/dashboard");
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const member = team.find((m) => m.id === identity);

    if (!member) {
      setError("Identity not found.");
      return;
    }

    if (member.password !== password) {
      setError("Incorrect password.");
      return;
    }

    const session = {
      ...member,
      loggedAt: Date.now(),
      expiresAt: Date.now() + 1000 * 60 * 60 * 24,
    };

    localStorage.setItem("nexusUser", JSON.stringify(session));
    router.push("/dashboard");
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
            >
              Enter Platform
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
