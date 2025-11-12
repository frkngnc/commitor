

import inquirer from 'inquirer';
import { LanguagePreference } from '@commitor/core';

interface LanguagePromptOptions {
  includeAuto?: boolean;
  allowCustom?: boolean;
  defaultValue?: LanguagePreference;
  message?: string;
}

export class Prompts {
  
  static async selectProvider(): Promise<'openai' | 'anthropic'> {
    const { provider } = await inquirer.prompt([
      {
        type: 'list',
        name: 'provider',
        message: 'Select AI provider:',
        choices: [
          { name: 'OpenAI (ChatGPT)', value: 'openai' },
          { name: 'Anthropic (Claude)', value: 'anthropic' }
        ]
      }
    ]);
    return provider;
  }

  
  static async selectConnectionType(): Promise<'api' | 'browser'> {
    const { connectionType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'connectionType',
        message: 'How would you like to connect?',
        choices: [
          {
            name: 'API Key (fast, reliable, requires API key)',
            value: 'api'
          },
          {
            name: 'Browser (uses your subscription, no API key needed) [NOT IMPLEMENTED]',
            value: 'browser',
            disabled: 'Coming soon'
          }
        ]
      }
    ]);
    return connectionType;
  }

  
  static async selectLanguage(options: LanguagePromptOptions = {}): Promise<LanguagePreference> {
    const { includeAuto = false, allowCustom = false, defaultValue, message } = options;
    const choices: Array<{ name: string; value: LanguagePreference; disabled?: string }> = [];

    if (includeAuto) {
      choices.push({
        name: 'Automatic (detect via README + git history)',
        value: 'auto'
      });
    }

    choices.push(
      { name: 'Turkish', value: 'tr' },
      { name: 'English', value: 'en' }
    );

    if (allowCustom) {
      choices.push({ name: 'Custom language...', value: 'custom' });
    }

    const { language } = await inquirer.prompt([
      {
        type: 'list',
        name: 'language',
        message: message || 'Commit message language:',
        choices,
        default: defaultValue ?? (includeAuto ? 'auto' : 'en')
      }
    ]);
    return language;
  }

  static async inputCustomLanguage(message = 'Enter the language name (e.g. Spanish):'): Promise<string> {
    const { customLanguage } = await inquirer.prompt([
      {
        type: 'input',
        name: 'customLanguage',
        message,
        validate: (input: string) => {
          if (!input || input.trim().length === 0) {
            return 'Language name cannot be empty';
          }
          return true;
        }
      }
    ]);
    return customLanguage.trim();
  }

  
  static async inputApiKey(provider: string): Promise<string> {
    const { apiKey } = await inquirer.prompt([
      {
        type: 'password',
        name: 'apiKey',
        message: `Enter ${provider} API key:`,
        mask: '*',
        validate: (input: string) => {
          if (!input || input.trim().length === 0) {
            return 'API key is required';
          }
          if (provider === 'OpenAI' && !input.startsWith('sk-')) {
            return 'OpenAI API key must start with "sk-"';
          }
          if (provider === 'Anthropic' && !input.startsWith('sk-ant-')) {
            return 'Anthropic API key must start with "sk-ant-"';
          }
          return true;
        }
      }
    ]);
    return apiKey;
  }

  
  static async confirm(message: string, defaultValue: boolean = true): Promise<boolean> {
    const { confirmed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmed',
        message,
        default: defaultValue
      }
    ]);
    return confirmed;
  }

  
  static async selectCommitAction(): Promise<'commit' | 'edit' | 'regenerate' | 'cancel'> {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: 'Commit with this message', value: 'commit' },
          { name: 'Edit message', value: 'edit' },
          { name: 'Regenerate message', value: 'regenerate' },
          { name: 'Cancel', value: 'cancel' }
        ]
      }
    ]);
    return action;
  }

  
  static async editMessage(currentMessage: string): Promise<string> {
    const { message } = await inquirer.prompt([
      {
        type: 'editor',
        name: 'message',
        message: 'Edit commit message:',
        default: currentMessage
      }
    ]);
    return message;
  }

  
  static async selectConfigField(): Promise<string> {
    const { field } = await inquirer.prompt([
      {
        type: 'list',
        name: 'field',
        message: 'Select configuration to change:',
        choices: [
          { name: 'AI Provider', value: 'provider' },
          { name: 'Connection Type', value: 'connectionType' },
          { name: 'Language Preference', value: 'language' },
          { name: 'API Key', value: 'apiKey' },
          { name: 'Cancel', value: 'cancel' }
        ]
      }
    ]);
    return field;
  }
}
