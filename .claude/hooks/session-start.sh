#!/bin/bash
set -euo pipefail

# Only run in Claude Code on the web
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# Install npm dependencies for linting
if [ -f "package.json" ]; then
  echo "Installing npm dependencies..."
  npm install
  echo "Dependencies installed successfully."
fi
