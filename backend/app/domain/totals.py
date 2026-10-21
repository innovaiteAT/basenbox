from .models import MEAL_LABEL, MEALS, MealDerivation, MealTotal, MenuPlan, RowResult, RuleKind, Totals, Warning
from .engine import is_relevant


def portions(result: RowResult, meal) -> int:
    """Portionen einer Person in einer Mahlzeit: 1, −1 bei Ohne, +(N−1) bei Nx."""
    n = 1
    for m in result.matches:
        if m.meal != meal:
            continue
        if m.kind == RuleKind.meal_minus:
            n -= 1
        elif m.kind == RuleKind.meal_multi:
            n += m.quantity - 1
    return max(n, 0)


def compute_totals(results: list[RowResult], menu: MenuPlan, boxes: int) -> tuple[Totals, list[Warning]]:
    warnings: list[Warning] = []
    meals: dict = {}
    for meal in MEALS:
        deltas: dict[str, MealDerivation] = {}
        without: dict[str, int] = {}
        without_rows: dict[str, list[int]] = {}
        excluded = combo = 0
        combo_rows: list[int] = []
        for r in results:
            for m in r.matches:
                if m.meal != meal or m.kind not in (RuleKind.meal_minus, RuleKind.meal_multi):
                    continue
                delta = -1 if m.kind == RuleKind.meal_minus else m.quantity - 1
                d = deltas.setdefault(m.rule_id, MealDerivation(rule_id=m.rule_id, delta=0, row_indices=[]))
                d.delta += delta
                d.row_indices.append(r.index)
            hit = [m.rule_id for m in r.matches
                   if m.kind == RuleKind.ingredient and meal in menu.get(m.rule_id, [])]
            p = portions(r, meal)
            if not hit or p == 0:
                continue
            for rid in hit:
                without[rid] = without.get(rid, 0) + p
                without_rows.setdefault(rid, []).append(r.index)
            excluded += p
            if len(hit) > 1:
                combo += p * (len(hit) - 1)
                combo_rows.append(r.index)
        total = boxes + sum(d.delta for d in deltas.values())
        normal = total - excluded
        check = total - normal - sum(without.values()) + combo
        meals[meal] = MealTotal(
            meal=meal, total=total, derivation=list(deltas.values()), without=without,
            without_rows=without_rows, combo=combo, normal=normal, check=check,
        )
        if combo_rows:
            warnings.append(Warning(
                code="combo",
                message=f"Kombi-Portion im {MEAL_LABEL[meal]}: mehrere Ausschlüsse bei derselben Person",
                row_indices=combo_rows,
            ))

    addons: dict[str, int] = {}
    addon_rows: dict[str, list[int]] = {}
    for r in results:
        for m in r.matches:
            if m.kind == RuleKind.addon:
                addons[m.rule_id] = addons.get(m.rule_id, 0) + m.quantity
                addon_rows.setdefault(m.rule_id, []).append(r.index)

    relevant = [r.index for r in results if any(is_relevant(m, menu) for m in r.matches) or r.custom_wishes]
    return Totals(boxes=boxes, meals=meals, addons=addons, addon_rows=addon_rows, relevant_rows=relevant), warnings
