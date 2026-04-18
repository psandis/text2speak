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

Set default voice:

```
t2s config set voice nova
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

```
$ t2s speak input/hello.txt
Speaking 1 file(s)...
  hello.txt - generating...
  ✓ output/hello.mp3 [39c2d44f]

Done.
```

Speak a single file:

```
t2s speak path/to/file.txt
```

### Options

```
t2s speak --voice nova
t2s speak --format wav
t2s speak --speed 1.25
t2s speak --model tts-1-hd
t2s speak --provider openai
t2s speak --out my-audio.mp3
t2s speak --out audio/
```

### Translation

```
t2s speak --translate en
t2s speak --translate fi
t2s speak --translate sv
```

`--translate en` translates the input text to English before generating audio.

`--translate <other>` translates to any supported language, then generates audio.

Translation requires OpenAI provider.

**Example — Finnish text to English audio:**

```
$ t2s speak input/finnish.txt --translate en
Speaking 1 file(s)...
  finnish.txt - generating...
  ↳ translated text: output/finnish.txt
  finnish.txt - speaking...
  ✓ output/finnish.mp3 [94cb030d]

Done.
```

Translated text output:
```
Good day. This is a Finnish test file. Welcome to use the text2speak tool.
```

### Manage history

```
t2s list
t2s show <id>
t2s export <id>
t2s delete <id>
t2s delete --all
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

### List supported languages

```
t2s languages
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

Run `t2s voices` to list available voices for the configured provider.

## Storage

History is stored locally in SQLite:

- **macOS/Linux:** `~/.text2speak/history.db`
- **macOS/Linux config:** `~/.text2speak/.env`

## Supported Languages

99 languages supported for `--translate`. Use the code with `--translate`.

| Code | Language | Code | Language | Code | Language |
|------|----------|------|----------|------|----------|
| af | Afrikaans | hi | Hindi | pt | Portuguese |
| am | Amharic | hr | Croatian | ro | Romanian |
| ar | Arabic | ht | Haitian Creole | ru | Russian |
| as | Assamese | hu | Hungarian | sa | Sanskrit |
| az | Azerbaijani | haw | Hawaiian | sd | Sindhi |
| ba | Bashkir | hy | Armenian | si | Sinhala |
| be | Belarusian | id | Indonesian | sk | Slovak |
| bg | Bulgarian | is | Icelandic | sl | Slovenian |
| bn | Bengali | it | Italian | sn | Shona |
| bo | Tibetan | ja | Japanese | so | Somali |
| br | Breton | jw | Javanese | sq | Albanian |
| bs | Bosnian | ka | Georgian | sr | Serbian |
| ca | Catalan | kk | Kazakh | su | Sundanese |
| cs | Czech | km | Khmer | sv | Swedish |
| cy | Welsh | kn | Kannada | sw | Swahili |
| da | Danish | ko | Korean | ta | Tamil |
| de | German | la | Latin | te | Telugu |
| el | Greek | lb | Luxembourgish | tg | Tajik |
| en | English | ln | Lingala | th | Thai |
| es | Spanish | lo | Lao | tk | Turkmen |
| et | Estonian | lt | Lithuanian | tl | Tagalog |
| eu | Basque | lv | Latvian | tr | Turkish |
| fa | Persian | mg | Malagasy | tt | Tatar |
| fi | Finnish | mi | Maori | uk | Ukrainian |
| fo | Faroese | mk | Macedonian | ur | Urdu |
| fr | French | ml | Malayalam | uz | Uzbek |
| gl | Galician | mn | Mongolian | vi | Vietnamese |
| gu | Gujarati | mr | Marathi | yi | Yiddish |
| ha | Hausa | ms | Malay | yo | Yoruba |
| he | Hebrew | mt | Maltese | yue | Cantonese |
| nn | Nynorsk | my | Myanmar | zh | Chinese |
| no | Norwegian | ne | Nepali | | |
| oc | Occitan | nl | Dutch | | |
| pa | Punjabi | ps | Pashto | | |

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

[MIT](LICENSE)
