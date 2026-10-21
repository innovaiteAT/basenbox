// Spiegel der Pydantic-Modelle aus backend/app/domain/models.py
export type Meal = "F" | "M" | "A";
export const MEALS: Meal[] = ["F", "M", "A"];
export const MEAL_LABEL: Record<Meal, string> = { F: "Früh", M: "Mittag", A: "Abend" };

export type RuleKind = "ingredient" | "meal_minus" | "meal_multi" | "addon" | "ignore";
export type Column = "notes" | "special" | "manual";

export interface Rule {
  id: string;
  label: string;
  kind: RuleKind;
  patterns: string[];
  short?: string | null;
  cell?: string | null;
  meal?: Meal | null;
  case_sensitive: string[];
}

export interface Match {
  rule_id: string;
  kind: RuleKind;
  quantity: number;
  meal: Meal | null;
  source_column: Column;
  source_text: string;
  position: number;
  reason: string;
}

export interface ReviewItem {
  id: string;
  row_index: number;
  column: Column;
  text: string;
  reason: string;
  blocked_rule_id: string | null;
}

export interface ReviewDecision {
  action: "accept" | "ignore" | "custom";
  rule_id?: string | null;
  text?: string | null;
}

export interface RowOverride {
  decisions: Record<string, ReviewDecision>;
  removed_rules: string[];
  added_rules: string[];
  custom_wishes: string[];
}

export interface Row {
  index: number;
  order: string;
  name: string;
  email: string;
  notes: string;
  special: string;
  street: string;
  house: string;
  zip: string;
}

export interface RowResult {
  index: number;
  matches: Match[];
  review: ReviewItem[];
  status: "auto" | "review" | "manual";
  custom_wishes: string[];
  note_segments: string[];
  relevant: boolean;
  wish_text: string;
  meal_cells: Partial<Record<Meal, string>>;
  addons: Record<string, number>;
}

export interface MealDerivation {
  rule_id: string;
  delta: number;
  row_indices: number[];
}

export interface MealTotal {
  meal: Meal;
  total: number;
  derivation: MealDerivation[];
  without: Record<string, number>;
  without_rows: Record<string, number[]>;
  combo: number;
  normal: number;
  check: number;
}

export interface Totals {
  boxes: number;
  meals: Record<Meal, MealTotal>;
  addons: Record<string, number>;
  addon_rows: Record<string, number[]>;
  relevant_rows: number[];
}

export interface Warning {
  code: string;
  message: string;
  row_indices: number[];
}

export interface Delivery {
  date: string;
  weekday: string;
  iso_week: number;
  label: string;
}

export interface MailText {
  name: string;
  to: string;
  subject: string;
  body: string;
}

export interface Derived {
  mails: Record<string, MailText>;
  sortiment_tsv: string;
  emails: string[];
  ac_tag: string;
  ac_list: string;
  ac_search: string;
  ac_time: string;
  bread_hint: string | null;
  avery_layout: string;
  labels_filename: string;
}

export type MenuPlan = Record<string, Meal[]>;

export interface Run {
  id: string;
  source_name: string;
  delivery: Delivery;
  title_boxes: number | null;
  boxes: number;
  rows: Row[];
  results: RowResult[];
  menu: MenuPlan;
  overrides: Record<string, RowOverride>;
  checklist: Record<string, boolean>;
  totals: Totals;
  warnings: Warning[];
  derived: Derived;
  files: string[];
}

export interface RunSummary {
  id: string;
  source_name: string;
  delivery: Delivery;
  boxes: number;
  open_reviews: number;
  files: string[];
}

export interface RunPatch {
  delivery_date?: string;
  menu?: MenuPlan;
  overrides?: Record<string, RowOverride>;
  checklist?: Record<string, boolean>;
}

export interface MailRecipient {
  id: string;
  name: string;
  email: string;
  subject: string;
  templates: Record<string, string>;
}

export interface MailTemplates {
  recipients: MailRecipient[];
}

export interface RuleTestResult {
  matches: Match[];
  review: ReviewItem[];
}
