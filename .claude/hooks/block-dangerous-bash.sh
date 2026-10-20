#!/usr/bin/env bash
# Blockiert zerstörerische Befehle (Exit 2 = Aufruf wird abgelehnt).
input=$(cat)
if echo "$input" | grep -Eq 'rm -rf /|docker system prune|docker volume rm|git push (-f|--force)'; then
  echo "Blockiert: gefährlicher Befehl. Bitte manuell ausführen." >&2
  exit 2
fi
exit 0
