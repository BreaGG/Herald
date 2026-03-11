import fs from "fs";
import path from "path";
import {
  log, info, success, warn, dim, blank, fmt,
  findHeraldRoot, loadManifest,
} from "../lib/utils.js";
import { VENDORS } from "../lib/vendors.js";

const CHECK  = `${"\x1b[32m"}✓${"\x1b[0m"}`;
const CROSS  = `${"\x1b[31m"}✗${"\x1b[0m"}`;
const WARN   = `${"\x1b[33m"}⚠${"\x1b[0m"}`;

function row(label: string, ok: boolean | "warn", detail = ""): void {
  const icon = ok === "warn" ? WARN : ok ? CHECK : CROSS;
  const lbl  = label.padEnd(32);
  const det  = detail ? fmt.dim(detail) : "";
  log(`  ${icon}  ${lbl}${det}`);
}

export async function cmdStatus(): Promise<void> {
  blank();

  const root = findHeraldRoot();
  if (!root) {
    log(`  ${CROSS}  ${fmt.bold("No .herald/ found")} in this directory or any parent.`);
    blank();
    dim("Run: npx herald-agents init");
    blank();
    return;
  }

  const manifest = loadManifest(root);
  const heraldDir = path.join(root, ".herald");

  info(`Status for ${fmt.accent(root === process.cwd() ? "." : root)}`);
  blank();

  // ── Manifest ──────────────────────────────────────────────────────────────
  log(`  ${fmt.accent("Manifest")}`);
  row("main.yaml", !!manifest, manifest ? `v${manifest.version}` : "not found or invalid");
  if (manifest) {
    row("project.name",        !!manifest.project.name,        manifest.project.name);
    row("project.description", !!manifest.project.description, manifest.project.description.slice(0, 60));
    if (manifest.project.framework) row("project.framework", true, manifest.project.framework);
    row("compatible_with",     true, (manifest.compatible_with ?? ["any"]).join(", "));
  }
  blank();

  if (!manifest) {
    dim("Cannot show layer status without a valid manifest.");
    blank();
    return;
  }

  // ── Layers ────────────────────────────────────────────────────────────────
  log(`  ${fmt.accent("Layers")}`);

  // context
  {
    const enabled = manifest.layers.context;
    const ctxDir  = path.join(heraldDir, "context");
    const files   = enabled && fs.existsSync(ctxDir)
      ? fs.readdirSync(ctxDir).filter(f => f.endsWith(".md"))
      : [];
    const totalChars = files.reduce((s, f) =>
      s + fs.readFileSync(path.join(ctxDir, f), "utf8").length, 0);
    const estTokens  = Math.round(totalChars / 4);

    row(
      `context/ ${enabled ? fmt.dim("(enabled)") : fmt.dim("(disabled)")}`,
      enabled ? (files.length > 0) : "warn",
      enabled
        ? `${files.length} file${files.length !== 1 ? "s" : ""}, ~${estTokens} tokens`
        : "add context: true to enable",
    );
    if (enabled && files.length > 0) {
      for (const f of files) dim(`       ${f}`);
    }
  }

  // skills
  {
    const enabled   = manifest.layers.skills;
    const skillsDir = path.join(heraldDir, "skills");
    const skills    = enabled && fs.existsSync(skillsDir)
      ? fs.readdirSync(skillsDir).filter(f => fs.statSync(path.join(skillsDir, f)).isDirectory())
      : [];
    row(
      `skills/ ${enabled ? fmt.dim("(enabled)") : fmt.dim("(disabled)")}`,
      enabled ? true : "warn",
      enabled ? `${skills.length} skill${skills.length !== 1 ? "s" : ""}` : "",
    );
    if (enabled && skills.length > 0) {
      for (const s of skills) dim(`       ${s}/`);
    }
  }

  // commands
  {
    const enabled  = manifest.layers.commands;
    const cmdDir   = path.join(heraldDir, "commands");
    const commands = enabled && fs.existsSync(cmdDir)
      ? fs.readdirSync(cmdDir).filter(f => f.endsWith(".md"))
      : [];
    row(
      `commands/ ${enabled ? fmt.dim("(enabled)") : fmt.dim("(disabled)")}`,
      enabled ? true : "warn",
      enabled ? `${commands.length} command${commands.length !== 1 ? "s" : ""}` : "",
    );
  }

  // agents
  {
    const enabled = manifest.layers.agents;
    const agtDir  = path.join(heraldDir, "agents");
    const agents  = enabled && fs.existsSync(agtDir)
      ? fs.readdirSync(agtDir).filter(f => f.endsWith(".md"))
      : [];
    row(
      `agents/ ${enabled ? fmt.dim("(enabled)") : fmt.dim("(disabled)")}`,
      enabled ? true : "warn",
      enabled ? `${agents.length} agent${agents.length !== 1 ? "s" : ""}` : "",
    );
  }

  // permissions
  {
    const enabled    = manifest.layers.permissions;
    const policyPath = path.join(heraldDir, "permissions", "policy.yaml");
    const hasPolicy  = fs.existsSync(policyPath);
    row(
      `permissions/ ${enabled ? fmt.dim("(enabled)") : fmt.dim("(disabled)")}`,
      enabled ? hasPolicy : "warn",
      enabled ? (hasPolicy ? "policy.yaml found" : "policy.yaml missing!") : "",
    );
  }

  blank();

  // ── Vendor files ──────────────────────────────────────────────────────────
  log(`  ${fmt.accent("Vendor files")}`);
  const compat  = new Set(manifest.compatible_with ?? ["any"]);
  const showAll = compat.has("any");

  const vendorMap: Record<string, string> = {
    "claude-code": "claude",
    "cursor":      "cursor",
    "copilot":     "copilot",
    "gemini":      "gemini",
    "windsurf":    "windsurf",
    "roo-code":    "roo",
    "aider":       "aider",
  };

  for (const vendor of VENDORS) {
    const relevant = showAll || [...compat].some(t => vendorMap[t] === vendor.id) || vendor.id === "agents";
    if (!relevant) continue;

    const vendorPath = path.join(root, vendor.outputPath);
    const exists     = fs.existsSync(vendorPath);
    row(
      vendor.outputPath,
      exists,
      exists ? "up to date" : `run: npx herald-agents compile ${vendor.id}`,
    );
  }

  blank();
  dim(`Compile all:    npx herald-agents compile all`);
  dim(`Validate:       npx herald-agents validate`);
  blank();
}
