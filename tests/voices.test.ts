import { describe, expect, it } from "vitest";
import { getVoices, isValidVoice, getProviderDefaults } from "../src/lib/providers.js";

describe("getVoices", () => {
  it("returns voices for openai provider", () => {
    const voices = getVoices("openai");
    expect(typeof voices).toBe("object");
    expect(Object.keys(voices).length).toBeGreaterThan(0);
  });

  it("has a description for each voice", () => {
    const voices = getVoices("openai");
    for (const description of Object.values(voices)) {
      expect(typeof description).toBe("string");
      expect(description.length).toBeGreaterThan(0);
    }
  });

  it("throws for unknown provider", () => {
    expect(() => getVoices("unknown")).toThrow();
  });
});

describe("isValidVoice", () => {
  it("returns true for voices defined in provider config", () => {
    const voices = getVoices("openai");
    for (const voice of Object.keys(voices)) {
      expect(isValidVoice("openai", voice)).toBe(true);
    }
  });

  it("returns false for unknown voice", () => {
    expect(isValidVoice("openai", "unknown-voice")).toBe(false);
  });
});

describe("getProviderDefaults", () => {
  it("returns defaults with voice, model and format", () => {
    const defaults = getProviderDefaults("openai");
    expect(defaults.voice).toBeTruthy();
    expect(defaults.model).toBeTruthy();
    expect(defaults.format).toBeTruthy();
  });

  it("default voice is valid for the provider", () => {
    const defaults = getProviderDefaults("openai");
    expect(isValidVoice("openai", defaults.voice)).toBe(true);
  });
});
