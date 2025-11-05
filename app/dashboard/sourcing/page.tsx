"use client";

import { mockTeamMembers, mockContractors } from "@/lib/mock-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function SourcingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Team Sourcing View
        </h1>
        <p className="text-muted-foreground">
          View and manage contractor assignments by team member
        </p>
      </div>

      <Tabs defaultValue={mockTeamMembers[0].id} className="space-y-4">
        <TabsList>
          {mockTeamMembers.map((member) => (
            <TabsTrigger key={member.id} value={member.id}>
              {member.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {mockTeamMembers.map((member) => {
          const assigned = mockContractors.filter(
            (c) => c.assignedTo === member.name
          );
          
          return (
            <TabsContent key={member.id} value={member.id} className="space-y-4">
              <div className="flex items-center gap-4 p-4 border rounded-lg bg-card">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">
                    {member.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                  <p className="text-sm">{member.email}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{assigned.length}</div>
                  <p className="text-sm text-muted-foreground">
                    Contractors Assigned
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {assigned.map((contractor) => (
                  <Card key={contractor.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {contractor.name}
                      </CardTitle>
                      <Badge
                        variant={
                          contractor.status === "responsive"
                            ? "default"
                            : contractor.status === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {contractor.status}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {contractor.email}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {contractor.phone}
                      </p>
                      <div className="flex gap-1 flex-wrap">
                        {contractor.skills.map((skill) => (
                          <Badge key={skill} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm font-semibold">
                        ${contractor.rate}/hr
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
