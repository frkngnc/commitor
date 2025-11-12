


export type {
  ChangeType,
  CommitType,
  FileChange,
  DiffStats,
  GitDiff
} from './git/types.js';

export type AIProvider = 'openai' | 'anthropic';
export type ConnectionType = 'api' | 'browser';
export type Language = 'tr' | 'en';
export type LanguagePreference = Language | 'auto' | 'custom';

export interface CommitorConfig {
  provider: AIProvider;
  connectionType: ConnectionType;
  language: LanguagePreference;
  customLanguage?: string;
  apiKey?: string;
  sessionPath?: string;
}

export interface CommitMessage {
  title: string;      
  body: string;       
  raw: string;        
  type: string;       
  scope?: string;     
}

export interface AIProviderInterface {
  generateMessage(diff: any, language: Language): Promise<string>;
  healthCheck(): Promise<boolean>;
}
