import chalk from "chalk";
import { getGenerations } from "../lib/db.js";
import type { ListOptions } from "../types.js";

export function list(opts: ListOptions, json: boolean): void {
  const generations = getGenerations(opts);

  if (json) {
    console.log(JSON.stringify(generations, null, 2));
    return;
  }

  if (generations.length === 0) {
    console.log(chalk.dim("No generations found."));
    return;
  }

  for (const g of generations) {
    const date = new Date(g.createdAt).toLocaleString();
    console.log(
      `${chalk.cyan(g.id.slice(0, 8))}  ${chalk.bold(g.provider)}  ${g.voice}  ${g.format}  ${chalk.dim(date)}  ${g.inputFile}`,
    );
  }
}
