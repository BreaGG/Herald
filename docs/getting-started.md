# Getting Started with HERALD

This guide gets you from zero to a working `.herald/` folder in under five minutes.

## Option 1 — Interactive generator (fastest)

Go to [herald.sh](https://herald.sh), answer a few questions, and download a ZIP. Drop the contents into your project root and commit.

## Option 2 — Install script

Run this from your project root:

```bash
curl -sSL https://raw.githubusercontent.com/yourusername/herald/main/install/install.sh | bash
```

The script detects your stack, asks a few questions, and creates the folder structure for you.

## Option 3 — Manual (5 steps)

### 1. Create the folder

```bash
mkdir -p .herald/context
```

### 2. Create the manifest

```bash
cat > .herald/main.yaml << 'YAML'
version: "1.0"

project:
  name: my-project
  description: "What this project does in one sentence"

layers:
  context: true
  skills: false
  commands: false
  agents: false
  permissions: false

compatible_with:
  - any
YAML
```

### 3. Write your project context

```bash
cat > .herald/context/project.md << 'MD'
# Project Context

## Overview
What this project does and who uses it.

## Stack
- Language: TypeScript
- Framework: Next.js 14
- Database: PostgreSQL

## Conventions
- Named exports only
- Zod for all validation

## Do Not Touch
- prisma/migrations/ — never edit manually
MD
```

### 4. Add a root AGENTS.md (recommended)

```bash
cat > AGENTS.md << 'MD'
# my-project — Agent Guidelines

Uses HERALD for agent configuration. Start with `.herald/main.yaml`.
MD
```

### 5. Commit everything

```bash
git add .herald/ AGENTS.md
git commit -m "feat: add HERALD agent configuration"
```

## What to add next

Once the basics are working:

- **skills/** — Add reusable capabilities. See [spec/v1](../spec/v1/README.md#5-layer-skills) and [examples](../examples/).
- **permissions/** — Lock down which files agents can touch. See [spec/v1](../spec/v1/README.md#8-layer-permissions).
- **commands/** — Add named tasks for common operations.

## Validation

Validate your `main.yaml` against the JSON schema:

```bash
# Using ajv-cli
npx ajv validate -s https://herald.sh/schemas/v1/manifest.json -d .herald/main.yaml

# Using check-jsonschema
pipx run check-jsonschema --schemafile schemas/manifest.schema.json .herald/main.yaml
```
