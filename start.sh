#!/usr/bin/env bash
#
# Starter Gulddal Piercings lokalt:
#   - Hjemmesiden (Next.js)  ->  http://localhost:3000
#   - Sanity Studio (CMS)    ->  http://localhost:3333
#
# Brug:  ./start.sh          (starter begge dele)
#        ./start.sh web      (kun hjemmesiden)
#        ./start.sh studio   (kun Studio'en)
#
set -euo pipefail

# Gå til scriptets mappe, så det virker uanset hvorfra det køres.
cd "$(dirname "$0")"

WHAT="${1:-all}"

info()  { printf "\033[1;35m➜ %s\033[0m\n" "$1"; }
warn()  { printf "\033[1;33m⚠ %s\033[0m\n" "$1"; }

# Sørg for at afhængigheder og env-fil er på plads for en given mappe.
prepare() {
  local dir="$1" envfile="$2"
  if [ ! -d "$dir/node_modules" ]; then
    info "Installerer afhængigheder i $dir …"
    (cd "$dir" && npm install)
  fi
  if [ ! -f "$dir/$envfile" ] && [ -f "$dir/.env.example" ]; then
    cp "$dir/.env.example" "$dir/$envfile"
    warn "Oprettede $dir/$envfile fra skabelonen — husk at udfylde værdierne!"
  fi
}

# Dræb baggrundsprocesser når scriptet stopper (Ctrl+C).
PIDS=()
cleanup() {
  info "Stopper …"
  for pid in "${PIDS[@]:-}"; do
    kill "$pid" 2>/dev/null || true
  done
}
trap cleanup EXIT INT TERM

start_web() {
  prepare "web" ".env.local"
  info "Starter hjemmesiden på http://localhost:3000"
  (cd web && npm run dev) &
  PIDS+=($!)
}

start_studio() {
  prepare "studio" ".env"
  info "Starter Sanity Studio på http://localhost:3333"
  (cd studio && npm run dev) &
  PIDS+=($!)
}

case "$WHAT" in
  web)    start_web ;;
  studio) start_studio ;;
  all)    start_studio; start_web ;;
  *)      echo "Ukendt valg: $WHAT (brug: web | studio | all)"; exit 1 ;;
esac

info "Kører. Tryk Ctrl+C for at stoppe."
wait
