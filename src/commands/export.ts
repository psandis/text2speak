import { copyFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import chalk from "chalk";
import { getExportsDir } from "../lib/config.js";
import { getGenerationById } from "../lib/db.js";
import type { ExportOptions } from "../types.js";

export function exportGeneration(id: string, opts: ExportOptions): void {
  const generation = getGenerationById(id);

  if (!generation) {
    console.error(chalk.red(`Generation not found: ${id}`));
    process.exit(1);
  }

  const outFile = opts.out
    ? resolve(opts.out)
    : join(getExportsDir(), basename(generation.outputFile));

  copyFileSync(generation.outputFile, outFile);
  console.log(chalk.green(`✓ Exported to ${outFile}`));
}
