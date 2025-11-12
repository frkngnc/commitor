# Commitor

[![npm version](https://img.shields.io/npm/v/commitor?style=flat-square)](https://www.npmjs.com/package/commitor)
[![npm downloads](https://img.shields.io/npm/dm/commitor?style=flat-square)](https://www.npmjs.com/package/commitor)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

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

- 🎯 **AI-Powered**: Uses OpenAI (GPT-4o-mini) or Anthropic (Claude Sonnet 4.5)
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

## Related Packages

- [@commitor/core](https://www.npmjs.com/package/@commitor/core) - Core library
- [commitor-vscode](https://marketplace.visualstudio.com/items?itemName=frkngnc.commitor-vscode) - VSCode extension

## Repository

[https://github.com/frkngnc/commitor](https://github.com/frkngnc/commitor)

## License

MIT
