#!/bin/sh

set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$ROOT_DIR"

GREEN='\033[32m'
RED='\033[31m'
YELLOW='\033[33m'
BLUE='\033[34m'
RESET='\033[0m'
ROOT_ENV_TMP=".env.tmp.$$"
WEB_ENV_TMP="web/.env.tmp.$$"
STTY_CHANGED=0

cleanup() {
  if [ "$STTY_CHANGED" -eq 1 ]; then
    stty echo 2>/dev/null || true
  fi
  rm -f "$ROOT_ENV_TMP" "$WEB_ENV_TMP"
}
trap cleanup EXIT HUP INT TERM

fail() {
  printf '%bErreur : %s%b\n' "$RED" "$1" "$RESET" >&2
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "commande requise introuvable : $1"
}

prompt_default() {
  label=$1
  default_value=$2
  printf '%s [%s] : ' "$label" "$default_value" >&2
  IFS= read -r value
  printf '%s' "${value:-$default_value}"
}

prompt_required() {
  label=$1
  while :; do
    printf '%s : ' "$label" >&2
    IFS= read -r value
    [ -n "$value" ] && {
      printf '%s' "$value"
      return
    }
    printf '%bCette valeur est obligatoire.%b\n' "$RED" "$RESET" >&2
  done
}

prompt_optional() {
  printf '%s [optionnel] : ' "$1" >&2
  IFS= read -r value
  printf '%s' "$value"
}

prompt_secret() {
  label=$1
  while :; do
    printf '%s (12 caractères minimum) : ' "$label" >&2
    if [ -t 0 ]; then
      stty -echo
      STTY_CHANGED=1
    fi
    IFS= read -r value
    if [ "$STTY_CHANGED" -eq 1 ]; then
      stty echo
      STTY_CHANGED=0
      printf '\n' >&2
    fi
    [ "${#value}" -ge 12 ] && {
      printf '%s' "$value"
      return
    }
    printf '%bLe mot de passe doit contenir au moins 12 caractères.%b\n' "$RED" "$RESET" >&2
  done
}

validate_url() {
  node -e '
    const url = new URL(process.argv[1]);
    if (!["http:", "https:"].includes(url.protocol) || !url.hostname) {
      process.exit(1);
    }
  ' "$1" >/dev/null 2>&1 || fail "$2 doit être une URL HTTP(S) valide"
  case "$1" in
    */) fail "$2 ne doit pas se terminer par un slash" ;;
  esac
}

validate_email() {
  case "$1" in
    *@*.*) ;;
    *) fail "$2 doit être une adresse email valide" ;;
  esac
}

port_is_available() {
  node -e '
    const net = require("node:net");
    const server = net.createServer();
    server.unref();
    server.once("error", () => process.exit(1));
    server.listen(Number(process.argv[1]), "127.0.0.1", () => {
      server.close(() => process.exit(0));
    });
  ' "$1" >/dev/null 2>&1
}

find_available_port() {
  candidate=5432
  while [ "$candidate" -le 5499 ]; do
    if port_is_available "$candidate"; then
      printf '%s' "$candidate"
      return
    fi
    candidate=$((candidate + 1))
  done
  fail 'aucun port PostgreSQL libre trouvé entre 5432 et 5499'
}

validate_port() {
  node -e '
    const port = Number(process.argv[1]);
    process.exit(Number.isInteger(port) && port >= 1024 && port <= 65535 ? 0 : 1);
  ' "$1" >/dev/null 2>&1 || fail "$2 doit être un entier compris entre 1024 et 65535"
}

write_env_line() {
  key=$1
  raw_value=$2
  escaped_value=$(printf '%s' "$raw_value" | sed 's/\\/\\\\/g; s/"/\\"/g')
  printf '%s="%s"\n' "$key" "$escaped_value"
}

compose() {
  if [ "$COMPOSE_STYLE" = plugin ]; then
    docker compose "$@"
  else
    docker-compose "$@"
  fi
}

printf '\n%bInitialisation d’un nouveau site%b\n\n' "$YELLOW" "$RESET"
printf '%bVérification des prérequis…%b\n' "$BLUE" "$RESET"

for command_name in node npm openssl docker sed; do
  require_command "$command_name"
done

NODE_MAJOR=$(node -p "Number(process.versions.node.split('.')[0])")
[ "$NODE_MAJOR" -ge 20 ] || fail "Node.js 20 ou supérieur est requis (version détectée : $(node --version))"
docker info >/dev/null 2>&1 || fail "Docker n’est pas lancé ou n’est pas accessible"

