# HERALD for Tool Builders

This guide explains how to add HERALD support to an AI coding tool, IDE extension, or agent framework.

## Minimum viable implementation (B1)

To claim HERALD B1 compatibility, your tool must:

1. **Detect** `.herald/main.yaml` at the project root on session start
2. **Parse** the manifest YAML and validate the `version` field
3. **Load** all files in `.herald/context/` and include them in the agent's context
4. **Load** `permissions/policy.yaml` if `layers.permissions: true`

That's it for B1. A user with just `context/` and `permissions/` gets full value.

## Detection algorithm

```
1. Walk up from current working directory
2. At each level, check for .herald/main.yaml
3. Stop at the first match or at the filesystem root
4. If found: load HERALD config
5. If not found: proceed without HERALD (don't error)
```

## Loading order (Tier 1)

On session start, load in this order:

1. `.herald/main.yaml` — parse and validate
2. `.herald/context/*.md` — all files, alphabetical order (but `project.md` first if present)
3. `.herald/permissions/policy.yaml` — if `layers.permissions: true`
4. Skill index — for each skill in `.herald/skills/*/SKILL.md`: extract `name` and `description` from frontmatter only

Present all Tier 1 content to the model before the first user message.

## Skill activation (B2)

When `layers.skills: true`:

- Include the skill index (name + description for each skill) in Tier 1 context
- When the model determines a task matches a skill (by description or triggers), load the full `SKILL.md` body
- Do not load `references/` files proactively — wait until the skill instructions reference them

## Permissions enforcement (B5)

When `layers.permissions: true` and the agent proposes a file write:

1. Check the target path against `deny` patterns (glob match, `.gitignore` syntax)
2. If matched: **refuse** the write and explain to the user that the file is protected by HERALD policy
3. Optionally check `allow` patterns — if defined and path doesn't match, warn but don't block (allow is advisory in B5)

## Error handling

- If `main.yaml` is malformed YAML: warn the user, do not crash
- If `version` is unrecognized: warn the user, attempt to load anyway
- If a skill's `SKILL.md` is malformed: skip that skill, warn the user
- Never silently fail — always surface HERALD loading issues

## Declaring compatibility

Add your tool to the `compatible_with` list values in `schemas/manifest.schema.json` via a PR. Use a stable, lowercase, hyphenated identifier.

## Questions?

Open an issue with the `tool-integration` label. We're happy to help.
