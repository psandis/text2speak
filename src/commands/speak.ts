import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";
import chalk from "chalk";
import { insertGeneration } from "../lib/db.js";
import { getApiKey, loadConfig } from "../lib/config.js";
import { getProviderDefaults } from "../lib/providers.js";
import { getProvider } from "../providers/index.js";
import { OpenAIProvider } from "../providers/openai.js";
import type { SpeakOptions } from "../types.js";

function resolveInputFiles(file?: string): string[] {
  if (file) return [resolve(file)];

  const inputDir = resolve("input");
  try {
    return readdirSync(inputDir)
      .filter((f) => extname(f).toLowerCase() === ".txt")
      .map((f) => join(inputDir, f));
  } catch {
    throw new Error(`No file specified and input/ directory not found at ${inputDir}`);
  }
}

function resolveOutFile(absPath: string, format: string, out?: string): string {
  if (!out) {
    const outDir = resolve("output");
    mkdirSync(outDir, { recursive: true });
    return join(outDir, `${basename(absPath, extname(absPath))}.${format}`);
  }
  const resolved = resolve(out);
  const isDir =
    out.endsWith("/") ||
    (() => {
      try {
        return statSync(resolved).isDirectory();
      } catch {
        return false;
      }
    })();
  return isDir ? join(resolved, `${basename(absPath, extname(absPath))}.${format}`) : resolved;
}

function resolveTranslatedTextFile(absPath: string, out?: string): string {
  if (!out) return join(resolve("output"), `${basename(absPath, extname(absPath))}.txt`);
  const resolved = resolve(out);
  const isDir =
    out.endsWith("/") ||
    (() => {
      try {
        return statSync(resolved).isDirectory();
      } catch {
        return false;
      }
    })();
  return isDir ? join(resolved, `${basename(absPath, extname(absPath))}.txt`) : resolved;
}

async function speakFile(absPath: string, opts: SpeakOptions): Promise<void> {
  const config = loadConfig();
  const defaults = getProviderDefaults(opts.provider ?? config.provider);
  const provider = await getProvider(opts.provider);
  const format = opts.format ?? defaults.format;
  const voice = opts.voice ?? config.voice;
  const model = opts.model ?? config.model;
  const speed = opts.speed ?? 1.0;

  const text = readFileSync(absPath, "utf-8").trim();
  const characters = text.length;

  process.stdout.write(chalk.dim(`  ${basename(absPath)} - generating...`));

  let inputText = text;

  if (opts.translate) {
    const apiKey = getApiKey(opts.provider ?? config.provider);
    if (!apiKey) throw new Error("No API key configured.");
    const openai = new OpenAIProvider(apiKey);
    inputText = await openai.translate(text, opts.translate);

    const translatedTextFile = resolveTranslatedTextFile(absPath, opts.out);
    writeFileSync(translatedTextFile, inputText, "utf-8");
    process.stdout.write("\n");
    console.log(chalk.dim(`  ↳ translated text: ${translatedTextFile}`));
    process.stdout.write(chalk.dim(`  ${basename(absPath)} - speaking...`));
  }

  const audioBuffer = await provider.speak(inputText, { ...opts, voice, model, format, speed });

  const outFile = resolveOutFile(absPath, format, opts.out);
  writeFileSync(outFile, audioBuffer);

  const generation = insertGeneration({
    inputFile: absPath,
    outputFile: outFile,
    provider: opts.provider ?? config.provider,
    voice,
    model,
    format,
    speed,
    characters,
  });

  process.stdout.write("\n");
  console.log(chalk.green(`  ✓ ${outFile}`) + chalk.dim(` [${generation.id.slice(0, 8)}]`));
}

export async function speak(file: string | undefined, opts: SpeakOptions): Promise<void> {
  const files = resolveInputFiles(file);

  if (files.length === 0) {
    console.log(chalk.dim("No .txt files found in input/"));
    return;
  }

  console.log(chalk.bold(`Speaking ${files.length} file(s)...`));

  for (const f of files) {
    await speakFile(f, opts);
  }

  console.log(chalk.bold(`\nDone.`));
}
