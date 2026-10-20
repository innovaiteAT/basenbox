---
name: new-endpoint
description: Legt einen neuen API-Endpunkt im Backend an und bindet ihn im Frontend ein. Nutzen bei "neuer Endpoint", "neue API-Route" oder /new-endpoint.
---

1. Route in `backend/index.js` unter `/api/<name>` ergänzen (Stil der bestehenden Routen übernehmen).
2. Im Frontend `fetch("/api/<name>")` verwenden; nginx leitet `/api/` bereits ans Backend weiter.
3. Stack mit dem Skill `stack-up` neu bauen und den Endpunkt per `curl` prüfen.
