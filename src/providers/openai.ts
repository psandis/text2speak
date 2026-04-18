import OpenAI from "openai";
import { languageName } from "../lib/languages.js";
import { getProviderDefaults } from "../lib/providers.js";
import type { SpeakOptions } from "../types.js";
import type { TTSProvider } from "./base.js";

export class OpenAIProvider implements TTSProvider {
  private client: OpenAI;
  private defaults: ReturnType<typeof getProviderDefaults>;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
    this.defaults = getProviderDefaults("openai");
  }

  async speak(text: string, opts: SpeakOptions): Promise<Buffer> {
    const response = await this.client.audio.speech.create({
      model: (opts.model ?? this.defaults.model) as "tts-1" | "tts-1-hd",
      voice: (opts.voice ?? this.defaults.voice) as "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer",
      input: text,
      response_format: (opts.format ?? this.defaults.format) as "mp3" | "opus" | "wav" | "flac",
      speed: opts.speed ?? 1.0,
    });

    return Buffer.from(await response.arrayBuffer());
  }

  async translate(text: string, targetLang: string): Promise<string> {
    const targetName = languageName(targetLang);
    const result = await this.client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Translate the following text to ${targetName}. Return only the translated text.`,
        },
        { role: "user", content: text },
      ],
    });
    return result.choices[0]?.message.content ?? text;
  }
}
