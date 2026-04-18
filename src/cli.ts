import { Command } from "commander";
import chalk from "chalk";
import { closeDb, initDb } from "./lib/db.js";
import { ensureDataDir, getApiKey, loadConfig } from "./lib/config.js";
import pkg from "../package.json" with { type: "json" };

const { version } = pkg;

function checkSetup(): void {
  const config = loadConfig();
  const key = getApiKey(config.provider);
  if (!key) {
    console.error(chalk.red("No API key configured."));
    console.error("");
    console.error(chalk.bold("Quick setup:"));
    console.error(chalk.dim("  1. Create ~/.text2speak/.env"));
    console.error(chalk.dim("  2. Add: OPENAI_API_KEY=your-key-here"));
    console.error("");
    console.error(chalk.dim("Get a key at: https://platform.openai.com/api-keys"));
    process.exit(1);
  }
}

const program = new Command();

program
  .name("t2s")
  .description("text2speak CLI. Convert text files to audio using OpenAI TTS.")
  .version(version);

program
  .command("speak [file]")
  .description("Speak a file, or all .txt files in input/ if no file given")
  .option("--provider <name>", "Provider to use: openai")
  .option("--voice <name>", "Voice to use: alloy, echo, fable, onyx, nova, shimmer")
  .option("--model <name>", "Model to use: tts-1, tts-1-hd (default: tts-1)")
  .option("--format <fmt>", "Output format: mp3, opus, wav, flac (default: mp3)")
  .option("--speed <n>", "Speed: 0.25 to 4.0 (default: 1.0)", parseFloat)
  .option("--translate <lang>", "Translate text to language code before speaking, e.g. en, fi, sv")
  .option("--out <dir>", "Output directory (default: ./output)")
  .action(async (file, opts) => {
    const { speak } = await import("./commands/speak.js");
    if (opts.translate) {
      const { isValidLanguage } = await import("./lib/languages.js");
      if (!isValidLanguage(opts.translate)) {
        console.error(chalk.red(`Unknown language code: "${opts.translate}"`));
        console.error(chalk.dim("Run: t2s languages"));
        process.exit(1);
      }
    }
    ensureDataDir();
    checkSetup();
    initDb();
    try {
      await speak(file, {
        provider: opts.provider,
        voice: opts.voice,
        model: opts.model,
        format: opts.format,
        speed: opts.speed,
        translate: opts.translate,
        out: opts.out,
      });
    } finally {
      closeDb();
    }
  });

program
  .command("list")
  .description("List stored generations")
  .option("--provider <name>", "Filter by provider")
  .option("--limit <n>", "Max results", parseInt)
  .option("--json", "Output as JSON")
  .action(async (opts) => {
    const { list } = await import("./commands/list.js");
    ensureDataDir();
    initDb();
    try {
      list({ provider: opts.provider, limit: opts.limit }, !!opts.json);
    } finally {
      closeDb();
    }
  });

program
  .command("show <id>")
  .description("Show a stored generation")
  .option("--json", "Output as JSON")
  .action(async (id, opts) => {
    const { show } = await import("./commands/show.js");
    ensureDataDir();
    initDb();
    try {
      show(id, !!opts.json);
    } finally {
      closeDb();
    }
  });

program
  .command("export <id>")
  .description("Export a generated audio file")
  .option("--out <path>", "Output file path")
  .action(async (id, opts) => {
    const { exportGeneration } = await import("./commands/export.js");
    ensureDataDir();
    initDb();
    try {
      exportGeneration(id, { out: opts.out });
    } finally {
      closeDb();
    }
  });

program
  .command("delete [id]")
  .description("Delete a stored generation, or all with --all")
  .option("--all", "Delete all generations")
  .action(async (id, opts) => {
    const { remove, removeAll } = await import("./commands/delete.js");
    ensureDataDir();
    initDb();
    try {
      if (opts.all) {
        removeAll();
      } else if (id) {
        remove(id);
      } else {
        console.error(chalk.red("Provide an id or use --all"));
        process.exit(1);
      }
    } finally {
      closeDb();
    }
  });

program
  .command("voices")
  .description("List available voices")
  .option("--json", "Output as JSON")
  .action(async (opts) => {
    const { voices } = await import("./commands/voices.js");
    voices(!!opts.json);
  });

program
  .command("languages")
  .description("List supported language codes for --translate")
  .option("--json", "Output as JSON")
  .action(async (opts) => {
    const { LANGUAGES } = await import("./lib/languages.js");
    if (opts.json) {
      console.log(JSON.stringify(LANGUAGES, null, 2));
    } else {
      for (const [code, name] of Object.entries(LANGUAGES).sort((a, b) => a[1].localeCompare(b[1]))) {
        console.log(`${chalk.cyan(code.padEnd(6))} ${name}`);
      }
    }
  });

const config = program.command("config").description("Manage configuration");

config
  .command("set <key> <value>")
  .description("Set a config value (openai.key, provider, voice, model)")
  .action(async (key, value) => {
    const { configSet } = await import("./commands/config.js");
    ensureDataDir();
    configSet(key, value);
  });

config
  .command("get [key]")
  .description("Show config value(s)")
  .option("--json", "Output as JSON")
  .action(async (key, opts) => {
    const { configGet } = await import("./commands/config.js");
    ensureDataDir();
    configGet(key, !!opts.json);
  });

const db = program.command("db").description("Database utilities");

db.command("stats")
  .description("Show database statistics")
  .option("--json", "Output as JSON")
  .action(async (opts) => {
    const { dbStats } = await import("./commands/db.js");
    ensureDataDir();
    initDb();
    try {
      dbStats(!!opts.json);
    } finally {
      closeDb();
    }
  });

db.command("list")
  .description("List source files with generation counts")
  .option("--json", "Output as JSON")
  .action(async (opts) => {
    const { dbList } = await import("./commands/db.js");
    ensureDataDir();
    initDb();
    try {
      dbList(!!opts.json);
    } finally {
      closeDb();
    }
  });

program.parse();
