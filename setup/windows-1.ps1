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
choco install postgresql -y

# Stop here - user must get the password output in the terminal.

