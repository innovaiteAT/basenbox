import type { ReactNode } from "react";

type Tone = "lemon" | "lime" | "coral" | "mist";

interface Props {
  children: ReactNode;
  white?: boolean;
  className?: string;
  icon?: ReactNode;
  iconTone?: Tone;
  title?: ReactNode;
  subtitle?: ReactNode;
  aside?: ReactNode;
}

export function Card({ children, white, className = "", icon, iconTone = "mist", title, subtitle, aside }: Props) {
  return (
    <section className={`card ${white ? "card--white" : ""} ${className}`}>
      {(title || icon) && (
        <div className="card__head">
          {icon && <IconCircle tone={iconTone}>{icon}</IconCircle>}
          <div style={{ flex: 1, minWidth: 0 }}>
            {title && <h3>{title}</h3>}
            {subtitle && <p>{subtitle}</p>}
          </div>
          {aside}
        </div>
      )}
      {children}
    </section>
  );
}

export function IconCircle({ children, tone = "mist" }: { children: ReactNode; tone?: Tone }) {
  return (
    <span className={`icon-circle ${tone !== "mist" ? `icon-circle--${tone}` : ""}`} aria-hidden>
      {children}
    </span>
  );
}
