import fs from "fs";
import path from "path";
import {
  log, info, success, error, warn, dim, blank, fmt,
  findHeraldRoot, loadManifest, readContextFiles, ensureDir,
} from "../lib/utils.js";
import { VENDORS, getVendor } from "../lib/vendors.js";

export async function cmdCompile(target = "all"): Promise<void> {
  blank();

  // ── Find .herald/ ─────────────────────────────────────────────────────────
  const root = findHeraldRoot();
  if (!root) {
    error("No .herald/main.yaml found. Run: npx herald-agents init");
    process.exit(1);
  }

  // ── Load manifest ─────────────────────────────────────────────────────────
  const manifest = loadManifest(root);
  if (!manifest) {
    error("Could not parse .herald/main.yaml — run: npx herald-agents validate");
    process.exit(1);
  }

  // ── Read context ──────────────────────────────────────────────────────────
  const context = readContextFiles(root);
  if (!context) {
    warn("No context files found in .herald/context/");
    warn("Vendor files will be generated with empty context.");
  }

  // ── Determine targets ─────────────────────────────────────────────────────
  let targets = target === "all" ? VENDORS : [getVendor(target)].filter(Boolean);

  if (!targets.length) {
    error(`Unknown compile target: "${target}"`);
    blank();
    log(`  Available targets:`);
    VENDORS.forEach(v => log(`    ${fmt.accent(v.id.padEnd(10))}  ${fmt.dim(v.label)}`));
    blank();
    process.exit(1);
  }

  // If compatible_with is set and not "any", only compile relevant vendors
  const compat = manifest.compatible_with ?? ["any"];
  if (!compat.includes("any") && target === "all") {
    const vendorMap: Record<string, string> = {
      "claude-code": "claude",
      "cursor":      "cursor",
      "copilot":     "copilot",
      "gemini":      "gemini",
      "windsurf":    "windsurf",
      "roo-code":    "roo",
      "aider":       "aider",
    };
    const relevant = compat.map(t => vendorMap[t]).filter(Boolean);
    if (relevant.length) {
      targets = targets.filter(v => relevant.includes(v!.id) || v!.id === "agents");
      info(`Compiling for declared tools: ${compat.join(", ")}`);
    }
  } else {
    info(`Compiling ${target === "all" ? "all vendor files" : `"${target}"`} from .herald/`);
  }

  blank();

  // ── Generate ──────────────────────────────────────────────────────────────
  let compiled = 0;
  for (const vendor of targets) {
    if (!vendor) continue;
    try {
      const outputPath = path.join(root, vendor.outputPath);
      ensureDir(path.dirname(outputPath));
      const content = vendor.generate(manifest, context);
      fs.writeFileSync(outputPath, content);
      success(`${fmt.bold(vendor.outputPath.padEnd(46))} ${fmt.dim(vendor.label)}`);
      compiled++;
    } catch (e) {
      error(`Failed to compile ${vendor.id}: ${e}`);
    }
  }

  blank();
  log(`  ${fmt.accent("⬡")} ${fmt.bold(`${compiled} file${compiled !== 1 ? "s" : ""} compiled.`)}`);
  blank();
  dim("Tip: commit vendor files alongside .herald/ so tools that don't");
  dim("     support HERALD yet still get the right context.");
  blank();
}
