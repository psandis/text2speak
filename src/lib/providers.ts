import data from "../data/providers.json" with { type: "json" };

interface ProviderConfig {
  envKey: string;
  defaultModel: string;
  defaultVoice: string;
  defaultFormat: string;
  models: string[];
  formats: string[];
  voices: Record<string, string>;
}

const providers = data as Record<string, ProviderConfig>;

export function getProviderConfig(provider: string): ProviderConfig {
  const config = providers[provider];
  if (!config) throw new Error(`Unknown provider: "${provider}". Supported: ${getProviderNames().join(", ")}`);
  return config;
}

export function getProviderNames(): string[] {
  return Object.keys(providers);
}

export function getVoices(provider: string): Record<string, string> {
  return getProviderConfig(provider).voices;
}

export function isValidVoice(provider: string, voice: string): boolean {
  return voice in getProviderConfig(provider).voices;
}

export function isValidModel(provider: string, model: string): boolean {
  return getProviderConfig(provider).models.includes(model);
}

export function isValidFormat(provider: string, format: string): boolean {
  return getProviderConfig(provider).formats.includes(format);
}

export function getEnvKey(provider: string): string {
  return getProviderConfig(provider).envKey;
}

export function getProviderDefaults(provider: string): { model: string; voice: string; format: string } {
  const config = getProviderConfig(provider);
  return { model: config.defaultModel, voice: config.defaultVoice, format: config.defaultFormat };
}
