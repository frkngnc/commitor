<div align="center">

# 🤖 Commitor

**AI-powered Git commit message generator**

[![npm version](https://img.shields.io/npm/v/commitor?style=flat-square)](https://www.npmjs.com/package/commitor)
[![npm downloads](https://img.shields.io/npm/dm/commitor?style=flat-square)](https://www.npmjs.com/package/commitor)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/frkngnc/commitor?style=flat-square)](https://github.com/frkngnc/commitor/stargazers)

[![Core Package](https://img.shields.io/npm/v/@commitor/core?label=%40commitor%2Fcore&style=flat-square)](https://www.npmjs.com/package/@commitor/core)
[![VS Code Extension](https://img.shields.io/visual-studio-marketplace/v/frkngnc.commitor-vscode?label=VS%20Code&style=flat-square)](https://marketplace.visualstudio.com/items?itemName=frkngnc.commitor-vscode)

</div>

---

## 📦 Packages

This monorepo contains three packages:

| Package | Description | Version |
|---------|-------------|---------|
| **[commitor](./packages/cli)** | 🖥️ CLI tool for terminal usage | [![npm](https://img.shields.io/npm/v/commitor?style=flat-square)](https://www.npmjs.com/package/commitor) |
| **[@commitor/core](./packages/core)** | 🔧 Core library for developers | [![npm](https://img.shields.io/npm/v/@commitor/core?style=flat-square)](https://www.npmjs.com/package/@commitor/core) |
| **[commitor-vscode](./packages/vscode)** | 💻 VSCode extension | [![vs marketplace](https://img.shields.io/visual-studio-marketplace/v/frkngnc.commitor-vscode?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=frkngnc.commitor-vscode) |

## ✨ Features

- 🎯 **AI-Powered**: Generate meaningful commit messages using OpenAI (GPT-4o-mini) or Anthropic (Claude Sonnet 4.5)
- 🔄 **Hybrid Connection**: Use API keys OR browser automation (no API key required!)
- 🌍 **Multi-Language Support**: Auto-detects language from README + git history, or specify any language
- ✅ **Instant Validation**: Setup wizard validates API keys in real-time
- 📝 **Conventional Commits**: Follows industry-standard commit message format
- ✨ **Interactive Preview**: Review and edit messages before committing
- 🔒 **Secure Storage**: Encrypted API key and session management
- 🚀 **Multiple Interfaces**: CLI, VSCode extension, or integrate the core library

## 🚀 Quick Start

### CLI Installation

```bash
npm install -g commitor
```

### First Time Setup

```bash
# Run setup wizard
commitor init

# Choose your AI provider (OpenAI or Anthropic)
# Select connection type (API or Browser)
# Enter API key (if using API mode)
# Select language preference
```

### Usage

```bash
# Stage your changes
git add .

# Generate and commit with AI
commitor
```

That's it! Commitor will:
1. Analyze your staged changes
2. Generate a meaningful commit message
3. Let you preview and edit
4. Commit with the final message

## 📦 Installation Options

### For End Users

**CLI (Terminal)**
```bash
npm install -g commitor
```

**VSCode Extension**

Search "Commitor" in VSCode Extensions or [install from marketplace](https://marketplace.visualstudio.com/items?itemName=frkngnc.commitor-vscode)

### For Developers

**Core Library**
```bash
npm install @commitor/core
```

```typescript
import { CommitGenerator } from '@commitor/core';

const generator = new CommitGenerator({
  provider: 'openai',
  connectionType: 'api',
  apiKey: 'your-api-key'
});

const message = await generator.generate({
  diff: gitDiffOutput,
  language: 'en'
});
```

## 💻 VSCode Extension

Commitor is also available as a VSCode extension for seamless editor integration!

### Features
- ✨ One-click AI commit message generation from Source Control panel
- 🔑 Secure API key storage using VSCode Secrets API
- 📊 Real-time status bar integration
- ⚙️ Easy configuration via Command Palette or Settings UI
- 🎨 Beautiful configuration panel with visual feedback
- 🔄 Supports both OpenAI and Anthropic

### Installation

**From VSCode Marketplace:**
1. Open VSCode
2. Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for "Commitor"
4. Click Install

**Or install directly:**
```bash
code --install-extension frkngnc.commitor-vscode
```

[📦 View on VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=frkngnc.commitor-vscode)

## 📚 Documentation

- **[CLI Usage Guide](./docs/CLI_USAGE.md)** - Detailed CLI commands and options
- **[Development Guide](./docs/DEVELOPMENT.md)** - Setup development environment
- **[Core API Documentation](./packages/core/README.md)** - Use @commitor/core in your projects
- **[Contributing Guidelines](./CONTRIBUTING.md)** - How to contribute

## 🛠️ Available Commands

### CLI Commands

```bash
commitor init      # Initial setup wizard
commitor           # Generate and commit message
commitor config    # View/edit configuration
commitor logout    # Clear session and API keys
commitor --help    # Show help
commitor --version # Show version
```

### VSCode Commands

- `Commitor: Generate AI Commit Message` - Generate commit message
- `Commitor: Configure AI Provider` - Quick configuration
- `Commitor: Open Configuration Panel` - Full settings UI
- `Commitor: Change Language` - Switch message language
- `Commitor: Logout` - Clear API keys
- `Commitor: Check Provider Health` - Test AI provider connection

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. 🐛 **Report bugs** - [Open an issue](https://github.com/frkngnc/commitor/issues)
2. 💡 **Suggest features** - [Start a discussion](https://github.com/frkngnc/commitor/discussions)
3. 📝 **Improve docs** - Submit a PR with documentation improvements
4. 🔧 **Submit PRs** - Check [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines

## 📄 License

MIT © [Furkan Genç](https://github.com/frkngnc)

## ⭐ Show Your Support

If you find Commitor useful, please consider:
- ⭐ Starring the repository
- 🐦 Sharing on social media
- 📝 Writing a blog post or review
- 🔧 Contributing to the project

## 🔗 Links

- [npm Package (CLI)](https://www.npmjs.com/package/commitor)
- [npm Package (Core)](https://www.npmjs.com/package/@commitor/core)
- [VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=frkngnc.commitor-vscode)
- [GitHub Repository](https://github.com/frkngnc/commitor)
- [Issue Tracker](https://github.com/frkngnc/commitor/issues)
- [Discussions](https://github.com/frkngnc/commitor/discussions)

---

<div align="center">
Made with by <a href="https://github.com/frkngnc">Furkan Genç</a>
</div>
