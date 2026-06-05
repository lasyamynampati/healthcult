"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface RiskTrendData {
  date: string;
  riskScore: number;
  modelType: string;
}

interface MetricComparisonData {
  metric: string;
  current: number;
  normal: number;
  unit: string;
}

interface RiskTrendChartProps {
  data: RiskTrendData[];
  height?: number;
}

export function RiskTrendChart({ data, height = 300 }: RiskTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-[var(--text-muted)]">
        <div className="text-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-2">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
            <polyline points="16 7 22 7 22 13"/>
          </svg>
          <p className="text-sm">No trend data available</p>
          <p className="text-xs">Run multiple predictions to see trends</p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis 
          dataKey="date" 
          stroke="var(--text-muted)"
          fontSize={12}
        />
        <YAxis 
          stroke="var(--text-muted)"
          fontSize={12}
          domain={[0, 1]}
          tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: "var(--surface-raised)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
          }}
          formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, "Risk Score"]}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="riskScore" 
          stroke="var(--brand)" 
          strokeWidth={2}
          dot={{ fill: "var(--brand)", r: 4 }}
          name="Risk Score"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

interface MetricComparisonChartProps {
  data: MetricComparisonData[];
  height?: number;
}

export function MetricComparisonChart({ data, height = 300 }: MetricComparisonChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-[var(--text-muted)]">
        <div className="text-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-2">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <p className="text-sm">No comparison data available</p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis 
          dataKey="metric" 
          stroke="var(--text-muted)"
          fontSize={12}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis stroke="var(--text-muted)" fontSize={12} />
        <Tooltip 
          contentStyle={{
            backgroundColor: "var(--surface-raised)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
          }}
          formatter={(value: number, name: string) => [
            `${value} ${data[0]?.unit || ""}`,
            name === "current" ? "Current Value" : "Normal Range"
          ]}
        />
        <Legend />
        <Bar dataKey="current" fill="var(--brand)" name="Current Value" />
        <Bar dataKey="normal" fill="var(--brand-light)" name="Normal Range" />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface RadarChartProps {
  data: any[];
  metrics: string[];
  height?: number;
}

export function MetricsRadarChart({ data, metrics, height = 300 }: RadarChartProps) {
  if (!data || data.length === 0 || !metrics || metrics.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-[var(--text-muted)]">
        <div className="text-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-2">
            <circle cx="12" cy="12" r="9"/>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <p className="text-sm">No radar data available</p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data}>
        <PolarGrid stroke="var(--border)" />
        <PolarAngleAxis 
          dataKey="metric" 
          stroke="var(--text-muted)"
          fontSize={12}
        />
        <PolarRadiusAxis 
          stroke="var(--text-muted)"
          fontSize={10}
        />
        <Radar 
          name="Current Values" 
          dataKey="value" 
          stroke="var(--brand)" 
          fill="var(--brand)" 
          fillOpacity={0.3}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: "var(--surface-raised)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
