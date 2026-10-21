import { FileSpreadsheet } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { Deco } from "./BadgeTrio";

interface Props {
  onFile: (file: File) => void;
  busy?: boolean;
  title: ReactNode;
  hint: ReactNode;
}

export function Dropzone({ onFile, busy, title, hint }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [active, setActive] = useState(false);
  const open = () => !busy && input.current?.click();
  const pick = (files: FileList | null) => {
    if (files && files[0]) onFile(files[0]);
  };
  return (
    <div
      className={`dropzone ${active ? "dropzone--active" : ""}`}
      role="button"
      tabIndex={0}
      aria-busy={busy}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setActive(true);
      }}
      onDragLeave={() => setActive(false)}
      onDrop={(e) => {
        e.preventDefault();
        setActive(false);
        if (!busy) pick(e.dataTransfer.files);
      }}
    >
      <Deco size={260} color="var(--bb-mist)" style={{ left: -90, bottom: -120 }} />
      <Deco size={140} color="var(--bb-lemon)" style={{ right: -40, top: -50, opacity: 0.5 }} />
      <div className="dropzone__circle">
        {busy ? <span className="spinner" style={{ width: 32, height: 32 }} /> : <FileSpreadsheet size={40} />}
      </div>
      <h2>{title}</h2>
      <p>{hint}</p>
      <input
        ref={input}
        type="file"
        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          pick(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
