import { ArrowLeft, ArrowRight, Download, FileSpreadsheet, FileText, RefreshCw, Wheat } from "lucide-react";
import { useState, type ReactNode } from "react";
import type { ScreenProps } from "../App";
import { api } from "../api/client";
import { MEAL_LABEL, MEALS, type Meal, type Run } from "../api/types";
import { Button } from "../components/Button";
import { Card, IconCircle } from "../components/Card";
import { CopyButton } from "../components/CopyField";
import { HeroTile, Metric } from "../components/HeroTile";
import { Notice } from "../components/Notice";
import { Title } from "../components/Title";
import { useToast } from "../components/Toast";
import { rowName, ruleLabel } from "../lib";

const signed = (n: number) => (n > 0 ? `+${n}` : `−${Math.abs(n)}`);

export function ResultScreen({ run, rules, go, onGenerated }: ScreenProps & { onGenerated: (run: Run) => void }) {
  const toast = useToast();
  const [open, setOpen] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const t = run.totals;

  const toggle = (key: string) => setOpen(open === key ? null : key);

  const regenerate = async () => {
    setRegenerating(true);
    try {
      onGenerated(await api.generate(run.id));
      toast("Dateien neu erzeugt");
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setRegenerating(false);
    }
  };

  const withouts = MEALS.flatMap((meal) =>
    Object.entries(t.meals[meal].without).map(([id, n]) => ({ key: `w:${meal}:${id}`, meal, id, n, rows: t.meals[meal].without_rows[id] ?? [] })),
  );
  const addons = Object.entries(t.addons).map(([id, n]) => ({ key: `a:${id}`, id, n, rows: t.addon_rows[id] ?? [] }));
  const combos = run.warnings.filter((w) => w.code === "combo");
  const openReviews = run.warnings.find((w) => w.code === "review");

  const detail = (() => {
    if (!open) return null;
    if (open.startsWith("m:")) {
      const meal = open.slice(2) as Meal;
      const mt = t.meals[meal];
      return (
        <Derivation title={`${MEAL_LABEL[meal]}: ${mt.total}`}>
          <li>
            {t.boxes} Boxen (eine Portion pro Box)
          </li>
          {mt.derivation.map((d) => (
            <li key={d.rule_id}>
              <strong>{signed(d.delta)}</strong> {ruleLabel(rules, d.rule_id)}: {d.row_indices.map((i) => rowName(run, i)).join(", ")}
            </li>
          ))}
          {Object.entries(mt.without).length > 0 && (
            <li>
              davon normal {mt.normal}
              {Object.entries(mt.without).map(([id, n]) => ` · ohne ${ruleLabel(rules, id)} ${n}`)}
              {mt.combo ? ` · Kombi ${mt.combo}` : ""} · Check {mt.check}
            </li>
          )}
        </Derivation>
      );
    }
    const w = withouts.find((x) => x.key === open);
    const item = w ?? addons.find((a) => a.key === open);
    if (!item) return null;
    const title = w ? `Ohne ${ruleLabel(rules, w.id)} · ${MEAL_LABEL[w.meal]}` : ruleLabel(rules, item.id);
    return (
      <Derivation title={`${title}: ${item.n}`}>
        {item.rows.map((i) => {
          const res = run.results.find((r) => r.index === i);
          const m = res?.matches.find((x) => x.rule_id === item.id);
          return (
            <li key={i}>
              {rowName(run, i)}
              {m && <span className="muted"> · „{m.source_text}“{m.quantity > 1 ? ` (${m.quantity}×)` : ""}</span>}
            </li>
          );
        })}
      </Derivation>
    );
  })();

  return (
    <>
      <Title
        kicker={`Schritt 4 · ${run.delivery.weekday} ${run.delivery.label} · KW ${run.delivery.iso_week}`}
        light="Dein "
        bold="Ergebnis"
        lead="Klick auf eine Zahl, um zu sehen, aus welchen Zeilen und Regeln sie kommt."
      />

      {openReviews && (
        <div style={{ marginBottom: 16 }}>
          <Notice tone="warn">
            {openReviews.message}{" "}
            <button type="button" className="btn btn--ghost btn--small" style={{ marginLeft: 8 }} onClick={() => go(1)}>
              Zum Prüfen
            </button>
          </Notice>
        </div>
      )}

      <div className="grid grid--3 grid--hero">
        {MEALS.map((meal) => {
          const mt = t.meals[meal];
          const sub = mt.derivation.length ? `${t.boxes} Boxen ${mt.derivation.map((d) => signed(d.delta)).join(" ")}` : `${t.boxes} Boxen, keine Änderung`;
          return <HeroTile key={meal} meal={meal} label={MEAL_LABEL[meal]} value={mt.total} sub={sub} expanded={open === `m:${meal}`} onClick={() => toggle(`m:${meal}`)} />;
        })}
      </div>

      {(withouts.length > 0 || addons.length > 0) && (
        <div className="grid grid--4" style={{ marginTop: 16 }}>
          {withouts.map((w) => (
            <Metric key={w.key} value={w.n} label={`Ohne ${ruleLabel(rules, w.id)} · ${MEAL_LABEL[w.meal]}`} expanded={open === w.key} onClick={() => toggle(w.key)} />
          ))}
          {addons.map((a) => (
            <Metric key={a.key} value={a.n} label={ruleLabel(rules, a.id)} expanded={open === a.key} onClick={() => toggle(a.key)} />
          ))}
        </div>
      )}

      {detail}

      {combos.map((w) => (
        <div key={w.message} style={{ marginTop: 12 }}>
          <Notice tone="warn">
            {w.message}: {w.row_indices.map((i) => rowName(run, i)).join(", ")}. Der Check in „genaue Menge“ geht trotzdem auf.
          </Notice>
        </div>
      ))}

      {run.derived.bread_hint && (
        <div style={{ marginTop: 16 }}>
          <Notice tone="lemon" icon={<Wheat size={16} />}>
            <strong>Brot:</strong> {run.derived.bread_hint}
          </Notice>
        </div>
      )}

      <div className="section-head">
        <h2 style={{ margin: 0, fontSize: 20 }}>Dateien</h2>
        <div className="actions">
          <Button variant="ghost" small loading={regenerating} icon={<RefreshCw size={16} />} onClick={regenerate}>
            Neu erzeugen
          </Button>
          <a className="btn btn--small" href={api.zipUrl(run.id)} download>
            <Download size={16} /> Alles als ZIP
          </a>
        </div>
      </div>
      <div className="grid grid--3">
        {run.files.map((name) => (
          <a key={name} className="download" href={api.fileUrl(run.id, name)} download={name}>
            <IconCircle tone={name.endsWith(".pdf") ? "coral" : "lime"}>{name.endsWith(".pdf") ? <FileText size={20} /> : <FileSpreadsheet size={20} />}</IconCircle>
            <div style={{ minWidth: 0 }}>
              <div className="download__name">{name}</div>
              <div className="muted small">{name.endsWith(".pdf") ? "PDF" : "Excel"} · herunterladen</div>
            </div>
          </a>
        ))}
      </div>

      <div style={{ marginTop: 24 }}>
        <Card
          white
          title="Sortiment neu"
          subtitle="Für die Rezeptdatei: kopieren und in die Tabelle des Tages einfügen."
          aside={<CopyButton value={run.derived.sortiment_tsv} label="Als Tabelle kopieren" />}
        >
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  {run.derived.sortiment_tsv
                    .split("\n")[0]
                    .split("\t")
                    .map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {run.derived.sortiment_tsv
                  .split("\n")
                  .slice(1)
                  .map((line) => (
                    <tr key={line}>
                      {line.split("\t").map((v, i) => (
                        <td key={i} className="num">
                          {v || <span className="muted">–</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="footer-actions">
        <Button variant="ghost" icon={<ArrowLeft size={16} />} onClick={() => go(2)}>
          Zurück
        </Button>
        <Button variant="lemon" icon={<ArrowRight size={18} />} onClick={() => go(4)}>
          Weiter zum Abschluss
        </Button>
      </div>
    </>
  );
}

function Derivation({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="card" style={{ marginTop: 16 }} role="region" aria-label="Herleitung">
      <div className="kicker">Herleitung</div>
      <strong>{title}</strong>
      <ul className="derivation">{children}</ul>
    </div>
  );
}
