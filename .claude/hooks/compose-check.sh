#!/usr/bin/env bash
# Validiert nach Änderungen an devops/ die Compose-Datei (falls docker vorhanden).
input=$(cat)
echo "$input" | grep -q 'devops/' || exit 0
command -v docker >/dev/null 2>&1 || exit 0
if ! out=$(docker compose -f devops/docker-compose.yml config -q 2>&1); then
  echo "docker-compose.yml ist ungültig:" >&2
  echo "$out" >&2
  exit 2
fi
exit 0
