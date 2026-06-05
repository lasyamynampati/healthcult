"use client";

import { useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { RiskMeter } from "@/components/ui/RiskMeter";
import { CounterfactualBlock } from "@/components/ui/CounterfactualBlock";
import {
  FloatingActions,
  ScrollDownIcon,
  ResetIcon,
  LightbulbIcon,
  ScrollTopIcon,
} from "@/components/ui/FloatingActions";
import { RiskTrendChart, MetricComparisonChart } from "@/components/ui/Charts";

// ─────────────────────────────────────────────
// Field definitions
// ─────────────────────────────────────────────
const diabetesFields = [
  { name: "pregnancies",                  label: "Pregnancies",                        type: "number", step: "1",     unit: "",      hint: "Number of times pregnant", reference: "Typical range: 0-10" },
  { name: "glucose",                      label: "Blood sugar (glucose)",               type: "number", step: "1",     unit: "mg/dL", hint: "Plasma glucose concentration", reference: "Normal range: 70-99 mg/dL (fasting)" },
  { name: "blood_pressure",               label: "Blood pressure",                      type: "number", step: "1",     unit: "mm Hg", hint: "Diastolic blood pressure", reference: "Normal: under 80 mmHg" },
  { name: "skin_thickness",               label: "Skin fold thickness",                 type: "number", step: "1",     unit: "mm",    hint: "Triceps skinfold thickness", reference: "Typical range: 10-50 mm" },
  { name: "insulin",                      label: "Insulin level",                       type: "number", step: "1",     unit: "μU/mL", hint: "2-hour serum insulin", reference: "Normal range: 16-166 μU/mL" },
  { name: "bmi",                          label: "Body weight / BMI",                   type: "number", step: "0.1",   unit: "kg/m²", hint: "Body mass index", reference: "Normal range: 18.5-24.9 kg/m²" },
  { name: "diabetes_pedigree_function",   label: "Family risk factor (pedigree)",       type: "number", step: "0.001", unit: "",      hint: "Genetic diabetes risk score", reference: "Range: 0.0-2.5 (higher = more risk)" },
  { name: "age",                          label: "Age",                                 type: "number", step: "1",     unit: "years", hint: "", reference: "Adult patients: 18+ years" },
];

const heartFields = [
  { name: "age",       label: "Age",                             type: "number", step: "1",   unit: "years", hint: "", reference: "Adult patients: 18+ years" },
  { name: "sex",       label: "Sex",                             type: "number", step: "1",   unit: "",      hint: "0 = Female, 1 = Male", reference: "0 = Female, 1 = Male" },
  { name: "cp",        label: "Chest pain type",                 type: "number", step: "1",   unit: "",      hint: "0 = None, 1 = Mild, 2 = Moderate, 3 = Severe", reference: "0=None, 1=Mild, 2=Moderate, 3=Severe" },
  { name: "trestbps",  label: "Resting blood pressure",          type: "number", step: "1",   unit: "mm Hg", hint: "At hospital admission", reference: "Normal: under 120/80 mmHg" },
  { name: "chol",      label: "Cholesterol",                     type: "number", step: "1",   unit: "mg/dL", hint: "Serum cholesterol", reference: "Desirable: <200 mg/dL" },
  { name: "fbs",       label: "Fasting blood sugar > 120 mg/dL", type: "number", step: "1",  unit: "",      hint: "0 = No, 1 = Yes", reference: "0 = No, 1 = Yes (>120 mg/dL)" },
  { name: "restecg",   label: "Resting ECG",                     type: "number", step: "1",   unit: "",      hint: "0–2 scale", reference: "0=Normal, 1=ST-T abnormality, 2=LV hypertrophy" },
  { name: "thalach",   label: "Max heart rate achieved",         type: "number", step: "1",   unit: "bpm",   hint: "During exercise", reference: "Typical: 120-200 bpm (age-dependent)" },
  { name: "exang",     label: "Exercise-induced angina",         type: "number", step: "1",   unit: "",      hint: "0 = No, 1 = Yes", reference: "0 = No, 1 = Yes" },
  { name: "oldpeak",   label: "ST depression",                   type: "number", step: "0.1", unit: "",      hint: "Relative to rest (oldpeak)", reference: "Normal: 0-1.0 mm" },
  { name: "slope",     label: "ST slope",                        type: "number", step: "1",   unit: "",      hint: "0–2 scale", reference: "0=Upsloping, 1=Flat, 2=Downsloping" },
  { name: "ca",        label: "Major vessels (colored)",         type: "number", step: "1",   unit: "",      hint: "0–3 on fluoroscopy", reference: "Range: 0-3 vessels" },
  { name: "thal",      label: "Thalassemia type",                type: "number", step: "1",   unit: "",      hint: "3 = Normal, 6 = Fixed defect, 7 = Reversible", reference: "3=Normal, 6=Fixed defect, 7=Reversible" },
];

interface PredictionResult {
  risk_score: number;
  risk_band: string;
  counterfactual_suggestions: Record<string, string> | null;
  counterfactual_original_score: number | null;
  counterfactual_improved_score: number | null;
  counterfactual_non_actionable: string[] | null;
}

type RiskBand = "low" | "moderate" | "high";
type ModelType = "diabetes" | "heart";
type FieldDef = {
  name: string;
  label: string;
  type: string;
  step: string;
  unit: string;
  hint: string;
  reference: string;
};
type HeartRangeDef = {
  key: string;
  label: string;
  unit: string;
  normalText: string;
  low?: number;
  high?: number;
};

function safeRiskBand(band: string): RiskBand {
  if (band === "high" || band === "moderate" || band === "low") return band;
  return "moderate";
}

const heartReferenceRanges: HeartRangeDef[] = [
  { key: "trestbps", label: "Resting blood pressure", unit: "mm Hg", normalText: "90-120", low: 90, high: 120 },
  { key: "chol", label: "Cholesterol", unit: "mg/dL", normalText: "Below 200", low: 0, high: 199 },
  { key: "thalach", label: "Max heart rate achieved", unit: "bpm", normalText: "120-200", low: 120, high: 200 },
  { key: "oldpeak", label: "ST depression", unit: "mm", normalText: "0.0-1.0", low: 0, high: 1.0 },
];

function getBandMessage(band: RiskBand): string {
  if (band === "low") {
    return "Your heart risk is in the low range. Keep your current habits and continue routine check-ups.";
  }
  if (band === "moderate") {
    return "Your heart risk is in the moderate range. Small, focused changes can improve your outlook.";
  }
  return "Your heart risk is elevated. Use the guidance below and discuss the result with your healthcare provider.";
}

function getHeartNextSteps(band: RiskBand): string[] {
  if (band === "low") {
    return [
      "Continue regular exercise and a heart-healthy diet.",
      "Track blood pressure and cholesterol during routine visits.",
      "Repeat this assessment after major health or lifestyle changes.",
    ];
  }
  if (band === "moderate") {
    return [
      "Focus on one or two high-impact changes first (blood pressure, cholesterol, activity).",
      "Set a follow-up with your clinician for a personalized prevention plan.",
      "Recheck key metrics in the next few weeks to monitor progress.",
    ];
  }
  return [
    "Book a clinical review soon for personalized evaluation.",
    "Prioritize blood pressure and cholesterol management now.",
    "Seek urgent care if you have chest pain, severe breathlessness, or fainting.",
  ];
}

function classifyRangeStatus(value: number, range: HeartRangeDef): "in_range" | "high" | "low" {
  if (Number.isNaN(value)) return "high";
  if (range.low !== undefined && value < range.low) return "low";
  if (range.high !== undefined && value > range.high) return "high";
  return "in_range";
}

// ─────────────────────────────────────────────
// Model toggle tabs
// ─────────────────────────────────────────────
function ModelToggle({
  value,
  onChange,
}: {
  value: "diabetes" | "heart";
  onChange: (v: "diabetes" | "heart") => void;
}) {
  const options: { key: "diabetes" | "heart"; label: string; icon: string }[] = [
    { key: "diabetes", label: "Diabetes", icon: "🩸" },
    { key: "heart",    label: "Heart Disease", icon: "🫀" },
  ];
  return (
    <div
      className="inline-flex rounded-xl border border-[var(--border)] bg-[var(--surface-overlay)] p-1"
      role="tablist"
      aria-label="Select prediction model"
    >
      {options.map((opt) => (
        <button
          key={opt.key}
          role="tab"
          aria-selected={value === opt.key}
          onClick={() => onChange(opt.key)}
          className={[
            "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150",
            value === opt.key
              ? "bg-[var(--surface-raised)] text-[var(--text-primary)] shadow-card border border-[var(--border)]"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
          ].join(" ")}
        >
          <span aria-hidden="true">{opt.icon}</span>
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────
export default function NewPredictionPage() {
  const { user } = useAuth();
  const [modelType, setModelType] = useState<ModelType>("diabetes");
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [chartLoading, setChartLoading] = useState(false);

  const resultRef = useRef<HTMLDivElement>(null);
  const explanationRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const fields: FieldDef[] = modelType === "diabetes" ? diabetesFields : heartFields;
  const isHeartModel = modelType === "heart";

  function updateField(name: string, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function handleModelChange(v: ModelType) {
    setModelType(v);
    setResult(null);
    setValues({});
    setError("");
  }

  async function fetchHistoricalData() {
    if (!patientId) return;
    
    try {
      setChartLoading(true);
      const historyData = await apiFetch<{ items: any[] }>(`/api/v1/predictions/history/${patientId}`);
      setHistoricalData(historyData.items || []);
    } catch (err) {
      console.error("Failed to fetch historical data:", err);
    } finally {
      setChartLoading(false);
    }
  }

  function getRiskTrendData() {
    return historicalData
      .filter(item => item.model_type === modelType)
      .map(item => ({
        date: new Date(item.created_at).toLocaleDateString(),
        riskScore: item.risk_score,
        modelType: item.model_type,
      }))
      .reverse();
  }

  function getMetricComparisonData() {
    const chartFields = isHeartModel
      ? heartFields.filter((f) => heartReferenceRanges.some((r) => r.key === f.name))
      : fields;
    const currentValues = chartFields.map(f => ({
      metric: f.label,
      current: parseFloat(values[f.name] || "0"),
      normal: getNormalValue(f.name),
      unit: f.unit || "",
    }));
    return currentValues;
  }

  function getNormalValue(fieldName: string) {
    const normalRanges: Record<string, number> = {
      glucose: 85,
      blood_pressure: 75,
      skin_thickness: 30,
      insulin: 90,
      bmi: 22,
      trestbps: 120,
      chol: 190,
      thalach: 160,
    };
    return normalRanges[fieldName] || 0;
  }

  const heartRangeRows = useMemo(() => {
    if (!isHeartModel) return [];
    return heartReferenceRanges.map((range) => {
      const value = Number(values[range.key] ?? "0");
      const status = classifyRangeStatus(value, range);
      return {
        ...range,
        value,
        status,
      };
    });
  }, [isHeartModel, values]);

  function handleReset() {
    setResult(null);
    setValues({});
    setError("");
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function ensurePatient(): Promise<string> {
    if (patientId) return patientId;
    if (!user) throw new Error("Please log in first.");

    try {
      const existing = await apiFetch<{ id: string }>(`/api/v1/patients/user/${user.id}`);
      setPatientId(existing.id);
      return existing.id;
    } catch {
      const created = await apiFetch<{ id: string }>("/api/v1/patients", {
        method: "POST",
        body: JSON.stringify({ user_id: user.id, external_ref: `FE-${Date.now()}` }),
      });
      setPatientId(created.id);
      return created.id;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);
    try {
      if (!user) throw new Error("Please log in first.");
      const pid = await ensurePatient();
      const features: Record<string, number> = {};
      for (const f of fields) {
        features[f.name] = parseFloat(values[f.name] || "0");
      }
      const data = await apiFetch<PredictionResult>(
        `/api/v1/predictions/${modelType}`,
        {
          method: "POST",
          body: JSON.stringify({ patient_id: pid, features }),
        }
      );
      setResult(data);
      // Fetch historical data for charts
      await fetchHistoricalData();
      // Smooth scroll to result after a brief delay for animation
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    } catch (err: any) {
      setError(err.message || "Prediction failed");
    } finally {
      setLoading(false);
    }
  }

  const band = result ? safeRiskBand(result.risk_band) : null;
  const hasSuggestions =
    result?.counterfactual_suggestions != null &&
    Object.keys(result.counterfactual_suggestions).length > 0;

  return (
    <AppShell>
      {/* ── Page header ── */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          Risk Prediction
        </h1>
        <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
          Enter clinical values below to receive an AI-powered risk assessment with plain-language guidance.
        </p>
      </div>

      <div className="mx-auto max-w-2xl">
        {/* ── Login notice ── */}
        {!user && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-900/20">
            <span className="mt-0.5 text-amber-600" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </span>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              You need to{" "}
              <a href="/login" className="font-semibold underline underline-offset-2">
                sign in
              </a>{" "}
              to run predictions. Your data is stored securely and never shared.
            </p>
          </div>
        )}

        {/* ── Error message ── */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-700 dark:bg-red-900/20 animate-slide-down">
            <span className="mt-0.5 text-risk-high shrink-0" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </span>
            <p className="text-sm text-risk-high" role="alert">{error}</p>
          </div>
        )}

        {/* ── Model selector ── */}
        <div className="mb-6">
          <ModelToggle value={modelType} onChange={handleModelChange} />
        </div>

        {/* ── Input form ── */}
        <Card variant="elevated" padding="none">
          <div className="border-b border-[var(--border)] px-5 py-4">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              Clinical Values
            </h2>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
              All fields are required. Enter the most recent values available.
            </p>
          </div>

          <form
            ref={formRef}
            id="prediction-form"
            onSubmit={handleSubmit}
            className="p-5"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {fields.map((f) => (
                <Input
                  key={f.name}
                  id={`pred-${f.name}`}
                  label={f.label}
                  unit={f.unit || undefined}
                  hint={f.hint || undefined}
                  reference={!isHeartModel ? f.reference || undefined : undefined}
                  type={f.type}
                  step={f.step}
                  value={values[f.name] || ""}
                  onChange={(e) => updateField(f.name, e.target.value)}
                  required
                  placeholder={`e.g. ${f.step === "1" ? "0" : "0.0"}`}
                />
              ))}
            </div>

            <div className="mt-6">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                disabled={!user}
                className="w-full"
                id="run-prediction-btn"
              >
                {loading ? "Analyzing…" : "Run Risk Assessment"}
              </Button>
              {loading && (
                <p className="mt-2 text-center text-xs text-[var(--text-muted)] animate-fade-in">
                  Running the prediction model — this takes a moment…
                </p>
              )}
            </div>
          </form>
        </Card>

        {/* ── Result area ── */}
        {result && band && (
          <div
            ref={resultRef}
            className="mt-8 flex flex-col gap-6 animate-fade-up"
            aria-live="polite"
            aria-label="Prediction result"
          >
            {/* ── Score card ── */}
            <Card variant="elevated" padding="none">
              <div className="border-b border-[var(--border)] px-5 py-4 flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-[var(--text-primary)]">
                  Your Risk Assessment
                </h2>
                <Badge variant="risk" band={band} />
              </div>

              <div className="grid gap-5 p-6 md:grid-cols-[auto,1fr] md:items-center">
                <div className="mx-auto">
                  <RiskMeter score={result.risk_score} band={band} />
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {isHeartModel ? getBandMessage(band) : (
                      <>
                        {band === "low" && "Your risk is within the low range. Keep up your healthy habits and schedule regular check-ups."}
                        {band === "moderate" && "Your risk is in the moderate range. Targeted lifestyle changes can make a meaningful difference."}
                        {band === "high" && "Your risk is elevated. We recommend reviewing the guidance below and discussing with a healthcare provider."}
                      </>
                    )}
                  </p>
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-overlay)] px-3.5 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                      Model confidence context
                    </p>
                    <p className="mt-1 text-sm text-[var(--text-primary)]">
                      Estimated risk score: <span className="font-semibold">{(result.risk_score * 100).toFixed(1)}%</span>. This is a risk estimate, not a diagnosis.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {isHeartModel && (
              <Card variant="default" padding="md">
                <div className="mb-3">
                  <h3 className="text-base font-semibold text-[var(--text-primary)]">
                    Recommended Next Steps
                  </h3>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">
                    Focus on these practical actions first.
                  </p>
                </div>
                <ul className="space-y-2">
                  {getHeartNextSteps(band).map((step) => (
                    <li
                      key={step}
                      className="rounded-lg border border-[var(--border)] bg-[var(--surface-overlay)] px-3 py-2 text-sm text-[var(--text-secondary)]"
                    >
                      {step}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* ── Counterfactual block ── */}
            {hasSuggestions && (
              <div ref={explanationRef} id="explanation-section">
                <h2 className="mb-3 text-base font-semibold text-[var(--text-primary)]">
                  How to Improve Your Result
                </h2>
                <CounterfactualBlock
                  suggestions={result.counterfactual_suggestions!}
                  originalScore={result.counterfactual_original_score}
                  improvedScore={result.counterfactual_improved_score}
                  band={band}
                  modelType={modelType}
                  nonActionableNotes={result.counterfactual_non_actionable ?? []}
                />
              </div>
            )}

            {/* ── No suggestions fallback ── */}
            {!hasSuggestions && (
              <Card variant="inset" padding="md">
                <p className="text-sm text-[var(--text-secondary)] text-center leading-relaxed">
                  No specific counterfactual suggestions were generated for this result. This may occur when the model determines current values are already well-optimized.
                </p>
              </Card>
            )}

            {/* ── Reference ranges ── */}
            <Card variant="default" padding="md">
              <div className="mb-4">
                <h3 className="text-base font-semibold text-[var(--text-primary)]">
                  {isHeartModel ? "Reference Ranges" : "Current vs Normal Ranges"}
                </h3>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  {isHeartModel
                    ? "Compare your key heart metrics with expected ranges."
                    : "How your values compare to normal ranges."}
                </p>
              </div>
              {isHeartModel ? (
                <div className="space-y-2">
                  {heartRangeRows.map((row) => (
                    <div
                      key={row.key}
                      className="grid grid-cols-1 gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-overlay)] px-3.5 py-3 sm:grid-cols-[1.5fr,1fr,1fr,auto] sm:items-center"
                    >
                      <p className="text-sm font-medium text-[var(--text-primary)]">{row.label}</p>
                      <p className="text-sm text-[var(--text-secondary)]">
                        Your value: <span className="font-semibold text-[var(--text-primary)]">{row.value} {row.unit}</span>
                      </p>
                      <p className="text-sm text-[var(--text-secondary)]">
                        Reference: <span className="font-semibold text-[var(--text-primary)]">{row.normalText} {row.unit}</span>
                      </p>
                      <span
                        className={[
                          "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold w-fit",
                          row.status === "in_range"
                            ? "bg-risk-low-bg text-risk-low ring-1 ring-risk-low-ring"
                            : "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-300",
                        ].join(" ")}
                      >
                        {row.status === "in_range" ? "Within range" : "Needs attention"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <MetricComparisonChart data={getMetricComparisonData()} height={300} />
              )}
            </Card>

            {/* ── Advanced details ── */}
            <details className="group rounded-xl border border-[var(--border)] bg-[var(--surface)]">
              <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-[var(--text-primary)] flex items-center justify-between">
                Advanced details
                <span className="text-[var(--text-muted)] transition-transform group-open:rotate-180" aria-hidden="true">v</span>
              </summary>
              <div className="border-t border-[var(--border)] p-4">
                <div className="mb-4">
                  <h3 className="text-base font-semibold text-[var(--text-primary)]">
                    Risk Score Trend
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] mt-1">
                    Your {modelType} risk score over time
                  </p>
                </div>
                {chartLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand)]"></div>
                  </div>
                ) : (
                  <RiskTrendChart data={getRiskTrendData()} height={250} />
                )}
              </div>
            </details>
          </div>
        )}
      </div>

      {/* ── Floating action buttons ── */}
      <FloatingActions
        actions={[
          {
            id: "scroll-result",
            icon: <ScrollDownIcon />,
            label: "View Results",
            onClick: () => resultRef.current?.scrollIntoView({ behavior: "smooth" }),
            visible: !!result,
          },
          {
            id: "scroll-explanation",
            icon: <LightbulbIcon />,
            label: "Explanation",
            onClick: () => explanationRef.current?.scrollIntoView({ behavior: "smooth" }),
            visible: !!result && hasSuggestions,
          },
          {
            id: "reset",
            icon: <ResetIcon />,
            label: "Reset Form",
            onClick: handleReset,
            visible: !!result,
          },
          {
            id: "scroll-top",
            icon: <ScrollTopIcon />,
            label: "Back to Top",
            onClick: () => window.scrollTo({ top: 0, behavior: "smooth" }),
            visible: !!result,
          },
        ]}
      />
    </AppShell>
  );
}
