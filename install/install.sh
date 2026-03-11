#!/usr/bin/env bash
# HERALD — Install script
# Usage: curl -sSL https://raw.githubusercontent.com/yourusername/herald/main/install/install.sh | bash
# Or with options: curl ... | bash -s -- --stack nextjs --name my-project

set -euo pipefail

# ── Config ────────────────────────────────────────────────────────────────
HERALD_VERSION="1.0"
HERALD_REPO="https://raw.githubusercontent.com/yourusername/herald/main"
TARGET_DIR="${HERALD_TARGET:-.herald}"

# ── Colors ────────────────────────────────────────────────────────────────
RESET="\033[0m"
BOLD="\033[1m"
AMBER="\033[33m"
GREEN="\033[32m"
RED="\033[31m"
DIM="\033[2m"

info()    { echo -e "${BOLD}${AMBER}⬡ herald${RESET}  $*"; }
success() { echo -e "${GREEN}✓${RESET}  $*"; }
error()   { echo -e "${RED}✗${RESET}  $*" >&2; exit 1; }
dim()     { echo -e "${DIM}   $*${RESET}"; }

# ── Banner ────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${AMBER}⬡ HERALD${RESET} ${DIM}v${HERALD_VERSION} — One context. Every agent.${RESET}"
echo ""

# ── Check we're in a project root ─────────────────────────────────────────
if [[ ! -f "package.json" && ! -f "go.mod" && ! -f "pyproject.toml" && ! -f "Cargo.toml" && ! -f "pom.xml" ]]; then
  echo -e "${AMBER}Warning:${RESET} No recognized project file found in current directory."
  read -rp "   Continue anyway? [y/N] " confirm
  [[ "$confirm" =~ ^[Yy]$ ]] || exit 0
fi

# ── Detect project info ───────────────────────────────────────────────────
PROJECT_NAME="${PWD##*/}"
PROJECT_NAME="${PROJECT_NAME// /-}"
PROJECT_FRAMEWORK=""

if [[ -f "package.json" ]]; then
  if grep -q '"next"' package.json 2>/dev/null; then
    PROJECT_FRAMEWORK="nextjs"
  elif grep -q '"react"' package.json 2>/dev/null; then
    PROJECT_FRAMEWORK="react"
  elif grep -q '"express"' package.json 2>/dev/null; then
    PROJECT_FRAMEWORK="express"
  else
    PROJECT_FRAMEWORK="node"
  fi
elif [[ -f "go.mod" ]]; then
  PROJECT_FRAMEWORK="go"
elif [[ -f "pyproject.toml" ]] || [[ -f "requirements.txt" ]]; then
  if grep -q "fastapi" pyproject.toml 2>/dev/null || grep -q "fastapi" requirements.txt 2>/dev/null; then
    PROJECT_FRAMEWORK="fastapi"
  else
    PROJECT_FRAMEWORK="python"
  fi
elif [[ -f "Cargo.toml" ]]; then
  PROJECT_FRAMEWORK="rust"
fi

info "Detected project: ${BOLD}${PROJECT_NAME}${RESET}${PROJECT_FRAMEWORK:+" (${PROJECT_FRAMEWORK})"}"
echo ""

# ── Prompt for project description ───────────────────────────────────────
read -rp "   Project description (one sentence): " PROJECT_DESCRIPTION
PROJECT_DESCRIPTION="${PROJECT_DESCRIPTION:-"A software project"}"

# ── Choose layers ─────────────────────────────────────────────────────────
echo ""
info "Which layers do you want to enable?"
dim "context/ is always included"
echo ""

ENABLE_SKILLS=false
ENABLE_COMMANDS=false
ENABLE_AGENTS=false
ENABLE_PERMISSIONS=false

read -rp "   Enable skills/? [y/N] " ans; [[ "$ans" =~ ^[Yy]$ ]] && ENABLE_SKILLS=true
read -rp "   Enable commands/? [y/N] " ans; [[ "$ans" =~ ^[Yy]$ ]] && ENABLE_COMMANDS=true
read -rp "   Enable agents/? [y/N] " ans; [[ "$ans" =~ ^[Yy]$ ]] && ENABLE_AGENTS=true
read -rp "   Enable permissions/? [y/N] " ans; [[ "$ans" =~ ^[Yy]$ ]] && ENABLE_PERMISSIONS=true

# ── Create folder structure ───────────────────────────────────────────────
echo ""
info "Creating .herald/ structure..."

mkdir -p "${TARGET_DIR}/context"
[[ "$ENABLE_SKILLS" == "true" ]]      && mkdir -p "${TARGET_DIR}/skills"
[[ "$ENABLE_COMMANDS" == "true" ]]    && mkdir -p "${TARGET_DIR}/commands"
[[ "$ENABLE_AGENTS" == "true" ]]      && mkdir -p "${TARGET_DIR}/agents"
[[ "$ENABLE_PERMISSIONS" == "true" ]] && mkdir -p "${TARGET_DIR}/permissions"

# ── Write main.yaml ───────────────────────────────────────────────────────
cat > "${TARGET_DIR}/main.yaml" << YAML
version: "${HERALD_VERSION}"

project:
  name: "${PROJECT_NAME}"
  description: "${PROJECT_DESCRIPTION}"${PROJECT_FRAMEWORK:+$'\n  framework: '"${PROJECT_FRAMEWORK}"}

layers:
  context: true
  skills: ${ENABLE_SKILLS}
  commands: ${ENABLE_COMMANDS}
  agents: ${ENABLE_AGENTS}
  permissions: ${ENABLE_PERMISSIONS}

compatible_with:
  - any
YAML

success "Created ${TARGET_DIR}/main.yaml"

# ── Write context/project.md ──────────────────────────────────────────────
cat > "${TARGET_DIR}/context/project.md" << MD
# Project Context

## Overview
${PROJECT_DESCRIPTION}

## Stack
- Add your tech stack here

## Conventions
- Add your team conventions here

## Do Not Touch
- List files agents should never modify
MD

success "Created ${TARGET_DIR}/context/project.md"

# ── Write permissions/policy.yaml ─────────────────────────────────────────
if [[ "$ENABLE_PERMISSIONS" == "true" ]]; then
  cat > "${TARGET_DIR}/permissions/policy.yaml" << YAML
version: "${HERALD_VERSION}"

allow:
  - "src/**"
  - "tests/**"
  - "docs/**"

deny:
  - "*.env"
  - "*.env.*"
  - "secrets/**"
  - ".git/**"
YAML
  success "Created ${TARGET_DIR}/permissions/policy.yaml"
fi

# ── Write AGENTS.md ───────────────────────────────────────────────────────
if [[ ! -f "AGENTS.md" ]]; then
  cat > "AGENTS.md" << MD
# ${PROJECT_NAME} — Agent Guidelines

This project uses [HERALD](https://herald.sh) for agent configuration.

Start by reading \`.herald/main.yaml\`, then \`.herald/context/project.md\`.
MD
  success "Created AGENTS.md"
else
  dim "AGENTS.md already exists, skipping"
fi

# ── Done ──────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}${GREEN}Done.${RESET} Your project is agent-ready."
echo ""
dim "Next steps:"
dim "  1. Edit .herald/context/project.md — add your real stack and conventions"
[[ "$ENABLE_PERMISSIONS" == "true" ]] && dim "  2. Edit .herald/permissions/policy.yaml — set your allow/deny rules"
dim "  3. Commit .herald/ to git"
dim ""
dim "  Generator:     https://herald.sh"
dim "  Documentation: https://github.com/yourusername/herald"
echo ""
