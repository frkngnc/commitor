

import { CommitorCore, CommitMessage } from '@commitor/core';
import { Logger } from '../ui/logger.js';
import { Prompts } from '../ui/prompts.js';
import { LanguageDetector } from '../utils/language-detector.js';

const LANGUAGE_LABELS: Record<string, string> = {
  tr: 'Turkish',
  en: 'English'
};

function resolveLanguageLabel(value?: string): string {
  if (!value) {
    return '';
  }
  return LANGUAGE_LABELS[value] || value;
}

async function promptLanguageSelection(message: string): Promise<string> {
  const selection = await Prompts.selectLanguage({
    includeAuto: false,
    allowCustom: true,
    message
  });

  if (selection === 'custom') {
    return await Prompts.inputCustomLanguage();
  }

  return resolveLanguageLabel(selection) || 'English';
}

export async function commitCommand(): Promise<void> {
  try {
    Logger.header('Commitor - AI Commit Message Generator');

    
    let core: CommitorCore;
    try {
      core = await CommitorCore.fromConfig();
    } catch (error) {
      Logger.error('No configuration found');
      Logger.info('Run "commitor init" to set up Commitor');
      process.exit(1);
    }

    
    const spinner = Logger.spinner('Analyzing git changes...');
    let diff;
    try {
      diff = await core.analyzeGitDiff();
      spinner.succeed('Git changes analyzed');
    } catch (error: any) {
      spinner.fail('Failed to analyze git changes');
      Logger.error(error.message);
      process.exit(1);
    }

    
    Logger.newLine();
    Logger.fileChanges(diff.files);
    Logger.newLine();
    Logger.stats({
      files: diff.stats.totalFiles,
      additions: diff.stats.totalAdditions,
      deletions: diff.stats.totalDeletions
    });
    Logger.newLine();

    const config = core.getConfig();
    let languageToUse = '';

    if (config.language === 'auto') {
      const detector = new LanguageDetector(process.cwd());
      const detection = await detector.detect();
      if (detection.language) {
        const confidence = Math.round(detection.confidence * 100);
        languageToUse = resolveLanguageLabel(detection.language) || 'English';
        Logger.info(
          `Detected language: ${languageToUse} (${confidence}% confidence)`
        );
      } else {
        Logger.warning('Automatic language detection failed. Please choose a language.');
        languageToUse = await promptLanguageSelection('Select language for this commit:');
      }
    } else if (config.language === 'custom') {
      languageToUse = config.customLanguage?.trim() || '';
      if (!languageToUse) {
        Logger.warning('Custom language is not set. Please enter the language you want to use.');
        languageToUse = await Prompts.inputCustomLanguage();
      }
    } else {
      languageToUse = resolveLanguageLabel(config.language) || 'English';
    }

    if (!languageToUse) {
      languageToUse = 'English';
    }

    
    let message: CommitMessage;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      const generateSpinner = Logger.spinner(
        `Generating commit message with ${core.getProviderName()} (${languageToUse})...`
      );

      try {
        message = await core.generateCommitMessage(diff, languageToUse!);
        if (process.env.COMMITOR_DEBUG === '1') {
          Logger.info('--- DEBUG: Final commit message ---');
          Logger.log(message.raw);
          Logger.info('-----------------------------------');
        }
        generateSpinner.succeed('Commit message generated');
        break;
      } catch (error: any) {
        generateSpinner.fail('Failed to generate commit message');

        if (error.code === 'INVALID_API_KEY') {
          Logger.error('Invalid API key. Please run "commitor init" to reconfigure');
          process.exit(1);
        } else if (error.code === 'RATE_LIMIT') {
          Logger.error('Rate limit exceeded. Please try again later');
          process.exit(1);
        } else {
          Logger.error(error.message);

          attempts++;
          if (attempts < maxAttempts) {
            const retry = await Prompts.confirm('Retry?', true);
            if (!retry) {
              process.exit(1);
            }
          } else {
            Logger.error('Maximum retry attempts reached');
            process.exit(1);
          }
        }
      }
    }

    
    Logger.commitPreview(message!.raw);

    
    while (true) {
      const action = await Prompts.selectCommitAction();

      if (action === 'commit') {
        
        const commitSpinner = Logger.spinner('Committing changes...');

        try {
          const result = await core.commit(process.cwd(), message!);
          commitSpinner.succeed(`Committed successfully: ${result.hash}`);
          Logger.newLine();
          Logger.success(`Branch: ${result.branch}`);
          Logger.success(`Hash: ${result.hash}`);
          break;
        } catch (error: any) {
          commitSpinner.fail('Commit failed');
          Logger.error(error.message);
          process.exit(1);
        }
      } else if (action === 'edit') {
        
        const edited = await Prompts.editMessage(message!.raw);
        message!.raw = edited;
        Logger.commitPreview(message!.raw);
      } else if (action === 'regenerate') {
        
        const regenerateSpinner = Logger.spinner('Regenerating message...');

        try {
          message = await core.generateCommitMessage(diff, languageToUse!);
          regenerateSpinner.succeed('Message regenerated');
          Logger.commitPreview(message!.raw);
        } catch (error: any) {
          regenerateSpinner.fail('Regeneration failed');
          Logger.error(error.message);
        }
      } else if (action === 'cancel') {
        Logger.info('Commit cancelled');
        process.exit(0);
      }
    }
  } catch (error: any) {
    Logger.error(`Commit failed: ${error.message}`);
    process.exit(1);
  }
}
