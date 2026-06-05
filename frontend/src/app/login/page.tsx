"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";

function HeartbeatIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  );
}

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPw, setShowPw]     = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--surface)]">
      {/* Minimal header */}
      <div className="flex items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-[var(--brand)] hover:opacity-80 transition-opacity"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--brand-light)]">
            <HeartbeatIcon />
          </span>
          <span className="text-base font-bold tracking-tight text-[var(--text-primary)]">HealthCult</span>
        </Link>
        <ThemeSwitcher />
      </div>

      {/* Centered auth card */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-[400px]">
          {/* Card */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)] shadow-card-lg p-8">
            {/* Icon + heading */}
            <div className="mb-7 flex flex-col items-center gap-3 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-light)] text-[var(--brand)]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </span>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                  Welcome back
                </h1>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  Sign in to your HealthCult account
                </p>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 dark:border-red-700/50 dark:bg-red-900/20">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" className="mt-0.5 shrink-0 text-risk-high" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p className="text-sm text-risk-high" role="alert">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="login-email" className="text-sm font-medium text-[var(--text-primary)]">
                  Email address
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={[
                    "w-full rounded-xl border border-[var(--border)]",
                    "bg-[var(--surface)] text-[var(--text-primary)]",
                    "px-4 py-2.5 text-sm",
                    "placeholder:text-[var(--text-muted)]",
                    "hover:border-[var(--border-strong)]",
                    "transition-colors duration-150",
                  ].join(" ")}
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="login-password" className="text-sm font-medium text-[var(--text-primary)]">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-[var(--brand)] hover:underline underline-offset-2"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPw ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={[
                      "w-full rounded-xl border border-[var(--border)]",
                      "bg-[var(--surface)] text-[var(--text-primary)]",
                      "px-4 py-2.5 pr-11 text-sm",
                      "placeholder:text-[var(--text-muted)]",
                      "hover:border-[var(--border-strong)]",
                      "transition-colors duration-150",
                    ].join(" ")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    aria-label={showPw ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    {showPw ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                id="login-submit-btn"
                className={[
                  "mt-1 flex w-full items-center justify-center gap-2",
                  "rounded-xl bg-[var(--brand)] px-5 py-2.5",
                  "text-sm font-semibold text-white",
                  "hover:brightness-110 shadow-sm",
                  "disabled:opacity-60 disabled:cursor-not-allowed",
                  "transition-all duration-150",
                ].join(" ")}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                    </svg>
                    Signing in…
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 border-t border-[var(--border)]" />
              <span className="text-xs text-[var(--text-muted)]">or</span>
              <div className="flex-1 border-t border-[var(--border)]" />
            </div>

            {/* Register link */}
            <p className="text-center text-sm text-[var(--text-secondary)]">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-semibold text-[var(--brand)] hover:underline underline-offset-2">
                Create one free
              </Link>
            </p>
          </div>

          {/* Below card */}
          <p className="mt-6 text-center text-xs text-[var(--text-muted)]">
            By signing in, you agree to our{" "}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-[var(--text-secondary)]">Privacy Policy</Link>
            {" "}and{" "}
            <Link href="/medical-disclaimer" className="underline underline-offset-2 hover:text-[var(--text-secondary)]">Medical Disclaimer</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
