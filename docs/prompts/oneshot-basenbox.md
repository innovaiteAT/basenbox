# One-Shot-Prompt: Basenbox Tagesablauf-App

> Diesen Prompt komplett an Claude Code übergeben (im Repo-Root, Auto-Mode empfohlen).
> Er ist so geschrieben, dass er ohne Rückfragen von Anfang bis Ende durchläuft.

---

<rolle>
Du bist Senior Full-Stack-Engineer und Produktdesigner zugleich. Du baust in diesem Repo eine fertige, lauffähige Web-App, die den täglichen Liefer-Ablauf von Basenbox (Wiener Basenkur-Lieferdienst) automatisiert. Du arbeitest selbstständig bis zur Definition of Done, ohne Rückfragen. Wo etwas unklar ist, triffst du die naheliegende Entscheidung, hältst sie in `docs/architecture.md` unter „Annahmen" fest und machst weiter.
</rolle>

<kontext>
Lies zuerst vollständig, bevor du Code schreibst:
1. `CLAUDE.md`: Regeln, Aufbau, Stolperfallen. Gilt immer und hat Vorrang.
2. `docs/task.md`: die SOP (Phasen 1–9). Das ist die fachliche Spezifikation.
3. `docs/company/design.md`: Designsystem. Für die Web-App gilt das **Verpackungs-Design** (Zitrone, Anthrazit, viel Weiß, Kreise), nicht das Website-Design.
4. `docs/architecture.md`, `docs/roadmap.md`, `devops/` (Compose, Dockerfiles, nginx).
5. Struktur der Beispieldateien, **nur Kopfzeilen und Spaltenaufbau ausgeben, keine Zeileninhalte in Logs, Doku oder Tests übernehmen**:
   - `data/input/example/KW24/08.06. Montag/08.06. Gesamt.xlsx` (Eingabe: Backoffice-Export)
   - `data/input/example/KW24/08.06. Montag/Spezialwünsche 08.06.xlsx` (von Hand erstelltes Soll-Ergebnis)
   - `data/input/templates/Spezialwünsche_Template.xlsx` (Vorlage mit Formatierung)
   - `data/input/templates/Suchwörter.xlsx` (Start-Katalog der Suchwörter)

`backend/` und `frontend/` werden neu aufgebaut. Gelöschte Altdateien dort nicht wiederherstellen, sondern ersetzen.
</kontext>

<ziel>
Eine App, mit der eine Mitarbeiterin am Vortag in unter 5 Minuten aus dem Backoffice-Export alle Tagesdateien erzeugt und durch die restlichen manuellen Schritte (Avery, ActiveCampaign, QR-Code, Mails) geführt wird.

Grundprinzip: **Alles, was sich deterministisch aus den Daten berechnen lässt, macht das Backend. Alles, was eine menschliche Entscheidung oder ein externes Tool braucht, löst das Frontend als geführten Schritt** (Review-Queue, Toggle, Checkliste mit Copy-Buttons).

Kein LLM, keine Heuristik mit Zufall. Gleiche Eingabe + gleiche Konfiguration = gleiches Ergebnis. Jede erkannte Regel trägt eine Begründung (welche Regel, welcher Textausschnitt, welche Spalte), damit die UI sie anzeigen kann.
</ziel>

<fachliche_spezifikation>

