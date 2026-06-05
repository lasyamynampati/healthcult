"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";

const features = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    ),
    title: "Real Clinical Models",
    description: "Predictions use real trained machine learning classifiers on validated clinical datasets — not rule-based estimates.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
    title: "Plain-Language Explanations",
    description: "Every result comes with a counterfactual explanation — telling you exactly what to change and why, in plain English.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    title: "Clinical AI Chatbot",
    description: "Ask health questions and get evidence-based guidance, with built-in safety escalation for urgent situations.",
  },
];

export default function HomePage() {
  useEffect(() => {
    // Respect prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <AppShell fullScreen={true}>
      {/* ── Premium Hero Section ── */}
      <section className="relative min-h-[80vh] lg:min-h-screen flex items-center justify-center overflow-hidden hero-bg">
        {/* Background decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Floating orbs */}
          <div
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-30 orb-drift-1"
            style={{ background: 'var(--orb-1)' }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-25 orb-drift-2"
            style={{ background: 'var(--orb-2)' }}
          />
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-20"
            style={{ background: 'var(--orb-3)' }}
          />
        </div>

        {/* Main content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left side - Main CTA and Login */}
            <div className="space-y-8 animate-hero-reveal">
              {/* Logo and tagline */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-light)] animate-float-gentle">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--brand)"
                      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                      HealthCult
                    </h1>
                    <p className="text-sm text-[var(--text-muted)]">AI-Powered Preventive Healthcare</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight">
                    <span className="gradient-text">Take Control</span>
                    <br />
                    of Your Health Future
                  </h2>
                  <p className="text-xl text-[var(--text-secondary)] leading-relaxed max-w-lg">
                    Advanced AI analyzes your risk factors for diabetes and heart disease, providing personalized insights and actionable recommendations.
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/register"
                  className="btn-premium group inline-flex items-center justify-center gap-3 rounded-2xl bg-[var(--brand)] text-white font-semibold text-lg px-8 py-4 shadow-card-lg hover:shadow-card-lg transition-all duration-300"
                >
                  <span>Start Your Journey</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="group-hover:translate-x-1 transition-transform duration-300">
                    <path d="M5 12h14"/>
                    <path d="M12 5l7 7-7 7"/>
                  </svg>
                </Link>
                <Link
                  href="/login"
                  className="btn-premium inline-flex items-center justify-center gap-3 rounded-2xl border-2 border-[var(--border-strong)] bg-[var(--surface-raised)] text-[var(--text-primary)] font-semibold text-lg px-8 py-4 hover:border-[var(--brand)] hover:bg-[var(--brand-light)] transition-all duration-300"
                >
                  <span>Login</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <circle cx="12" cy="16" r="1"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </Link>
              </div>

              {/* Trust signals */}
              <div className="flex flex-wrap gap-6 text-sm text-[var(--text-muted)]">
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  <span>Clinically validated</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <circle cx="12" cy="16" r="1"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <span>Secure & private</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span>Free to use</span>
                </div>
              </div>
            </div>

            {/* Right side - Quick actions */}
            <div className="space-y-6 animate-hero-reveal" style={{ animationDelay: '0.2s' }}>
              <div className="text-center lg:text-left">
                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Quick Health Assessment</h3>
                <p className="text-[var(--text-secondary)]">Get personalized risk insights in minutes</p>
              </div>

              <div className="grid gap-4">
                {/* Diabetes Assessment */}
                <Link
                  href="/predictions/new?type=diabetes"
                  className="card-hover group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)] p-6 shadow-card-md hover:shadow-card-lg transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="hsl(220 70% 45%)" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="9"/>
                        <path d="M9 12l2 2 4-4"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--brand)] transition-colors">
                        Diabetes Risk Assessment
                      </h4>
                      <p className="text-sm text-[var(--text-secondary)] mt-1">
                        Evaluate your risk factors and get personalized prevention strategies.
                      </p>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-[var(--text-muted)] group-hover:text-[var(--brand)] group-hover:translate-x-1 transition-all duration-300">
                      <path d="M5 12h14"/>
                      <path d="M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                </Link>

                {/* Heart Disease Assessment */}
                <Link
                  href="/predictions/new?type=heart"
                  className="card-hover group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)] p-6 shadow-card-md hover:shadow-card-lg transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="hsl(355 65% 55%)" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--brand)] transition-colors">
                        Heart Disease Risk Assessment
                      </h4>
                      <p className="text-sm text-[var(--text-secondary)] mt-1">
                        Understand your cardiovascular health and discover ways to improve it.
                      </p>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-[var(--text-muted)] group-hover:text-[var(--brand)] group-hover:translate-x-1 transition-all duration-300">
                      <path d="M5 12h14"/>
                      <path d="M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                </Link>
              </div>

              <div className="text-center">
                <p className="text-sm text-[var(--text-muted)]">
                  Results include AI-powered explanations and what-if scenarios
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round">
            <path d="M7 13l3 3 3-3"/>
            <path d="M7 6l3 3 3-3"/>
          </svg>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16 reveal">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
              Advanced Healthcare Intelligence
            </h2>
            <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
              Powered by clinical-grade AI models trained on real medical data
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="reveal card-hover rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)] p-8 shadow-card"
                style={{ animationDelay: `${(index + 1) * 0.1}s` }}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[var(--brand-light)] mb-6">
                  <span className="text-[var(--brand)]">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-3">
                  {feature.title}
                </h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Disclaimer ── */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-t border-[var(--border)]">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            HealthCult is for informational and educational purposes only. It does not provide medical advice, diagnosis, or treatment recommendations.
            Always consult with qualified healthcare professionals for medical concerns.
          </p>
        </div>
      </section>
    </AppShell>
  );
}
