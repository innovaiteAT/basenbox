# Basenbox

Automatisiert den täglichen Liefer-Ablauf von Basenbox (Wiener Basenkur-Lieferdienst): aus dem Backoffice-Export (`TT.MM. Gesamt.xlsx`) und den Spezialwünschen entstehen Etikettenliste, Spezialwunsch-Liste mit Mengen (Früh/Mittag/Abend) usw. Fachlicher Ablauf: `docs/task.md` (SOP). Aufbau, Regelengine und Annahmen: `docs/architecture.md`. Aktueller Stand: lauffähige App (Upload → Prüfen → Speiseplan → Dateien → Checklisten).

## Befehle
- Start: `docker compose -f devops/docker-compose.yml up --build`
- Stop: `docker compose -f devops/docker-compose.yml down`
- Logs: `docker compose -f devops/docker-compose.yml logs -f`
- Test: http://localhost:8080 bzw. `curl localhost:8080/api/health`
- Backend-Tests: `cd backend && python -m venv .venv && .venv/Scripts/pip install -r requirements-dev.txt && .venv/Scripts/python -m pytest`
- Frontend-Dev: `cd frontend && npm install && npm run dev` (Vite proxied `/api` auf den laufenden Stack unter :8080)

## Stolperfallen
- Nach außen nur Port 8080 (Frontend). Das Backend hat keinen eigenen Port, erreichbar nur über nginx unter `/api/`.
- `frontend.Dockerfile` baut `frontend/` per `npm ci`: neue npm-Pakete mit fester Version eintragen und `package-lock.json` mitpflegen.
- Domain-Logik (`backend/app/domain/`) bleibt ohne I/O, das Frontend rechnet nichts Fachliches nach.
- Regex-Muster in Regeln: Umlaute nicht in Zeichenklassen (`n(ü|u)ss`, nicht `n[üu]ss`), weil Text und Muster gefaltet werden (ü→ue).
- Golden Test (`backend/tests/test_golden.py`) braucht die lokale Beispieldatei in `data/input/example/`, sonst wird er übersprungen.
- Neue Python-Pakete mit fester Version in `backend/requirements.txt` eintragen, danach mit `--build` neu starten.
- Excel-Dateien enthalten Kundendaten: nie in Git, Logs, Tests oder Doku übernehmen. Tests nur mit erfundenen Daten.

## Claude-Setup
- Hooks (`.claude/hooks/`): blockieren Edits an `.env`, blockieren gefährliche Befehle, validieren `docker-compose.yml` nach Änderungen in `devops/`
- Skills: `/new-endpoint` (Route + Frontend-Einbindung), `/stack-up` (Stack starten/stoppen/Logs)

## Regeln
- Keine Secrets committen, `.env`-Dateien nicht anfassen.
- Nichts Git pushes
- Kein Branch wechsel
- Antworten und Kommentare auf Deutsch.
