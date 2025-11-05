# Sorcerer - Smart Contractor Sourcing Platform

## Overview

Sorcerer is a modern SaaS dashboard application for managing contractor sourcing operations. Built with Next.js 14 App Router, the platform provides comprehensive tools for importing, tracking, and managing contractor relationships with advanced filtering, reporting, and team collaboration features.

The application features a clean, professional interface with sidebar and top navigation, supports light/dark themes, and includes advanced data visualization and export capabilities. The platform is designed for desktop and tablet users who need to efficiently manage large contractor databases and coordinate across team members.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Routing**
- Next.js 14 with App Router for file-based routing and React Server Components
- TypeScript for type safety across the application
- Client-side routing with pages under `/app/dashboard/*` for authenticated dashboard views
- Dedicated `/gate` route for authentication entry point
- Root page (`/`) redirects to authentication gate

**UI Component System**
- shadcn/ui component library built on Radix UI primitives
- Tailwind CSS for styling with custom design tokens
- CSS variables for theming (light/dark mode support)
- Component variants using class-variance-authority for consistent styling patterns
- Framer Motion for animations and transitions

**State Management**
- React hooks for local component state
- next-themes for persistent theme preferences
- Custom toast notification system using Radix UI Toast primitives

**Layout Structure**
- Unified dashboard layout with sidebar navigation and top bar
- Sidebar includes icon-based navigation with route highlighting
- Top bar contains theme toggle, notifications, and user profile dropdown
- Responsive design optimized for desktop and tablet (hidden sidebar on mobile)

**Data Display Components**
- Reusable `DataTable` component with built-in search, sort, filter, and export functionality
- `StatsChart` component supporting bar, pie, and line charts via Recharts
- Badge system for status indicators and tags
- Avatar components for user representation

### Data Layer

**Mock Data System**
- TypeScript interfaces for data models: `Contractor`, `TeamMember`, `Activity`, `Notification`
- Mock data stored in `/lib/mock-data.ts` for demonstration purposes
- Data models include:
  - **Contractors**: name, email, phone, skills array, status (responsive/pending/not_responsive), assigned team member, hourly rate, location, contact history, notes
  - **Team Members**: name, email, role, avatar initials, contractor assignment counts
  - **Activities**: user, action, details, timestamp, activity type
  - **Notifications**: message, type (info/success/warning/error), read status, timestamp

**Data Operations**
- CSV export utility function in `/lib/utils.ts`
- Date formatting utilities for consistent timestamp display
- Client-side filtering and sorting in data tables

### Page Architecture

**Authentication Flow**
- `/gate`: Password and identity selector entry point
- Redirect to `/dashboard` upon authentication
- No actual backend authentication implemented (using mock flow)

**Dashboard Pages**
- **Main Dashboard** (`/dashboard`): Overview with statistics cards showing total contractors, responsive/non-responsive counts, and trends
- **Importer** (`/dashboard/importer`): Contractor import interface with data table
- **Responsive** (`/dashboard/responsive`): Filtered view of responsive contractors with team distribution chart
- **Sourcing** (`/dashboard/sourcing`): Tab-based view organized by team member assignments
- **Activity** (`/dashboard/activity`): Complete audit trail with searchable activity log
- **Team** (`/dashboard/team`): Team member management with contractor assignment counts
- **Reports** (`/dashboard/reports`): Report configuration and generation interface with charts
- **Notifications** (`/dashboard/notifications`): Notification center with read/unread status
- **Profile** (`/dashboard/profile`): User profile management interface
- **Settings** (`/dashboard/settings`): Application settings including password management
- **Support** (`/dashboard/support`): Help center with documentation and contact options

**Error Handling**
- Custom 404 page with branded styling and navigation back to dashboard
- Toast notifications for user feedback on actions

### Styling System

**Design Tokens**
- HSL-based color system with CSS variables for light and dark modes
- Primary brand color: Purple (#a855f7)
- Consistent spacing and border radius values
- Gradient backgrounds for authentication pages

**Theme Implementation**
- Dark mode as default theme
- System theme detection enabled
- Theme toggle in top navigation bar
- Smooth transitions disabled to prevent flash

**Typography**
- Inter font family from Google Fonts
- Consistent font sizing and weight hierarchy
- Text color variables that adapt to theme

## External Dependencies

### UI Libraries
- **Radix UI**: Accessible component primitives (accordion, alert-dialog, avatar, checkbox, dialog, dropdown-menu, label, popover, scroll-area, select, separator, slot, switch, tabs, toast, tooltip)
- **Lucide React**: Icon library for consistent iconography
- **Recharts**: Charting library for data visualization
- **Framer Motion**: Animation library for UI transitions

### Development Tools
- **Tailwind CSS**: Utility-first CSS framework
- **tailwindcss-animate**: Animation utilities for Tailwind
- **tailwind-merge**: Utility for merging Tailwind classes
- **class-variance-authority**: Component variant management
- **clsx**: Conditional className utility

### Form & Validation
- **React Hook Form**: Form state management
- **Zod**: Schema validation library
- **date-fns**: Date manipulation and formatting

### Build & Development
- **Next.js**: React framework (v14.2.15, running on port 5000)
- **TypeScript**: Type system
- **ESLint**: Code linting with Next.js config
- **PostCSS & Autoprefixer**: CSS processing

### Database (Mentioned but Not Implemented)
- Prisma folder exists in repository structure, suggesting planned Postgres/Neon integration
- Currently using mock data without actual database connection
- API routes not yet implemented