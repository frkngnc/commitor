# Commitor CLI Usage Guide

This guide explains how to install and use Commitor from the terminal step by step.

## Installation

```bash
npm install -g commitor
```

> Ensure you have Node.js 18+ and Git installed.

## Initial Setup (`commitor init`)

1. **Run the command:**
   ```bash
   commitor init
   ```
2. **Select AI provider:** OpenAI (ChatGPT) or Anthropic (Claude).
3. **Choose connection method:** Currently, API mode is supported. Browser mode will be added in the future.
4. **Enter API key:** Provide your provider's API key (OpenAI: `sk-`, Anthropic: `sk-ant-`). Commitor validates the key immediately with the provider; if invalid, it warns you with the reason and asks you to re-enter.
5. **Language preference:**
   - Commitor analyzes README and recent commit messages to suggest a language.
   - You can choose automatic mode, fix to Turkish/English, or select `Custom language...` to specify your preferred language (e.g., Spanish, German).
6. **Save:** Settings are stored encrypted in your user directory.

## Daily Workflow

1. Stage your changes:
   ```bash
   git add .
   ```
2. Run Commitor:
   ```bash
   commitor
   ```
3. The CLI will:
   - Analyze the staged diff.
   - If your language preference is `auto`, detect language from README + commit history; prompt if needed.
   - Generate a commit message from your chosen provider.
   - Preview the message and offer these options:
     - Commit
     - Edit message (opens editor)
     - Regenerate
     - Cancel

When commit succeeds, branch and short hash are displayed.

## View/Edit Settings (`commitor config`)

```bash
commitor config
```

- Displays current provider, connection type, language preference, and config file path.
- If you answer "yes" to "Edit configuration", you can modify these fields line by line:
  - AI Provider
  - Connection Type
  - Language Preference (Automatic / Turkish / English / Custom)
  - API Key

## Clear Session (`commitor logout`)

```bash
commitor logout
```

- All configuration and stored keys are deleted.
- Next use requires running `commitor init` again.

## Error Scenarios

- **"No configuration found"**: Run `commitor init` first.
- **API key invalid / rate limit**: If validation fails during setup or config, the CLI shows an error message. Re-enter the correct key or check your provider quotas.
- **Language detection failed**: The CLI prompts you to select a language; your choice applies only to that commit.

## Daily Usage Tips

- When editing commit messages, try to maintain the conventional commit format.
- To change language preference per project, simply run `commitor config` in that repository.
- For separate configs in different projects, `commitor init` supports different directories per repo (Conf automatically creates files based on cwd).
