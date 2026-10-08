import Link from "next/link";
import { redirect } from "next/navigation";
import {
  User as UserIcon,
  Mail,
  Calendar,
  Heart,
  Eye,
  Star,
  MessageSquare,
  Download,
  Crown,
  ExternalLink,
} from "lucide-react";
import { getProfileData } from "@/server/actions/profile";
import { ProfileForm } from "@/components/profile/profile-form";
import { PasswordForm } from "@/components/profile/password-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Profile",
  description: "Your MALIX profile",
};

export default async function ProfilePage() {
  const data = await getProfileData();

  if (!data) {
    redirect("/login");
  }

  const { user, profile, stats } = data;

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const statCards = [
    { label: "Watchlist", value: stats.watchlist, icon: Heart, color: "red", href: "/watchlist" },
    { label: "Watch History", value: stats.watchHistory, icon: Eye, color: "blue", href: "/history" },
    { label: "Ratings", value: stats.ratings, icon: Star, color: "gold", href: null },
    { label: "Reviews", value: stats.reviews, icon: MessageSquare, color: "purple", href: null },
    { label: "Downloads", value: stats.downloads, icon: Download, color: "green", href: "/downloads" },
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-12">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-1 h-8 bg-gradient-to-b from-yellow-400 to-amber-600 rounded-full shadow-lg shadow-yellow-500/50" />
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            <span
              style={{
                background:
                  "linear-gradient(135deg, #fde68a 0%, #fbbf24 50%, #f59e0b 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              My Profile
            </span>
          </h1>
          <UserIcon className="text-yellow-500/50" size={28} />
        </div>
        <p className="text-zinc-400 ml-4">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-cosmic rounded-2xl p-6">
            <div className="flex flex-col items-center text-center">
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

              <div className="flex items-center gap-2 mt-4">
                <h2 className="text-xl font-bold text-white">{user.name}</h2>
                {user.role === "ADMIN" && (
                  <Crown size={16} className="text-yellow-400" />
                )}
              </div>

              <div className="flex items-center gap-1.5 text-sm text-zinc-400 mt-1">
                <Mail size={12} />
                {user.email}
              </div>

              {user.role === "ADMIN" && (
                <span className="mt-2 text-[10px] font-bold uppercase tracking-wider text-yellow-400 px-2 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                  Administrator
                </span>
              )}

              <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-3">
                <Calendar size={10} />
                Joined{" "}
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                })}
              </div>

              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-sm font-semibold transition"
                >
                  <ExternalLink size={14} />
                  Admin Dashboard
                </Link>
              )}
            </div>
          </div>

          <div className="glass-cosmic rounded-2xl p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4 pb-3 border-b border-white/5">
              Activity
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {statCards.map((stat) => {
                const CardWrapper: any = stat.href ? Link : "div";
                const cardProps = stat.href ? { href: stat.href } : {};

                return (
                  <CardWrapper
                    key={stat.label}
                    {...cardProps}
                    className={`rounded-xl p-3 border border-white/5 bg-white/5 ${
                      stat.href
                        ? "hover:bg-white/10 hover:border-yellow-500/20 cursor-pointer transition"
                        : ""
                    }`}
                  >
                    <stat.icon
                      size={16}
                      className={`mb-2 ${
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
                    <div className="text-xl font-black text-white">
                      {stat.value}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-zinc-500 mt-0.5">
                      {stat.label}
                    </div>
                  </CardWrapper>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="glass-cosmic rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-white/5">
              <div className="w-1 h-5 rounded-full bg-gradient-to-b from-yellow-400 to-amber-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Edit Profile
              </h3>
            </div>

            <ProfileForm
              initialData={{
                name: user.name,
                avatarUrl: user.avatarUrl,
                bio: profile?.bio || null,
                country: profile?.country || null,
              }}
            />
          </div>

          <div className="glass-cosmic rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-white/5">
              <div className="w-1 h-5 rounded-full bg-gradient-to-b from-yellow-400 to-amber-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Change Password
              </h3>
            </div>

            <PasswordForm />
          </div>
        </div>
      </div>
    </div>
  );
}