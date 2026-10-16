# 🎬 MALIX — Movies, Dramas, Series & Anime Streaming Platform

> **Watch. Discover. Enjoy.**

A modern, full-stack streaming platform built with **Next.js 15**, **TypeScript**, **PostgreSQL**, and **Prisma ORM**. MALIX provides a premium cinematic experience for streaming legally authorized content.

---

## ✨ Features

### 🎥 User Features
- Browse Movies, Dramas, Series, Anime
- Smart search with live suggestions
- Video player with playback controls
- Watchlist (save for later)
- Watch history + Continue Watching
- Ratings (5-star) + Reviews
- Authorized downloads (multiple qualities)
- User profile management
- Notifications

### 🛠️ Admin Features
- Live dashboard with statistics
- Full CRUD for all content types
- Season + Episode management
- User management
- Review moderation
- Downloads tracking
- Platform statistics
- Settings

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS |
| Backend | Next.js Server Actions |
| Database | PostgreSQL |
| ORM | Prisma 6 |
| Auth | JWT (jose) + bcryptjs |
| Hosting | Vercel (frontend) + Cloudinary (videos) |

---

## 🔧 Setup

```bash
# Install dependencies
npm install

# Environment setup
cp .env.example .env
# Edit .env with your values

# Database
npx prisma migrate dev
npm run db:seed

# Run development
npm run dev