## Eingabe: Gesamtliste (Backoffice-Export)
- Excel, Dateiname `TT.MM. Gesamt.xlsx`. Zeile 1 kann ein Titel sein (`08.06. 61 Boxen`, verbunden über mehrere Spalten), Kopfzeile in Zeile 1 oder 2. **Kopfzeile automatisch erkennen** (erste Zeile, die `Bestellung` und `Teilnehmer` enthält).
- Spalten (Reihenfolge nicht hart codieren, per Name auflösen, tolerant gegenüber `Straße/Strasse`, `Notiz/Notizen`, `Spezialwünsche/Spezialwuensche`): Bestellung, Firma, Teilnehmer, Email, Straße, Hausnummer, Stiege, Tür, PLZ, Ort, Land, Telefon, Notizen, Spezialwünsche.
- Spalte Spezialwünsche kann fehlen oder teilweise befüllt sein. Fehlt sie, anlegen.
- Lieferdatum: aus Dateiname oder Titelzeile (`TT.MM.`), Jahr = aktuelles Jahr, beim Jahreswechsel (Arbeitstag im Dezember, Datum im Januar) das Folgejahr. In der UI überschreibbar, der Golden Test setzt 2026 explizit. Daraus Wochentag und ISO-KW.
- Boxenanzahl = Anzahl Datenzeilen mit Bestellnummer. Weicht sie von der Titelzeile ab: Warnung.

## Regelkatalog (konfigurierbar, Start aus `Suchwörter.xlsx`)
Gespeichert als JSON (`data/config/rules.json`, beim ersten Start aus einem Default im Backend-Code erzeugt). In der UI editierbar. Jede Regel: `id`, `label`, `kind`, `patterns` (Regex, case-insensitive, Umlaut-tolerant), optional `short`.

| kind | Beispiele | Wirkung |
|---|---|---|
| `ingredient` (mahlzeitabhängig) | Nüsse (`nuss`, `nüsse`, `ON`), Z&K (`zwiebel`, `knoblauch`, `knofi`, `ZK`, `Z&K`; beide Wörter zählen als **eine** Regel Z&K), Rosinen | Zählt nur in der Mahlzeit, die laut Tages-Speiseplan diese Zutat enthält. Steht die Zutat heute in keiner Mahlzeit: nicht relevant, fällt aus der Liste |
| `meal_minus` | `OF`/`ohne Frühstück`, `OM`/`ohne Mittag(essen)`, `OA`/`ohne Abend(essen)` | −1 auf diese Mahlzeit |
| `meal_multi` | `2x Frühstück`, `2xFrüh`, `3 x Abend`, `2xMittagessen` (Regex `(\d)\s*x\s*(früh(stück)?\|mittag(essen)?\|abend(essen)?)`) | +(N−1) auf diese Mahlzeit |
| `addon` | Kreatin, Bitterstoffe (Menge über `(\d)\s*x\s*<wort>`, sonst 1) | Eigene Zählspalte, keine Auswirkung auf Mahlzeiten |
| `ignore` | Rabatt, Aktion, Gutschein, `Stock:`, Klingel, abstellen, anrufen, Lieferzeit | Bleibt reine Lieferinfo in Notizen |

