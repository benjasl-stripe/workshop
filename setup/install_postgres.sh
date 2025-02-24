#!/bin/bash

# Update Homebrew
##brew update

# 1. Install Postgres
##brew install postgresql

# Start Postgres service
##brew services start postgresql

# Enable Postgres service to start on boot
#pg_ctl -D /usr/local/var/postgres start

# Run Postgres service
##brew services start postgresql@14

# Print Postgres version to verify installation
##psql --version

# Create blank database
## createdb my-medusa-store

# 3. Get the current username
#CURRENT_USER=$(whoami)
#psql -U $CURRENT_USER -d my-medusa-store

# 2. Install Medusa
#npm install -g @medusajs/medusa-cli
#npx create-medusa-app@latest my-medusa-store
#cd my-medusa-store
#medusa new my-medusa-store

# 3. Create admin user
#npx medusa user -e admin@medusa-test.com -p supersecret

git clone https://github.com/benjasl-stripe/workshop



#pwd
#4 Run dev server
npm run dev
