# Commitor Development Guide

This document explains how to work within the repository and build packages.

## Requirements

- Node.js 18 or higher
- npm 9 or higher
- Git

## Setup

```bash
git clone https://github.com/frkngnc/commit.git
cd commitor
npm install
```

## Project Structure

```
packages/
├── cli   # CLI distributed to users
└── core  # Internal module used by CLI (not published to npm)
```

> `packages/core` is marked as `private: true` and is consumed only by the CLI.

## Development Commands

### CLI Package
```bash
npm run dev --workspace packages/cli
npm run build --workspace packages/cli
npm run test --workspace packages/cli
```

### Core Package
```bash
npm run dev --workspace packages/core
npm run build --workspace packages/core
npm run test --workspace packages/core
```

> Due to environment constraints, turborepo's `npm run build` command may produce keychain/TLS errors on some machines. In that case, building packages individually is sufficient.

## Code Style and Notes

- All source code is written in TypeScript; explicit types are preferred over JSDoc.
- ESLint/Prettier has not been added yet, but TypeScript must compile without errors.
- All user-facing text in the CLI is in English; only AI output language is detected via `auto` mode.
- When adding new features, stay consistent with decisions in `claudedocs/COMMITOR_PROJECT_PLAN.md`.

## Testing Language Detection

The language detector examines README and the last 25 commit messages. To create fake commit messages for local testing:

```bash
git commit --allow-empty -m "feat: new feature added"
```

Then run `commitor init` and observe how the logs change.

## Publishing / Packaging

- To publish the CLI package, use `npm publish --access public` in the `packages/cli` directory.
- Before publishing, verify that `npm run build --workspace packages/cli` completes cleanly.
- The core package is not published, so no additional setup is needed.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `No configuration found` | Run `commitor init` in the relevant repository. |
| Language detection failed | CLI prompts user for language; to make it permanent, manually select via `commitor config`. |
| Turbo TLS error | Build packages individually (`npm run build --workspace ...`). |
| OpenAI/Anthropic error codes | Check API key and quota status. |

For contributors, the process is explained in the `CONTRIBUTING.md` file.
