<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes -- APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Maple Designs Creations

3D printing business cost calculator and inventory tracker. Built with Next.js 16 (App Router), React 19, Prisma 7, PostgreSQL 16, Tailwind CSS v4, and Vitest.

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router, Turbopack) | 16.2.x |
| UI | React + Tailwind CSS v4 | React 19, TW v4 |
| Components | Radix UI primitives + custom wrappers | -- |
| Database | PostgreSQL via Prisma ORM (`@prisma/adapter-pg`) | PG 16, Prisma 7.x |
| Unit Testing | Vitest + jsdom + Testing Library | Vitest 4.x |
| E2E Testing | Playwright (Chromium) | Playwright latest |
| Icons | lucide-react | -- |
| Charts | recharts | -- |
| Deploy | Docker multi-stage standalone build | node:22-alpine |

---

## Project Structure

```
e2e/                   # Playwright E2E test specs
├── calculator.spec.ts # Calculator inputs, validation, save, reset
├── filaments.spec.ts  # Filament CRUD, search, inventory
├── quotes.spec.ts     # Quote save flow, search, expand, delete
├── marketplaces.spec.ts # Marketplace CRUD
├── navigation.spec.ts # Nav links, redirect, active state
├── printers.spec.ts   # Printer CRUD, validation, edit
├── settings.spec.ts   # Settings form, save, persist
└── supplies.spec.ts   # Supply CRUD, computed unit cost, search
src/
├── actions/           # Server actions (Prisma CRUD + revalidation)
│   ├── filaments.ts
│   ├── marketplaces.ts
│   ├── printers.ts
│   ├── quotes.ts
│   ├── settings.ts
│   └── supplies.ts
├── app/               # Next.js App Router pages
│   ├── calculator/    # Quote calculator
│   ├── filaments/     # Filament inventory management
│   ├── quotes/       # Saved quotes
│   ├── marketplaces/  # Marketplace fee configuration
│   ├── printers/      # Printer fleet management
│   ├── settings/      # App settings (currency, rates)
│   ├── supplies/      # Supply inventory management
│   ├── layout.tsx     # Root layout (providers, shell)
│   ├── page.tsx       # Dashboard / home
│   └── globals.css    # Tailwind v4 base styles
├── components/
│   ├── calculator/    # Calculator-specific components
│   ├── filaments/     # Filament card + form
│   ├── layout/        # AppShell (sidebar nav)
│   ├── marketplaces/  # Marketplace card + form
│   ├── printers/      # Printer card + form
│   ├── supplies/      # Supply card + form
│   └── ui/            # Reusable UI primitives (Button, Input, Dialog, Select, etc.)
├── contexts/          # React contexts
│   └── CurrencyContext.tsx
├── generated/prisma/  # Auto-generated Prisma client (DO NOT EDIT)
├── hooks/
│   └── useCalculator.ts  # Calculator state management (useReducer)
├── lib/
│   ├── calculations.ts       # Pure calculation functions (COGS, fees, margins)
│   ├── calculations.test.ts  # Unit tests for calculations
│   ├── filamentDatabase.ts   # Built-in filament reference data
│   ├── prisma.ts             # Prisma singleton client
│   └── types.ts              # Shared TypeScript interfaces
├── test/
│   └── setup.ts       # Vitest setup (jest-dom matchers)
└── utils/
    ├── cn.ts           # clsx + tailwind-merge utility
    └── formatters.ts   # Currency, percent, grams, time, date formatters
```

---

## Architecture Patterns

### Page Pattern: Server + Client Split

Every route follows the same pattern:
- `page.tsx` -- async server component that fetches data via server actions, passes as props
- `*Client.tsx` -- `"use client"` component that owns interactivity, state, and UI

```
app/supplies/
├── page.tsx            # Server: calls getSupplies(), renders <SuppliesClient supplies={data} />
└── SuppliesClient.tsx  # Client: search, filter, dialogs, CRUD triggers
```

Never mix server data fetching with client interactivity in the same component.

### Server Actions (`src/actions/`)

- All data access goes through server actions, never call Prisma directly from components.
- Every mutation must call `revalidatePath()` for affected routes.
- Keep actions thin -- business logic belongs in `src/lib/`, not in actions.

### Component Pattern: Card + Form

