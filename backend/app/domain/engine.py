from datetime import date

from .models import (
    MEAL_LABEL,
    Column,
    Match,
    Meal,
    MenuPlan,
    ReviewItem,
    Row,
    RowOverride,
    RowResult,
    RowStatus,
    RuleKind,
)
from .rules import Catalog, is_unclear
from .text import date_applies, find_dates, split_segments

_COLUMN_LABEL = {Column.special: "Spezialwünsche", Column.notes: "Notizen", Column.manual: "manuell"}


def _match(hit, column: Column, segment: str, position: int) -> Match:
    rule = hit.rule
    reason = f"Regel „{rule.label}“: Muster „{hit.pattern}“ trifft „{hit.excerpt}“ in {_COLUMN_LABEL[column]}"
    return Match(
        rule_id=rule.id,
        kind=rule.kind,
        quantity=hit.quantity,
        meal=rule.meal,
        source_column=column,
        source_text=segment,
        position=position,
        reason=reason,
    )


def analyze_row(row: Row, catalog: Catalog, delivery: date, override: RowOverride | None = None) -> RowResult:
    found: dict[str, Match] = {}
    review: list[ReviewItem] = []

    # Spezialwünsche zuerst, damit sie bei Duplikaten als Quelle gewinnen
    for column, text in ((Column.special, row.special), (Column.notes, row.notes)):
        for i, segment in enumerate(split_segments(text)):
            hits = catalog.hits(segment)
            counted = [h for h in hits if h.rule.kind != RuleKind.ignore]
            item_id = f"{row.index}:{column.value}:{i}"
            if counted and not date_applies(find_dates(segment, delivery.year), delivery):
                labels = ", ".join(h.rule.label for h in counted)
                review.append(ReviewItem(
                    id=item_id, row_index=row.index, column=column, text=segment,
                    reason=f"Datum im Text passt nicht zum Lieferdatum ({labels} nicht angewendet)",
                    blocked_rule_id=counted[0].rule.id,
                ))
                continue
            for h in counted:
                m = _match(h, column, segment, i)
                prev = found.get(h.rule.id)
                if prev is None:
                    found[h.rule.id] = m
                elif m.quantity > prev.quantity:
                    found[h.rule.id] = prev.model_copy(update={"quantity": m.quantity})
            if not hits and is_unclear(segment):
                review.append(ReviewItem(
                    id=item_id, row_index=row.index, column=column, text=segment,
                    reason="Wunsch ohne passende Regel",
                ))

    custom: list[str] = []
    status = RowStatus.auto
    if override:
        status = RowStatus.manual
        open_items = []
        for item in review:
            d = override.decisions.get(item.id)
            if d is None:
                open_items.append(item)
            elif d.action == "accept" and d.rule_id and d.rule_id in catalog.by_id:
                rule = catalog.by_id[d.rule_id]
                hit = next((h for h in catalog.hits(item.text) if h.rule.id == rule.id), None)
                qty = hit.quantity if hit else 1
                found.setdefault(rule.id, Match(
                    rule_id=rule.id, kind=rule.kind, quantity=qty, meal=rule.meal,
                    source_column=Column.manual, source_text=item.text,
                    reason=f"Manuell übernommen als „{rule.label}“ aus „{item.text}“",
                ))
            elif d.action == "custom" and d.text:
                custom.append(d.text)
        review = open_items
        for rid in override.removed_rules:
            found.pop(rid, None)
        for rid in override.added_rules:
            rule = catalog.by_id.get(rid)
            if rule and rid not in found:
                found[rid] = Match(
                    rule_id=rid, kind=rule.kind, meal=rule.meal, source_column=Column.manual,
                    source_text=rule.label, reason=f"Manuell hinzugefügt: „{rule.label}“",
                )
        custom.extend(override.custom_wishes)
        if not (override.decisions or override.removed_rules or override.added_rules or override.custom_wishes):
            status = RowStatus.auto
    if review:
        status = RowStatus.review

    order = [r.id for r in catalog.rules]
    matches = sorted(found.values(), key=lambda m: order.index(m.rule_id) if m.rule_id in order else len(order))
    return RowResult(
        index=row.index, matches=matches, review=review, status=status,
        custom_wishes=list(dict.fromkeys(custom)), note_segments=split_segments(row.notes),
    )


def is_relevant(m: Match, menu: MenuPlan) -> bool:
    if m.kind == RuleKind.ingredient:
        return bool(menu.get(m.rule_id))
    return m.kind in (RuleKind.meal_minus, RuleKind.meal_multi, RuleKind.addon)


def present(result: RowResult, catalog: Catalog, menu: MenuPlan) -> RowResult:
    """Ergänzt die Darstellung für Listen: Wunschtext, Mahlzeitspalten, Add-on-Mengen."""
    column_order = [Column.special, Column.notes, Column.manual]
    relevant = sorted((m for m in result.matches if is_relevant(m, menu)),
                      key=lambda m: (column_order.index(m.source_column), m.position))
    texts = list(dict.fromkeys([m.source_text for m in relevant] + result.custom_wishes))
    cells: dict[Meal, list[str]] = {meal: [] for meal in Meal}
    addons: dict[str, int] = {}
    for m in relevant:
        rule = catalog.by_id.get(m.rule_id)
        if m.kind == RuleKind.ingredient:
            for meal in menu.get(m.rule_id, []):
                cells[meal].append((rule.cell if rule else None) or (rule.label if rule else m.rule_id))
        elif m.kind == RuleKind.meal_minus and m.meal:
            cells[m.meal].append((rule.short if rule else None) or f"Ohne {MEAL_LABEL[m.meal]}")
        elif m.kind == RuleKind.meal_multi and m.meal:
            cells[m.meal].append(f"{m.quantity}x{MEAL_LABEL[m.meal]}")
        elif m.kind == RuleKind.addon:
            addons[m.rule_id] = m.quantity
    return result.model_copy(update={
        "relevant": bool(texts),
        "wish_text": "; ".join(texts),
        "meal_cells": {meal: ", ".join(v) for meal, v in cells.items() if v},
        "addons": addons,
    })
