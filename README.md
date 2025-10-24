# Vibe - DJ Management System

A comprehensive DJ and event management platform built with Next.js 15, Prisma, PostgreSQL, and Auth.js.

## Features

### Authentication & Authorization
- **Role-based access control** (Admin & DJ roles)
- **Secure password hashing** with Argon2
- **Session management** with Auth.js
- **Protected routes** with middleware

### Admin Dashboard
- **Sidebar navigation** with Catalyst UI components
- **Role-based routing** (redirects based on user role)
- **Comprehensive CRUD operations** for:
  - Customers
  - Venues
  - Gigs
  - DJ Profiles/Users

### Key Functionality
- **Table/Card view toggle** for all entity lists
- **On-the-fly entity creation** - Create customers/venues directly from gig form
- **Audit logging** - Track all changes with before/after snapshots
- **Audit log indicators** - Visual badges show entities with change history
- **Search and filtering** across all entities
- **Responsive design** with Tailwind CSS

### Data Models
- **Users** - Admin and DJ accounts with encrypted passwords
- **Customers** - Client information and contact details
- **Venues** - Event locations with types and capacity
- **Gigs** - Event bookings with dates, times, rates, and assignments
- **DJ Profiles** - Professional information, rates, equipment, genres
- **Audit Logs** - Complete change tracking for compliance

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: Auth.js (NextAuth v5)
- **Password Hashing**: Argon2
- **UI Components**: Shadcn/UI + Catalyst UI Kit
- **Styling**: Tailwind CSS v4
- **Forms**: React Hook Form + Zod validation
- **Notifications**: Sonner

## Prerequisites

- Node.js 18+ or Bun
- PostgreSQL database (connection string provided)

## Installation

1. **Install dependencies**:
```bash
npm install
# or
bun install
```

2. **Generate Prisma Client**:
```bash
npm run prisma:generate
```

3. **Run database migrations**:
```bash
npm run prisma:migrate
```

4. **Seed the database** (creates demo users):
```bash
npm run prisma:seed
```

## Demo Credentials

After seeding, you can log in with:

### Admin Account
- **Email**: admin@vibe.com
- **Password**: admin123

### DJ Account
- **Email**: dj@vibe.com
- **Password**: dj123

## Development

Start the development server:

```bash
npm run dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Management

### Prisma Studio
View and edit database records visually:
```bash
npm run prisma:studio
```

### Create Migration
After modifying the Prisma schema:
```bash
npm run prisma:migrate
```

## Project Structure

```
src/
├── app/
│   ├── admin/           # Admin dashboard pages
│   │   ├── customers/
│   │   ├── venues/
│   │   ├── gigs/
│   │   └── djs/
│   ├── dj/              # DJ portal pages
│   ├── api/             # API routes
│   └── login/           # Authentication
├── components/          # React components
│   ├── ui/              # Shadcn/UI components
│   ├── *-form-dialog.tsx
│   ├── audit-log-dialog.tsx
│   └── admin-sidebar.tsx
├── lib/
│   ├── prisma.ts        # Database client
│   ├── password.ts      # Argon2 utilities
│   └── audit.ts         # Audit logging
└── types/
    └── next-auth.d.ts   # TypeScript definitions

prisma/
├── schema.prisma        # Database schema
└── seed.ts              # Seed data
```

## Key Features Explained

### Audit Logging
Every create, update, and delete operation is automatically logged with:
- User who made the change
- Timestamp
- Entity type and ID
- Before/after snapshots (for updates)

View audit logs by clicking the "History" button on any entity with changes.

### On-the-Fly Creation
When creating a gig:
1. Select an existing customer or click "+" to create a new one
2. Select an existing venue or click "+" to create a new one
3. The new entities are immediately available in the dropdowns

### Table/Card Views
Toggle between:
- **Table view**: Compact, scannable list with sorting
- **Card view**: Visual cards with more details

### Role-Based Access
- **Admin users**: Full access to all CRUD operations
- **DJ users**: Limited access to their profile and assigned gigs

## Database Schema Highlights

### Enums
- `UserRole`: admin, dj
- `VenueType`: bar, club, restaurant, private_event, wedding, corporate, festival, other
- `GigStatus`: scheduled, confirmed, completed, cancelled

### Relationships
- Users → DJ Profiles (one-to-one)
- Customers → Gigs (one-to-many)
- Venues → Gigs (one-to-many)
- DJ Profiles → Gigs (one-to-many)
- Users → Audit Logs (one-to-many)

## Security Features

- **Argon2 password hashing** with optimized parameters
- **Session-based authentication** with JWT
- **Route protection** via middleware
- **Role-based authorization** on all API endpoints
- **SQL injection protection** via Prisma

## API Routes

### Customers
- `GET /api/customers` - List all customers
- `POST /api/customers` - Create customer
- `PUT /api/customers/[id]` - Update customer
- `DELETE /api/customers/[id]` - Delete customer
- `GET /api/customers/[id]/audit-logs` - Get audit logs

### Venues
- Similar structure to customers

### Gigs
- Similar structure with additional relationships

### DJ Profiles
- `GET /api/dj-profiles` - List all DJ profiles
- `PUT /api/dj-profiles/[id]` - Update profile
- `DELETE /api/dj-profiles/[id]` - Delete profile & user

### DJ Users
- `POST /api/dj-users` - Create DJ user with profile

## Production Deployment

1. **Set up environment variables** (if needed)
2. **Run migrations** on production database
3. **Build the application**:
```bash
npm run build
```
4. **Start production server**:
```bash
npm start
```

## Future Enhancements

- Document upload functionality (W9, contracts)
- Recurring gig management
- Payment tracking and invoicing
- Calendar integration
- Email notifications
- Mobile app
- Advanced reporting and analytics

## License

Private - All rights reserved

## Support

For issues or questions, please contact the development team.