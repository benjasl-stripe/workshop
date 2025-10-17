@echo off
REM Batch script to install PostgreSQL and set up Medusa backend on Windows
REM Run this script as Administrator for best results

echo Starting PostgreSQL installation and setup...

REM Check if running as Administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo WARNING: This script should be run as Administrator for optimal results.
    pause
)

REM Check if Chocolatey is installed
where choco >nul 2>&1
if %errorLevel% neq 0 (
    echo Installing Chocolatey package manager...
    powershell -Command "Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))"
    
    REM Refresh environment variables
    call refreshenv
)

REM Update Chocolatey
echo Updating Chocolatey...
choco upgrade chocolatey -y

REM Install PostgreSQL
echo Installing PostgreSQL...
choco install postgresql --params "/Password:postgres" -y

REM Refresh environment variables
call refreshenv

REM Wait for installation to complete
timeout /t 10 /nobreak >nul

REM Start PostgreSQL service
echo Starting PostgreSQL service...
sc start postgresql-x64-14 2>nul || sc start postgresql-x64-13 2>nul || sc start postgresql-x64-12 2>nul || net start postgresql*

REM Set service to start automatically
sc config postgresql-x64-14 start= auto 2>nul || sc config postgresql-x64-13 start= auto 2>nul || sc config postgresql-x64-12 start= auto 2>nul

REM Set PGPASSWORD for automated operations
set PGPASSWORD=postgres

REM Wait for PostgreSQL to be ready
echo Waiting for PostgreSQL to be ready...
:wait_for_pg
timeout /t 2 /nobreak >nul
psql -U postgres -c "SELECT 1;" >nul 2>&1
if %errorLevel% neq 0 goto wait_for_pg

REM Create myadmin PostgreSQL role
echo Creating myadmin superuser role...
psql -U postgres -c "CREATE USER myadmin WITH SUPERUSER PASSWORD 'myadmin';" 2>nul
if %errorLevel% equ 0 (
    echo Created myadmin superuser role
) else (
    echo Role 'myadmin' may already exist
)

REM Print PostgreSQL version
echo PostgreSQL version:
psql --version

REM Create blank database
echo Creating stripe-ws-db database...
createdb -U postgres stripe-ws-db 2>nul
if %errorLevel% equ 0 (
    echo Created stripe-ws-db database
) else (
    echo Database 'stripe-ws-db' may already exist
)

REM Import DB data if file exists
if exist ".\workshop\setup\mydb_clean_export.sql" (
    echo Importing database data...
    psql -U postgres -d stripe-ws-db -f ".\workshop\setup\mydb_clean_export.sql"
    echo Database import completed
) else (
    echo SQL file not found - skipping database import
)

REM Test database connection
echo Testing database connection...
psql -U postgres -d stripe-ws-db -c "\q" >nul 2>&1
if %errorLevel% equ 0 (
    echo Database connection successful
) else (
    echo WARNING: Database connection failed
)

REM Check if Node.js is available
where npm >nul 2>&1
if %errorLevel% neq 0 (
    echo Installing Node.js...
    choco install nodejs -y
    call refreshenv
)

REM Navigate to medusa-backend directory
if exist ".\workshop\medusa-backend" (
    cd ".\workshop\medusa-backend"
    
    REM Create admin user
    echo Creating Medusa admin user...
    npx medusa user -e admin@medusajs.com -p supersecret
    
    REM Rename .env.template to .env
    if exist ".env.template" (
        if exist ".env" (
            echo Backing up existing .env file...
            move ".env" ".env.backup" >nul
        )
        move ".env.template" ".env" >nul
        echo Renamed .env.template to .env
    ) else (
        echo WARNING: No .env.template found
    )
    
    REM Install npm dependencies
    echo Installing npm dependencies...
    npm install
    
    REM Ask user if they want to start the dev server
    set /p startServer="Do you want to start the development server now? (y/n): "
    if /i "%startServer%"=="y" (
        echo Starting development server...
        npm run dev
    ) else (
        echo Setup complete! You can start the server later with 'npm run dev'
    )
) else (
    echo WARNING: Medusa backend directory not found
)

echo.
echo PostgreSQL installation and setup completed!
echo PostgreSQL is running as a Windows service and will start automatically on boot.
echo.
echo Default credentials:
echo   - Superuser: postgres (password: postgres)
echo   - Custom user: myadmin (password: myadmin)
echo   - Database: stripe-ws-db
echo.

REM Clean up environment variable
set PGPASSWORD=

pause
