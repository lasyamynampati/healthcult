"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";

const nav = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </svg>
    ),
  },
  {
    href: "/predictions/new",
    label: "Predictions",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    href: "/predictions/history",
    label: "History",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    href: "/counterfactuals",
    label: "What-If",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    href: "/chatbot",
    label: "Chatbot",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
];

// Heartbeat logo icon
function HeartbeatIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M22 12h-4l-3 9L9 3l-3 9H2"
        stroke="currentColor" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

export function AppShell({ children, fullScreen = false }: { children: ReactNode; fullScreen?: boolean }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col">
      {/* ── Sticky header ── */}
      <header
        className="sticky top-0 z-50 w-full border-b"
        style={{
          background: "var(--header-bg)",
          borderColor: "var(--header-border)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-[var(--brand)] hover:opacity-80 transition-opacity shrink-0"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--brand-light)]">
              <HeartbeatIcon />
            </span>
            <span className="text-base font-bold tracking-tight text-[var(--text-primary)] hidden sm:block">
              HealthCult
            </span>
          </Link>

          {/* Nav */}
          <nav className="flex flex-1 items-center gap-0.5 overflow-x-auto scrollbar-thin" aria-label="Main navigation">
            {nav.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium",
                    "transition-all duration-150 whitespace-nowrap",
                    active
                      ? "bg-[var(--brand-light)] text-[var(--brand)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--surface-overlay)] hover:text-[var(--text-primary)]",
                  ].join(" ")}
                  aria-current={active ? "page" : undefined}
                >
                  {item.icon}
                  <span className="hidden sm:block">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right side: theme + user */}
          <div className="flex shrink-0 items-center gap-2">
            <ThemeSwitcher />
            {user ? (
              <div className="flex items-center gap-2">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-xs font-medium text-[var(--text-primary)] truncate max-w-[140px]">
                    {user.email}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] capitalize">{user.role}</span>
                </div>
                <button
                  onClick={logout}
                  className={[
                    "flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium",
                    "text-[var(--text-secondary)] border border-[var(--border)]",
                    "bg-[var(--surface-raised)]",
                    "hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]",
                    "transition-all duration-150",
                  ].join(" ")}
                  aria-label="Sign out"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    aria-hidden="true">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  <span className="hidden sm:block">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className={[
                    "rounded-xl px-3 py-2 text-sm font-medium",
                    "text-[var(--text-secondary)]",
                    "hover:text-[var(--text-primary)]",
                    "transition-colors duration-150",
                  ].join(" ")}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className={[
                    "rounded-xl px-3 py-2 text-sm font-semibold",
                    "bg-[var(--brand)] text-white",
                    "hover:brightness-110 shadow-sm",
                    "transition-all duration-150",
                  ].join(" ")}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Page content ── */}
      {fullScreen ? (
        <>{children}</>
      ) : (
        <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
          {children}
        </main>
      )}

      {/* ── Footer ── */}
      <footer className="border-t border-[var(--border)] bg-[var(--surface-raised)] mt-auto">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-xs text-[var(--text-muted)]">
            © {new Date().getFullYear()} HealthCult — AI-Powered Preventive Healthcare
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            For informational use only. Not medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
