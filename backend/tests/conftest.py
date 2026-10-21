"""Synthetische Fixtures: alle Namen und Adressen sind erfunden."""
from datetime import date
from io import BytesIO

import pytest
from openpyxl import Workbook

from app.domain.models import Row
from app.domain.rules import Catalog, default_rules

HEADER = ["Bestellung", "Firma", "Teilnehmer", "Email", "Straße", "Hausnummer", "Stiege", "Tür",
          "PLZ", "Ort", "Land", "Telefon", "Notizen", "Spezialwünsche"]
MONDAY = date(2026, 6, 8)


def make_xlsx(rows: list[dict], title: str | None = "08.06. 3 Boxen", header: list[str] | None = None) -> bytes:
    header = header or HEADER
    wb = Workbook()
    ws = wb.active
    if title:
        ws.append([title])
        ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=len(header) - 1)
    ws.append(header)
    for i, data in enumerate(rows):
        values = {
            "Bestellung": str(1000 + i), "Teilnehmer": f"Testperson {i}", "Email": f"person{i}@example.org",
            "Straße": "Musterweg", "Strasse": "Musterweg", "Hausnummer": str(i + 1), "PLZ": "1010", "Ort": "Wien",
            "Land": "AT", **data,
        }
        ws.append([values.get(h) for h in header])
    buf = BytesIO()
    wb.save(buf)
    return buf.getvalue()


def row(notes: str = "", special: str = "", index: int = 3, order: str = "1000") -> Row:
    return Row(index=index, order=order, notes=notes, special=special)


@pytest.fixture
def catalog() -> Catalog:
    return Catalog(default_rules())


@pytest.fixture
def data_dir(tmp_path, monkeypatch):
    monkeypatch.setenv("DATA_DIR", str(tmp_path))
    return tmp_path
