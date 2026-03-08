#!/usr/bin/env bash
# Runs the full test suite inside a completely offline Docker container.
# The container has no external network access (--network none).
# npm start (vite) runs inside the container on localhost:3000.
# Playwright's webServer config starts it automatically.
#
# Usage: npm run test:offline

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "▶ Building offline test image..."
docker build -t open-bus-offline-test -f "$ROOT_DIR/scripts/Dockerfile.offline-test" "$ROOT_DIR"

echo "▶ Running tests (network disabled)..."
docker run --rm \
  --network none \
  -e CI=true \
  open-bus-offline-test
