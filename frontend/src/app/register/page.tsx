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

const benefits = [
  "Free AI-powered risk assessment",
  "Plain-language counterfactual guidance",
  "Diabetes and heart disease models",
  "Secure and private — your data stays yours",
];

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPw, setShowPw]     = useState(false);

  const pwStrength =
    password.length === 0
      ? 0
      : password.length < 6
      ? 1
      : password.length < 10
      ? 2
      : 3;
  const strengthLabel = ["", "Weak", "Good", "Strong"];
  const strengthColor = ["", "bg-risk-high", "bg-risk-mod", "bg-risk-low"];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      await register(email, password, "patient");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
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

      {/* Layout */}
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-[420px]">
          {/* Card */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)] shadow-card-lg p-8">
            {/* Icon + heading */}
            <div className="mb-6 flex flex-col items-center gap-3 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-light)] text-[var(--brand)]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <line x1="19" y1="8" x2="19" y2="14"/>
                  <line x1="22" y1="11" x2="16" y2="11"/>
                </svg>
              </span>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                  Create your account
                </h1>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  Free access to AI health risk tools
                </p>
              </div>
            </div>

            {/* Benefits */}
            <ul className="mb-6 space-y-2">
              {benefits.map((b) => (
                <li key={b} className="flex items-center gap-2.5 text-xs text-[var(--text-secondary)]">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--brand-light)] text-[var(--brand)]" aria-hidden="true">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </span>
                  {b}
                </li>
              ))}
            </ul>

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
                <label htmlFor="register-email" className="text-sm font-medium text-[var(--text-primary)]">
                  Email address
                </label>
                <input
                  id="register-email"
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
                <label htmlFor="register-password" className="text-sm font-medium text-[var(--text-primary)]">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="register-password"
                    type={showPw ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
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

                {/* Password strength meter */}
                {password.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex gap-1" aria-hidden="true">
                      {[1, 2, 3].map((level) => (
                        <div
                          key={level}
                          className={[
                            "h-1 flex-1 rounded-full transition-all duration-300",
                            pwStrength >= level ? strengthColor[pwStrength] : "bg-[var(--border)]",
                          ].join(" ")}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-[var(--text-muted)]" aria-live="polite">
                      Password strength: <strong>{strengthLabel[pwStrength]}</strong>
                    </p>
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                id="register-submit-btn"
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
                    Creating account…
                  </>
                ) : (
                  "Create Free Account"
                )}
              </button>
            </form>

            {/* Sign in link */}
            <p className="mt-5 text-center text-sm text-[var(--text-secondary)]">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-[var(--brand)] hover:underline underline-offset-2">
                Sign in
              </Link>
            </p>
          </div>

          {/* Below card */}
          <p className="mt-6 text-center text-xs text-[var(--text-muted)]">
            By creating an account, you agree to our{" "}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-[var(--text-secondary)]">Privacy Policy</Link>
            {" "}and{" "}
            <Link href="/medical-disclaimer" className="underline underline-offset-2 hover:text-[var(--text-secondary)]">Medical Disclaimer</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
