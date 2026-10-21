import { AlertTriangle, Info } from "lucide-react";
import type { ReactNode } from "react";

type Tone = "info" | "warn" | "strong" | "lemon";

export function Notice({ children, tone = "info", icon }: { children: ReactNode; tone?: Tone; icon?: ReactNode }) {
  return (
    <div className={`notice notice--${tone}`} role={tone === "warn" || tone === "strong" ? "alert" : undefined}>
      <span className="icon-circle" aria-hidden>
        {icon ?? (tone === "info" || tone === "lemon" ? <Info size={16} /> : <AlertTriangle size={16} />)}
      </span>
      <div style={{ paddingTop: 4, minWidth: 0 }}>{children}</div>
    </div>
  );
}
