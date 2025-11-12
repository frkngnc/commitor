

import { GitDiff } from '../git/types.js';

export interface AIProviderOptions {
  apiKey?: string;
  language?: string;
  model?: string;
}

export interface GenerateMessageOptions {
  diff: GitDiff;
  language: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIResponse {
  message: string;
  raw: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIProvider {
  
  generateMessage(options: GenerateMessageOptions): Promise<AIResponse>;

  
  healthCheck(): Promise<boolean>;

  
  getName(): string;
}

export interface ProviderError {
  code: string;
  message: string;
  provider: string;
}
