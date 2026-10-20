# Architektur

## Überblick

```
Browser --> frontend (nginx :8080) --/api/--> backend (Express :3000)
```

| Bereich    | Ordner      | Technik           |
|------------|-------------|-------------------|
| Backend    | `backend/`  | Node 20, Express  |
| Frontend   | `frontend/` | statisches HTML   |
| DevOps     | `devops/`   | Docker Compose, nginx |
| Daten      | `data/`     | Excel-Ein- und Ausgabe, als Volume ins Backend gemountet |

## Daten

- `data/input/`: Original-Tabellen (zunächst manuell abgelegt, später per Upload über das Frontend)
- `data/output/`: bearbeitete Excel-Dateien
- Im Backend-Container unter `/app/data` eingebunden, Inhalt ist nicht im Git (nur `.gitkeep`).
- Geplant: Upload per `POST /api/upload` (Frontend -> nginx -> Backend), Ablage in `data/input/`.