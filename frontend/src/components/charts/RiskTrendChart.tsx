"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
  CartesianGrid,
  type TooltipProps,
} from "recharts";

interface DataPoint {
  month: string;
  risk: number;
}

interface RiskTrendChartProps {
  data?: DataPoint[];
  title?: string;
  height?: number;
}

const defaultData: DataPoint[] = [
  { month: "Jan", risk: 0.68 },
  { month: "Feb", risk: 0.61 },
  { month: "Mar", risk: 0.58 },
  { month: "Apr", risk: 0.52 },
];

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  if (val == null) return null;
  return (
    <div
      className="rounded-xl border px-3 py-2 text-sm shadow-card-md"
      style={{
        background: "var(--surface-raised)",
        borderColor: "var(--border)",
        color: "var(--text-primary)",
      }}
    >
      <p className="font-semibold">{label}</p>
      <p className="mt-0.5" style={{ color: "var(--brand)" }}>
        Risk: {(val * 100).toFixed(1)}%
      </p>
    </div>
  );
}

export function RiskTrendChart({
  data = defaultData,
  title = "Risk Trend",
  height = 240,
}: RiskTrendChartProps) {
  return (
    <div
      className="rounded-2xl border p-4"
      style={{ background: "var(--surface-raised)", borderColor: "var(--border)" }}
    >
      <p
        className="mb-3 text-xs font-semibold uppercase tracking-widest"
        style={{ color: "var(--text-muted)" }}
      >
        {title}
      </p>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="var(--brand)" stopOpacity={0.18} />
              <stop offset="95%" stopColor="var(--brand)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="4 4"
            stroke="var(--border)"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: "var(--text-muted)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 1]}
            tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
            tick={{ fontSize: 11, fill: "var(--text-muted)" }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="risk"
            stroke="var(--brand)"
            strokeWidth={2.5}
            fill="url(#riskGradient)"
            dot={{ fill: "var(--brand)", r: 4, strokeWidth: 0 }}
            activeDot={{ fill: "var(--brand)", r: 6, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
