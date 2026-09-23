#!/bin/sh

set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$ROOT_DIR"

if docker compose version >/dev/null 2>&1; then
  compose() { docker compose "$@"; }
elif command -v docker-compose >/dev/null 2>&1; then
  compose() { docker-compose "$@"; }
else
  printf 'Docker Compose est introuvable.\n' >&2
  exit 1
fi

printf '\nInstallation des dépendances…\n'
(cd web && npm ci)
printf '\nDémarrage de PostgreSQL…\n'
compose -f docker-compose.dev.yml up -d

attempt=0
until compose -f docker-compose.dev.yml exec -T db pg_isready -U postgres >/dev/null 2>&1; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge 60 ]; then
    printf 'PostgreSQL n’est pas devenu disponible après 60 secondes.\n' >&2
    exit 1
  fi
  sleep 1
done

printf '\nDémarrage de Next.js…\n'
cd web
npm run dev
