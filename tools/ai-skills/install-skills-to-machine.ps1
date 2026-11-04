# Draftly - AI Skills Portable Installer (PowerShell)
# Installs Ponytail, Diagram Design, and Draftly Portable skills + Git pre-commit version hook

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Draftly AI Skills Portable Installer (PowerShell)" -ForegroundColor Cyan
Write-Host "  Skills: ponytail + diagram-design + draftly-portable" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$globalGeminiDir = Join-Path $env:USERPROFILE ".gemini\config"
$globalAgentsDir = Join-Path $env:USERPROFILE ".agents"
$projectRoot = Resolve-Path (Join-Path $scriptDir "..\..")

$skillNames = @("ponytail", "diagram-design", "draftly-portable")

# 1. Global Gemini / Antigravity
Write-Host "[1/4] Installing to Global Antigravity / Gemini configuration..." -ForegroundColor Yellow
$geminiSkills = Join-Path $globalGeminiDir "skills"
foreach ($s in $skillNames) {
  New-Item -ItemType Directory -Path (Join-Path $geminiSkills $s) -Force | Out-Null
  Copy-Item (Join-Path $scriptDir "skills\$s\SKILL.md") (Join-Path $geminiSkills "$s\SKILL.md") -Force
}
Write-Host "      Installed to: $geminiSkills" -ForegroundColor Green

# 2. Global .agents
Write-Host "[2/4] Installing to Global .agents directory..." -ForegroundColor Yellow
foreach ($s in $skillNames) {
  New-Item -ItemType Directory -Path (Join-Path $globalAgentsDir "skills\$s") -Force | Out-Null
  Copy-Item (Join-Path $scriptDir "skills\$s\SKILL.md") (Join-Path $globalAgentsDir "skills\$s\SKILL.md") -Force
}
New-Item -ItemType Directory -Path (Join-Path $globalAgentsDir "rules") -Force | Out-Null
Copy-Item (Join-Path $scriptDir "rules\ponytail.md") (Join-Path $globalAgentsDir "rules\ponytail.md") -Force
Write-Host "      Installed to: $globalAgentsDir" -ForegroundColor Green

# 3. Project-level .agents
Write-Host "[3/4] Syncing project-level .agents directory..." -ForegroundColor Yellow
$projectAgents = Join-Path $projectRoot ".agents"
foreach ($s in $skillNames) {
  New-Item -ItemType Directory -Path (Join-Path $projectAgents "skills\$s") -Force | Out-Null
  Copy-Item (Join-Path $scriptDir "skills\$s\SKILL.md") (Join-Path $projectAgents "skills\$s\SKILL.md") -Force
}
New-Item -ItemType Directory -Path (Join-Path $projectAgents "rules") -Force | Out-Null
Copy-Item (Join-Path $scriptDir "rules\ponytail.md") (Join-Path $projectAgents "rules\ponytail.md") -Force
Write-Host "      Verified at: $projectAgents" -ForegroundColor Green

# 4. Git Pre-Commit Auto-Version Hook
Write-Host "[4/4] Installing Git pre-commit auto-version hook..." -ForegroundColor Yellow
$gitHooksDir = Join-Path $projectRoot ".git\hooks"
if (Test-Path $gitHooksDir) {
  $hookPath = Join-Path $gitHooksDir "pre-commit"
  Set-Content -Path $hookPath -Value "#!/bin/sh`nnode tools/version/bump_version.js --pre-commit`n" -Encoding Ascii
  Write-Host "      Installed hook: $hookPath" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Installation Successful!" -ForegroundColor Green
Write-Host "  Active Skills:" -ForegroundColor Cyan
Write-Host "    - ponytail (Minimalist Senior Developer Coding)"
Write-Host "    - diagram-design (Editorial Architecture Diagrams)"
Write-Host "    - draftly-portable (New PC Migration & Bootstrap)"
Write-Host "========================================================" -ForegroundColor Cyan