if docker compose version >/dev/null 2>&1; then
  COMPOSE_STYLE=plugin
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE_STYLE=standalone
else
  fail "Docker Compose est introuvable"
fi

printf '\nCette commande va :\n'
printf '  - sauvegarder puis remplacer les fichiers d’environnement locaux ;\n'
printf '  - supprimer et recréer le volume PostgreSQL de CE projet ;\n'
printf '  - appliquer les migrations et charger des données génériques ;\n'
printf '  - créer le premier compte administrateur.\n\n'
printf 'Continuer ? (y/N) '
IFS= read -r answer
case "$answer" in
  y|Y|yes|YES|oui|OUI) ;;
  *) printf '%bInitialisation annulée.%b\n' "$YELLOW" "$RESET"; exit 0 ;;
esac

SITE_NAME=$(prompt_required 'Slug technique (minuscules, chiffres, tirets ou underscores)')
case "$SITE_NAME" in
  [a-z0-9]* ) ;;
  *) fail "le slug doit commencer par une lettre minuscule ou un chiffre" ;;
esac
case "$SITE_NAME" in
  *[!a-z0-9_-]* ) fail "le slug contient un caractère invalide" ;;
esac

SITE_FULL_NAME=$(prompt_required 'Nom public du site')
SITE_SHORT_NAME=$(prompt_default 'Nom court' "$SITE_FULL_NAME")
SITE_CREATOR=$(prompt_default 'Créateur du site' 'Christophe Donnat')
SITE_CREATOR_MAIL=$(prompt_default 'Email du créateur' 'christophe@donnat.dev')
validate_email "$SITE_CREATOR_MAIL" 'L’email du créateur'
SITE_ADDRESS=$(prompt_optional 'Adresse publique')
SITE_PHONE=$(prompt_optional 'Téléphone public')
SITE_CONTACT_EMAIL=$(prompt_default 'Email public' "$SITE_CREATOR_MAIL")
validate_email "$SITE_CONTACT_EMAIL" 'L’email public'

SITE_URL=$(prompt_default 'URL locale sans slash final' 'http://localhost:3000')
validate_url "$SITE_URL" 'L’URL locale'

POSTGRES_PORT_DEFAULT=$(find_available_port)
POSTGRES_PORT=$(prompt_default 'Port PostgreSQL local' "$POSTGRES_PORT_DEFAULT")
validate_port "$POSTGRES_PORT" 'Le port PostgreSQL'
port_is_available "$POSTGRES_PORT" || fail "le port $POSTGRES_PORT est déjà utilisé ; choisissez par exemple $POSTGRES_PORT_DEFAULT"

RESEND_API_KEY=$(prompt_default 'RESEND_API_KEY' 'local-placeholder')
RESEND_FROM_EMAIL=$(prompt_default 'RESEND_FROM_EMAIL' "$SITE_FULL_NAME <no-reply@example.test>")
GOOGLE_CLIENT_ID=$(prompt_default 'GOOGLE_CLIENT_ID' 'local-placeholder')
GOOGLE_CLIENT_SECRET=$(prompt_default 'GOOGLE_CLIENT_SECRET' 'local-placeholder')
GOOGLE_MAPS_API_KEY=$(prompt_optional 'GOOGLE_MAPS_API_KEY')
GOOGLE_PLACE_ID=$(prompt_optional 'GOOGLE_PLACE_ID')
UMAMI_SCRIPT_URL=$(prompt_optional 'NEXT_PUBLIC_UMAMI_SCRIPT_URL')
UMAMI_WEBSITE_ID=$(prompt_optional 'NEXT_PUBLIC_UMAMI_WEBSITE_ID')

ADMIN_NAME=$(prompt_default 'Nom du premier administrateur' "$SITE_CREATOR")
ADMIN_EMAIL=$(prompt_default 'Email du premier administrateur' "$SITE_CREATOR_MAIL")
validate_email "$ADMIN_EMAIL" 'L’email administrateur'
ADMIN_PASSWORD=$(prompt_secret 'Mot de passe du premier administrateur')

DATABASE_SLUG=$(printf '%s' "$SITE_NAME" | tr '-' '_')
DATABASE_NAME="${DATABASE_SLUG}_db"
DATABASE_PASSWORD=$(openssl rand -hex 24)
BETTER_AUTH_SECRET=$(openssl rand -hex 48)
CRON_SECRET=$(openssl rand -hex 32)
DATABASE_URL="postgresql://postgres:${DATABASE_PASSWORD}@localhost:${POSTGRES_PORT}/${DATABASE_NAME}"

