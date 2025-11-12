# Commitor

🤖 AI-powered Git commit message generator

## Project Structure

Commitor is shipped as a CLI tool, and everything in this repository exists to support that experience.

- **[commitor](./packages/cli)** - The CLI that users install and run in their terminal
- **[@commitor/core](./packages/core)** - Internal module consumed by the CLI (not intended for separate installation)

## Quick Start

### Installation

```bash
npm install -g commitor
```

### Usage

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
- 🔄 **Hybrid Mode**: API or Browser automation (no API key required)
- 🌍 **Multi-Language**: Auto-detects Turkish/English from README + history, or pick any language manually (custom input supported)
- ✅ **API Key Validation**: The setup wizard instantly validates the API key, and if there is an error,
- 📝 **Conventional Commits**: Follows industry standards
- ✨ **Interactive**: Preview and edit messages before committing
- 🔒 **Secure**: Encrypted API key and session storage

## Documentation

- [CLI Usage](./docs/CLI_USAGE.md)
- [Development Guide](./docs/DEVELOPMENT.md)
- [Contributing](./CONTRIBUTING.md)

## VSCode Extension

Commitor is also available as a VSCode extension! Get AI-powered commit messages directly in your editor.

### Features
- ✨ One-click commit message generation from Source Control panel
- 🔑 Secure API key storage using VSCode Secrets
- 📊 Status bar integration
- ⚙️ Easy configuration via Command Palette

### Installation

Search for "Commitor" in the VSCode Extensions marketplace, or:

## License

MIT © Furkan Genç

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.
