# Architektur

Grafischer Überblick: [Landkarte](architecture/landkarte.pdf) (Quelle `architecture/landkarte.html`). Bei neuen Bausteinen beide Stellen pflegen.

## Überblick

| Bereich  | Ordner      | Technik |
|----------|-------------|---------|
| Backend  | `backend/`  | Python 3.12, FastAPI, openpyxl, reportlab |
| Frontend | `frontend/` | React 18, Vite, TypeScript, lucide-react, eigene Komponenten ohne UI-Framework |
| DevOps   | `devops/`   | Docker Compose, nginx (liefert `dist/` aus, Proxy `/api/` → Backend) |
| Daten    | `data/`     | Ein- und Ausgabe, Konfiguration, als Volume unter `/app/data` im Backend |

Nach außen ist nur Port 8080 offen (nginx). Das Backend lauscht intern auf 3000.

## Backend

```
backend/
  main.py                 App, Router, uvicorn (PORT, Default 3000)
  app/domain/             reine Logik ohne I/O
    models.py             Pydantic-Modelle (Run, Row, Match, RowResult, Totals, …)
    text.py               Umlaut-Faltung, Segmentierung, Datumserkennung
    rules.py              Regelkatalog, Kompilieren, Suchwörter-Import
    engine.py             analyze_row (Treffer + Review-Queue), present (Listen-Darstellung)
    totals.py             Mahlzeiten, Ohne-Zutat in Portionen, Add-ons, Check
    derived.py            Lieferdatum, Mailtexte, TSV „Sortiment neu“, AC-Strings, Brot-Hinweis
  app/io/                 excel_reader, excel_writer, pdf_writer, storage
  app/service.py          verbindet Reader → Engine → Summen → Writer
  app/api/                health, runs, config
  app/defaults/           rules.json, mail_templates.json (Start-Konfiguration)
  tests/                  pytest, synthetische Fixtures, Golden Test
```

### Datenfluss

1. `POST /api/runs`: Upload prüfen (nur `.xlsx`, max. 10 MB, Name gesäubert). Danach Kopfzeile suchen (erste Zeile mit „Bestellung“ und „Teilnehmer“), Spalten per Alias auflösen, Lieferdatum aus Dateiname oder Titelzeile bestimmen, Zeilen nach Bestellnummer numerisch sortieren.
2. Den Speiseplan-Vorschlag für den Wochentag aus `data/config/menu_defaults.json` übernehmen.
3. `recompute`: Engine pro Zeile → Darstellung je nach Speiseplan → Summen → Warnungen → abgeleitete Texte. Das Ergebnis landet in `run.json`.
4. `PATCH /api/runs/{id}`: Datum, Speiseplan, Korrekturen pro Zeile und Checklisten-Status setzen, danach wieder `recompute`. Die Live-Vorschau braucht keine Dateien.
5. `POST /api/runs/{id}/generate`: alle Dateien schreiben und den Speiseplan als Vorschlag für diesen Wochentag speichern.

`DELETE /api/runs/{id}` entfernt einen Tag samt Ordner (und den KW-Ordner, wenn er danach leer ist). Im Verlauf geht das nur mit Bestätigung.

Das Frontend rechnet nichts Fachliches nach. Summen, Herleitungen, Mailtexte, TSV, E-Mail-Liste und AC-Strings kommen fertig im Run mit.

### Regelengine

- Jede Regel hat `id`, `label`, `kind`, `patterns` (Regex), optional `case_sensitive` (Kurzcodes), `short`, `cell` und `meal`.
- Text und Muster laufen durch dieselbe Umlaut-Faltung (ä→ae, ö→oe, ü→ue, ß→ss), Groß- und Kleinschreibung spielen keine Rolle. Umlaute gehören in Muster nicht in Zeichenklassen (`n(ü|u)ss` statt `n[üu]ss`).
- Notizen und Spezialwünsche werden in Segmente zerlegt (` - `, `;`, `,`, `|`, Zeilenumbruch).
- Steht in einem Segment ein Datum, das nicht zum Lieferdatum passt (zwei Daten gelten als Zeitraum), wird die Regel nicht angewendet. Das Segment kommt dann in die Review-Queue.
- Treffer werden pro Regel dedupliziert. Spezialwünsche gewinnen als Quelle, die Menge ist das Maximum.
- Segmente mit `ohne|kein…|allergi…|unverträglich|statt|extra`, auf die keine Regel passt (auch keine `ignore`-Regel), kommen in die Review-Queue und zählen nie automatisch.
- Jeder Treffer trägt eine Begründung: Regel, Muster, Textausschnitt und Spalte.

