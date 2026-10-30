import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  console.log("🌱 Starting seed...");

  // ============ USERS ============
  const adminPassword = await bcrypt.hash("admin123", 12);
  const userPassword = await bcrypt.hash("user123", 12);

  await prisma.user.upsert({
    where: { email: "admin@malix.com" },
    update: {},
    create: {
      email: "admin@malix.com",
      name: "MALIX Admin",
      passwordHash: adminPassword,
      role: "ADMIN",
      isActive: true,
      profile: { create: {} },
    },
  });
  console.log("✅ Admin created: admin@malix.com");

  await prisma.user.upsert({
    where: { email: "user@malix.com" },
    update: {},
    create: {
      email: "user@malix.com",
      name: "Test User",
      passwordHash: userPassword,
      role: "USER",
      isActive: true,
      profile: { create: {} },
    },
  });
  console.log("✅ User created: user@malix.com");

  // ============ GENRES ============
  const genreNames = [
    "Action", "Adventure", "Comedy", "Crime", "Documentary",
    "Drama", "Family", "Fantasy", "Horror", "Mystery",
    "Romance", "Sci-Fi", "Thriller", "Supernatural", "Mecha",
  ];

  const genres: Record<string, string> = {};
  for (const name of genreNames) {
    const slug = slugify(name);
    const g = await prisma.genre.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
    genres[name] = g.id;
  }
  console.log(`✅ ${genreNames.length} genres created`);

  // ============ COMING SOON ============
  const comingSoonData = [
    { title: "Avatar 3: Fire and Ash", description: "Jake Sully and Neytiri face a new threat on Pandora.", releaseYear: 2025, type: "MOVIE", trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", comingSoonDate: new Date("2025-12-19") },
    { title: "Stranger Things Season 5", description: "The final chapter of the Upside Down saga.", releaseYear: 2025, type: "SERIES", trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", comingSoonDate: new Date("2025-11-15") },
    { title: "Solo Leveling Season 2", description: "Sung Jinwoo continues his journey to become the strongest hunter.", releaseYear: 2025, type: "ANIME", trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", comingSoonDate: new Date("2025-01-10") },
  ];

  let comingSoonCount = 0;
  for (const item of comingSoonData) {
    const slug = slugify(item.title);
    await prisma.content.upsert({
      where: { slug },
      update: {},
      create: {
        title: item.title,
        slug,
        description: item.description,
        type: item.type as any,
        releaseYear: item.releaseYear,
        trailerUrl: item.trailerUrl,
        status: "PUBLISHED",
        isComingSoon: true,
        comingSoonDate: item.comingSoonDate,
        publishedAt: new Date(),
      },
    });
    comingSoonCount++;
  }
  console.log(`✅ ${comingSoonCount} Coming Soon items created`);

  // ============ MOVIES ============
  const moviesData = [
    { title: "The Dark Horizon", description: "A lone astronaut discovers a signal from a dying star system.", releaseYear: 2024, duration: 128, language: "English", country: "USA", rating: 8.5, genres: ["Action", "Sci-Fi", "Thriller"], isFeatured: true },
    { title: "Midnight Protocol", description: "A hacker uncovers a global conspiracy hidden inside a corporate network.", releaseYear: 2023, duration: 115, language: "English", country: "USA", rating: 7.9, genres: ["Action", "Crime", "Thriller"] },
    { title: "Crimson Tides", description: "In a coastal town shrouded in secrets, a detective investigates a string of disappearances.", releaseYear: 2024, duration: 110, language: "English", country: "UK", rating: 8.2, genres: ["Crime", "Mystery", "Thriller"], isFeatured: true },
    { title: "Neon Requiem", description: "A retired hitman is pulled back into the underworld for one final job.", releaseYear: 2024, duration: 122, language: "English", country: "USA", rating: 8.8, genres: ["Action", "Crime", "Thriller"], isFeatured: true },
  ];

  let movieCount = 0;
  for (const movie of moviesData) {
    const slug = slugify(movie.title);
    const content = await prisma.content.upsert({
      where: { slug },
      update: {},
      create: {
        title: movie.title,
        slug,
        description: movie.description,
        type: "MOVIE",
        releaseYear: movie.releaseYear,
        language: movie.language,
        country: movie.country,
        duration: movie.duration,
        avgRating: movie.rating,
        totalRatings: Math.floor(Math.random() * 500) + 50,
        totalViews: Math.floor(Math.random() * 5000) + 500,
        status: "PUBLISHED",
        isFeatured: movie.isFeatured || false,
        publishedAt: new Date(),
        genres: { connect: movie.genres.map((g) => ({ id: genres[g] })) },
      },
    });
    await prisma.movie.upsert({
      where: { contentId: content.id },
      update: {},
      create: { contentId: content.id },
    });
    movieCount++;
  }
  console.log(`✅ ${movieCount} movies created`);

  console.log("🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });