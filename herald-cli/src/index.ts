#!/usr/bin/env node
import { cmdInit }     from "./commands/init.js";
import { cmdCompile }  from "./commands/compile.js";
import { cmdValidate } from "./commands/validate.js";
import { cmdStatus }   from "./commands/status.js";
import { log, blank, fmt, c } from "./lib/utils.js";

const VERSION = "1.0.0";

function printHelp(): void {
  blank();
  log(`  ${c.amber}${c.bold}⬡ herald${c.reset}  ${c.dim}v${VERSION} — One context. Every agent.${c.reset}`);
  blank();
  log(`  ${fmt.bold("Usage:")}  npx herald-agents <command> [options]`);
  blank();
  log(`  ${fmt.accent("Commands:")}`);
  log(`    ${fmt.bold("init")}              Create .herald/ interactively`);
  log(`    ${fmt.bold("compile")} [target]  Generate vendor files from .herald/`);
  log(`    ${fmt.bold("validate")}          Validate .herald/main.yaml against the spec`);
  log(`    ${fmt.bold("status")}            Show what's in .herald/ and what's missing`);
  log(`    ${fmt.bold("help")}              Show this message`);
  blank();
  log(`  ${fmt.accent("Compile targets:")}`);
  log(`    ${fmt.dim("all")}               All vendor files ${fmt.dim("(default)")}`);
  log(`    ${fmt.dim("claude")}            CLAUDE.md`);
  log(`    ${fmt.dim("cursor")}            .cursor/rules/herald.mdc`);
  log(`    ${fmt.dim("copilot")}           .github/copilot-instructions.md`);
  log(`    ${fmt.dim("gemini")}            GEMINI.md`);
  log(`    ${fmt.dim("windsurf")}          .windsurfrules`);
  log(`    ${fmt.dim("roo")}               .clinerules`);
  log(`    ${fmt.dim("aider")}             CONVENTIONS.md`);
  log(`    ${fmt.dim("agents")}            AGENTS.md`);
  blank();
  log(`  ${fmt.accent("Examples:")}`);
  log(`    ${fmt.dim("npx herald-agents init")}`);
  log(`    ${fmt.dim("npx herald-agents compile")}`);
  log(`    ${fmt.dim("npx herald-agents compile claude")}`);
  log(`    ${fmt.dim("npx herald-agents status")}`);
  blank();
  log(`  ${fmt.dim("Docs: https://github.com/BreaGG/Herald")}`);
  blank();
}

async function main(): Promise<void> {
  const [,, cmd, ...args] = process.argv;

  switch (cmd) {
    case "init":
      await cmdInit();
      break;
    case "compile":
      await cmdCompile(args[0] ?? "all");
      break;
    case "validate":
      await cmdValidate();
      break;
    case "status":
      await cmdStatus();
      break;
    case "help":
    case "--help":
    case "-h":
    case undefined:
      printHelp();
      break;
    default:
      blank();
      log(`  ${fmt.error(`Unknown command: "${cmd}"`)}  Run ${fmt.dim("npx herald-agents help")} for usage.`);
      blank();
      process.exit(1);
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
