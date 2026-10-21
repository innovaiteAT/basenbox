import { FlaskConical, Mail, Plus, Save, Trash2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { api } from "../api/client";
import { MEAL_LABEL, MEALS, type MailTemplates, type Meal, type Rule, type RuleKind, type RuleTestResult } from "../api/types";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Chip } from "../components/Chip";
import { Notice } from "../components/Notice";
import { Title } from "../components/Title";
import { useToast } from "../components/Toast";
import { KIND_LABEL, ruleLabel, slug } from "../lib";

type Tab = "rules" | "mails";
const WEEKDAYS = ["default", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
const PLACEHOLDERS = ["datum", "wochentag", "boxen", "frueh", "mittag", "abend", "ohne_nuss", "ohne_zk", "addons"];

interface Props {
  onRulesSaved: (rules: Rule[]) => void;
  onTemplatesSaved: () => void;
}

export function SettingsScreen({ onRulesSaved, onTemplatesSaved }: Props) {
  const [tab, setTab] = useState<Tab>("rules");
  return (
    <>
      <Title kicker="Konfiguration" light="Ein" bold="stellungen" lead="Regelkatalog und Mailvorlagen gelten für alle künftigen Läufe." />
      <div className="filters" role="tablist" aria-label="Bereich" style={{ marginBottom: 24 }}>
        <button type="button" role="tab" aria-selected={tab === "rules"} aria-pressed={tab === "rules"} onClick={() => setTab("rules")}>
          Regelkatalog
        </button>
        <button type="button" role="tab" aria-selected={tab === "mails"} aria-pressed={tab === "mails"} onClick={() => setTab("mails")}>
          Mailvorlagen
        </button>
      </div>
      {tab === "rules" ? <RulesEditor onSaved={onRulesSaved} /> : <MailEditor onSaved={onTemplatesSaved} />}
    </>
  );
}

function RulesEditor({ onSaved }: { onSaved: (rules: Rule[]) => void }) {
  const toast = useToast();
  const [rules, setRules] = useState<Rule[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api
      .rules()
      .then(setRules)
      .catch((e) => setError(e.message));
  }, []);

  const update = (i: number, change: Partial<Rule>) => {
    setRules((rs) => rs && rs.map((r, j) => (j === i ? { ...r, ...change } : r)));
    setDirty(true);
  };

  const add = () => {
    const ids = new Set(rules?.map((r) => r.id));
    let id = "neue_regel";
    for (let n = 2; ids.has(id); n++) id = `neue_regel_${n}`;
    setRules([...(rules ?? []), { id, label: "Neue Regel", kind: "ingredient", patterns: [], case_sensitive: [] }]);
    setDirty(true);
  };

  const save = async () => {
    if (!rules) return;
    setSaving(true);
    try {
      const saved = await api.saveRules(rules);
      setRules(saved);
      setDirty(false);
      onSaved(saved);
      toast("Regelkatalog gespeichert");
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setSaving(false);
    }
  };

  const importFile = async (file: File) => {
    try {
      const saved = await api.importRules(file);
      setRules(saved);
      setDirty(false);
      onSaved(saved);
      toast("Suchwörter importiert");
    } catch (e) {
      toast((e as Error).message, "error");
    }
  };

  if (error) return <Notice tone="warn">{error}</Notice>;
  if (!rules)
    return (
      <div className="actions muted">
        <span className="spinner" aria-hidden /> Lade Regeln …
      </div>
    );

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <RuleTester rules={rules} dirty={dirty} />
      <div className="section-head" style={{ margin: "16px 0 0" }}>
        <h2 style={{ margin: 0, fontSize: 20 }}>{rules.length} Regeln</h2>
        <div className="actions">
          <Button variant="ghost" small icon={<Upload size={16} />} onClick={() => fileInput.current?.click()}>
            Suchwörter.xlsx importieren
          </Button>
          <input
            ref={fileInput}
            type="file"
            accept=".xlsx"
            className="sr-only"
            tabIndex={-1}
            onChange={(e) => {
              if (e.target.files?.[0]) importFile(e.target.files[0]);
              e.target.value = "";
            }}
          />
          <Button variant="ghost" small icon={<Plus size={16} />} onClick={add}>
            Regel hinzufügen
          </Button>
          <Button variant="lemon" small loading={saving} disabled={!dirty} icon={<Save size={16} />} onClick={save}>
            Speichern
          </Button>
        </div>
      </div>
      {rules.map((rule, i) => (
        <Card key={i} white>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", alignItems: "end" }}>
            <div className="field">
              <label htmlFor={`label-${i}`}>Name</label>
              <input
                id={`label-${i}`}
                className="input"
                value={rule.label}
                onChange={(e) => update(i, rule.id.startsWith("neue_regel") ? { label: e.target.value, id: uniqueId(rules, slug(e.target.value), i) } : { label: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor={`kind-${i}`}>Art</label>
              <select id={`kind-${i}`} className="select" value={rule.kind} onChange={(e) => update(i, { kind: e.target.value as RuleKind })}>
                {Object.entries(KIND_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            {(rule.kind === "meal_minus" || rule.kind === "meal_multi") && (
              <div className="field">
                <label htmlFor={`meal-${i}`}>Mahlzeit</label>
                <select id={`meal-${i}`} className="select" value={rule.meal ?? "F"} onChange={(e) => update(i, { meal: e.target.value as Meal })}>
                  {MEALS.map((m) => (
                    <option key={m} value={m}>
                      {MEAL_LABEL[m]}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="field">
              <label htmlFor={`codes-${i}`}>Kurzcodes (Groß/klein genau)</label>
              <input
                id={`codes-${i}`}
                className="input"
                value={rule.case_sensitive.join(", ")}
                placeholder="z. B. OM"
                onChange={(e) => update(i, { case_sensitive: splitList(e.target.value, ",") })}
              />
            </div>
            {rule.kind === "ingredient" && (
              <div className="field">
                <label htmlFor={`cell-${i}`}>Eintrag in der Liste</label>
                <input id={`cell-${i}`} className="input" value={rule.cell ?? ""} onChange={(e) => update(i, { cell: e.target.value || null })} />
              </div>
            )}
          </div>
          <div className="field" style={{ marginTop: 12 }}>
            <label htmlFor={`patterns-${i}`}>Suchmuster (eins pro Zeile, Regex, Groß/klein egal, Umlaute tolerant)</label>
            <textarea
              id={`patterns-${i}`}
              className="textarea"
              style={{ minHeight: 70, fontFamily: "ui-monospace, Consolas, monospace", fontSize: 14 }}
              value={rule.patterns.join("\n")}
              onChange={(e) => update(i, { patterns: e.target.value.split("\n") })}
              onBlur={() => update(i, { patterns: rule.patterns.map((p) => p.trim()).filter(Boolean) })}
            />
          </div>
          <div className="actions" style={{ justifyContent: "space-between", marginTop: 12 }}>
            <span className="muted small">ID: {rule.id}</span>
            <Button
              variant="ghost"
              small
              icon={<Trash2 size={16} />}
              onClick={() => {
                setRules(rules.filter((_, j) => j !== i));
                setDirty(true);
              }}
            >
              Löschen
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

function uniqueId(rules: Rule[], base: string, self: number): string {
  let id = base;
  for (let n = 2; rules.some((r, j) => j !== self && r.id === id); n++) id = `${base}_${n}`;
  return id;
}

function splitList(text: string, sep: string): string[] {
  return text
    .split(sep)
    .map((s) => s.trim())
    .filter(Boolean);
}

function RuleTester({ rules, dirty }: { rules: Rule[]; dirty: boolean }) {
  const [text, setText] = useState("OM; 2xAbend, bitte ohne Koriander");
  const [result, setResult] = useState<RuleTestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handle = setTimeout(() => {
      if (!text.trim()) return setResult(null);
      setLoading(true);
      api
        .testRules(text)
        .then((r) => {
          setResult(r);
          setError(null);
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(handle);
  }, [text]);

  return (
    <Card icon={<FlaskConical size={20} />} iconTone="lemon" title="Regeln testen" subtitle={dirty ? "Getestet wird der gespeicherte Katalog. Speichere zuerst deine Änderungen." : "Text eingeben, Treffer erscheinen sofort."}>
      <div className="field">
        <label htmlFor="rule-test">Text wie in Notizen oder Spezialwünschen</label>
        <input id="rule-test" className="input" value={text} onChange={(e) => setText(e.target.value)} />
      </div>
      <div style={{ marginTop: 12, display: "grid", gap: 8 }} aria-live="polite">
        {loading && <span className="spinner" aria-label="prüft" />}
        {error && <Notice tone="warn">{error}</Notice>}
        {result && !loading && (
          <>
            <div className="chips">
              {result.matches.map((m) => (
                <Chip key={m.rule_id} tone={m.kind === "addon" ? "addon" : m.meal ?? "custom"}>
                  {ruleLabel(rules, m.rule_id)}
                  {m.quantity > 1 ? ` ×${m.quantity}` : ""}
                </Chip>
              ))}
              {result.matches.length === 0 && <span className="muted small">Keine Regel trifft.</span>}
            </div>
            {result.matches.map((m) => (
              <div key={m.rule_id} className="muted small">
                {m.reason}
              </div>
            ))}
            {result.review.map((r) => (
              <Notice key={r.id} tone="warn">
                Zur Prüfung: „{r.text}“ · {r.reason}
              </Notice>
            ))}
          </>
        )}
      </div>
    </Card>
  );
}

function MailEditor({ onSaved }: { onSaved: () => void }) {
  const toast = useToast();
  const [value, setValue] = useState<MailTemplates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recipient, setRecipient] = useState(0);
  const [weekday, setWeekday] = useState("default");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .mailTemplates()
      .then(setValue)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <Notice tone="warn">{error}</Notice>;
  if (!value)
    return (
      <div className="actions muted">
        <span className="spinner" aria-hidden /> Lade Vorlagen …
      </div>
    );

  const rec = value.recipients[recipient];
  const set = (change: Partial<typeof rec>) =>
    setValue({ recipients: value.recipients.map((r, i) => (i === recipient ? { ...r, ...change } : r)) });
  const body = rec.templates[weekday] ?? "";

  const save = async () => {
    setSaving(true);
    try {
      setValue(await api.saveMailTemplates(value));
      onSaved();
      toast("Mailvorlagen gespeichert");
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card icon={<Mail size={20} />} iconTone="lemon" title="Mailvorlagen" subtitle="Pro Empfänger ein Standardtext, optional eigene Texte pro Wochentag.">
      <div className="grid grid--2">
        <div className="field">
          <label htmlFor="mail-rec">Empfänger</label>
          <select id="mail-rec" className="select" value={recipient} onChange={(e) => setRecipient(Number(e.target.value))}>
            {value.recipients.map((r, i) => (
              <option key={r.id} value={i}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="mail-day">Text für</label>
          <select id="mail-day" className="select" value={weekday} onChange={(e) => setWeekday(e.target.value)}>
            {WEEKDAYS.map((d) => (
              <option key={d} value={d}>
                {d === "default" ? "Standard (alle Tage)" : `${d}${rec.templates[d] ? " ·  eigener Text" : ""}`}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="mail-to">E-Mail-Adresse</label>
          <input id="mail-to" className="input" type="email" value={rec.email} onChange={(e) => set({ email: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="mail-subject">Betreff</label>
          <input id="mail-subject" className="input" value={rec.subject} onChange={(e) => set({ subject: e.target.value })} />
        </div>
      </div>
      <div className="field" style={{ marginTop: 16 }}>
        <label htmlFor="mail-body">{weekday === "default" ? "Standardtext" : `Text für ${weekday} (leer = Standardtext)`}</label>
        <textarea
          id="mail-body"
          className="textarea"
          value={body}
          onChange={(e) => {
            const templates = { ...rec.templates };
            if (e.target.value || weekday === "default") templates[weekday] = e.target.value;
            else delete templates[weekday];
            set({ templates });
          }}
        />
      </div>
      <div className="chips" style={{ marginTop: 12 }}>
        <span className="muted small">Platzhalter:</span>
        {PLACEHOLDERS.map((p) => (
          <code key={p} className="pill pill--mist">{`{${p}}`}</code>
        ))}
      </div>
      <div className="actions" style={{ marginTop: 16, justifyContent: "flex-end" }}>
        <Button variant="lemon" loading={saving} icon={<Save size={16} />} onClick={save}>
          Speichern
        </Button>
      </div>
    </Card>
  );
}
