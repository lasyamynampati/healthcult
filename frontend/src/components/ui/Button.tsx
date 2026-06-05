"use client";

import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size    = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary: [
    "bg-[var(--brand)] text-white",
    "hover:brightness-110 hover:shadow-card-md",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100 disabled:hover:shadow-none",
    "focus-visible:ring-2 focus-visible:ring-[var(--brand-ring)] focus-visible:ring-offset-2",
  ].join(" "),

  secondary: [
    "bg-[var(--surface-overlay)] text-[var(--text-primary)] border border-[var(--border)]",
    "hover:bg-[var(--surface-raised)] hover:border-[var(--border-strong)]",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "focus-visible:ring-2 focus-visible:ring-[var(--brand-ring)] focus-visible:ring-offset-2",
  ].join(" "),

  ghost: [
    "bg-transparent text-[var(--text-secondary)]",
    "hover:bg-[var(--surface-overlay)] hover:text-[var(--text-primary)]",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "focus-visible:ring-2 focus-visible:ring-[var(--brand-ring)] focus-visible:ring-offset-2",
  ].join(" "),

  danger: [
    "bg-risk-high text-white",
    "hover:brightness-110",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "focus-visible:ring-2 focus-visible:ring-risk-high/50 focus-visible:ring-offset-2",
  ].join(" "),
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8  px-3   text-xs  rounded-lg  gap-1.5",
  md: "h-10 px-4   text-sm  rounded-xl  gap-2",
  lg: "h-12 px-6   text-base rounded-xl gap-2.5",
};

const Spinner = () => (
  <svg
    className="animate-spin h-4 w-4"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12" cy="12" r="10"
      stroke="currentColor" strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
    />
  </svg>
);

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size    = "md",
      loading = false,
      iconLeft,
      iconRight,
      children,
      className = "",
      disabled,
      ...rest
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={[
          "inline-flex items-center justify-center font-medium transition-all duration-150 select-none",
          variantClasses[variant],
          sizeClasses[size],
          className,
        ].join(" ")}
        {...rest}
      >
        {loading ? (
          <Spinner />
        ) : (
          iconLeft && <span className="shrink-0">{iconLeft}</span>
        )}
        {children && <span>{children}</span>}
        {!loading && iconRight && <span className="shrink-0">{iconRight}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
