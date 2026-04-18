import chalk from "chalk";
import { getGenerationById } from "../lib/db.js";

export function show(id: string, json: boolean): void {
  const generation = getGenerationById(id);

  if (!generation) {
    console.error(chalk.red(`Generation not found: ${id}`));
    process.exit(1);
  }

  if (json) {
    console.log(JSON.stringify(generation, null, 2));
    return;
  }

  console.log(chalk.dim("id:         ") + generation.id);
  console.log(chalk.dim("input:      ") + generation.inputFile);
  console.log(chalk.dim("output:     ") + generation.outputFile);
  console.log(chalk.dim("provider:   ") + generation.provider);
  console.log(chalk.dim("voice:      ") + generation.voice);
  console.log(chalk.dim("model:      ") + generation.model);
  console.log(chalk.dim("format:     ") + generation.format);
  console.log(chalk.dim("speed:      ") + generation.speed);
  console.log(chalk.dim("characters: ") + generation.characters);
  console.log(chalk.dim("created:    ") + new Date(generation.createdAt).toLocaleString());
}
