import { ArrowLeft, ArrowRight, Check, Eye, MessageSquarePlus, Pencil, Plus, X } from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import type { ScreenProps } from "../App";
import type { ReviewItem, RowOverride, RowResult } from "../api/types";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Chip } from "../components/Chip";
import { Title } from "../components/Title";
import { chipText, chipTone, emptyOverride, rowById, rowName, ruleLabel } from "../lib";

type Filter = "all" | "wish" | "review";

export function ReviewScreen({ run, rules, busy, patch, go }: ScreenProps) {
  const [filter, setFilter] = useState<Filter>("wish");
  const [openReason, setOpenReason] = useState<string | null>(null);
  const [editing, setEditing] = useState<number | null>(null);

  const queue = run.results.flatMap((r) => r.review);
  const selectable = rules.filter((r) => r.kind !== "ignore");

  const override = (index: number): RowOverride => run.overrides[String(index)] ?? emptyOverride();
  const setOverride = (index: number, change: Partial<RowOverride>) =>
    patch({ overrides: { [String(index)]: { ...override(index), ...change } } });

  const decide = (item: ReviewItem, decision: RowOverride["decisions"][string]) =>
    setOverride(item.row_index, { decisions: { ...override(item.row_index).decisions, [item.id]: decision } });

  const rows = useMemo(() => {
    const hasWish = (r: RowResult) => r.matches.length > 0 || r.custom_wishes.length > 0;
    return run.results.filter((r) => (filter === "all" ? true : filter === "review" ? r.review.length > 0 : hasWish(r) || r.review.length > 0));
  }, [run.results, filter]);

  const counts = {
    all: run.results.length,
    wish: run.results.filter((r) => r.matches.length || r.custom_wishes.length || r.review.length).length,
    review: run.results.filter((r) => r.review.length).length,
  };

  return (
    <>
      <Title
        kicker={`Schritt 2 · ${run.delivery.weekday} ${run.delivery.label}`}
        light="Wünsche "
        bold="prüfen"
        lead="Erkannt wird aus Notizen und Spezialwünschen. Klick auf einen Wunsch, um zu sehen, warum er erkannt wurde."
      />

      {queue.length > 0 ? (
        <Card
          icon={<Eye size={20} />}
          iconTone="coral"
          title={queue.length === 1 ? "1 Wunsch braucht deinen Blick" : `${queue.length} Wünsche brauchen deinen Blick`}
          subtitle="Sie zählen erst, wenn du entschieden hast."
        >
          {queue.map((item) => (
            <ReviewCard key={item.id} item={item} name={rowName(run, item.row_index)} rules={selectable} busy={busy} onDecide={(d) => decide(item, d)} />
          ))}
        </Card>
      ) : (
        <Card icon={<Check size={20} />} iconTone="lime" title="Alles klar" subtitle="Keine offenen Fälle. Alle Wünsche wurden eindeutig erkannt oder von dir entschieden.">
          {null}
        </Card>
      )}

      <div className="section-head" style={{ marginTop: 32 }}>
        <h2 style={{ margin: 0, fontSize: 20 }}>Zeilen</h2>
        <div className="filters" role="group" aria-label="Filter">
          {(
            [
              ["all", "Alle"],
              ["wish", "Mit Wunsch"],
              ["review", "Zu prüfen"],
            ] as [Filter, string][]
          ).map(([key, label]) => (
            <button key={key} type="button" aria-pressed={filter === key} onClick={() => setFilter(key)}>
              {label} <span className="muted">{counts[key]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="table-wrap">
        <table className="table table--stack">
          <thead>
            <tr>
              <th style={{ width: "28%" }}>Teilnehmer</th>
              <th>Erkannte Wünsche</th>
              <th style={{ width: 120 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((res) => {
              const row = rowById(run, res.index)!;
              const ov = override(res.index);
              const reasonKey = openReason?.startsWith(`${res.index}:`) ? openReason : null;
              const reason = reasonKey ? res.matches.find((m) => `${res.index}:${m.rule_id}` === reasonKey) : null;
              return (
                <Fragment key={res.index}>
                  <tr>
                    <td>
                      <strong>{row.name || "ohne Namen"}</strong>
                      <div className="muted small">#{row.order}</div>
                    </td>
                    <td>
                      <div className="chips">
                        {res.matches.map((m) => (
                          <Chip
                            key={m.rule_id}
                            tone={chipTone(m, run.menu)}
                            active={reasonKey === `${res.index}:${m.rule_id}`}
                            onClick={() => setOpenReason(reasonKey === `${res.index}:${m.rule_id}` ? null : `${res.index}:${m.rule_id}`)}
                            onRemove={() => setOverride(res.index, { removed_rules: [...ov.removed_rules, m.rule_id], added_rules: ov.added_rules.filter((x) => x !== m.rule_id) })}
                          >
                            {chipText(m, rules, run.menu)}
                          </Chip>
                        ))}
                        {res.custom_wishes.map((w) => (
                          <Chip
                            key={w}
                            tone="custom"
                            onRemove={ov.custom_wishes.includes(w) ? () => setOverride(res.index, { custom_wishes: ov.custom_wishes.filter((x) => x !== w) }) : undefined}
                          >
                            {w}
                          </Chip>
                        ))}
                        {!res.matches.length && !res.custom_wishes.length && (
                          <span className="muted small">{res.review.length ? "wartet auf deine Entscheidung (oben)" : "kein Wunsch"}</span>
                        )}
                      </div>
                      {reason && (
                        <div className="popover" role="note">
                          <strong>{ruleLabel(rules, reason.rule_id)}</strong> · {reason.reason}
                          <div style={{ marginTop: 6 }}>Originaltext: „{reason.source_text}“</div>
                        </div>
                      )}
                      {editing === res.index && (
                        <RowEditor
                          notes={res.note_segments}
                          special={row.special}
                          rules={selectable.filter((r) => !res.matches.some((m) => m.rule_id === r.id))}
                          removed={ov.removed_rules}
                          busy={busy}
                          onPromote={(text) => setOverride(res.index, { custom_wishes: [...ov.custom_wishes, text] })}
                          onAdd={(id) => setOverride(res.index, { added_rules: [...ov.added_rules, id], removed_rules: ov.removed_rules.filter((x) => x !== id) })}
                          onRestore={(id) => setOverride(res.index, { removed_rules: ov.removed_rules.filter((x) => x !== id) })}
                          ruleName={(id) => ruleLabel(rules, id)}
                        />
                      )}
                    </td>
                    <td>
                      <div className="actions" style={{ gap: 8, flexWrap: "nowrap" }}>
                        <StatusPill status={res.status} />
                        <button
                          type="button"
                          className="btn btn--ghost btn--small btn--icon"
                          aria-label={editing === res.index ? "Bearbeiten schließen" : `${row.name || "Zeile"} bearbeiten`}
                          aria-expanded={editing === res.index}
                          onClick={() => setEditing(editing === res.index ? null : res.index)}
                        >
                          {editing === res.index ? <X size={16} /> : <Pencil size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && <p className="muted" style={{ textAlign: "center", padding: 32 }}>Keine Zeilen für diesen Filter.</p>}
      </div>

      <div className="footer-actions">
        <Button variant="ghost" icon={<ArrowLeft size={16} />} onClick={() => go(0)}>
          Zurück
        </Button>
        <Button variant="lemon" icon={<ArrowRight size={18} />} onClick={() => go(2)}>
          Weiter zum Speiseplan
        </Button>
      </div>
    </>
  );
}

function StatusPill({ status }: { status: RowResult["status"] }) {
  if (status === "review") return <span className="pill pill--coral">prüfen</span>;
  if (status === "manual") return <span className="pill pill--lime">manuell</span>;
  return <span className="pill pill--mist">auto</span>;
}

interface ReviewCardProps {
  item: ReviewItem;
  name: string;
  rules: ScreenProps["rules"];
  busy: boolean;
  onDecide: (d: { action: "accept" | "ignore" | "custom"; rule_id?: string; text?: string }) => void;
}

function ReviewCard({ item, name, rules, busy, onDecide }: ReviewCardProps) {
  const [ruleId, setRuleId] = useState(item.blocked_rule_id ?? "");
  const [custom, setCustom] = useState<string | null>(null);
  const selectId = `rule-${item.id}`;
  return (
    <div className="review-item">
      <div>
        <div className="muted small">
          {name} · {item.column === "notes" ? "Notizen" : "Spezialwünsche"}
        </div>
        <p className="quote">{item.text}</p>
        <div className="muted small">{item.reason}</div>
      </div>
      {custom === null ? (
        <div className="actions">
          <label htmlFor={selectId} className="sr-only">
            Regel wählen
          </label>
          <select id={selectId} className="select" style={{ width: "auto", minWidth: 180 }} value={ruleId} onChange={(e) => setRuleId(e.target.value)}>
            <option value="">Übernehmen als …</option>
            {rules.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
          <Button small disabled={!ruleId || busy} icon={<Check size={16} />} onClick={() => onDecide({ action: "accept", rule_id: ruleId })}>
            Übernehmen
          </Button>
          <Button small variant="ghost" disabled={busy} icon={<MessageSquarePlus size={16} />} onClick={() => setCustom(item.text)}>
            Eigener Wunsch
          </Button>
          <Button small variant="ghost" disabled={busy} icon={<X size={16} />} onClick={() => onDecide({ action: "ignore" })}>
            Ignorieren
          </Button>
        </div>
      ) : (
        <form
          className="actions"
          onSubmit={(e) => {
            e.preventDefault();
            if (custom.trim()) onDecide({ action: "custom", text: custom.trim() });
          }}
        >
          <label htmlFor={`custom-${item.id}`} className="sr-only">
            Eigener Wunsch
          </label>
          <input id={`custom-${item.id}`} className="input" style={{ flex: 1, minWidth: 200 }} value={custom} autoFocus onChange={(e) => setCustom(e.target.value)} />
          <Button small type="submit" disabled={!custom.trim() || busy}>
            Als Wunsch speichern
          </Button>
          <Button small variant="ghost" type="button" onClick={() => setCustom(null)}>
            Abbrechen
          </Button>
        </form>
      )}
    </div>
  );
}

interface RowEditorProps {
  notes: string[];
  special: string;
  rules: ScreenProps["rules"];
  removed: string[];
  busy: boolean;
  onPromote: (text: string) => void;
  onAdd: (ruleId: string) => void;
  onRestore: (ruleId: string) => void;
  ruleName: (id: string) => string;
}

function RowEditor({ notes, special, rules, removed, busy, onPromote, onAdd, onRestore, ruleName }: RowEditorProps) {
  const [add, setAdd] = useState("");
  return (
    <div className="card" style={{ marginTop: 12, padding: 16, display: "grid", gap: 14 }}>
      <div>
        <div className="field__label">Notizen · Klick macht ein Stück zum Spezialwunsch</div>
        <div className="segments">
          {notes.length ? (
            notes.map((n, i) => (
              <button key={i} type="button" className="segment-btn" disabled={busy} onClick={() => onPromote(n)}>
                <Plus size={14} aria-hidden /> {n}
              </button>
            ))
          ) : (
            <span className="muted small">keine Notizen</span>
          )}
        </div>
      </div>
      {special && (
        <div className="small">
          <span className="field__label">Spezialwünsche im Export: </span>
          {special}
        </div>
      )}
      <div className="actions">
        <label htmlFor="add-rule" className="sr-only">
          Wunsch hinzufügen
        </label>
        <select id="add-rule" className="select" style={{ width: "auto", minWidth: 180 }} value={add} onChange={(e) => setAdd(e.target.value)}>
          <option value="">Wunsch hinzufügen …</option>
          {rules.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </select>
        <Button small disabled={!add || busy} icon={<Plus size={16} />} onClick={() => {
            onAdd(add);
            setAdd("");
          }}>
          Hinzufügen
        </Button>
      </div>
      {removed.length > 0 && (
        <div className="chips">
          <span className="muted small">Entfernt:</span>
          {removed.map((id) => (
            <Chip key={id} tone="muted" onClick={() => onRestore(id)}>
              {ruleName(id)} · zurückholen
            </Chip>
          ))}
        </div>
      )}
    </div>
  );
}
