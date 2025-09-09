# Windows PostgreSQL Installation Scripts

This directory contains Windows versions of the original `install_postgres.sh` bash script.

## Available Scripts

### 1. `install_postgres.ps1` (PowerShell Script) - **Recommended**
A PowerShell script that provides robust error handling and colored output.

**Prerequisites:**
- Windows PowerShell 5.1 or PowerShell Core 6+
- Administrator privileges (recommended)

**To run:**
```powershell
# Right-click PowerShell and "Run as Administrator"
.\install_postgres.ps1
```

**If you get execution policy errors:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\install_postgres.ps1
```

### 2. `install_postgres.bat` (Batch File)
A batch file version that works on any Windows system without PowerShell requirements.

**To run:**
```cmd
# Right-click Command Prompt and "Run as Administrator"
install_postgres.bat
```

## What These Scripts Do

Both scripts perform the same operations as the original bash script:

1. **Install Chocolatey** (Windows package manager, equivalent to Homebrew)
2. **Install PostgreSQL** using Chocolatey with default password "postgres"
3. **Start PostgreSQL service** and set it to auto-start on boot
4. **Create database roles:**
   - Default superuser: `postgres` (password: `postgres`)
   - Custom superuser: `myadmin` (password: `myadmin`)
5. **Create database** `stripe-ws-db`
6. **Import database data** from `mydb_clean_export.sql` (if file exists)
7. **Install Node.js** (if not already installed)
8. **Set up Medusa backend:**
   - Create admin user: `admin@medusajs.com` (password: `supersecret`)
   - Rename `.env.template` to `.env`
   - Install npm dependencies
   - Optionally start the development server

## Key Differences from macOS Version

| macOS (Homebrew) | Windows (Chocolatey) |
|------------------|---------------------|
| `brew install postgresql` | `choco install postgresql` |
| `brew services start postgresql` | `sc start postgresql-x64-*` |
| Uses system user for database | Uses `postgres` user with password |
| `/usr/local/var/postgres` | `C:\Program Files\PostgreSQL\*\data` |

## Default Credentials

After installation, you can connect to PostgreSQL using:

```bash
# Using postgres superuser
psql -U postgres -d stripe-ws-db

# Using custom myadmin user
psql -U myadmin -d stripe-ws-db
```

**Default passwords:**
- `postgres` user: `postgres`
- `myadmin` user: `myadmin`

## Troubleshooting

### Common Issues

1. **"choco is not recognized"**
   - The script will automatically install Chocolatey
   - You may need to restart your terminal after installation

2. **PostgreSQL service won't start**
   - Check if port 5432 is already in use
   - Try restarting the computer after installation

3. **Permission errors**
   - Make sure to run the script as Administrator
   - Check Windows Defender/antivirus isn't blocking the installation

4. **Database import fails**
   - Ensure the `mydb_clean_export.sql` file exists in the correct location
   - Check the file path in the script matches your setup

### Manual PostgreSQL Management

```cmd
# Start PostgreSQL service
net start postgresql-x64-14

# Stop PostgreSQL service  
net stop postgresql-x64-14

# Check service status
sc query postgresql-x64-14
```

### Connecting to PostgreSQL

```cmd
# Connect as postgres user
psql -U postgres

# Connect to specific database
psql -U postgres -d stripe-ws-db

# List all databases
psql -U postgres -c "\l"
```

## Environment Variables

The scripts automatically configure:
- `PATH` - Adds PostgreSQL bin directory
- PostgreSQL service - Set to start automatically

## Uninstalling

To remove PostgreSQL installed via Chocolatey:

```cmd
# Stop the service
net stop postgresql-x64-14

# Uninstall PostgreSQL
choco uninstall postgresql -y

# Remove data directory (optional)
rmdir /s "C:\Program Files\PostgreSQL"
```

## Support

If you encounter issues:
1. Check that you're running as Administrator
2. Verify your Windows version is supported (Windows 10/11)
3. Check Windows Event Viewer for PostgreSQL service errors
4. Ensure no other PostgreSQL installations conflict
