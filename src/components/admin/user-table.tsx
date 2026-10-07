"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Shield,
  ShieldOff,
  Loader2,
  Crown,
  User as UserIcon,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import {
  toggleUserActiveAction,
  changeUserRoleAction,
} from "@/server/actions/admin/users";

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: "USER" | "ADMIN";
  isActive: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
  _count: {
    watchlist: number;
    watchHistory: number;
    ratings: number;
    reviews: number;
    downloads: number;
  };
}

export function UserTable({ users }: { users: User[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleToggleActive = (id: string) => {
    setPendingId(id);
    startTransition(async () => {
      const result = await toggleUserActiveAction(id);
      setPendingId(null);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(result.isActive ? "User activated" : "User deactivated");
      router.refresh();
    });
  };

  const handleChangeRole = (id: string, newRole: "USER" | "ADMIN") => {
    setPendingId(id);
    startTransition(async () => {
      const result = await changeUserRoleAction(id, newRole);
      setPendingId(null);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(`Role changed to ${newRole}`);
      router.refresh();
    });
  };

  if (users.length === 0) {
    return (
      <div className="glass-cosmic rounded-2xl p-12 text-center">
        <p className="text-zinc-400 text-sm">No users found</p>
      </div>
    );
  }

  return (
    <div className="glass-cosmic rounded-2xl overflow-hidden">
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-white/5">
            <tr className="text-left">
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                User
              </th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Role
              </th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Activity
              </th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Joined
              </th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Status
              </th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((user) => {
              const initials = user.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();

              return (
                <tr
                  key={user.id}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {user.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-600 flex items-center justify-center text-xs font-black text-black flex-shrink-0">
                          {initials}
                        </div>
                      )}
                      <div className="min-w-0">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="text-sm font-semibold text-white hover:text-yellow-400 truncate block"
                        >
                          {user.name}
                        </Link>
                        <div className="text-xs text-zinc-500 truncate">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    {user.role === "ADMIN" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-yellow-400 px-2 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                        <Crown size={10} />
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-2 py-1 rounded-full bg-white/5 border border-white/10">
                        <UserIcon size={10} />
                        User
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                      <span title="Watchlist">❤️ {user._count.watchlist}</span>
                      <span title="Watch History">👁️ {user._count.watchHistory}</span>
                      <span title="Reviews">💬 {user._count.reviews}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span className="text-xs text-zinc-400">
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    {user.isActive ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-400 px-2 py-1 rounded-full bg-red-500/10 border border-red-500/20">
                        Inactive
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {user.role === "ADMIN" ? (
                        <button
                          onClick={() => handleChangeRole(user.id, "USER")}
                          disabled={pendingId === user.id}
                          className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center transition group"
                          title="Remove admin"
                        >
                          <ShieldOff
                            size={14}
                            className="text-zinc-500 group-hover:text-red-400"
                          />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleChangeRole(user.id, "ADMIN")}
                          disabled={pendingId === user.id}
                          className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center transition group"
                          title="Make admin"
                        >
                          <Shield
                            size={14}
                            className="text-zinc-500 group-hover:text-yellow-400"
                          />
                        </button>
                      )}

                      <button
                        onClick={() => handleToggleActive(user.id)}
                        disabled={pendingId === user.id}
                        className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center transition group"
                        title={user.isActive ? "Deactivate" : "Activate"}
                      >
                        {pendingId === user.id ? (
                          <Loader2
                            size={14}
                            className="animate-spin text-yellow-500"
                          />
                        ) : user.isActive ? (
                          <EyeOff
                            size={14}
                            className="text-zinc-500 group-hover:text-red-400"
                          />
                        ) : (
                          <Eye
                            size={14}
                            className="text-zinc-500 group-hover:text-emerald-400"
                          />
                        )}
                      </button>

                      <Link
                        href={`/admin/users/${user.id}`}
                        className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center transition group"
                        title="View details"
                      >
                        <ExternalLink
                          size={14}
                          className="text-zinc-500 group-hover:text-yellow-400"
                        />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="md:hidden divide-y divide-white/5">
        {users.map((user) => {
          const initials = user.name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();

          return (
            <div key={user.id} className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-600 flex items-center justify-center text-sm font-black text-black">
                    {initials}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">
                    {user.name}
                  </div>
                  <div className="text-xs text-zinc-500 truncate">
                    {user.email}
                  </div>
                </div>
                {user.role === "ADMIN" && (
                  <Crown size={16} className="text-yellow-400" />
                )}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    user.isActive
                      ? "text-emerald-400 bg-emerald-500/10"
                      : "text-red-400 bg-red-500/10"
                  }`}
                >
                  {user.isActive ? "Active" : "Inactive"}
                </span>
                <Link
                  href={`/admin/users/${user.id}`}
                  className="text-xs text-yellow-400 hover:text-yellow-300 font-medium"
                >
                  View Details →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}