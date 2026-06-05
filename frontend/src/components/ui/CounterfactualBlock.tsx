"use client";

import { Badge } from "./Badge";

type RiskBand = "low" | "moderate" | "high";

interface Suggestion {
  feature: string;       // raw key from API e.g. "glucose"
  suggestion: string;    // raw text e.g. "Reduce by 15"
}

interface CounterfactualBlockProps {
  suggestions: Record<string, string>;
  originalScore: number | null;
  improvedScore: number | null;
  band: RiskBand;
  modelType: "diabetes" | "heart";
  nonActionableNotes?: string[];
}

// ─────────────────────────────────────────────────
// Feature metadata — plain language labels + units
// ─────────────────────────────────────────────────
interface FeatureMeta {
  friendlyLabel: string;
  unit: string;
  whyItMatters: string;
}

const FEATURE_META: Record<string, FeatureMeta> = {
  // Diabetes features
  glucose: {
    friendlyLabel: "Blood sugar (glucose)",
    unit: "mg/dL",
    whyItMatters: "High blood sugar is the primary driver of diabetes risk. Even modest reductions can meaningfully change your outlook.",
  },
  bmi: {
    friendlyLabel: "Body weight / BMI",
    unit: "kg/m²",
    whyItMatters: "Body weight directly affects insulin sensitivity. Small, sustained changes have a compounding effect over time.",
  },
  diabetes_pedigree_function: {
    friendlyLabel: "Family risk factor",
    unit: "",
    whyItMatters: "This reflects hereditary diabetes risk from your family history. While you can't change genetics, it helps calibrate how aggressively other factors should be managed.",
  },
  blood_pressure: {
    friendlyLabel: "Blood pressure",
    unit: "mm Hg",
    whyItMatters: "Elevated blood pressure often accompanies insulin resistance. Reducing it supports overall metabolic health.",
  },
  skin_thickness: {
    friendlyLabel: "Skin fold thickness",
    unit: "mm",
    whyItMatters: "This is a proxy for body fat distribution. Changes here reflect deeper improvements in body composition.",
  },
  insulin: {
    friendlyLabel: "Insulin level",
    unit: "μU/mL",
    whyItMatters: "Elevated fasting insulin signals reduced sensitivity. Diet and exercise are the most effective levers here.",
  },
  pregnancies: {
    friendlyLabel: "Number of pregnancies",
    unit: "",
    whyItMatters: "History of gestational diabetes increases lifetime risk. Close monitoring and lifestyle factors become more important.",
  },
  age: {
    friendlyLabel: "Age",
    unit: "years",
    whyItMatters: "Risk naturally increases with age — this reinforces the value of proactive management of other factors.",
  },
  // Heart disease features
  trestbps: {
    friendlyLabel: "Resting blood pressure",
    unit: "mm Hg",
    whyItMatters: "High resting blood pressure is a leading risk factor for heart disease. Sustained control significantly reduces long-term risk.",
  },
  chol: {
    friendlyLabel: "Cholesterol",
    unit: "mg/dL",
    whyItMatters: "Elevated cholesterol contributes to arterial plaque buildup. Diet, exercise, and sometimes medication can bring this down.",
  },
  thalach: {
    friendlyLabel: "Max heart rate",
    unit: "bpm",
    whyItMatters: "A higher achievable heart rate during exercise generally indicates better cardiovascular fitness and lower heart disease risk.",
  },
  oldpeak: {
    friendlyLabel: "ST depression",
    unit: "",
    whyItMatters: "This ECG measure reflects how the heart responds to exertion. Lower values indicate healthier cardiac function.",
  },
  fbs: {
    friendlyLabel: "Fasting blood sugar",
    unit: "",
    whyItMatters: "Elevated fasting blood sugar is a sign of metabolic stress and is linked to both diabetes and heart disease.",
  },
  ca: {
    friendlyLabel: "Major vessel health",
    unit: "",
    whyItMatters: "The number of narrowed vessels seen on imaging is a direct indicator of cardiovascular disease progression.",
  },
  cp: {
    friendlyLabel: "Chest pain type",
    unit: "",
    whyItMatters: "The nature of chest pain provides important signals about underlying cardiac stress.",
  },
  exang: {
    friendlyLabel: "Exercise-induced chest discomfort",
    unit: "",
    whyItMatters: "Pain during exercise can indicate reduced blood flow to the heart under stress.",
  },
  slope: {
    friendlyLabel: "ST slope (exercise ECG)",
    unit: "",
    whyItMatters: "This describes how the heart's electrical activity changes during peak exercise — an indicator of cardiac response.",
  },
  thal: {
    friendlyLabel: "Thalassemia type",
    unit: "",
    whyItMatters: "Blood disorder type affects oxygen delivery and can compound cardiovascular risk.",
  },
};

function getFriendlyLabel(feature: string): string {
  return FEATURE_META[feature]?.friendlyLabel ?? feature.replace(/_/g, " ");
}

function getUnit(feature: string): string {
  return FEATURE_META[feature]?.unit ?? "";
}

