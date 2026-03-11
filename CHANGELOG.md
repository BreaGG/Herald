# Changelog

All notable changes to the HERALD specification will be documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

### Planned for v1.1
- Skill registry support (`registry:` field in manifest)
- `herald compile` CLI for generating vendor-specific files
- Workflow layer (multi-step agent orchestration)
- Monorepo support (`herald.workspace.yaml`)

---

## [1.0.0-draft] — 2025

### Added
- Initial specification: manifest format (`main.yaml`)
- Five layers: `context/`, `skills/`, `commands/`, `agents/`, `permissions/`
- Progressive disclosure model (Tier 1 / 2 / 3)
- Conformance levels B1–B6
- JSON schemas for manifest, policy, and skill frontmatter
- Reference examples: Next.js, FastAPI, Go microservice
- Compatibility guides: `AGENTS.md`, `CLAUDE.md`, `SKILL.md`
- Install script (`install/install.sh`)
- Interactive generator at [herald.sh](https://herald.sh)
