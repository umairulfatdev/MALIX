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

  // ============ MOVIES ============
  const moviesData = [
    { title: "The Dark Horizon", description: "A lone astronaut discovers a signal from a dying star system, sparking a race against time to save humanity.", releaseYear: 2024, duration: 128, language: "English", country: "USA", rating: 8.5, genres: ["Action", "Sci-Fi", "Thriller"], isFeatured: true },
    { title: "Midnight Protocol", description: "A hacker uncovers a global conspiracy hidden inside a corporate network, forcing her to run from the very people she trusted.", releaseYear: 2023, duration: 115, language: "English", country: "USA", rating: 7.9, genres: ["Action", "Crime", "Thriller"] },
    { title: "Crimson Tides", description: "In a coastal town shrouded in secrets, a detective investigates a string of disappearances that echo her own past.", releaseYear: 2024, duration: 110, language: "English", country: "UK", rating: 8.2, genres: ["Crime", "Mystery", "Thriller"], isFeatured: true },
    { title: "The Last Signal", description: "When Earth loses contact with its deep-space station, a small crew must decide whether to return home or keep searching.", releaseYear: 2022, duration: 135, language: "English", country: "USA", rating: 7.4, genres: ["Sci-Fi", "Drama"] },
    { title: "Neon Requiem", description: "A retired hitman is pulled back into the underworld for one final job that could redeem or destroy him.", releaseYear: 2024, duration: 122, language: "English", country: "USA", rating: 8.8, genres: ["Action", "Crime", "Thriller"], isFeatured: true },
    { title: "Solar Winds", description: "A team of scientists races against a catastrophic solar event that threatens to reshape the planet.", releaseYear: 2023, duration: 118, language: "English", country: "Canada", rating: 7.6, genres: ["Sci-Fi", "Adventure"] },
    { title: "Whispers of Rain", description: "Two strangers meet during a monsoon and discover that their lives were intertwined long before they met.", releaseYear: 2022, duration: 105, language: "Hindi", country: "India", rating: 7.9, genres: ["Romance", "Drama"] },
    { title: "The Paper House", description: "A family struggles to keep their home and their bonds intact through a season of devastating change.", releaseYear: 2024, duration: 112, language: "Hindi", country: "India", rating: 8.5, genres: ["Drama", "Family"] },
    { title: "Autumn Letters", description: "A young woman finds a box of letters that leads her to a love story she never knew existed.", releaseYear: 2024, duration: 108, language: "English", country: "UK", rating: 8.7, genres: ["Romance", "Drama", "Mystery"] },
    { title: "Fading Petals", description: "A celebrated dancer fights to reclaim her career after a devastating injury changes everything.", releaseYear: 2024, duration: 120, language: "Korean", country: "South Korea", rating: 8.9, genres: ["Drama", "Romance"] },
    { title: "Broken Compass", description: "Five friends embark on a hiking trip that takes a dark turn when they stumble upon an abandoned village.", releaseYear: 2022, duration: 95, language: "English", country: "USA", rating: 7.8, genres: ["Horror", "Thriller", "Mystery"] },
    { title: "Laughing Matters", description: "A struggling comedian's life changes overnight when a viral clip sends him on an unexpected tour.", releaseYear: 2023, duration: 100, language: "English", country: "USA", rating: 7.5, genres: ["Comedy", "Drama"] },
    { title: "Kingdom of Ash", description: "In a realm on the brink of war, a young queen must choose between duty and her own heart.", releaseYear: 2024, duration: 145, language: "English", country: "USA", rating: 8.4, genres: ["Fantasy", "Adventure", "Drama"] },
    { title: "The Quiet Frontier", description: "A frontier family faces an unforgiving winter and a dangerous stranger who seeks shelter.", releaseYear: 2022, duration: 115, language: "English", country: "USA", rating: 7.7, genres: ["Drama", "Adventure"] },
    { title: "Catch the Wind", description: "A young sailor attempts a solo voyage that tests her limits and redefines her understanding of courage.", releaseYear: 2024, duration: 108, language: "English", country: "Australia", rating: 8.0, genres: ["Adventure", "Drama"] },
    { title: "Under the Same Sky", description: "A story of two families on opposite sides of a conflict who discover a shared humanity.", releaseYear: 2023, duration: 127, language: "English", country: "USA", rating: 8.8, genres: ["Drama", "Family"] },
    { title: "Wildflower", description: "A coming-of-age story about a teenager who discovers her voice through music.", releaseYear: 2023, duration: 98, language: "English", country: "USA", rating: 7.9, genres: ["Drama", "Family"] },
    { title: "Hollow Creek", description: "Four teenagers investigate a local legend and uncover something far darker than they expected.", releaseYear: 2024, duration: 105, language: "English", country: "USA", rating: 7.3, genres: ["Horror", "Mystery"] },
    { title: "The Cartographer's Daughter", description: "A young woman retraces her father's final expedition and discovers a secret he took to his grave.", releaseYear: 2023, duration: 122, language: "English", country: "UK", rating: 8.4, genres: ["Adventure", "Drama", "Mystery"] },
    { title: "Starlight Protocol", description: "A diplomatic mission to a distant planet becomes a fight for survival when communications break down.", releaseYear: 2024, duration: 138, language: "English", country: "USA", rating: 8.6, genres: ["Sci-Fi", "Thriller"] },
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

  // ============ DRAMAS ============
  const dramasData = [
    { title: "The Promise", description: "Two families bound by an old promise must navigate love, betrayal, and forgiveness across generations.", releaseYear: 2023, duration: 42, language: "Hindi", country: "India", rating: 8.4, totalEps: 24, genres: ["Drama", "Family", "Romance"] },
    { title: "Where the Sun Sets", description: "A coastal town hides secrets that surface when a prodigal daughter returns after twenty years.", releaseYear: 2023, duration: 48, language: "Turkish", country: "Turkey", rating: 8.2, totalEps: 20, genres: ["Drama", "Mystery"] },
    { title: "Crown of Thorns", description: "A young queen ascends the throne amid betrayal and must decide whom to trust in a kingdom of wolves.", releaseYear: 2024, duration: 52, language: "English", country: "USA", rating: 8.8, totalEps: 10, genres: ["Drama", "Fantasy", "Adventure"] },
    { title: "Midnight Café", description: "A late-night café becomes the meeting place for strangers whose lives are more connected than they realize.", releaseYear: 2023, duration: 38, language: "Japanese", country: "Japan", rating: 8.6, totalEps: 12, genres: ["Drama", "Romance", "Mystery"] },
    { title: "Golden Cage", description: "A wealthy family's darkest secrets unravel when their youngest heir returns from abroad.", releaseYear: 2023, duration: 42, language: "Hindi", country: "India", rating: 8.3, totalEps: 22, genres: ["Drama", "Family", "Mystery"] },
    { title: "Broken Wings", description: "A pilot's life changes forever after a crash leaves her questioning everything she believed in.", releaseYear: 2024, duration: 44, language: "Turkish", country: "Turkey", rating: 8.5, totalEps: 16, genres: ["Drama", "Romance"] },
    { title: "Do Dil Ek Jan", description: "A cross-cultural love story between a Pakistani architect and an Indian journalist.", releaseYear: 2023, duration: 42, language: "Urdu", country: "Pakistan", rating: 8.4, totalEps: 24, genres: ["Drama", "Romance"] },
    { title: "Moonlight Sonata", description: "A gifted pianist and her teacher's complicated relationship, told across three decades.", releaseYear: 2023, duration: 45, language: "Japanese", country: "Japan", rating: 8.9, totalEps: 10, genres: ["Drama", "Romance"] },
    { title: "Mumbai Meri Jaan", description: "Three strangers from different walks of life whose paths cross in Mumbai over one monsoon season.", releaseYear: 2023, duration: 44, language: "Hindi", country: "India", rating: 8.3, totalEps: 18, genres: ["Drama", "Romance", "Family"] },
  ];

  let dramaCount = 0;
  for (const drama of dramasData) {
    const slug = slugify(drama.title);
    const content = await prisma.content.upsert({
      where: { slug },
      update: {},
      create: {
        title: drama.title,
        slug,
        description: drama.description,
        type: "DRAMA",
        releaseYear: drama.releaseYear,
        language: drama.language,
        country: drama.country,
        duration: drama.duration,
        avgRating: drama.rating,
        totalRatings: Math.floor(Math.random() * 800) + 100,
        totalViews: Math.floor(Math.random() * 10000) + 1000,
        status: "PUBLISHED",
        publishedAt: new Date(),
        genres: { connect: drama.genres.map((g) => ({ id: genres[g] })) },
      },
    });
    await prisma.drama.upsert({
      where: { contentId: content.id },
      update: {},
      create: { contentId: content.id, totalEps: drama.totalEps },
    });
    dramaCount++;
  }
  console.log(`✅ ${dramaCount} dramas created`);

  // ============ SERIES (with seasons + episodes) ============
  const seriesData = [
    {
      title: "Empire of Shadows",
      description: "In a city where power is currency and secrets are the only truth, a young detective uncovers a conspiracy that reaches the highest offices of the empire.",
      releaseYear: 2024, language: "English", country: "USA", rating: 9.1,
      genres: ["Crime", "Thriller", "Mystery"],
      seasons: [
        {
          seasonNumber: 1, title: "Season 1", releaseYear: 2024,
          episodes: [
            { num: 1, title: "The Awakening", duration: 52 },
            { num: 2, title: "Shadows Within", duration: 48 },
            { num: 3, title: "The First Lie", duration: 50 },
            { num: 4, title: "Fractured Truth", duration: 51 },
            { num: 5, title: "The Gathering Storm", duration: 55 },
            { num: 6, title: "Revelations", duration: 49 },
            { num: 7, title: "The Web Tightens", duration: 52 },
            { num: 8, title: "Blood in the Rain", duration: 54 },
            { num: 9, title: "The Hidden Hand", duration: 50 },
            { num: 10, title: "Empire Falls", duration: 58 },
          ],
        },
        {
          seasonNumber: 2, title: "Season 2", releaseYear: 2025,
          episodes: [
            { num: 1, title: "Aftermath", duration: 51 },
            { num: 2, title: "New Order", duration: 49 },
            { num: 3, title: "The Silent Alliance", duration: 53 },
            { num: 4, title: "Ghosts of Yesterday", duration: 50 },
            { num: 5, title: "The Reckoning", duration: 55 },
          ],
        },
      ],
    },
    {
      title: "Silent Waters",
      description: "A quiet lakeside community is torn apart when a body surfaces after twenty years, forcing long-buried secrets to rise.",
      releaseYear: 2023, language: "English", country: "UK", rating: 8.6,
      genres: ["Mystery", "Drama", "Thriller"],
      seasons: [
        {
          seasonNumber: 1, title: "Season 1", releaseYear: 2023,
          episodes: [
            { num: 1, title: "Still Waters", duration: 45 },
            { num: 2, title: "The Discovery", duration: 48 },
            { num: 3, title: "Old Wounds", duration: 46 },
            { num: 4, title: "The Interview", duration: 44 },
            { num: 5, title: "Under the Surface", duration: 50 },
            { num: 6, title: "The Truth Emerges", duration: 52 },
          ],
        },
      ],
    },
    {
      title: "The Midnight Files",
      description: "A journalist investigates a series of impossible crimes that lead her to a hidden government program.",
      releaseYear: 2024, language: "English", country: "USA", rating: 8.3,
      genres: ["Crime", "Mystery", "Thriller"],
      seasons: [
        {
          seasonNumber: 1, title: "Season 1", releaseYear: 2024,
          episodes: [
            { num: 1, title: "The First Case", duration: 48 },
            { num: 2, title: "Pattern Unknown", duration: 50 },
            { num: 3, title: "The Witness", duration: 47 },
            { num: 4, title: "Redacted", duration: 52 },
            { num: 5, title: "Deep Cover", duration: 49 },
            { num: 6, title: "The Informant", duration: 51 },
            { num: 7, title: "Blackout", duration: 50 },
            { num: 8, title: "The Final File", duration: 55 },
          ],
        },
      ],
    },
    {
      title: "Broken Compass Series",
      description: "Five friends embark on a hiking trip that takes a dark turn when they stumble upon an abandoned village.",
      releaseYear: 2022, language: "English", country: "USA", rating: 7.8,
      genres: ["Horror", "Thriller", "Mystery"],
      seasons: [
        {
          seasonNumber: 1, title: "Season 1", releaseYear: 2022,
          episodes: [
            { num: 1, title: "The Trailhead", duration: 42 },
            { num: 2, title: "Lost Signal", duration: 45 },
            { num: 3, title: "The Village", duration: 44 },
            { num: 4, title: "Nightfall", duration: 47 },
            { num: 5, title: "The Ritual", duration: 49 },
            { num: 6, title: "Escape", duration: 50 },
          ],
        },
      ],
    },
    {
      title: "Echoes of Tomorrow",
      description: "A physicist discovers a way to send messages to her past self, unraveling a web of consequences across time.",
      releaseYear: 2024, language: "English", country: "USA", rating: 8.9,
      genres: ["Sci-Fi", "Drama", "Thriller"],
      seasons: [
        {
          seasonNumber: 1, title: "Season 1", releaseYear: 2024,
          episodes: [
            { num: 1, title: "The First Message", duration: 55 },
            { num: 2, title: "Parallel Lives", duration: 52 },
            { num: 3, title: "The Butterfly Effect", duration: 54 },
            { num: 4, title: "Loops", duration: 51 },
            { num: 5, title: "Convergence", duration: 56 },
            { num: 6, title: "The Last Echo", duration: 58 },
          ],
        },
      ],
    },
    {
      title: "Beyond the Void",
      description: "When a wormhole opens near Neptune, a mission is launched to explore what lies on the other side.",
      releaseYear: 2023, language: "English", country: "USA", rating: 8.1,
      genres: ["Sci-Fi", "Adventure", "Mystery"],
      seasons: [
        {
          seasonNumber: 1, title: "Season 1", releaseYear: 2023,
          episodes: [
            { num: 1, title: "Departure", duration: 50 },
            { num: 2, title: "The Crossing", duration: 52 },
            { num: 3, title: "New Horizons", duration: 49 },
            { num: 4, title: "First Contact", duration: 55 },
            { num: 5, title: "The Return", duration: 58 },
          ],
        },
      ],
    },
    {
      title: "The Crown Prince",
      description: "A historical drama following the rise of a reluctant prince in a turbulent kingdom of intrigue and betrayal.",
      releaseYear: 2023, language: "English", country: "UK", rating: 8.8,
      genres: ["Drama", "Fantasy", "Adventure"],
      seasons: [
        {
          seasonNumber: 1, title: "Season 1", releaseYear: 2023,
          episodes: [
            { num: 1, title: "The Heir", duration: 58 },
            { num: 2, title: "The Coronation", duration: 55 },
            { num: 3, title: "The Alliance", duration: 52 },
            { num: 4, title: "Betrayal", duration: 56 },
            { num: 5, title: "War", duration: 60 },
            { num: 6, title: "The Throne", duration: 62 },
          ],
        },
      ],
    },
    {
      title: "The Seoul Diaries",
      description: "Five friends navigate love, careers, and friendship in modern Seoul.",
      releaseYear: 2024, language: "Korean", country: "South Korea", rating: 8.7,
      genres: ["Drama", "Romance", "Comedy"],
      seasons: [
        {
          seasonNumber: 1, title: "Season 1", releaseYear: 2024,
          episodes: [
            { num: 1, title: "New Beginnings", duration: 60 },
            { num: 2, title: "The First Date", duration: 58 },
            { num: 3, title: "Complications", duration: 59 },
            { num: 4, title: "Heartbreak Hotel", duration: 57 },
            { num: 5, title: "The Confession", duration: 60 },
            { num: 6, title: "Crossroads", duration: 62 },
          ],
        },
      ],
    },
    {
      title: "Winter Sonata",
      description: "A heartbreaking romance between two childhood friends reunited after tragedy.",
      releaseYear: 2022, language: "Korean", country: "South Korea", rating: 9.0,
      genres: ["Drama", "Romance"],
      seasons: [
        {
          seasonNumber: 1, title: "Season 1", releaseYear: 2022,
          episodes: [
            { num: 1, title: "First Snow", duration: 60 },
            { num: 2, title: "The Reunion", duration: 58 },
            { num: 3, title: "Old Feelings", duration: 60 },
            { num: 4, title: "The Distance", duration: 59 },
            { num: 5, title: "Confession", duration: 62 },
            { num: 6, title: "Forever Winter", duration: 65 },
          ],
        },
      ],
    },
    {
      title: "The Iron Garden",
      description: "A robotics engineer must protect her creation from those who would weaponize it.",
      releaseYear: 2024, language: "English", country: "USA", rating: 8.2,
      genres: ["Sci-Fi", "Thriller", "Drama"],
      seasons: [
        {
          seasonNumber: 1, title: "Season 1", releaseYear: 2024,
          episodes: [
            { num: 1, title: "The Prototype", duration: 52 },
            { num: 2, title: "Activation", duration: 50 },
            { num: 3, title: "Learning", duration: 51 },
            { num: 4, title: "The Threat", duration: 54 },
            { num: 5, title: "The Escape", duration: 56 },
          ],
        },
      ],
    },
    {
      title: "House of Mirrors",
      description: "A psychological drama about a family therapist whose own family is falling apart.",
      releaseYear: 2024, language: "English", country: "USA", rating: 8.8,
      genres: ["Drama", "Thriller", "Mystery"],
      seasons: [
        {
          seasonNumber: 1, title: "Season 1", releaseYear: 2024,
          episodes: [
            { num: 1, title: "The Session", duration: 48 },
            { num: 2, title: "Reflections", duration: 50 },
            { num: 3, title: "The Truth", duration: 49 },
            { num: 4, title: "Breakdown", duration: 52 },
            { num: 5, title: "The Mirror Cracks", duration: 55 },
          ],
        },
      ],
    },
    {
      title: "The Last Colony",
      description: "Settlers on a distant planet must survive after losing contact with Earth.",
      releaseYear: 2024, language: "English", country: "USA", rating: 8.5,
      genres: ["Sci-Fi", "Adventure", "Drama"],
      seasons: [
        {
          seasonNumber: 1, title: "Season 1", releaseYear: 2024,
          episodes: [
            { num: 1, title: "Landfall", duration: 55 },
            { num: 2, title: "Blackout", duration: 52 },
            { num: 3, title: "The Signal", duration: 50 },
            { num: 4, title: "Survival", duration: 54 },
            { num: 5, title: "The Long Night", duration: 58 },
            { num: 6, title: "Homecoming", duration: 60 },
          ],
        },
      ],
    },
    {
      title: "Karachi Nights",
      description: "A crime reporter unravels a web of corruption in Pakistan's largest city.",
      releaseYear: 2024, language: "Urdu", country: "Pakistan", rating: 8.6,
      genres: ["Crime", "Thriller", "Drama"],
      seasons: [
        {
          seasonNumber: 1, title: "Season 1", releaseYear: 2024,
          episodes: [
            { num: 1, title: "The Lead", duration: 45 },
            { num: 2, title: "The Source", duration: 47 },
            { num: 3, title: "Danger Zone", duration: 46 },
            { num: 4, title: "The Cover-Up", duration: 48 },
            { num: 5, title: "Truth or Silence", duration: 50 },
          ],
        },
      ],
    },
    {
      title: "Istanbul Twilight",
      description: "An epic love story spanning two continents and a century of secrets.",
      releaseYear: 2024, language: "Turkish", country: "Turkey", rating: 8.7,
      genres: ["Drama", "Romance", "Mystery"],
      seasons: [
        {
          seasonNumber: 1, title: "Season 1", releaseYear: 2024,
          episodes: [
            { num: 1, title: "Two Shores", duration: 55 },
            { num: 2, title: "The Letters", duration: 52 },
            { num: 3, title: "Secrets", duration: 54 },
            { num: 4, title: "The Bridge", duration: 56 },
            { num: 5, title: "Twilight", duration: 60 },
          ],
        },
      ],
    },
  ];

  let seriesCount = 0;
  let seasonCount = 0;
  let episodeCount = 0;

  for (const s of seriesData) {
    const slug = slugify(s.title);

    const content = await prisma.content.upsert({
      where: { slug },
      update: {},
      create: {
        title: s.title,
        slug,
        description: s.description,
        type: "SERIES",
        releaseYear: s.releaseYear,
        language: s.language,
        country: s.country,
        avgRating: s.rating,
        totalRatings: Math.floor(Math.random() * 1000) + 200,
        totalViews: Math.floor(Math.random() * 15000) + 2000,
        status: "PUBLISHED",
        publishedAt: new Date(),
        genres: { connect: s.genres.map((g) => ({ id: genres[g] })) },
      },
    });

    const seriesRecord = await prisma.series.upsert({
      where: { contentId: content.id },
      update: {},
      create: { contentId: content.id, totalSeasons: s.seasons.length },
    });

    for (const season of s.seasons) {
      const seasonRecord = await prisma.season.upsert({
        where: {
          seriesId_seasonNumber: {
            seriesId: seriesRecord.id,
            seasonNumber: season.seasonNumber,
          },
        },
        update: {},
        create: {
          seriesId: seriesRecord.id,
          seasonNumber: season.seasonNumber,
          title: season.title,
          releaseYear: season.releaseYear,
          status: "PUBLISHED",
        },
      });
      seasonCount++;

      for (const ep of season.episodes) {
        const existing = await prisma.episode.findFirst({
          where: { seasonId: seasonRecord.id, episodeNum: ep.num },
        });
        if (!existing) {
          await prisma.episode.create({
            data: {
              seasonId: seasonRecord.id,
              episodeNum: ep.num,
              title: ep.title,
              description: `Episode ${ep.num} of ${s.title} - ${season.title}`,
              duration: ep.duration,
              status: "PUBLISHED",
            },
          });
          episodeCount++;
        }
      }
    }
    seriesCount++;
  }

  console.log(`✅ ${seriesCount} series created`);
  console.log(`✅ ${seasonCount} seasons created`);
  console.log(`✅ ${episodeCount} episodes created`);

  // ============ ANIME (with seasons + episodes) ============
  const animeData = [
    {
      title: "Attack on Titan",
      description: "Humanity fights for survival against giant humanoid creatures known as Titans. When the walls are breached, a young boy vows to exterminate every last one of them.",
      releaseYear: 2013, language: "Japanese", country: "Japan", rating: 9.0,
      genres: ["Action", "Drama", "Fantasy"],
      seasons: [
        {
          seasonNumber: 1, title: "Season 1", releaseYear: 2013,
          episodes: [
            { num: 1, title: "To You, in 2000 Years", duration: 24 },
            { num: 2, title: "That Day", duration: 24 },
            { num: 3, title: "A Dim Light Amid Despair", duration: 24 },
            { num: 4, title: "The Night of the Closing Ceremony", duration: 24 },
            { num: 5, title: "First Battle", duration: 24 },
          ],
        },
        {
          seasonNumber: 2, title: "Season 2", releaseYear: 2017,
          episodes: [
            { num: 1, title: "Beast Titan", duration: 24 },
            { num: 2, title: "I'm Home", duration: 24 },
            { num: 3, title: "Southwestward", duration: 24 },
            { num: 4, title: "Soldier", duration: 24 },
          ],
        },
      ],
    },
    {
      title: "Demon Slayer",
      description: "A young boy becomes a demon slayer to avenge his family and cure his sister, who has been turned into a demon.",
      releaseYear: 2019, language: "Japanese", country: "Japan", rating: 8.7,
      genres: ["Action", "Supernatural", "Fantasy"],
      seasons: [
        {
          seasonNumber: 1, title: "Kimetsu no Yaiba", releaseYear: 2019,
          episodes: [
            { num: 1, title: "Cruelty", duration: 24 },
            { num: 2, title: "Trainer Sakonji Urokodaki", duration: 24 },
            { num: 3, title: "Sabito and Makomo", duration: 24 },
            { num: 4, title: "Final Selection", duration: 24 },
            { num: 5, title: "My Own Steel", duration: 24 },
          ],
        },
      ],
    },
    {
      title: "Fullmetal Alchemist",
      description: "Two brothers search for the Philosopher's Stone to restore their bodies after a failed alchemical ritual.",
      releaseYear: 2009, language: "Japanese", country: "Japan", rating: 9.1,
      genres: ["Action", "Adventure", "Fantasy"],
      seasons: [
        {
          seasonNumber: 1, title: "Brotherhood", releaseYear: 2009,
          episodes: [
            { num: 1, title: "Fullmetal Alchemist", duration: 24 },
            { num: 2, title: "The First Day", duration: 24 },
            { num: 3, title: "City of Heresy", duration: 24 },
            { num: 4, title: "An Alchemist's Anguish", duration: 24 },
            { num: 5, title: "Rain of Sorrows", duration: 24 },
          ],
        },
      ],
    },
    {
      title: "Death Note",
      description: "A high school student discovers a notebook that can kill anyone whose name is written in it, sparking a battle of wits with the world's greatest detective.",
      releaseYear: 2006, language: "Japanese", country: "Japan", rating: 8.9,
      genres: ["Thriller", "Supernatural", "Mystery"],
      seasons: [
        {
          seasonNumber: 1, title: "Season 1", releaseYear: 2006,
          episodes: [
            { num: 1, title: "Rebirth", duration: 24 },
            { num: 2, title: "Confrontation", duration: 24 },
            { num: 3, title: "Dealings", duration: 24 },
            { num: 4, title: "Pursuit", duration: 24 },
            { num: 5, title: "Tactics", duration: 24 },
          ],
        },
      ],
    },
    {
      title: "One Piece",
      description: "Monkey D. Luffy and his crew of pirates search for the legendary treasure One Piece to become the next Pirate King.",
      releaseYear: 1999, language: "Japanese", country: "Japan", rating: 8.8,
      genres: ["Action", "Adventure", "Comedy"],
      seasons: [
        {
          seasonNumber: 1, title: "East Blue Saga", releaseYear: 1999,
          episodes: [
            { num: 1, title: "I'm Luffy! The Man Who's Gonna Be King of the Pirates!", duration: 24 },
            { num: 2, title: "The Great Swordsman Zoro!", duration: 24 },
            { num: 3, title: "Morgan versus Luffy!", duration: 24 },
            { num: 4, title: "Luffy's Past! The Red-haired Shanks Appears!", duration: 24 },
            { num: 5, title: "Fear, Mysterious Power! Pirate Clown Captain Buggy!", duration: 24 },
          ],
        },
      ],
    },
    {
      title: "My Hero Academia",
      description: "In a world where 80% of the population has superpowers, a powerless boy named Izuku Midoriya dreams of becoming a hero.",
      releaseYear: 2016, language: "Japanese", country: "Japan", rating: 8.3,
      genres: ["Action", "Adventure", "Supernatural"],
      seasons: [
        {
          seasonNumber: 1, title: "Season 1", releaseYear: 2016,
          episodes: [
            { num: 1, title: "Izuku Midoriya: Origin", duration: 24 },
            { num: 2, title: "What It Takes to Be a Hero", duration: 24 },
            { num: 3, title: "Roaring Muscles", duration: 24 },
            { num: 4, title: "Start Line", duration: 24 },
            { num: 5, title: "What I Can Do for Now", duration: 24 },
          ],
        },
      ],
    },
    {
      title: "Jujutsu Kaisen",
      description: "A boy swallows a cursed finger and becomes host to a powerful curse, forcing him into a secret war against the supernatural.",
      releaseYear: 2020, language: "Japanese", country: "Japan", rating: 8.6,
      genres: ["Action", "Supernatural", "Thriller"],
      seasons: [
        {
          seasonNumber: 1, title: "Season 1", releaseYear: 2020,
          episodes: [
            { num: 1, title: "Ryomen Sukuna", duration: 24 },
            { num: 2, title: "For Myself", duration: 24 },
            { num: 3, title: "Girl of Steel", duration: 24 },
            { num: 4, title: "Curse Womb Must Die", duration: 24 },
            { num: 5, title: "Fearsome Womb", duration: 24 },
          ],
        },
      ],
    },
    {
      title: "Steins;Gate",
      description: "A self-proclaimed mad scientist discovers a way to send messages to the past, but each change unravels new consequences.",
      releaseYear: 2011, language: "Japanese", country: "Japan", rating: 9.0,
      genres: ["Sci-Fi", "Thriller", "Drama"],
      seasons: [
        {
          seasonNumber: 1, title: "Season 1", releaseYear: 2011,
          episodes: [
            { num: 1, title: "Turning Point", duration: 24 },
            { num: 2, title: "Time Travel Paranoia", duration: 24 },
            { num: 3, title: "Parallel World Paranoia", duration: 24 },
            { num: 4, title: "Interpreter Rendezvous", duration: 24 },
            { num: 5, title: "Starlight Mayhem", duration: 24 },
          ],
        },
      ],
    },
  ];

  let animeCount = 0;
  let animeSeasonCount = 0;
  let animeEpisodeCount = 0;

  for (const a of animeData) {
    const slug = slugify(a.title);

    const content = await prisma.content.upsert({
      where: { slug },
      update: {},
      create: {
        title: a.title,
        slug,
        description: a.description,
        type: "ANIME",
        releaseYear: a.releaseYear,
        language: a.language,
        country: a.country,
        avgRating: a.rating,
        totalRatings: Math.floor(Math.random() * 2000) + 500,
        totalViews: Math.floor(Math.random() * 50000) + 5000,
        status: "PUBLISHED",
        publishedAt: new Date(),
        genres: { connect: a.genres.map((g) => ({ id: genres[g] })) },
      },
    });

    const seriesRecord = await prisma.series.upsert({
      where: { contentId: content.id },
      update: {},
      create: { contentId: content.id, totalSeasons: a.seasons.length },
    });

    for (const season of a.seasons) {
      const seasonRecord = await prisma.season.upsert({
        where: {
          seriesId_seasonNumber: {
            seriesId: seriesRecord.id,
            seasonNumber: season.seasonNumber,
          },
        },
        update: {},
        create: {
          seriesId: seriesRecord.id,
          seasonNumber: season.seasonNumber,
          title: season.title,
          releaseYear: season.releaseYear,
          status: "PUBLISHED",
        },
      });
      animeSeasonCount++;

      for (const ep of season.episodes) {
        const existing = await prisma.episode.findFirst({
          where: { seasonId: seasonRecord.id, episodeNum: ep.num },
        });
        if (!existing) {
          await prisma.episode.create({
            data: {
              seasonId: seasonRecord.id,
              episodeNum: ep.num,
              title: ep.title,
              description: `Episode ${ep.num} of ${a.title} - ${season.title}`,
              duration: ep.duration,
              status: "PUBLISHED",
            },
          });
          animeEpisodeCount++;
        }
      }
    }
    animeCount++;
  }

  console.log(`✅ ${animeCount} anime created`);
  console.log(`✅ ${animeSeasonCount} anime seasons created`);
  console.log(`✅ ${animeEpisodeCount} anime episodes created`);

  // ============ VIDEO SOURCES ============
  const sampleVideos = [
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
  ];

  const allMovies = await prisma.content.findMany({
    where: { type: "MOVIE", status: "PUBLISHED" },
  });

  let videoSourceCount = 0;
  for (let i = 0; i < allMovies.length; i++) {
    const movie = allMovies[i];
    const videoUrl = sampleVideos[i % sampleVideos.length];

    const existing = await prisma.videoSource.findFirst({
      where: { contentId: movie.id, isDefault: true },
    });

    if (!existing) {
      await prisma.videoSource.create({
        data: {
          contentId: movie.id,
          url: videoUrl,
          quality: "1080p",
          type: "mp4",
          isDefault: true,
        },
      });
      videoSourceCount++;
    }
  }
  console.log(`✅ ${videoSourceCount} movie video sources created`);

  const allEpisodes = await prisma.episode.findMany({
    where: { status: "PUBLISHED" },
  });

  let episodeSourceCount = 0;
  for (let i = 0; i < allEpisodes.length; i++) {
    const episode = allEpisodes[i];
    const videoUrl = sampleVideos[i % sampleVideos.length];

    if (!episode.videoUrl) {
      await prisma.episode.update({
        where: { id: episode.id },
        data: { videoUrl },
      });
      episodeSourceCount++;
    }
  }
  console.log(`✅ ${episodeSourceCount} episode video sources created`);

  // ============ DOWNLOAD OPTIONS ============
  const downloadableContent = await prisma.content.findMany({
    where: {
      status: "PUBLISHED",
      videoSources: { some: {} },
    },
  });

  let downloadOptionCount = 0;
  for (const content of downloadableContent) {
    await prisma.content.update({
      where: { id: content.id },
      data: { downloadEnabled: true },
    });

    const source = await prisma.videoSource.findFirst({
      where: { contentId: content.id, isDefault: true },
    });

    if (source) {
      const qualities = [
        { quality: "480p", size: BigInt(150 * 1024 * 1024) },
        { quality: "720p", size: BigInt(400 * 1024 * 1024) },
        { quality: "1080p", size: BigInt(900 * 1024 * 1024) },
      ];

      for (const q of qualities) {
        const existing = await prisma.downloadOption.findFirst({
          where: { contentId: content.id, quality: q.quality },
        });

        if (!existing) {
          await prisma.downloadOption.create({
            data: {
              contentId: content.id,
              quality: q.quality,
              fileUrl: source.url,
              fileSize: q.size,
              format: "mp4",
              isAvailable: true,
            },
          });
          downloadOptionCount++;
        }
      }
    }
  }
  console.log(`✅ ${downloadOptionCount} download options created`);

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