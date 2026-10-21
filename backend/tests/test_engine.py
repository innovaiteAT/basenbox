from datetime import date

from app.domain.engine import analyze_row, present
from app.domain.models import Meal, RowOverride, RowStatus, ReviewDecision
from app.domain.text import date_applies, find_dates, fold, split_segments
from tests.conftest import MONDAY, row


def ids(result):
    return {m.rule_id: m.quantity for m in result.matches}


def test_split_segments():
    assert split_segments("OM; 2xAbend") == ["OM", "2xAbend"]
    assert split_segments("a - b, c | d\ne") == ["a", "b", "c", "d", "e"]
    assert split_segments("Mo-Do") == ["Mo-Do"]
    assert split_segments(None) == []


def test_fold_and_dates():
    assert fold("Nüsse Straße") == "Nuesse Strasse"
    assert find_dates("Kreatin (am 8.6.)", 2026) == [date(2026, 6, 8)]
    assert find_dates("ab 08.06.2026", 2026) == [date(2026, 6, 8)]
    assert date_applies([date(2026, 6, 1), date(2026, 6, 12)], MONDAY)
    assert not date_applies([date(2026, 6, 9)], MONDAY)


def test_om_and_double_dinner(catalog):
    r = analyze_row(row(special="OM; 2xAbend"), catalog, MONDAY)
    assert ids(r) == {"no_m": 1, "multi_a": 2}
    assert r.status == RowStatus.auto


def test_no_breakfast_and_double_dinner(catalog):
    r = analyze_row(row(special="Ohne Frühstück & 2x Abend"), catalog, MONDAY)
    assert ids(r) == {"no_f": 1, "multi_a": 2}


def test_triple_lunch(catalog):
    assert ids(analyze_row(row(special="3x Mittag"), catalog, MONDAY)) == {"multi_m": 3}
    assert ids(analyze_row(row(special="2 x Mittagessen"), catalog, MONDAY)) == {"multi_m": 2}


def test_short_codes_are_case_sensitive(catalog):
    assert ids(analyze_row(row(special="ON"), catalog, MONDAY)) == {"nuts": 1}
    assert ids(analyze_row(row(notes="bitte on time"), catalog, MONDAY)) == {}


def test_zk_counts_once(catalog):
    r = analyze_row(row(special="ohne Zwiebel, ohne Knoblauch"), catalog, MONDAY)
    assert ids(r) == {"zk": 1}


def test_date_matches(catalog):
    r = analyze_row(row(notes="Kreatin (am 8.6.)"), catalog, MONDAY)
    assert ids(r) == {"kreatin": 1}
    assert not r.review


def test_date_mismatch_goes_to_review(catalog):
    r = analyze_row(row(notes="am 9.6. ohne Mittag"), catalog, MONDAY)
    assert ids(r) == {}
    assert r.status == RowStatus.review
    assert r.review[0].blocked_rule_id == "no_m"


def test_duplicate_in_notes_and_special(catalog):
    r = analyze_row(row(notes="1x Kreatin", special="Kreatin"), catalog, MONDAY)
    assert ids(r) == {"kreatin": 1}
    assert r.matches[0].source_column.value == "special"


def test_addon_quantity(catalog):
    assert ids(analyze_row(row(special="2x Kreatin"), catalog, MONDAY)) == {"kreatin": 2}


def test_unclear_goes_to_review(catalog):
    r = analyze_row(row(notes="bitte ohne Koriander"), catalog, MONDAY)
    assert ids(r) == {}
    assert [i.text for i in r.review] == ["bitte ohne Koriander"]


def test_delivery_hint_is_not_unclear(catalog):
    r = analyze_row(row(notes="falls ich nicht da bin, vor die Tür stellen, kein Klingeln"), catalog, MONDAY)
    assert not r.review


def test_ingredient_without_meal_is_irrelevant(catalog):
    r = analyze_row(row(special="Rosinen"), catalog, MONDAY)
    shown = present(r, catalog, {"raisins": []})
    assert not shown.relevant
    shown = present(r, catalog, {"raisins": [Meal.F]})
    assert shown.relevant and shown.meal_cells[Meal.F] == "Rosinen"


def test_present_meal_cells(catalog):
    r = analyze_row(row(special="OM; 2xAbend; ohne Nüsse"), catalog, MONDAY)
    shown = present(r, catalog, {"nuts": [Meal.M]})
    assert shown.meal_cells == {Meal.M: "OM, Nüsse", Meal.A: "2xAbend"}
    assert shown.wish_text == "OM; 2xAbend; ohne Nüsse"


def test_review_decisions(catalog):
    base = analyze_row(row(notes="bitte ohne Koriander"), catalog, MONDAY)
    item = base.review[0].id
    accepted = analyze_row(row(notes="bitte ohne Koriander"), catalog, MONDAY,
                           RowOverride(decisions={item: ReviewDecision(action="accept", rule_id="zk")}))
    assert ids(accepted) == {"zk": 1} and accepted.status == RowStatus.manual
    custom = analyze_row(row(notes="bitte ohne Koriander"), catalog, MONDAY,
                         RowOverride(decisions={item: ReviewDecision(action="custom", text="Ohne Koriander")}))
    assert custom.custom_wishes == ["Ohne Koriander"] and not custom.review
    ignored = analyze_row(row(notes="bitte ohne Koriander"), catalog, MONDAY,
                          RowOverride(decisions={item: ReviewDecision(action="ignore")}))
    assert not ignored.review and not ignored.custom_wishes


def test_manual_add_and_remove(catalog):
    r = analyze_row(row(special="Kreatin"), catalog, MONDAY,
                    RowOverride(removed_rules=["kreatin"], added_rules=["no_a"]))
    assert ids(r) == {"no_a": 1}
