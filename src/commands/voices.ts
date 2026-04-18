import chalk from "chalk";
import { getVoices } from "../lib/providers.js";
import { loadConfig } from "../lib/config.js";

export function voices(json: boolean): void {
  const config = loadConfig();
  const voiceList = getVoices(config.provider);

  if (json) {
    console.log(JSON.stringify(voiceList, null, 2));
    return;
  }

  for (const [name, description] of Object.entries(voiceList)) {
    console.log(`${chalk.cyan(name.padEnd(10))} ${description}`);
  }
}
