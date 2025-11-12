# Commitor

🤖 AI-powered Git commit message generator

## Installation

```bash
npm install -g commitor
```

## Quick Start

```bash
# Initial setup
commitor init

# Stage your changes
git add .

# Generate AI commit message
commitor
```

## Features

- 🎯 **AI-Powered**: Uses OpenAI (ChatGPT) or Anthropic (Claude)
- 🔄 **Hybrid Mode**: API or Browser automation
- 🌍 **Multi-Language**: Turkish and English support
- 📝 **Conventional Commits**: Follows industry standards
- ✨ **Interactive**: Preview and edit before committing
- 🔒 **Secure**: Encrypted API key storage

## Commands

### `commitor init`
Setup wizard for initial configuration

### `commitor`
Generate AI commit message and commit

### `commitor config`
View or edit configuration

### `commitor logout`
Clear session and API keys

## Configuration

Configuration is stored in `~/.commitor/config.json`

```json
{
  "provider": "openai",
  "connectionType": "api",
  "language": "tr",
  "apiKey": "encrypted"
}
```

## License

MIT
