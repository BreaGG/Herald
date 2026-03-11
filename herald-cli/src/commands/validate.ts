import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import {
  log, info, success, error, warn, dim, blank, fmt,
  findHeraldRoot,
} from "../lib/utils.js";
import type { HeraldManifest } from "../lib/types.js";

// ── Validation rules ──────────────────────────────────────────────────────
interface ValidationError { field: string; message: string; }

function validateManifest(raw: unknown): ValidationError[] {
  const errs: ValidationError[] = [];
  if (!raw || typeof raw !== "object") {
    return [{ field: "root", message: "File is not a valid YAML object" }];
  }

  const m = raw as Record<string, unknown>;

  // version
  if (!m.version) {
    errs.push({ field: "version", message: 'Missing required field "version"' });
  } else if (m.version !== "1.0") {
    errs.push({ field: "version", message: `Unknown version "${m.version}". Expected "1.0"` });
  }

  // project
  if (!m.project || typeof m.project !== "object") {
    errs.push({ field: "project", message: 'Missing required block "project"' });
  } else {
    const p = m.project as Record<string, unknown>;
    if (!p.name)        errs.push({ field: "project.name",        message: "Missing required field" });
    if (!p.description) errs.push({ field: "project.description", message: "Missing required field" });
    if (typeof p.name === "string" && /\s/.test(p.name)) {
      errs.push({ field: "project.name", message: "Name must not contain spaces (use hyphens)" });
    }
    if (typeof p.description === "string" && p.description.length > 200) {
      errs.push({ field: "project.description", message: "Description too long (max 200 chars)" });
    }
  }

  // layers
  if (!m.layers || typeof m.layers !== "object") {
    errs.push({ field: "layers", message: 'Missing required block "layers"' });
  } else {
    const l = m.layers as Record<string, unknown>;
    const keys = ["context", "skills", "commands", "agents", "permissions"];
    for (const k of keys) {
      if (k in l && typeof l[k] !== "boolean") {
        errs.push({ field: `layers.${k}`, message: "Must be true or false" });
      }
    }
  }

  // compatible_with
  if (m.compatible_with !== undefined) {
    if (!Array.isArray(m.compatible_with)) {
      errs.push({ field: "compatible_with", message: "Must be a list" });
    } else {
      const valid = ["claude-code","cursor","copilot","gemini","codex","windsurf","zed","roo-code","junie","kiro","trae","aider","firebase-studio","any"];
      for (const t of m.compatible_with) {
        if (!valid.includes(t)) {
          errs.push({ field: "compatible_with", message: `Unknown tool identifier "${t}". See spec for valid values.` });
        }
      }
    }
  }

  return errs;
}

function validateLayer(root: string, manifest: HeraldManifest): ValidationError[] {
  const errs: ValidationError[] = [];
  const heraldDir = path.join(root, ".herald");

  // context
  if (manifest.layers.context) {
    const ctxDir = path.join(heraldDir, "context");
    if (!fs.existsSync(ctxDir)) {
      errs.push({ field: "layers.context", message: ".herald/context/ directory does not exist" });
    } else {
      const files = fs.readdirSync(ctxDir).filter(f => f.endsWith(".md"));
      if (!files.length) {
        errs.push({ field: "layers.context", message: ".herald/context/ has no .md files" });
      }
    }
  }

  // permissions
  if (manifest.layers.permissions) {
    const policyPath = path.join(heraldDir, "permissions", "policy.yaml");
    if (!fs.existsSync(policyPath)) {
      errs.push({ field: "layers.permissions", message: ".herald/permissions/policy.yaml not found" });
    } else {
      try {
        const policy = yaml.load(fs.readFileSync(policyPath, "utf8")) as Record<string, unknown>;
        if (!policy.version) errs.push({ field: "permissions.version", message: "Missing version field in policy.yaml" });
        if (policy.allow && !Array.isArray(policy.allow)) errs.push({ field: "permissions.allow", message: "allow must be a list" });
        if (policy.deny  && !Array.isArray(policy.deny))  errs.push({ field: "permissions.deny",  message: "deny must be a list" });
      } catch {
        errs.push({ field: "permissions", message: "policy.yaml is not valid YAML" });
      }
    }
  }

  // skills
  if (manifest.layers.skills) {
    const skillsDir = path.join(heraldDir, "skills");
    if (fs.existsSync(skillsDir)) {
      const skills = fs.readdirSync(skillsDir).filter(f =>
        fs.statSync(path.join(skillsDir, f)).isDirectory()
      );
      for (const skill of skills) {
        const skillMd = path.join(skillsDir, skill, "SKILL.md");
        if (!fs.existsSync(skillMd)) {
          errs.push({ field: `skills/${skill}`, message: "Missing SKILL.md" });
        }
      }
    }
  }

  return errs;
}

