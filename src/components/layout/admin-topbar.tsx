import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { NotificationBell } from "./notification-bell";
import {
  getUserNotifications,
  getUnreadCount,
} from "@/server/actions/notifications";

interface AdminTopbarProps {
  user: {
    name: string;
    email: string;
    avatarUrl: string | null;
  };
}

export async function AdminTopbar({ user }: AdminTopbarProps) {
  const [notifications, unreadCount] = await Promise.all([
    getUserNotifications(10),
    getUnreadCount(),
  ]);

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-black/60 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 px-4 md:px-6 lg:px-8 h-16 pl-16 lg:pl-8">
        <div className="flex-1 min-w-0">
          <div className="hidden md:block text-sm text-zinc-500">
            Admin Dashboard
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <Link
            href="/"
            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition"
          >
            <ExternalLink size={14} />
            <span className="hidden md:inline">View Site</span>
          </Link>

          {/* ✅ Notification Bell */}
          <NotificationBell
            notifications={notifications}
            unreadCount={unreadCount}
          />

          <div className="flex items-center gap-3 pl-2 md:pl-3 border-l border-white/5">
            <div className="hidden md:block text-right">
              <div className="text-sm font-semibold text-white leading-tight">
                {user.name}
              </div>
              <div className="text-xs text-zinc-500">{user.email}</div>
            </div>
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-yellow-500/40"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-600 flex items-center justify-center text-xs font-black text-black shadow-lg shadow-yellow-500/30">
                {initials}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}