import { Link } from "@tanstack/react-router";

import { APP } from "@/config/app";
import { cn } from "@/lib/utils";

interface LogoProps {
  to?: string;
  compact?: boolean;
  className?: string;
  subtitle?: string;
}

export function Logo({ to = "/", compact = false, className, subtitle }: LogoProps) {
  return (
    <Link to={to} className={cn("group flex items-center gap-2.5", className)}>
      <span className="relative grid size-9 place-items-center rounded-lg bg-gradient-primary text-primary-foreground shadow-glow">
        <span className="font-display text-base font-bold leading-none">A</span>
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-lg font-semibold tracking-tight">{APP.name}</span>
          {subtitle && (
            <span className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {subtitle}
            </span>
          )}
        </span>
      )}
    </Link>
  );
}
