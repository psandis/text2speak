import chalk from "chalk";
import { loadConfig, saveConfig } from "../lib/config.js";
import { getProviderNames, isValidModel, isValidVoice } from "../lib/providers.js";
import type { T2SConfig } from "../types.js";

const KEY_MAP: Record<string, keyof T2SConfig> = {
  "openai.key": "openaiApiKey",
  provider: "provider",
  voice: "voice",
  model: "model",
};

export function configSet(key: string, value: string): void {
  const configKey = KEY_MAP[key];
  if (!configKey) {
    console.error(chalk.red(`Unknown config key: ${key}`));
    console.error(chalk.dim(`Valid keys: ${Object.keys(KEY_MAP).join(", ")}`));
    process.exit(1);
  }

  const config = loadConfig();

  if (key === "provider" && !getProviderNames().includes(value)) {
    console.error(chalk.red(`Unknown provider: ${value}`));
    console.error(chalk.dim(`Valid providers: ${getProviderNames().join(", ")}`));
    process.exit(1);
  }

  if (key === "voice" && !isValidVoice(config.provider, value)) {
    console.error(chalk.red(`Unknown voice: ${value}`));
    console.error(chalk.dim("Run: t2s voices"));
    process.exit(1);
  }

  if (key === "model" && !isValidModel(config.provider, value)) {
    console.error(chalk.red(`Unknown model: ${value}`));
    console.error(chalk.dim("Run: t2s config get model"));
    process.exit(1);
  }

  (config as Record<string, unknown>)[configKey] = value;
  saveConfig(config);
  console.log(chalk.green(`✓ Set ${key}`));
}

export function configGet(key?: string, json?: boolean): void {
  const config = loadConfig();

  if (json) {
    const safe = { ...config, openaiApiKey: config.openaiApiKey ? "***" : undefined };
    console.log(JSON.stringify(safe, null, 2));
    return;
  }

  if (key) {
    const configKey = KEY_MAP[key];
    if (!configKey) {
      console.error(chalk.red(`Unknown config key: ${key}`));
      process.exit(1);
    }
    const value = config[configKey];
    const isApiKey = key.endsWith(".key");
    console.log(isApiKey && value ? "***" : (value ?? chalk.dim("not set")));
    return;
  }

  console.log(chalk.dim("provider:   ") + config.provider);
  console.log(chalk.dim("voice:      ") + config.voice);
  console.log(chalk.dim("model:      ") + config.model);
  console.log(
    chalk.dim("openai.key: ") + (config.openaiApiKey ? chalk.green("set") : chalk.dim("not set")),
  );
}
