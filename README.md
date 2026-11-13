# SINTech - Computer Shop Inventory System

SINTech is an inventory and sales management dashboard for a computer shop. It is built with Next.js App Router, React, TypeScript, and Tailwind CSS. The app manages products, categories, suppliers, purchase orders, sales, customers, warranties, stock movements, reports, and system users from a single interface.

Application data is stored in Neon Postgres through Prisma, and accounts are managed by Neon Managed Better Auth. Every request to the store API requires an authenticated session.

## Features

- Username/password authentication with Neon Auth (sign up, sign in, sign out, session persistence)
- Protected application routes and authenticated API access
- Dashboard with sales overview, low-stock alerts, inventory value, recent sales, and recent stock movements
- Live dashboard search across products, customers, invoices, warranties, and purchase orders
- Product and category management
- Stock In / Out movements with quantity validation
- Supplier management
- Purchase orders with receiving status
- Sales and invoices with printable invoice view and refund status
- Customer management with order history
- Warranty registration and claims
- Reports with category chart, sales metrics, and CSV exports
- User management with active/inactive status and role assignment
- Reset-to-demo-data action backed by a database transaction
- Responsive layout with mobile sidebar
- Persistent data across browsers and devices via Neon Postgres

## Tech Stack

- [Next.js 16](https://nextjs.org/) with App Router and Turbopack
- React 19
- TypeScript
- Tailwind CSS v4
- [Prisma 7](https://www.prisma.io/) with the Neon serverless driver
- [Neon Postgres](https://neon.tech/) for data storage
- [Neon Managed Better Auth](https://neon.tech/docs/guides/neon-auth) for authentication
- Chart.js
- Font Awesome 6

## Getting Started

### Requirements

- Node.js 20.9 or newer
- npm

### Install

```bash
npm install
```

### Configure environment variables

Copy `.env.example` to `.env.local` and fill in the values from the Neon Console:

```bash
cp .env.example .env.local
```

| Variable | Description |
| --- | --- |
| `NEON_AUTH_BASE_URL` | Managed Better Auth URL, e.g. `https://<endpoint>.neonauth.<region>.aws.neon.tech/neondb/auth` |
| `NEON_AUTH_COOKIE_SECRET` | Random 32-byte base64 secret used to sign session cookies |
| `DATABASE_URL` | Pooled Postgres connection string (used by the app at runtime) |
| `DIRECT_URL` | Direct (non-pooled) Postgres connection string (used by Prisma CLI migrations and seeding) |

Generate a cookie secret with:

```bash
openssl rand -base64 32
```

### Prepare the database

```bash
npm run db:push
npm run db:seed
```

`db:push` creates the normalized schema (categories, products, suppliers, purchases, sales, customers, warranties, stock movements, users). `db:seed` loads the demo records from `lib/seed.ts`.

### Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production build

```bash
npm run build
npm start
```

### Type checking

```bash
npm run typecheck
```

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create a production build |
| `npm start` | Start the production server after building |
| `npm run typecheck` | Run TypeScript without emitting files |
| `npm run db:generate` | Generate the Prisma client into `lib/generated/prisma` |
| `npm run db:push` | Push the Prisma schema to the database |
| `npm run db:migrate` | Create and apply a development migration |
| `npm run db:seed` | Reset the database and load demo data |

## Routes

| Route | Page |
| --- | --- |
| `/` | Dashboard |
| `/products` | Product catalog and pricing |
| `/categories` | Product categories |
| `/inventory` | Stock In / Out history |
| `/suppliers` | Supplier directory |
| `/purchasing` | Purchase orders and receiving |
| `/sales` | Sales and invoices |
| `/customers` | Customer database |
| `/warranty` | Warranty tracking |
| `/reports` | Analytics and CSV exports |
| `/users` | User management and demo-data reset |
| `/settings` | Company profile and preferences |
| `/login` | Sign in |
| `/signup` | Create an account |

All routes except `/login` and `/signup` require an authenticated session.

The products page accepts optional query parameters:

- `/products?q=RTX` filters products by search text
- `/products?category=Graphics%20Cards` filters by category

## Project Structure

```text
app/
  layout.tsx              Root layout and application providers
  page.tsx                Dashboard route
  globals.css             Tailwind theme and shared styles
  api/auth/[...path]/     Neon Auth handler
  api/store/route.ts      Authenticated GET/POST store API
  products/page.tsx       Products route
  categories/page.tsx     Categories route
  inventory/page.tsx      Inventory route
  suppliers/page.tsx      Suppliers route
  purchasing/page.tsx     Purchasing route
  sales/page.tsx          Sales route
  customers/page.tsx      Customers route
  warranty/page.tsx       Warranty route
  reports/page.tsx        Reports route
  users/page.tsx          Users route
  settings/page.tsx       Settings route
  login/page.tsx          Sign in route
  signup/page.tsx         Sign up route

components/
  layout/                 Sidebar, header, application shell
  pages/                  Page-level client components
  modals/                 Create/edit/view modal components
  ui/                     Modal, modal header, confirmation dialog
  charts/                 Chart.js wrappers
  auth/                   Login and signup screens

lib/
  store.tsx               DataProvider, API dispatch, and data operations
  auth.tsx                Neon Auth client context
  auth-client.ts          Neon Auth browser client
  auth-server.ts          Neon Auth server instance
  db/prisma.ts            Prisma client with the Neon serverless adapter
  server/store.ts         Database queries, seed/reset, and action handlers
  types.ts                TypeScript entity and draft types
  seed.ts                 Demo seed data
  utils.ts                Formatting, ID generation, date helpers, CSV export
  navigation.ts           Navigation items and page metadata
  styles.ts               Shared Tailwind class constants
  toast.tsx               Toast provider and hook

prisma/
  schema.prisma           Normalized data model
  seed.ts                 Prisma seed entry point

legacy/                   Original standalone HTML/CSS/JS implementation
```

## Data and Persistence

- Accounts and sessions are managed by Neon Auth. The browser talks to the Next.js auth handler at `/api/auth/*`, which proxies requests to your Managed Better Auth instance.
- Sign-up and sign-in use a username and password only. The client maps each username to an internal `<username>@sintech.local` identifier because Neon Auth requires an email-shaped identifier. Existing email-based accounts can still sign in by entering their full email in the username field.
- `proxy.ts` rewrites the `Origin` header of same-origin `/api/auth/*` requests to the Neon Auth origin. This prevents `Invalid origin` errors on Vercel previews and custom domains while still rejecting cross-origin requests. Production domains can also be added under Neon Auth trusted domains for centralized control.
- Shop data is stored in Neon Postgres using the normalized schema in `prisma/schema.prisma`.
- `lib/server/store.ts` reads the full dataset into the client shape and executes every mutation in a database transaction.
- The browser loads data with `GET /api/store` after sign-in and sends mutations to `POST /api/store` as `{ action, payload }`.
- The server returns the refreshed dataset after each mutation, so all open pages stay in sync.
- Deletes preserve historical records through nullable foreign keys and name snapshots.
- Use **Users > Reset Demo Data** to truncate the tables and re-seed the demo dataset.

The old `localStorage` keys (`techvault.data.v1`, `techvault.session.v1`, `techvault.accounts.v1`) are cleared automatically on first load.

## Main Data Operations

The shared `useData()` hook exposes the same API as before, but each action dispatches to the server:

- Product, category, supplier, customer, and user create/update actions
- Purchase order creation and receiving
- Sale creation, refunds, and deletion
- Warranty registration and claims
- Stock In / Out recording, editing, and deletion
- Record deletion
- Demo data reset

Validation still runs in the browser for immediate feedback, including stock availability checks for sales and stock-out operations. The server re-validates every mutation before writing.

## Notes

- The user management page manages application users for display and role assignment; authentication itself is handled by Neon Auth.
- Reports use the live sales and stock data from Postgres.
- Invoice printing uses the browser's native print dialog.
- The original vanilla JavaScript version remains available in `legacy/` for reference.
- Run `npm run typecheck` and `npm run build` after changing the schema or server actions.
- `lib/generated/` is ignored by git; run `npm run db:generate` after cloning or changing the schema.
