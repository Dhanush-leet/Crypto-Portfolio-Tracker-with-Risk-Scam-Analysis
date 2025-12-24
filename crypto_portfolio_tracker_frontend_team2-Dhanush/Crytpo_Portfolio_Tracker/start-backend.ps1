#!/usr/bin/env pwsh

Write-Host "Starting Crypto Portfolio Tracker Backend..." -ForegroundColor Green
Write-Host ""

# Check if Java is installed
try {
    $javaVersion = java -version 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Java not found"
    }
    Write-Host "Java found: $($javaVersion[0])" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Java is not installed or not in PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Java 17 or higher:" -ForegroundColor Yellow
    Write-Host "- Download from: https://adoptium.net/" -ForegroundColor Yellow
    Write-Host "- Or use Chocolatey: choco install openjdk17" -ForegroundColor Yellow
    Write-Host "- Or use Scoop: scoop install openjdk17" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Testing database connection..." -ForegroundColor Green
Write-Host ""

# Test PostgreSQL connection
try {
    $connection = Test-NetConnection -ComputerName localhost -Port 5432 -WarningAction SilentlyContinue
    if ($connection.TcpTestSucceeded) {
        Write-Host "✅ PostgreSQL server is running" -ForegroundColor Green
    } else {
        Write-Host "❌ PostgreSQL server not accessible on localhost:5432" -ForegroundColor Red
        Write-Host "Please ensure PostgreSQL is running and database is set up" -ForegroundColor Yellow
        Write-Host "Database: crypto_portfolio" -ForegroundColor White
        Write-Host "Username: crypto_portfolio" -ForegroundColor White
        Read-Host "Press Enter to continue anyway"
    }
} catch {
    Write-Host "⚠️ Could not test database connection" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Starting Spring Boot application..." -ForegroundColor Green
Write-Host ""

Set-Location crypto-portfolio-api

# Try Maven wrapper first
if (Test-Path "../mvnw.cmd") {
    Write-Host "Using Maven wrapper..." -ForegroundColor Cyan
    & ../mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev
} elseif (Test-Path "../mvnw") {
    Write-Host "Using Maven wrapper (Unix)..." -ForegroundColor Cyan
    & ../mvnw spring-boot:run -Dspring-boot.run.profiles=dev
} else {
    # Fallback to system Maven
    Write-Host "Using system Maven..." -ForegroundColor Cyan
    mvn spring-boot:run -Dspring-boot.run.profiles=dev
}

Read-Host "Press Enter to exit"