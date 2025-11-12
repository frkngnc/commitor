# Commitor - AI-Powered Commit Messages for VSCode

🤖 Generate professional, meaningful commit messages with AI - right inside VSCode!

## Features

✨ **One-Click Generation**: Click the sparkle button in Source Control to generate AI commit messages
🎯 **AI-Powered**: Supports OpenAI (ChatGPT) and Anthropic (Claude)
🔄 **Flexible Connection**: Use API keys or browser automation (no API key required)
🌍 **Multi-Language**: Auto-detect language or choose from Turkish, English, or custom
⚡ **Fast & Secure**: API keys stored securely in VSCode Secrets
📝 **Conventional Commits**: Follows industry standards automatically

## Quick Start

### 1. Install Extension

Search for "Commitor" in the VSCode Extensions marketplace and install.

### 2. Configure AI Provider

Open Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`) and run:

```
Commitor: Configure AI Provider
```

Choose your provider:
- **OpenAI (ChatGPT)** - Requires API key from https://platform.openai.com
- **Anthropic (Claude)** - Requires API key from https://console.anthropic.com

Select connection type:
- **API Key** - Fast, reliable (recommended)
- **Browser** - Uses your existing subscription, no API key needed (experimental)

### 3. Generate Commit Messages

1. Stage your changes in Source Control
2. Click the **✨ sparkle button** in the Source Control title bar
3. AI analyzes your changes and generates a professional commit message
4. Review, edit if needed, and commit!

## Commands

Access via Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`):

- `Commitor: Generate AI Commit Message` - Generate commit message for staged changes
- `Commitor: Configure AI Provider` - Setup or change AI provider and API key
- `Commitor: Change Language` - Change commit message language
- `Commitor: Check Provider Health` - Test your API connection
- `Commitor: Logout (Clear API Keys)` - Remove stored API keys

## Settings

Open VSCode Settings and search for "Commitor":

### `commitor.provider`
AI provider to use: `openai` (ChatGPT) or `anthropic` (Claude)
**Default**: `openai`

### `commitor.connectionType`
Connection type: `api` (API key) or `browser` (browser automation)
**Default**: `api`

### `commitor.language`
Commit message language: `auto`, `tr` (Turkish), `en` (English), or `custom`
**Default**: `auto`

### `commitor.customLanguage`
Custom language name (e.g., "German", "Spanish") when language is set to `custom`
**Default**: `""`

### `commitor.showStatusBar`
Show Commitor status in the status bar
**Default**: `true`

## How It Works

1. **Analyze**: Commitor analyzes your staged Git changes
2. **AI Processing**: Sends diff to your chosen AI provider (OpenAI or Anthropic)
3. **Generate**: AI generates a conventional commit message based on changes
4. **Review**: Message appears in Source Control input box
5. **Commit**: Review, edit if needed, and commit!

## Example Output

```
feat(auth): implement JWT authentication system

- Add token-based user authentication mechanism
- Create login and register endpoints
- Integrate bcrypt for password hashing
- Add JWT middleware for route protection
- Support access and refresh tokens
```

## Security

- **API Keys**: Stored securely using VSCode Secrets API (OS keychain)
- **Privacy**: Git diffs only sent to your chosen AI provider
- **No Telemetry**: No analytics or tracking
- **Open Source**: Audit the code at https://github.com/frkngnc/commit

## Requirements

- VSCode 1.84.0 or higher
- Git repository in workspace
- API key for chosen provider (OpenAI or Anthropic) OR existing subscription for browser mode

## Extension Commands

| Command | Description |
|---------|-------------|
| `commitor.generateCommitMessage` | Generate AI commit message |
| `commitor.configure` | Configure AI provider and API key |
| `commitor.changeLanguage` | Change commit message language |
| `commitor.checkHealth` | Check provider health |
| `commitor.logout` | Clear stored API keys |

## Troubleshooting

### "No staged changes found"
Make sure you have staged files in Source Control before generating a message.

### "API key required"
Run `Commitor: Configure AI Provider` to set up your API key.

### "Provider health check failed"
- Verify your API key is correct
- Check your internet connection
- Ensure API provider service is operational

### Browser mode not working
Browser automation is experimental and may not work on all systems. We recommend using API mode for better reliability.

## Support

- 🐛 Report issues: https://github.com/frkngnc/commit/issues
- 📖 Documentation: https://github.com/frkngnc/commit
- 💬 Discussions: https://github.com/frkngnc/commit/discussions

## CLI Version

Also available as a CLI tool! Install with:

```bash
npm install -g commitor
```

See https://github.com/frkngnc/commit for more information.

## License

MIT © Furkan Genç

---

Made with ❤️ by [Furkan Genç](https://github.com/frkngnc)
