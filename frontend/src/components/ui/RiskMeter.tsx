"use client";

import { useEffect, useRef } from "react";

type RiskBand = "low" | "moderate" | "high";

interface RiskMeterProps {
  score: number;     // 0–1
  band: RiskBand;
  size?: number;     // px diameter, default 160
  animate?: boolean;
}

const bandConfig: Record<RiskBand, { stroke: string; label: string; textColor: string }> = {
  low:      { stroke: "hsl(158 55% 40%)", label: "Low Risk",      textColor: "text-risk-low" },
  moderate: { stroke: "hsl(38 90% 42%)",  label: "Moderate Risk", textColor: "text-risk-mod" },
  high:     { stroke: "hsl(355 65% 45%)", label: "High Risk",     textColor: "text-risk-high" },
};

export function RiskMeter({ score, band, size = 160, animate = true }: RiskMeterProps) {
  const clampedScore = Math.min(1, Math.max(0, score));
  const config = bandConfig[band];

  const r = (size * 0.38);
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  // Arc goes 270° (¾ circle), offset = 135° rotation
  const arcLen = circumference * 0.75;
  const fillLen = arcLen * clampedScore;
  const dashOffset = arcLen - fillLen;

  const circleRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (!circleRef.current || !animate) return;
    // Start at zero fill, animate to target
    circleRef.current.style.strokeDashoffset = String(arcLen);
    const frame = requestAnimationFrame(() => {
      if (!circleRef.current) return;
      circleRef.current.style.transition = "stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1)";
      circleRef.current.style.strokeDashoffset = String(dashOffset);
    });
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score, band]);

  return (
    <div className="flex flex-col items-center gap-3" role="img" aria-label={`Risk meter: ${(clampedScore * 100).toFixed(1)}% — ${config.label}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          aria-hidden="true"
          style={{ transform: "rotate(135deg)" }}
        >
          {/* Track */}
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke="var(--border)"
            strokeWidth={size * 0.07}
            strokeDasharray={`${arcLen} ${circumference - arcLen}`}
            strokeLinecap="round"
          />
          {/* Fill */}
          <circle
            ref={circleRef}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={config.stroke}
            strokeWidth={size * 0.07}
            strokeDasharray={`${arcLen} ${circumference - arcLen}`}
            strokeDashoffset={animate ? arcLen : dashOffset}
            strokeLinecap="round"
          />
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={["text-3xl font-extrabold tabular-nums tracking-tight", config.textColor].join(" ")}>
            {(clampedScore * 100).toFixed(1)}%
          </span>
          <span className="text-xs font-medium text-[var(--text-muted)] mt-0.5">risk score</span>
        </div>
      </div>

      {/* Band label below */}
      <div className={["text-sm font-semibold", config.textColor].join(" ")}>
        {config.label}
      </div>
    </div>
  );
}
