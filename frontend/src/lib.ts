import type { ChipTone } from "./components/Chip";
import type { Match, MenuPlan, Row, RowOverride, Rule, Run } from "./api/types";
import { MEAL_LABEL } from "./api/types";

export const STEPS = ["Hochladen", "Prüfen", "Speiseplan", "Ergebnis", "Abschluss"];

export const KIND_LABEL: Record<string, string> = {
  ingredient: "Zutat (mahlzeitabhängig)",
  meal_minus: "Ohne Mahlzeit (−1)",
  meal_multi: "Mehrfach Mahlzeit (+N−1)",
  addon: "Add-on (eigene Spalte)",
  ignore: "Lieferinfo (ignorieren)",
};

export const emptyOverride = (): RowOverride => ({ decisions: {}, removed_rules: [], added_rules: [], custom_wishes: [] });

export function ruleLabel(rules: Rule[], id: string): string {
  return rules.find((r) => r.id === id)?.label ?? id;
}

export function rowById(run: Run, index: number): Row | undefined {
  return run.rows.find((r) => r.index === index);
}

export function rowName(run: Run, index: number): string {
  const row = rowById(run, index);
  return row ? `${row.name || "ohne Namen"} · #${row.order}` : `Zeile ${index}`;
}

export function chipTone(m: Match, menu: MenuPlan): ChipTone {
  if (m.kind === "addon") return "addon";
  if (m.kind === "ingredient") return menu[m.rule_id]?.length ? menu[m.rule_id][0] : "muted";
  return m.meal ?? "muted";
}

export function chipText(m: Match, rules: Rule[], menu: MenuPlan): string {
  const label = ruleLabel(rules, m.rule_id);
  if (m.kind === "meal_multi" && m.meal) return `${m.quantity}x ${MEAL_LABEL[m.meal]}`;
  if (m.kind === "addon") return m.quantity > 1 ? `${m.quantity}x ${label}` : label;
  if (m.kind === "ingredient") {
    const meals = menu[m.rule_id];
    if (!meals) return `Ohne ${label} · Speiseplan offen`;
    return meals.length ? `Ohne ${label} · ${meals.map((x) => MEAL_LABEL[x]).join(", ")}` : `${label} · heute nicht im Plan`;
  }
  return label;
}

export function slug(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/ä/g, "ae")
      .replace(/ö/g, "oe")
      .replace(/ü/g, "ue")
      .replace(/ß/g, "ss")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "") || "regel"
  );
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

const LAST_RUN_KEY = "basenbox.lastRun";

// Nur die Run-ID, keine Kundendaten
export const lastRun = {
  get: (): string | null => {
    try {
      return localStorage.getItem(LAST_RUN_KEY);
    } catch {
      return null;
    }
  },
  set: (id: string | null) => {
    try {
      if (id) localStorage.setItem(LAST_RUN_KEY, id);
      else localStorage.removeItem(LAST_RUN_KEY);
    } catch {
      /* privater Modus */
    }
  },
};
