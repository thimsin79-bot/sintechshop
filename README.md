# TechVault - Computer Shop Inventory System

TechVault is a demo inventory and sales management dashboard for a computer shop. It is built with Next.js App Router, React, TypeScript, and Tailwind CSS. The app manages products, categories, suppliers, purchase orders, sales, customers, warranties, stock movements, reports, and system users from a single interface.

All data is stored in the browser using `localStorage`, so the project runs without a backend or database.

## Features

- Dashboard with sales overview, low-stock alerts, inventory value, recent sales, and recent stock movements
- Live dashboard search across products, customers, invoices, warranties, and purchase orders
- Product and category management
- Stock In / Out movements with quantity validation
- Supplier management
- Purchase orders with receiving status
- Sales and invoices with printable invoice view and refund status
- Customer management with order history
- Warranty registration, claims, and expiry tracking
- Reports with category chart, sales metrics, and CSV exports
- User management with active/inactive status and role assignment
- Reset-to-demo-data action
- Responsive layout with mobile sidebar
- Persistent demo data across page reloads

## Tech Stack

- [Next.js 16](https://nextjs.org/) with App Router and Turbopack
- React 19
- TypeScript
- Tailwind CSS v4
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

The products page accepts optional query parameters:

- `/products?q=RTX` filters products by search text
- `/products?category=Graphics%20Cards` filters by category

## Project Structure

```text
app/
  layout.tsx              Root layout and application providers
  page.tsx                Dashboard route
  globals.css             Tailwind theme and shared styles
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

components/
  layout/                 Sidebar, header, application shell
  pages/                  Page-level client components
  modals/                 Create/edit/view modal components
  ui/                     Modal, modal header, confirmation dialog
  charts/                 Chart.js wrappers

lib/
  store.tsx               DataProvider, persistence, and all data operations
  seed.ts                 Demo seed data
  types.ts                TypeScript entity and draft types
  utils.ts                Formatting, ID generation, date helpers, CSV export
  navigation.ts           Navigation items and page metadata
  styles.ts               Shared Tailwind class constants
  toast.tsx               Toast provider and hook

legacy/                   Original standalone HTML/CSS/JS implementation
```

## Data and Persistence

Demo data is defined in `lib/seed.ts` and loaded into the `DataProvider` in `lib/store.tsx`.

- Storage key: `techvault.data.v1`
- Storage location: browser `localStorage`
- Data is scoped to the current browser and device
- Changes are saved automatically after each data mutation
- Use **Users > Reset Demo Data** to restore the original seed data

Because persistence is local-only, clearing browser storage also clears saved changes. There is no authentication, API, or multi-user synchronization.

## Main Data Operations

The shared `useData()` hook exposes:

- Product, category, supplier, customer, and user create/update actions
- Purchase order creation and receiving
- Sale creation and refunds
- Warranty registration and claims
- Stock In / Out recording
- Record deletion
- Demo data reset

Validation is handled in the store before updates are applied, including stock availability checks for sales and stock-out operations.

## Notes

- This is a front-end demo application; the user management page does not provide real authentication.
- Reports use demo analytics and seeded sales data. Some chart data is illustrative.
- Invoice printing uses the browser's native print dialog.
- The original vanilla JavaScript version remains available in `legacy/` for reference.
- No automated test suite is included. The project has been verified with `npm run typecheck`, `npm run build`, and a headless browser smoke test covering all routes, modals, search, product creation, and persistence after reload.
