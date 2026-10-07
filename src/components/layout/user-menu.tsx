"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  User as UserIcon,
  Heart,
  Clock,
  LogOut,
  LayoutDashboard,
  Loader2,
} from "lucide-react";
import { userLogoutAction } from "@/server/actions/user";

interface UserMenuProps {
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    role: "USER" | "ADMIN";
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const [open, setOpen] = useState(false);
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

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogout = () => {
    startTransition(async () => {
      await userLogoutAction();
      router.push("/login");
      router.refresh();
    });
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-1 pr-2 rounded-full hover:bg-white/5 transition-colors"
      >
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-yellow-500/40"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-600 flex items-center justify-center text-xs font-black text-black ring-2 ring-yellow-500/40">
            {initials}
          </div>
        )}
        <ChevronDown
          size={14}
          className={`text-zinc-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 glass-cosmic rounded-xl shadow-2xl shadow-black/50 border border-yellow-500/20 overflow-hidden animate-fade-in z-50">
          <div className="p-4 border-b border-white/5">
            <p className="font-semibold text-white text-sm truncate">
              {user.name}
            </p>
            <p className="text-xs text-zinc-500 truncate">{user.email}</p>
          </div>

          <div className="py-2">
            <MenuLink href="/profile" icon={UserIcon} label="Profile" />
            <MenuLink href="/watchlist" icon={Heart} label="Watchlist" />
            <MenuLink href="/history" icon={Clock} label="Watch History" />
            {user.role === "ADMIN" && (
              <MenuLink
                href="/admin"
                icon={LayoutDashboard}
                label="Admin Dashboard"
              />
            )}
          </div>

          <div className="border-t border-white/5 p-2">
            <button
              onClick={handleLogout}
              disabled={isPending}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Signing out...
                </>
              ) : (
                <>
                  <LogOut size={16} />
                  Sign Out
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof UserIcon;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
    >
      <Icon size={16} className="text-zinc-500" />
      {label}
    </Link>
  );
}