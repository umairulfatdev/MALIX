"use server";

import { redirect } from "next/navigation";
import { destroySession, getCurrentUser } from "@/lib/auth";

export async function fetchCurrentUser() {
  return await getCurrentUser();
}

export async function userLogoutAction() {
  await destroySession();
  redirect("/login");
}