export interface Contractor {
  id: string;
  name: string;
  email: string;
  phone: string;
  skills: string[];
  status: "responsive" | "pending" | "not_responsive";
  assignedTo: string;
  rate: number;
  location: string;
  lastContact: Date;
  notes: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  contractorsAssigned: number;
}

export interface Activity {
  id: string;
  user: string;
  action: string;
  details: string;
  timestamp: Date;
  type: "import" | "update" | "assignment" | "status_change" | "login";
}

export interface Notification {
  id: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: Date;
}

export const mockContractors: Contractor[] = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "+1 (555) 123-4567",
    skills: ["React", "Node.js", "TypeScript"],
    status: "responsive",
    assignedTo: "Sarah Wilson",
    rate: 85,
    location: "New York, NY",
    lastContact: new Date("2025-11-04"),
    notes: "Strong frontend developer with 5 years experience",
  },
  {
    id: "2",
    name: "Emily Johnson",
    email: "emily.j@example.com",
    phone: "+1 (555) 234-5678",
    skills: ["Python", "Django", "PostgreSQL"],
    status: "responsive",
    assignedTo: "Mike Chen",
    rate: 90,
    location: "San Francisco, CA",
    lastContact: new Date("2025-11-03"),
    notes: "Backend specialist, excellent with databases",
  },
  {
    id: "3",
    name: "Michael Brown",
    email: "m.brown@example.com",
    phone: "+1 (555) 345-6789",
    skills: ["Java", "Spring Boot", "AWS"],
    status: "pending",
    assignedTo: "Sarah Wilson",
    rate: 95,
    location: "Austin, TX",
    lastContact: new Date("2025-10-28"),
    notes: "Enterprise Java developer with cloud experience",
  },
  {
    id: "4",
    name: "Sarah Davis",
    email: "sarah.d@example.com",
    phone: "+1 (555) 456-7890",
    skills: ["UI/UX", "Figma", "React"],
    status: "responsive",
    assignedTo: "Jessica Lee",
    rate: 80,
    location: "Seattle, WA",
    lastContact: new Date("2025-11-05"),
    notes: "Product designer with development skills",
  },
  {
    id: "5",
    name: "David Wilson",
    email: "d.wilson@example.com",
    phone: "+1 (555) 567-8901",
    skills: ["DevOps", "Kubernetes", "Docker"],
    status: "not_responsive",
    assignedTo: "Mike Chen",
    rate: 100,
    location: "Boston, MA",
    lastContact: new Date("2025-10-15"),
    notes: "DevOps engineer, no response in 2 weeks",
  },
  {
    id: "6",
    name: "Lisa Anderson",
    email: "l.anderson@example.com",
    phone: "+1 (555) 678-9012",
    skills: ["React Native", "iOS", "Android"],
    status: "responsive",
    assignedTo: "Jessica Lee",
    rate: 88,
    location: "Los Angeles, CA",
    lastContact: new Date("2025-11-04"),
    notes: "Mobile development specialist",
  },
];

export const mockTeamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Sarah Wilson",
    email: "sarah.wilson@sorcerer.com",
    role: "Senior Recruiter",
    avatar: "SW",
    contractorsAssigned: 12,
  },
  {
    id: "2",
    name: "Mike Chen",
    email: "mike.chen@sorcerer.com",
    role: "Tech Recruiter",
    avatar: "MC",
    contractorsAssigned: 8,
  },
  {
    id: "3",
    name: "Jessica Lee",
    email: "jessica.lee@sorcerer.com",
    role: "Recruiter",
    avatar: "JL",
    contractorsAssigned: 10,
  },
  {
    id: "4",
    name: "Tom Garcia",
    email: "tom.garcia@sorcerer.com",
    role: "Admin",
    avatar: "TG",
    contractorsAssigned: 0,
  },
];

export const mockActivities: Activity[] = [
  {
    id: "1",
    user: "Sarah Wilson",
    action: "Imported contractors",
    details: "Added 15 new contractors from LinkedIn",
    timestamp: new Date("2025-11-05T10:30:00"),
    type: "import",
  },
  {
    id: "2",
    user: "Mike Chen",
    action: "Updated contractor status",
    details: "Changed John Smith to responsive",
    timestamp: new Date("2025-11-05T09:15:00"),
    type: "status_change",
  },
  {
    id: "3",
    user: "Jessica Lee",
    action: "Assigned contractor",
    details: "Assigned Lisa Anderson to project Alpha",
    timestamp: new Date("2025-11-05T08:45:00"),
    type: "assignment",
  },
  {
    id: "4",
    user: "Sarah Wilson",
    action: "Updated profile",
    details: "Modified Emily Johnson's rate to $90/hr",
    timestamp: new Date("2025-11-04T16:20:00"),
    type: "update",
  },
  {
    id: "5",
    user: "Tom Garcia",
    action: "System login",
    details: "Admin logged in from IP 192.168.1.1",
    timestamp: new Date("2025-11-04T14:00:00"),
    type: "login",
  },
];

export const mockNotifications: Notification[] = [
  {
    id: "1",
    message: "15 new contractors imported successfully",
    type: "success",
    read: false,
    createdAt: new Date("2025-11-05T10:30:00"),
  },
  {
    id: "2",
    message: "5 contractors haven't been contacted in 2 weeks",
    type: "warning",
    read: false,
    createdAt: new Date("2025-11-05T09:00:00"),
  },
  {
    id: "3",
    message: "Your weekly report is ready to download",
    type: "info",
    read: true,
    createdAt: new Date("2025-11-04T18:00:00"),
  },
  {
    id: "4",
    message: "Database backup completed",
    type: "success",
    read: true,
    createdAt: new Date("2025-11-04T02:00:00"),
  },
];
