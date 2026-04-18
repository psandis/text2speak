import type { SpeakOptions } from "../types.js";

export interface TTSProvider {
  speak(text: string, opts: SpeakOptions): Promise<Buffer>;
}
