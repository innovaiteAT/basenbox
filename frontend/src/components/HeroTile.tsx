import type { CSSProperties } from "react";
import type { Meal } from "../api/types";

interface Props {
  label: string;
  value: number;
  sub?: string;
  meal?: Meal;
  expanded?: boolean;
  onClick?: () => void;
}

export function HeroTile({ label, value, sub, meal, expanded, onClick }: Props) {
  return (
    <button
      type="button"
      className="hero"
      style={meal ? ({ "--meal-color": `var(--meal-${meal})` } as CSSProperties) : undefined}
      onClick={onClick}
      aria-expanded={expanded}
    >
      <div className="hero__label">{label}</div>
      <div className="hero__value">{value}</div>
      <div className="hero__sub">{sub}</div>
    </button>
  );
}

interface MetricProps {
  label: string;
  value: number;
  onClick?: () => void;
  expanded?: boolean;
}

export function Metric({ label, value, onClick, expanded }: MetricProps) {
  return (
    <button type="button" className="metric" onClick={onClick} aria-expanded={expanded}>
      <div className="metric__value">{value}</div>
      <div className="metric__label">{label}</div>
    </button>
  );
}
