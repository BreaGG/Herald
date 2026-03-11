# HERALD Specification — v1.0 (Draft)

This document defines the HERALD standard for agent-ready project configuration.

---

## Table of contents

1. [Overview](#1-overview)
2. [Folder layout](#2-folder-layout)
3. [Manifest — main.yaml](#3-manifest--mainyaml)
4. [Layer: context/](#4-layer-context)
5. [Layer: skills/](#5-layer-skills)
6. [Layer: commands/](#6-layer-commands)
7. [Layer: agents/](#7-layer-agents)
8. [Layer: permissions/](#8-layer-permissions)
9. [Progressive disclosure](#9-progressive-disclosure)
10. [Conformance levels](#10-conformance-levels)
11. [Versioning](#11-versioning)

---

## 1. Overview

HERALD defines a single `.herald/` directory at the root of a project that any HERALD-compatible AI agent can read to understand the project's context, capabilities, and constraints.

**Goals:**
- One source of truth for all AI tools used in a project
- Vendor-neutral — no tool-specific syntax in the core spec
- Additive — teams adopt incrementally, starting with just `context/`
- Human-readable — plain Markdown and YAML, no binary formats
- Git-friendly — all files are text, diffs are meaningful

**Non-goals:**
- Runtime tool execution (see MCP for that)
- Replacing IDE-specific configuration
- Enforcing coding style (leave that to linters)

---

## 2. Folder layout

```
.herald/
├── main.yaml              # REQUIRED. Manifest file.
├── context/               # Optional layer. Markdown files.
│   ├── project.md         # Recommended entry point.
│   └── *.md               # Any additional context files.
├── skills/                # Optional layer.
│   └── <skill-name>/
│       ├── SKILL.md       # Required per skill. SKILL.md format.
│       └── references/    # Optional. Loaded only when referenced.
│           └── *.md
├── commands/              # Optional layer.
│   └── <command-name>.md  # One file per command.
├── agents/                # Optional layer.
│   └── <agent-name>.md    # One file per named subagent.
└── permissions/           # Optional layer.
    └── policy.yaml        # Required if layer is enabled.
```

**Rules:**
- `.herald/` MUST be at the project root (same level as `package.json`, `go.mod`, etc.)
- `main.yaml` MUST exist
- All file names MUST be lowercase with hyphens (kebab-case)
- No symlinks — all files must be real files for portability
- UTF-8 encoding required for all files

---

## 3. Manifest — main.yaml

The manifest declares the project identity and which layers are active.

### Schema

```yaml
version: "1.0"          # REQUIRED. Spec version string.

project:                 # REQUIRED block.
  name: string           # REQUIRED. Short identifier, no spaces.
  description: string    # REQUIRED. One sentence.
  framework: string      # OPTIONAL. Primary framework (nextjs, fastapi, rails...).
  language: string       # OPTIONAL. Primary language.
  repository: url        # OPTIONAL. Canonical repo URL.

layers:                  # REQUIRED block. All keys default to false.
  context: boolean       # true = .herald/context/ is active
  skills: boolean        # true = .herald/skills/ is active
  commands: boolean      # true = .herald/commands/ is active
  agents: boolean        # true = .herald/agents/ is active
  permissions: boolean   # true = .herald/permissions/ is active

compatible_with:         # OPTIONAL. List of known-compatible tools.
  - string               # Tool identifier (see Appendix A)
```

### Example

```yaml
version: "1.0"

project:
  name: my-api
  description: "REST API for managing user accounts and billing"
  framework: fastapi
  language: python
  repository: https://github.com/acme/my-api

layers:
  context: true
  skills: true
  commands: false
  agents: false
  permissions: true

compatible_with:
  - claude-code
  - cursor
  - copilot
```

---

## 4. Layer: context/

The context layer contains what agents need to **know** about the project.

### Loading behavior

All files in `context/` are loaded at session start (Tier 1). Keep total size under **8,000 tokens** to avoid bloating context windows.

### File format

Plain Markdown. No required schema. Recommended sections:

```markdown
# Project Context

## Overview
Brief description of what this project does and who uses it.

## Architecture
High-level description of the system design.

## Stack
- Language: Python 3.12
- Framework: FastAPI
- Database: PostgreSQL 16 + SQLAlchemy
- Auth: JWT via python-jose

## Conventions
- Use named exports everywhere
- All API responses use the `ApiResponse[T]` wrapper type
- Errors follow RFC 7807 Problem Details format
- No print() in production code — use structlog

## Do Not Touch
- `migrations/` — never edit manually, use alembic
- `src/generated/` — auto-generated, do not modify
- `.env.production` — never commit, never read in code
```

### Multiple context files

Split context across multiple files for large projects. Agents load all files in `context/`:

```
context/
├── project.md       # Main entry point (load first)
├── architecture.md  # Detailed system design
├── api-contracts.md # API shape and conventions
└── testing.md       # Test strategy and patterns
```

---

## 5. Layer: skills/

Skills define reusable **capabilities** agents can activate.

### SKILL.md format

Each skill lives in its own subdirectory with a `SKILL.md` file using this frontmatter schema:

```markdown
---
name: string           # REQUIRED. kebab-case identifier.
description: string    # REQUIRED. One sentence. Used for Tier 1 index.
version: "1.0"         # REQUIRED.
triggers:              # OPTIONAL. Keywords that activate this skill.
  - string
---

## When to use
<!-- Describe the conditions under which an agent should activate this skill. -->

## Instructions
<!-- Step-by-step instructions. Be explicit and ordered. -->

## References
<!-- Optional. List files from ./references/ that this skill may load. -->
<!-- Format: - references/filename.md -->
```

### Loading behavior

- **Tier 1**: Only `name` and `description` from frontmatter are indexed (~50 tokens per skill)
- **Tier 2**: Full `SKILL.md` body loads when the agent decides the task matches
- **Tier 3**: Files listed under `References` load from `./references/` only when the skill explicitly calls for them

### Example

```
skills/
└── create-component/
    ├── SKILL.md
    └── references/
        ├── component-template.tsx
        └── style-guide.md
```

```markdown
---
name: create-component
description: Generate a React component following project conventions and the design system
version: "1.0"
triggers:
  - new component
  - create component
  - add component
---

## When to use
When the user asks to create, add, or scaffold a new React component.

## Instructions
1. Ask for the component name if not provided
2. Load references/component-template.tsx as the structural base
3. Follow naming: PascalCase for the component, kebab-case for the file
4. Place in `src/components/<name>/<name>.tsx`
5. Create a co-located `<name>.test.tsx` using Vitest
6. Export from `src/components/index.ts`

## References
- references/component-template.tsx
- references/style-guide.md
```

---

## 6. Layer: commands/

Commands are named, single-shot tasks — like slash commands available in any tool.

### File format

```markdown
---
name: string           # REQUIRED. kebab-case. Used to invoke the command.
description: string    # REQUIRED. One sentence.
---

<!-- Full instructions for executing this command. -->
<!-- Use {{variable}} syntax for user-provided inputs. -->
```

### Example

```markdown
---
name: explain-error
description: Diagnose and explain an error with a suggested fix
---

You will be given an error. Explain:
1. What caused it
2. Why it happens in this codebase specifically
3. The minimal fix with a code snippet

**Error**: {{error}}
```

### Invocation

Commands are invoked by name: `explain-error`, `scaffold-migration`, etc. Agents should list available commands when the user asks what they can do.

---

## 7. Layer: agents/

Named subagents define specialized roles an agent can adopt.

### File format

```markdown
---
name: string           # REQUIRED. kebab-case.
role: string           # REQUIRED. Human-readable role title.
---

<!-- System prompt for this subagent. -->
<!-- Be explicit about tone, focus, and constraints. -->
```

### Example

```markdown
---
name: reviewer
role: Senior Code Reviewer
---

You are a senior code reviewer with 10+ years of experience.

When reviewing code:
- Focus on correctness, edge cases, and security — not style
- Flag issues by severity: critical / warning / suggestion
- Provide a concrete fix for every issue you raise
- Be direct. No filler. No praise unless genuinely warranted.
- Respect the project's conventions from .herald/context/
```

---

## 8. Layer: permissions/

The permissions layer defines explicit file access rules for agents.

### File format — policy.yaml

```yaml
version: "1.0"    # REQUIRED.

allow:             # Glob patterns agents MAY read and modify.
  - "src/**"
  - "tests/**"
  - "docs/**"

deny:              # Glob patterns agents MUST NOT touch.
  - "*.env"
  - "*.env.*"
  - "secrets/**"
  - ".git/**"
  - "migrations/**"   # Example: only humans run migrations
```

### Rules

- `deny` takes precedence over `allow` on conflicts
- Patterns follow `.gitignore` glob syntax
- A HERALD-compatible tool MUST refuse to modify any file matching a `deny` pattern
- Absence of a `permissions/` layer means no programmatic restrictions (use with caution)

---

## 9. Progressive disclosure

HERALD defines three loading tiers to keep context windows efficient:

| Tier | What loads | When | Typical cost |
|------|-----------|------|-------------|
| 1 | `main.yaml` + all `context/` files + `permissions/policy.yaml` + skill name+description index | Session start | ~200–2000 tokens |
| 2 | Full `SKILL.md` body, `commands/*.md`, `agents/*.md` | On activation / invocation | <5000 tokens each |
| 3 | Files listed in skill `References` section | When skill explicitly needs them | Zero if unused |

**Tier 1 budget**: Total size of all Tier 1 content SHOULD NOT exceed 8,000 tokens. Tools MAY warn when this limit is exceeded.

---

## 10. Conformance levels

A HERALD-compatible tool MUST implement at minimum **B1**:

| Level | Requirements |
|-------|-------------|
| **B1** | Reads `main.yaml`. Loads `context/` files at session start. |
| **B2** | B1 + Activates skills from `skills/` when task matches. |
| **B3** | B2 + Supports `commands/` invocation by name. |
| **B4** | B3 + Supports `agents/` subagent personas. |
| **B5** | B4 + Enforces `permissions/policy.yaml` on file writes. |
| **B6** | B5 + Implements Tier 3 reference file lazy loading. |

---

## 11. Versioning

- The spec version is declared in `main.yaml` as `version: "1.0"`
- Minor versions (1.1, 1.2) are backward-compatible additions
- Major versions (2.0) may introduce breaking changes
- Tools SHOULD warn (not error) when encountering an unknown version

---

## Appendix A — Tool identifiers

Use these identifiers in `compatible_with`:

| Tool | Identifier |
|------|-----------|
| Claude Code | `claude-code` |
| Cursor | `cursor` |
| GitHub Copilot | `copilot` |
| Gemini CLI | `gemini` |
| OpenAI Codex | `codex` |
| Windsurf | `windsurf` |
| Zed | `zed` |
| Roo Code | `roo-code` |
| JetBrains Junie | `junie` |
| Kiro | `kiro` |
| Trae | `trae` |
| Aider | `aider` |
| Any compatible | `any` |
