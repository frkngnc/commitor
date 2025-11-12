import * as vscode from 'vscode';
import { SettingsManager } from './settings.js';
import { StatusBarManager } from './statusBar.js';
import { CommandManager } from './commands.js';
import { SourceControlViewProvider } from './sourceControlView.js';

let settingsManager: SettingsManager;
let statusBarManager: StatusBarManager;
let commandManager: CommandManager;
let sourceControlView: SourceControlViewProvider;

export async function activate(context: vscode.ExtensionContext) {
  settingsManager = new SettingsManager(context);
  statusBarManager = new StatusBarManager(settingsManager);
  commandManager = new CommandManager(settingsManager, statusBarManager, context);

  // Register Source Control view
  sourceControlView = new SourceControlViewProvider(settingsManager);
  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('commitor.sourceControl', sourceControlView)
  );

  // Connect view to command manager for refresh functionality
  commandManager.setSourceControlView(sourceControlView);

  commandManager.registerCommands(context);
  await statusBarManager.update();

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('commitor')) {
        statusBarManager.update();
        sourceControlView.refresh();
      }
    })
  );

  context.subscriptions.push(statusBarManager);

  const hasShownWelcome = context.globalState.get<boolean>('commitor.hasShownWelcome', false);
  if (!hasShownWelcome) {
    showWelcomeMessage(context);
    context.globalState.update('commitor.hasShownWelcome', true);
  }
}

export function deactivate() {}

async function showWelcomeMessage(context: vscode.ExtensionContext): Promise<void> {
  const config = await settingsManager.buildConfig();

  if (!config.apiKey && config.connectionType === 'api') {
    const action = await vscode.window.showInformationMessage(
      'Welcome to Commitor! Configure your AI provider to get started.',
      'Configure Now',
      'Later'
    );

    if (action === 'Configure Now') {
      vscode.commands.executeCommand('commitor.configure');
    }
  } else {
    vscode.window.showInformationMessage(
      'Commitor is ready! Click the ✨ button in Source Control to generate AI commit messages.'
    );
  }
}
