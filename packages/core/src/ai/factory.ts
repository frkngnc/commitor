

import { CommitorConfig } from '../types.js';
import { AIProvider, AIProviderOptions } from './types.js';
import { OpenAIProvider } from './providers/openai-api.js';
import { AnthropicProvider } from './providers/anthropic-api.js';

export class AIProviderFactory {
  
  static create(config: CommitorConfig): AIProvider {
    
    if (!config.provider) {
      throw new Error('AI provider not specified in configuration');
    }

    
    if (config.connectionType === 'browser') {
      throw new Error('Browser mode not implemented yet. Use API mode.');
    }

    
    if (config.connectionType === 'api' && !config.apiKey) {
      throw new Error('API key is required for API connection mode');
    }

    
    const options: AIProviderOptions = {
      apiKey: config.apiKey
    };

    
    switch (config.provider) {
      case 'openai':
        return new OpenAIProvider(options);

      case 'anthropic':
        return new AnthropicProvider(options);

      default:
        throw new Error(`Unknown provider: ${config.provider}`);
    }
  }

  
  static async checkHealth(config: CommitorConfig): Promise<void> {
    const provider = this.create(config);
    await provider.healthCheck();
  }

  
  static getProviderName(config: CommitorConfig): string {
    switch (config.provider) {
      case 'openai':
        return 'OpenAI (ChatGPT)';
      case 'anthropic':
        return 'Anthropic (Claude)';
      default:
        return 'Unknown';
    }
  }
}
