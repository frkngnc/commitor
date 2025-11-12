import * as vscode from 'vscode';
import { CommitorCore } from '@commitor/core';
import { SettingsManager } from './settings.js';
import { StatusBarManager } from './statusBar.js';
import { ConfigurationPanel } from './webview/configPanel.js';
import { SourceControlViewProvider } from './sourceControlView.js';

export class CommandManager {
  private settingsManager: SettingsManager;
  private statusBarManager: StatusBarManager;
  private context: vscode.ExtensionContext;
  private sourceControlView?: SourceControlViewProvider;

  constructor(settingsManager: SettingsManager, statusBarManager: StatusBarManager, context: vscode.ExtensionContext) {
    this.settingsManager = settingsManager;
    this.statusBarManager = statusBarManager;
    this.context = context;
  }

  setSourceControlView(view: SourceControlViewProvider): void {
    this.sourceControlView = view;
  }

  registerCommands(context: vscode.ExtensionContext): void {
    context.subscriptions.push(
      vscode.commands.registerCommand('commitor.generateCommitMessage', () => this.generateCommitMessage()),
      vscode.commands.registerCommand('commitor.configure', () => this.configure()),
      vscode.commands.registerCommand('commitor.openConfigPanel', () => this.openConfigPanel()),
      vscode.commands.registerCommand('commitor.changeLanguage', () => this.changeLanguage()),
      vscode.commands.registerCommand('commitor.logout', () => this.logout()),
      vscode.commands.registerCommand('commitor.checkHealth', () => this.checkHealth()),
      vscode.commands.registerCommand('commitor.updateStatusBar', () => this.statusBarManager.update()),
      vscode.commands.registerCommand('commitor.sourceControl.refresh', () => this.refreshSourceControlView()),
      vscode.commands.registerCommand('commitor.sourceControl.changeProvider', () => this.changeProviderFromPanel()),
      vscode.commands.registerCommand('commitor.sourceControl.changeLanguage', () => this.changeLanguageFromPanel())
    );
  }

  private refreshSourceControlView(): void {
    this.sourceControlView?.refresh();
  }

  private async changeProviderFromPanel(): Promise<void> {
    await this.configure();
    this.sourceControlView?.refresh();
  }

  private async changeLanguageFromPanel(): Promise<void> {
    await this.changeLanguage();
    this.sourceControlView?.refresh();
  }

  private openConfigPanel(): void {
    ConfigurationPanel.createOrShow(this.context.extensionUri, this.settingsManager);
  }

