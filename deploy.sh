#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# deploy.sh – Deploy or upgrade WMS Stocktake as a Docker instance
#
# Usage:
#   ./deploy.sh [OPTIONS]
#
# Options:
#   --seed        Seed the database with demo data after first-time setup
#   --no-cache    Force a clean Docker image rebuild (no layer cache)
#   --pull        Pull the latest base images before building
#   --help        Show this help message
#
# Environment:
#   All runtime variables are read from .env in the same directory as this
#   script.  A .env file is created automatically from .env.example on the
#   first run.
# ──────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ── Colour helpers ─────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

info()    { echo -e "${CYAN}[INFO]${RESET}  $*"; }
success() { echo -e "${GREEN}[OK]${RESET}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${RESET}  $*"; }
error()   { echo -e "${RED}[ERROR]${RESET} $*" >&2; }
die()     { error "$*"; exit 1; }

# ── Argument parsing ───────────────────────────────────────────────────────────
OPT_SEED=false
OPT_NO_CACHE=""
OPT_PULL=""

for arg in "$@"; do
  case "$arg" in
    --seed)     OPT_SEED=true ;;
    --no-cache) OPT_NO_CACHE="--no-cache" ;;
    --pull)     OPT_PULL="--pull" ;;
    --help)
      sed -n '/^# Usage/,/^[^#]/{ /^[^#]/d; s/^# \{0,1\}//; p }' "$0"
      exit 0
      ;;
    *) die "Unknown option: $arg  (run with --help for usage)" ;;
  esac
done

# ── Banner ─────────────────────────────────────────────────────────────────────
echo -e "\n${BOLD}${CYAN}╔═══════════════════════════════════════╗${RESET}"
echo -e "${BOLD}${CYAN}║   WMS Stocktake – Docker Deploy       ║${RESET}"
echo -e "${BOLD}${CYAN}╚═══════════════════════════════════════╝${RESET}\n"

# ── 1. Prerequisites ───────────────────────────────────────────────────────────
info "Checking prerequisites…"

require_cmd() {
  command -v "$1" &>/dev/null || die "'$1' is not installed. $2"
}

require_cmd docker  "Install Docker: https://docs.docker.com/engine/install/"

# Support both 'docker compose' (plugin) and 'docker-compose' (standalone)
if docker compose version &>/dev/null 2>&1; then
  COMPOSE="docker compose"
elif command -v docker-compose &>/dev/null; then
  COMPOSE="docker-compose"
else
  die "Docker Compose is not available. Install it: https://docs.docker.com/compose/install/"
fi

success "Docker $(docker --version | awk '{print $3}' | tr -d ',')"
success "Compose ($COMPOSE)"

# ── 2. Ensure .env exists ──────────────────────────────────────────────────────
if [[ ! -f .env ]]; then
  if [[ -f .env.example ]]; then
    info "No .env found – creating one from .env.example…"
    cp .env.example .env
  else
    info "No .env found – creating a minimal one…"
    cat > .env <<'ENVEOF'
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=
PORT=3000
DATAPEL_API_URL=
DATAPEL_API_KEY=
ENVEOF
  fi
  success ".env created"
fi

# ── 3. Generate NEXTAUTH_SECRET if missing ─────────────────────────────────────
source_env() {
  # Export variables defined in .env (skip comments and blank lines)
  set -o allexport
  # shellcheck disable=SC1091
  source <(grep -v '^\s*#' .env | grep -v '^\s*$')
  set +o allexport
}

source_env

if [[ -z "${NEXTAUTH_SECRET:-}" ]]; then
  info "NEXTAUTH_SECRET not set – generating a secure random value…"
  if command -v openssl &>/dev/null; then
    SECRET="$(openssl rand -base64 32)"
  else
    SECRET="$(head -c 32 /dev/urandom | base64 | tr -d '\n')"
  fi
  # Replace or append the value in .env
  if grep -q '^NEXTAUTH_SECRET=' .env; then
    TMP_ENV="$(mktemp)"
    sed "s|^NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=${SECRET}|" .env > "$TMP_ENV"
    mv "$TMP_ENV" .env
  else
    echo "NEXTAUTH_SECRET=${SECRET}" >> .env
  fi
  export NEXTAUTH_SECRET="$SECRET"
  success "NEXTAUTH_SECRET generated and saved to .env"
fi

# ── 4. Warn about default credentials ─────────────────────────────────────────
if [[ "${NEXTAUTH_URL:-http://localhost:3000}" == "http://localhost:3000" ]]; then
  warn "NEXTAUTH_URL is set to localhost. Update it in .env before exposing the app publicly."
fi

# ── 5. Detect fresh install vs upgrade ────────────────────────────────────────
FRESH_INSTALL=false
if ! $COMPOSE ps --services 2>/dev/null | grep -q .; then
  FRESH_INSTALL=true
fi

if $FRESH_INSTALL; then
  info "Fresh install detected."
else
  info "Existing deployment detected – performing upgrade."
fi

# ── 6. Build the image ────────────────────────────────────────────────────────
info "Building Docker image…"
# shellcheck disable=SC2086
$COMPOSE build $OPT_NO_CACHE $OPT_PULL
success "Image built successfully."

# ── 7. Stop existing containers (upgrade path) ────────────────────────────────
if ! $FRESH_INSTALL; then
  info "Stopping existing containers for upgrade…"
  $COMPOSE down --remove-orphans
  success "Containers stopped."
fi

# ── 8. Start containers ────────────────────────────────────────────────────────
info "Starting containers…"
$COMPOSE up -d
success "Containers started."

# ── 9. Wait for the app to become healthy ─────────────────────────────────────
info "Waiting for app to become ready (up to 60s)…"
PORT_NUM="${PORT:-3000}"
ATTEMPTS=0
until curl -sf "http://localhost:${PORT_NUM}/" -o /dev/null 2>/dev/null || \
      wget -qO- "http://localhost:${PORT_NUM}/" &>/dev/null; do
  ATTEMPTS=$((ATTEMPTS + 1))
  if [[ $ATTEMPTS -ge 30 ]]; then
    warn "App did not respond within 60 seconds. Check logs with: $COMPOSE logs -f"
    break
  fi
  sleep 2
done

if [[ $ATTEMPTS -lt 30 ]]; then
  success "App is responding on port ${PORT_NUM}."
fi

# ── 10. Seed database (first-run only, or when --seed is passed) ───────────────
if $OPT_SEED; then
  info "Seeding database with demo data…"
  $COMPOSE exec app sh -c "npx prisma db seed" && success "Database seeded." \
    || warn "Seeding failed – see output above. The app will still run without seed data."
fi

# ── 11. Summary ────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${GREEN}═══════════════════════════════════════${RESET}"
echo -e "${BOLD}${GREEN}  Deployment complete!${RESET}"
echo -e "${BOLD}${GREEN}═══════════════════════════════════════${RESET}"
echo ""
echo -e "  App URL : ${CYAN}${NEXTAUTH_URL:-http://localhost:${PORT_NUM}}${RESET}"
echo -e "  Logs    : ${CYAN}${COMPOSE} logs -f${RESET}"
echo -e "  Stop    : ${CYAN}${COMPOSE} down${RESET}"
echo ""
if $FRESH_INSTALL; then
  echo -e "  ${YELLOW}Default credentials (change these immediately!):${RESET}"
  echo -e "    Admin : admin@example.com  /  admin123"
  echo -e "    Staff : staff@example.com  /  staff123"
  echo ""
  echo -e "  ${YELLOW}To seed demo data run:${RESET}  ./deploy.sh --seed"
  echo ""
fi
