

import { AIProvider, ConnectionType, LanguagePreference } from '../types.js';

export interface CommitorConfig {
  provider: AIProvider;
  connectionType: ConnectionType;
  language: LanguagePreference;
  customLanguage?: string;
  apiKey?: string;
  sessionPath?: string;
}

export interface ConfigValidationError {
  field: string;
  message: string;
}

export interface ConfigStoreOptions {
  configName?: string;
  cwd?: string;
}

export const DEFAULT_CONFIG: CommitorConfig = {
  provider: 'openai',
  connectionType: 'api',
  language: 'auto'
};
