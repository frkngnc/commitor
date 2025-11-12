

import { ConfigStore, CommitorConfig, LanguagePreference } from '@commitor/core';
import { Logger } from '../ui/logger.js';
import { Prompts } from '../ui/prompts.js';

export async function configCommand(): Promise<void> {
  try {
    Logger.header('Commitor Configuration');

    const store = new ConfigStore();

    
    const exists = await store.exists();
    if (!exists) {
      Logger.error('No configuration found');
      Logger.info('Run "commitor init" to set up Commitor');
      process.exit(1);
    }

    
    let config = await store.load();
    if (!config) {
      Logger.error('Failed to load configuration');
      process.exit(1);
    }

    const formatLanguagePreference = (language: LanguagePreference, customLanguage?: string): string => {
      if (language === 'auto') {
        return 'Automatic (README + git history)';
      }
      if (language === 'custom') {
        return `Custom (${customLanguage || 'not set'})`;
      }
      return language === 'tr' ? 'Turkish' : 'English';
    };

    
    Logger.section('Current Configuration');
    Logger.config({
      'Provider': config.provider === 'openai' ? 'OpenAI (ChatGPT)' : 'Anthropic (Claude)',
      'Connection Type': config.connectionType === 'api' ? 'API' : 'Browser',
      'Language Preference': formatLanguagePreference(config.language, config.customLanguage),
      'API Key': config.apiKey || 'Not set',
      'Config Path': store.getConfigPath()
    });

    
    const edit = await Prompts.confirm('Do you want to edit configuration?', false);

    if (!edit) {
      return;
    }

    
    while (true) {
      const field = await Prompts.selectConfigField();

      if (field === 'cancel') {
        break;
      }

      let updates: Partial<CommitorConfig> = {};

      switch (field) {
        case 'provider':
          updates.provider = await Prompts.selectProvider();
          break;

        case 'connectionType':
          updates.connectionType = await Prompts.selectConnectionType();
          break;

        case 'language':
          {
            const selection = await Prompts.selectLanguage({
              includeAuto: true,
              allowCustom: true,
              defaultValue: config.language,
              message: 'Select language preference:'
            });
            updates.language = selection;
            if (selection === 'custom') {
              updates.customLanguage = await Prompts.inputCustomLanguage();
            } else if (config.customLanguage) {
              updates.customLanguage = undefined;
            }
          }
          break;

        case 'apiKey':
          {
            const providerName = config.provider === 'openai' ? 'OpenAI' : 'Anthropic';
            updates.apiKey = await Prompts.inputApiKey(providerName);
          }
          break;
      }

      if (Object.keys(updates).length === 0) {
        continue;
      }

      const spinner = Logger.spinner('Updating configuration...');

      try {
        await store.update(updates);
        config = { ...config, ...updates };
        spinner.succeed('Configuration updated');
      } catch (error: any) {
        spinner.fail('Update failed');
        Logger.error(error.message);
      }

      
      const more = await Prompts.confirm('Edit another field?', false);
      if (!more) {
        break;
      }
    }

    Logger.newLine();
    Logger.success('Configuration updated successfully');
  } catch (error: any) {
    Logger.error(`Configuration failed: ${error.message}`);
    process.exit(1);
  }
}
