# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OptovisionPlus is an optical shop management system (Spanish-language UI) for managing inventory, clients with prescription data, orders, and company settings. Built with Next.js 14 App Router + PostgreSQL + Prisma + NextAuth.

## Commands

```bash
# Development
npm run dev           # Start dev server (PWA disabled in dev)
npm run build         # Generate Prisma client + build Next.js
npm run start         # Start production server
npm run lint          # Run ESLint

# Database
npm run db:generate   # Generate Prisma client after schema changes
npm run db:migrate    # Run pending migrations (production)
npm run db:push       # Push schema changes without migration (dev)
npm run db:seed       # Seed initial data
npm run db:studio     # Launch Prisma Studio GUI
```

After any change to `prisma/schema.prisma`, run `npm run db:generate`.

## Architecture

### Route Structure

Uses Next.js App Router with two route groups:
- `app/(auth)/` — Public routes (login page)
- `app/(dashboard)/` — Protected routes (all main features): `dashboard/`, `clientes/`, `inventario/`, `pedidos/`, `configuracion/`

### Role-Based Access Control

Two roles defined in Prisma: `ADMIN` and `VENDEDOR`.

- `middleware.ts` uses NextAuth to protect all routes and blocks `VENDEDOR` users from `/configuracion` (admin-only)
- Session includes user role; check `session.user.role` in server components/API routes

### API Routes

RESTful endpoints under `app/api/`:
- `/api/auth/[...nextauth]` — NextAuth handlers
- `/api/clients`, `/api/products`, `/api/categories`, `/api/orders`, `/api/users`, `/api/settings`

### Database Models

Key entities in `prisma/schema.prisma`:
- **User** — Auth with roles (ADMIN/VENDEDOR)
- **Client** — Customers with optical prescription fields (sphere, cylinder, axis per eye)
- **Product** — Inventory with pricing, stock, category
- **Order** / **OrderItem** — Orders with statuses: `PENDIENTE → EN_PROCESO → ENVIADO → ENTREGADO | CANCELADO`
- **CompanySettings** — Single-row global config (name, address, logo)

### Key Libraries & Patterns

- **Forms**: React Hook Form + Zod validation via `@hookform/resolvers`
- **UI**: shadcn/ui components in `components/ui/`, Tailwind CSS, Lucide icons, Sonner for toasts
- **Images**: Next Cloudinary (`next-cloudinary`) — remote patterns configured for `res.cloudinary.com`
- **PDF export**: `@react-pdf/renderer` for generating order/client PDFs
- **Prisma client**: Singleton in `lib/prisma.ts` — always import from there
- **PWA**: `next-pwa` configured in `next.config.mjs`, disabled in development

### Environment Variables

Required (see `.env.example`):
- `DATABASE_URL` — PostgreSQL connection string
- `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`

### Build Notes

- `next.config.mjs` sets `eslint.ignoreDuringBuilds: true` and `typescript.ignoreBuildErrors: true`
- Prisma client and bcryptjs are listed as `serverExternalPackages`
