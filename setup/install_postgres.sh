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

# Print Postgres version to verify installation
psql --version
CURRENT_USER=$(whoami)

# Create blank database
 createdb my-medusa-store-$CURRENT_USER

# 3. Get the current username (non-interactively)

psql -U $CURRENT_USER -d my-medusa-store-$CURRENT_USER -c '\q'

# 2. Install Medusa
npm install -g @medusajs/medusa-cli
npx create-medusa-app@latest my-medusa-store-$CURRENT_USER
cd my-medusa-store-$CURRENT_USER
medusa new my-medusa-store-$CURRENT_USER

# 3. Create admin user
npx medusa user -e admin@medusa-test.com -p supersecret


#pwd
#4 Run dev server
npm run dev
