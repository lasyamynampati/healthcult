"use client";

import { type ReactNode } from "react";

interface FabAction {
  id: string;
  icon: ReactNode;
  label: string;
  onClick: () => void;
  visible?: boolean;
}

interface FloatingActionsProps {
  actions: FabAction[];
}

export function FloatingActions({ actions }: FloatingActionsProps) {
  const visible = actions.filter((a) => a.visible !== false);
  if (visible.length === 0) return null;

  return (
    <div
      className="fixed bottom-6 right-5 z-40 flex flex-col items-end gap-2 animate-fade-in"
      role="group"
      aria-label="Quick actions"
    >
      {visible.map((action) => (
        <button
          key={action.id}
          onClick={action.onClick}
          aria-label={action.label}
          title={action.label}
          className={[
            "group flex items-center gap-2 rounded-full",
            "bg-[var(--surface-raised)] border border-[var(--border)]",
            "shadow-fab text-[var(--text-secondary)]",
            "hover:bg-[var(--brand)] hover:text-white hover:border-transparent hover:shadow-card-lg",
            "transition-all duration-200 ease-spring",
            "h-11 px-4",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-ring)]",
          ].join(" ")}
        >
          <span className="flex h-5 w-5 items-center justify-center shrink-0">
            {action.icon}
          </span>
          {/* Label appears on hover */}
          <span className="text-xs font-medium whitespace-nowrap overflow-hidden max-w-0 group-hover:max-w-[120px] transition-all duration-200">
            {action.label}
          </span>
        </button>
      ))}
    </div>
  );
}

// ── Reusable inline SVG icons for FAB actions ──
export function ScrollDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <polyline points="19 12 12 19 5 12"/>
    </svg>
  );
}

export function ResetIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <polyline points="1 4 1 10 7 10"/>
      <path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
    </svg>
  );
}

export function LightbulbIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <line x1="9" y1="18" x2="15" y2="18"/>
      <line x1="10" y1="22" x2="14" y2="22"/>
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
    </svg>
  );
}

export function ScrollTopIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <line x1="12" y1="19" x2="12" y2="5"/>
      <polyline points="5 12 12 5 19 12"/>
    </svg>
  );
}
