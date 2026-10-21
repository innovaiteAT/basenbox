import { ArrowRight, CalendarDays, Package, RotateCcw, Sparkles } from "lucide-react";
import { useState } from "react";
import { api } from "../api/client";
import type { Run, RunPatch } from "../api/types";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Dropzone } from "../components/Dropzone";
import { Notice } from "../components/Notice";
import { Title } from "../components/Title";
import { useToast } from "../components/Toast";

interface Props {
  run: Run | null;
  busy: boolean;
  patch: (p: RunPatch) => Promise<Run | null>;
  onUploaded: (run: Run) => void;
  onReset: () => void;
  go: (step: number) => void;
}

export function UploadScreen({ run, busy, patch, onUploaded, onReset, go }: Props) {
  const toast = useToast();
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      toast("Bitte die Gesamtliste als .xlsx hochladen.", "error");
      return;
    }
    setUploading(true);
    try {
      onUploaded(await api.upload(file));
      toast("Gesamtliste eingelesen");
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setUploading(false);
    }
  };

  if (!run) {
    return (
      <>
        <Title
          kicker="Schritt 1 · Gesamtliste"
          light="Tages"
          bold="ablauf"
          lead="Exportiere im Backoffice die Lieferungen für morgen als Excel und speichere sie als „TT.MM. Gesamt.xlsx“. Den Rest erledigen wir gemeinsam."
        />
        <Dropzone
          onFile={upload}
          busy={uploading}
          title={uploading ? "Liste wird gelesen …" : "Zieh die Gesamtliste hier rein"}
          hint="oder klick, um die Datei auszuwählen · nur .xlsx, bis 10 MB"
        />
      </>
    );
  }

  const d = run.delivery;
  const boxWarning = run.warnings.find((w) => w.code === "boxes");
  const otherWarnings = run.warnings.filter((w) => w.code === "no_special");
  return (
    <>
      <Title kicker="Schritt 1 · Gesamtliste" light="Liste " bold="erkannt" lead={`Aus „${run.source_name}“ gelesen. Passt das Lieferdatum?`} />
      <div className="grid grid--3">
        <Card icon={<CalendarDays size={20} />} iconTone="lemon" title="Lieferdatum" subtitle={`${d.weekday} · KW ${d.iso_week}`}>
          <div className="field">
            <label htmlFor="delivery-date">Datum ändern</label>
            <input
              id="delivery-date"
              className="input"
              type="date"
              value={d.date}
              disabled={busy}
              onChange={(e) => e.target.value && patch({ delivery_date: e.target.value })}
            />
          </div>
        </Card>
        <Card icon={<Package size={20} />} iconTone="lime" title="Boxen" subtitle="Zeilen mit Bestellnummer">
          <div className="hero__value" style={{ margin: 0 }}>
            {run.boxes}
          </div>
        </Card>
        <Card icon={<Sparkles size={20} />} iconTone="coral" title="Wünsche" subtitle="automatisch erkannt">
          <div className="hero__value" style={{ margin: 0 }}>
            {run.totals.relevant_rows.length}
          </div>
          <p className="muted small" style={{ margin: 0 }}>
            Zeilen mit Wunsch · {run.results.reduce((n, r) => n + r.review.length, 0)} zum Prüfen
          </p>
        </Card>
      </div>
      <div style={{ marginTop: 16 }}>
        {boxWarning && <Notice tone="warn">{boxWarning.message}</Notice>}
        {otherWarnings.map((w) => (
          <Notice key={w.code}>{w.message}</Notice>
        ))}
      </div>
      <div className="footer-actions">
        <Button variant="ghost" icon={<RotateCcw size={16} />} onClick={onReset}>
          Andere Liste
        </Button>
        <Button variant="lemon" onClick={() => go(1)} icon={<ArrowRight size={18} />}>
          Weiter zum Prüfen
        </Button>
      </div>
    </>
  );
}
