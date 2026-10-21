from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from app.domain.derived import SORTIMENT_HEADER, sortiment_rows
from app.domain.models import MEAL_LABEL, MEALS, Meal, Run
from app.domain.rules import Catalog
from app.io.excel_writer import relevant_pairs, summary_cells

INK = colors.HexColor("#1A1A1A")
STONE = colors.HexColor("#5B5550")
LEMON = colors.HexColor("#FFE000")
MIST = colors.HexColor("#F4F2EE")
LINE = colors.HexColor("#E4E0DA")
MEAL_COLOR = {Meal.F: colors.HexColor("#C5DB2E"), Meal.M: colors.HexColor("#FFB200"), Meal.A: colors.HexColor("#8CC3E8")}

KICKER = ParagraphStyle("kicker", fontName="Helvetica-Bold", fontSize=8, textColor=STONE, leading=10)
TITLE = ParagraphStyle("title", fontName="Helvetica", fontSize=20, textColor=STONE, leading=24)
CELL = ParagraphStyle("cell", fontName="Helvetica", fontSize=9, textColor=INK, leading=11)
HEAD = ParagraphStyle("head", fontName="Helvetica-Bold", fontSize=9, textColor=INK, leading=11)


def _p(text, style=CELL) -> Paragraph:
    return Paragraph(escape(str(text)) if text not in (None, "") else "", style)


def _title(kicker: str, light: str, bold: str) -> list:
    return [
        Paragraph(kicker.upper(), KICKER),
        Spacer(1, 2 * mm),
        Paragraph(f"{escape(light.upper())} <font name='Helvetica-Bold' color='#1A1A1A'>{escape(bold.upper())}</font>", TITLE),
        Spacer(1, 6 * mm),
    ]


def _base_style(n_rows: int) -> list:
    return [
        ("FONT", (0, 0), (-1, -1), "Helvetica", 9),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LINEBELOW", (0, 0), (-1, -1), 0.5, LINE),
        ("BACKGROUND", (0, 0), (-1, 0), MIST),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]


def write_special_pdf(run: Run, catalog: Catalog, path: Path) -> None:
    t = run.totals
    addons = [r for r in catalog.addons() if t.addons.get(r.id)]
    head = ["Bestellung", "Teilnehmer", "Spezialwünsche"] + [f"{MEAL_LABEL[m]} ({t.meals[m].total})" for m in MEALS]
    head += [r.label for r in addons]
    data = [[_p(h, HEAD) for h in head]]
    for row, res in relevant_pairs(run):
        data.append([_p(row.order), _p(row.name), _p(res.wish_text)]
                    + [_p(res.meal_cells.get(m)) for m in MEALS]
                    + [_p(res.addons.get(r.id)) for r in addons])
    summary = summary_cells(run, catalog)
    data.append([_p(""), _p(""), _p("Summe", HEAD)] + [_p(summary.get(m), HEAD) for m in MEALS]
                + [_p(t.addons.get(r.id), HEAD) for r in addons])
    page = landscape(A4)
    fixed = [22 * mm, 45 * mm, 0, 30 * mm, 30 * mm, 30 * mm] + [20 * mm] * len(addons)
    fixed[2] = page[0] - 30 * mm - sum(fixed)
    table = Table(data, colWidths=fixed, repeatRows=1)
    style = _base_style(len(data))
    for i, m in enumerate(MEALS):
        style.append(("BACKGROUND", (3 + i, 0), (3 + i, 0), MEAL_COLOR[m]))
    style += [("BACKGROUND", (0, -1), (-1, -1), MIST), ("LINEABOVE", (0, -1), (-1, -1), 1, INK)]
    table.setStyle(TableStyle(style))
    doc = SimpleDocTemplate(str(path), pagesize=page, leftMargin=15 * mm, rightMargin=15 * mm,
                            topMargin=12 * mm, bottomMargin=12 * mm, title=f"{run.delivery.label} Spezialwünsche")
    kicker = f"{run.delivery.weekday} {run.delivery.label} · KW{run.delivery.iso_week} · {run.boxes} Boxen"
    doc.build(_title(kicker, "Spezial", "wünsche") + [table])


def write_amounts_pdf(run: Run, path: Path) -> None:
    rows = sortiment_rows(run.totals, run.delivery.weekday, run.menu)
    head = SORTIMENT_HEADER + ["Kombi", "Check"]
    data = [[_p(h, HEAD) for h in head]]
    for values, meal in zip(rows, (Meal.A, Meal.F, Meal.M)):
        m = run.totals.meals[meal]
        data.append([_p(v) for v in values] + [_p(m.combo), _p(m.check, HEAD)])
    table = Table(data, colWidths=[28 * mm, 26 * mm, 26 * mm, 26 * mm, 22 * mm, 24 * mm, 16 * mm, 16 * mm])
    style = _base_style(len(data))
    for i, meal in enumerate((Meal.A, Meal.F, Meal.M), start=1):
        style.append(("BACKGROUND", (0, i), (0, i), MEAL_COLOR[meal]))
        ok = run.totals.meals[meal].check == 0
        style.append(("BACKGROUND", (-1, i), (-1, i), colors.HexColor("#C6EFCE" if ok else "#FFC7CE")))
    table.setStyle(TableStyle(style))
    doc = SimpleDocTemplate(str(path), pagesize=A4, leftMargin=15 * mm, rightMargin=15 * mm,
                            topMargin=15 * mm, bottomMargin=15 * mm, title=f"{run.delivery.label} genaue Menge")
    kicker = f"{run.delivery.weekday} {run.delivery.label} · KW{run.delivery.iso_week}"
    note = Paragraph("Check muss 0 sein: Gesamt − Normal − Ohne Nuss − Ohne Z&amp;K + Kombi.", KICKER)
    doc.build(_title(kicker, "Genaue", "Menge") + [table, Spacer(1, 4 * mm), note])
