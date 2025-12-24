#!/usr/bin/env pwsh

Write-Host "🚀 Installing Java 17 for Crypto Portfolio Tracker Backend" -ForegroundColor Green
Write-Host ""

# Check if Java is already installed
try {
    $javaVersion = java -version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Java is already installed:" -ForegroundColor Green
        Write-Host $javaVersion[0] -ForegroundColor Cyan
        Write-Host ""
        Write-Host "You can now run the backend with: ./start-backend.ps1" -ForegroundColor Yellow
        Read-Host "Press Enter to exit"
        exit 0
    }
} catch {
    # Java not found, continue with installation
}

Write-Host "Java not found. Let's install it!" -ForegroundColor Yellow
Write-Host ""

# Check if Chocolatey is available
try {
    choco --version | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "📦 Installing Java 17 using Chocolatey..." -ForegroundColor Cyan
        choco install openjdk17 -y
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Java 17 installed successfully!" -ForegroundColor Green
            Write-Host "Please restart your terminal and run: ./start-backend.ps1" -ForegroundColor Yellow
            Read-Host "Press Enter to exit"
            exit 0
        }
    }
} catch {
    # Chocolatey not available
}

# Check if Scoop is available
try {
    scoop --version | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "📦 Installing Java 17 using Scoop..." -ForegroundColor Cyan
        scoop install openjdk17
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Java 17 installed successfully!" -ForegroundColor Green
            Write-Host "Please restart your terminal and run: ./start-backend.ps1" -ForegroundColor Yellow
            Read-Host "Press Enter to exit"
            exit 0
        }
    }
} catch {
    # Scoop not available
}

# Manual installation instructions
Write-Host "❌ No package manager found (Chocolatey or Scoop)" -ForegroundColor Red
Write-Host ""
Write-Host "Please install Java 17 manually:" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔗 Download from: https://adoptium.net/temurin/releases/" -ForegroundColor Cyan
Write-Host "   1. Select 'OpenJDK 17 (LTS)'" -ForegroundColor White
Write-Host "   2. Choose 'Windows x64'" -ForegroundColor White
Write-Host "   3. Download and run the .msi installer" -ForegroundColor White
Write-Host "   4. Restart your terminal" -ForegroundColor White
Write-Host "   5. Run: ./start-backend.ps1" -ForegroundColor White
Write-Host ""
Write-Host "🍫 Or install Chocolatey first:" -ForegroundColor Cyan
Write-Host "   Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))" -ForegroundColor White
Write-Host "   Then run: choco install openjdk17 -y" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to exit"