"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

async function requireAdminAction() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }
  return user;
}

// ============================================================
// GET ALL USERS
// ============================================================

export async function getAdminUsers(params: {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  perPage?: number;
}) {
  try {
    await requireAdminAction();
  } catch {
    return { users: [], total: 0, page: 1, totalPages: 0 };
  }

  const { search, role, status, page = 1, perPage = 20 } = params;

  const where: any = {};

  if (search && search.trim()) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  if (role && role !== "ALL") {
    where.role = role;
  }

  if (status === "ACTIVE") {
    where.isActive = true;
  } else if (status === "INACTIVE") {
    where.isActive = false;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            watchlist: true,
            watchHistory: true,
            ratings: true,
            reviews: true,
            downloads: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    total,
    page,
    totalPages: Math.ceil(total / perPage),
  };
}

// ============================================================
// GET SINGLE USER DETAILS
// ============================================================

export async function getAdminUserDetails(userId: string) {
  try {
    await requireAdminAction();
  } catch {
    return null;
  }

  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true,
      profile: true,
      _count: {
        select: {
          watchlist: true,
          watchHistory: true,
          ratings: true,
          reviews: true,
          downloads: true,
        },
      },
    },
  });
}

// ============================================================
// TOGGLE USER ACTIVE
// ============================================================

export async function toggleUserActiveAction(userId: string) {
  try {
    const admin = await requireAdminAction();

    if (admin.id === userId) {
      return { error: "You cannot deactivate your own account" };
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { error: "User not found" };

    await prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
    });

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${userId}`);

    return {
      success: true,
      isActive: !user.isActive,
    };
  } catch (error) {
    console.error("Toggle user active error:", error);
    return { error: "Failed to update user" };
  }
}

// ============================================================
// CHANGE USER ROLE
// ============================================================

export async function changeUserRoleAction(
  userId: string,
  newRole: "USER" | "ADMIN"
) {
  try {
    const admin = await requireAdminAction();

    if (admin.id === userId) {
      return { error: "You cannot change your own role" };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${userId}`);

    return { success: true, role: newRole };
  } catch (error) {
    console.error("Change user role error:", error);
    return { error: "Failed to change role" };
  }
}

// ============================================================
// DELETE USER
// ============================================================

export async function deleteUserAction(userId: string) {
  try {
    const admin = await requireAdminAction();

    if (admin.id === userId) {
      return { error: "You cannot delete your own account" };
    }

    await prisma.user.delete({ where: { id: userId } });

    revalidatePath("/admin/users");

    return { success: true };
  } catch (error) {
    console.error("Delete user error:", error);
    return { error: "Failed to delete user" };
  }
}

// ============================================================
// GET USER STATS
// ============================================================

export async function getAdminUserStats() {
  try {
    await requireAdminAction();
  } catch {
    return null;
  }

  const [
    total,
    admins,
    active,
    inactive,
    recent,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({ where: { isActive: false } }),
    prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),
  ]);

  return { total, admins, active, inactive, recent };
}