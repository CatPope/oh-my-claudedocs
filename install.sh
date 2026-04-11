#!/bin/bash
set -e

# 사전 조건: bash 환경 필요 (Windows에서는 install.ps1 또는 install.cmd 사용)
# Node.js v18+, Git, Claude Code CLI 필요

echo "=== Docs OMC 전역 설치 ==="

# ─── 1단계: OMC 설치 확인/설치 ───
if ! claude plugin list 2>/dev/null | grep -q "oh-my-claudecode"; then
  echo "[1/5] OMC 설치 중..."
  claude plugin add oh-my-claudecode@omc
else
  echo "[1/5] OMC 이미 설치됨"
fi

# ─── 2단계: 글로벌 Rules 배치 ───
echo "[2/5] Rules 배치..."
mkdir -p ~/.claude/rules
cp rules/docs-omc.md ~/.claude/rules/docs-omc.md

# ─── 3단계: 사용자 훅 등록 ───
echo "[3/5] 훅 등록..."
mkdir -p ~/.claude/hooks/docs-omc
cp hooks/session-start.mjs    ~/.claude/hooks/docs-omc/
cp hooks/pre-commit-check.mjs ~/.claude/hooks/docs-omc/
cp hooks/post-save-mmd.mjs    ~/.claude/hooks/docs-omc/

# settings.json에 hooks 섹션 병합 (기존 설정 보존, 동일 이벤트에 append)
node scripts/merge-hooks-config.mjs

# ─── 4단계: 사전 스킬 확인 ───
echo "[4/5] 기본 스킬 확인..."
# find-skills, context7은 OMC에 이미 포함 — 존재 확인만
if [ -f ~/.agents/skills/find-skills/SKILL.md ]; then
  echo "  find-skills: OK"
else
  echo "  경고: find-skills 스킬이 없습니다. OMC 설치를 확인하세요."
fi

# context7 MCP 확인
if [ -f ~/.claude/settings.json ] && grep -q '"context7"' ~/.claude/settings.json 2>/dev/null; then
  echo "  context7: OK"
else
  echo "  경고: context7 MCP 서버가 설정되지 않았습니다."
fi

# ─── 5단계: dev-init 스킬 및 래퍼 스킬 설치 ───
echo "[5/5] 스킬 설치..."
SKILLS_DIR=~/.agents/skills
for skill in dev-init dev-autopilot security-report test-report performance-report architecture-doc; do
  mkdir -p "$SKILLS_DIR/$skill"
  cp -r "skills/$skill/"* "$SKILLS_DIR/$skill/"
  echo "  $skill: 설치됨"
done

echo ""
echo "=== 설치 완료 ==="
echo "프로젝트 초기화: 프로젝트 디렉토리에서 /dev-init 실행"
