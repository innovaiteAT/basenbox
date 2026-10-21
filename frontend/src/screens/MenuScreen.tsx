import { ArrowLeft, FileCog, UtensilsCrossed } from "lucide-react";
import { useState } from "react";
import type { ScreenProps } from "../App";
import { api } from "../api/client";
import { MEAL_LABEL, MEALS, type Meal, type Run } from "../api/types";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Notice } from "../components/Notice";
import { Title } from "../components/Title";
import { MealToggle } from "../components/Toggle";
import { useToast } from "../components/Toast";

export function MenuScreen({ run, rules, busy, patch, go, onGenerated }: ScreenProps & { onGenerated: (run: Run) => void }) {
  const toast = useToast();
  const [generating, setGenerating] = useState(false);
  const ingredients = rules.filter((r) => r.kind === "ingredient");
  const missing = ingredients.filter((r) => !(r.id in run.menu));
  // nur beim Öffnen prüfen, ob die Auswahl aus dem letzten gleichen Wochentag stammt
  const [preset] = useState(() => ingredients.length > 0 && missing.length === 0);

  const setMeals = (id: string, meals: Meal[]) => patch({ menu: { ...run.menu, [id]: meals } });

  const generate = async () => {
    setGenerating(true);
    try {
      onGenerated(await api.generate(run.id));
      toast("Alle Dateien sind fertig");
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setGenerating(false);
    }
  };

  const mentions = (id: string) => run.results.filter((r) => r.matches.some((m) => m.rule_id === id)).length;
  const t = run.totals;

  return (
    <>
      <Title
        kicker={`Schritt 3 · ${run.delivery.weekday} ${run.delivery.label}`}
        light="Speise"
        bold="plan"
        lead="Schau in den Speiseplan: In welcher Mahlzeit steckt heute welche Zutat? Nur dort zählen die Ohne-Wünsche."
      />

      <div className="grid grid--menu">
        <Card icon={<UtensilsCrossed size={20} />} iconTone="lemon" title="Zutaten heute" subtitle={preset ? `Vorbelegt mit deiner letzten Auswahl für ${run.delivery.weekday}.` : "Wähle pro Zutat die Mahlzeit."}>
          <div style={{ display: "grid", gap: 12 }}>
            {ingredients.map((rule) => (
              <div key={rule.id} className="review-item menu-row">
                <div>
                  <strong>{rule.label}</strong>
                  <div className="muted small">
                    {mentions(rule.id)} {mentions(rule.id) === 1 ? "Person wünscht" : "Personen wünschen"} ohne
                  </div>
                </div>
                <MealToggle label={`Mahlzeit für ${rule.label}`} value={run.menu[rule.id]} onChange={(v) => setMeals(rule.id, v)} />
              </div>
            ))}
            {ingredients.length === 0 && <p className="muted">Im Regelkatalog gibt es keine Zutatenregeln.</p>}
          </div>
          {missing.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <Notice tone="warn">Noch offen: {missing.map((r) => r.label).join(", ")}. Wähle eine Mahlzeit oder „keine“.</Notice>
            </div>
          )}
        </Card>

        <Card white title="Vorschau" subtitle={busy ? "rechnet …" : "aktualisiert sich live"} aside={busy ? <span className="spinner" aria-label="lädt" /> : null}>
          <div style={{ display: "grid", gap: 10 }}>
            {MEALS.map((meal) => {
              const mt = t.meals[meal];
              const without = Object.entries(mt.without);
              return (
                <div key={meal} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span className="icon-circle" style={{ background: `var(--meal-${meal})`, fontWeight: 700 }} aria-hidden>
                    {mt.total}
                  </span>
                  <div>
                    <strong>{MEAL_LABEL[meal]}</strong>
                    <div className="muted small">
                      {without.length ? without.map(([id, n]) => `${n}× ohne ${rules.find((r) => r.id === id)?.label ?? id}`).join(" · ") : "keine Sonderportionen"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="footer-actions">
        <Button variant="ghost" icon={<ArrowLeft size={16} />} onClick={() => go(1)}>
          Zurück
        </Button>
        <Button variant="lemon" icon={<FileCog size={18} />} loading={generating} disabled={busy || missing.length > 0} onClick={generate}>
          Dateien erzeugen
        </Button>
      </div>
    </>
  );
}
