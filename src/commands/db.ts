import chalk from "chalk";
import { getDbFileList, getDbStats } from "../lib/db.js";

export function dbStats(json: boolean): void {
  const stats = getDbStats();

  if (json) {
    console.log(JSON.stringify(stats, null, 2));
    return;
  }

  const mb = (stats.fileSizeBytes / 1024 / 1024).toFixed(2);
  console.log(chalk.dim("generations:  ") + stats.count);
  console.log(chalk.dim("characters:   ") + stats.totalCharacters.toLocaleString());
  console.log(chalk.dim("db size:      ") + `${mb} MB`);
  console.log(chalk.dim("oldest:       ") + (stats.oldest ? new Date(stats.oldest).toLocaleString() : "—"));
  console.log(chalk.dim("newest:       ") + (stats.newest ? new Date(stats.newest).toLocaleString() : "—"));

  if (Object.keys(stats.byProvider).length > 0) {
    console.log();
    console.log(chalk.bold("By provider:"));
    for (const [provider, count] of Object.entries(stats.byProvider)) {
      console.log(`  ${chalk.cyan(provider.padEnd(10))} ${count}`);
    }
  }
}

export function dbList(json: boolean): void {
  const files = getDbFileList();

  if (json) {
    console.log(JSON.stringify(files, null, 2));
    return;
  }

  if (files.length === 0) {
    console.log(chalk.dim("No generations found."));
    return;
  }

  for (const entry of files) {
    const date = new Date(entry.latest).toLocaleString();
    console.log(
      `${chalk.cyan(String(entry.count).padStart(4))}  ${chalk.dim(date)}  ${entry.inputFile}`,
    );
  }
}
