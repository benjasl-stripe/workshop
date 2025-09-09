# PowerShell script to install PostgreSQL and set up Medusa backend on Windows
# Run this script as Administrator for best results

# Check if running as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Warning "This script should be run as Administrator for optimal results."
    Read-Host "Press Enter to continue anyway or Ctrl+C to exit"
}

Write-Host "Starting PostgreSQL installation and setup..." -ForegroundColor Green

# Check if Chocolatey is installed, if not, install it
if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Chocolatey package manager..." -ForegroundColor Yellow
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    
    # Refresh environment variables
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
}

# Update Chocolatey
Write-Host "Updating Chocolatey..." -ForegroundColor Yellow
choco upgrade chocolatey -y

# 1. Install PostgreSQL
Write-Host "Installing PostgreSQL..." -ForegroundColor Yellow
choco install postgresql --params '/Password:postgres' -y

# Refresh environment variables to pick up PostgreSQL binaries
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Wait a moment for installation to complete
Start-Sleep -Seconds 10

# Start PostgreSQL service
Write-Host "Starting PostgreSQL service..." -ForegroundColor Yellow
Start-Service -Name postgresql*
Set-Service -Name postgresql* -StartupType Automatic

# Add PostgreSQL bin directory to PATH if not already there
$pgPath = "C:\Program Files\PostgreSQL\*\bin"
$existingPgPath = Get-ChildItem "C:\Program Files\PostgreSQL\" -Directory | Sort-Object Name -Descending | Select-Object -First 1
if ($existingPgPath) {
    $pgBinPath = Join-Path $existingPgPath.FullName "bin"
    if ($env:Path -notlike "*$pgBinPath*") {
        $env:Path += ";$pgBinPath"
        [Environment]::SetEnvironmentVariable("Path", $env:Path, [EnvironmentVariableTarget]::User)
        Write-Host "Added PostgreSQL bin directory to PATH: $pgBinPath" -ForegroundColor Green
    }
}

# Wait for PostgreSQL to be ready
Write-Host "Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
$retryCount = 0
$maxRetries = 30
do {
    Start-Sleep -Seconds 2
    $retryCount++
    try {
        & psql -U postgres -c "SELECT 1;" 2>$null
        $pgReady = $LASTEXITCODE -eq 0
    } catch {
        $pgReady = $false
    }
    if ($retryCount -gt $maxRetries) {
        Write-Error "PostgreSQL failed to start after $maxRetries attempts"
        exit 1
    }
} while (-not $pgReady)

# Set PGPASSWORD environment variable for automated operations
$env:PGPASSWORD = "postgres"

# Create myadmin PostgreSQL role
Write-Host "Creating myadmin superuser role..." -ForegroundColor Yellow
try {
    & psql -U postgres -c "CREATE USER myadmin WITH SUPERUSER PASSWORD 'myadmin';" 2>$null
    Write-Host "Created myadmin superuser role" -ForegroundColor Green
} catch {
    Write-Host "Role 'myadmin' may already exist or there was an error" -ForegroundColor Yellow
}

# Print PostgreSQL version to verify installation
Write-Host "PostgreSQL version:" -ForegroundColor Green
& psql --version

# Get current username
$CURRENT_USER = $env:USERNAME

# Create blank database
Write-Host "Creating stripe-ws-db database..." -ForegroundColor Yellow
try {
    & createdb -U postgres stripe-ws-db
    Write-Host "Created stripe-ws-db database" -ForegroundColor Green
} catch {
    Write-Host "Database 'stripe-ws-db' may already exist" -ForegroundColor Yellow
}

# Import DB data (adjust path as needed)
$sqlFile = ".\workshop\setup\mydb_clean_export.sql"
if (Test-Path $sqlFile) {
    Write-Host "Importing database data from $sqlFile..." -ForegroundColor Yellow
    & psql -U postgres -d stripe-ws-db -f $sqlFile
    Write-Host "Database import completed" -ForegroundColor Green
} else {
    Write-Warning "SQL file not found at $sqlFile - skipping database import"
}

# Test database connection
Write-Host "Testing database connection..." -ForegroundColor Yellow
& psql -U postgres -d stripe-ws-db -c "\q"
if ($LASTEXITCODE -eq 0) {
    Write-Host "Database connection successful" -ForegroundColor Green
} else {
    Write-Warning "Database connection failed"
}

# Check if Node.js/npm is available
if (!(Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Node.js..." -ForegroundColor Yellow
    choco install nodejs -y
    # Refresh environment variables
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
}

# Navigate to medusa-backend directory
$backendPath = ".\workshop\medusa-backend"
if (Test-Path $backendPath) {
    Set-Location $backendPath
    
    # Create admin user (this requires the medusa CLI to be available)
    Write-Host "Creating Medusa admin user..." -ForegroundColor Yellow
    try {
        & npx medusa user -e admin@medusajs.com -p supersecret
        Write-Host "Created Medusa admin user" -ForegroundColor Green
    } catch {
        Write-Warning "Failed to create Medusa admin user - you may need to do this manually"
    }
    
    # Rename .env.template to .env
    $envTemplate = ".env.template"
    $envFile = ".env"
    if (Test-Path $envTemplate) {
        if (Test-Path $envFile) {
            Write-Host "Backing up existing .env file..." -ForegroundColor Yellow
            Move-Item $envFile "$envFile.backup"
        }
        Move-Item $envTemplate $envFile
        Write-Host "Renamed .env.template to .env" -ForegroundColor Green
    } else {
        Write-Warning "No .env.template found in $backendPath"
    }
    
    # Install npm dependencies
    Write-Host "Installing npm dependencies..." -ForegroundColor Yellow
    & npm install
    
    # Ask user if they want to start the dev server
    $startServer = Read-Host "Do you want to start the development server now? (y/n)"
    if ($startServer -eq "y" -or $startServer -eq "Y") {
        Write-Host "Starting development server..." -ForegroundColor Green
        & npm run dev
    } else {
        Write-Host "Setup complete! You can start the server later with 'npm run dev'" -ForegroundColor Green
    }
} else {
    Write-Warning "Medusa backend directory not found at $backendPath"
}

Write-Host "PostgreSQL installation and setup completed!" -ForegroundColor Green
Write-Host "PostgreSQL is running as a Windows service and will start automatically on boot." -ForegroundColor Green
Write-Host "Default credentials:" -ForegroundColor Cyan
Write-Host "  - Superuser: postgres (password: postgres)" -ForegroundColor Cyan
Write-Host "  - Custom user: myadmin (password: myadmin)" -ForegroundColor Cyan
Write-Host "  - Database: stripe-ws-db" -ForegroundColor Cyan

# Clean up environment variable
Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
