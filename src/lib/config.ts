import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { getEnvKey, getProviderDefaults } from "./providers.js";
import type { T2SConfig } from "../types.js";

const DEFAULT_PROVIDER = "openai";

function buildDefaults(): T2SConfig {
  const d = getProviderDefaults(DEFAULT_PROVIDER);
  return { provider: DEFAULT_PROVIDER, voice: d.voice, model: d.model };
}

export function getDataDir(): string {
  return process.env.T2S_HOME ?? join(homedir(), ".text2speak");
}

export function getDbPath(): string {
  return join(getDataDir(), "history.db");
}

export function getExportsDir(): string {
  return join(getDataDir(), "exports");
}

export function ensureDataDir(): void {
  const dataDir = getDataDir();
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
  const exportsDir = getExportsDir();
  if (!existsSync(exportsDir)) mkdirSync(exportsDir, { recursive: true });
  loadDotEnv();
}

function loadDotEnv(): void {
  const envFile = join(getDataDir(), ".env");
  if (!existsSync(envFile)) return;
  const lines = readFileSync(envFile, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (key && !(key in process.env)) process.env[key] = value;
  }
}

export function loadConfig(): T2SConfig {
  const configFile = join(getDataDir(), "config.json");
  const defaults = buildDefaults();
  if (!existsSync(configFile)) return defaults;
  return { ...defaults, ...JSON.parse(readFileSync(configFile, "utf-8")) };
}

export function saveConfig(config: T2SConfig): void {
  ensureDataDir();
  writeFileSync(join(getDataDir(), "config.json"), `${JSON.stringify(config, null, 2)}\n`);
}

export function getApiKey(provider: string): string | undefined {
  try {
    const envKey = getEnvKey(provider);
    return envKey ? process.env[envKey] : undefined;
  } catch {
    return undefined;
  }
}
