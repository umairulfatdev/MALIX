import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import DriveForm from "@/components/admin/drive-form";
import { updateDrive } from "@/server/actions/admin/drives";

export default async function EditDrivePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const drive = await prisma.drive.findUnique({ where: { id } });
  if (!drive) notFound();

  const action = async (formData: FormData) => {
    "use server";
    await updateDrive(id, formData);
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Edit Drive</h1>
      <DriveForm action={action} defaultValues={drive} />
    </div>
  );
}