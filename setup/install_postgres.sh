#!/bin/bash

# Update Homebrew
brew update

# 1. Install Postgres
brew install postgresql

# Start Postgres service
brew services start postgresql

# Enable Postgres service to start on boot
pg_ctl -D /usr/local/var/postgres start

# Run Postgres service
brew services start postgresql@14

# Create myadmin Postgres role
createuser myadmin --superuser || echo "Role 'myadmin' already exists"

# Print Postgres version to verify installation
psql --version
CURRENT_USER=$(whoami)

# Create blank database
createdb stripe-ws-db

# Import DB data
psql -U $CURRENT_USER -d stripe-ws-db -f ./workshop/setup/mydb_dump.sql -c '\q'

# 3. Get the current username (non-interactively)
psql -U $CURRENT_USER -d stripe-ws-db -c '\q'

# 3. Create admin user
npx medusa user -e admin@zipscoot.com -p supersecret

# 4. rename .env.template to .env
[ -f ./workshop/medusa-backend/.env.template ] && mv ./workshop/medusa-backend/.env.template ./workshop/medusa-backend/.env && echo "Renamed .env.template to .env" || echo "No .env.template found in ./workshop/medusa-backend/"

#5 Run dev server
cd ./workshop/medusa-backend/
npm install
npm run dev
