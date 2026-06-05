import { type HTMLAttributes } from "react";

type CardVariant = "default" | "elevated" | "glass" | "inset";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: "none" | "sm" | "md" | "lg";
}

const variantClasses: Record<CardVariant, string> = {
  default:  "bg-[var(--surface-raised)] border border-[var(--border)] shadow-card",
  elevated: "bg-[var(--surface-raised)] border border-[var(--border)] shadow-card-md",
  glass:    "card-glass shadow-card-md",
  inset:    "bg-[var(--surface-overlay)] border border-[var(--border)]",
};

const paddingClasses: Record<NonNullable<CardProps["padding"]>, string> = {
  none: "",
  sm:   "p-3",
  md:   "p-5",
  lg:   "p-7",
};

export function Card({
  variant  = "default",
  padding  = "md",
  className = "",
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={[
        "rounded-2xl overflow-hidden transition-colors duration-200",
        variantClasses[variant],
        paddingClasses[padding],
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={["border-b border-[var(--border)] px-5 py-4", className].join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardBody({ className = "", children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={["p-5", className].join(" ")} {...rest}>
      {children}
    </div>
  );
}

export function CardFooter({ className = "", children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={["border-t border-[var(--border)] px-5 py-4 bg-[var(--surface-overlay)]", className].join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
}
