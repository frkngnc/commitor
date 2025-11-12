import * as vscode from 'vscode';
import { SettingsManager } from '../settings.js';

export class ConfigurationPanel {
  public static currentPanel: ConfigurationPanel | undefined;
  private readonly panel: vscode.WebviewPanel;
  private readonly extensionUri: vscode.Uri;
  private readonly settingsManager: SettingsManager;
  private disposables: vscode.Disposable[] = [];

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, settingsManager: SettingsManager) {
    this.panel = panel;
    this.extensionUri = extensionUri;
    this.settingsManager = settingsManager;

    this.update();

    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);

    this.panel.webview.onDidReceiveMessage(
      async (message) => {
        await this.handleMessage(message);
      },
      null,
      this.disposables
    );
  }

  public static createOrShow(extensionUri: vscode.Uri, settingsManager: SettingsManager) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    if (ConfigurationPanel.currentPanel) {
      ConfigurationPanel.currentPanel.panel.reveal(column);
      ConfigurationPanel.currentPanel.update();
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      'commitorConfig',
      'Commitor Configuration',
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
      }
    );

    ConfigurationPanel.currentPanel = new ConfigurationPanel(panel, extensionUri, settingsManager);
  }

  private async update() {
    const webview = this.panel.webview;
    this.panel.webview.html = await this.getHtmlForWebview(webview);
  }

  private async handleMessage(message: any) {
    switch (message.command) {
      case 'getConfig':
        const config = await this.settingsManager.buildConfig();
        const hasApiKey = !!config.apiKey;
        this.panel.webview.postMessage({
          command: 'configData',
          config: {
            provider: config.provider,
            connectionType: config.connectionType,
            language: config.language,
            customLanguage: config.customLanguage,
            hasApiKey
          }
        });
        break;

      case 'saveConfig':
        try {
          if (message.provider) {
            await this.settingsManager.updateSetting('provider', message.provider, true);
          }
          if (message.connectionType) {
            await this.settingsManager.updateSetting('connectionType', message.connectionType, true);
          }
          if (message.language) {
            await this.settingsManager.updateSetting('language', message.language, true);
          }
          if (message.customLanguage !== undefined) {
            await this.settingsManager.updateSetting('customLanguage', message.customLanguage, true);
          }
          if (message.apiKey) {
            await this.settingsManager.storeApiKey(message.provider, message.apiKey);
          }

          this.panel.webview.postMessage({
            command: 'saveSuccess',
            message: 'Configuration saved successfully!'
          });

          vscode.commands.executeCommand('commitor.updateStatusBar');
        } catch (error: any) {
          this.panel.webview.postMessage({
            command: 'saveError',
            message: error.message
          });
        }
        break;

      case 'testConnection':
        try {
          const config = await this.settingsManager.buildConfig();
          const { CommitorCore } = await import('@commitor/core');
          const commitor = new CommitorCore(config);
          const isHealthy = await commitor.checkProviderHealth();

          this.panel.webview.postMessage({
            command: 'testResult',
            success: isHealthy,
            message: isHealthy
              ? `Connection to ${config.provider === 'openai' ? 'OpenAI' : 'Anthropic'} successful!`
              : 'Connection failed. Please check your API key.'
          });
        } catch (error: any) {
          this.panel.webview.postMessage({
            command: 'testResult',
            success: false,
            message: `Connection failed: ${error.message}`
          });
        }
        break;

      case 'clearApiKey':
        try {
          await this.settingsManager.clearAllApiKeys();
          this.panel.webview.postMessage({
            command: 'saveSuccess',
            message: 'API keys cleared successfully!'
          });
        } catch (error: any) {
          this.panel.webview.postMessage({
            command: 'saveError',
            message: error.message
          });
        }
        break;
    }
  }

  private async getHtmlForWebview(webview: vscode.Webview): Promise<string> {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Commitor Configuration</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      color: var(--vscode-foreground);
      background-color: var(--vscode-editor-background);
      padding: 20px;
      line-height: 1.6;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
    }

    h1 {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 8px;
      color: var(--vscode-foreground);
    }

    .subtitle {
      color: var(--vscode-descriptionForeground);
      margin-bottom: 32px;
      font-size: 14px;
    }

    .section {
      background-color: var(--vscode-editor-background);
      border: 1px solid var(--vscode-panel-border);
      border-radius: 6px;
      padding: 20px;
      margin-bottom: 20px;
    }

    .section-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 16px;
      color: var(--vscode-foreground);
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: var(--vscode-foreground);
    }

    .description {
      font-size: 12px;
      color: var(--vscode-descriptionForeground);
      margin-top: 4px;
    }

    select, input[type="text"], input[type="password"] {
      width: 100%;
      padding: 8px 12px;
      background-color: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border);
      border-radius: 4px;
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
    }

    select:focus, input:focus {
      outline: 1px solid var(--vscode-focusBorder);
      outline-offset: -1px;
    }

    .radio-group {
      display: flex;
      gap: 16px;
      margin-top: 8px;
    }

    .radio-option {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      border: 1px solid var(--vscode-panel-border);
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .radio-option:hover {
      border-color: var(--vscode-focusBorder);
      background-color: var(--vscode-list-hoverBackground);
    }

    .radio-option.selected {
      border-color: var(--vscode-focusBorder);
      background-color: var(--vscode-list-activeSelectionBackground);
    }

    .radio-option input[type="radio"] {
      width: auto;
    }

    .radio-label {
      display: flex;
      flex-direction: column;
    }

    .radio-title {
      font-weight: 500;
    }

    .radio-desc {
      font-size: 12px;
      color: var(--vscode-descriptionForeground);
    }

    .button-group {
      display: flex;
      gap: 12px;
      margin-top: 24px;
    }

    button {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .primary-button {
      background-color: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
    }

    .primary-button:hover {
      background-color: var(--vscode-button-hoverBackground);
    }

    .secondary-button {
      background-color: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
    }

    .secondary-button:hover {
      background-color: var(--vscode-button-secondaryHoverBackground);
    }

    .danger-button {
      background-color: #d73a49;
      color: white;
    }

    .danger-button:hover {
      background-color: #cb2431;
    }

    .message {
      padding: 12px 16px;
      border-radius: 4px;
      margin-bottom: 20px;
      display: none;
    }

    .message.show {
      display: block;
    }

    .message.success {
      background-color: var(--vscode-testing-iconPassed);
      color: var(--vscode-editor-background);
    }

    .message.error {
      background-color: var(--vscode-testing-iconFailed);
      color: var(--vscode-editor-background);
    }

    .status-indicator {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 8px;
    }

    .status-indicator.connected {
      background-color: var(--vscode-testing-iconPassed);
    }

    .status-indicator.disconnected {
      background-color: var(--vscode-descriptionForeground);
    }

    #customLanguageGroup {
      display: none;
    }

    #customLanguageGroup.show {
      display: block;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>⚙️ Commitor Configuration</h1>
    <p class="subtitle">Configure your AI-powered commit message generator</p>

    <div id="message" class="message"></div>

    <div class="section">
      <div class="section-title">AI Provider</div>

      <div class="form-group">
        <label>Select Provider</label>
        <div class="radio-group">
          <div class="radio-option" data-value="openai">
            <input type="radio" name="provider" value="openai" id="openai">
            <label for="openai" class="radio-label">
              <span class="radio-title">OpenAI</span>
              <span class="radio-desc">ChatGPT</span>
            </label>
          </div>
          <div class="radio-option" data-value="anthropic">
            <input type="radio" name="provider" value="anthropic" id="anthropic">
            <label for="anthropic" class="radio-label">
              <span class="radio-title">Anthropic</span>
              <span class="radio-desc">Claude</span>
            </label>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label>Connection Type</label>
        <div class="radio-group">
          <div class="radio-option" data-value="api">
            <input type="radio" name="connectionType" value="api" id="api">
            <label for="api" class="radio-label">
              <span class="radio-title">API Key</span>
              <span class="radio-desc">Fast, reliable</span>
            </label>
          </div>
          <div class="radio-option" data-value="browser">
            <input type="radio" name="connectionType" value="browser" id="browser">
            <label for="browser" class="radio-label">
              <span class="radio-title">Browser</span>
              <span class="radio-desc">No API key needed</span>
            </label>
          </div>
        </div>
      </div>

      <div class="form-group" id="apiKeyGroup">
        <label for="apiKey">API Key</label>
        <input type="password" id="apiKey" placeholder="sk-...">
        <div class="description">Your API key is stored securely in VSCode Secrets</div>
      </div>

      <div class="button-group">
        <button class="secondary-button" onclick="testConnection()">Test Connection</button>
        <button class="danger-button" onclick="clearApiKey()">Clear API Key</button>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Language Settings</div>

      <div class="form-group">
        <label for="language">Commit Message Language</label>
        <select id="language">
          <option value="auto">Auto-detect from README and history</option>
          <option value="en">English</option>
          <option value="tr">Turkish (Türkçe)</option>
          <option value="custom">Custom Language</option>
        </select>
      </div>

      <div class="form-group" id="customLanguageGroup">
        <label for="customLanguage">Custom Language Name</label>
        <input type="text" id="customLanguage" placeholder="e.g., German, Spanish, French">
      </div>
    </div>

    <div class="button-group">
      <button class="primary-button" onclick="saveConfig()">Save Configuration</button>
    </div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();

    window.addEventListener('message', event => {
      const message = event.data;

      switch (message.command) {
        case 'configData':
          loadConfig(message.config);
          break;
        case 'saveSuccess':
          showMessage(message.message, 'success');
          break;
        case 'saveError':
          showMessage(message.message, 'error');
          break;
        case 'testResult':
          showMessage(message.message, message.success ? 'success' : 'error');
          break;
      }
    });

    document.querySelectorAll('.radio-option').forEach(option => {
      option.addEventListener('click', function() {
        const input = this.querySelector('input[type="radio"]');
        input.checked = true;

        const name = input.name;
        document.querySelectorAll(\`input[name="\${name}"]\`).forEach(radio => {
          radio.closest('.radio-option').classList.remove('selected');
        });
        this.classList.add('selected');

        if (name === 'connectionType') {
          updateApiKeyVisibility();
        }
      });
    });

    document.getElementById('language').addEventListener('change', function() {
      updateCustomLanguageVisibility();
    });

    function loadConfig(config) {
      document.getElementById(config.provider).checked = true;
      document.querySelector(\`[data-value="\${config.provider}"]\`).classList.add('selected');

      document.getElementById(config.connectionType).checked = true;
      document.querySelector(\`[data-value="\${config.connectionType}"]\`).classList.add('selected');

      document.getElementById('language').value = config.language || 'auto';
      document.getElementById('customLanguage').value = config.customLanguage || '';

      updateApiKeyVisibility();
      updateCustomLanguageVisibility();
    }

    function updateApiKeyVisibility() {
      const isApi = document.getElementById('api').checked;
      document.getElementById('apiKeyGroup').style.display = isApi ? 'block' : 'none';
    }

    function updateCustomLanguageVisibility() {
      const language = document.getElementById('language').value;
      const customGroup = document.getElementById('customLanguageGroup');
      if (language === 'custom') {
        customGroup.classList.add('show');
      } else {
        customGroup.classList.remove('show');
      }
    }

    function saveConfig() {
      const provider = document.querySelector('input[name="provider"]:checked').value;
      const connectionType = document.querySelector('input[name="connectionType"]:checked').value;
      const language = document.getElementById('language').value;
      const customLanguage = document.getElementById('customLanguage').value;
      const apiKey = document.getElementById('apiKey').value;

      vscode.postMessage({
        command: 'saveConfig',
        provider,
        connectionType,
        language,
        customLanguage,
        apiKey: apiKey || undefined
      });
    }

    function testConnection() {
      vscode.postMessage({ command: 'testConnection' });
    }

    function clearApiKey() {
      if (confirm('Are you sure you want to clear all API keys?')) {
        vscode.postMessage({ command: 'clearApiKey' });
        document.getElementById('apiKey').value = '';
      }
    }

    function showMessage(text, type) {
      const messageEl = document.getElementById('message');
      messageEl.textContent = text;
      messageEl.className = \`message show \${type}\`;

      setTimeout(() => {
        messageEl.classList.remove('show');
      }, 5000);
    }

    vscode.postMessage({ command: 'getConfig' });
  </script>
</body>
</html>`;
  }

  public dispose() {
    ConfigurationPanel.currentPanel = undefined;

    this.panel.dispose();

    while (this.disposables.length) {
      const disposable = this.disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }
}
