#!/bin/sh
set -e

DB_NAME="${APP_DB_NAME:-stripe-ws-db}"
DB_USER="${APP_DB_USER:-myadmin}"
DB_PASS="${APP_DB_PASS:-mypassword}"

# Create or update the app role (least privilege by default)
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<SQL
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '$DB_USER') THEN
    CREATE ROLE "$DB_USER" LOGIN PASSWORD '$DB_PASS';
  ELSE
    ALTER ROLE "$DB_USER" WITH LOGIN PASSWORD '$DB_PASS';
  END IF;
END
$$;
SQL

# Create the app database if missing, owned by the role
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<SQL
SELECT 'CREATE DATABASE "' || replace($$${DB_NAME}$$, '"', '""') || '" OWNER "' || replace($$${DB_USER}$$, '"', '""') || '"'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = $$${DB_NAME}$$)\gexec
SQL

# Optional: make owner explicit (harmless if already owner)
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  -c "ALTER DATABASE \"$DB_NAME\" OWNER TO \"$DB_USER\";"

# Import dump into the app DB if present
if [ -f /docker-entrypoint-initdb.d/import/mydb_clean_export.sql ]; then
  echo "Importing dump into $DB_NAME ..."
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$DB_NAME" \
    -f /docker-entrypoint-initdb.d/import/mydb_clean_export.sql
  echo "Import complete."
else
  echo "No dump at /docker-entrypoint-initdb.d/import/mydb_clean_export.sql"
fi
