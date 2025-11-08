#!/bin/bash
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL が設定されていません" >&2
  exit 1
fi

psql "$DATABASE_URL" -f "$(dirname "$0")/../backend/db/schema.sql"
