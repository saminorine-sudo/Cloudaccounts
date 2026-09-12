#!/usr/bin/env bash
#
# Runs the migrations and the security assertions against a throwaway local
# PostgreSQL database.
#
#   npm run db:test
#
# This does NOT touch your Supabase project. It builds a fresh database,
# applies a shim for the Supabase-provided pieces (auth schema, request roles,
# default privileges), runs the migrations in order, then asserts the access
# rules hold.
#
# Requires a local PostgreSQL server. On Debian/Ubuntu:
#   sudo apt-get install -y postgresql
#   sudo pg_ctlcluster 16 main start
#
# Set PGUSER/PGHOST/PGPORT if your server is not a local socket owned by the
# `postgres` system user.

set -euo pipefail

DB_NAME="${CA_TEST_DB:-cloudaccounts_test}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# Run psql as the postgres superuser unless the caller has configured their own
# connection details.
if [[ -n "${PGUSER:-}${PGHOST:-}" ]]; then
  run_psql() { psql "$@"; }
  run_admin() { psql "$@"; }
else
  run_psql() { su postgres -c "psql $(printf '%q ' "$@")"; }
  run_admin() { su postgres -c "$*"; }
fi

echo "Rebuilding ${DB_NAME}"
run_admin "dropdb --if-exists ${DB_NAME}"
run_admin "createdb ${DB_NAME}"

echo "Applying Supabase shim"
run_psql -v ON_ERROR_STOP=1 -q -d "$DB_NAME" -f "$ROOT/supabase/tests/00-shim.sql"

for migration in "$ROOT"/supabase/migrations/*.sql; do
  echo "Applying $(basename "$migration")"
  run_psql -v ON_ERROR_STOP=1 -q -d "$DB_NAME" -f "$migration"
done

echo
echo "Running security assertions"
run_psql -v ON_ERROR_STOP=1 -q -d "$DB_NAME" -f "$ROOT/supabase/tests/01-security.sql"

echo
echo "Cleaning up"
run_admin "dropdb --if-exists ${DB_NAME}"
