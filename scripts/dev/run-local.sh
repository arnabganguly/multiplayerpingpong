#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"
BACKEND_PORT="${BACKEND_PORT:-8080}"
SESSION_TOKEN_SIGNING_SECRET="${SESSION_TOKEN_SIGNING_SECRET:-local-dev-secret}"
INSTALL_DEPS=true

usage() {
  cat <<EOF
Usage: scripts/dev/run-local.sh [options]

Install dependencies and run the Ping Pong frontend and realtime backend locally.

Options:
  --skip-install   Do not run npm install before starting services
  -h, --help       Show this help message

Environment overrides:
  FRONTEND_PORT                  Frontend Vite port. Default: 5173
  BACKEND_PORT                   Backend API/WebSocket port. Default: 8080
  SESSION_TOKEN_SIGNING_SECRET   Local backend token signing secret. Default: local-dev-secret
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --skip-install)
      INSTALL_DEPS=false
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

wait_for_url() {
  local name="$1"
  local url="$2"
  local attempts="${3:-30}"

  for _ in $(seq 1 "$attempts"); do
    if curl --fail --silent --output /dev/null "$url"; then
      echo "$name is ready: $url"
      return 0
    fi
    sleep 1
  done

  echo "$name did not become ready at $url" >&2
  return 1
}

cleanup() {
  local exit_code=$?

  if [[ -n "${WEB_PID:-}" ]] && kill -0 "$WEB_PID" >/dev/null 2>&1; then
    kill "$WEB_PID" >/dev/null 2>&1 || true
  fi

  if [[ -n "${API_PID:-}" ]] && kill -0 "$API_PID" >/dev/null 2>&1; then
    kill "$API_PID" >/dev/null 2>&1 || true
  fi

  wait >/dev/null 2>&1 || true
  exit "$exit_code"
}

trap cleanup EXIT INT TERM

require_command npm
require_command curl

cd "$ROOT_DIR"

if [[ "$INSTALL_DEPS" == true ]]; then
  echo "Installing npm dependencies..."
  npm install
fi

echo "Starting realtime backend on http://localhost:${BACKEND_PORT}..."
APP_ENV=local \
ALLOWED_ORIGINS="http://localhost:${FRONTEND_PORT}" \
PORT="$BACKEND_PORT" \
SESSION_TOKEN_SIGNING_SECRET="$SESSION_TOKEN_SIGNING_SECRET" \
LOG_LEVEL="${LOG_LEVEL:-debug}" \
METRICS_ENABLED="${METRICS_ENABLED:-true}" \
npm run dev --workspace @pingpong/realtime &
API_PID=$!

wait_for_url "Realtime backend" "http://localhost:${BACKEND_PORT}/api/health/ready"

echo "Starting frontend on http://localhost:${FRONTEND_PORT}..."
BACKEND_PORT="$BACKEND_PORT" npm run dev --workspace @pingpong/web -- --port "$FRONTEND_PORT" &
WEB_PID=$!

wait_for_url "Frontend" "http://localhost:${FRONTEND_PORT}/"

cat <<EOF

Local Ping Pong is running.

Frontend:          http://localhost:${FRONTEND_PORT}
Backend HTTP:      http://localhost:${BACKEND_PORT}/api
Backend WebSocket: ws://localhost:${BACKEND_PORT}/ws

Try online multiplayer by opening two browser tabs:
1. Create a session in one tab.
2. Join with the invite code in the second tab.

Press Ctrl+C to stop both services.
EOF

wait
