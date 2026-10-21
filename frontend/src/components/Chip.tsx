import { X } from "lucide-react";
import type { ReactNode } from "react";

export type ChipTone = "F" | "M" | "A" | "addon" | "muted" | "custom";

interface Props {
  tone?: ChipTone;
  children: ReactNode;
  onClick?: () => void;
  onRemove?: () => void;
  active?: boolean;
}

export function Chip({ tone, children, onClick, onRemove, active }: Props) {
  return (
    <span className={`chip ${tone ? `chip--${tone}` : ""}`}>
      <button type="button" className="chip__main" onClick={onClick} aria-expanded={active}>
        {children}
      </button>
      {onRemove && (
        <button type="button" className="chip__remove" onClick={onRemove} aria-label="Wunsch entfernen">
          <X size={14} />
        </button>
      )}
    </span>
  );
}
