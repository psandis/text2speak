import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  getApiKey,
  getDataDir,
  getDbPath,
  getExportsDir,
  loadConfig,
  saveConfig,
} from "../src/lib/config.js";

let tmpDir: string;

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), "text2speak-test-"));
  process.env.T2S_HOME = tmpDir;
  delete process.env.OPENAI_API_KEY;
});

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true });
  delete process.env.T2S_HOME;
  delete process.env.OPENAI_API_KEY;
});

describe("getDataDir", () => {
  it("returns T2S_HOME when set", () => {
    expect(getDataDir()).toBe(tmpDir);
  });

  it("changes when env var changes", () => {
    const other = mkdtempSync(join(tmpdir(), "text2speak-test-"));
    process.env.T2S_HOME = other;
    expect(getDataDir()).toBe(other);
    rmSync(other, { recursive: true, force: true });
  });
});

describe("getDbPath", () => {
  it("returns history.db inside data dir", () => {
    expect(getDbPath()).toBe(join(tmpDir, "history.db"));
  });
});

describe("getExportsDir", () => {
  it("returns exports dir inside data dir", () => {
    expect(getExportsDir()).toBe(join(tmpDir, "exports"));
  });
});

describe("loadConfig", () => {
  it("returns defaults when no config file exists", () => {
    const config = loadConfig();
    expect(config.provider).toBe("openai");
    expect(config.voice).toBeTruthy();
    expect(config.model).toBeTruthy();
  });

  it("merges saved values over defaults", () => {
    const base = loadConfig();
    saveConfig({ ...base, voice: "nova", model: "tts-1-hd" });
    const config = loadConfig();
    expect(config.voice).toBe("nova");
    expect(config.model).toBe("tts-1-hd");
  });
});

describe("saveConfig", () => {
  it("persists config that can be reloaded", () => {
    const base = loadConfig();
    saveConfig({ ...base, openaiApiKey: "test-api-key" });
    const config = loadConfig();
    expect(config.openaiApiKey).toBe("test-api-key");
  });

  it("creates data dir if it does not exist", () => {
    const nested = join(tmpDir, "nested");
    process.env.T2S_HOME = nested;
    const base = loadConfig();
    saveConfig(base);
    expect(loadConfig().provider).toBe("openai");
    rmSync(nested, { recursive: true, force: true });
  });
});

describe("getApiKey", () => {
  it("returns openai key from env", () => {
    process.env.OPENAI_API_KEY = "test-api-key";
    expect(getApiKey("openai")).toBe("test-api-key");
  });

  it("returns undefined when key not set", () => {
    expect(getApiKey("openai")).toBeUndefined();
  });

  it("returns undefined for unknown provider", () => {
    expect(getApiKey("unknown")).toBeUndefined();
  });
});

describe("loadDotEnv", () => {
  it("loads key from .env file in data dir", async () => {
    writeFileSync(join(tmpDir, ".env"), "OPENAI_API_KEY=test-api-key\n");
    const { ensureDataDir } = await import("../src/lib/config.js");
    ensureDataDir();
    expect(process.env.OPENAI_API_KEY).toBe("test-api-key");
  });
});
