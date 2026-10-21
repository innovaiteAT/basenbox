from datetime import date

from app.domain.derived import bread_hint, derive, make_delivery, resolve_year
from app.domain.engine import analyze_row, present
from app.domain.models import Meal
from app.domain.totals import compute_totals
from tests.conftest import MONDAY, row


def run_totals(catalog, specials: list[str], menu, boxes=None):
    results = [present(analyze_row(row(special=s, index=i), catalog, MONDAY), catalog, menu)
               for i, s in enumerate(specials)]
    return compute_totals(results, menu, boxes or len(specials))


def test_meal_totals(catalog):
    t, _ = run_totals(catalog, ["OM; 2xAbend", "Ohne Frühstück & 2x Abend", "3x Mittag", ""], {})
    assert t.meals[Meal.F].total == 3
    assert t.meals[Meal.M].total == 4 - 1 + 2
    assert t.meals[Meal.A].total == 6


def test_without_counts_portions(catalog):
    menu = {"zk": [Meal.A], "nuts": [Meal.M]}
    t, _ = run_totals(catalog, ["Zwiebel; 2x Abend", "ON; OM", "ON", ""], menu)
    assert t.meals[Meal.A].without == {"zk": 2}
    assert t.meals[Meal.M].without == {"nuts": 1}  # OM-Person zählt nicht
    assert t.meals[Meal.A].normal == t.meals[Meal.A].total - 2
    assert all(m.check == 0 for m in t.meals.values())


def test_combo_portion(catalog):
    menu = {"zk": [Meal.A], "nuts": [Meal.A]}
    t, warnings = run_totals(catalog, ["ohne Nüsse, ohne Zwiebel", ""], menu)
    a = t.meals[Meal.A]
    assert a.without == {"nuts": 1, "zk": 1} and a.combo == 1 and a.normal == 1 and a.check == 0
    assert [w.code for w in warnings] == ["combo"]


def test_addon_totals_and_relevance(catalog):
    t, _ = run_totals(catalog, ["2x Kreatin", "Kreatin", "Rosinen"], {"raisins": []})
    assert t.addons == {"kreatin": 3}
    assert t.relevant_rows == [0, 1]


def test_year_rollover():
    assert resolve_year(1, date(2026, 12, 30)) == 2027
    assert resolve_year(6, date(2026, 6, 5)) == 2026


def test_delivery_and_bread():
    d = make_delivery(MONDAY)
    assert (d.weekday, d.iso_week, d.label) == ("Montag", 24, "08.06.")
    assert "Dienstag" in bread_hint(MONDAY, 50)  # Arbeitstag Sonntag
    assert "Donnerstag" in bread_hint(date(2026, 6, 10), 50)  # Arbeitstag Dienstag
    assert bread_hint(date(2026, 6, 9), 50) is None


def test_derived_strings(catalog):
    t, _ = run_totals(catalog, ["Kreatin"], {})
    templates = {"recipients": [{"id": "x", "name": "X", "subject": "{datum}",
                                 "templates": {"default": "{boxen} Boxen, {addons}, {unbekannt}"}}]}
    d = derive(make_delivery(MONDAY), t, [row()], {}, templates, {"kreatin": "Kreatin"})
    assert d.ac_tag == "V_Kurbrief_26.06.08" and d.ac_search == "08.06.2026"
    assert d.mails["x"]["body"] == "1 Boxen, Kreatin 1, {unbekannt}"
    assert d.sortiment_tsv.splitlines()[1].startswith("Abend\tMontag\t1\t1")
