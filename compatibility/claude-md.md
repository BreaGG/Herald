# HERALD + CLAUDE.md

HERALD can generate a `CLAUDE.md` file on demand from your `.herald/` configuration, so you never have to maintain it manually.

## Migration path

If you have an existing `CLAUDE.md`, you can migrate incrementally:

### Step 1 — Create .herald/context/project.md
Move your `CLAUDE.md` content into `.herald/context/project.md`. The format is the same (Markdown).

### Step 2 — Create .herald/main.yaml
```yaml
version: "1.0"
project:
  name: your-project
  description: "..."
layers:
  context: true
compatible_with:
  - claude-code
```

### Step 3 — Replace CLAUDE.md with a pointer
```markdown
# CLAUDE.md

This project uses HERALD for agent configuration.
Full context in `.herald/context/project.md`.

Generated from HERALD — run `herald compile claude` to regenerate.
```

## herald compile (planned)

The upcoming `herald compile` CLI command will generate vendor-specific files automatically:

```bash
herald compile claude     # generates CLAUDE.md
herald compile cursor     # generates .cursor/rules/
herald compile copilot    # generates .github/copilot-instructions.md
herald compile all        # generates all supported formats
```

This means you maintain `.herald/` once and all vendor files stay in sync.
