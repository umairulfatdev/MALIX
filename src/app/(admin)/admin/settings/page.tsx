import {
  Settings as SettingsIcon,
  Globe,
  Shield,
  Bell,
  Database,
  Sparkles,
  ExternalLink,
  Info,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const user = await getCurrentUser();

  return (
    <div className="space-y-6 max-w-[1200px]">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-400 to-zinc-600 flex items-center justify-center shadow-lg shadow-zinc-500/30">
          <SettingsIcon size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white">
            Settings
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Platform configuration and information
          </p>
        </div>
      </div>

      {/* Platform Info */}
      <div className="glass-cosmic rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5 pb-3 border-b border-white/5">
          <Info size={16} className="text-yellow-500" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">
            Platform Information
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoRow label="Platform Name" value="MALIX" />
          <InfoRow label="Tagline" value="Watch. Discover. Enjoy." />
          <InfoRow label="Version" value="1.0.0" />
          <InfoRow label="Environment" value="Development" />
          <InfoRow label="Database" value="PostgreSQL" />
          <InfoRow label="Framework" value="Next.js 15" />
        </div>
      </div>

      {/* Admin Account */}
      <div className="glass-cosmic rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5 pb-3 border-b border-white/5">
          <Shield size={16} className="text-blue-500" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">
            Admin Account
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoRow label="Name" value={user?.name || "—"} />
          <InfoRow label="Email" value={user?.email || "—"} />
          <InfoRow label="Role" value={user?.role || "—"} />
          <InfoRow
            label="Member Since"
            value={
              user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "—"
            }
          />
        </div>
      </div>

      {/* Configuration Links */}
      <div className="glass-cosmic rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5 pb-3 border-b border-white/5">
          <Database size={16} className="text-emerald-500" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">
            System Configuration
          </h2>
        </div>

        <div className="space-y-3">
          <SettingRow
            icon={Globe}
            title="Content Management"
            description="Manage movies, dramas, series, and anime"
            action="Go to Content"
            href="/admin/movies"
          />
          <SettingRow
            icon={Shield}
            title="User Management"
            description="Manage users, roles, and permissions"
            action="Go to Users"
            href="/admin/users"
          />
          <SettingRow
            icon={Bell}
            title="Notifications"
            description="Send broadcast notifications to all users"
            action="Coming Soon"
            disabled
          />
          <SettingRow
            icon={Sparkles}
            title="Featured Content"
            description="Manage homepage featured content"
            action="Coming Soon"
            disabled
          />
        </div>
      </div>

      {/* About */}
      <div className="glass-cosmic rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5 pb-3 border-b border-white/5">
          <Info size={16} className="text-yellow-500" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">
            About MALIX
          </h2>
        </div>

        <p className="text-sm text-zinc-400 leading-relaxed mb-4">
          MALIX is a modern streaming platform for Movies, Dramas, Series, and
          Anime. Built with Next.js 15, TypeScript, Tailwind CSS, PostgreSQL,
          and Prisma ORM. Only legally authorized content is hosted on this
          platform.
        </p>

        <div className="flex flex-wrap gap-2">
          {[
            "Next.js 15",
            "TypeScript",
            "Tailwind CSS",
            "PostgreSQL",
            "Prisma ORM",
            "React 19",
          ].map((tech) => (
            <span
              key={tech}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 border border-white/10 text-zinc-300"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 px-3 rounded-lg bg-white/5">
      <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">
        {label}
      </span>
      <span className="text-sm text-white font-medium truncate">{value}</span>
    </div>
  );
}

function SettingRow({
  icon: Icon,
  title,
  description,
  action,
  href,
  disabled,
}: {
  icon: typeof Globe;
  title: string;
  description: string;
  action: string;
  href?: string;
  disabled?: boolean;
}) {
  const content = (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-yellow-500/20 transition group">
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500/20 to-amber-600/10 border border-yellow-500/30 flex items-center justify-center flex-shrink-0">
        <Icon size={18} className="text-yellow-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-white">{title}</div>
        <div className="text-xs text-zinc-500 mt-0.5">{description}</div>
      </div>
      <div
        className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
          disabled
            ? "text-zinc-600"
            : "text-yellow-400 group-hover:text-yellow-300"
        }`}
      >
        {action}
        {!disabled && <ExternalLink size={10} />}
      </div>
    </div>
  );

  if (disabled || !href) {
    return <div className="opacity-50 cursor-not-allowed">{content}</div>;
  }

  return <a href={href}>{content}</a>;
}