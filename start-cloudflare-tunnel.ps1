# Script to start Cloudflare Tunnel for Draftly CMS Backend (Port 5000)
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "      Starting Cloudflare Tunnel for Draftly CMS          " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$cloudflaredPath = "$PSScriptRoot\tools\cloudflared.exe"

if (-not (Test-Path $cloudflaredPath)) {
    Write-Host "Downloading cloudflared.exe..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path "$PSScriptRoot\tools" | Out-Null
    curl.exe -L -o $cloudflaredPath https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe
}

Write-Host "Checking if Backend is running on port 5000..." -ForegroundColor Cyan
$conn = Test-NetConnection -ComputerName 127.0.0.1 -Port 5000 -InformationLevel Quiet
if (-not $conn) {
    Write-Host "[WARNING] Backend is not currently detected on port 5000!" -ForegroundColor Yellow
    Write-Host "Please make sure to run: cd master/backend; npm run dev" -ForegroundColor Yellow
}

Write-Host "Exposing http://localhost:5000 to the public internet..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the tunnel.`n" -ForegroundColor DarkGray

& $cloudflaredPath tunnel --url http://localhost:5000
