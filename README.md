# Maple Designs Creations

Cost calculator for 3D print businesses. Calculates production costs and target selling prices across multiple marketplaces (Etsy, Amazon, custom).

## Features

- **Calculator** — Model cost breakdown with filament, printer, labor, and supplies costs
- **3 pricing modes** — Auto-suggested (target margin), Calculated (manual input), Manual Override (slider)
- **Printers** — CRUD with live operating cost (electricity + maintenance + depreciation)
- **Filaments** — CRUD with stock tracking and low-stock alerts
- **Marketplaces** — Etsy and generic/Amazon fee structures with manual ad spend entries
- **Quotes** — Persistent price snapshots to review over time

## Local Development

### Prerequisites

- Node.js 22+
- Docker (for PostgreSQL)

### Start

```bash
# First time
cp .env.example .env

# Start PostgreSQL + run migrations + start dev server
./start-local.sh
```

App runs at http://localhost:3000

### Run tests

```bash
npm test
```

## Deploy to Home Server (192.168.2.13)

```bash
# 1. Create production env file
cp .env.production.example .env.production
# Edit .env.production with a strong password

# 2. Deploy
./deploy.sh
```

App available at http://192.168.2.13:3002

## Tech Stack

- **Next.js 16** (App Router + Server Actions)
- **TypeScript**
- **Tailwind CSS v4**
- **Prisma 7** + **PostgreSQL 16**
- **Radix UI** (Dialog, Select, Slider, Tabs)
- **Vitest** (26 unit tests for calculation engine)
