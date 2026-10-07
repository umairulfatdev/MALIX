import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  href?: string;
  color?: "gold" | "blue" | "green" | "red" | "purple";
  subtitle?: string;
}

const colorMap = {
  gold: {
    iconBg: "from-yellow-400 to-amber-600",
    iconText: "text-black",
    glow: "shadow-yellow-500/20",
    accent: "text-yellow-500",
  },
  blue: {
    iconBg: "from-blue-400 to-blue-600",
    iconText: "text-white",
    glow: "shadow-blue-500/20",
    accent: "text-blue-500",
  },
  green: {
    iconBg: "from-emerald-400 to-emerald-600",
    iconText: "text-black",
    glow: "shadow-emerald-500/20",
    accent: "text-emerald-500",
  },
  red: {
    iconBg: "from-red-400 to-red-600",
    iconText: "text-white",
    glow: "shadow-red-500/20",
    accent: "text-red-500",
  },
  purple: {
    iconBg: "from-purple-400 to-purple-600",
    iconText: "text-white",
    glow: "shadow-purple-500/20",
    accent: "text-purple-500",
  },
};

export function StatCard({
  label,
  value,
  icon: Icon,
  href,
  color = "gold",
  subtitle,
}: StatCardProps) {
  const c = colorMap[color];

  const card = (
    <div
      className={cn(
        "relative glass-cosmic rounded-2xl p-5 transition-all duration-300 overflow-hidden group",
        href && "hover:border-yellow-500/40 cursor-pointer",
        c.glow
      )}
    >
      {/* Background glow */}
      <div
        className={cn(
          "absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-3xl",
          `bg-gradient-to-br ${c.iconBg}`
        )}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
            {label}
          </p>
          <p className="text-3xl md:text-4xl font-black text-white leading-none">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {subtitle && (
            <p className="text-xs text-zinc-500 mt-2">{subtitle}</p>
          )}
        </div>

        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
            `bg-gradient-to-br ${c.iconBg}`,
            `shadow-lg ${c.glow}`
          )}
        >
          <Icon size={22} className={c.iconText} />
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{card}</Link>;
  }

  return card;
}