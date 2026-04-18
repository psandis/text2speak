import Database from "better-sqlite3";
import { statSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { getDbPath } from "./config.js";
import type { Generation, ListOptions } from "../types.js";

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) throw new Error("Database not initialized — call initDb() first");
  return db;
}

export function initDb(): void {
  db = new Database(getDbPath());
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(`
    CREATE TABLE IF NOT EXISTS generations (
      id          TEXT PRIMARY KEY,
      input_file  TEXT NOT NULL,
      output_file TEXT NOT NULL,
      provider    TEXT NOT NULL,
      voice       TEXT NOT NULL,
      model       TEXT NOT NULL,
      format      TEXT NOT NULL,
      speed       REAL NOT NULL,
      characters  INTEGER NOT NULL,
      created_at  TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_generations_provider ON generations(provider);
    CREATE INDEX IF NOT EXISTS idx_generations_created ON generations(created_at);
  `);
}

export function closeDb(): void {
  db?.close();
  db = null;
}

export function insertGeneration(data: Omit<Generation, "id" | "createdAt">): Generation {
  const generation: Generation = {
    id: randomUUID(),
    ...data,
    createdAt: new Date().toISOString(),
  };
  getDb()
    .prepare(
      `INSERT INTO generations (id, input_file, output_file, provider, voice, model, format, speed, characters, created_at)
       VALUES (@id, @inputFile, @outputFile, @provider, @voice, @model, @format, @speed, @characters, @createdAt)`,
    )
    .run({
      id: generation.id,
      inputFile: generation.inputFile,
      outputFile: generation.outputFile,
      provider: generation.provider,
      voice: generation.voice,
      model: generation.model,
      format: generation.format,
      speed: generation.speed,
      characters: generation.characters,
      createdAt: generation.createdAt,
    });
  return generation;
}

export function getGenerations(opts: ListOptions = {}): Generation[] {
  const conditions: string[] = [];
  const params: Record<string, unknown> = {};

  if (opts.provider) {
    conditions.push("provider = @provider");
    params.provider = opts.provider;
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const limit = opts.limit ? `LIMIT ${opts.limit}` : "";

  const rows = getDb()
    .prepare(`SELECT * FROM generations ${where} ORDER BY created_at DESC ${limit}`)
    .all(params) as Record<string, unknown>[];

  return rows.map(rowToGeneration);
}

export function getGenerationById(id: string): Generation | null {
  const row = getDb()
    .prepare("SELECT * FROM generations WHERE id = ?")
    .get(id) as Record<string, unknown> | undefined;
  return row ? rowToGeneration(row) : null;
}

export function deleteGeneration(id: string): boolean {
  const result = getDb().prepare("DELETE FROM generations WHERE id = ?").run(id);
  return result.changes > 0;
}

export function deleteAllGenerations(): number {
  const result = getDb().prepare("DELETE FROM generations").run();
  return result.changes;
}

export interface DbStats {
  count: number;
  fileSizeBytes: number;
  totalCharacters: number;
  byProvider: Record<string, number>;
  oldest: string | null;
  newest: string | null;
}

export function getDbStats(): DbStats {
  const d = getDb();
  const count = (d.prepare("SELECT COUNT(*) as n FROM generations").get() as { n: number }).n;
  const totalCharacters = (
    d.prepare("SELECT COALESCE(SUM(characters), 0) as n FROM generations").get() as { n: number }
  ).n;
  const oldest = (
    d.prepare("SELECT MIN(created_at) as v FROM generations").get() as { v: string | null }
  ).v;
  const newest = (
    d.prepare("SELECT MAX(created_at) as v FROM generations").get() as { v: string | null }
  ).v;

  const providerRows = d
    .prepare("SELECT provider, COUNT(*) as n FROM generations GROUP BY provider")
    .all() as { provider: string; n: number }[];

  const byProvider: Record<string, number> = {};
  for (const row of providerRows) byProvider[row.provider] = row.n;

  let fileSizeBytes = 0;
  try {
    fileSizeBytes = statSync(getDbPath()).size;
  } catch {
    // file may not exist yet
  }

  return { count, fileSizeBytes, totalCharacters, byProvider, oldest, newest };
}

export interface DbFileEntry {
  inputFile: string;
  count: number;
  latest: string;
}

export function getDbFileList(): DbFileEntry[] {
  const rows = getDb()
    .prepare(
      `SELECT input_file, COUNT(*) as count, MAX(created_at) as latest
       FROM generations
       GROUP BY input_file
       ORDER BY latest DESC`,
    )
    .all() as { input_file: string; count: number; latest: string }[];

  return rows.map((r) => ({ inputFile: r.input_file, count: r.count, latest: r.latest }));
}

function rowToGeneration(row: Record<string, unknown>): Generation {
  return {
    id: row.id as string,
    inputFile: row.input_file as string,
    outputFile: row.output_file as string,
    provider: row.provider as string,
    voice: row.voice as string,
    model: row.model as string,
    format: row.format as string,
    speed: row.speed as number,
    characters: row.characters as number,
    createdAt: row.created_at as string,
  };
}
