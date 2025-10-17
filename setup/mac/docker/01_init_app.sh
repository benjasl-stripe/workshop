#!/bin/sh
set -e

DB_NAME="stripe-ws-db"
DB_USER="myadmin"
DB_PASS="mypassword"

# Create or update the app role (no shell expansion inside SQL)
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  -v db_user="$DB_USER" -v db_pass="$DB_PASS" <<'SQL'
SELECT
  CASE
    WHEN NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = :'db_user')
      THEN format('CREATE ROLE %I LOGIN PASSWORD %L', :'db_user', :'db_pass')
    ELSE
      format('ALTER ROLE %I WITH LOGIN PASSWORD %L', :'db_user', :'db_pass')
  END
\gexec
SQL


# Create the app database if missing, owned by the role
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  -v db_name="$DB_NAME" -v db_user="$DB_USER" <<'SQL'
SELECT format('CREATE DATABASE %I OWNER %I', :'db_name', :'db_user')
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = :'db_name')\gexec
SQL


# Make owner explicit (safe if already owner)
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  -v db_name="$DB_NAME" -v db_user="$DB_USER" <<'SQL'
SELECT format('ALTER DATABASE %I OWNER TO %I', :'db_name', :'db_user')\gexec
SQL


# Import dump into the app DB if present
if [ -f /docker-entrypoint-initdb.d/import/mydb_clean_export.sql ]; then
  echo "Importing dump into $DB_NAME ..."
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$DB_NAME" \
    -f /docker-entrypoint-initdb.d/import/mydb_clean_export.sql
  echo "Import complete."
else
  echo "No dump at /docker-entrypoint-initdb.d/import/mydb_clean_export.sql"
fi
