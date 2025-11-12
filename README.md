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
- ✅ **API Key Validation**: Kurulum sihirbazı API anahtarını anında doğrular, hatada seni uyarır
- 📝 **Conventional Commits**: Follows industry standards
- ✨ **Interactive**: Preview and edit messages before committing
- 🔒 **Secure**: Encrypted API key and session storage

## Development

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Setup

```bash
# Clone repository
git clone https://github.com/frkngnc/commit.git
cd commitor

# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm run test
```

### Package Development

```bash
# Work on core library
cd packages/core
npm run dev

# Work on CLI
cd packages/cli
npm run dev
```

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

```bash
# Install from VSIX (during development)
code --install-extension packages/vscode/commitor-vscode-0.1.0.vsix
```

See [VSCode Extension Documentation](./packages/vscode/README.md) for details.

## License

MIT © Furkan Genç

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.
