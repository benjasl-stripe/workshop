#!/bin/bash

# Update Homebrew
brew update

# Install Postgres
brew install postgresql

# Start Postgres service
brew services start postgresql

# Enable Postgres service to start on boot
# Homebrew services are automatically enabled on boot

# Run Postgres service
#pg_ctl -D /usr/local/var/postgres start
brew services start postgresql@14

# Print Postgres version to verify installation
psql --version
