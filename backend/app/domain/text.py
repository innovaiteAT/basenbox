import re
from datetime import date

_UMLAUTS = str.maketrans({"ä": "ae", "ö": "oe", "ü": "ue", "ß": "ss", "Ä": "Ae", "Ö": "Oe", "Ü": "Ue"})
_SPLIT = re.compile(r"\s+-\s+|[;,|\n\r]+")
_DATE = re.compile(r"(?<![\d.])(\d{1,2})\.(\d{1,2})\.(?:(\d{2}|\d{4})(?!\d))?")


def fold(text: str) -> str:
    """Umlaute ausschreiben, Groß-/Kleinschreibung bleibt (für Kurzcodes nötig)."""
    return text.translate(_UMLAUTS)


def split_segments(text: str | None) -> list[str]:
    if not text:
        return []
    return [s.strip() for s in _SPLIT.split(str(text)) if s and s.strip()]


def find_dates(segment: str, year: int) -> list[date]:
    found = []
    for m in _DATE.finditer(segment):
        day, month = int(m.group(1)), int(m.group(2))
        y = int(m.group(3)) if m.group(3) else year
        if y < 100:
            y += 2000
        try:
            found.append(date(y, month, day))
        except ValueError:
            continue
    return found


def date_applies(dates: list[date], delivery: date) -> bool:
    """Keine Daten oder ein Datum gleich dem Lieferdatum; zwei Daten gelten als Zeitraum."""
    if not dates or delivery in dates:
        return True
    if len(dates) == 2:
        lo, hi = sorted(dates)
        return lo <= delivery <= hi
    return False
