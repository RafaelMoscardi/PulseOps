# PulseOps

> Uptime monitoring for APIs and websites — automatic checks, incident tracking, Discord alerts.

Built with **Next.js 16**, **Prisma 7**, **PostgreSQL**, and **Tailwind CSS**.

---

## Features

- **Automated HTTP monitoring** — configurable check intervals (1–60 min), runs on server startup via `instrumentation.ts`
- **Incident management** — auto-creates and resolves incidents with duration tracking and root cause
- **Response time chart** — sparkline showing the last 50 checks per service
- **90-day uptime grid** — daily uptime heatmap (GitHub contribution style)
- **Discord webhook alerts** — notifies on service down and recovery; no duplicate alerts
- **Per-user isolation** — every user only sees and modifies their own data
- **Manual check** — trigger an immediate check from the UI at any time

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2 (App Router, TypeScript) |
| Database ORM | Prisma 7.8 (prisma-client generator) |
| Database | PostgreSQL 16+ |
| Auth | NextAuth v4 (JWT strategy, bcrypt passwords) |
| Scheduler | node-cron v4 via `instrumentation.ts` |
| Styling | Tailwind CSS v4 |
| Charts | Pure SVG (no external chart library) |

---

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 16+ running locally

### Steps

```bash
# 1. Clone and install dependencies
git clone https://github.com/your-username/pulseops.git
cd pulseops
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL and a random NEXTAUTH_SECRET

# 3. Create database and apply schema
npx prisma db push

# 4. (Optional) Seed demo data
npm run seed

# 5. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Demo Account

After running `npm run seed`:

| Field | Value |
|---|---|
| Email | `demo@pulseops.dev` |
| Password | `demo123456` |

The seed creates 4 monitored services with 30 days of historical check data and incidents.

---

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | JWT signing secret — min 32 chars in production |
| `NEXTAUTH_URL` | Base URL of the app (e.g. `http://localhost:3000`) |

Generate a secret:
```bash
openssl rand -base64 32
```

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login and register pages
│   └── (dashboard)/      # Protected app pages
│       ├── dashboard/    # Overview stats
│       ├── services/     # CRUD + detail with charts
│       ├── incidents/    # Incident history
│       └── settings/     # Discord webhook config
├── components/
│   ├── charts/           # ResponseTimeChart, UptimeGrid (pure SVG)
│   ├── layout/           # Sidebar, Header
│   └── services/         # ServiceCard, CheckNowButton, etc.
├── lib/
│   ├── auth.ts           # NextAuth config
│   ├── discord.ts        # Webhook helpers (validate, mask, send)
│   ├── monitor.ts        # performCheck() — core monitoring logic
│   ├── prisma.ts         # Prisma client singleton
│   └── scheduler.ts      # node-cron scheduler
├── instrumentation.ts    # Starts scheduler on server boot
└── proxy.ts              # Route protection (replaces middleware.ts)
prisma/
├── schema.prisma
├── seed.ts
└── prisma.config.ts
```

---

## How Monitoring Works

1. **Boot** — `instrumentation.ts` calls `startScheduler()` once per process
2. **Tick** — node-cron fires every minute (`* * * * *`)
3. **Filter** — only services where `now - lastCheckedAt >= intervalMinutes` are checked
4. **HTTP check** — GET request with 10s timeout
5. **Persist** — saves `CheckResult`, updates `MonitoredService` status fields
6. **Incidents** — opens incident on first failure; resolves when service recovers
7. **Alerts** — sends Discord embed after transaction; deduplication via `Notification` table

### Error mapping

| Error | `error` field |
|---|---|
| Timeout > 10s | `Timeout após 10s` |
| `ENOTFOUND` | `DNS não resolvido` |
| `ECONNREFUSED` | `Conexão recusada` |
| HTTP 5xx | `HTTP 5xx` |
| HTTP 1–4xx | `isOnline = true` |

---

## Screenshots

> _Add screenshots to `docs/screenshots/` and reference them here._

| Dashboard | Service Detail |
|---|---|
| ![Dashboard](docs/screenshots/dashboard.png) | ![Service Detail](docs/screenshots/service-detail.png) |

---

## Deploying to Vercel

### Prerequisites

A PostgreSQL database accessible from the internet — [Neon](https://neon.tech) (free tier) or [Supabase](https://supabase.com) work well.

### Steps

1. Push the repo to GitHub
2. Import the project in Vercel
3. Set environment variables in the Vercel dashboard:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Your cloud PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Random 32-char string |
| `NEXTAUTH_URL` | Your Vercel deployment URL (e.g. `https://pulseops.vercel.app`) |

4. After first deploy, run migrations:
```bash
npx prisma db push
```

5. (Optional) seed demo data:
```bash
npm run seed
```

### Monitoring on Vercel

On Vercel, `node-cron` doesn't persist between serverless invocations. Monitoring is handled instead by a **Vercel Cron Job** defined in `vercel.json` that calls `/api/cron/monitor` every minute.

Vercel automatically injects `CRON_SECRET` and passes it as a Bearer token — no manual setup required.

> **Note:** Vercel Cron Jobs require the **Pro** plan for sub-minute frequency, or are limited to once per day on the Hobby plan. For Hobby, set `"schedule": "*/5 * * * *"` (every 5 minutes) in `vercel.json`.

---

## License

MIT
