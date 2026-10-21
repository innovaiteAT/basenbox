from __future__ import annotations

from datetime import date
from enum import Enum

from pydantic import BaseModel, Field


class Meal(str, Enum):
    F = "F"
    M = "M"
    A = "A"


MEALS: tuple[Meal, ...] = (Meal.F, Meal.M, Meal.A)
MEAL_LABEL = {Meal.F: "Früh", Meal.M: "Mittag", Meal.A: "Abend"}
MEAL_LONG = {Meal.F: "Frühstück", Meal.M: "Mittag", Meal.A: "Abend"}


class RuleKind(str, Enum):
    ingredient = "ingredient"
    meal_minus = "meal_minus"
    meal_multi = "meal_multi"
    addon = "addon"
    ignore = "ignore"


class Rule(BaseModel):
    id: str
    label: str
    kind: RuleKind
    patterns: list[str]
    short: str | None = None
    cell: str | None = None  # Eintrag in der Mahlzeitspalte der Spezialwunschliste
    meal: Meal | None = None  # meal_minus / meal_multi
    case_sensitive: list[str] = Field(default_factory=list)  # Kurzcodes wie "OM", "ON"


class Column(str, Enum):
    notes = "notes"
    special = "special"
    manual = "manual"


class Match(BaseModel):
    rule_id: str
    kind: RuleKind
    quantity: int = 1
    meal: Meal | None = None  # meal_minus / meal_multi
    source_column: Column
    source_text: str
    position: int = 0  # Segmentnummer, damit der Wunschtext die Originalreihenfolge behält
    reason: str


class ReviewItem(BaseModel):
    id: str  # "<row_index>:<column>:<segment_index>"
    row_index: int
    column: Column
    text: str
    reason: str
    blocked_rule_id: str | None = None  # Regel, die wegen anderem Datum nicht angewendet wurde


class ReviewDecision(BaseModel):
    action: str  # "accept" | "ignore" | "custom"
    rule_id: str | None = None
    text: str | None = None


class RowOverride(BaseModel):
    decisions: dict[str, ReviewDecision] = Field(default_factory=dict)  # ReviewItem.id → Entscheidung
    removed_rules: list[str] = Field(default_factory=list)
    added_rules: list[str] = Field(default_factory=list)
    custom_wishes: list[str] = Field(default_factory=list)


class Row(BaseModel):
    index: int
    order: str
    company: str = ""
    name: str = ""
    email: str = ""
    street: str = ""
    house: str = ""
    stair: str = ""
    door: str = ""
    zip: str = ""
    city: str = ""
    country: str = ""
    phone: str = ""
    notes: str = ""
    special: str = ""


class RowStatus(str, Enum):
    auto = "auto"
    review = "review"
    manual = "manual"


class RowResult(BaseModel):
    index: int
    matches: list[Match] = Field(default_factory=list)
    review: list[ReviewItem] = Field(default_factory=list)
    status: RowStatus = RowStatus.auto
    custom_wishes: list[str] = Field(default_factory=list)
    note_segments: list[str] = Field(default_factory=list)
    relevant: bool = False
    wish_text: str = ""  # Text für die Spalte Spezialwünsche
    meal_cells: dict[Meal, str] = Field(default_factory=dict)
    addons: dict[str, int] = Field(default_factory=dict)


MenuPlan = dict[str, list[Meal]]  # ingredient rule_id → Mahlzeiten heute


class Warning(BaseModel):
    code: str
    message: str
    row_indices: list[int] = Field(default_factory=list)


class MealDerivation(BaseModel):
    rule_id: str
    delta: int
    row_indices: list[int]


class MealTotal(BaseModel):
    meal: Meal
    total: int
    derivation: list[MealDerivation] = Field(default_factory=list)
    without: dict[str, int] = Field(default_factory=dict)  # ingredient rule_id → Portionen
    without_rows: dict[str, list[int]] = Field(default_factory=dict)
    combo: int = 0
    normal: int = 0
    check: int = 0


class Totals(BaseModel):
    boxes: int
    meals: dict[Meal, MealTotal]
    addons: dict[str, int] = Field(default_factory=dict)
    addon_rows: dict[str, list[int]] = Field(default_factory=dict)
    relevant_rows: list[int] = Field(default_factory=list)


class Delivery(BaseModel):
    date: date
    weekday: str
    iso_week: int
    label: str  # "08.06."


class Derived(BaseModel):
    mails: dict[str, dict[str, str]] = Field(default_factory=dict)  # id → name, to, subject, body
    sortiment_tsv: str = ""
    emails: list[str] = Field(default_factory=list)
    ac_tag: str = ""
    ac_list: str = "V_Kurbrief"
    ac_search: str = ""
    ac_time: str = "11:00"
    bread_hint: str | None = None
    avery_layout: str = ""
    labels_filename: str = ""


class Run(BaseModel):
    id: str
    source_name: str
    delivery: Delivery
    title_boxes: int | None = None
    boxes: int
    header_row: int
    has_special_column: bool
    rows: list[Row]
    results: list[RowResult] = Field(default_factory=list)
    menu: MenuPlan = Field(default_factory=dict)
    overrides: dict[int, RowOverride] = Field(default_factory=dict)
    checklist: dict[str, bool] = Field(default_factory=dict)
    totals: Totals | None = None
    warnings: list[Warning] = Field(default_factory=list)
    derived: Derived = Field(default_factory=Derived)
    files: list[str] = Field(default_factory=list)
    folder: str = ""
