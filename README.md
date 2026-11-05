# MALIX - Movies, Series & Anime Streaming Platform

MALIX is a full-stack movie and series streaming platform built with Next.js, Prisma, and PostgreSQL. It includes an admin panel for managing content, a user-facing website for streaming, and a mobile app (Android/iOS) built with React Native.

## 🚀 Tech Stack

### Frontend (Website)
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Lucide React, Sonner (Toasts)
- **Fonts:** Google Fonts (Inter)

### Backend & Database
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** Custom JWT-based Auth (using `jose` and `bcryptjs`)
- **Server Actions:** Next.js Server Actions

### Mobile App
- **Framework:** React Native (Expo)
- **Navigation:** Expo Router
- **WebView:** React Native WebView (to load the website inside the app)
- **UI:** React Native Safe Area Context

### DevOps & Deployment
- **Hosting:** Vercel (Frontend & API)
- **Database Hosting:** Neon / Supabase (PostgreSQL)
- **Version Control:** Git & GitHub

## 📂 Project Structure
malix/
├── prisma/ # Prisma schema and migrations
├── public/ # Static assets
├── src/
│ ├── app/ # Next.js App Router pages
│ │ ├── (admin)/ # Admin panel routes
│ │ ├── (main)/ # User-facing routes
│ │ └── api/ # API routes
│ ├── components/ # Reusable UI components
│ ├── lib/ # Utility functions and database client
│ └── server/ # Server actions and API logic
├── malix-app/ # Expo (React Native) mobile app
├── README.md
└── package.json


## 🛠️ Features

- **Admin Panel:** Full CRUD for Movies, Series, Anime, Music, and Coming Soon content.
- **Video Streaming:** Support for YouTube and direct MP4 links.
- **User System:** Authentication, Watchlist, Reviews, and Ratings.
- **Mobile App:** A WebView-based wrapper for the website with offline error handling.
- **SEO Optimized:** Dynamic metadata for all pages.

## ⚙️ Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL database
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/malix.git
cd malix


2. Install Dependencies
bash
npm install
3. Environment Variables
Create a .env file in the root directory and add the following:

env
DATABASE_URL="postgresql://user:password@localhost:5432/malix"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
4. Database Setup
bash
npx prisma migrate dev --name init
npx prisma generate
5. Run the Development Server
bash
npm run dev
Open http://localhost:3000 to see the website.

6. Mobile App (Expo)
Navigate to the mobile app folder:

bash
cd malix-app
npm install
npx expo start
Scan the QR code with Expo Go app on your phone.

🌐 Live Demo
Website: https://malix-fawn.vercel.app/

Admin Panel: https://malix-fawn.vercel.app/admin