  private async generateCommitMessage(): Promise<void> {
    try {
      const repository = await this.getRepository();
      if (!repository) {
        vscode.window.showWarningMessage('Commitor: No Git repository found in this workspace.');
        return;
      }

      if (repository.state.indexChanges.length === 0) {
        const action = await vscode.window.showWarningMessage(
          'No staged changes found. Stage changes first.',
          'Open Source Control'
        );
        if (action === 'Open Source Control') {
          vscode.commands.executeCommand('workbench.view.scm');
        }
        return;
      }

      this.statusBarManager.setLoading();

      const config = await this.settingsManager.buildConfig();

      if (config.connectionType === 'api' && !config.apiKey) {
        const action = await vscode.window.showErrorMessage(
          `API key required for ${config.provider === 'openai' ? 'OpenAI' : 'Anthropic'}. Please configure.`,
          'Configure'
        );
        if (action === 'Configure') {
          await this.configure();
        }
        this.statusBarManager.update();
        return;
      }

      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'Generating commit message...',
          cancellable: false
        },
        async () => {
          const commitor = new CommitorCore(config);
          const diff = await commitor.analyzeGitDiff(repository.rootUri.fsPath);
          const language = this.resolveLanguage();
          const message = await commitor.generateCommitMessage(diff, language);
          repository.inputBox.value = message.raw;

          this.statusBarManager.setSuccess();
          vscode.window.showInformationMessage('Commit message generated successfully!');
        }
      );
    } catch (error: any) {
      this.statusBarManager.setError(error.message);
      vscode.window.showErrorMessage(`Commitor error: ${error.message ?? error}`);
    }
  }

  private async configure(): Promise<void> {
    const settings = this.settingsManager.getSettings();

    const provider = await vscode.window.showQuickPick(
      [
        { label: 'OpenAI', description: 'ChatGPT', value: 'openai' },
        { label: 'Anthropic', description: 'Claude', value: 'anthropic' }
      ],
      {
        placeHolder: `Current: ${settings.provider === 'openai' ? 'OpenAI (ChatGPT)' : 'Anthropic (Claude)'}`,
        title: 'Select AI Provider'
      }
    );

    if (!provider) return;

    await this.settingsManager.updateSetting('provider', provider.value, true);

    const connectionType = await vscode.window.showQuickPick(
      [
        { label: 'API Key', description: 'Fast, reliable, requires API key', value: 'api' },
        { label: 'Browser', description: 'No API key needed (experimental)', value: 'browser' }
      ],
      {
        placeHolder: `Current: ${settings.connectionType}`,
        title: 'Select Connection Type'
      }
    );

    if (!connectionType) return;

    await this.settingsManager.updateSetting('connectionType', connectionType.value, true);

    if (connectionType.value === 'api') {
      const apiKey = await vscode.window.showInputBox({
        prompt: `Enter your ${provider.label} API key`,
        password: true,
        placeHolder: provider.value === 'openai' ? 'sk-...' : 'sk-ant-...',
        validateInput: (value) => {
          if (!value) return 'API key is required';
          if (provider.value === 'openai' && !value.startsWith('sk-')) {
            return 'OpenAI API key should start with sk-';
          }
          if (provider.value === 'anthropic' && !value.startsWith('sk-ant-')) {
            return 'Anthropic API key should start with sk-ant-';
          }
          return null;
        }
      });

      if (apiKey) {
        await this.settingsManager.storeApiKey(provider.value as any, apiKey);
        vscode.window.showInformationMessage(`${provider.label} API key saved securely.`);
      }
    }

    this.statusBarManager.update();
    vscode.window.showInformationMessage('Configuration updated successfully!');
  }

  private async changeLanguage(): Promise<void> {
    const settings = this.settingsManager.getSettings();

    const language = await vscode.window.showQuickPick(
      [
        { label: 'Auto-detect', description: 'From README and commit history', value: 'auto' },
        { label: 'English', value: 'en' },
        { label: 'Turkish', description: 'Türkçe', value: 'tr' },
        { label: 'Custom', description: 'Specify your own language', value: 'custom' }
      ],
      {
        placeHolder: `Current: ${settings.language}`,
        title: 'Select Commit Message Language'
      }
    );

    if (!language) return;

    await this.settingsManager.updateSetting('language', language.value, true);

    if (language.value === 'custom') {
      const customLanguage = await vscode.window.showInputBox({
        prompt: 'Enter language name',
        placeHolder: 'e.g., German, Spanish, French',
        value: settings.customLanguage || ''
      });

      if (customLanguage) {
        await this.settingsManager.updateSetting('customLanguage', customLanguage, true);
      }
    }

    vscode.window.showInformationMessage(`Language changed to: ${language.label}`);
  }

  private async logout(): Promise<void> {
    const confirmation = await vscode.window.showWarningMessage(
      'This will remove all stored API keys. Continue?',
      { modal: true },
      'Yes, Clear All',
      'Cancel'
    );

    if (confirmation !== 'Yes, Clear All') return;

    await this.settingsManager.clearAllApiKeys();
    vscode.window.showInformationMessage('All API keys have been removed.');
  }

  private async checkHealth(): Promise<void> {
    try {
      const config = await this.settingsManager.buildConfig();

      if (config.connectionType === 'api' && !config.apiKey) {
        vscode.window.showWarningMessage('No API key configured. Please configure first.');
        return;
      }

      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'Checking AI provider health...',
          cancellable: false
        },
        async () => {
          const commitor = new CommitorCore(config);
          const isHealthy = await commitor.checkProviderHealth();

          if (isHealthy) {
            vscode.window.showInformationMessage(
              `✓ ${config.provider === 'openai' ? 'OpenAI' : 'Anthropic'} connection is healthy!`
            );
          } else {
            vscode.window.showErrorMessage('Provider health check failed. Please check your API key.');
          }
        }
      );
    } catch (error: any) {
      vscode.window.showErrorMessage(`Health check failed: ${error.message}`);
    }
  }

  private async getRepository(): Promise<any | undefined> {
    const gitExtension = vscode.extensions.getExtension('vscode.git');
    if (!gitExtension) {
      vscode.window.showErrorMessage('Git extension is not available.');
      return undefined;
    }

    const git = gitExtension.isActive ? gitExtension.exports : await gitExtension.activate();
    const api = git.getAPI(1);

    if (!api.repositories || api.repositories.length === 0) {
      return undefined;
    }

    return api.repositories[0];
  }

  private resolveLanguage(): string {
    const settings = this.settingsManager.getSettings();

    if (settings.language === 'custom') {
      return settings.customLanguage?.trim() || 'English';
    }

    if (settings.language === 'auto') {
      return 'English';
    }

    return settings.language === 'tr' ? 'Turkish' : 'English';
  }
}
