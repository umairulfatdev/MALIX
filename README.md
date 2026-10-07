# 🎬 MALIX — Movies, Dramas, Series & Anime Streaming Platform

> **Watch. Discover. Enjoy.**

A modern, full-stack streaming platform built with **Next.js 15**, **TypeScript**, **PostgreSQL**, and **Prisma ORM**. MALIX provides a premium cinematic experience for streaming legally authorized content.

![MALIX Logo](public/brand/malix-logo.png)

---

## ✨ Features

### 🎥 User Features
- **Browse Content** — Movies, Dramas, Series, Anime
- **Smart Search** — Real-time search with live suggestions
- **Advanced Filters** — By genre, year, language, rating
- **Video Player** — Fullscreen with progress tracking
- **Watchlist** — Save content for later
- **Watch History** — Track everything you've watched
- **Continue Watching** — Resume from where you left off
- **Ratings & Reviews** — Rate and review content
- **Authorized Downloads** — Multiple qualities (480p, 720p, 1080p)
- **User Profile** — Customize profile, change password
- **Notifications** — Real-time updates

### 🛠️ Admin Features
- **Dashboard** — Live statistics overview
- **Full CRUD** — Movies, Dramas, Series, Anime
- **Season & Episode Management** — Nested content structure
- **User Management** — Activate, promote, manage users
- **Review Moderation** — Hide, delete, report handling
- **Downloads Overview** — Track all downloads
- **Statistics** — Content, users, downloads analytics
- **Settings** — Platform configuration
- **Notifications** — Broadcast to all users

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS, Custom CSS Animations |
| **Backend** | Next.js Server Actions |
| **Database** | PostgreSQL 16 |
| **ORM** | Prisma 6 |
| **Auth** | JWT (jose), bcryptjs |
| **UI Icons** | Lucide React |
| **Charts** | Recharts |
| **Toasts** | Sonner |

---

## 📦 Installation

### Prerequisites
- Node.js **20.18.0** (LTS)
- PostgreSQL **16+**
- npm **10+**

### Setup

```bash
# 1. Clone
git clone <your-repo-url>
cd malix

# 2. Install
npm install

# 3. Environment
cp .env.example .env
# Edit .env with your values

# 4. Database
npx prisma migrate dev

# 5. Seed sample data
npm run db:seed

# 6. Start
npm run dev