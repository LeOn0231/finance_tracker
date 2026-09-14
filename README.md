# 🌟 Life Quest — Personal Dream Purchase Tracker & Finance Sanctuary

> *« Even without magic, I will become the Wizard King. »* — Asta (Black Clover)

**Life Quest** is a strictly private, single-user personal web application engineered to turn financial discipline and dream acquisitions into an anime-styled RPG questing experience.

Inspired primarily by **Black Clover** (Grimoire tiers, Magic Knight ranks, Black Bulls determination, golden aura runes) with influences from *Solo Leveling*, *Hunter x Hunter*, and *Demon Slayer*.

---

## 🚀 Features (Phases 1, 2 & 3)

### 1. Single-User Private Application & Authentication
- **Strict Privacy**: Single-admin architecture. No public registration.
- **Protected Routes & APIs**: Server-side verification via Edge middleware and `requireAuth()`.
- **Tamper-Proof Sessions**: HttpOnly, SameSite=Lax, signed JWT session cookies with `jose`.
- **Password Security**: Strong bcrypt password hashing with salt rounds.
- **Search Engine Blocking**: Complete `noindex, nofollow` headers and `robots.txt` configuration.

### 2. Anime UI & Design System
- **Dark Luxury Cyber-Grimoire Aesthetic**: Obsidian black `#090b10`, deep navy surfaces, Grimoire Gold `#f59e0b`, Clover Emerald `#10b981`, and Anti-Magic Crimson `#ef4444`.
- **Priority Tier Classification**:
  - 👑 **S-Tier**: Ultimate Dream (High ticket milestones, cars, dream battlestations)
  - ✨ **A-Tier**: Major Goal (Flagship electronics, cameras, premium statues)
  - 🛡️ **B-Tier**: Important (Keyboards, manga box sets, ergonomic gear)
  - ⭐ **C-Tier**: Nice to Have (Accessories, everyday items)
  - 📍 **D-Tier**: Maybe Someday (Backlog ideas)
- **Status Progression**:
  - `Dreaming` → `Planning` → `Saving` → `Ready to Buy` → `Purchased`
- **Web Audio Sound Effects**: Zero external audio assets needed. Built-in Web Audio API synthesizer generates retro fanfare chimes, click haptics, and victory fanfare.

### 3. Comprehensive Dream Purchase Tracker
- **Main Dashboard**: Real-time stats (Total Dreams, Big Dreams, Small Dreams, Purchased, Total Dream Value, Purchased Value, Remaining Goal Value) + compact **THIS MONTH** financial card.
- **Featured Current Quest**: Hero card with live funding progress bar, glowing aura, and quick actions.
- **Big Dreams Page**: Dedicated gallery with rich visual cards, specifications, and multi-filters.
- **Small Dreams Page**: Compact grid for figures, manga, audio gear, and gaming accessories with live **Safe-To-Spend Affordability Indicators**.
- **Item Dossier Modal**: Full specifications, price breakdowns, original date, journey duration, and "View Source" outbound links.
- **"I Bought This" Celebration**: Confirmation flow triggering golden anime confetti bursts, glowing aura banner, victory fanfare chime, and recording in the **Hall of Fame**.
- **Purchased Page**: Chronological history tracking total acquisition investment and time-from-dream-to-reality.

### 4. Personal Finance & Monthly Budget System (Phase 3)
- **Financial Framework Formula**:
  $$\text{Available Money} = \text{Total Income} - \text{Fixed Expenses} - \text{Savings Target} - \text{Actual Additional Spending}$$
  $$\text{Safe To Spend} = \text{Available Money} - \text{Safety Buffer}$$
- **Monthly Income Streams**: Support for Salary, Freelance, Bonuses, Investment yields, and multiple income sources.
- **Fixed Monthly Commitments**: Recurring bills (Rent/EMI, Food, Electricity, Internet, Mobile, Insurance, Subscriptions) with paid/unpaid toggles and custom categories.
- **Savings Allocation**: Partitioning monthly savings into specific Big Dream funds (e.g. *Royal Enfield Meteor Fund*) or emergency reserves.
- **Actual Spending Ledger**: Transaction log with categories, dates, and optional dream linking.
- **Small Dream Affordability Engine**: Live checking against Safe-To-Spend with 🟢 **AFFORDABLE** or 🔴 **ABOVE CURRENT SAFE-TO-SPEND** badges.
- **Monthly Dream Purchase Budget**: Optional dedicated dream allocation quota separate from overall safe-to-spend.
- **Multi-Month History & Reviews**: Complete independent monthly ledger records (September 2026, October 2026, etc.), Month-End review with savings rate, and lightweight CSS/SVG trend charts (1m, 3m, 6m, 12m, all).

---

## 🛠️ Technology Stack

- **Framework**: Next.js 15 (App Router, React 19, TypeScript)
- **Styling**: Tailwind CSS, Glassmorphism, CSS Custom Properties, Lucide Icons
- **Database & ORM**: Prisma ORM (SQLite for instant zero-config local run, seamlessly compatible with PostgreSQL)
- **Authentication**: `jose` (JWT), `bcryptjs`
- **Animation & FX**: `canvas-confetti`, Web Audio API

---

## ⚡ Quick Start & Running Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default local variables:
```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="lifequest-ultra-secure-jwt-session-secret-key-32-chars-min"
ADMIN_USERNAME="admin"
ADMIN_EMAIL="admin@lifequest.local"
ADMIN_INITIAL_PASSWORD="ChangeMeQuest2025!"
```

### 3. Initialize & Seed Database
```bash
npm run db:push
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```
Open **http://localhost:3000** in your browser.

---

## 🔑 Default Admin Credentials

- **Username / Email**: `admin` or `admin@lifequest.local`
- **Password**: `ChangeMeQuest2025!`
