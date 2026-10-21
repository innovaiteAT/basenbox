import { Check } from "lucide-react";

interface Props {
  steps: string[];
  current: number;
  reachable: number;
  onSelect: (i: number) => void;
}

export function Stepper({ steps, current, reachable, onSelect }: Props) {
  return (
    <nav aria-label="Ablauf">
      <ol className="stepper">
        {steps.map((label, i) => (
          <li key={label}>
            <button
              type="button"
              className={`step ${i < current ? "step--done" : ""}`}
              aria-current={i === current ? "step" : undefined}
              aria-label={`Schritt ${i + 1}: ${label}`}
              disabled={i > reachable}
              onClick={() => onSelect(i)}
            >
              <span className="step__dot">{i < current ? <Check size={18} /> : i + 1}</span>
              <span className="step__label">{label}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
