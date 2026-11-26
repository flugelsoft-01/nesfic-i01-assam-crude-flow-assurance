#!/usr/bin/env bash
set -euo pipefail

PORT="${CHROME_DEBUG_PORT:-9222}"
PROFILE_DIR="${CHROME_PROFILE_DIR:-$HOME/.chrome-gemini-pro}"

if ! curl -s "http://127.0.0.1:${PORT}/json/version" >/dev/null 2>&1; then
  mkdir -p "${PROFILE_DIR}"
  echo "Launching Google Chrome with remote debugging on port ${PORT} (profile: ${PROFILE_DIR})..."
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
    --remote-debugging-port="${PORT}" \
    --user-data-dir="${PROFILE_DIR}" \
    --no-first-run \
    --no-default-browser-check \
    "https://gemini.google.com/app" >/dev/null 2>&1 &

  for i in $(seq 1 20); do
    if curl -s "http://127.0.0.1:${PORT}/json/version" >/dev/null 2>&1; then
      break
    fi
    sleep 1
  done
fi

if ! curl -s "http://127.0.0.1:${PORT}/json/version" >/dev/null 2>&1; then
  echo "ERROR: Chrome did not open remote debugging port ${PORT}."
  exit 1
fi

echo "Running Gemini Pro 16:9 infographic generator..."
node scripts/chrome_gemini_bot.js --port="${PORT}" --force

echo "Rebuilding Proposal & Proof of Work PDFs..."
backend/.venv/bin/python3 scripts/generate_pdfs.py

echo "Done! Updated PDFs in deliverables/."
