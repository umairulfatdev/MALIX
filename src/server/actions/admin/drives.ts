"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createDrive(formData: FormData) {
  await prisma.drive.create({
    data: {
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || null,
      driveType: (formData.get("driveType") as string) || "google",
      rootFolderId: (formData.get("rootFolderId") as string) || null,
      totalSpace: formData.get("totalSpace")
        ? parseFloat(formData.get("totalSpace") as string)
        : null,
      isActive: formData.get("isActive") === "true",
    },
  });
  revalidatePath("/admin/drives");
}

export async function updateDrive(id: string, formData: FormData) {
  await prisma.drive.update({
    where: { id },
    data: {
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || null,
      driveType: (formData.get("driveType") as string) || "google",
      rootFolderId: (formData.get("rootFolderId") as string) || null,
      totalSpace: formData.get("totalSpace")
        ? parseFloat(formData.get("totalSpace") as string)
        : null,
      isActive: formData.get("isActive") === "true",
    },
  });
  revalidatePath("/admin/drives");
}

export async function deleteDrive(id: string) {
  await prisma.drive.delete({ where: { id } });
  revalidatePath("/admin/drives");
}

export async function toggleDriveStatus(id: string, isActive: boolean) {
  await prisma.drive.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/drives");
}