export async function cmdValidate(): Promise<void> {
  blank();

  const root = findHeraldRoot();
  if (!root) {
    error("No .herald/main.yaml found. Run: npx herald-agents init");
    process.exit(1);
  }

  info(`Validating ${fmt.accent(path.join(root, ".herald"))}`);
  blank();

  // ── Parse YAML ────────────────────────────────────────────────────────────
  const manifestPath = path.join(root, ".herald", "main.yaml");
  let raw: unknown;
  try {
    raw = yaml.load(fs.readFileSync(manifestPath, "utf8"));
  } catch (e) {
    error(`main.yaml is not valid YAML: ${e}`);
    process.exit(1);
  }

  // ── Validate manifest schema ───────────────────────────────────────────────
  const manifestErrors = validateManifest(raw);
  if (manifestErrors.length) {
    log(`  ${fmt.error("main.yaml — schema errors:")}`);
    for (const e of manifestErrors) {
      log(`    ${fmt.dim(e.field.padEnd(28))} ${fmt.error(e.message)}`);
    }
    blank();
  } else {
    success("main.yaml schema  valid");
  }

  // ── Validate layer files ──────────────────────────────────────────────────
  if (!manifestErrors.length) {
    const manifest = raw as HeraldManifest;
    const layerErrors = validateLayer(root, manifest);
    if (layerErrors.length) {
      blank();
      log(`  ${fmt.error("Layer file errors:")}`);
      for (const e of layerErrors) {
        log(`    ${fmt.dim(e.field.padEnd(28))} ${fmt.error(e.message)}`);
      }
      blank();
    } else {
      success("Layer files       valid");
    }

    // ── Token estimate ─────────────────────────────────────────────────────
    blank();
    const ctxDir = path.join(root, ".herald", "context");
    if (fs.existsSync(ctxDir)) {
      const totalChars = fs.readdirSync(ctxDir)
        .filter(f => f.endsWith(".md"))
        .reduce((s, f) => s + fs.readFileSync(path.join(ctxDir, f), "utf8").length, 0);
      const estTokens = Math.round(totalChars / 4);
      const over = estTokens > 8000;
      const tokenStr = `~${estTokens.toLocaleString()} tokens`;
      log(`  ${over ? fmt.error("⚠") : fmt.success("✓")}  Context size      ${over ? fmt.error(tokenStr + " (exceeds 8k Tier 1 budget)") : fmt.dim(tokenStr)}`);
    }

    if (!manifestErrors.length && !layerErrors.length) {
      blank();
      log(`  ${fmt.accent("⬡")} ${fmt.bold("All checks passed.")}`);
    } else {
      blank();
      log(`  ${fmt.error("✗")} ${fmt.bold("Validation failed.")} Fix the errors above and re-run.`);
      process.exit(1);
    }
  } else {
    log(`  ${fmt.error("✗")} ${fmt.bold("Validation failed.")}`);
    process.exit(1);
  }

  blank();
}
