# Windows Installation Instructions

## Installing PostgreSQL and Medusa on Windows

### Prerequisites
- Windows 10 or Windows 11
- Administrator access to your computer

### Option 1: PowerShell Script (Recommended)

1. **Open PowerShell as Administrator:**
   - Press `Windows + X`
   - Select "Windows PowerShell (Admin)" or "Terminal (Admin)"
   - If prompted by User Account Control, click "Yes"

2. **Navigate to the setup directory:**
   ```powershell
   cd .\workshop\setup\
   ```

3. **If you get execution policy errors, run this first:**
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

4. **Run the installation script:**
   ```powershell
   .\install_postgres.ps1
   ```

### Option 2: Batch File

1. **Open Command Prompt as Administrator:**
   - Press `Windows + X`
   - Select "Command Prompt (Admin)" or "Terminal (Admin)"
   - If prompted by User Account Control, click "Yes"

2. **Navigate to the setup directory:**
   ```cmd
   cd .\workshop\setup\
   ```

3. **Run the installation script:**
   ```cmd
   install_postgres.bat
   ```

### What Happens During Installation

The script will:
1. Install Chocolatey (Windows package manager)
2. Install PostgreSQL with default credentials
3. Set up the database and import data
4. Install Node.js (if needed)
5. Create Medusa admin user
6. Install project dependencies
7. Ask if you want to start the development server

### After Installation

When the script completes successfully, you'll see output similar to:
```
Setup complete! You can start the server later with 'npm run dev'
PostgreSQL installation and setup completed!
```

### Starting the Development Server

If you chose not to start the server during installation, you can start it later:

1. **Navigate to the backend directory:**
   ```cmd
   cd .\workshop\medusa-backend\
   ```

2. **Start the development server:**
   ```cmd
   npm run dev
   ```

3. **Look for the Admin URL in the output:**
   After the server starts, you'll see output like:
   ```
   Admin URL: http://localhost:7001/app
   Storefront URL: http://localhost:8000
   ```

4. **Copy the Admin URL to your clipboard** and open it in your browser.

### Default Credentials

**PostgreSQL:**
- Superuser: `postgres` (password: `postgres`)
- Custom user: `myadmin` (password: `myadmin`)
- Database: `stripe-ws-db`

**Medusa Admin:**
- Email: `admin@medusajs.com`
- Password: `supersecret`

### Troubleshooting

**If the script fails:**
1. Make sure you're running as Administrator
2. Check that your internet connection is working
3. Restart your computer and try again
4. See the detailed troubleshooting guide in `README_Windows.md`

**If you can't run PowerShell scripts:**
- Use the batch file version (`install_postgres.bat`) instead
- Or run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

**If PostgreSQL won't start:**
- Check if port 5432 is already in use
- Try restarting your computer
- Run: `net start postgresql-x64-14` manually
