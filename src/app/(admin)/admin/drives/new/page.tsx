import DriveForm from "@/components/admin/drive-form";
import { createDrive } from "@/server/actions/admin/drives";

export default function NewDrivePage() {
  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Add New Drive</h1>
      <DriveForm action={createDrive} />
    </div>
  );
}