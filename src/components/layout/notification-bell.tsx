"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Loader2,
  Film,
  Tv,
  Sparkles,
  Megaphone,
  User as UserIcon,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  markNotificationReadAction,
  markAllReadAction,
  deleteNotificationAction,
} from "@/server/actions/notifications";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  linkUrl: string | null;
  imageUrl: string | null;
  isRead: boolean;
  createdAt: Date;
}

interface NotificationBellProps {
  notifications: Notification[];
  unreadCount: number;
}

const typeIcons: Record<string, typeof Bell> = {
  NEW_CONTENT: Film,
  NEW_EPISODE: Tv,
  ANNOUNCEMENT: Megaphone,
  ACCOUNT: UserIcon,
  SYSTEM: Sparkles,
};

export function NotificationBell({
  notifications: initialNotifications,
  unreadCount: initialUnread,
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnread);
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleMarkRead = (id: string) => {
    startTransition(async () => {
      const result = await markNotificationReadAction(id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      router.refresh();
    });
  };

  const handleMarkAllRead = () => {
    startTransition(async () => {
      const result = await markAllReadAction();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("All marked as read");
      router.refresh();
    });
  };

  const handleDelete = (id: string, wasUnread: boolean) => {
    startTransition(async () => {
      const result = await deleteNotificationAction(id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1));
      router.refresh();
    });
  };

  const timeAgo = (date: Date) => {
    const seconds = Math.floor(
      (Date.now() - new Date(date).getTime()) / 1000
    );
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative w-10 h-10 rounded-lg hover:bg-white/5 flex items-center justify-center transition"
        aria-label="Notifications"
      >
        <Bell size={18} className="text-zinc-400" />
        {unreadCount > 0 && (
          <>
            <span className="absolute top-2 right-2 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center shadow-[0_0_8px_rgba(239,68,68,0.8)]">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          </>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-96 max-w-[90vw] glass-cosmic rounded-2xl shadow-2xl shadow-black/50 border border-yellow-500/20 overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <div>
              <h3 className="text-sm font-bold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-xs text-zinc-500 mt-0.5">
                  {unreadCount} unread
                </p>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={isPending}
                className="text-xs text-yellow-500 hover:text-yellow-400 font-medium flex items-center gap-1 disabled:opacity-50"
              >
                <CheckCheck size={12} />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-10 text-center">
                <Bell size={32} className="text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-500 text-sm">
                  No notifications yet
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {notifications.map((notif) => {
                  const Icon = typeIcons[notif.type] || Bell;

                  const content = (
                    <div
                      className={`flex items-start gap-3 p-4 transition ${
                        !notif.isRead
                          ? "bg-yellow-500/5 hover:bg-yellow-500/10"
                          : "hover:bg-white/5"
                      }`}
                    >
                      {/* Icon */}
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          !notif.isRead
                            ? "bg-yellow-500/20 border border-yellow-500/40"
                            : "bg-white/5 border border-white/10"
                        }`}
                      >
                        <Icon
                          size={16}
                          className={
                            !notif.isRead ? "text-yellow-400" : "text-zinc-500"
                          }
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2">
                          <div
                            className={`text-sm font-semibold line-clamp-1 ${
                              !notif.isRead ? "text-white" : "text-zinc-300"
                            }`}
                          >
                            {notif.title}
                          </div>
                          {!notif.isRead && (
                            <div className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0 mt-1.5 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">
                          {notif.message}
                        </p>
                        <div className="text-[10px] text-zinc-600 mt-1.5 uppercase tracking-wider">
                          {timeAgo(notif.createdAt)}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        {!notif.isRead && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleMarkRead(notif.id);
                            }}
                            disabled={isPending}
                            className="w-7 h-7 rounded-lg hover:bg-emerald-500/10 flex items-center justify-center transition group"
                            title="Mark as read"
                          >
                            <Check
                              size={12}
                              className="text-zinc-500 group-hover:text-emerald-400"
                            />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDelete(notif.id, !notif.isRead);
                          }}
                          disabled={isPending}
                          className="w-7 h-7 rounded-lg hover:bg-red-500/10 flex items-center justify-center transition group"
                          title="Delete"
                        >
                          <Trash2
                            size={12}
                            className="text-zinc-500 group-hover:text-red-400"
                          />
                        </button>
                      </div>
                    </div>
                  );

                  if (notif.linkUrl) {
                    return (
                      <Link
                        key={notif.id}
                        href={notif.linkUrl}
                        onClick={() => {
                          if (!notif.isRead) handleMarkRead(notif.id);
                          setOpen(false);
                        }}
                      >
                        {content}
                      </Link>
                    );
                  }

                  return <div key={notif.id}>{content}</div>;
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-2 border-t border-white/5">
              <Link
                href="/notifications"
                onClick={() => setOpen(false)}
                className="block py-2 text-center text-xs font-bold uppercase tracking-wider text-yellow-400 hover:text-yellow-300 transition"
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}