function getWhyItMatters(feature: string): string {
  return FEATURE_META[feature]?.whyItMatters ?? "";
}

// Parse "Reduce by 15" or "Increase by 10" into direction + value
function parseSuggestion(raw: string): { direction: "reduce" | "increase" | "adjust"; amount: string } {
  const lower = raw.toLowerCase();
  if (lower.startsWith("reduce")) {
    const match = raw.match(/[\d.]+/);
    return { direction: "reduce", amount: match?.[0] ?? "" };
  }
  if (lower.startsWith("increase")) {
    const match = raw.match(/[\d.]+/);
    return { direction: "increase", amount: match?.[0] ?? "" };
  }
  return { direction: "adjust", amount: raw };
}

// Direction arrow + copy
function DirectionChip({ direction }: { direction: "reduce" | "increase" | "adjust" }) {
  if (direction === "reduce") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-risk-low-bg text-risk-low px-2.5 py-0.5 text-xs font-semibold ring-1 ring-risk-low-ring">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
        Lower
      </span>
    );
  }
  if (direction === "increase") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 px-2.5 py-0.5 text-xs font-semibold ring-1 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-300">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
        Raise
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--surface-overlay)] text-[var(--text-secondary)] px-2.5 py-0.5 text-xs font-semibold ring-1 ring-[var(--border)]">
      Adjust
    </span>
  );
}

// ── Plain-language summary sentence ──
function buildSummary(
  score: number,
  band: RiskBand,
  topFeatures: string[],
  improvedScore: number | null
): string {
  const scoreStr = `${(score * 100).toFixed(1)}%`;
  const topNames = topFeatures.slice(0, 3).map(getFriendlyLabel);
  const nameList =
    topNames.length === 1
      ? topNames[0]
      : topNames.slice(0, -1).join(", ") + ", and " + topNames[topNames.length - 1];

  const improvement =
    improvedScore != null
      ? ` Making these changes could bring your risk down to around ${(improvedScore * 100).toFixed(1)}%.`
      : "";

  if (band === "low") {
    return `Your predicted risk is ${scoreStr} — well within the low range. The suggestions below show how to keep it there.${improvement}`;
  }
  return `Your predicted risk is ${scoreStr}. Targeted improvements in ${nameList} could meaningfully reduce it.${improvement}`;
}

