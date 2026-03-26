import Link from "next/link";
import { QuickAction } from "../data/quick-action";

type QuickActionCardProps = QuickAction;

export function QuickActionCard({
  title,
  description,
  gradient,
  href,
}: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className="group relative flex items-start gap-4 rounded-2xl border border-black/[0.06] bg-black/[0.02] p-4 transition-all duration-300 hover:bg-black/[0.04] hover:border-black/[0.10] overflow-hidden"
    >
      {/* Subtle glow on hover */}
      <div
        className={`pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 bg-gradient-to-br ${gradient} scale-150 blur-2xl`}
        aria-hidden
      />

      {/* Gradient Icon Box */}
      <div
        className={`relative z-10 h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br ${gradient} shadow-sm group-hover:scale-105 transition-transform duration-300`}
      />

      {/* Text */}
      <div className="relative z-10 space-y-1 min-w-0">
        <h3 className="text-sm font-semibold leading-snug tracking-tight text-neutral-800 group-hover:text-neutral-950 transition-colors duration-200">
          {title}
        </h3>
        <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed group-hover:text-neutral-500 transition-colors duration-200">
          {description}
        </p>
      </div>

      {/* Arrow indicator */}
      <div className="relative z-10 ml-auto shrink-0 self-center opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-200 text-neutral-400">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M2 7h10M8 3l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </Link>
  );
}
