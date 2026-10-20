#!/usr/bin/env bash
# Blockiert Schreibzugriffe auf .env-Dateien (Exit 2 = Aufruf wird abgelehnt).
input=$(cat)
if echo "$input" | grep -Eq '"file_path"[[:space:]]*:[[:space:]]*"[^"]*\.env[^"/\]*"'; then
  echo "Blockiert: .env-Dateien dürfen nicht bearbeitet werden." >&2
  exit 2
fi
exit 0
