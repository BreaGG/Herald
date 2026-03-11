# ⬡ HERALD

**One context. Every agent.**

HERALD is an open standard that defines how software projects describe themselves to AI coding agents. Instead of maintaining `CLAUDE.md`, `.cursorrules`, `.github/copilot-instructions.md`, `GEMINI.md`, and a dozen other vendor-specific files, you write your project context once inside a `.herald/` folder — and any HERALD-compatible agent reads it.

[![Status: Draft v1.0](https://img.shields.io/badge/Status-Draft%20v1.0-amber.svg)](./spec/v1)
[![License: CC0](https://img.shields.io/badge/License-CC0-blue.svg)](./LICENSE)
[![Contributions Welcome](https://img.shields.io/badge/Contributions-Welcome-green.svg)](./CONTRIBUTING.md)

---

## The problem

Every AI coding tool invents its own configuration format:

| Tool | File |
|------|------|
| Claude Code | `CLAUDE.md` + `.claude/` |
| Cursor | `.cursorrules` or `.cursor/rules/` |
| GitHub Copilot | `.github/copilot-instructions.md` |
| Gemini CLI | `GEMINI.md` |
| Windsurf | `.windsurfrules` |
| Codex | `AGENTS.md` |
| Roo Code | `.clinerules` |
| JetBrains Junie | `.junie/guidelines.md` |
| Kiro | `.kiro/steering/` |
| Aider | `.aider.conf.yml` |

Teams using multiple tools duplicate effort. Knowledge stays trapped in vendor-specific formats. Switch tools → lose everything.

## The solution

One folder. Any HERALD-compatible agent.

```
your-project/
└── .herald/
    ├── main.yaml          # Manifest: what this project uses
    ├── context/           # What agents need to KNOW
    ├── skills/            # What agents can DO
    ├── commands/          # Reusable single-shot tasks
    ├── agents/            # Named subagents for specific roles
    └── permissions/       # What agents are ALLOWED to do
```

---

## Quick start

**Option 1 — Generator (recommended)**

Use the interactive wizard at [herald.sh](https://herald.sh) to generate your `.herald/` folder in under two minutes, then download it as a ZIP.

**Option 2 — CLI**

```bash
npx herald-agents init
```

Detects your stack, asks a few questions, and generates your `.herald/` folder in under a minute. See [`herald-cli/`](./herald-cli) for full docs.

**Option 3 — Install script**

```bash
curl -sSL https://raw.githubusercontent.com/BreaGG/Herald/main/install/install.sh | bash
```

**Option 4 — Manual**

```bash
# 1. Create the folder
mkdir -p .herald/context

# 2. Add your manifest
cat > .herald/main.yaml << 'YAML'
version: "1.0"
project:
  name: my-project
  description: "A brief description"
layers:
  context: true
  skills: false
  commands: false
  agents: false
  permissions: false
compatible_with:
  - any
YAML

# 3. Add your project context
cat > .herald/context/project.md << 'MD'
# Project Context

## Stack
- ...

## Conventions
- ...
MD
```

---

## CLI — `herald-agents`

The official CLI lives in [`herald-cli/`](./herald-cli). No install required:

```bash
npx herald-agents init        # Create .herald/ interactively
npx herald-agents compile     # Generate CLAUDE.md, .cursorrules, etc.
npx herald-agents validate    # Validate .herald/main.yaml against the spec
npx herald-agents status      # Show what's configured and what's missing
```

### `compile` targets

```bash
npx herald-agents compile all      # Every vendor file at once
npx herald-agents compile claude   # → CLAUDE.md
npx herald-agents compile cursor   # → .cursor/rules/herald.mdc
npx herald-agents compile copilot  # → .github/copilot-instructions.md
npx herald-agents compile gemini   # → GEMINI.md
npx herald-agents compile windsurf # → .windsurfrules
npx herald-agents compile agents   # → AGENTS.md
```

Write context once in `.herald/`. All vendor files stay in sync.

---

## Five layers

HERALD is additive. Start with `context/` only — add layers as your needs grow.

| Layer | Purpose | Loaded |
|-------|---------|--------|
| `context/` | What agents need to know — architecture, conventions, rules | Always |
| `skills/` | Reusable capabilities. [SKILL.md](https://agentskills.io) compatible | On activation |
| `commands/` | Named single-shot tasks, like slash commands | On invocation |
| `agents/` | Named subagents: reviewer, tester, docs-writer | On invocation |
| `permissions/` | Explicit allow/deny file access rules, committed to git | Always |

### Progressive disclosure

HERALD uses a three-tier loading strategy to keep agent context windows lean:

- **Tier 1** — Manifest + context + permission rules load at session start (~200 tokens overhead)
- **Tier 2** — Full skill/command/agent body loads when the agent determines the task matches (<5k tokens per skill)
- **Tier 3** — Reference files and assets load only when explicitly referenced by a skill (zero cost if unused)

---

## Compatibility

HERALD is designed to coexist with everything:

- ✓ Works alongside `AGENTS.md` — keep it for broad compatibility
- ✓ Compatible with `SKILL.md` ([agentskills.io](https://agentskills.io)) — use your existing skills inside `.herald/skills/`
- ✓ Complements MCP — MCP handles runtime tools, HERALD handles project configuration
- ✓ Can generate `CLAUDE.md`, `.cursorrules`, etc. on demand via `npx herald-agents compile`

See [compatibility guides →](./compatibility)

---

## Repo structure

```
herald/
├── spec/v1/               # Full specification
├── schemas/               # JSON schemas for manifest, policy, skill
├── examples/              # Real .herald/ configs for different stacks
│   ├── nextjs-fullstack/
│   ├── python-fastapi/
│   └── go-microservice/
├── herald-cli/            # npx herald-agents — init, compile, validate, status
├── compatibility/         # Guides for AGENTS.md, CLAUDE.md, SKILL.md
├── docs/                  # Getting started, for tool builders
├── install/               # install.sh bash installer
└── community/             # Roadmap
```

---

## Documentation

- [Getting Started](./docs/getting-started.md)
- [Full Specification →](./spec/v1)
- [CLI Reference →](./herald-cli/README.md)
- [Examples](./examples)
- [For Tool Builders](./docs/for-tool-builders.md)
- [JSON Schemas](./schemas)
- [Compatibility guides](./compatibility)

---

## Status

HERALD is in **draft v1.0**. The core format is stable enough to use today. We're collecting feedback before locking the spec.

[Roadmap](./community/ROADMAP.md) · [Contributing](./CONTRIBUTING.md) · [Governance](./GOVERNANCE.md)

---

## License

Spec and documentation: [CC0](./LICENSE) — public domain, no restrictions.
Reference implementations and tooling: MIT.