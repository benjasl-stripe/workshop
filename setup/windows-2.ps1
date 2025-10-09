# PowerShell script to install PostgreSQL and set up Medusa backend on Windows

# 1. Set PGPASSWORD for automated operations
# $env:PGPASSWORD = "<paste_generated_password_here>"
$env:PGPASSWORD = "137c5bc5662e48b0be2e690481c84695"

# 2. Start PostgreSQL service
refreshenv
# Add PostgreSQL to PATH
$env:Path += ";C:\Program Files\PostgreSQL\17\bin"

Write-Host "Starting PostgreSQL service..."
$services = @("postgresql-x64-17", "postgresql-x64-16", "postgresql-x64-15", "postgresql-x64-14", "postgresql-x64-13", "postgresql-x64-12")
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

# 3. Wait for PostgreSQL to be ready
Write-Host "Waiting for PostgreSQL to be ready..."
$maxAttempts = 30
$attempt = 0
do {
    Start-Sleep -Seconds 2
    $attempt++
    & psql -U postgres -h localhost -d postgres -w -c "SELECT 1;" 
    if ($attempt -ge $maxAttempts) {
        Write-Host "PostgreSQL did not start after $($maxAttempts * 2) seconds."
        exit 1
    }
} until ($LASTEXITCODE -eq 0)


# 6. Create myadmin Postgres role
Write-Host "Creating myadmin superuser role..."

& psql -U postgres -c "CREATE USER myadmin WITH SUPERUSER PASSWORD 'mypassword';"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Created myadmin superuser role"
} else {
    Write-Host "Role 'myadmin' may already exist"
}

# 7. Print Postgres version
Write-Host "PostgreSQL version:"
& psql --version

# Reset PGPASSWORD to myadmin for subsequent commands
Write-Host "Resetting password var"
$env:PGPASSWORD = "mypassword"
refreshenv
# Re-add PostgreSQL to PATH after refreshenv
$env:Path += ";C:\Program Files\PostgreSQL\17\bin"


# 8. Create blank database
Write-Host "Creating stripe-ws-db database..."
& createdb -U myadmin stripe-ws-db *> $null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Created stripe-ws-db database"
} else {
    Write-Host "Database 'stripe-ws-db' may already exist"
}

# 9. Import DB data
$sqlFile = ".\mydb_clean_export.sql"
if (Test-Path $sqlFile) {
    Write-Host "Importing database data..."
    & psql -U myadmin -d stripe-ws-db -f $sqlFile
    Write-Host "Database import completed"
} else {
    Write-Host "SQL file not found - skipping database import"
}

# 10. Test database connection
Write-Host "Testing database connection..."
& psql -U myadmin -d stripe-ws-db -c "\q" *> $null
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

# 12. Setup .env in medusa-backend
$medusaDir = "..\medusa-backend"
Set-Location $medusaDir

if (Test-Path ".env.template") {
    if (Test-Path ".env") {
        Write-Host "Backing up existing .env -> .env.backup"
        Move-Item ".env" ".env.backup" -Force
    }
    Move-Item ".env.template" ".env" -Force
    Write-Host "Renamed .env.template to .env"
} else {
    if (Test-Path ".env") {
        Write-Host ".env already exists"
    } else {
        Write-Host "No .env.template found in $medusaDir"
    }
}

# 13. Install npm dependencies (do not start dev server)
Write-Host "Installing npm dependencies..."
npm install

# 13. Install npm dependencies (do not start dev server)
npm install

$here = (Resolve-Path .).Path

Write-Host ''
Write-Host '=========================================' -ForegroundColor Green
Write-Host 'Installation complete - everything is ready.' -ForegroundColor Green
Write-Host ''
Write-Host 'Please close this PowerShell window now' -ForegroundColor Yellow
Write-Host 'and return to the workshop instructions to continue.' -ForegroundColor Yellow
Write-Host ''
Write-Host 'When the instructions tell you to start the server, run:' -ForegroundColor Cyan
Write-Host "  cd $here" -ForegroundColor Cyan
Write-Host '  npm run dev' -ForegroundColor Cyan
Write-Host '=========================================' -ForegroundColor Green

# 14. Clean up environment variable
Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
