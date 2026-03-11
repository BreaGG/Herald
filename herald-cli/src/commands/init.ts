import fs from "fs";
import path from "path";
import { createInterface } from "readline";
import {
  log, info, success, warn, dim, blank, fmt,
  detectStack, ensureDir, writeManifest,
} from "../lib/utils.js";
import type { HeraldManifest } from "../lib/types.js";

// Simple readline-based prompts (no enquirer needed, works everywhere)
function prompt(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(question, answer => { rl.close(); resolve(answer.trim()); });
  });
}

async function promptYN(question: string, defaultYes = false): Promise<boolean> {
  const hint = defaultYes ? "[Y/n]" : "[y/N]";
  const answer = await prompt(`  ${question} ${fmt.dim(hint)} `);
  if (!answer) return defaultYes;
  return answer.toLowerCase().startsWith("y");
}

export async function cmdInit(): Promise<void> {
  const cwd = process.cwd();
  const heraldDir = path.join(cwd, ".herald");

  blank();
  info(`Initializing HERALD in ${fmt.accent(cwd)}`);
  blank();

  // ── Guard: already initialized ──────────────────────────────────────────
  if (fs.existsSync(path.join(heraldDir, "main.yaml"))) {
    warn(".herald/main.yaml already exists.");
    const overwrite = await promptYN("Overwrite?", false);
    if (!overwrite) { log("  Aborted."); process.exit(0); }
  }

  // ── Detect stack ─────────────────────────────────────────────────────────
  const detected = detectStack(cwd);
  if (detected) {
    log(`  ${fmt.dim("Detected:")} ${fmt.accent(detected.framework)} ${fmt.dim(`(${detected.language})`)}`);
  }

  // ── Project info ──────────────────────────────────────────────────────────
  const defaultName = path.basename(cwd).toLowerCase().replace(/\s+/g, "-");
  const nameInput = await prompt(`  Project name ${fmt.dim(`[${defaultName}]`)} `);
  const projectName = nameInput || defaultName;

  const description = await prompt("  Short description (one sentence): ");

  const frameworkInput = await prompt(
    `  Framework ${detected ? fmt.dim(`[${detected.framework}]`) : fmt.dim("[optional]")} `
  );
  const framework = frameworkInput || detected?.framework || undefined;

  const languageInput = await prompt(
    `  Language ${detected ? fmt.dim(`[${detected.language}]`) : fmt.dim("[optional]")} `
  );
  const language = languageInput || detected?.language || undefined;

  // ── Layers ────────────────────────────────────────────────────────────────
  blank();
  log(`  ${fmt.accent("Layers")} ${fmt.dim("(context/ is always included)")}`);
  blank();

  const skills      = await promptYN("Enable skills/?",      false);
  const commands    = await promptYN("Enable commands/?",    false);
  const agents      = await promptYN("Enable agents/?",      false);
  const permissions = await promptYN("Enable permissions/?", true);

  // ── Tools ─────────────────────────────────────────────────────────────────
  blank();
  log(`  ${fmt.accent("Compatible tools")} ${fmt.dim("(comma-separated, or 'any')")}`);
  const KNOWN = ["claude-code","cursor","copilot","gemini","codex","windsurf","zed","roo-code","aider","any"];
  log(`  ${fmt.dim("Available: " + KNOWN.join(", "))}`);
  const toolsInput = await prompt("  Tools [any]: ");
  const tools = toolsInput
    ? toolsInput.split(",").map(t => t.trim()).filter(Boolean)
    : ["any"];

  // ── Build manifest ────────────────────────────────────────────────────────
  const manifest: HeraldManifest = {
    version: "1.0",
    project: {
      name: projectName,
      description: description || "A software project",
      ...(framework ? { framework } : {}),
      ...(language  ? { language  } : {}),
    },
    layers: {
      context: true,
      skills,
      commands,
      agents,
      permissions,
    },
    compatible_with: tools,
  };

  // ── Write files ───────────────────────────────────────────────────────────
  blank();
  info("Creating .herald/ structure...");
  blank();

  ensureDir(path.join(heraldDir, "context"));
  if (skills)      ensureDir(path.join(heraldDir, "skills"));
  if (commands)    ensureDir(path.join(heraldDir, "commands"));
  if (agents)      ensureDir(path.join(heraldDir, "agents"));
  if (permissions) ensureDir(path.join(heraldDir, "permissions"));

  writeManifest(cwd, manifest);
  success("Created .herald/main.yaml");

  // context/project.md
  const contextPath = path.join(heraldDir, "context", "project.md");
  fs.writeFileSync(contextPath,
`# Project Context

## Overview
${description || "Describe your project here."}

## Stack
${framework ? `- Framework: ${framework}` : "- Add your tech stack here"}

## Conventions
- Add your team conventions here

## Do Not Touch
- List files agents should never modify
`);
  success("Created .herald/context/project.md");

  // permissions/policy.yaml
  if (permissions) {
    fs.writeFileSync(path.join(heraldDir, "permissions", "policy.yaml"),
`version: "1.0"

allow:
  - "src/**"
  - "tests/**"
  - "docs/**"

deny:
  - "*.env"
  - "*.env.*"
  - "secrets/**"
  - ".git/**"
`);
    success("Created .herald/permissions/policy.yaml");
  }

  // AGENTS.md
  const agentsMdPath = path.join(cwd, "AGENTS.md");
  if (!fs.existsSync(agentsMdPath)) {
    fs.writeFileSync(agentsMdPath,
`# ${projectName} — Agent Guidelines

Uses [HERALD](https://github.com/BreaGG/Herald) for agent configuration.
Full context in \`.herald/\` — start with \`.herald/main.yaml\`.
`);
    success("Created AGENTS.md");
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  blank();
  log(`  ${fmt.accent("⬡")} ${fmt.bold("Done.")} Your project is agent-ready.`);
  blank();
  dim("Next steps:");
  dim("  1. Edit .herald/context/project.md — add your real stack and conventions");
  if (permissions) dim("  2. Edit .herald/permissions/policy.yaml — set your allow/deny rules");
  dim("  3. Run: npx herald-agents compile all — generate vendor files");
  dim("  4. Commit .herald/ to git");
  blank();
}
