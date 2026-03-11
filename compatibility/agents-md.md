# HERALD + AGENTS.md

HERALD is fully compatible with `AGENTS.md`. They serve different purposes and work best together.

## Relationship

| | AGENTS.md | .herald/ |
|---|---|---|
| **Purpose** | Human-readable overview for any agent | Structured, layered configuration |
| **Format** | Free-form Markdown | Defined schema (YAML + Markdown) |
| **Loading** | Entire file, every time | Progressive (Tier 1 / 2 / 3) |
| **Tool support** | Universal (any tool that reads markdown) | HERALD-compatible tools |

## Recommended approach

Keep `AGENTS.md` at your repo root as a broad-compatibility fallback. Let `.herald/` carry the structured, detailed configuration.

```
your-project/
├── AGENTS.md          # Short overview, links to .herald/
└── .herald/
    ├── main.yaml
    └── context/
        └── project.md # Full detail lives here
```

### Recommended AGENTS.md content when using HERALD

```markdown
# Project Agent Guidelines

This project uses [HERALD](https://herald.sh) for structured agent configuration.

**Start here**: Read `.herald/main.yaml` for the project manifest, then `.herald/context/project.md` for full context.

## Quick reference
- Stack: TypeScript, Next.js 14, PostgreSQL
- Test command: `pnpm test`
- Lint command: `pnpm lint`
- Key convention: named exports only, no default exports

For full context, skills, and permissions → `.herald/`
```

This way:
- Tools that don't support HERALD yet still get useful guidance from `AGENTS.md`
- HERALD-compatible tools get the full structured experience from `.herald/`
