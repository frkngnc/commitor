import * as vscode from 'vscode';
import { SettingsManager } from './settings.js';

export class StatusBarManager {
  private statusBarItem: vscode.StatusBarItem;
  private settingsManager: SettingsManager;

  constructor(settingsManager: SettingsManager) {
    this.settingsManager = settingsManager;
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100
    );
    this.statusBarItem.command = 'commitor.generateCommitMessage';
  }

  async update(): Promise<void> {
    if (!this.settingsManager.shouldShowStatusBar()) {
      this.hide();
      return;
    }

    const settings = this.settingsManager.getSettings();
    const provider = settings.provider || 'openai';
    const connectionType = settings.connectionType || 'api';

    const providerName = provider === 'openai' ? 'OpenAI' : 'Claude';
    const icon = connectionType === 'api' ? '$(zap)' : '$(browser)';

    this.statusBarItem.text = `${icon} Commitor (${providerName})`;
    this.statusBarItem.tooltip = `AI Provider: ${providerName}\nConnection: ${connectionType}\nClick to generate commit message`;

    this.show();
  }

  setLoading(): void {
    this.statusBarItem.text = '$(loading~spin) Commitor';
    this.statusBarItem.tooltip = 'Generating commit message...';
  }

  setError(message: string): void {
    this.statusBarItem.text = '$(warning) Commitor';
    this.statusBarItem.tooltip = `Error: ${message}`;
  }

  setSuccess(): void {
    this.statusBarItem.text = '$(check) Commitor';
    this.statusBarItem.tooltip = 'Commit message generated successfully';

    setTimeout(() => {
      this.update();
    }, 3000);
  }

  show(): void {
    this.statusBarItem.show();
  }

  hide(): void {
    this.statusBarItem.hide();
  }

  dispose(): void {
    this.statusBarItem.dispose();
  }
}
