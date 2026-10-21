import { CalendarDays, FileSpreadsheet, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { Run, RunSummary } from "../api/types";
import { Deco } from "../components/BadgeTrio";
import { Button } from "../components/Button";
import { IconCircle } from "../components/Card";
import { Notice } from "../components/Notice";
import { Title } from "../components/Title";
import { useToast } from "../components/Toast";
import { formatDate } from "../lib";

interface Props {
  currentId?: string;
  onOpen: (run: Run) => void;
  onNew: () => void;
}

export function HistoryScreen({ currentId, onOpen, onNew }: Props) {
  const toast = useToast();
  const [runs, setRuns] = useState<RunSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [opening, setOpening] = useState<string | null>(null);

  useEffect(() => {
    api
      .runs()
      .then(setRuns)
      .catch((e) => setError(e.message));
  }, []);

  const open = async (id: string) => {
    setOpening(id);
    try {
      onOpen(await api.run(id));
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setOpening(null);
    }
  };

  return (
    <>
      <Title
        kicker="Frühere Tage"
        light="Ver"
        bold="lauf"
        lead="Jeder Liefertag mit seinen Dateien. Öffne einen Tag, um weiterzumachen oder Dateien erneut zu laden."
        aside={
          <Button variant="lemon" icon={<Plus size={18} />} onClick={onNew}>
            Neuer Tag
          </Button>
        }
      />
      {error && <Notice tone="warn">{error}</Notice>}
      {!runs && !error && (
        <div className="actions muted">
          <span className="spinner" aria-hidden /> Lade Verlauf …
        </div>
      )}
      {runs && runs.length === 0 && (
        <div className="empty">
          <Deco size={240} color="var(--bb-lemon)" style={{ right: -80, top: -100, opacity: 0.6 }} />
          <Deco size={120} color="var(--bb-lime)" style={{ left: -30, bottom: -40, opacity: 0.6 }} />
          <h2 style={{ marginTop: 0 }}>Noch keine Liefertage</h2>
          <p className="muted">Sobald du eine Gesamtliste hochlädst, taucht sie hier auf.</p>
          <Button onClick={onNew}>Erste Liste hochladen</Button>
        </div>
      )}
      {runs && runs.length > 0 && (
        <div className="grid grid--3">
          {runs.map((r) => (
            <button
              key={r.id}
              type="button"
              className="card card--hover"
              style={{ textAlign: "left", border: r.id === currentId ? "2px solid var(--bb-ink)" : "2px solid transparent", cursor: "pointer" }}
              onClick={() => open(r.id)}
              aria-busy={opening === r.id}
            >
              <div className="card__head" style={{ marginBottom: 8 }}>
                <IconCircle tone={r.files.length ? "lime" : "lemon"}>
                  {opening === r.id ? <span className="spinner" /> : r.files.length ? <FileSpreadsheet size={20} /> : <CalendarDays size={20} />}
                </IconCircle>
                <div>
                  <h3>
                    {r.delivery.weekday} {r.delivery.label}
                  </h3>
                  <p>
                    KW {r.delivery.iso_week} · {formatDate(r.delivery.date)}
                  </p>
                </div>
              </div>
              <div className="actions" style={{ gap: 8 }}>
                <span className="pill pill--mist">{r.boxes} Boxen</span>
                {r.files.length ? <span className="pill pill--lime">{r.files.length} Dateien</span> : <span className="pill pill--mist">in Arbeit</span>}
                {r.open_reviews > 0 && <span className="pill pill--coral">{r.open_reviews} offen</span>}
              </div>
            </button>
          ))}
        </div>
      )}
    </>
  );
}
