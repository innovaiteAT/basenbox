# Basenbox

Automatisiert den täglichen Liefer-Ablauf von Basenbox (Wiener Basenkur-Lieferdienst): aus dem Backoffice-Export (`TT.MM. Gesamt.xlsx`) und den Spezialwünschen entstehen Etikettenliste, Spezialwunsch-Liste mit Mengen (Früh/Mittag/Abend) usw. Fachlicher Ablauf: `docs/task.md` (SOP). Aktueller Stand: Grundgerüst, noch keine Excel-Logik.

## Aufbau
- `backend/`: Python 3.12 + FastAPI, alle Routen unter `/api/*` in `backend/main.py`
- `frontend/`: statisches `index.html`, ruft `/api/...` per `fetch` auf, wird von nginx ausgeliefert
- `devops/`: `docker-compose.yml`, Dockerfiles (`devops/docker/`), nginx-Config (`devops/nginx/nginx.conf`)
- `data/`: `input/` (Originaltabellen, Beispiel unter `input/example/KW24/`, Vorlagen unter `input/templates/`) und `output/` (Ergebnisse). Im Backend unter `/app/data` gemountet, Inhalt gitignored
- `docs/`: `architecture.md`, `roadmap.md` (bei Änderungen aktuell halten), `task.md` (SOP), `company/` (Firmenkontext, Design, Logo; nur bei Bedarf lesen)

## Befehle
- Start: `docker compose -f devops/docker-compose.yml up --build`
- Stop: `docker compose -f devops/docker-compose.yml down`
- Logs: `docker compose -f devops/docker-compose.yml logs -f`
- Test: http://localhost:8080 bzw. `curl localhost:8080/api/health`

## Stolperfallen
- Nach außen nur Port 8080 (Frontend). Das Backend hat keinen eigenen Port, erreichbar nur über nginx unter `/api/`.
- `frontend.Dockerfile` kopiert nur `frontend/index.html`. Neue Frontend-Dateien dort ergänzen.
- Neue Python-Pakete mit fester Version in `backend/requirements.txt` eintragen, danach mit `--build` neu starten.
- Excel-Dateien enthalten Kundendaten: nie in Git, Logs oder Doku übernehmen.

## Claude-Setup
- Hooks (`.claude/hooks/`): blockieren Edits an `.env`, blockieren gefährliche Befehle, validieren `docker-compose.yml` nach Änderungen in `devops/`
- Skills: `/new-endpoint` (Route + Frontend-Einbindung), `/stack-up` (Stack starten/stoppen/Logs)

## Regeln
- Keine Secrets committen, `.env`-Dateien nicht anfassen.
- Nichts Git pushes
- Kein Branch wechsel
- Antworten und Kommentare auf Deutsch.
