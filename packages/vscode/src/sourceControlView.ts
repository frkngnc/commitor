import * as vscode from 'vscode';
import { SettingsManager } from './settings.js';

export class SourceControlViewProvider implements vscode.TreeDataProvider<ViewItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<ViewItem | undefined | void> = new vscode.EventEmitter<ViewItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<ViewItem | undefined | void> = this._onDidChangeTreeData.event;

  constructor(private settingsManager: SettingsManager) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: ViewItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: ViewItem): Promise<ViewItem[]> {
    if (element) {
      return [];
    }

    const config = await this.settingsManager.buildConfig();
    const items: ViewItem[] = [];

    // Main action button
    const generateItem = new ViewItem(
      'Generate AI Commit Message',
      'Generate commit message using AI',
      vscode.TreeItemCollapsibleState.None,
      {
        command: 'commitor.generateCommitMessage',
        title: 'Generate AI Commit Message'
      },
      'action',
      new vscode.ThemeIcon('sparkle')
    );
    generateItem.description = 'Run Commitor';
    items.push(generateItem);

    // Quick Settings
    const providerLabel = config.provider === 'openai' ? 'OpenAI' : 'Anthropic';
    const languageLabel = this.getLanguageLabel(config.language);

    items.push(
      new ViewItem(
        `🤖 Provider: ${providerLabel}`,
        'Click to change AI provider',
        vscode.TreeItemCollapsibleState.None,
        {
          command: 'commitor.sourceControl.changeProvider',
          title: 'Change Provider'
        },
        'provider'
      )
    );

    items.push(
      new ViewItem(
        `🌍 Language: ${languageLabel}`,
        'Click to change commit message language',
        vscode.TreeItemCollapsibleState.None,
        {
          command: 'commitor.sourceControl.changeLanguage',
          title: 'Change Language'
        },
        'language'
      )
    );

    // Additional actions
    items.push(
      new ViewItem(
        '⚙️ Open Configuration Panel',
        'Open full configuration settings',
        vscode.TreeItemCollapsibleState.None,
        {
          command: 'commitor.openConfigPanel',
          title: 'Open Configuration Panel'
        },
        'config'
      )
    );

    return items;
  }

  private getLanguageLabel(language: string | undefined): string {
    switch (language) {
      case 'tr':
        return 'Turkish';
      case 'en':
        return 'English';
      case 'auto':
        return 'Auto-detect';
      case 'custom':
        return 'Custom';
      default:
        return 'Auto-detect';
    }
  }
}

class ViewItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly tooltip: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command,
    public readonly contextValue?: string,
    public readonly icon?: vscode.ThemeIcon
  ) {
    super(label, collapsibleState);
    this.tooltip = tooltip;
    this.command = command;
    this.contextValue = contextValue;
    if (icon) {
      this.iconPath = icon;
    }
  }
}
