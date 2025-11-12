# @commitor/core

[![npm version](https://img.shields.io/npm/v/@commitor/core?style=flat-square)](https://www.npmjs.com/package/@commitor/core)
[![npm downloads](https://img.shields.io/npm/dm/@commitor/core?style=flat-square)](https://www.npmjs.com/package/@commitor/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

Core library for AI-powered commit message generation with support for OpenAI and Anthropic.

## Features

- Generate conventional commit messages using AI
- Support for multiple AI providers (OpenAI, Anthropic)
- Browser automation support (no API key needed)
- Git repository analysis and diff processing
- Language detection and multilingual support
- Configurable and extensible

## Installation

```bash
npm install @commitor/core
```

## Usage

```typescript
import { CommitGenerator } from '@frkngnc/commitor-core';

// Initialize with API key
const generator = new CommitGenerator({
  provider: 'openai', // or 'anthropic'
  connectionType: 'api',
  apiKey: 'your-api-key'
});

// Generate commit message
const message = await generator.generate({
  diff: 'your git diff here',
  language: 'en' // or 'tr', 'auto'
});

console.log(message);
```

## API

### CommitGenerator

Main class for generating commit messages.

#### Constructor Options

```typescript
interface CommitGeneratorOptions {
  provider: 'openai' | 'anthropic';
  connectionType: 'api' | 'browser';
  apiKey?: string;
  language?: string;
}
```

#### Methods

- `generate(options)`: Generate a commit message
- `detectLanguage(repoPath)`: Auto-detect repository language from README and commit history

## Supported AI Providers

- **OpenAI (GPT-4o-mini)**: Fast, cost-effective, and universally accessible model with API key
- **Anthropic (Claude Sonnet 4.5)**: Best coding model in the world with API key
- **Browser Mode**: Use without API keys (automated browser interaction)

## Related Packages

- [commitor](https://www.npmjs.com/package/commitor) - CLI tool
- [commitor-vscode](https://marketplace.visualstudio.com/items?itemName=frkngnc.commitor-vscode) - VSCode extension

## Repository

[https://github.com/frkngnc/commitor](https://github.com/frkngnc/commitor)

## License

MIT
