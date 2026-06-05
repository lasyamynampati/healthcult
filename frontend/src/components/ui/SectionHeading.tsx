import { type HTMLAttributes } from "react";

interface SectionHeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4";
  sub?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  accent?: boolean;
}

const sizeMap: Record<NonNullable<SectionHeadingProps["size"]>, string> = {
  xs: "text-sm  font-semibold",
  sm: "text-base font-semibold",
  md: "text-lg  font-bold",
  lg: "text-2xl font-bold",
  xl: "text-3xl font-extrabold tracking-tight",
};

const subSizeMap: Record<NonNullable<SectionHeadingProps["size"]>, string> = {
  xs: "text-xs",
  sm: "text-xs",
  md: "text-sm",
  lg: "text-sm",
  xl: "text-base",
};

export function SectionHeading({
  as: Tag = "h2",
  sub,
  size = "md",
  accent = false,
  className = "",
  children,
  ...rest
}: SectionHeadingProps) {
  return (
    <div className={["flex flex-col gap-1", className].join(" ")}>
      <Tag
        className={[
          sizeMap[size],
          accent ? "gradient-text" : "text-[var(--text-primary)]",
        ].join(" ")}
        {...rest}
      >
        {children}
      </Tag>
      {sub && (
        <p className={["text-[var(--text-secondary)] leading-relaxed", subSizeMap[size]].join(" ")}>
          {sub}
        </p>
      )}
    </div>
  );
}
