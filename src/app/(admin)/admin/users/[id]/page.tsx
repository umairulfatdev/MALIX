import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Crown,
  User as UserIcon,
  Calendar,
  Clock,
  Heart,
  Eye,
  MessageSquare,
  Download,
  Star,
  Mail,
} from "lucide-react";
import { getAdminUserDetails } from "@/server/actions/admin/users";

export const metadata = { title: "User Details" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function UserDetailsPage({ params }: Props) {
  const { id } = await params;
  const user = await getAdminUserDetails(id);

  if (!user) {
    notFound();
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const stats = [
    { label: "Watchlist", value: user._count.watchlist, icon: Heart, color: "red" },
    { label: "Watch History", value: user._count.watchHistory, icon: Eye, color: "blue" },
    { label: "Ratings", value: user._count.ratings, icon: Star, color: "gold" },
    { label: "Reviews", value: user._count.reviews, icon: MessageSquare, color: "purple" },
    { label: "Downloads", value: user._count.downloads, icon: Download, color: "green" },
  ];

  return (
    <div className="space-y-6 max-w-[1200px]">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/users"
          className="w-10 h-10 rounded-lg glass-cosmic flex items-center justify-center hover:border-yellow-500/40 transition"
        >
          <ArrowLeft size={18} className="text-zinc-300" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">User Details</h1>
          <p className="text-sm text-zinc-500">View full profile and activity</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="glass-cosmic rounded-2xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-24 h-24 rounded-2xl object-cover ring-2 ring-yellow-500/40"
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-600 flex items-center justify-center text-3xl font-black text-black shadow-lg shadow-yellow-500/30">
              {initials}
            </div>
          )}

          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                {user.name}
              </h2>
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
              {user.isActive ? (
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  Active
                </span>
              ) : (
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 px-2 py-1 rounded-full bg-red-500/10 border border-red-500/20">
                  Inactive
                </span>
              )}
            </div>

            <div className="space-y-1.5 text-sm">
              <div className="flex items-center gap-2 text-zinc-400">
                <Mail size={14} className="text-zinc-500" />
                {user.email}
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <Calendar size={14} className="text-zinc-500" />
                Joined{" "}
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              {user.lastLoginAt && (
                <div className="flex items-center gap-2 text-zinc-400">
                  <Clock size={14} className="text-zinc-500" />
                  Last login{" "}
                  {new Date(user.lastLoginAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              )}
            </div>

            {user.profile?.bio && (
              <p className="mt-4 text-sm text-zinc-300 leading-relaxed">
                {user.profile.bio}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Activity Stats */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-4">
          Activity Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="glass-cosmic rounded-xl p-4 text-center"
            >
              <stat.icon
                size={20}
                className={`mx-auto mb-2 ${
                  stat.color === "gold"
                    ? "text-yellow-400"
                    : stat.color === "red"
                      ? "text-red-400"
                      : stat.color === "blue"
                        ? "text-blue-400"
                        : stat.color === "green"
                          ? "text-emerald-400"
                          : "text-purple-400"
                }`}
              />
              <div className="text-2xl font-black text-white">
                {stat.value}
              </div>
              <div className="text-xs text-zinc-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}