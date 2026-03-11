---
name: create-component
description: Generate a React component following project conventions, co-located tests, and shadcn/ui patterns
version: "1.0"
triggers:
  - new component
  - create component
  - add component
  - build component
---

## When to use
When the user asks to create, scaffold, or add a new React component to the project.

## Instructions

1. Ask for the component name if not provided. Confirm whether it's a `ui/` primitive or a `features/` component.

2. Determine if the component needs client interactivity:
   - If yes: add `"use client"` as the first line
   - If no: keep it as a Server Component (no directive needed)

3. Create the component file at `src/components/<category>/<ComponentName>.tsx`:
   - Load `references/component-template.tsx` for the structural pattern
   - Use named export: `export function ComponentName`
   - Props interface named `<ComponentName>Props`
   - Use Tailwind for all styling — no inline styles

4. Create a co-located test at `src/components/<category>/<ComponentName>.test.tsx`:
   - Load `references/test-template.tsx` for the pattern
   - Test renders without errors (smoke test)
   - Test key user interactions if it's a client component

5. If the component is a new feature component, export it from `src/components/features/index.ts`

## References
- references/component-template.tsx
- references/test-template.tsx
