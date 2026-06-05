import { type HTMLAttributes } from "react";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  height?: string;
  width?: string;
  rounded?: string;
  lines?: number;
  gap?: string;
}

export function Skeleton({
  height  = "h-4",
  width   = "w-full",
  rounded = "rounded-lg",
  lines   = 1,
  gap     = "gap-2.5",
  className = "",
  ...rest
}: SkeletonProps) {
  if (lines === 1) {
    return (
      <div
        className={["skeleton", height, width, rounded, className].join(" ")}
        aria-hidden="true"
        {...rest}
      />
    );
  }

  return (
    <div className={["flex flex-col", gap].join(" ")} aria-hidden="true" {...rest}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={[
            "skeleton",
            height,
            // Make last line shorter for a natural text-block look
            i === lines - 1 ? "w-3/4" : "w-full",
            rounded,
          ].join(" ")}
        />
      ))}
    </div>
  );
}

// Convenience card-level skeleton
export function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={[
        "rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)] p-5",
        className,
      ].join(" ")}
    >
      <Skeleton height="h-5" width="w-1/2" className="mb-4" />
      <Skeleton lines={3} height="h-3.5" />
    </div>
  );
}