Each domain entity (Filament, Printer, Supply, Marketplace) follows:
- `*Card.tsx` -- displays the entity with Edit/Delete actions, opens a Dialog for editing
- `*Form.tsx` -- shared form for create and edit, exposes `submit()` via `useImperativeHandle`

The form is mounted inside a `<Dialog>` and triggered from the parent via a ref:
```tsx
const formRef = useRef<SupplyFormHandle>(null);
// In dialog footer:
<Button onClick={() => formRef.current?.submit()}>Save</Button>
```

### State Management

- **Global**: `CurrencyContext` provides `currency`, `symbol`, and `fmt()` across the app. Loaded from DB settings in the root layout.
- **Calculator**: `useReducer` + `useMemo` in `useCalculator.ts`. All derived values (COGS, margins, suggested prices) are memoized from reducer state.
- **Page-level**: `useState` for local UI state (dialogs, filters, saving flags).

### Calculations (`src/lib/calculations.ts`)

Pure functions with zero side effects. Every calculation function takes explicit parameters and returns a value. No database access, no context, no hooks. This is the only file with unit tests -- keep it that way.

### UI Components (`src/components/ui/`)

- Built on Radix UI primitives (Dialog, Select, Checkbox, Slider, Tabs, Tooltip).
- Custom wrappers use `forwardRef`, `cn()` for conditional Tailwind classes.
- Brand color: `#e05a2b` (warm orange) for focus rings, accents, and primary actions.
- All UI components are client components (`"use client"`).
- Support `label`, `error`, `hint`, `prefix`, `suffix` props where applicable.

---

## Domain Models

| Model | Purpose | Key Fields |
|---|---|---|
| **Settings** | App-wide config | `electricityRatePerKwh`, `targetNetMarginPct`, `currency` |
| **Printer** | 3D printer in the fleet | `powerWatts`, `maintenanceCostPerHr`, `purchasePrice`, `lifespanHours` |
| **Filament** | Filament spool inventory | `costPerSpool`, `spoolSizeG`, `currentStockG`, `wasteFactor` |
| **Supply** | Consumable supply inventory | `quantity`, `totalPrice`, `unitCost` (auto-calculated), `currentStock` |
| **Marketplace** | Sales channel fee structure | `listingFee`, `transactionFeePct`, `paymentProcessingPct`, `referralFeePct` |
| **Quote** | Saved calculator snapshot | `stateSnapshot` (JSON), `filamentCost`, `suppliesCost`, `totalCogs` |
| **QuoteMarketplaceResult** | Per-marketplace pricing result | `listingPrice`, `platformFees`, `netProfit`, `netMarginPct` |

---

## Database & Prisma

- **ORM**: Prisma 7.x with `@prisma/adapter-pg` (driver adapter pattern).
- **Generated client**: `src/generated/prisma/` -- auto-generated, never edit.
- **Schema**: `prisma/schema.prisma` -- single source of truth for the data model.
- **Singleton**: `src/lib/prisma.ts` uses `globalThis` caching to avoid connection exhaustion in dev.

### Development Database Workflow

During development, the database is always created from scratch. There is a single `init` migration.

When the schema changes:
```bash
rm -rf prisma/migrations
npx prisma migrate reset --force
npx prisma migrate dev --name init
```

This ensures production will only ever run one clean migration. Do NOT stack incremental migrations during development.

### Prisma Generate

After any schema change, regenerate the client:
```bash
npx prisma generate
```

The generated client at `src/generated/prisma/` is gitignored and rebuilt on each `npm install` or deploy.

---

## Styling

- **Tailwind CSS v4** via `@tailwindcss/postcss` plugin (not the legacy PostCSS 7 setup).
- Base styles in `src/app/globals.css`.
- Utility merging via `cn()` from `src/utils/cn.ts` (clsx + tailwind-merge).
- Font: Geist Sans (loaded via `next/font/google`).
- Design tokens are inline Tailwind values, not a theme config file.

### Color Palette

| Usage | Value |
|---|---|
| Brand / accent | `#e05a2b` |
| Text primary | `#1a1a1a` |
| Text secondary | `#6b7280` |
| Text muted | `#9ca3af` |
| Border | `#e5e5e5` |
| Background | `white` / `#f9fafb` |
| Danger | Tailwind `red-*` utilities |

---

## Currency & Formatting

All monetary values must be formatted using the currency context, never hardcoded symbols.

