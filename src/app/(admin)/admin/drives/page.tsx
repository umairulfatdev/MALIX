import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { deleteDrive, toggleDriveStatus } from "@/server/actions/admin/drives";

export default async function DrivesPage() {
  const drives = await prisma.drive.findMany({
    include: { _count: { select: { contents: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Drives</h1>
          <p className="text-sm text-muted-foreground">
            Manage Google Drives for video storage
          </p>
        </div>
        <Link
          href="/admin/drives/new"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          + Add Drive
        </Link>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Contents</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {drives.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted-foreground">
                  No drives yet. Add your first drive.
                </td>
              </tr>
            )}
            {drives.map((drive) => (
              <tr key={drive.id} className="border-t">
                <td className="p-3">
                  <div className="font-medium">{drive.name}</div>
                  {drive.description && (
                    <div className="text-xs text-muted-foreground">
                      {drive.description}
                    </div>
                  )}
                </td>
                <td className="p-3 capitalize">{drive.driveType}</td>
                <td className="p-3">{drive._count.contents}</td>
                <td className="p-3">
                  <form
                    action={async () => {
                      "use server";
                      await toggleDriveStatus(drive.id, !drive.isActive);
                    }}
                  >
                    <button
                      type="submit"
                      className={`px-2 py-1 rounded text-xs ${
                        drive.isActive
                          ? "bg-green-500/20 text-green-500"
                          : "bg-red-500/20 text-red-500"
                      }`}
                    >
                      {drive.isActive ? "Active" : "Inactive"}
                    </button>
                  </form>
                </td>
                <td className="p-3 text-right space-x-2">
                  <Link
                    href={`/admin/drives/${drive.id}/edit`}
                    className="text-sm text-blue-500 hover:underline"
                  >
                    Edit
                  </Link>
                  <form
                    action={async () => {
                      "use server";
                      await deleteDrive(drive.id);
                    }}
                    className="inline"
                  >
                    <button
                      type="submit"
                      className="text-sm text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
