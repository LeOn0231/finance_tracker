# 🌟 Life Quest — Universal Dream Quest & Personal Finance Sanctuary

> *« Even without magic, I will become the Wizard King. »* — Asta (Black Clover)

**Life Quest** is a strictly private, single-user personal web application engineered to transform financial discipline and dream acquisitions into an anime RPG questing experience.

---

## 📖 Overview

Life Quest bridges the gap between ambitious personal desires (vehicles, computers, apparel, anime collectibles) and everyday cash flow management. Instead of relying on static spreadsheets or disconnected wishlists, Life Quest provides:
- A **Universal Final Price Engine** that calculates the actual out-of-pocket amount required to own any item.
- An **Anime RPG UI System** with 8 curated themes, sound effects, achievements, and dynamic auras.
- A **Strict Personal Finance Engine** that computes real-time **Available Money** and **Safe-to-Spend** cash flow with safety buffer protections.
- An **Idempotent Purchase & Celebration Experience** with fanfare, confetti, and automated achievement evaluations.
- A **Pure MySQL Architecture** completely independent and decoupled from any external or corporate infrastructure.

---

## ✨ Features

### 1. 🔮 Universal Final Price Engine (All Categories)
- **Zero-Fabrication Pricing**: Accepts data strictly from **Official Brand Websites**, **Amazon India**, or **Flipkart**. Untrusted aggregators and suspicious scrapers are immediately rejected.
- **Category-Specific Cost Algorithms**:
  - **Electronics & Tech** (Keyboards, Mice, Monitors, GPUs, Laptops, Phones, Cameras): Product listed price + insured shipping + mandatory handling fees.
  - **Apparel & Shoes** (Sneakers, Jackets, Watches): Delivery shipping thresholds and checkout rates.
  - **Anime & Collectibles** (Resin statues, figures, manga): Fragile shipping and import duties.
  - **Vehicles** (Motorcycles & Cars): Complete Indian On-Road calculation ($\text{Ex-Showroom} + \text{RTO} + \text{5-Yr Comprehensive Insurance} + \text{Mandatory Cess/Fastag} + \text{Selected Accessories}$) across 12 Indian states.
- **Dual Input Modes**:
  - **Option A**: Direct URL (Amazon India, Flipkart, or Official Brand Store).
  - **Option B**: Natural language search query (e.g., `Logitech G Pro X Superlight 2`, `Royal Enfield Meteor 350`, `Sony WH-1000XM6`, `ASUS ROG Strix G16`, `Nike Air Force 1`).
- **Price Uncertainty Badges**: Every researched item clearly indicates its status: `VERIFIED`, `ESTIMATED`, or `NEEDS_CONFIRMATION`.
- **Price Refresh & Trajectory**: Real-time source re-scrying, delta calculation (+/- price change banner), and historical price snapshot logging.
- **Manual Override**: Allows custom user adjustments marked with a **"Manually Edited"** badge while keeping the verified baseline intact.

### 2. 💰 Personal Finance Sanctuary & Safe-to-Spend
- **Core Financial Calculation**:
  $$\text{Available Money} = \text{Total Income} - \text{Fixed Expenses} - \text{Savings Target} - \text{Actual Additional Spending}$$
  $$\text{Safe To Spend} = \text{Available Money} - \text{Safety Buffer}$$
- **4 Dedicated Financial Pillars**:
  1. **Total Income**: Granular income ledger (Salary, Freelance, Bonus, Investments).
  2. **Fixed Expenses**: Recurring monthly commitments (Rent, Utilities, Internet, Subscriptions, Insurance).
  3. **Savings Target**: Dedicated savings funds with dream allocations.
  4. **Actual Spending**: Discretionary day-to-day purchases.
- **No Double-Counting**: Fixed expenses are never counted twice; savings allocations are partitioned safely; purchase transactions are deducted idempotently.
- **Affordability Chips**: 🟢 **SAFE TO BUY**, 🔴 **ABOVE SAFE-TO-SPEND**, 🟡 **SAVING REQUIRED**.
- **Historical Ledgers & Isolation**: Multi-month tracking (1m, 3m, 6m, 12m) with strict chronological isolation (updating current month never alters past months).

