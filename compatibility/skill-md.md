# HERALD + SKILL.md

HERALD skills use the exact same `SKILL.md` format defined by [agentskills.io](https://agentskills.io). Any existing SKILL.md file works inside `.herald/skills/` with zero changes.

## How to use an existing skill

1. Create the skill directory: `.herald/skills/<skill-name>/`
2. Copy your `SKILL.md` into it
3. Copy any reference files into `references/`
4. Set `skills: true` in your `main.yaml`

That's it. No modifications needed.

## HERALD additions to SKILL.md

HERALD adds one optional frontmatter field not in the base SKILL.md spec:

```yaml
triggers:
  - keyword one
  - keyword two
```

`triggers` are optional hints for HERALD-compatible tools about when to auto-activate the skill. They're ignored by tools that don't support them.

## Sharing skills

Skills inside `.herald/skills/` are project-local. To share a skill across projects:

1. Publish it as a standalone `SKILL.md` to [agentskills.io](https://agentskills.io) or your own repo
2. Reference it in your `main.yaml` (skill registry support planned for v1.1)
