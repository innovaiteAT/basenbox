import type { ButtonHTMLAttributes, ReactNode } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "ink" | "lemon" | "ghost";
  small?: boolean;
  loading?: boolean;
  icon?: ReactNode;
}

export function Button({ variant = "ink", small, loading, icon, children, className = "", disabled, ...rest }: Props) {
  const cls = ["btn", variant !== "ink" && `btn--${variant}`, small && "btn--small", className].filter(Boolean).join(" ");
  return (
    <button className={cls} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading ? <span className="spinner" aria-hidden /> : icon}
      {children}
    </button>
  );
}