Verarbeitung pro Zeile:
1. Notizen und Spezialwünsche in Segmente zerlegen (Trenner: ` - `, `;`, `,`, `|`, Zeilenumbruch).
2. **Datumsbezug:** Enthält ein Segment ein Datum (`8.6.`, `08.06.`, `am 8.6.`) und weicht es vom Lieferdatum ab, wird die Regel nicht angewendet und die Zeile kommt in die Review-Queue. Passt es, gilt die Regel.
3. Treffer aus beiden Spalten vereinigen und deduplizieren (gleiche Regel aus Notiz und Spezialwünsche zählt einmal).
4. **Unklar-Erkennung:** Segmente mit `ohne|kein|keine|keinen|allergi|unverträglich|statt|extra` ohne Regeltreffer (z. B. ein nicht katalogisiertes Gewürz) gehen in die Review-Queue. Sie werden nie automatisch gezählt. Trifft eine `ignore`-Regel (Lieferhinweise wie „falls ich nicht da bin, vor die Tür stellen"), kommt das Segment nicht in die Queue. Ziel: die Queue bleibt kurz, im Beispiel nur wenige Fälle.
5. Ergebnis pro Zeile: Liste von Treffern `{rule_id, quantity, source_column, source_text, reason}` plus Status `auto | review | manual`.

## Tages-Speiseplan (Entscheidung im Frontend)
Pro Lauf legt die Nutzerin per Toggle fest, in welcher Mahlzeit jede `ingredient`-Regel heute vorkommt: Früh / Mittag / Abend / keine (Mehrfachauswahl erlaubt). Die letzte Auswahl pro Wochentag wird als Vorschlag gespeichert (`data/config/menu_defaults.json`).

## Berechnung (Phase 5 und 6)
- `Früh/Mittag/Abend gesamt = Boxen + Σ meal_minus + Σ meal_multi` je Mahlzeit.
- Ohne-Zutat-Zählung **in Portionen**: Bestellt jemand `2x Abend` und Z&K steckt im Abend, zählt das 2 Portionen ohne Z&K. Bei `OM` und Nüssen im Mittag zählt nichts.
- Sortiment neu je Mahlzeit: `Anzahl Gesamt`, `Ohne Nuss`, `Ohne Z&K`, `Anzahl Normal = Gesamt − Portionen mit mindestens einer Ausschluss-Zutat`. Hat eine Person zwei Ausschlüsse in derselben Mahlzeit: eigene Warnung „Kombi-Portion" und Check-Zeile, die beweist, dass die Summen aufgehen (Check = 0, analog zum grünen Prüfblock in der SOP).
- Add-on-Summen je Add-on.
- Brot-Hinweis (SOP 6.2): Ist der Arbeitstag Sonntag oder Dienstag, zeigt die UI die Frühstückszahl als Brotmenge für Dienstag bzw. Donnerstag an.

## Golden Test (Beispiel 08.06., Montag, KW24)
Mit Speiseplan Nüsse → Mittag, Z&K → Abend, Rosinen → keine muss gelten:
- Boxen 61, **Früh 62, Mittag 60, Abend 62**
- **5x Ohne Nüsse** (Mittag), **8x Ohne Z&K** (Abend)
- **Kreatin 19**: Die Handdatei zeigt 20, eine Kreatin-1 steht dort in einer Zeile ohne Kreatin-Wunsch (Fehler in der Handdatei). Im Test dokumentieren.
- **29 Zeilen** in der Spezialwünsche-Liste. Die Zeile mit nur „Rosinen" fällt raus, die Zeile mit nicht katalogisiertem Gewürz in der Notiz landet in der Review-Queue.
- Kreatin-Einträge, die nur in Notizen stehen (z. B. `Kreatin (am 8.6.)`) und in Spezialwünsche fehlen, werden erkannt.

Der Golden Test liest die Beispieldatei aus `data/input/example/` und wird mit `pytest.skip` übersprungen, wenn sie fehlt (Daten sind gitignored). Für alle anderen Tests synthetische Fixtures mit erfundenen Daten im Code erzeugen, nie echte Kundendaten.

## Ausgabedateien
Ablage: `data/output/KW<KW>/<TT.MM.> <Wochentag>/`, zusätzlich als ZIP downloadbar. Namen laut SOP-Anhang:

| Datei | Inhalt |
|---|---|
| `TT.MM. Gesamt.xlsx` | Originaltabelle, Titelzelle `TT.MM. N Boxen` (gelb), Spalte Spezialwünsche mit den relevanten Wünschen, **fett**. Notizen bleiben unverändert (kopieren statt verschieben). Für Goran |
| `TT.MM. Etikettenliste.xlsx` | Nur Zeilen mit Spezialwunsch. Kopfzeile in Zeile 1 (Avery entfernt sie per Häkchen): Teilnehmer, Strasse, Hausnummer, Stiege, Tür, PLZ, Spezialwünsche. Keine Titelzeile, keine verbundenen Zellen |
| `TT.MM. Spezialwünsche.xlsx` | Auf Basis von `Spezialwünsche_Template.xlsx` (Formatierung behalten; fehlt sie, nachbauen: A1 gelb `FFFF00`, Früh grün `92D050`, Mittag orange `FFC000`, Abend blau `00B0F0`). A1 `Datum: TT.MM.`, C1 `Boxenanzahl: N`, Zeile 2: Bestellung · Teilnehmer · Spezialwünsche · Summe Früh · Summe Mittag · Summe Abend · ab Spalte G je Add-on eine Spalte. Ab Zeile 3 je Person: Wünsche im Klartext und in der passenden Mahlzeitspalte (`OM`, `2xAbend`, `Nüsse`, `Zwiebeln, Knoblauch`), Add-on-Menge. Summenzeile: `5x Ohne Nüsse` in der Spalte der Mahlzeit, Add-ons per `=SUM()` |
| `TT.MM. Spezialwünsche.pdf` | Gleiche Liste als A4-PDF (reportlab), Markenfarben, druckfreundlich |
| `TT.MM. genaue Menge.xlsx` + `.pdf` | Tabelle „Sortiment neu" für den Tag, Reihenfolge Abend → Frühstück → Mittag, Spalten F/M/A · Wochentag · Anzahl Gesamt · Anzahl Normal · Ohne Nuss · Ohne Z & K, plus Check-Block |

Die Rezeptdatei selbst liegt nicht im Repo. Deshalb bietet die UI zusätzlich „Als Tabelle kopieren" (TSV in genau dieser Spalten- und Zeilenreihenfolge) zum Einfügen in „Sortiment neu".
</fachliche_spezifikation>

<phasen_abdeckung>
| SOP-Phase | Lösung |
|---|---|
| 1 Mails vorbereiten | Frontend: Mailvorlagen pro Empfänger (Gaumenfreundinnen, Goran) und Wochentag, editierbar in den Einstellungen, gespeichert in `data/config/mail_templates.json`. Platzhalter `{datum}`, `{wochentag}`, `{boxen}`, `{frueh}`, `{mittag}`, `{abend}`, `{ohne_nuss}`, `{ohne_zk}`, `{addons}`. Ergebnis mit Copy-Button und `mailto:`-Link. Neutrale Default-Texte, da die Word-Vorlagen fehlen |
| 2 Gesamtliste | Backend: Upload, Erkennung, Datum, KW, Boxen. Frontend: Drag & Drop |
| 3 Spezialwünsche anpassen | Backend: Regelengine. Frontend: Review-Screen (siehe UX) + Speiseplan-Toggles |
| 4 Etikettenliste | Backend: Datei erzeugen |
| 5 Liste Spezialwünsche | Backend: Excel + PDF |
| 6 Genaue Mengen | Backend: Berechnung + Datei. Frontend: TSV-Copy, Brot-Hinweis |
| 7 Avery 3424 | Frontend: geführte Checkliste (Daten importieren → Häkchen Zeile 1 entfernen → Feldanordnung als kopierbarer Block → speichern als `TT.MM. Etiketten`), Download-Button der Etikettenliste direkt im Schritt |
| 8 AC Kurbrief | Frontend: Checkliste mit Copy-Buttons: E-Mails (eine pro Zeile, aus Spalte Email), Tag `V_Kurbrief_JJ.MM.TT`, Liste `V_Kurbrief`, Kampagnensuche `TT.MM.JJJJ`, Uhrzeit 11:00, Empfängerzahl zum Abgleich. Datum = Lieferdatum (Annahme, dokumentieren). Keine API-Anbindung, keine Zugangsdaten |
| 9 QR-Code | Frontend: Checkliste mit den beiden ACHTUNG-Hinweisen prominent. Keine Passwörter im Code oder in der UI |

Checklisten-Fortschritt pro Lauf im Backend speichern (`run.json`), damit er einen Reload übersteht.
</phasen_abdeckung>

<architektur>

## Backend (Python 3.12, FastAPI)
```
backend/
  main.py                  # App, Router-Einbindung, uvicorn-Start (PORT aus env, Default 3000)
  app/
    api/                   # Router: health, runs, config
    domain/                # reine Logik ohne I/O: models.py, rules.py, engine.py, totals.py
    io/                    # excel_reader.py, excel_writer.py, pdf_writer.py, storage.py
    defaults/              # rules.json, mail_templates.json (Start-Konfiguration)
  tests/                   # pytest: Regeln, Engine, Summen, Writer, API, Golden Test
  requirements.txt         # feste Versionen
```
- Pakete mit fester Version: `fastapi==0.115.6`, `uvicorn==0.34.0`, `openpyxl==3.1.5`, `python-multipart==0.0.20`, `reportlab==4.2.5`, `pydantic` (passend zu FastAPI), Tests: `pytest==8.3.4`, `httpx==0.28.1`.
- Domain-Logik strikt getrennt von I/O und API, vollständig typisiert (Pydantic-Modelle).
- Persistenz ohne Datenbank: `data/output/<KW>/<Tag>/run.json` + Dateien, Konfiguration in `data/config/`.
- **Datenschutz:** keine Zeileninhalte loggen (nur Anzahlen, Run-ID). Upload-Größe begrenzen, nur `.xlsx` annehmen, Dateinamen säubern (Path Traversal).

### API (alles unter `/api`)
| Methode | Pfad | Zweck |
|---|---|---|
| GET | `/api/health` | Status |
| POST | `/api/runs` | Upload Gesamtliste (multipart) → Run mit Datum, KW, Boxen, Zeilen, Treffern, Review-Queue |
| GET | `/api/runs` / `/api/runs/{id}` | Liste der Läufe / ein Lauf |
| PATCH | `/api/runs/{id}` | Datum, Speiseplan, manuelle Korrekturen pro Zeile, Checklisten-Status |
| POST | `/api/runs/{id}/generate` | Berechnen + alle Dateien schreiben → Summen, Warnungen, Dateiliste |
| GET | `/api/runs/{id}/files/{name}` · `/api/runs/{id}/zip` | Downloads |
| GET/PUT | `/api/config/rules` · `/api/config/mail-templates` | Konfiguration |
| POST | `/api/config/rules/import` | `Suchwörter.xlsx` importieren |

Ausgaben, die das Frontend braucht (Summen, Mailtexte, TSV, E-Mail-Liste, AC-Strings), berechnet das Backend und liefert sie im Run mit. Das Frontend rechnet nichts Fachliches nach.

## Frontend (React 18 + Vite + TypeScript)
- Feste Versionen: `react@18.3.1`, `react-dom@18.3.1`, `vite@5.4.x`, `typescript@5.6.x`, `lucide-react` für Icons. Kein UI-Framework, kein Tailwind: eigene Komponenten mit CSS-Variablen aus `design.md` (`--bb-lemon` usw.). Optional `framer-motion` für Übergänge.
- Struktur: `src/api/` (typisierter Client), `src/components/` (Button, Card, HeroTile, Chip, Stepper, Toggle, Dropzone, CopyField, Checklist, Toast), `src/screens/`, `src/styles/tokens.css`.
- Dev: Vite-Proxy `/api` → `http://localhost:8080`.
- Logo: `docs/company/assets/photos/basenbox_logo.jpg` nach `frontend/public/` kopieren, nur das Original verwenden.

## DevOps
- `devops/docker/frontend.Dockerfile` als Multi-Stage: `node:20-alpine` baut, `nginx:alpine` liefert `dist/` aus. Die nginx-Config (SPA-Fallback, `/api/`-Proxy) behalten, `client_max_body_size` für Uploads setzen.
- Backend-Dockerfile: Tests nicht ins Image, `.dockerignore` neu anlegen.
- Nach außen weiterhin nur Port 8080.
</architektur>

<ux_und_design>
Ziel: wirkt wie ein Produkt eines guten Design-Studios. Ruhig, hell, eindeutig. Niemand braucht eine Anleitung.

**Markenumsetzung (aus `design.md`, Verpackungs-Design):**
- 70 % Weiß, 20 % Anthrazit/Warmgrau, 10 % Zitrone. Lime und Koralle nur als kleine Badges/Status.
- Schrift: `Questrial` (Google Fonts) als Web-Ersatz für Century Gothic, Fallback `sans-serif`. Fließtext nie unter 14 px.
- Zweistufige Titel wie das Logo: Versalien, leichte Laufweite, erster Teil Warmgrau, Schlüsselwort fett Anthrazit (`TAGES`**ABLAUF**). Kicker darüber klein, fett, Versalien, Warmgrau.
- Kreise als Motiv: Stepper-Schritte als Kreise, Icons in Farbkreisen, Badge-Trio „bunt · bio · basisch" im Header, dezente große Deko-Kreise im Leerzustand. Keine Linien unter Titeln, keine Akzentstreifen.
- Zitrone nie als Textfarbe auf Weiß. Auf Zitrone und Lime Anthrazit, auf Koralle Weiß.
- Mahlzeit-Farbcode durchgängig: Früh = Lime/Grün, Mittag = Orange, Abend = ein ruhiges Blau, an den Excel-Farbcode der SOP angelehnt.
- Karten in Nebel `#F4F2EE`, große Radien (16–24 px), weiche Schatten nur bei Hover, Haarlinien `#E4E0DA` statt Gitter.
- Du-Form, kurz, warm: „Zieh die Gesamtliste hier rein", „3 Wünsche brauchen deinen Blick".

**Ablauf (ein Screen pro Schritt, oben Kreis-Stepper):**
1. **Hochladen:** große Dropzone, danach Karte mit erkanntem Datum, Wochentag, KW, Boxen (Datum editierbar), Warnungen.
2. **Prüfen:** Tabelle der Zeilen mit Wünschen als farbige Chips (Klick zeigt die Begründung: Regel + Originaltext). Filter „Alle / Mit Wunsch / Zu prüfen". Review-Queue oben als Karte: pro Fall Originaltext + Buttons „Übernehmen als …", „Ignorieren", „Eigener Wunsch". Notizen-Segmente per Klick zum Spezialwunsch machen (Phase 3.1). Tastatur-bedienbar.
3. **Speiseplan:** pro Zutatenregel eine Zeile mit Segment-Toggle Früh / Mittag / Abend / keine, vorbelegt aus dem letzten gleichen Wochentag. Live-Vorschau der Summen.
4. **Ergebnis:** Hero-Kacheln in Zitrone für Früh / Mittag / Abend (große Zahl, darunter „+1 / −1"-Herleitung), Kennzahlen für Ohne Nüsse, Ohne Z&K, Add-ons. Downloads als Karten (Excel/PDF-Icon, Dateiname), „Alles als ZIP", TSV-Copy für Sortiment neu, Brot-Hinweis falls fällig.
5. **Abschluss:** Mails (gerenderte Vorlagen mit Copy), Checklisten Avery, ActiveCampaign, QR-Code mit Copy-Feldern und abhakbaren Schritten. Am Ende eine freundliche Erfolgsansicht.

Zusätzlich: Seite „Einstellungen" (Regelkatalog mit Test-Feld „Text eingeben → zeigt Treffer", Mailvorlagen) und „Verlauf" (frühere Läufe öffnen).

**Qualität:** responsive ab 375 px, sichtbare Fokus-Zustände, Kontrast WCAG AA, `prefers-reduced-motion` respektieren, Lade- und Fehlerzustände für jeden API-Call, Leerzustände gestaltet. Keine Kundendaten in `localStorage`.
</ux_und_design>

<vorgehen>
Arbeite in dieser Reihenfolge und schließe jeden Schritt mit grünem Check ab, bevor du weitergehst:
1. **Verstehen:** Dateien aus `<kontext>` lesen, Excel-Struktur per Skript prüfen (nur Header/Typen ausgeben). Kurzen Plan als Aufgabenliste anlegen.
2. **Domain + Tests zuerst:** Modelle, Regelkatalog, Segmentierung, Datumslogik, Engine, Summen. Unit-Tests für jede Regelart und die Randfälle: `OM; 2xAbend`, `Ohne Frühstück & 2x Abend`, Datum passt / passt nicht, Duplikat in Notiz und Spezialwünsche, `3x Mittag`, Zutat ohne Mahlzeit, Unklar-Fall, fehlende Spezialwünsche-Spalte, Kopfzeile in Zeile 1 statt 2.
3. **I/O:** Reader, Writer (alle Dateien), PDF. Golden Test gegen die Beispieldatei grün.
4. **API** + API-Tests mit `TestClient`.
5. **Frontend:** Tokens und Basiskomponenten, dann Screens in Ablauf-Reihenfolge, dann Einstellungen und Verlauf.
6. **DevOps:** Dockerfiles, nginx, Compose. Stack starten: `docker compose -f devops/docker-compose.yml up --build -d`.
7. **End-to-End prüfen:** `curl localhost:8080/api/health`, Beispiel-Gesamtliste per `curl -F` hochladen, Run durchspielen, erzeugte Excel-Dateien mit openpyxl gegenprüfen (Summen wie im Golden Test). UI im Browser öffnen, jeden Schritt durchklicken, Screenshots bei 1440 px und 375 px ansehen und Design-Mängel beheben.
8. **Doku:** `docs/architecture.md` (Aufbau, Datenfluss, Regelengine, Annahmen), `docs/roadmap.md` (Erledigtes abhaken, offene Punkte: echte Mailtexte, Rezeptdatei, Speiseplan-Import, Auth), `CLAUDE.md` (Stand, Befehle für Tests und Frontend-Dev, Stolperfallen aktualisieren, Hinweis zum Frontend-Dockerfile anpassen), `devops/README.md`.
</vorgehen>

<regeln>
- Alles aus `CLAUDE.md` gilt: Antworten, Kommentare und UI-Texte auf Deutsch. Kein `git push`, kein Branch-Wechsel, `.env` nicht anfassen, keine Secrets.
- Excel-Dateien und Kundendaten nie in Git, Logs, Tests, Doku oder Commit-Messages. `data/` bleibt gitignored.
- Deterministisch: keine Zufallswerte, keine Zeitabhängigkeit außer dem explizit gesetzten Lieferdatum, stabile Sortierung (nach Bestellnummer numerisch).
- Code im Stil des Repos: kurz, lesbar, sparsame Kommentare nur wo das Warum nicht offensichtlich ist.
- Keine Features außerhalb dieses Prompts. Wenn etwas fehlt (Rezeptdatei, Word-Mailvorlagen, Speiseplan), die beschriebene Frontend-Lösung bauen, keine Dateien erfinden.
- Nicht committen, außer du wirst danach gefragt.
</regeln>

<definition_of_done>
- [ ] `docker compose -f devops/docker-compose.yml up --build` startet fehlerfrei, App unter http://localhost:8080
- [ ] `pytest` im Backend grün, Golden Test liefert 61 / 62 / 60 / 62 / 5x Nüsse / 8x Z&K / Kreatin 19 / 29 Zeilen
- [ ] Alle Ausgabedateien entstehen im richtigen Ordner mit den Namen aus der SOP und öffnen sich in Excel ohne Reparatur-Hinweis
- [ ] Kompletter Ablauf in der UI ohne Fehler in der Browser-Konsole, auch mobil (375 px)
- [ ] Jede Zahl in der UI lässt sich auf Zeilen und Regeln zurückführen
- [ ] Keine Kundendaten in Repo, Logs oder Tests
- [ ] Doku aktualisiert

Zum Schluss eine kurze Zusammenfassung auf Deutsch: was gebaut wurde, wie man es startet, welche Annahmen du getroffen hast, was bewusst manuell bleibt und was als Nächstes sinnvoll wäre.
</definition_of_done>
