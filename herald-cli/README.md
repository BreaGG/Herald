# herald-agents CLI

**`npx herald-agents`** — the official CLI for [HERALD](https://github.com/BreaGG/Herald).

Init, compile, validate, and inspect your `.herald/` agent configuration.

---

## Usage

No install required:

```bash
npx herald-agents <command>
```

---

## Commands

### `herald-agents init`

Create a `.herald/` folder interactively. Detects your stack automatically.

```bash
npx herald-agents init
```

```
⬡ herald  Initializing HERALD in /your/project

  Detected: nextjs (typescript)

  Project name [my-project]
  Short description: REST API for user accounts and billing
  Framework [nextjs]
  Language [typescript]

  Layers (context/ is always included)
  Enable skills/? [y/N]
  Enable commands/? [y/N]
  Enable agents/? [y/N]
  Enable permissions/? [Y/n] y

  ⬡ Done. Your project is agent-ready.
```

---

### `herald-agents compile [target]`

Generate vendor-specific files from `.herald/`. Source of truth stays in `.herald/context/`.

```bash
npx herald-agents compile          # all vendor files
npx herald-agents compile claude   # CLAUDE.md only
npx herald-agents compile cursor   # .cursor/rules/herald.mdc
npx herald-agents compile copilot  # .github/copilot-instructions.md
```

**Available targets:** `all`, `claude`, `cursor`, `copilot`, `gemini`, `windsurf`, `roo`, `aider`, `agents`

---

### `herald-agents validate`

Validate `.herald/main.yaml` against the HERALD v1.0 spec.

```bash
npx herald-agents validate
```

```
⬡ herald  Validating /your/project/.herald

  ✓  main.yaml schema  valid
  ✓  Layer files       valid
  ✓  Context size      ~1,240 tokens

  ⬡ All checks passed.
```

---

### `herald-agents status`

Show a full picture of what's in `.herald/` and what's missing or stale.

```bash
npx herald-agents status
```

```
⬡ herald  Status for .

  Manifest
  ✓  main.yaml                         v1.0
  ✓  project.name                      my-project
  ✓  project.description               REST API for user accounts and billing

  Layers
  ✓  context/ (enabled)                2 files, ~1,240 tokens
         project.md
         architecture.md
  ⚠  skills/ (disabled)
  ⚠  commands/ (disabled)
  ⚠  agents/ (disabled)
  ✓  permissions/ (enabled)            policy.yaml found

  Vendor files
  ✓  CLAUDE.md                         up to date
  ✗  .cursor/rules/herald.mdc          run: npx herald-agents compile cursor
  ✓  AGENTS.md                         up to date
```

---

## Setup for the repo

```bash
cd cli/
npm install
npm run build
node dist/index.js help
```

## Publish

```bash
npm publish --access public
```

Users can then run: `npx herald-agents init`
