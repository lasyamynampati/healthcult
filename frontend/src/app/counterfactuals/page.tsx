"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  LineChart,
  Line,
  Legend,
} from "recharts";

interface CounterfactualItem {
  id: string;
  assessment_id: string;
  target_outcome: string;
  suggestions: Record<string, string>;
  feasibility_score: number;
  created_at: string;
  model_type: string;
  model_version: string;
  risk_score: number;
  risk_band: string;
}

interface ChartSlice {
  name: string;
  value: number;
  color: string;
}

const howItWorksSteps = [
  {
    num: "1",
    title: "Run a prediction",
    desc: "Use the Predictions page to submit your clinical values. The model will generate a risk score.",
  },
  {
    num: "2",
    title: "Review your counterfactual explanation",
    desc: "After each prediction, you get a structured explanation showing which specific changes would lower your risk the most.",
  },
  {
    num: "3",
    title: "Understand each recommendation",
    desc: "Every suggestion is translated into plain language — no medical jargon. You will see what to change, by how much, and why it matters.",
  },
  {
    num: "4",
    title: "Track improvement over time",
    desc: "Re-run predictions as your values change. Watch your predicted risk drop as you make sustainable improvements.",
  },
];

function WhatIfIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-[var(--text-muted)]"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export default function CounterfactualPage() {
  const { user } = useAuth();
  const [counterfactuals, setCounterfactuals] = useState<CounterfactualItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<
    "all" | "diabetes" | "heart" | "high" | "recent"
  >("all");

  useEffect(() => {
    async function fetchCounterfactuals() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await apiFetch<{ items: any[] }>(
          `/api/v1/predictions/counterfactuals/user/${user.id}`
        );

        const items = Array.isArray(response?.items) ? response.items : [];

        const normalized: CounterfactualItem[] = items.map((item: any) => ({
          id: String(item.id ?? ""),
          assessment_id: String(item.assessment_id ?? ""),
          target_outcome: item.target_outcome ?? "reduce_risk",
          suggestions:
            item.suggestions && typeof item.suggestions === "object"
              ? item.suggestions
              : {},
          feasibility_score: Number(item.feasibility_score ?? 0),
          created_at: item.created_at ?? new Date().toISOString(),
          model_type: item.model_type ?? item.assessment?.model_type ?? "unknown",
          model_version:
            item.model_version ?? item.assessment?.model_version ?? "unknown",
          risk_score: Number(item.risk_score ?? item.assessment?.risk_score ?? 0),
          risk_band: item.risk_band ?? item.assessment?.risk_band ?? "unknown",
        }));

        setCounterfactuals(normalized);
      } catch (err: any) {
        setError(
          err?.message ||
            "Unable to load counterfactual explanations. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchCounterfactuals();
  }, [user?.id]);

  const filteredCounterfactuals = useMemo(() => {
    const sorted = [...counterfactuals].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    if (activeFilter === "diabetes") {
      return sorted.filter((item) => item.model_type === "diabetes");
    }

    if (activeFilter === "heart") {
      return sorted.filter((item) => item.model_type === "heart");
    }

    if (activeFilter === "high") {
      return sorted.filter((item) => item.risk_band === "high");
    }

    if (activeFilter === "recent") {
      return sorted.slice(0, 6);
    }

    return sorted;
  }, [activeFilter, counterfactuals]);

  const summary = useMemo(() => {
    const total = counterfactuals.length;
    const high = counterfactuals.filter((item) => item.risk_band === "high").length;
    const diabetes = counterfactuals.filter(
      (item) => item.model_type === "diabetes"
    ).length;
    const heart = counterfactuals.filter((item) => item.model_type === "heart").length;
    const averageRisk =
      total > 0
        ? counterfactuals.reduce((acc, item) => acc + item.risk_score, 0) / total
        : 0;

    return {
      total,
      high,
      diabetes,
      heart,
      averageRisk: Number(averageRisk.toFixed(1)),
    };
  }, [counterfactuals]);

  const modelTypeData = useMemo<ChartSlice[]>(() => {
    const counts = counterfactuals.reduce<Record<string, number>>((acc, item) => {
      acc[item.model_type] = (acc[item.model_type] ?? 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([name, value]) => ({
      name: name === "diabetes" ? "Diabetes" : name === "heart" ? "Heart" : "Other",
      value,
      color: name === "diabetes" ? "#0b72d9" : name === "heart" ? "#0f766e" : "#64748b",
    }));
  }, [counterfactuals]);

  const riskBandData = useMemo<ChartSlice[]>(() => {
    const counts = counterfactuals.reduce<Record<string, number>>((acc, item) => {
      acc[item.risk_band] = (acc[item.risk_band] ?? 0) + 1;
      return acc;
    }, {});

    return [
      { name: "Low", value: counts.low ?? 0, color: "#10b981" },
      { name: "Moderate", value: counts.moderate ?? 0, color: "#f59e0b" },
      { name: "High", value: counts.high ?? 0, color: "#ef4444" },
    ];
  }, [counterfactuals]);

  const timelineData = useMemo(() => {
    const grouped: Record<string, { date: string; count: number }> = {};
    const sorted = [...counterfactuals].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    for (const item of sorted) {
      const date = new Date(item.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      if (!grouped[date]) {
        grouped[date] = { date, count: 0 };
      }

      grouped[date].count += 1;
    }

    return Object.values(grouped);
  }, [counterfactuals]);

  const featureData = useMemo<ChartSlice[]>(() => {
    const counts: Record<string, number> = {};

    counterfactuals.forEach((item) => {
      Object.keys(item.suggestions || {}).forEach((feature) => {
        counts[feature] = (counts[feature] ?? 0) + 1;
      });
    });

    return Object.entries(counts)
      .map(([name, value]) => ({
        name: name.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
        value,
        color: "#4f46e5",
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [counterfactuals]);

  const categoryData = useMemo<ChartSlice[]>(() => {
    const counts: Record<string, number> = {};

    const categoryMap: Record<string, string> = {
      glucose: "Lifestyle",
      blood_pressure: "Lifestyle",
      skin_thickness: "Lifestyle",
      insulin: "Lifestyle",
      bmi: "Lifestyle",
      diabetes_pedigree_function: "Non-modifiable",
      pregnancies: "Non-modifiable",
      age: "Non-modifiable",
      trestbps: "Clinical",
      chol: "Clinical",
      fbs: "Lifestyle",
      restecg: "Clinical",
      thalach: "Clinical",
      exang: "Clinical",
      oldpeak: "Lifestyle",
      slope: "Clinical",
      ca: "Clinical",
      thal: "Clinical",
      sex: "Non-modifiable",
      cp: "Clinical",
    };

    counterfactuals.forEach((item) => {
      Object.keys(item.suggestions || {}).forEach((feature) => {
        const category = categoryMap[feature] ?? "Other";
        counts[category] = (counts[category] ?? 0) + 1;
      });
    });

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color:
        name === "Lifestyle"
          ? "#10b981"
          : name === "Clinical"
          ? "#f59e0b"
          : name === "Non-modifiable"
          ? "#64748b"
          : "#94a3b8",
    }));
  }, [counterfactuals]);

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatSuggestions(suggestions: Record<string, string>) {
    return Object.entries(suggestions)
      .slice(0, 3)
      .map(([key, value]) => ({
        feature: key.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
        value,
      }));
  }

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          What-If Explorer
        </h1>
        <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-[var(--text-secondary)]">
          Counterfactual explanations show you the smallest, most realistic changes
          you could make to your clinical values that would meaningfully reduce your
          predicted risk.
        </p>
      </div>

      <Card variant="elevated" padding="md" className="mb-8">
        <div className="flex items-start gap-4">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-light)] text-[var(--brand)]"
            aria-hidden="true"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </span>

          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              What is a counterfactual explanation?
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-secondary)]">
              Think of it as the model asking:{" "}
              <em className="text-[var(--text-primary)]">
                “What is the smallest change that would flip this result?”
              </em>{" "}
              Instead of only telling you your risk score, it tells you{" "}
              <strong className="font-medium text-[var(--text-primary)]">
                exactly what to change and by how much
              </strong>{" "}
              to bring your risk down.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
              These suggestions are based on your saved prediction inputs and are
              meant to help you focus on the most influential factors first.
            </p>
          </div>
        </div>
      </Card>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[var(--brand)]" />
        </div>
      )}

      {error && !loading && (
        <Card variant="inset" padding="sm" className="mb-6">
          <div className="flex items-start gap-3 p-1">
            <span
              className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600"
              aria-hidden="true"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <circle cx="12" cy="12" r="9" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </span>
            <div>
              <p className="text-sm font-medium text-red-800">
                Error loading counterfactuals
              </p>
              <p className="mt-0.5 text-xs text-red-600">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {!loading && !error && counterfactuals.length > 0 && (
        <div className="mb-8 space-y-6">
          <div className="grid gap-4 sm:grid-cols-4">
            <Card variant="default" padding="md" className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                Saved insights
              </p>
              <p className="text-3xl font-semibold text-[var(--text-primary)]">
                {summary.total}
              </p>
              <p className="text-sm text-[var(--text-secondary)]">
                Counterfactual runs saved for your account.
              </p>
            </Card>

            <Card variant="default" padding="md" className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                High risk alerts
              </p>
              <p className="text-3xl font-semibold text-[var(--text-primary)]">
                {summary.high}
              </p>
              <p className="text-sm text-[var(--text-secondary)]">
                Runs where the model flagged high predicted risk.
              </p>
            </Card>

            <Card variant="default" padding="md" className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                Diabetes reports
              </p>
              <p className="text-3xl font-semibold text-[var(--text-primary)]">
                {summary.diabetes}
              </p>
              <p className="text-sm text-[var(--text-secondary)]">
                Predictions using the diabetes risk model.
              </p>
            </Card>

            <Card variant="default" padding="md" className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                Average risk
              </p>
              <p className="text-3xl font-semibold text-[var(--text-primary)]">
                {summary.averageRisk}%
              </p>
              <p className="text-sm text-[var(--text-secondary)]">
                Average model risk score across saved runs.
              </p>
            </Card>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {[
                { label: "All", value: "all" },
                { label: "Diabetes", value: "diabetes" },
                { label: "Heart", value: "heart" },
                { label: "High risk", value: "high" },
                { label: "Recent", value: "recent" },
              ].map((filterOption) => (
                <button
                  key={filterOption.value}
                  type="button"
                  onClick={() =>
                    setActiveFilter(
                      filterOption.value as "all" | "diabetes" | "heart" | "high" | "recent"
                    )
                  }
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    activeFilter === filterOption.value
                      ? "border-[var(--brand)] bg-[var(--brand-light)] text-[var(--brand)]"
                      : "border-[var(--border)] bg-[var(--surface-overlay)] text-[var(--text-secondary)]"
                  }`}
                >
                  {filterOption.label}
                </button>
              ))}
            </div>

            <p className="text-xs text-[var(--text-muted)]">
              Showing {filteredCounterfactuals.length} of {counterfactuals.length} saved runs
            </p>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <Card variant="default" padding="md" className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    Prediction timeline
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    How many saved counterfactual runs over time
                  </p>
                </div>
                <Badge variant="brand" size="sm">
                  Trend
                </Badge>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={timelineData}
                    margin={{ top: 8, right: 0, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
                    />
                    <YAxis tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#0b72d9"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <div className="grid gap-4">
              <Card variant="default" padding="md" className="space-y-4">
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  Model split
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  Diabetes vs heart risk evaluations
                </p>

                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={modelTypeData}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={70}
                        innerRadius={28}
                        paddingAngle={2}
                      >
                        {modelTypeData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`${value}`, "Runs"]} />
                      <Legend verticalAlign="bottom" height={24} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card variant="default" padding="md" className="space-y-4">
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  Top risk bands
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  Most common saved risk categories
                </p>

                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={riskBandData}
                      margin={{ top: 8, right: 0, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
                      />
                      <YAxis tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#0f766e" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <Card variant="default" padding="md" className="space-y-4">
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                Most recommended factors
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Features that appear most often in saved suggestions
              </p>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={featureData}
                    layout="vertical"
                    margin={{ top: 8, right: 16, left: 16, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
                    <XAxis type="number" tick={{ fill: "var(--text-secondary)", fontSize: 12 }} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={130}
                      tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
                    />
                    <Tooltip />
                    <Bar dataKey="value" fill="#4f46e5" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card variant="default" padding="md" className="space-y-4">
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                Recommendation categories
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Lifestyle, clinical, and non-modifiable factor split
              </p>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={90}
                      innerRadius={42}
                      paddingAngle={2}
                    >
                      {categoryData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value}`, "Suggestions"]} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <div className="grid gap-4">
            {filteredCounterfactuals.map((item) => (
              <Card key={item.id} variant="default" padding="md" className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-base font-semibold capitalize text-[var(--text-primary)]">
                      {item.model_type} risk assessment
                    </h3>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      Saved on {formatDate(item.created_at)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="neutral" size="sm">
                      Risk {item.risk_band}
                    </Badge>
                    <Badge variant="brand" size="sm">
                      Feasibility {(item.feasibility_score * 100).toFixed(0)}%
                    </Badge>
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-overlay)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                      Prediction details
                    </p>
                    <p className="mt-2 text-sm text-[var(--text-primary)]">
                      Score: {(item.risk_score * 100).toFixed(1)}%
                    </p>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      Model: {item.model_version}
                    </p>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      Target: {item.target_outcome.replace(/_/g, " ")}
                    </p>
                  </div>

                  <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-overlay)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                      Top change suggestions
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {formatSuggestions(item.suggestions).length > 0 ? (
                        formatSuggestions(item.suggestions).map((suggestion) => (
                          <span
                            key={suggestion.feature}
                            className="rounded-2xl bg-[var(--surface)] px-3 py-2 text-xs text-[var(--text-primary)]"
                          >
                            {suggestion.feature}: {suggestion.value}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-[var(--text-secondary)]">
                          No structured suggestions available for this run.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {!loading && !error && counterfactuals.length === 0 && (
        <EmptyState
          icon={<WhatIfIcon />}
          heading="No counterfactual data yet"
          description="Run a prediction first. Your personalised what-if analysis will appear directly on the results page — no extra steps needed."
          cta={{
            label: "Go to Predictions →",
            href: "/predictions/new",
          }}
          className="mb-8"
        />
      )}

      <div className="mb-2">
        <h2 className="mb-5 text-sm font-semibold uppercase tracking-widest text-[var(--text-muted)]">
          How counterfactual guidance works
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {howItWorksSteps.map((step) => (
            <Card key={step.num} variant="default" padding="md">
              <div className="flex gap-4">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand-light)] text-sm font-bold text-[var(--brand)]"
                  aria-hidden="true"
                >
                  {step.num}
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
                    {step.desc}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <Link
          href="/predictions/new"
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:brightness-110"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
          Run a Prediction Now
        </Link>
      </div>
    </AppShell>
  );
}