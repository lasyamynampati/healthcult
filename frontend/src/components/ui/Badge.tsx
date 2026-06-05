import { type HTMLAttributes } from "react";

type RiskBand = "low" | "moderate" | "high";
type BadgeVariant = "risk" | "info" | "neutral" | "brand";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  band?: RiskBand;   // use when variant="risk"
  size?: "sm" | "md";
  icon?: React.ReactNode;
  dot?: boolean;
}

// Risk band — never color-only: always has icon + label
const riskConfig: Record<RiskBand, { classes: string; icon: string; label: string }> = {
  low: {
    classes: "bg-risk-low-bg text-risk-low ring-1 ring-risk-low-ring",
    icon: "✓",
    label: "Low Risk",
  },
  moderate: {
    classes: "bg-risk-mod-bg text-risk-mod ring-1 ring-risk-mod-ring",
    icon: "⚠",
    label: "Moderate Risk",
  },
  high: {
    classes: "bg-risk-high-bg text-risk-high ring-1 ring-risk-high-ring",
    icon: "!",
    label: "High Risk",
  },
};

const variantClasses: Record<BadgeVariant, string> = {
  risk:    "", // handled via riskConfig
  info:    "bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-700",
  neutral: "bg-[var(--surface-overlay)] text-[var(--text-secondary)] ring-1 ring-[var(--border)]",
  brand:   "bg-[var(--brand-light)] text-[var(--brand)] ring-1 ring-[var(--brand-ring)]",
};

const sizeClasses = {
  sm: "px-2 py-0.5 text-xs gap-1",
  md: "px-2.5 py-1 text-xs gap-1.5",
};

export function Badge({
  variant = "neutral",
  band,
  size = "md",
  icon,
  dot,
  className = "",
  children,
  ...rest
}: BadgeProps) {
  const isRisk = variant === "risk" && band;
  const config = isRisk ? riskConfig[band!] : null;

  const baseClasses = isRisk ? config!.classes : variantClasses[variant];
  const displayIcon = isRisk ? config!.icon : icon;
  const displayLabel = isRisk ? config!.label : children;

  return (
    <span
      role="status"
      className={[
        "inline-flex items-center rounded-full font-semibold tracking-wide",
        baseClasses,
        sizeClasses[size],
        className,
      ].join(" ")}
      {...rest}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full bg-current shrink-0"
          aria-hidden="true"
        />
      )}
      {displayIcon && !dot && (
        <span className="shrink-0 text-[0.65rem] font-bold" aria-hidden="true">
          {displayIcon}
        </span>
      )}
      {displayLabel}
    </span>
  );
}
