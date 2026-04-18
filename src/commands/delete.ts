import chalk from "chalk";
import { deleteAllGenerations, deleteGeneration } from "../lib/db.js";

export function remove(id: string): void {
  const deleted = deleteGeneration(id);

  if (!deleted) {
    console.error(chalk.red(`Generation not found: ${id}`));
    process.exit(1);
  }

  console.log(chalk.green(`✓ Deleted ${id}`));
}

export function removeAll(): void {
  const count = deleteAllGenerations();
  console.log(chalk.green(`✓ Deleted ${count} generation(s)`));
}