```tsx
// CORRECT
const { fmt, symbol } = useCurrency();
<span>{fmt(42.5)}</span>          // "CA$42.50"
<Input prefix={symbol} />         // prefix shows "CA$"

// WRONG
<span>${value.toFixed(2)}</span>  // Hardcoded dollar sign
```

Formatting utilities live in `src/utils/formatters.ts`: `formatCurrency`, `formatPercent`, `formatGrams`, `formatTime`, `formatDate`.

---

## Commands

```bash
# Development
npm run dev              # Start dev server (Turbopack)
npm run build            # Production build
npm run start            # Start production server
npm run lint             # ESLint
npm run test             # Vitest (single run)
npm run test:watch       # Vitest (watch mode)

# E2E Testing
npm run test:e2e         # Playwright E2E tests (headless)
npm run test:e2e:headed  # Playwright E2E tests (visible browser)
npm run test:e2e:ui      # Playwright interactive UI mode

# Database
npx prisma generate      # Regenerate Prisma client
npx prisma migrate dev --name init   # Create/apply migration
npx prisma migrate reset --force     # Reset DB completely
npx prisma studio        # Visual DB browser

# Docker (production)
docker compose up -d     # Start app + postgres
docker compose down      # Stop services
```

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/mapledesigns` |
| `POSTGRES_PASSWORD` | Postgres password (docker-compose only) | `localdev` |

See `.env.example` and `.env.production.example` for templates.

---

## Testing

### Unit Tests (Vitest)

- **Framework**: Vitest 4.x with jsdom environment.
- **Matchers**: `@testing-library/jest-dom` (loaded via `src/test/setup.ts`).
- **Path alias**: `@/` resolves to `src/` in test config.
- **Scope**: 72 unit tests for pure calculation functions in `src/lib/calculations.test.ts`.
- **Run**: `npm run test` (single run) or `npm run test:watch` (watch mode).
- **Config**: `vitest.config.ts` excludes `e2e/`, `node_modules`, `dist`, `.next` to avoid picking up Playwright specs.

Test coverage includes:
- Filament cost per gram, total filament cost, waste factor
- Printer electricity cost, maintenance cost, depreciation
- Labor cost calculations
- Total COGS computation
- Marketplace fee calculations (Etsy, Amazon, Shopify, Facebook, custom, no-fee)
- Margin and suggested price calculations
- Edge cases: zero values, negative inputs, boundary conditions, scaling linearity, high-value items, round-trip margin verification

### E2E Tests (Playwright)

- **Framework**: Playwright with Chromium only.
- **Config**: `playwright.config.ts` with `webServer` auto-start for `npm run dev`.
- **Workers**: 1 (serial execution, tests share database state within a spec file).
- **Specs**: 55 tests across 8 spec files.
- **Run**: `npm run test:e2e` (headless), `npm run test:e2e:headed` (visible), `npm run test:e2e:ui` (interactive).

To run against an already-running dev server (avoids spawning a second one):
```bash
E2E_BASE_URL=http://localhost:3000 npx playwright test
```

To run against the deployed production instance:
```bash
E2E_BASE_URL=http://192.168.2.13:3002 npx playwright test
```

#### E2E Spec Files

| Spec | Tests | Coverage |
|---|---|---|
| `navigation.spec.ts` | 5 | Home redirect, branding, nav links, routing, active state |
| `settings.spec.ts` | 4 | Section headings, electricity rate CRUD, margin CRUD, save state |
| `printers.spec.ts` | 6 | Empty state, dialog open, validation, create, edit, delete |
| `filaments.spec.ts` | 7 | Heading, empty state, dialog, create (with Radix Select), inventory panel, search, delete |
| `supplies.spec.ts` | 8 | Heading, empty state, dialog, computed unit cost, create, card display, search, delete |
| `marketplaces.spec.ts` | 5 | Heading, empty state, dialog, create, delete |
| `calculator.spec.ts` | 13 | Heading, model name, print time, models per plate, negative validation, minutes clamping, advanced toggle, labor, parts, supplies, reset, save validation, cost panel |
| `quotes.spec.ts` | 7 | Heading, empty state, search input, full save-view flow, search, expand, delete |

#### E2E Selector Patterns

Pages with CRUD entities (Filaments, Supplies, Marketplaces) have two "Add X" buttons: one in the page header and one in the empty state. Always use `.first()` when targeting the header button:
```ts
await page.getByRole("button", { name: "Add Filament" }).first().click();
```

For Radix Select options that share prefix names (e.g., PLA, PLA+, Silk PLA), use `exact: true`:
```ts
await page.getByRole("option", { name: "PLA", exact: true }).click();
```

For delete buttons on cards, scope to the card locator and use role:
```ts
const card = page.locator("[class*='rounded-xl']", { hasText: "Item Name" }).first();
await card.getByRole("button", { name: "Delete" }).click();
```

For section headings that also appear as labels/descriptions, use heading role:
```ts
await expect(page.getByRole("heading", { name: "Electricity" })).toBeVisible();
```

### Test Requirements

All tests (unit + E2E) must pass before any push. The CI pipeline runs unit tests automatically; E2E tests are run locally before merging.

---

## CI/CD & Deployment

### Pipeline Overview

```
Push to main
    │
    ▼
