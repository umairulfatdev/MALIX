"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth";

// ============================================================
// UPDATE PROFILE
// ============================================================

export interface ProfileFormState {
  error?: string;
  success?: boolean;
}

export async function updateProfileAction(
  _prev: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in" };

  const name = (formData.get("name") as string)?.trim();
  const avatarUrl = (formData.get("avatarUrl") as string)?.trim() || null;
  const bio = (formData.get("bio") as string)?.trim() || null;
  const country = (formData.get("country") as string)?.trim() || null;

  if (!name || name.length < 2) {
    return { error: "Name must be at least 2 characters" };
  }
  if (name.length > 80) {
    return { error: "Name is too long" };
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { name, avatarUrl },
    });

    // Update or create profile
    await prisma.profile.upsert({
      where: { userId: user.id },
      update: { bio, country },
      create: { userId: user.id, bio, country },
    });

    revalidatePath("/profile");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Update profile error:", error);
    return { error: "Failed to update profile" };
  }
}

// ============================================================
// CHANGE PASSWORD
// ============================================================

export async function changePasswordAction(
  _prev: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in" };

  const currentPassword = (formData.get("currentPassword") as string) || "";
  const newPassword = (formData.get("newPassword") as string) || "";
  const confirmPassword = (formData.get("confirmPassword") as string) || "";

  if (!currentPassword) {
    return { error: "Current password is required" };
  }
  if (newPassword.length < 8) {
    return { error: "New password must be at least 8 characters" };
  }
  if (newPassword !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) return { error: "User not found" };

    const valid = await verifyPassword(currentPassword, dbUser.passwordHash);
    if (!valid) {
      return { error: "Current password is incorrect" };
    }

    const newHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    return { success: true };
  } catch (error) {
    console.error("Change password error:", error);
    return { error: "Failed to change password" };
  }
}

// ============================================================
// GET PROFILE DATA
// ============================================================

export async function getProfileData() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [profile, stats] = await Promise.all([
    prisma.profile.findUnique({
      where: { userId: user.id },
    }),
    Promise.all([
      prisma.watchlist.count({ where: { userId: user.id } }),
      prisma.watchHistory.count({ where: { userId: user.id } }),
      prisma.rating.count({ where: { userId: user.id } }),
      prisma.review.count({ where: { userId: user.id } }),
      prisma.downloadHistory.count({ where: { userId: user.id } }),
    ]),
  ]);

  return {
    user,
    profile,
    stats: {
      watchlist: stats[0],
      watchHistory: stats[1],
      ratings: stats[2],
      reviews: stats[3],
      downloads: stats[4],
    },
  };
}