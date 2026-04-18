import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  closeDb,
  deleteAllGenerations,
  deleteGeneration,
  getGenerationById,
  getGenerations,
  initDb,
  insertGeneration,
} from "../src/lib/db.js";
import type { Generation } from "../src/types.js";

let tmpDir: string;

const makeGeneration = (
  overrides: Partial<Omit<Generation, "id" | "createdAt">> = {},
): Omit<Generation, "id" | "createdAt"> => ({
  inputFile: "/tmp/test.txt",
  outputFile: "/tmp/test.mp3",
  provider: "openai",
  voice: "alloy",
  model: "tts-1",
  format: "mp3",
  speed: 1.0,
  characters: 42,
  ...overrides,
});

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), "text2speak-test-"));
  process.env.T2S_HOME = tmpDir;
  initDb();
});

afterEach(() => {
  closeDb();
  rmSync(tmpDir, { recursive: true, force: true });
  delete process.env.T2S_HOME;
});

describe("insertGeneration", () => {
  it("inserts and returns generation with id and createdAt", () => {
    const g = insertGeneration(makeGeneration());
    expect(g.id).toBeTruthy();
    expect(g.createdAt).toBeTruthy();
    expect(g.characters).toBe(42);
  });

  it("stores all fields correctly", () => {
    const g = insertGeneration(makeGeneration({ voice: "nova", format: "wav", model: "tts-1-hd" }));
    const found = getGenerationById(g.id);
    expect(found?.voice).toBe("nova");
    expect(found?.format).toBe("wav");
    expect(found?.model).toBe("tts-1-hd");
  });

  it("stores speed correctly", () => {
    const g = insertGeneration(makeGeneration({ speed: 1.5 }));
    const found = getGenerationById(g.id);
    expect(found?.speed).toBe(1.5);
  });
});

describe("getGenerationById", () => {
  it("returns null for unknown id", () => {
    expect(getGenerationById("nonexistent")).toBeNull();
  });

  it("returns generation by id", () => {
    const g = insertGeneration(makeGeneration());
    const found = getGenerationById(g.id);
    expect(found?.id).toBe(g.id);
  });
});

describe("getGenerations", () => {
  beforeEach(() => {
    insertGeneration(makeGeneration({ inputFile: "/tmp/a.txt" }));
    insertGeneration(makeGeneration({ inputFile: "/tmp/b.txt" }));
    insertGeneration(makeGeneration({ inputFile: "/tmp/c.txt" }));
  });

  it("returns all generations with no filter", () => {
    expect(getGenerations()).toHaveLength(3);
  });

  it("respects limit", () => {
    expect(getGenerations({ limit: 2 })).toHaveLength(2);
  });

  it("returns results ordered by created_at desc", () => {
    const results = getGenerations();
    const dates = results.map((g) => g.createdAt);
    expect(dates).toEqual([...dates].sort().reverse());
  });
});

describe("deleteGeneration", () => {
  it("deletes an existing generation", () => {
    const g = insertGeneration(makeGeneration());
    expect(deleteGeneration(g.id)).toBe(true);
    expect(getGenerationById(g.id)).toBeNull();
  });

  it("returns false for unknown id", () => {
    expect(deleteGeneration("nonexistent")).toBe(false);
  });
});

describe("deleteAllGenerations", () => {
  it("deletes all generations and returns count", () => {
    insertGeneration(makeGeneration());
    insertGeneration(makeGeneration());
    const count = deleteAllGenerations();
    expect(count).toBe(2);
    expect(getGenerations()).toHaveLength(0);
  });
});
