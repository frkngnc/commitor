

import { ConfigStore, CommitorConfig, AIProviderFactory } from '@commitor/core';
import { Logger } from '../ui/logger.js';
import { Prompts } from '../ui/prompts.js';
import { LanguageDetector } from '../utils/language-detector.js';

export async function initCommand(): Promise<void> {
  try {
    Logger.header('Commitor Setup Wizard');

    const store = new ConfigStore();

    
    const exists = await store.exists();
    if (exists) {
      const overwrite = await Prompts.confirm(
        'Configuration already exists. Do you want to overwrite it?',
        false
      );

      if (!overwrite) {
        Logger.info('Setup cancelled');
        return;
      }
    }

    
    Logger.section('AI Provider');
    const provider = await Prompts.selectProvider();

    
    Logger.section('Connection Type');
    const connectionType = await Prompts.selectConnectionType();

    
    let apiKey: string | undefined;
    if (connectionType === 'api') {
      const providerName = provider === 'openai' ? 'OpenAI' : 'Anthropic';

      while (true) {
        Logger.section('API Key');
        apiKey = await Prompts.inputApiKey(providerName);

        const validationSpinner = Logger.spinner(`Validating ${providerName} API key...`);
        try {
          const tempConfig: CommitorConfig = {
            provider,
            connectionType,
            language: 'en',
            apiKey
          };

          await AIProviderFactory.checkHealth(tempConfig);
          validationSpinner.succeed('API key validated successfully');
          break;
        } catch (error: any) {
          validationSpinner.fail('API key validation failed');
          Logger.error(error.message || 'Unable to validate API key. Please check your credentials or rate limits.');
          const retry = await Prompts.confirm('Do you want to try entering a different API key?', true);
          if (!retry) {
            Logger.info('Setup cancelled');
            return;
          }
        }
      }
    }

    Logger.section('Commit Message Language');
    const detector = new LanguageDetector(process.cwd());
    const detection = await detector.detect();

    if (detection.language) {
      const confidence = Math.round(detection.confidence * 100);
      Logger.info(
        `Detected language from README and commit history: ${detection.language === 'tr' ? 'Turkish' : 'English'} (${confidence}% confidence)`
      );
    } else {
      Logger.warning('Unable to detect language automatically. Please choose your preference.');
    }

    const languageSelection = await Prompts.selectLanguage({
      includeAuto: true,
      allowCustom: true,
      defaultValue: detection.language ?? 'auto',
      message: 'Which language should commit messages use?'
    });
    let customLanguage: string | undefined;
    if (languageSelection === 'custom') {
      customLanguage = await Prompts.inputCustomLanguage();
    }

    
    const config: CommitorConfig = {
      provider,
      connectionType,
      language: languageSelection,
      customLanguage,
      apiKey
    };

    
    const spinner = Logger.spinner('Saving configuration...');

    try {
      await store.save(config);
      spinner.succeed('Configuration saved successfully!');
    } catch (error: any) {
      spinner.fail('Failed to save configuration');
      Logger.error(error.message);
      process.exit(1);
    }

    Logger.newLine();
    Logger.success('Setup complete!');
    Logger.info(`Config file: ${store.getConfigPath()}`);
    Logger.newLine();
    Logger.info('You can now use "commitor" to generate commit messages');
  } catch (error: any) {
    Logger.error(`Setup failed: ${error.message}`);
    process.exit(1);
  }
}
