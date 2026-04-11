@echo off
REM install.cmd — Windows CMD용 Docs OMC 전역 설치
REM 사전 조건: Node.js v18+, Git, Claude Code CLI 필요
chcp 65001 >nul 2>&1

echo === Docs OMC 전역 설치 ===

set CLAUDE_DIR=%USERPROFILE%\.claude
set AGENTS_DIR=%USERPROFILE%\.agents\skills

REM ─── 1단계: OMC 설치 확인/설치 ───
echo [1/5] OMC 설치 확인...
claude plugin list 2>nul | findstr /C:"oh-my-claudecode" >nul 2>&1
if %errorlevel% equ 0 (
    echo   OMC 이미 설치됨
) else (
    echo   OMC 설치 중...
    claude plugin add oh-my-claudecode@omc
    if %errorlevel% neq 0 (
        echo   오류: OMC 설치 실패
        exit /b 1
    )
)

REM ─── 2단계: 글로벌 Rules 배치 ───
echo [2/5] Rules 배치...
if not exist "%CLAUDE_DIR%\rules" mkdir "%CLAUDE_DIR%\rules"
copy /Y "rules\docs-omc.md" "%CLAUDE_DIR%\rules\docs-omc.md" >nul
if %errorlevel% neq 0 (
    echo   오류: rules\docs-omc.md 복사 실패
    exit /b 1
)
echo   docs-omc.md: 배치 완료

REM ─── 3단계: 사용자 훅 등록 ───
echo [3/5] 훅 등록...
if not exist "%CLAUDE_DIR%\hooks\docs-omc" mkdir "%CLAUDE_DIR%\hooks\docs-omc"
copy /Y "hooks\session-start.mjs"    "%CLAUDE_DIR%\hooks\docs-omc\" >nul
copy /Y "hooks\pre-commit-check.mjs" "%CLAUDE_DIR%\hooks\docs-omc\" >nul
copy /Y "hooks\post-save-mmd.mjs"    "%CLAUDE_DIR%\hooks\docs-omc\" >nul
if %errorlevel% neq 0 (
    echo   오류: 훅 파일 복사 실패
    exit /b 1
)
echo   훅 파일 복사 완료

node scripts\merge-hooks-config.mjs
if %errorlevel% neq 0 (
    echo   오류: settings.json 훅 등록 실패
    exit /b 1
)
echo   settings.json 훅 등록 완료

REM ─── 4단계: 사전 스킬 확인 ───
echo [4/5] 기본 스킬 확인...
if exist "%USERPROFILE%\.agents\skills\find-skills\SKILL.md" (
    echo   find-skills: OK
) else (
    echo   경고: find-skills 스킬이 없습니다. OMC 설치를 확인하세요.
)

if exist "%CLAUDE_DIR%\settings.json" (
    findstr /C:"context7" "%CLAUDE_DIR%\settings.json" >nul 2>&1
    if %errorlevel% equ 0 (
        echo   context7: OK
    ) else (
        echo   경고: context7 MCP 서버가 설정되지 않았습니다.
    )
) else (
    echo   경고: context7 MCP 서버가 설정되지 않았습니다.
)

REM ─── 5단계: 커스텀 스킬 설치 ───
echo [5/5] 스킬 설치...
if not exist "%AGENTS_DIR%" mkdir "%AGENTS_DIR%"

for %%s in (dev-init dev-autopilot security-report test-report performance-report architecture-doc) do (
    if not exist "%AGENTS_DIR%\%%s" mkdir "%AGENTS_DIR%\%%s"
    robocopy "skills\%%s" "%AGENTS_DIR%\%%s" /E /IS /IT /NFL /NDL /NJH /NJS >nul
    if %errorlevel% geq 8 (
        echo   오류: %%s 설치 실패
        exit /b 1
    )
    echo   %%s: 설치됨
)

echo.
echo === 설치 완료 ===
echo 프로젝트 초기화: 프로젝트 디렉토리에서 /dev-init 실행
