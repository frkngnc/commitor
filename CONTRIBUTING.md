# Contributing Guide

Thanks for considering a contribution to Commitor! This document explains how to propose bug fixes, features, or improvements.

## Getting Started

1. Fork the repo and clone your copy:
   ```bash
   git clone https://github.com/frkngnc/commitor.git
   cd commitor
   ```
2. Keep your fork in sync with upstream:
   ```bash
   git remote add upstream https://github.com/frkngnc/commitor.git
   git fetch upstream
   git checkout develop
   git merge upstream/develop
   ```

## Development Workflow

1. Create a feature branch:
   ```bash
   git checkout -b feature/short-summary
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Use workspace commands while working in CLI or core packages:
   ```bash
   npm run dev --workspace packages/cli
   npm run build --workspace packages/core
   ```
4. Run tests/builds after making changes. If Turbo throws a TLS/keychain error, build packages individually.
5. Write commits using Conventional Commit format (`feat: ...`, `fix: ...`, etc.).
6. When opening a PR:
   - Describe the motivation and the changes.
   - Include screenshots or terminal output when relevant.
   - Update README/docs if behavior or commands changed.

## Code Standards

- Codebase is TypeScript-first; prefer explicit types over implicit inference when clarity helps.
- CLI-facing copy remains in English; AI output language is handled automatically.
- `packages/core` is `private: true` and intended only for the CLI—avoid treating it as a standalone SDK.
- Keep comments minimal; strive for self-explanatory code.

## PR Checklist

- [ ] `npm install` has been run and lockfile changes are committed.
- [ ] Relevant workspaces pass `npm run build --workspace ...`.
- [ ] Tests are added or manual verification steps documented.
- [ ] Documentation/README updates are included if needed.
- [ ] Formatting/linting (currently just `tsc`) passes.

## Reporting Bugs

Please include:
- Expected vs. actual behavior
- CLI output or stack traces
- `node -v`, `npm -v`, OS details
- Reproduction steps if possible

## Security

Never share API keys or sensitive user data in issues/PRs. For potential security vulnerabilities, reach out privately via the maintainer contact listed in the repository.

Thank you!
