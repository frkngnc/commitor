

import { ConfigStore } from '@commitor/core';
import { Logger } from '../ui/logger.js';
import { Prompts } from '../ui/prompts.js';

export async function logoutCommand(): Promise<void> {
  try {
    Logger.header('Commitor Logout');

    const store = new ConfigStore();

    
    const exists = await store.exists();
    if (!exists) {
      Logger.info('No configuration found. Nothing to clear.');
      return;
    }

    
    Logger.warning('This will remove all saved configuration including API keys');
    const confirmed = await Prompts.confirm('Are you sure you want to continue?', false);

    if (!confirmed) {
      Logger.info('Logout cancelled');
      return;
    }

    
    const spinner = Logger.spinner('Clearing configuration...');

    try {
      await store.clear();
      spinner.succeed('Configuration cleared successfully');
    } catch (error: any) {
      spinner.fail('Failed to clear configuration');
      Logger.error(error.message);
      process.exit(1);
    }

    Logger.newLine();
    Logger.success('Logout successful');
    Logger.info('Run "commitor init" to set up again');
  } catch (error: any) {
    Logger.error(`Logout failed: ${error.message}`);
    process.exit(1);
  }
}
