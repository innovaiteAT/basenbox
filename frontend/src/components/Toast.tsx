import { AlertCircle, CheckCircle2 } from "lucide-react";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type Tone = "ok" | "error";
interface ToastState {
  id: number;
  text: string;
  tone: Tone;
}

const ToastContext = createContext<(text: string, tone?: Tone) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const show = useCallback((text: string, tone: Tone = "ok") => {
    const id = Date.now();
    setToast({ id, text, tone });
    setTimeout(() => setToast((t) => (t?.id === id ? null : t)), tone === "error" ? 6000 : 2600);
  }, []);
  return (
    <ToastContext.Provider value={show}>
      {children}
      <div aria-live="polite">
        {toast && (
          <div className={`toast ${toast.tone === "error" ? "toast--error" : ""}`} role="status">
            {toast.tone === "error" ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            {toast.text}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