### 3. 🎨 8 Curated Anime Visual Themes
- **Black Clover** *(Default)*: Grimoire Gold, Anti-Magic Crimson, Emerald Runes.
- **Solo Leveling**: Shadow Monarch Neon Blue, Dark Obsidian Dungeon, High Contrast.
- **Demon Slayer**: Sun Breathing Flame Crimson, Nichirin Gold, Charcoal Slate.
- **Jujutsu Kaisen**: Limitless Void Violet, Cursed Spark Cyan, Deep Black.
- **Hunter x Hunter**: Hunter Exam Emerald, Nen Aura Amber, Adventure Parchment.
- **Attack on Titan**: Scout Regiment Olive Green, Wings of Freedom Bronze, Iron Gray.
- **Haikyuu**: Karasuno Court Orange, Pitch Black, High-Energy Sparks.
- **Your Name**: Twilight Comet (Katawaredoki) Coral, Sunset Indigo, Deep Sky.
- **Animation Controls**: `Full`, `Reduced`, or `Off` presets with automatic `prefers-reduced-motion` detection.

### 4. 🏆 Grimoire Achievements & Purchase Celebrations
- **Fanfare & Confetti**: Multi-stage celebration modal powered by Web Audio API and realistic particle physics.
- **Real-Time Achievement Engine**: Automatically unlocks badges upon reaching milestones (`FIRST_DREAM`, `FIRST_ACQUISITION`, `BIG_DREAM_COMPLETE`, `COLLECTOR`, `S_TIER_COMPLETE`, `SAVER`).

### 5. 🛡️ Data Vault & Export/Import
- **JSON Export**: Complete database backup of all dreams, price histories, monthly ledgers, and transactions.
- **CSV Export**: Clean spreadsheet format of all dream quests.
- **Validated JSON Import**: Schema-validated restore with overwrite protection and security notice.

---

## 🏛️ Architecture & Tech Stack

