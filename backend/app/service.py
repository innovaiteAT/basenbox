"""Verbindet Reader, Engine, Summen und Writer zu einem Lauf."""
import hashlib
import re
from datetime import date
from pathlib import Path

from app.domain.derived import derive, make_delivery, parse_day_month, resolve_year
from app.domain.engine import analyze_row, present
from app.domain.models import Meal, Run, Warning
from app.domain.rules import Catalog
from app.domain.totals import compute_totals
from app.io import excel_writer, pdf_writer
from app.io.excel_reader import InputError, order_key, read_sheet

_BOXES = re.compile(r"(\d+)\s*box", re.IGNORECASE)


def create_run(data: bytes, filename: str, today: date, delivery_date: date | None = None) -> Run:
    sheet = read_sheet(data)
    if not sheet.rows:
        raise InputError("Die Tabelle enthält keine Zeilen mit Bestellnummer.")
    if delivery_date is None:
        dm = parse_day_month(filename, sheet.title)
        if dm is None:
            raise InputError("Kein Lieferdatum (TT.MM.) im Dateinamen oder in der Titelzeile gefunden.")
        day, month = dm
        delivery_date = date(resolve_year(month, today), month, day)
    title_boxes = None
    if sheet.title and (m := _BOXES.search(sheet.title)):
        title_boxes = int(m.group(1))
    rows = sorted(sheet.rows, key=lambda r: order_key(r.order))
    digest = hashlib.sha256(data).hexdigest()[:8]
    return Run(
        id=f"{delivery_date:%Y-%m-%d}-{digest}",
        source_name=filename,
        delivery=make_delivery(delivery_date),
        title_boxes=title_boxes,
        boxes=len(rows),
        header_row=sheet.header_row,
        has_special_column=sheet.has_special_column,
        rows=rows,
    )


def recompute(run: Run, catalog: Catalog, templates: dict) -> Run:
    d = run.delivery.date
    menu = {k: v for k, v in run.menu.items() if k in catalog.by_id}
    results = [present(analyze_row(r, catalog, d, run.overrides.get(r.index)), catalog, menu) for r in run.rows]
    totals, warnings = compute_totals(results, menu, run.boxes)
    if run.title_boxes is not None and run.title_boxes != run.boxes:
        warnings.insert(0, Warning(
            code="boxes",
            message=f"Titelzeile nennt {run.title_boxes} Boxen, gezählt sind {run.boxes} Zeilen mit Bestellnummer.",
        ))
    if not run.has_special_column:
        warnings.append(Warning(code="no_special", message="Spalte „Spezialwünsche“ fehlte und wird angelegt."))
    open_rows = [r.index for r in results if r.review]
    if open_rows:
        n = sum(len(r.review) for r in results)
        warnings.append(Warning(
            code="review",
            message=("1 Wunsch braucht" if n == 1 else f"{n} Wünsche brauchen")
            + " deinen Blick, sie zählen erst nach deiner Entscheidung.",
            row_indices=open_rows,
        ))
    missing = [i.id for i in catalog.ingredients() if i.id not in run.menu]
    if missing:
        warnings.append(Warning(code="menu", message="Speiseplan noch nicht für alle Zutaten festgelegt."))
    labels = {r.id: r.label for r in catalog.addons()}
    derived = derive(run.delivery, totals, run.rows, menu, templates, labels)
    return run.model_copy(update={"results": results, "totals": totals, "warnings": warnings, "derived": derived})


def default_menu(catalog: Catalog, saved: dict[str, list[str]] | None) -> dict[str, list[Meal]]:
    saved = saved or {}
    return {r.id: [Meal(m) for m in saved[r.id]] for r in catalog.ingredients() if r.id in saved}


def generate_files(run: Run, catalog: Catalog, upload: bytes, folder: Path, template: Path | None) -> list[str]:
    label = run.delivery.label
    folder.mkdir(parents=True, exist_ok=True)
    writers = [
        (f"{label} Gesamt.xlsx", lambda p: excel_writer.write_gesamt(run, upload, p)),
        (f"{label} Etikettenliste.xlsx", lambda p: excel_writer.write_labels(run, p)),
        (f"{label} Spezialwünsche.xlsx", lambda p: excel_writer.write_special(run, catalog, p, template)),
        (f"{label} Spezialwünsche.pdf", lambda p: pdf_writer.write_special_pdf(run, catalog, p)),
        (f"{label} genaue Menge.xlsx", lambda p: excel_writer.write_amounts(run, p)),
        (f"{label} genaue Menge.pdf", lambda p: pdf_writer.write_amounts_pdf(run, p)),
    ]
    for name, write in writers:
        write(folder / name)
    return [name for name, _ in writers]
