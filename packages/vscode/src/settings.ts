import * as vscode from 'vscode';
import { CommitorConfig, AIProvider, ConnectionType, LanguagePreference } from '@commitor/core';

export class SettingsManager {
  private static readonly SECTION = 'commitor';
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  getSettings(): Partial<CommitorConfig> {
    const config = vscode.workspace.getConfiguration(SettingsManager.SECTION);
    const provider = config.get<string>('provider', 'openai');
    const connectionType = config.get<string>('connectionType', 'api');
    const language = config.get<string>('language', 'auto');

    return {
      provider: (provider === 'openai' || provider === 'anthropic') ? provider : 'openai',
      connectionType: (connectionType === 'api' || connectionType === 'browser') ? connectionType : 'api',
      language: (language === 'tr' || language === 'en' || language === 'auto' || language === 'custom') ? language : 'auto',
      customLanguage: config.get<string>('customLanguage', ''),
    };
  }

  async getApiKey(): Promise<string | undefined> {
    const provider = this.getSettings().provider;
    const key = `${SettingsManager.SECTION}.apiKey.${provider}`;
    return await this.context.secrets.get(key);
  }

  async storeApiKey(provider: AIProvider, apiKey: string): Promise<void> {
    const key = `${SettingsManager.SECTION}.apiKey.${provider}`;
    await this.context.secrets.store(key, apiKey);
  }

  async deleteApiKey(provider?: AIProvider): Promise<void> {
    const targetProvider = provider || this.getSettings().provider;
    const key = `${SettingsManager.SECTION}.apiKey.${targetProvider}`;
    await this.context.secrets.delete(key);
  }

  async clearAllApiKeys(): Promise<void> {
    await this.deleteApiKey('openai' as unknown as AIProvider);
    await this.deleteApiKey('anthropic' as unknown as AIProvider);
  }

  async buildConfig(): Promise<CommitorConfig> {
    const settings = this.getSettings();
    const apiKey = await this.getApiKey();

    return {
      provider: settings.provider || 'openai',
      connectionType: settings.connectionType || 'api',
      language: settings.language || 'auto',
      customLanguage: settings.customLanguage,
      apiKey,
    };
  }

  isAutoGenerateEnabled(): boolean {
    const config = vscode.workspace.getConfiguration(SettingsManager.SECTION);
    return config.get<boolean>('autoGenerate', false);
  }

  shouldShowStatusBar(): boolean {
    const config = vscode.workspace.getConfiguration(SettingsManager.SECTION);
    return config.get<boolean>('showStatusBar', true);
  }

  async updateSetting(key: string, value: any, global: boolean = false): Promise<void> {
    const config = vscode.workspace.getConfiguration(SettingsManager.SECTION);
    await config.update(key, value, global ? vscode.ConfigurationTarget.Global : vscode.ConfigurationTarget.Workspace);
  }
}
