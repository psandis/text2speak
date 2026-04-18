# text2speak

[![npm](https://img.shields.io/npm/v/text2speak?style=flat-square)](https://www.npmjs.com/package/text2speak)

text2speak CLI tool. Drop text files into `input/`, run `t2s speak`, get audio in `output/`. Powered by OpenAI TTS.

## Installation

```
pnpm add -g text2speak
```

## Requirements

- Node.js 22+
- OpenAI API key

## Configuration

Create `~/.text2speak/.env` and add your API key:

```
OPENAI_API_KEY=your-key-here
```

Set default provider (OpenAI is default):

```
t2s config set provider openai
```

## How It Works

1. Put any `.txt` file in `input/`
2. Run `t2s speak`
3. Audio appears in `output/`

## Usage

### Speak

```
t2s speak
```

Processes all `.txt` files in `input/`, writes audio to `output/`.

Speak a single file:

```
t2s speak path/to/file.txt
```

### Options

```
t2s speak --voice nova
t2s speak --format wav
t2s speak --speed 1.25
t2s speak --provider openai
t2s speak --out my-audio.mp3
t2s speak --out audio/
```

### Manage history

```
t2s list
t2s show <id>
t2s export <id>
t2s delete <id>
```

### Database

```
t2s db stats
t2s db list
```

### List voices

```
t2s voices
```

## Output Formats

| Format | Description |
|--------|-------------|
| `mp3`  | MP3 (default) |
| `opus` | Opus |
| `wav`  | WAV |
| `flac` | FLAC |

## Providers

| Provider | Flag | Notes |
|----------|------|-------|
| OpenAI TTS | `--provider openai` | Default. Models: tts-1, tts-1-hd |

## Voices

| Voice | Description |
|-------|-------------|
| `alloy` | Neutral, balanced |
| `echo` | Male, clear |
| `fable` | British, expressive |
| `onyx` | Deep, authoritative |
| `nova` | Female, warm |
| `shimmer` | Female, soft |

Set default voice:

```
t2s config set voice nova
```

## Storage

History is stored locally in SQLite:

- **macOS/Linux:** `~/.text2speak/history.db`
- **macOS/Linux config:** `~/.text2speak/.env`

## Tech Stack

| Tool | Purpose |
|------|---------|
| TypeScript | Language |
| Commander | CLI framework |
| better-sqlite3 | Local history |
| OpenAI TTS API | Speech generation |
| Vitest | Testing |
| Biome | Lint & format |
| pnpm | Package manager |

## License

See MIT
