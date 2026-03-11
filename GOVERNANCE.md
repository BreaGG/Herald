# HERALD Governance

## Principles

- **Open** — The spec is CC0. Anyone can implement it.
- **Practical** — Changes are motivated by real use cases, not theory.
- **Stable** — We don't break things without very good reason.
- **Simple** — When in doubt, we do less.

## Decision making

HERALD is currently maintained by its original author(s). Decisions are made by rough consensus in GitHub issues and PRs.

For non-trivial spec changes (anything that affects how tools must behave), we follow this process:

1. **Proposal** — Open a GitHub issue with the `spec-change` label. Describe the problem and proposed solution.
2. **Discussion** — At least 7 days open for community feedback.
3. **Decision** — Maintainers decide based on discussion quality, not vote count.
4. **Implementation** — PR with spec change, schema update, and at least one example update.

## Versioning policy

- **Patch** (1.0.x) — Clarifications and editorial fixes. No behavior changes.
- **Minor** (1.x.0) — Backward-compatible additions. New optional fields, new layers.
- **Major** (x.0.0) — Breaking changes. Requires migration guide.

Tools declaring support for `version: "1.0"` MUST continue working after minor updates.

## Becoming a maintainer

Active contributors who have made multiple meaningful contributions may be invited to become maintainers. There are no formal requirements — it's based on demonstrated judgment and commitment to the project's principles.
