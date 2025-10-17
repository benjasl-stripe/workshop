# PowerShell script to install PostgreSQL and set up Medusa backend on Windows

# 1. Install Chocolatey if not present
if (-not (Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Chocolatey..."
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    refreshenv
}

# 2. Install PostgreSQL
Write-Host "Installing PostgreSQL..."
choco install postgresql --params "/Password:postgres" -y
refreshenv

# 3. Start PostgreSQL service
Write-Host "Starting PostgreSQL service..."
$services = @("postgresql-x64-14", "postgresql-x64-13", "postgresql-x64-12")
$started = $false
foreach ($svc in $services) {
    try {
        Start-Service $svc -ErrorAction Stop
        $started = $true
        break
    } catch {}
}
if (-not $started) {
    Get-Service | Where-Object { $_.Name -like "postgresql*" } | ForEach-Object { Start-Service $_.Name }
}

# 4. Set PGPASSWORD for automated operations
$env:PGPASSWORD = "postgres"

# 5. Wait for PostgreSQL to be ready
Write-Host "Waiting for PostgreSQL to be ready..."
do {
    Start-Sleep -Seconds 2
    & psql -U postgres -c "SELECT 1;" *> $null
} until ($LASTEXITCODE -eq 0)

# 6. Create myadmin Postgres role
Write-Host "Creating myadmin superuser role..."
& psql -U postgres -c "CREATE USER myadmin WITH SUPERUSER PASSWORD 'myadmin';" *> $null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Created myadmin superuser role"
} else {
    Write-Host "Role 'myadmin' may already exist"
}

# 7. Print Postgres version
Write-Host "PostgreSQL version:"
& psql --version

# 8. Create blank database
Write-Host "Creating stripe-ws-db database..."
& createdb -U postgres stripe-ws-db *> $null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Created stripe-ws-db database"
} else {
    Write-Host "Database 'stripe-ws-db' may already exist"
}

# 9. Import DB data
$sqlFile = ".\workshop\setup\mydb_clean_export.sql"
if (Test-Path $sqlFile) {
    Write-Host "Importing database data..."
    & psql -U postgres -d stripe-ws-db -f $sqlFile
    Write-Host "Database import completed"
} else {
    Write-Host "SQL file not found - skipping database import"
}

# 10. Test database connection
Write-Host "Testing database connection..."
& psql -U postgres -d stripe-ws-db -c "\q" *> $null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Database connection successful"
} else {
    Write-Warning "Database connection failed"
}

# 11. Check if Node.js is available
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Node.js..."
    choco install nodejs -y
    refreshenv
}

# 12. Create Medusa admin user and setup .env
$medusaDir = "..\medusa-backend"
if (Test-Path $medusaDir) {
    Set-Location $medusaDir

    Write-Host "Creating Medusa admin user..."
    npx medusa user -e admin@medusajs.com -p supersecret

    if (Test-Path ".env.template") {
        Move-Item ".env.template" ".env" -Force
        Write-Host "Renamed .env.template to .env"
    } else {
        Write-Host "No .env.template found in $medusaDir"
    }

    # 13. Install npm dependencies and run dev server
    npm install
    npm run dev
} else {
    Write-Host "Medusa backend directory not found: $medusaDir"
}

# 14. Clean up environment variable
Remove-Item Env:PGPASSWORD