```
                 INTERNET
                    │
                    ▼
             ┌─────────────┐
             │   Vercel    │
             │ Life Quest  │
             └──────┬──────┘
                    │
                    ▼
             Server/API Layer
                    │
                    ▼
             ┌─────────────┐
             │   Managed   │
             │    MySQL    │
             └─────────────┘
```

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Server Components & Route Handlers)
- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons
- **Database**: [Prisma 5.22](https://www.prisma.io/) with **MySQL** Engine
- **Authentication**: Stateless Signed JWT via [`jose`](https://github.com/panva/jose) + [`bcryptjs`](https://github.com/dcodeIO/bcrypt.js)
- **Audio & FX**: Synthesized Web Audio API, Canvas Confetti

---

## 🐬 MySQL Database Configuration

Life Quest is powered natively by **MySQL 8.0+** using UTF8MB4 charset for comprehensive unicode/emoji support and explicit `@db.Text` annotations for large text schemas.

### 1. Local MySQL via Docker Compose (Isolated)
Run an independent local MySQL container:
```bash
docker compose up -d
```
Connection string for local development:
```env
DATABASE_URL="mysql://quest_admin:QuestSecret2025!@localhost:3306/lifequest"
```

### 2. Managed MySQL in Production (Recommended Providers)
Life Quest connects seamlessly to any managed MySQL instance supporting TLS/SSL:
- **Aiven for MySQL**: Managed MySQL with automated backups and SSL (`sslmode=REQUIRED`).
- **PlanetScale**: Serverless MySQL with branch management.
- **Railway / Render MySQL**: Standalone managed MySQL instances.
- **AWS RDS MySQL / DigitalOcean Managed MySQL**: Standard enterprise MySQL 8.0.
- **TiDB Serverless**: MySQL-compatible cloud database.

---

## 🔒 Privacy & Security

1. **Private Single-User Model**: Only one administrator account exists. Public registrations are completely disabled.
2. **Endpoint Protection**: Every private API route and page is guarded by Edge middleware and server-side `requireAuth()` validation.
3. **No Search Indexing**: Search engines are instructed to ignore the app via:
   - `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet` in headers
   - `robots.ts` configured with `disallow: /`
   - `layout.tsx` metadata with `robots: { index: false, follow: false }`
4. **Secret Protection**: `.env` is ignored by Git. `.env.example` contains placeholders only. Secrets are never sent to the browser or logged.

---

## 🛒 Trusted Sources & Priority Hierarchy

Life Quest enforces a strict trusted-sources whitelist for product pricing:

| Priority | Source Type | Examples |
| :--- | :--- | :--- |
| **Priority 1 (Primary)** | **Official Brand Websites** | Logitech, Razer, Sony, ASUS, Apple, Samsung, Nike, Royal Enfield, Porsche, Canon, Prime 1 Studio |
| **Priority 2 (Secondary)** | **Amazon India** | `amazon.in` listings |
| **Priority 3 (Fallback)** | **Flipkart** | `flipkart.com` listings |
| **Blocked / Untrusted** | **Unverified Sources** | Scrapers, random blogs, unknown marketplaces, unverified aggregators |

*If an unsupported URL is supplied, the engine clearly rejects it: "This source is not currently supported as a trusted pricing source."*

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory based on `.env.example`:

```env
# Database Connection (MySQL)
DATABASE_URL="mysql://quest_admin:QuestSecret2025!@localhost:3306/lifequest"

# Admin Authentication Secret (32+ char random string)
# Generate with: openssl rand -base64 32
AUTH_SECRET="your-secure-random-32-character-secret-key"

# Initial Admin User Credentials
ADMIN_USERNAME="admin"
ADMIN_EMAIL="admin@lifequest.local"
ADMIN_INITIAL_PASSWORD="ChangeMeQuest2025!"

# Application Settings
NEXT_PUBLIC_APP_NAME="Life Quest"
NEXT_PUBLIC_DEFAULT_CURRENCY="INR"
```

---

## 🚀 Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local MySQL Database
```bash
docker compose up -d
```

### 3. Push Schema & Seed Initial Data
```bash
npm run db:push
npm run db:seed
```

### 4. Run Dev Server
```bash
npm run dev
```
Access the application at **http://localhost:3000** (or port specified in terminal).

### 5. Default Login Credentials
- **Username / Email**: `admin` or `admin@lifequest.local`
- **Password**: `ChangeMeQuest2025!`

---

## 🧪 Testing & Validation

Run the test suite and production build:

```bash
# Generate Prisma Client
npm run db:generate

# TypeScript validation
npm run typecheck

# Lint validation
npm run lint

# Production compilation
npm run build
```

---

## 🚢 Production Deployment Guide (Vercel + Managed MySQL)

### Step 1: Provision Managed MySQL Database
Create a clean MySQL 8.0 database on your chosen provider (e.g. Aiven, PlanetScale, Railway, AWS RDS). Note the connection string:
```
mysql://USER:PASSWORD@HOST:PORT/DATABASE?sslaccept=strict
```

### Step 2: Push Database Schema
From your local environment or deployment CI/CD:
```bash
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE?sslaccept=strict" npx prisma db push
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE?sslaccept=strict" npx tsx prisma/seed.ts
```

### Step 3: Configure Vercel Project
In your Vercel Project Settings $\to$ **Environment Variables**, configure:
- `DATABASE_URL`: `mysql://USER:PASSWORD@HOST:PORT/DATABASE?sslaccept=strict`
- `AUTH_SECRET`: Strong 32+ character key (`openssl rand -base64 32`)
- `ADMIN_USERNAME`: Your private username
- `ADMIN_EMAIL`: Your private email
- `ADMIN_INITIAL_PASSWORD`: Strong master password
- `NEXT_PUBLIC_DEFAULT_CURRENCY`: `INR` (or `USD`, `EUR`, `GBP`, `JPY`)

### Step 4: Deploy
```bash
vercel --prod
```

---

## 💾 Backup & Recovery

- **Export JSON**: Navigate to **Settings** $\to$ **Data Export & Backup Recovery** $\to$ **Export Full JSON**.
- **Export CSV**: Download a spreadsheet of all dreams via **Export Dreams CSV**.
- **Restore Backup**: Click **Import Backup JSON**, select your `.json` backup, and click **Import Data**.

---

## 🛡️ License

Private personal project. All rights reserved.
