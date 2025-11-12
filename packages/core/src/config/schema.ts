

import { CommitorConfig, ConfigValidationError } from './types.js';
import { AIProvider, ConnectionType, Language } from '../types.js';

const VALID_PROVIDERS: AIProvider[] = ['openai', 'anthropic'];
const VALID_CONNECTION_TYPES: ConnectionType[] = ['api', 'browser'];
const VALID_LANGUAGES: Language[] = ['tr', 'en'];

export class ConfigSchema {
  
  static validate(config: Partial<CommitorConfig>): ConfigValidationError[] {
    const errors: ConfigValidationError[] = [];

    
    if (!config.provider) {
      errors.push({
        field: 'provider',
        message: 'Provider is required'
      });
    } else if (!VALID_PROVIDERS.includes(config.provider)) {
      errors.push({
        field: 'provider',
        message: `Provider must be one of: ${VALID_PROVIDERS.join(', ')}`
      });
    }

    
    if (!config.connectionType) {
      errors.push({
        field: 'connectionType',
        message: 'Connection type is required'
      });
    } else if (!VALID_CONNECTION_TYPES.includes(config.connectionType)) {
      errors.push({
        field: 'connectionType',
        message: `Connection type must be one of: ${VALID_CONNECTION_TYPES.join(', ')}`
      });
    }

    
    if (!config.language) {
      errors.push({
        field: 'language',
        message: 'Language is required'
      });
    } else if (config.language === 'custom') {
      if (!config.customLanguage || config.customLanguage.trim().length === 0) {
        errors.push({
          field: 'customLanguage',
          message: 'Custom language name is required when language is set to custom'
        });
      }
    } else if (config.language !== 'auto' && !VALID_LANGUAGES.includes(config.language)) {
      errors.push({
        field: 'language',
        message: `Language must be one of: auto, ${VALID_LANGUAGES.join(', ')}`
      });
    }

    
    if (config.connectionType === 'api' && !config.apiKey) {
      errors.push({
        field: 'apiKey',
        message: 'API key is required when using API connection type'
      });
    }

    
    if (config.apiKey) {
      const apiKeyError = this.validateApiKey(config.apiKey, config.provider!);
      if (apiKeyError) {
        errors.push(apiKeyError);
      }
    }

    
    if (config.sessionPath) {
      const sessionPathError = this.validateSessionPath(config.sessionPath);
      if (sessionPathError) {
        errors.push(sessionPathError);
      }
    }

    return errors;
  }

  
  private static validateApiKey(apiKey: string, provider: AIProvider): ConfigValidationError | null {
    
    if (provider === 'openai' && !apiKey.startsWith('sk-')) {
      return {
        field: 'apiKey',
        message: 'OpenAI API key must start with "sk-"'
      };
    }

    
    if (provider === 'anthropic' && !apiKey.startsWith('sk-ant-')) {
      return {
        field: 'apiKey',
        message: 'Anthropic API key must start with "sk-ant-"'
      };
    }

    
    if (apiKey.length < 20) {
      return {
        field: 'apiKey',
        message: 'API key is too short'
      };
    }

    return null;
  }

  
  private static validateSessionPath(path: string): ConfigValidationError | null {
    if (!path || path.trim().length === 0) {
      return {
        field: 'sessionPath',
        message: 'Session path cannot be empty'
      };
    }

    
    if (path.includes('..')) {
      return {
        field: 'sessionPath',
        message: 'Session path cannot contain ".."'
      };
    }

    return null;
  }

  
  static isValid(config: Partial<CommitorConfig>): boolean {
    return this.validate(config).length === 0;
  }

  
  static getErrorMessages(config: Partial<CommitorConfig>): string[] {
    return this.validate(config).map(error => `${error.field}: ${error.message}`);
  }
}
