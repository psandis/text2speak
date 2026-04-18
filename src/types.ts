export type ProviderName = string;

export interface Generation {
  id: string;
  inputFile: string;
  outputFile: string;
  provider: string;
  voice: string;
  model: string;
  format: string;
  speed: number;
  characters: number;
  createdAt: string;
}

export interface SpeakOptions {
  provider?: string;
  voice?: string;
  model?: string;
  format?: string;
  speed?: number;
  translate?: string;
  out?: string;
}

export interface ListOptions {
  provider?: string;
  limit?: number;
}

export interface ExportOptions {
  out?: string;
}

export interface T2SConfig {
  provider: string;
  voice: string;
  model: string;
  openaiApiKey?: string;
}