// ─────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────
export function CounterfactualBlock({
  suggestions,
  originalScore,
  improvedScore,
  band,
  nonActionableNotes,
}: CounterfactualBlockProps) {
  const entries = Object.entries(suggestions);

  if (entries.length === 0) return null;

  const currentScore = originalScore ?? 0;
  const topFeatures = entries.map(([feat]) => feat);

  const summary = buildSummary(currentScore, band, topFeatures, improvedScore ?? null);

  const improvement =
    originalScore != null && improvedScore != null
      ? ((originalScore - improvedScore) * 100).toFixed(1)
      : null;

  const improvementPct =
    originalScore != null && improvedScore != null && originalScore > 0
      ? Math.round(((originalScore - improvedScore) / originalScore) * 100)
      : null;

  const noteLines = nonActionableNotes?.filter(Boolean) ?? [];

  return (
    <div className="flex flex-col gap-0 animate-fade-up">
      {/* ── Summary sentence ── */}
      <div className="rounded-t-2xl bg-[var(--brand-light)] border border-[var(--border)] border-b-0 px-5 py-4">
        <p className="text-sm leading-relaxed text-[var(--text-primary)]">
          <span className="font-semibold text-[var(--brand)]">What this means for you. </span>
          {summary}
        </p>
      </div>

      <div className="rounded-b-2xl border border-[var(--border)] bg-[var(--surface-raised)] overflow-hidden">

        {/* ══ Section 1: Current Risk ══ */}
        <section className="px-5 py-5 border-b border-[var(--border)]">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--surface-overlay)] text-[var(--text-muted)]" aria-hidden="true">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </span>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
              Current Risk
            </h4>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-2xl font-extrabold tabular-nums text-[var(--text-primary)]">
              {(currentScore * 100).toFixed(1)}%
            </span>
            <Badge variant="risk" band={band} />
          </div>
        </section>

        {/* ══ Section 2: Top Changes That Could Help ══ */}
        {noteLines.length > 0 && (
          <section className="px-5 py-5 border-b border-[var(--border)] bg-[var(--surface-overlay)]">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <p className="text-sm text-[var(--text-primary)] font-semibold mb-2">
                Non-actionable context
              </p>
              {noteLines.map((note, index) => (
                <p key={index} className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {note}
                </p>
              ))}
            </div>
          </section>
        )}
        <section className="px-5 py-5 border-b border-[var(--border)]">
          <div className="flex items-center gap-2 mb-4">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--brand-light)] text-[var(--brand)]" aria-hidden="true">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            </span>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
              Top Changes That Could Help
            </h4>
          </div>

          <ol className="flex flex-col gap-3" aria-label="Recommended changes">
            {entries.map(([feat, raw], idx) => {
              const { direction, amount } = parseSuggestion(raw);
              const unit = getUnit(feat);
              const friendlyLabel = getFriendlyLabel(feat);

              // Plain-language instruction
              const actionVerb =
                direction === "reduce" ? "Try to lower your"
                : direction === "increase" ? "Try to raise your"
                : "Adjust your";

              const amountText = amount
                ? direction !== "adjust"
                  ? ` by about ${amount}${unit ? " " + unit : ""}`
                  : ""
                : "";

              return (
                <li
                  key={feat}
                  className="flex gap-3 rounded-xl bg-[var(--surface-overlay)] p-3.5"
                >
                  {/* Priority number */}
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--surface-raised)] border border-[var(--border)] text-xs font-bold text-[var(--text-muted)]"
                    aria-label={`Priority ${idx + 1}`}
                  >
                    {idx + 1}
                  </span>

                  <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                    {/* Label + direction chip */}
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="text-sm font-semibold text-[var(--text-primary)]">
                        {friendlyLabel}
                      </span>
                      <DirectionChip direction={direction} />
                    </div>

                    {/* Plain-language instruction */}
                    <p className="text-sm text-[var(--text-secondary)] leading-snug">
                      {actionVerb} <strong className="font-medium text-[var(--text-primary)]">{friendlyLabel.toLowerCase()}</strong>{amountText}.
                    </p>

                    {/* Raw technical detail — secondary */}
                    <p className="text-xs text-[var(--text-muted)]">
                      Model suggestion: {raw}{unit ? " " + unit : ""}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        {/* ══ Section 3: Expected Improvement ══ */}
        {improvement !== null && improvedScore !== null && originalScore !== null && (
          <section className="px-5 py-5 border-b border-[var(--border)]">
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-risk-low-bg text-risk-low" aria-hidden="true">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
              </span>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                Expected Improvement
              </h4>
            </div>

            {/* Before → After score comparison */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                {/* Before */}
                <div className="flex flex-col gap-0.5 rounded-xl bg-[var(--surface-overlay)] px-4 py-3 min-w-[90px]">
                  <span className="text-xs text-[var(--text-muted)] font-medium">Current</span>
                  <span className="text-xl font-bold tabular-nums text-[var(--text-primary)]">
                    {(originalScore * 100).toFixed(1)}%
                  </span>
                </div>

                {/* Arrow */}
                <div className="flex flex-col items-center gap-0.5 text-[var(--text-muted)]" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  {improvementPct !== null && (
                    <span className="text-[10px] font-medium text-risk-low">−{improvementPct}%</span>
                  )}
                </div>

                {/* After */}
                <div className="flex flex-col gap-0.5 rounded-xl bg-risk-low-bg px-4 py-3 min-w-[90px] ring-1 ring-risk-low-ring">
                  <span className="text-xs text-risk-low font-medium">Potential</span>
                  <span className="text-xl font-bold tabular-nums text-risk-low">
                    {(improvedScore * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="flex flex-col gap-1.5" role="presentation">
                <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-medium">
                  <span>0%</span>
                  <span>100%</span>
                </div>
                <div className="relative h-2.5 w-full rounded-full bg-[var(--surface-overlay)] overflow-hidden">
                  {/* Original fill */}
                  <div
                    className="absolute left-0 top-0 h-full rounded-full bg-[var(--border-strong)] transition-all duration-500"
                    style={{ width: `${(originalScore * 100).toFixed(1)}%` }}
                  />
                  {/* Improved fill */}
                  <div
                    className="absolute left-0 top-0 h-full rounded-full bg-risk-low transition-all duration-1000 delay-300"
                    style={{ width: `${(improvedScore * 100).toFixed(1)}%` }}
                  />
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  These are model estimates, not guarantees. Your actual results will depend on sustained changes and individual factors.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ══ Section 4: Why These Changes Matter ══ */}
        <section className="px-5 py-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--surface-overlay)] text-[var(--text-muted)]" aria-hidden="true">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </span>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
              Why These Changes Matter
            </h4>
          </div>
          <div className="flex flex-col gap-3">
            {entries.map(([feat]) => {
              const why = getWhyItMatters(feat);
              if (!why) return null;
              return (
                <div key={`why-${feat}`} className="flex gap-2.5">
                  <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[var(--brand-light)] text-[var(--brand)]" aria-hidden="true">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="4"/></svg>
                  </span>
                  <div>
                    <span className="text-xs font-semibold text-[var(--text-primary)]">
                      {getFriendlyLabel(feat)}:{" "}
                    </span>
                    <span className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {why}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Disclaimer ── */}
        <div className="border-t border-[var(--border)] bg-[var(--surface-overlay)] px-5 py-3">
          <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
            <strong>Medical notice:</strong> These suggestions are generated by a machine learning model for informational purposes only. They are not a medical diagnosis or treatment plan. Please consult a qualified healthcare professional before making changes to your health.
          </p>
        </div>
      </div>
    </div>
  );
}
