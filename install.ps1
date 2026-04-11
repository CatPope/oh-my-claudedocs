# install.ps1 — Windows PowerShell용 Docs OMC 전역 설치
# 사전 조건: PowerShell 5.1+ 또는 PowerShell Core 7+
# Node.js v18+, Git, Claude Code CLI 필요
$ErrorActionPreference = "Stop"

Write-Host "=== Docs OMC 전역 설치 ===" -ForegroundColor Cyan

$ClaudeDir = "$env:USERPROFILE\.claude"
$AgentsDir = "$env:USERPROFILE\.agents\skills"

# ─── 1단계: OMC 설치 확인/설치 ───
Write-Host "[1/5] OMC 설치 확인..."
$pluginList = & claude plugin list 2>$null
if ($pluginList -match "oh-my-claudecode") {
    Write-Host "  OMC 이미 설치됨" -ForegroundColor Green
} else {
    Write-Host "  OMC 설치 중..."
    & claude plugin add oh-my-claudecode@omc
}

# ─── 2단계: 글로벌 Rules 배치 ───
Write-Host "[2/5] Rules 배치..."
$rulesDir = "$ClaudeDir\rules"
if (-not (Test-Path $rulesDir)) {
    New-Item -ItemType Directory -Path $rulesDir -Force | Out-Null
}
Copy-Item -Path "rules\docs-omc.md" -Destination "$rulesDir\docs-omc.md" -Force
Write-Host "  docs-omc.md: 배치 완료" -ForegroundColor Green

# ─── 3단계: 사용자 훅 등록 ───
Write-Host "[3/5] 훅 등록..."
$hooksDir = "$ClaudeDir\hooks\docs-omc"
if (-not (Test-Path $hooksDir)) {
    New-Item -ItemType Directory -Path $hooksDir -Force | Out-Null
}
Copy-Item -Path "hooks\session-start.mjs"    -Destination "$hooksDir\" -Force
Copy-Item -Path "hooks\pre-commit-check.mjs" -Destination "$hooksDir\" -Force
Copy-Item -Path "hooks\post-save-mmd.mjs"    -Destination "$hooksDir\" -Force
Write-Host "  훅 파일 복사 완료" -ForegroundColor Green

# settings.json에 hooks 섹션 병합
node scripts\merge-hooks-config.mjs
Write-Host "  settings.json 훅 등록 완료" -ForegroundColor Green

# ─── 4단계: 사전 스킬 확인 ───
Write-Host "[4/5] 기본 스킬 확인..."
$findSkillsPath = "$env:USERPROFILE\.agents\skills\find-skills\SKILL.md"
if (Test-Path $findSkillsPath) {
    Write-Host "  find-skills: OK" -ForegroundColor Green
} else {
    Write-Host "  경고: find-skills 스킬이 없습니다. OMC 설치를 확인하세요." -ForegroundColor Yellow
}

$settingsPath = "$ClaudeDir\settings.json"
if ((Test-Path $settingsPath) -and (Get-Content $settingsPath -Raw) -match '"context7"') {
    Write-Host "  context7: OK" -ForegroundColor Green
} else {
    Write-Host "  경고: context7 MCP 서버가 설정되지 않았습니다." -ForegroundColor Yellow
}

# ─── 5단계: 커스텀 스킬 설치 ───
Write-Host "[5/5] 스킬 설치..."
$skills = @("dev-init", "dev-autopilot", "security-report", "test-report", "performance-report", "architecture-doc")
foreach ($skill in $skills) {
    $dest = "$AgentsDir\$skill"
    if (-not (Test-Path $dest)) {
        New-Item -ItemType Directory -Path $dest -Force | Out-Null
    }
    Copy-Item -Path "skills\$skill\*" -Destination "$dest\" -Recurse -Force
    Write-Host "  ${skill}: 설치됨" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== 설치 완료 ===" -ForegroundColor Cyan
Write-Host "프로젝트 초기화: 프로젝트 디렉토리에서 /dev-init 실행"
