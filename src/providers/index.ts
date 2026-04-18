import { getApiKey, loadConfig } from "../lib/config.js";
import type { ProviderName } from "../types.js";
import type { TTSProvider } from "./base.js";

export async function getProvider(name?: ProviderName): Promise<TTSProvider> {
  const config = loadConfig();
  const provider = name ?? config.provider;
  const apiKey = getApiKey(provider);

  if (!apiKey) {
    throw new Error(
      `No API key for provider "${provider}". Set it with: t2s config set ${provider}.key YOUR_KEY`,
    );
  }

  switch (provider) {
    case "openai": {
      const { OpenAIProvider } = await import("./openai.js");
      return new OpenAIProvider(apiKey);
    }
    default:
      throw new Error(`Unknown provider: "${provider}". Supported: openai`);
  }
}
