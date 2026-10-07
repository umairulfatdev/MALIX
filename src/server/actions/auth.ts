"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  createSession,
  destroySession,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import { loginSchema, registerSchema } from "@/lib/validations";

export type AuthActionState = {
  error?: string;
  success?: boolean;
};

// ---------- Register ----------
export async function registerAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { name, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existing) {
    return { error: "An account with this email already exists" };
  }

  try {
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        profile: { create: {} },
      },
    });

    await createSession({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error("Register error:", err);
    return { error: "Something went wrong. Please try again." };
  }

  redirect("/");
}

// ---------- Login ----------
export async function loginAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  try {
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return { error: "Invalid email or password" };
    }

    if (!user.isActive) {
      return { error: "Your account has been disabled. Contact support." };
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return { error: "Invalid email or password" };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await createSession({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error("Login error:", err);
    return { error: "Something went wrong. Please try again." };
  }

  redirect("/");
}

// ---------- Logout ----------
export async function logoutAction() {
  await destroySession();
  redirect("/login");
}