### Berechnung

- Mahlzeit gesamt = Boxen + Σ (−1 bei `meal_minus`) + Σ (N−1 bei `meal_multi`).
- Portionen einer Person je Mahlzeit = max(0, 1 − Ohne + (N−1)). „Ohne Zutat“ zählt diese Portionen, aber nur in den Mahlzeiten, die laut Speiseplan die Zutat enthalten.
- Normal = Gesamt − Portionen mit mindestens einem Ausschluss.
- Kombi = zusätzliche Ausschlüsse derselben Portion.
- Check = Gesamt − Normal − Σ Ohne + Kombi und muss 0 sein.

### Ablage

`data/output/KW<KW>/<TT.MM.> <Wochentag>/` enthält `run.json`, `_upload.xlsx` und die Ausgabedateien. Die Konfiguration liegt in `data/config/` (`rules.json`, `menu_defaults.json`, `mail_templates.json`) und wird beim ersten Zugriff aus `app/defaults/` angelegt. Das Template für die Spezialwünsche wird aus `data/input/templates/Spezialwünsche_Template.xlsx` gelesen. Fehlt es, wird es mit den SOP-Farben nachgebaut.

### Datenschutz

Logs enthalten nur Run-ID und Anzahlen. Die Tests arbeiten mit erfundenen Daten. Der Golden Test liest die lokale Beispieldatei, prüft nur Summen und wird übersprungen, wenn die Datei fehlt. `data/` ist gitignored. Im Browser steht in `localStorage` nur die zuletzt geöffnete Run-ID.

## Frontend

`src/api/` (typisierter Client, Typen spiegeln die Pydantic-Modelle), `src/components/` (Button, Card, HeroTile, Chip, Stepper, Toggle, Dropzone, CopyField, Checklist, Toast, Notice, Title, BadgeTrio), `src/screens/` (Upload, Review, Menu, Result, Finish, History, Settings), `src/styles/` (Tokens aus `docs/company/design.md`, Verpackungs-Design).

## Annahmen

- **Kurzcodes** (`ON`, `ZK`, `OF`, `OM`, `OA`) gelten nur in Großbuchstaben, sonst würde jedes „on“ oder „om“ im Fließtext treffen.
- **Datum ohne Jahr** bekommt das aktuelle Jahr. Im Dezember gehört ein Januar-Datum zum Folgejahr. In der UI lässt sich das Datum überschreiben.
- **Offene Review-Fälle** zählen erst nach einer Entscheidung. Die Dateien lassen sich trotzdem erzeugen, die UI warnt dann.
- **Nicht relevante Wünsche** (z. B. Zutat heute in keiner Mahlzeit) werden in der Gesamtliste aus der Spalte Spezialwünsche entfernt (SOP 3.2). Die Notizen bleiben unverändert.
- **Wunschtext** in den Listen sind die Original-Segmente der relevanten Treffer in Originalreihenfolge (Spezialwünsche vor Notizen), getrennt durch „; “.
- **Add-ons** werden aus Notizen und Spezialwünschen gezählt. Im Beispiel taucht dadurch zusätzlich 1× Bitterstoffe auf (SOP 3.1: „1x Bitterstoffe“ gehört in die Spezialwünsche).
- **AC-Datum** (Tag `V_Kurbrief_JJ.MM.TT`, Kampagnensuche `TT.MM.JJJJ`) ist das Lieferdatum.
- **Brot-Hinweis:** Arbeitstag = Tag vor dem Lieferdatum. Ist das ein Sonntag oder Dienstag, zeigt die UI die Frühstückszahl als Brotmenge für Dienstag bzw. Donnerstag.
- **„genaue Menge“** enthält die Spalten der Rezeptdatei (`Ohne Nuss` = Regel `nuts`, `Ohne Z & K` = Regel `zk`). Rechts daneben stehen Kombi und eine Check-Formel.
- **Ein Lauf pro Liefertag:** Ein neuer Upload für dasselbe Datum ersetzt den Ordner des Tages.
- **Mailvorlagen** haben neutrale Default-Texte, weil die Word-Vorlagen fehlen.
- **Zusätzlicher Endpoint** `POST /api/config/rules/test` für das Testfeld in den Einstellungen.
- Die **Golden-Abweichung** bei Kreatin (Handdatei 20, App 19) ist ein Fehler in der Handdatei. Der Golden Test dokumentiert das.
