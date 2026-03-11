import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import type { HeraldManifest } from "./types.js";

// ── Terminal colors (no chalk dependency issues with ESM) ─────────────────
export const c = {
  reset:  "\x1b[0m",
  bold:   "\x1b[1m",
  dim:    "\x1b[2m",
  amber:  "\x1b[33m",
  green:  "\x1b[32m",
  red:    "\x1b[31m",
  blue:   "\x1b[34m",
  gray:   "\x1b[90m",
  white:  "\x1b[97m",
};

export const fmt = {
  accent:  (s: string) => `${c.amber}${s}${c.reset}`,
  bold:    (s: string) => `${c.bold}${s}${c.reset}`,
  dim:     (s: string) => `${c.dim}${s}${c.reset}`,
  success: (s: string) => `${c.green}${s}${c.reset}`,
  error:   (s: string) => `${c.red}${s}${c.reset}`,
  info:    (s: string) => `${c.blue}${s}${c.reset}`,
  gray:    (s: string) => `${c.gray}${s}${c.reset}`,
};

// ── Logging helpers ────────────────────────────────────────────────────────
export function log(msg: string)         { console.log(msg); }
export function info(msg: string)        { console.log(`${c.amber}${c.bold}⬡ herald${c.reset}  ${msg}`); }
export function success(msg: string)     { console.log(`  ${c.green}✓${c.reset}  ${msg}`); }
export function warn(msg: string)        { console.log(`  ${c.amber}⚠${c.reset}  ${msg}`); }
export function error(msg: string)       { console.error(`  ${c.red}✗${c.reset}  ${msg}`); }
export function dim(msg: string)         { console.log(`  ${c.dim}${msg}${c.reset}`); }
export function blank()                  { console.log(""); }

// ── Herald detection ───────────────────────────────────────────────────────
export function findHeraldRoot(startDir = process.cwd()): string | null {
  let dir = startDir;
  while (true) {
    const candidate = path.join(dir, ".herald", "main.yaml");
    if (fs.existsSync(candidate)) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

// ── Manifest I/O ───────────────────────────────────────────────────────────
export function loadManifest(root: string): HeraldManifest | null {
  const p = path.join(root, ".herald", "main.yaml");
  if (!fs.existsSync(p)) return null;
  try {
    return yaml.load(fs.readFileSync(p, "utf8")) as HeraldManifest;
  } catch {
    return null;
  }
}

export function writeManifest(root: string, manifest: HeraldManifest): void {
  const content = [
    `version: "${manifest.version}"`,
    "",
    "project:",
    `  name: "${manifest.project.name}"`,
    `  description: "${manifest.project.description}"`,
    manifest.project.framework ? `  framework: ${manifest.project.framework}` : null,
    manifest.project.language  ? `  language: ${manifest.project.language}`   : null,
    "",
    "layers:",
    `  context: ${manifest.layers.context}`,
    `  skills: ${manifest.layers.skills}`,
    `  commands: ${manifest.layers.commands}`,
    `  agents: ${manifest.layers.agents}`,
    `  permissions: ${manifest.layers.permissions}`,
    "",
    "compatible_with:",
    ...(manifest.compatible_with ?? ["any"]).map(t => `  - ${t}`),
  ].filter(l => l !== null).join("\n");

  fs.writeFileSync(path.join(root, ".herald", "main.yaml"), content + "\n");
}

// ── Context reader ────────────────────────────────────────────────────────
export function readContextFiles(root: string): string {
  const contextDir = path.join(root, ".herald", "context");
  if (!fs.existsSync(contextDir)) return "";
  const files = fs.readdirSync(contextDir)
    .filter(f => f.endsWith(".md"))
    .sort((a, b) => a === "project.md" ? -1 : b === "project.md" ? 1 : a.localeCompare(b));
  return files
    .map(f => fs.readFileSync(path.join(contextDir, f), "utf8"))
    .join("\n\n---\n\n");
}

// ── Detect project stack ──────────────────────────────────────────────────
export function detectStack(dir = process.cwd()): { framework: string; language: string } | null {
  const has = (f: string) => fs.existsSync(path.join(dir, f));
  const read = (f: string) => has(f) ? fs.readFileSync(path.join(dir, f), "utf8") : "";

  if (has("package.json")) {
    const pkg = read("package.json");
    const lang = "typescript";
    if (pkg.includes('"next"'))    return { framework: "nextjs",   language: lang };
    if (pkg.includes('"nuxt"'))    return { framework: "nuxt",     language: lang };
    if (pkg.includes('"express"')) return { framework: "express",  language: lang };
    if (pkg.includes('"fastify"')) return { framework: "fastify",  language: lang };
    if (pkg.includes('"react"'))   return { framework: "react",    language: lang };
    return { framework: "node", language: lang };
  }
  if (has("go.mod")) {
    const mod = read("go.mod");
    if (mod.includes("google.golang.org/grpc")) return { framework: "go-grpc", language: "go" };
    if (mod.includes("gin-gonic"))              return { framework: "gin",     language: "go" };
    if (mod.includes("labstack/echo"))          return { framework: "go-echo", language: "go" };
    return { framework: "go", language: "go" };
  }
  if (has("pyproject.toml") || has("requirements.txt")) {
    const src = read("pyproject.toml") + read("requirements.txt");
    if (src.includes("fastapi"))  return { framework: "fastapi", language: "python" };
    if (src.includes("django"))   return { framework: "django",  language: "python" };
    if (src.includes("flask"))    return { framework: "flask",   language: "python" };
    return { framework: "python", language: "python" };
  }
  if (has("Cargo.toml")) return { framework: "rust", language: "rust" };
  if (has("pom.xml"))    return { framework: "spring", language: "java" };
  if (has("Gemfile"))    return { framework: "rails", language: "ruby" };
  return null;
}

// ── Ensure directory exists ───────────────────────────────────────────────
export function ensureDir(p: string): void {
  fs.mkdirSync(p, { recursive: true });
}
