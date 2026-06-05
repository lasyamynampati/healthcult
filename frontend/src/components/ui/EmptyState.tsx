import { type ReactNode } from "react";
import { Button } from "./Button";

interface EmptyStateProps {
  icon?: ReactNode;
  heading: string;
  description?: string;
  cta?: { label: string; onClick?: () => void; href?: string };
  className?: string;
}

// Default icon — clipboard with empty lines
function DefaultIcon() {
  return (
    <svg
      width="48" height="48" viewBox="0 0 48 48"
      fill="none" aria-hidden="true"
      className="text-[var(--text-muted)]"
    >
      <rect x="10" y="8" width="28" height="34" rx="4"
        stroke="currentColor" strokeWidth="2" fill="none" />
      <rect x="18" y="4" width="12" height="6" rx="2"
        stroke="currentColor" strokeWidth="2" fill="none" />
      <line x1="16" y1="20" x2="32" y2="20"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="16" y1="26" x2="28" y2="26"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="16" y1="32" x2="24" y2="32"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function EmptyState({
  icon,
  heading,
  description,
  cta,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={[
        "flex flex-col items-center justify-center gap-4 py-16 px-6 text-center",
        "rounded-2xl border border-dashed border-[var(--border)]",
        "bg-[var(--surface-overlay)]",
        className,
      ].join(" ")}
      role="status"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--surface-raised)] shadow-card">
        {icon ?? <DefaultIcon />}
      </div>
      <div className="flex flex-col gap-1.5 max-w-xs">
        <h3 className="text-base font-semibold text-[var(--text-primary)]">{heading}</h3>
        {description && (
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{description}</p>
        )}
      </div>
      {cta && (
        <Button
          variant="secondary"
          size="sm"
          onClick={cta.onClick}
          {...(cta.href ? { as: "a", href: cta.href } : {})}
        >
          {cta.label}
        </Button>
      )}
    </div>
  );
}
