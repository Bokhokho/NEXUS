"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wand2 } from "lucide-react";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockTeamMembers } from "@/lib/mock-data";

export default function GatePage() {
  const [password, setPassword] = useState("");
  const [identity, setIdentity] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password && identity) {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-950 via-slate-900 to-slate-950 p-4">
      <Card className="w-full max-w-md glow">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
            <Wand2 className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Sorcerer
          </CardTitle>
          <CardDescription>
            Smart contractor sourcing platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="identity">Select Identity</Label>
              <Select value={identity} onValueChange={setIdentity} required>
                <SelectTrigger id="identity">
                  <SelectValue placeholder="Choose your identity" />
                </SelectTrigger>
                <SelectContent>
                  {mockTeamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name} - {member.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" size="lg">
              Enter Platform
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
