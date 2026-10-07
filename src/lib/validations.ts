import { z } from "zod";

// ---------- Auth ----------
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(80, "Name too long"),
    email: z.string().email("Please enter a valid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password too long"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

// ---------- Content ----------
export const contentSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().min(1, "Description is required"),
  shortDesc: z.string().max(500).optional(),
  type: z.enum([
    "MOVIE",
    "DRAMA",
    "SERIES",
    "DOCUMENTARY",
    "SHORT_FILM",
    "TRAILER",
  ]),
  releaseYear: z.coerce
    .number()
    .int()
    .min(1900)
    .max(2100)
    .optional()
    .or(z.literal("")),
  language: z.string().optional(),
  country: z.string().optional(),
  duration: z.coerce.number().int().min(1).optional().or(z.literal("")),
  posterUrl: z.string().url().optional().or(z.literal("")),
  backdropUrl: z.string().url().optional().or(z.literal("")),
  trailerUrl: z.string().url().optional().or(z.literal("")),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  isFeatured: z.boolean().default(false),
});

// ---------- Rating ----------
export const ratingSchema = z.object({
  contentId: z.string(),
  score: z.number().int().min(1).max(5),
});

// ---------- Review ----------
export const reviewSchema = z.object({
  contentId: z.string(),
  title: z.string().max(120).optional(),
  body: z.string().min(10, "Review must be at least 10 characters").max(5000),
});