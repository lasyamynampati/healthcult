"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { RiskTrendChart } from "@/components/ui/Charts";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";

function ClockIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      className="text-[var(--text-muted)]" aria-hidden="true">
      <circle cx="12" cy="12" r="9"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

interface ApiPredictionHistoryItem {
  id: string;
  model_type?: string;
  model_version?: string;
  risk_score?: number;
  risk_band?: string;
  created_at?: string;
  modelType?: string;
  modelVersion?: string;
  riskScore?: number;
  riskBand?: string;
  createdAt?: string;
}

interface PredictionHistoryItem {
  id: string;
  modelType: string;
  modelVersion: string;
  riskScore: number;
  riskBand: string;
  createdAt: string;
}

export default function PredictionHistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<PredictionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        setError(null);

        const historyData = await apiFetch<any>(`/api/v1/predictions/history/user/${user.id}`);
        const rawItems: ApiPredictionHistoryItem[] = Array.isArray(historyData)
          ? historyData
          : historyData?.items ?? historyData?.data ?? [];

        const normalizedHistory = rawItems.map((item) => ({
          id: item.id,
          modelType: item.model_type ?? item.modelType ?? "",
          modelVersion: item.model_version ?? item.modelVersion ?? "",
          riskScore: Number(item.risk_score ?? item.riskScore ?? 0),
          riskBand: item.risk_band ?? item.riskBand ?? "",
          createdAt: item.created_at ?? item.createdAt ?? "",
        }));

        setHistory(normalizedHistory);
      } catch (err: any) {
        setError(err.message || "Unable to load history. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [user?.id]);

  function getRiskBandColor(band: string) {
    switch (band?.toLowerCase()) {
      case "high": return "bg-risk-high text-white";
      case "moderate": return "bg-risk-moderate text-white";
      case "low": return "bg-risk-low text-white";
      default: return "bg-gray-500 text-white";
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <AppShell>
      {/* ── Page header ── */}
      <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Prediction History
          </h1>
          <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
            A record of all your past risk assessments.
          </p>
        </div>
        <Link
          href="/predictions/new"
          className="mt-3 sm:mt-0 inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110 shadow-sm transition-all duration-150"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Prediction
        </Link>
      </div>

      {/* ── Loading state ── */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand)]"></div>
        </div>
      )}

      {/* ── Error state ── */}
      {error && !loading && (
        <Card variant="inset" padding="sm" className="mb-6">
          <div className="flex items-start gap-3 p-1">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </span>
            <div>
              <p className="text-sm font-medium text-red-800">Error loading history</p>
              <p className="mt-0.5 text-xs text-red-600">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {/* ── Empty state ── */}
      {!loading && !error && history.length === 0 && (
        <EmptyState
          icon={<ClockIcon />}
          heading="No predictions yet"
          description="Run your first risk assessment and it will appear here. You'll be able to track trends and see how improvements change your score over time."
          cta={{
            label: "Run your first prediction →",
            href: "/predictions/new",
          }}
        />
      )}

      {/* ── History list ── */}
      {!loading && !error && history.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--brand-light)]" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </span>
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">Assessment History</span>
          </div>

          {history.map((item) => (
            <Card key={item.id} variant="default" padding="md">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-semibold text-[var(--text-primary)] capitalize">
                      {item.modelType} Risk Assessment
                    </h3>
                    <Badge className={getRiskBandColor(item.riskBand)} size="sm">
                      {item.riskBand.toUpperCase()} RISK
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-[var(--text-muted)]">Risk Score:</span>
                      <span className="ml-2 font-medium text-[var(--text-primary)]">
                        {(item.riskScore * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)]">Model Version:</span>
                      <span className="ml-2 font-medium text-[var(--text-primary)]">
                        {item.modelVersion}
                      </span>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-[var(--text-muted)]">
                    {formatDate(item.createdAt)}
                  </p>
                </div>
              </div>
            </Card>
          ))}

          {/* Risk Trend Chart */}
          <Card variant="default" padding="md">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-[var(--text-primary)]">
                Risk Score Trends
              </h3>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                Your risk scores over time for all assessments
              </p>
            </div>
            <RiskTrendChart 
              data={history.map(item => ({
                date: formatDate(item.createdAt),
                riskScore: item.riskScore,
                modelType: item.modelType,
              }))} 
              height={300} 
            />
          </Card>
        </div>
      )}
    </AppShell>
  );
}
