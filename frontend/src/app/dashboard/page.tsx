"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";

// Quick stat card
function StatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
}) {
  return (
    <Card variant="elevated" padding="md" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
          {label}
        </span>
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--brand-light)] text-[var(--brand)]">
          {icon}
        </span>
      </div>
      <div>
        <p className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-[var(--text-muted)]">{sub}</p>}
      </div>
    </Card>
  );
}

// Navigation action card
function ActionCard({
  href,
  icon,
  title,
  description,
  badge,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className={[
        "group flex flex-col gap-4 rounded-2xl border border-[var(--border)]",
        "bg-[var(--surface-raised)] p-5 shadow-card",
        "hover:border-[var(--brand)] hover:shadow-card-md",
        "transition-all duration-200",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-light)] text-[var(--brand)] group-hover:scale-105 transition-transform duration-200">
          {icon}
        </span>
        {badge && (
          <Badge variant="brand" size="sm" dot>
            {badge}
          </Badge>
        )}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
        <p className="mt-1 text-xs text-[var(--text-secondary)] leading-relaxed">{description}</p>
      </div>
      <span className="flex items-center gap-1 text-xs font-medium text-[var(--brand)] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        Open
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </span>
    </Link>
  );
}

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <AppShell>
        <div className="mb-8">
          <Skeleton height="h-7" width="w-48" className="mb-2" />
          <Skeleton height="h-4" width="w-64" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          {[0, 1, 2].map((i) => (
            <Card key={i} variant="elevated" padding="md">
              <Skeleton height="h-4" width="w-24" className="mb-4" />
              <Skeleton height="h-8" width="w-16" />
            </Card>
          ))}
        </div>
      </AppShell>
    );
  }

  if (!user) {
    return (
      <AppShell>
        <Card variant="inset" padding="lg" className="mx-auto max-w-md text-center">
          <div className="flex justify-center mb-4" aria-hidden="true">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </span>
          </div>
          <h2 className="text-base font-semibold text-[var(--text-primary)]">Sign in to view your dashboard</h2>
          <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
            Your health data, predictions, and risk history are waiting.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Link
              href="/login"
              className="rounded-xl bg-[var(--brand)] px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110 transition-all shadow-sm"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] px-5 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Create Account
            </Link>
          </div>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {/* ── Welcome ── */}
      <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Welcome back
          </h1>
          <div className="mt-1 flex items-center gap-2">
            <p className="text-sm text-[var(--text-secondary)] truncate max-w-[240px]">
              {user.email}
            </p>
            <Badge variant="brand" size="sm" dot className="capitalize">
              {user.role}
            </Badge>
          </div>
        </div>
        <Link
          href="/predictions/new"
          className="mt-3 sm:mt-0 inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110 shadow-sm transition-all duration-150"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Prediction
        </Link>
      </div>

      {/* ── Stats row ── */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Account"
          value="Active"
          sub="Verified patient account"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          }
        />
        <StatCard
          label="Models Available"
          value="2"
          sub="Diabetes · Heart Disease"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          }
        />
        <StatCard
          label="AI Support"
          value="Live"
          sub="Clinical chatbot active"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          }
        />
      </div>

      {/* ── Action cards ── */}
      <div className="mb-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[var(--text-muted)]">
          What would you like to do?
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ActionCard
            href="/predictions/new"
            title="Run a Risk Assessment"
            description="Get an AI-powered diabetes or heart disease risk prediction with plain-language guidance."
            badge="Primary"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            }
          />
          <ActionCard
            href="/predictions/history"
            title="View History"
            description="Review your past assessments and track how your risk has changed over time."
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            }
          />
          <ActionCard
            href="/counterfactuals"
            title="What-If Explorer"
            description="Explore how specific lifestyle changes could lower your predicted risk score."
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            }
          />
          <ActionCard
            href="/chatbot"
            title="Clinical Chatbot"
            description="Ask questions about your health, risk factors, and get evidence-based guidance."
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            }
          />
          <ActionCard
            href="/reports/upload"
            title="Upload Medical Report"
            description="Upload lab results or reports and get AI-assisted interpretation and context."
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            }
          />
          <ActionCard
            href="/analytics"
            title="Analytics"
            description="View aggregated health trends and insights from your assessment history."
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
            }
          />
        </div>
      </div>

      {/* ── Medical disclaimer ── */}
      <Card variant="inset" padding="sm" className="mt-4">
        <p className="text-xs text-[var(--text-muted)] leading-relaxed text-center">
          <strong>Important:</strong> HealthCult predictions are for informational purposes only and are not a substitute for professional medical advice, diagnosis, or treatment.
        </p>
      </Card>
    </AppShell>
  );
}