GitHub Actions (ubuntu-24.04-arm -- native ARM64)
    ├── Run tests (npm test)
    ├── Build ARM64 Docker image (native, with layer caching)
    └── Push to ghcr.io/rogeriocamorim/maple-designs-creations:latest
                │
                ▼
Watchtower (on OrangePi, polls ghcr.io every 60s)
    ├── Detects new image
    ├── Pulls it
    └── Restarts the app container
                │
                ▼
Portainer (on OrangePi)
    └── Monitor containers, logs, health
```

### GitHub Actions (`.github/workflows/deploy.yml`)

- **Trigger**: Push to `main`
- **Runner**: `ubuntu-24.04-arm` (native ARM64, free for public repos)
- **Test job**: Installs deps, generates Prisma client, runs `npm test`
- **Build job**: Builds Docker image with GHA layer caching, pushes to `ghcr.io`
- **Image tags**: `latest` + commit SHA for traceability

### Docker

Multi-stage Dockerfile (`node:22-alpine`):
1. **deps** -- installs dependencies with native build tools
2. **builder** -- runs `prisma generate` + `next build`
3. **runner** -- copies standalone output, runs as non-root user on port 3000

Entrypoint runs `prisma migrate deploy` before starting the server, so the database schema is always up to date on deploy.

### Container Names

| Container | Image | Purpose |
|---|---|---|
| `mapledesigns-app` | `ghcr.io/rogeriocamorim/maple-designs-creations:latest` | Next.js app (port 3002 -> 3000) |
| `mapledesigns-postgres` | `postgres:16-alpine` | PostgreSQL 16 database |
| `mapledesigns-watchtower` | `containrrr/watchtower` | Auto-updates app container |

### Deploy Target

- **Host**: OrangePi at `192.168.2.13` (SSH alias: `orangepi`)
- **App directory**: `/opt/mapledesigns/`
- **App URL**: `http://192.168.2.13:3002`
- **Monitoring**: Portainer on the OrangePi

### Manual Deploy (Fallback)

If needed, `deploy.sh` pushes the compose file and triggers a pull+restart:
```bash
bash deploy.sh
```

---

## Coding Conventions

### TypeScript
- Strict mode enabled.
- Shared interfaces live in `src/lib/types.ts`.
- Use `interface` for object shapes, `type` for unions and aliases.
- Path alias: `@/` maps to `src/`.

### Components
- Server components: no directive needed (default in App Router).
- Client components: must have `"use client"` at the top.
- Props interfaces defined inline in the same file, named `Props`.
- Forms use `useImperativeHandle` to expose `submit()` to parent dialogs.

### Server Actions
- Must have `"use server"` directive.
- Always call `revalidatePath()` after mutations.
- Compute derived values (like `unitCost`) server-side before saving.

### Naming
- Files: PascalCase for components (`SupplyCard.tsx`), camelCase for utilities (`formatters.ts`).
- Server action files: camelCase matching the domain (`supplies.ts`, `filaments.ts`).
- Client components: `*Client.tsx` suffix when paired with a server `page.tsx`.
- Form handles: `*FormHandle` interface with `submit()` method.

### Inventory Pattern
Every inventory entity (Filament, Supply) displays a **Total Inventory** value in the page header, calculated client-side as the sum of `unitCost * currentStock` across all items. Each card also shows its individual inventory value. Values are formatted with `fmt()` from the currency context.
