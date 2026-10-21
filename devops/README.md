# DevOps

Start: `docker compose -f devops/docker-compose.yml up --build`
Stop:  `docker compose -f devops/docker-compose.yml down`
Logs:  `docker compose -f devops/docker-compose.yml logs -f`
App:   http://localhost:8080 · Health: `curl localhost:8080/api/health`

- `docker/frontend.Dockerfile`: Multi-Stage. `node:20-alpine` baut `frontend/` mit `npm ci && npm run build`, `nginx:alpine` liefert `dist/` aus. Der Build-Kontext ist das Repo-Root (`.dockerignore` dort).
- `docker/backend.Dockerfile`: Python 3.12, Kontext `backend/`. Tests und venv bleiben über `backend/.dockerignore` draußen.
- `nginx/nginx.conf`: SPA-Fallback, `/api/` → `backend:3000`, Uploads bis 12 MB.
- `../data` wird als `/app/data` ins Backend gemountet (`DATA_DIR`).
