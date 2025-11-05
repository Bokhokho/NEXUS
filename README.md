# Sorcerer - Smart Contractor Sourcing Platform

A modern SaaS dashboard built with Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui for managing contractor sourcing operations.

## 🚀 Features

- **Modern Dashboard UI** - Clean, professional interface with sidebar and top navigation
- **Light/Dark Mode** - Seamless theme switching with persistent preferences
- **Advanced Data Tables** - Searchable, sortable, filterable tables with CSV export
- **Interactive Charts** - Bar, pie, and line charts using Recharts
- **Responsive Design** - Optimized for desktop and tablet devices
- **Real-time Notifications** - Activity feed and notification system
- **Role-based Access** - Team management with role assignments
- **Comprehensive Reporting** - Generate and download reports with custom filters

## 📁 Project Structure

```
sorcerer/
├── app/                      # Next.js 14 App Router
│   ├── dashboard/           # Dashboard pages
│   │   ├── activity/       # Activity log
│   │   ├── importer/       # Contractor import
│   │   ├── notifications/  # Notifications page
│   │   ├── profile/        # User profile
│   │   ├── reports/        # Reports generation
│   │   ├── responsive/     # Responsive contractors
│   │   ├── settings/       # App settings
│   │   ├── sourcing/       # Team sourcing view
│   │   ├── support/        # Support center
│   │   └── team/           # Team management
│   ├── gate/               # Auth gate page
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   ├── globals.css         # Global styles
│   └── not-found.tsx       # Custom 404 page
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── layout/             # Layout components
│   │   ├── sidebar.tsx     # Sidebar navigation
│   │   └── topbar.tsx      # Top navigation bar
│   ├── dashboard/          # Dashboard-specific components
│   │   ├── data-table.tsx  # Advanced data table
│   │   └── stats-chart.tsx # Chart components
│   └── providers/          # React providers
│       └── theme-provider.tsx
├── lib/
│   ├── utils.ts            # Utility functions
│   └── mock-data.ts        # Mock data for demo
├── prisma/
│   └── schema.prisma       # Database schema
└── public/                 # Static assets
```

## 🎨 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Charts:** Recharts
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **Forms:** React Hook Form + Zod
- **Theme:** next-themes
- **Database:** Prisma (PostgreSQL)

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd sorcerer
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:5000](http://localhost:5000) in your browser

## 📊 Current Features

### Pages

1. **Gate** (`/gate`) - Authentication page with identity selection
2. **Dashboard** (`/dashboard`) - Overview with key metrics
3. **Importer** (`/dashboard/importer`) - Contractor import management
4. **Responsive** (`/dashboard/responsive`) - Responsive contractor tracking
5. **Sourcing** (`/dashboard/sourcing`) - Team-based contractor assignments
6. **Activity** (`/dashboard/activity`) - Complete audit log
7. **Team** (`/dashboard/team`) - Team member management
8. **Settings** (`/dashboard/settings`) - App configuration
9. **Reports** (`/dashboard/reports`) - Report generation
10. **Support** (`/dashboard/support`) - Help center
11. **Notifications** (`/dashboard/notifications`) - Notification history
12. **Profile** (`/dashboard/profile`) - User preferences
13. **404** - Custom error page

### Components

- **DataTable** - Advanced table with search, sort, filter, export
- **StatsChart** - Configurable charts (bar, pie, line)
- **Sidebar** - Collapsible navigation with icons
- **Topbar** - Theme toggle, notifications, user menu
- **UI Components** - Full shadcn/ui component library

## 🔧 Adding New Pages

To add a new page to the dashboard:

1. Create a new directory under `app/dashboard/`:
```bash
mkdir app/dashboard/your-page
```

2. Create a `page.tsx` file:
```tsx
export default function YourPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Page</h1>
        <p className="text-muted-foreground">Description</p>
      </div>
      {/* Your content */}
    </div>
  );
}
```

3. Add to sidebar navigation in `components/layout/sidebar.tsx`:
```tsx
const navItems = [
  // ... existing items
  { href: "/dashboard/your-page", label: "Your Page", icon: YourIcon },
];
```

## 🎨 Theming

The app uses CSS variables for theming. Customize colors in `app/globals.css`:

```css
:root {
  --primary: 271 91% 65%;        /* Purple accent */
  --background: 0 0% 100%;       /* White background */
  /* ... other variables */
}

.dark {
  --primary: 271 91% 65%;        /* Same purple in dark mode */
  --background: 222.2 84% 4.9%;  /* Dark background */
  /* ... other variables */
}
```

## 📦 Database Setup (Optional)

This app currently uses mock data. To connect to a real database:

1. Set up a PostgreSQL database (e.g., Neon, Supabase)

2. Add your database URL to `.env`:
```
DATABASE_URL="postgresql://..."
```

3. Run Prisma migrations:
```bash
npx prisma migrate dev
npx prisma generate
```

4. Replace mock data imports with Prisma queries

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub

2. Import your repository on [Vercel](https://vercel.com)

3. Configure environment variables

4. Deploy!

### Build for Production

```bash
npm run build
npm run start
```

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, email support@sorcerer.com or visit the Support page in the dashboard.

---

Built with ✨ by the Sorcerer team
