import { Check, Copy } from "lucide-react";
import { useState } from "react";

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback, falls die Clipboard-API fehlt (kein HTTPS, kein localhost)
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }
}

export function CopyButton({ value, label = "Kopieren" }: { value: string; label?: string }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    if (await copyText(value)) {
      setDone(true);
      setTimeout(() => setDone(false), 1600);
    }
  };
  return (
    <button type="button" className="btn btn--ghost btn--small" onClick={copy}>
      {done ? <Check size={16} /> : <Copy size={16} />}
      {done ? "Kopiert" : label}
    </button>
  );
}

export function CopyField({ value, label, display }: { value: string; label?: string; display?: string }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    if (await copyText(value)) {
      setDone(true);
      setTimeout(() => setDone(false), 1600);
    }
  };
  return (
    <div className="copy">
      <div className="copy__value">{display ?? value}</div>
      <button type="button" onClick={copy} aria-label={`${label ?? "Text"} kopieren`}>
        {done ? <Check size={16} /> : <Copy size={16} />}
        <span>{done ? "Kopiert" : "Kopieren"}</span>
      </button>
    </div>
  );
}
