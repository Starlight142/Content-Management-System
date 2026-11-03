# Draftly - AI Skills Portable Installer (PowerShell)
# Installs Ponytail and Diagram Design skills to global and local agent configurations

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Draftly AI Skills Portable Installer (PowerShell)" -ForegroundColor Cyan
Write-Host "  Skills: Ponytail + Diagram Design + Rules" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$globalGeminiDir = Join-Path $env:USERPROFILE ".gemini\config"
$globalAgentsDir = Join-Path $env:USERPROFILE ".agents"
$projectRoot = Resolve-Path (Join-Path $scriptDir "..\..")

# 1. Global Gemini / Antigravity
Write-Host "[1/3] Installing to Global Antigravity / Gemini configuration..." -ForegroundColor Yellow
$geminiSkills = Join-Path $globalGeminiDir "skills"
New-Item -ItemType Directory -Path (Join-Path $geminiSkills "ponytail") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $geminiSkills "diagram-design") -Force | Out-Null
Copy-Item (Join-Path $scriptDir "skills\ponytail\SKILL.md") (Join-Path $geminiSkills "ponytail\SKILL.md") -Force
Copy-Item (Join-Path $scriptDir "skills\diagram-design\SKILL.md") (Join-Path $geminiSkills "diagram-design\SKILL.md") -Force
Write-Host "      Installed to: $geminiSkills" -ForegroundColor Green

# 2. Global .agents
Write-Host "[2/3] Installing to Global .agents directory..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path (Join-Path $globalAgentsDir "skills\ponytail") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $globalAgentsDir "skills\diagram-design") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $globalAgentsDir "rules") -Force | Out-Null
Copy-Item (Join-Path $scriptDir "skills\ponytail\SKILL.md") (Join-Path $globalAgentsDir "skills\ponytail\SKILL.md") -Force
Copy-Item (Join-Path $scriptDir "skills\diagram-design\SKILL.md") (Join-Path $globalAgentsDir "skills\diagram-design\SKILL.md") -Force
Copy-Item (Join-Path $scriptDir "rules\ponytail.md") (Join-Path $globalAgentsDir "rules\ponytail.md") -Force
Write-Host "      Installed to: $globalAgentsDir" -ForegroundColor Green

# 3. Project-level .agents
Write-Host "[3/3] Checking project-level .agents directory..." -ForegroundColor Yellow
$projectAgents = Join-Path $projectRoot ".agents"
New-Item -ItemType Directory -Path (Join-Path $projectAgents "skills\ponytail") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $projectAgents "skills\diagram-design") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $projectAgents "rules") -Force | Out-Null
Copy-Item (Join-Path $scriptDir "skills\ponytail\SKILL.md") (Join-Path $projectAgents "skills\ponytail\SKILL.md") -Force
Copy-Item (Join-Path $scriptDir "skills\diagram-design\SKILL.md") (Join-Path $projectAgents "skills\diagram-design\SKILL.md") -Force
Copy-Item (Join-Path $scriptDir "rules\ponytail.md") (Join-Path $projectAgents "rules\ponytail.md") -Force
Write-Host "      Verified at: $projectAgents" -ForegroundColor Green

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Installation Successful!" -ForegroundColor Green
Write-Host "  Active Skills:" -ForegroundColor Cyan
Write-Host "    - ponytail (Minimalist Senior Developer Coding)"
Write-Host "    - diagram-design (Editorial Architecture Diagrams)"
Write-Host "========================================================" -ForegroundColor Cyan
