#!/usr/bin/env bash
set -euo pipefail

PORT="${CHROME_DEBUG_PORT:-9222}"

if ! curl -s "http://127.0.0.1:${PORT}/json/version" >/dev/null 2>&1; then
  echo "Launching Google Chrome with remote debugging on port ${PORT}..."
  open -a "Google Chrome" --args --remote-debugging-port="${PORT}"
  for i in $(seq 1 20); do
    if curl -s "http://127.0.0.1:${PORT}/json/version" >/dev/null 2>&1; then
      break
    fi
    sleep 1
  done
fi

if ! curl -s "http://127.0.0.1:${PORT}/json/version" >/dev/null 2>&1; then
  echo "ERROR: Chrome did not open remote debugging port ${PORT}."
  echo "If Google Chrome was already open without --remote-debugging-port=${PORT}, quit Chrome (Cmd+Q) and re-run: npm run automate:images"
  exit 1
fi

echo "Running Gemini Pro 16:9 infographic generator..."
node scripts/chrome_gemini_bot.js --port="${PORT}" --force

echo "Rebuilding Proposal & Proof of Work PDFs..."
backend/.venv/bin/python3 scripts/generate_pdfs.py

echo "Done! Updated PDFs in deliverables/."
