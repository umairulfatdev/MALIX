interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  action?: { label: string; href: string };
}

export function SectionHeading({
  title,
  subtitle,
  action,
}: SectionHeadingProps) {
  return (
    <div className="flex items-end justify-between mb-6 md:mb-8 px-1">
      <div className="flex items-baseline gap-3">
        <div className="w-1 h-8 bg-gradient-to-b from-red-600 to-red-900 rounded-full" />
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-zinc-500 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
      {action && (
        <a
          href={action.href}
          className="text-sm text-red-500 hover:text-red-400 font-medium transition-colors"
        >
          {action.label} →
        </a>
      )}
    </div>
  );
}