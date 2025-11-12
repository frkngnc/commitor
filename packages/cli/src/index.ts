#!/usr/bin/env node



import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { commitCommand } from './commands/commit.js';
import { configCommand } from './commands/config.js';
import { logoutCommand } from './commands/logout.js';

const program = new Command();

program
  .name('commitor')
  .description('AI-powered Git commit message generator')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize Commitor configuration')
  .action(initCommand);

program
  .command('config')
  .description('View or edit configuration')
  .action(configCommand);

program
  .command('logout')
  .description('Clear session and API keys')
  .action(logoutCommand);


program.action(commitCommand);

program.parse();