{
  write_env_line SITE_NAME "$SITE_NAME"
  write_env_line SITE_FULL_NAME "$SITE_FULL_NAME"
  write_env_line SITE_SHORT_NAME "$SITE_SHORT_NAME"
  write_env_line SITE_CREATOR "$SITE_CREATOR"
  write_env_line SITE_CREATOR_MAIL "$SITE_CREATOR_MAIL"
  write_env_line SITE_ADDRESS "$SITE_ADDRESS"
  write_env_line SITE_PHONE "$SITE_PHONE"
  write_env_line SITE_CONTACT_EMAIL "$SITE_CONTACT_EMAIL"
  write_env_line DATABASE_NAME "$DATABASE_NAME"
  write_env_line DATABASE_USER postgres
  write_env_line DATABASE_PASSWORD "$DATABASE_PASSWORD"
  write_env_line POSTGRES_PORT "$POSTGRES_PORT"
  write_env_line DATABASE_URL "$DATABASE_URL"
  write_env_line DATABASE_LOCAL_URL "$DATABASE_URL"
  write_env_line BETTER_AUTH_URL "$SITE_URL"
  write_env_line BETTER_AUTH_SECRET "$BETTER_AUTH_SECRET"
  write_env_line GOOGLE_CLIENT_ID "$GOOGLE_CLIENT_ID"
  write_env_line GOOGLE_CLIENT_SECRET "$GOOGLE_CLIENT_SECRET"
  write_env_line GOOGLE_MAPS_API_KEY "$GOOGLE_MAPS_API_KEY"
  write_env_line GOOGLE_PLACE_ID "$GOOGLE_PLACE_ID"
  write_env_line RESEND_API_KEY "$RESEND_API_KEY"
  write_env_line RESEND_FROM_EMAIL "$RESEND_FROM_EMAIL"
  write_env_line NEXT_PUBLIC_SITE_URL "$SITE_URL"
  write_env_line CRON_SECRET "$CRON_SECRET"
  write_env_line NEXT_PUBLIC_UMAMI_SCRIPT_URL "$UMAMI_SCRIPT_URL"
  write_env_line NEXT_PUBLIC_UMAMI_WEBSITE_ID "$UMAMI_WEBSITE_ID"
} > "$ROOT_ENV_TMP"
cp "$ROOT_ENV_TMP" "$WEB_ENV_TMP"

printf '\n%bInstallation reproductible des dépendances…%b\n' "$YELLOW" "$RESET"
(cd web && npm ci)

BACKUP_SUFFIX=$(date '+%Y%m%d-%H%M%S')
for env_file in .env web/.env web/.env.local; do
  if [ -f "$env_file" ]; then
    mv "$env_file" "${env_file}.backup-${BACKUP_SUFFIX}"
    printf 'Sauvegarde créée : %s\n' "${env_file}.backup-${BACKUP_SUFFIX}"
  fi
done
mv "$ROOT_ENV_TMP" .env
mv "$WEB_ENV_TMP" web/.env

printf '\n%bRecréation de PostgreSQL…%b\n' "$YELLOW" "$RESET"
compose -f docker-compose.dev.yml down -v --remove-orphans
compose -f docker-compose.dev.yml up -d

printf '%bAttente de PostgreSQL (60 secondes maximum)…%b\n' "$YELLOW" "$RESET"
attempt=0
until compose -f docker-compose.dev.yml exec -T db pg_isready -U postgres -d "$DATABASE_NAME" >/dev/null 2>&1; do
  attempt=$((attempt + 1))
  [ "$attempt" -lt 60 ] || fail "PostgreSQL n’est pas devenu disponible. Consultez : docker compose -f docker-compose.dev.yml logs db"
  sleep 1
done

printf '\n%bGénération Prisma, migrations et données initiales…%b\n' "$YELLOW" "$RESET"
(cd web && npm run prisma:generate)
(cd web && npm run prisma:migrate)
(cd web && npm run prisma:seed)

printf '\n%bCréation du premier administrateur…%b\n' "$YELLOW" "$RESET"
(cd web && ADMIN_NAME="$ADMIN_NAME" ADMIN_EMAIL="$ADMIN_EMAIL" ADMIN_PASSWORD="$ADMIN_PASSWORD" SEEDING_ADMIN=true npm run prisma:seed-user)

printf '\n%bContrôles TypeScript et ESLint…%b\n' "$YELLOW" "$RESET"
(cd web && npm run typecheck)
(cd web && npm run lint)

printf '\n%bInitialisation terminée.%b\n' "$GREEN" "$RESET"
printf 'Lancez le site avec : make dev-run-local\n'
printf 'Pour la production, partez de .env.production.example et consultez le README.\n'
