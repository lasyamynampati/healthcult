import { type InputHTMLAttributes, type ReactNode, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  unit?: string;
  hint?: string;
  reference?: string;
  error?: string;
  id: string;
  suffix?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, unit, hint, reference, error, id, suffix, className = "", ...rest }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={id} className="text-sm font-medium text-[var(--text-primary)]">
          {label}
          {unit && (
            <span className="ml-1.5 text-xs font-normal text-[var(--text-muted)]">
              ({unit})
            </span>
          )}
        </label>

        <div className="relative flex items-center">
          <input
            ref={ref}
            id={id}
            className={[
              "w-full rounded-xl border border-[var(--border)]",
              "bg-[var(--surface-raised)] text-[var(--text-primary)]",
              "px-3.5 py-2.5 text-sm",
              "placeholder:text-[var(--text-muted)]",
              "transition-colors duration-150",
              "hover:border-[var(--border-strong)]",
              error ? "border-risk-high focus:border-risk-high" : "",
              suffix ? "pr-10" : "",
              className,
            ].join(" ")}
            {...rest}
          />
          {suffix && (
            <span className="absolute right-3 text-[var(--text-muted)]">{suffix}</span>
          )}
        </div>

        {hint && !error && (
          <p className="text-xs text-[var(--text-muted)]">{hint}</p>
        )}
        {reference && !error && (
          <p className="text-xs text-[var(--text-muted)] italic">{reference}</p>
        )}
        {error && (
          <p className="text-xs text-risk-high" role="alert">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
