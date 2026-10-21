import type { ReactNode } from "react";

export interface ChecklistItem {
  id: string;
  title: ReactNode;
  body?: ReactNode;
}

interface Props {
  items: ChecklistItem[];
  done: Record<string, boolean>;
  onToggle: (id: string, value: boolean) => void;
}

export function Checklist({ items, done, onToggle }: Props) {
  return (
    <ol className="checklist">
      {items.map((item) => {
        const checked = !!done[item.id];
        return (
          <li key={item.id} className={`check ${checked ? "check--done" : ""}`}>
            <input
              type="checkbox"
              className="check__box"
              id={`chk-${item.id}`}
              checked={checked}
              onChange={(e) => onToggle(item.id, e.target.checked)}
            />
            <div className="check__body">
              <label htmlFor={`chk-${item.id}`} className="check__title">
                {item.title}
              </label>
              {item.body}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function Progress({ value, total, label }: { value: number; total: number; label: string }) {
  return (
    <div className="progress" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={total} aria-valuenow={value}>
      <span style={{ width: `${total ? (value / total) * 100 : 0}%` }} />
    </div>
  );
}
