

import chalk from 'chalk';
import ora, { Ora } from 'ora';

export class Logger {
  
  static success(message: string): void {
    console.log(chalk.green('✓'), message);
  }

  
  static error(message: string): void {
    console.log(chalk.red('✗'), message);
  }

  
  static warning(message: string): void {
    console.log(chalk.yellow('⚠'), message);
  }

  
  static info(message: string): void {
    console.log(chalk.blue('ℹ'), message);
  }

  
  static log(message: string): void {
    console.log(message);
  }

  
  static newLine(): void {
    console.log();
  }

  
  static header(title: string): void {
    console.log();
    console.log(chalk.bold.cyan(`━━━ ${title} ━━━`));
    console.log();
  }

  
  static section(title: string): void {
    console.log();
    console.log(chalk.bold(title));
  }

  
  static spinner(text: string): Ora {
    return ora({
      text,
      color: 'cyan'
    }).start();
  }

  
  static fileChanges(files: Array<{ path: string; type: string; additions: number; deletions: number }>): void {
    console.log(chalk.bold('Changed Files:'));
    files.forEach((file, index) => {
      const icon = file.type === 'added' ? chalk.green('+') :
                   file.type === 'deleted' ? chalk.red('-') :
                   file.type === 'renamed' ? chalk.blue('→') :
                   chalk.yellow('~');

      console.log(`${icon} ${file.path} ${chalk.gray(`(+${file.additions} -${file.deletions})`)}`);
    });
  }

  
  static commitPreview(message: string): void {
    console.log();
    console.log(chalk.bold('Generated Commit Message:'));
    console.log(chalk.dim('─'.repeat(50)));
    console.log(chalk.white(message));
    console.log(chalk.dim('─'.repeat(50)));
    console.log();
  }

  
  static config(config: Record<string, any>): void {
    console.log();
    Object.entries(config).forEach(([key, value]) => {
      const displayValue = key.toLowerCase().includes('key') && value
        ? chalk.gray('***' + String(value).slice(-4))
        : chalk.cyan(String(value));

      console.log(`${chalk.bold(key)}: ${displayValue}`);
    });
    console.log();
  }

  
  static stats(stats: { files: number; additions: number; deletions: number }): void {
    console.log(
      chalk.gray(
        `${stats.files} file${stats.files !== 1 ? 's' : ''} changed, ` +
        chalk.green(`+${stats.additions}`) + ' ' +
        chalk.red(`-${stats.deletions}`)
      )
    );
  }
}
