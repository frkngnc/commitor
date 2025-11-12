# @commitor/core (internal)

`@commitor/core` is the internal engine that powers the Commitor CLI. It bundles Git analysis, AI provider orchestration, configuration handling, and localization so the CLI can stay focused on the user experience.

## Purpose

- Git diff analysis utilities used by the CLI commands
- AI-powered commit message generation (OpenAI, Anthropic)
- Hybrid connectivity (API + browser automation)
- Secure config storage and multi-language helpers
- Language preference defaults to auto-detection (README + git geçmişi) with manual override through the CLI

## Usage

This package is not intended to be installed directly. Instead, install the CLI:

```bash
npm install -g commitor
commitor init
```

All interactions with the core logic happen through the terminal workflow above.

## License

MIT
