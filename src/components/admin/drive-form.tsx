"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

type Drive = {
  id: string;
  name: string;
  description: string | null;
  driveType: string;
  rootFolderId: string | null;
  totalSpace: number | null;
  isActive: boolean;
};

export default function DriveForm({
  action,
  defaultValues,
}: {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: Drive;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await action(formData);
      router.push("/admin/drives");
      router.refresh();
    });
  };

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1 text-white">Name *</label>
        <input
          name="name"
          required
          defaultValue={defaultValues?.name}
          className="w-full px-3 py-2 border rounded-md bg-white text-black placeholder:text-zinc-400"
          placeholder="Google Drive #1"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-white">Description</label>
        <textarea
          name="description"
          defaultValue={defaultValues?.description ?? ""}
          className="w-full px-3 py-2 border rounded-md bg-white text-black placeholder:text-zinc-400"
          rows={3}
          placeholder="15GB free account"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-white">Drive Type</label>
          <select
            name="driveType"
            defaultValue={defaultValues?.driveType ?? "google"}
            className="w-full px-3 py-2 border rounded-md bg-white text-black"
          >
            <option value="google">Google Drive</option>
            <option value="dropbox">Dropbox</option>
            <option value="onedrive">OneDrive</option>
            <option value="mega">Mega</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-white">
            Total Space (GB)
          </label>
          <input
            name="totalSpace"
            type="number"
            step="0.1"
            defaultValue={defaultValues?.totalSpace ?? ""}
            className="w-full px-3 py-2 border rounded-md bg-white text-black placeholder:text-zinc-400"
            placeholder="15"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-white">
          Root Folder ID (optional)
        </label>
        <input
          name="rootFolderId"
          defaultValue={defaultValues?.rootFolderId ?? ""}
          className="w-full px-3 py-2 border rounded-md bg-white text-black placeholder:text-zinc-400"
          placeholder="1AbC...xyz"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="isActive"
          value="true"
          defaultChecked={defaultValues?.isActive ?? true}
          id="isActive"
          className="w-4 h-4 accent-yellow-500"
        />
        <label htmlFor="isActive" className="text-sm text-white font-medium">
          Active
        </label>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-md disabled:opacity-50 transition-colors"
      >
        {pending ? "Saving..." : defaultValues ? "Update Drive" : "Create Drive"}
      </button>
    </form>
  );
}