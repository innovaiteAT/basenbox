import re
from datetime import date, timedelta

from .models import MEAL_LONG, Delivery, Derived, Meal, Row, Totals

WEEKDAYS = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"]
SORTIMENT_ORDER = (Meal.A, Meal.F, Meal.M)
SORTIMENT_HEADER = ["F/M/A", "Wochentag", "Anzahl Gesamt", "Anzahl Normal", "Ohne Nuss", "Ohne Z & K"]
AVERY_LAYOUT = "Teilnehmer\nStrasse Hausnummer/Stiege/Tür\nPLZ\n\nSpezialwünsche"
_DAY_MONTH = re.compile(r"(?<!\d)(\d{1,2})\.(\d{1,2})\.")


def parse_day_month(*candidates: str | None) -> tuple[int, int] | None:
    for text in candidates:
        if not text:
            continue
        m = _DAY_MONTH.search(text)
        if m and 1 <= int(m.group(2)) <= 12 and 1 <= int(m.group(1)) <= 31:
            return int(m.group(1)), int(m.group(2))
    return None


def resolve_year(month: int, today: date) -> int:
    """Erstellt wird am Vortag: im Dezember gehört ein Januar-Datum zum Folgejahr."""
    if today.month == 12 and month == 1:
        return today.year + 1
    return today.year


def make_delivery(d: date) -> Delivery:
    return Delivery(date=d, weekday=WEEKDAYS[d.weekday()], iso_week=d.isocalendar().week, label=d.strftime("%d.%m."))


def bread_hint(delivery: date, breakfast: int) -> str | None:
    workday = delivery - timedelta(days=1)
    target = {6: "Dienstag", 1: "Donnerstag"}.get(workday.weekday())
    if not target:
        return None
    return f"Heute ist {WEEKDAYS[workday.weekday()]}: trag {breakfast} als Brotmenge für {target} ein."


def sortiment_rows(totals: Totals, weekday: str, menu: dict) -> list[list[str]]:
    rows = []
    for meal in SORTIMENT_ORDER:
        t = totals.meals[meal]
        nut = str(t.without.get("nuts", 0)) if meal in menu.get("nuts", []) else ""
        zk = str(t.without.get("zk", 0)) if meal in menu.get("zk", []) else ""
        rows.append([MEAL_LONG[meal], weekday, str(t.total), str(t.normal), nut, zk])
    return rows


class _SafeDict(dict):
    def __missing__(self, key: str) -> str:
        return "{" + key + "}"


def placeholders(delivery: Delivery, totals: Totals, addon_labels: dict[str, str]) -> dict[str, str]:
    without = lambda rid: sum(t.without.get(rid, 0) for t in totals.meals.values())
    addons = ", ".join(f"{addon_labels.get(k, k)} {v}" for k, v in totals.addons.items())
    return {
        "datum": delivery.label,
        "wochentag": delivery.weekday,
        "boxen": str(totals.boxes),
        "frueh": str(totals.meals[Meal.F].total),
        "mittag": str(totals.meals[Meal.M].total),
        "abend": str(totals.meals[Meal.A].total),
        "ohne_nuss": str(without("nuts")),
        "ohne_zk": str(without("zk")),
        "addons": addons or "keine",
    }


def render_mails(templates: dict, values: dict[str, str], weekday: str) -> dict[str, dict[str, str]]:
    def fill(text) -> str:
        try:
            return str(text or "").format_map(_SafeDict(values))
        except (ValueError, IndexError):  # kaputte Klammern in einer Vorlage
            return str(text or "")

    out = {}
    for rec in templates.get("recipients", []):
        body = rec.get("templates", {}).get(weekday) or rec.get("templates", {}).get("default", "")
        out[rec["id"]] = {
            "name": rec.get("name", rec["id"]),
            "to": rec.get("email", ""),
            "subject": fill(rec.get("subject")),
            "body": fill(body),
        }
    return out


def derive(delivery: Delivery, totals: Totals, rows: list[Row], menu: dict, templates: dict,
           addon_labels: dict[str, str]) -> Derived:
    d = delivery.date
    tsv = "\n".join("\t".join(r) for r in [SORTIMENT_HEADER, *sortiment_rows(totals, delivery.weekday, menu)])
    emails = list(dict.fromkeys(r.email.strip() for r in rows if r.email and r.email.strip()))
    return Derived(
        mails=render_mails(templates, placeholders(delivery, totals, addon_labels), delivery.weekday),
        sortiment_tsv=tsv,
        emails=emails,
        ac_tag=f"V_Kurbrief_{d:%y.%m.%d}",
        ac_search=f"{d:%d.%m.%Y}",
        bread_hint=bread_hint(d, totals.meals[Meal.F].total),
        avery_layout=AVERY_LAYOUT,
        labels_filename=f"{delivery.label} Etiketten",
    )
