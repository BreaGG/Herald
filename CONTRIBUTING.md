# Contributing to HERALD

Thank you for your interest in contributing. HERALD is an open standard and every contribution matters — from fixing a typo to proposing a new layer.

## What we need most

- **Real-world examples** — `.herald/` configs for stacks not yet covered
- **Tool integration reports** — tested HERALD with a tool? Tell us how it went
- **Spec feedback** — anything unclear, ambiguous, or missing in the spec
- **Schema improvements** — edge cases we haven't covered in the JSON schemas

## Ways to contribute

### 1. Add an example

Add a new directory under `examples/` with a realistic `.herald/` configuration for a stack we don't cover yet. Copy the structure from an existing example.

```
examples/
└── your-stack/
    ├── README.md          # Brief description of the stack
    └── .herald/
        ├── main.yaml
        └── context/
            └── project.md
```

Open a PR with the title: `example: add <stack-name> example`

### 2. Improve the spec

The spec lives in `spec/v1/README.md`. If you find something unclear:

1. Open an issue describing the ambiguity
2. Propose your fix in a PR
3. Include a real-world scenario that motivates the change

We'll discuss it in the issue before merging.

### 3. Report a tool compatibility issue

If you've found that a HERALD-compatible tool doesn't behave as expected:

1. Open an issue with the label `tool-compat`
2. Include the tool name, version, and what you expected vs. what happened
3. Include your `main.yaml` if relevant

### 4. Fix documentation

Typos, broken links, unclear wording — all welcome. Just open a PR.

## PR guidelines

- One concern per PR
- Keep PRs small — easier to review and merge
- For spec changes: open an issue first to discuss
- Examples don't need an issue first — just send the PR

## Code of conduct

We follow the [Contributor Covenant](./CODE_OF_CONDUCT.md). Be kind. Be direct. Be constructive.
