---
name: stack-up
description: Startet, stoppt oder prüft den Docker-Stack (backend + frontend). Nutzen bei "starte den Stack", "docker up", "Logs zeigen" oder /stack-up.
---

Arbeite immer mit `docker compose -f devops/docker-compose.yml`.

1. Start: `up --build -d`, danach `ps` zeigen.
2. Prüfen: `curl http://localhost:8080/api/health` muss `{"status":"ok"}` liefern.
3. Bei Fehlern: `logs --tail 50 <service>` lesen und die Ursache nennen.
4. Stop auf Wunsch: `down`. Niemals `docker system prune` oder Volumes löschen.
