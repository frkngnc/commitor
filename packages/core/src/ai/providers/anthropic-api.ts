

import Anthropic from '@anthropic-ai/sdk';
import { AIProvider, AIProviderOptions, GenerateMessageOptions, AIResponse, ProviderError } from '../types.js';
import { buildPrompt } from '../prompts.js';

export class AnthropicProvider implements AIProvider {
  private client: Anthropic;
  private model: string;

  constructor(options: AIProviderOptions) {
    if (!options.apiKey) {
      throw new Error('Anthropic API key is required');
    }

    this.client = new Anthropic({
      apiKey: options.apiKey
    });

    this.model = options.model || 'claude-sonnet-4-5-20250929';
  }

  async generateMessage(options: GenerateMessageOptions): Promise<AIResponse> {
    try {
      const systemPrompt = this.getSystemPrompt(options.language);
      const userPrompt = buildPrompt(options.diff, options.language);

      const completion = await this.client.messages.create({
        model: this.model,
        max_tokens: options.maxTokens || 1024,
        temperature: options.temperature || 0.7,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      });

      const firstBlock = completion.content[0];
      let responseText = '';

      if (firstBlock && firstBlock.type === 'text') {
        responseText = firstBlock.text;
      }

      if (!responseText) {
        throw new Error('No response from Anthropic');
      }

      return {
        message: responseText.trim(),
        raw: responseText,
        usage: completion.usage
          ? {
              promptTokens: completion.usage.input_tokens || 0,
              completionTokens: completion.usage.output_tokens || 0,
              totalTokens:
                (completion.usage.input_tokens || 0) + (completion.usage.output_tokens || 0)
            }
          : undefined
      };
    } catch (error: any) {
      throw this.toProviderError(error);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const completion = await this.client.messages.create({
        model: this.model,
        max_tokens: 10,
        messages: [
          {
            role: 'user',
            content: 'Hello'
          }
        ]
      });
      if (!completion.content || completion.content.length === 0) {
        throw new Error('Empty response from Anthropic');
      }
      return true;
    } catch (error: any) {
      throw this.toProviderError(error);
    }
  }

  getName(): string {
    return 'Anthropic (Claude)';
  }

  private getSystemPrompt(language: string): string {
    return `You are a professional software developer. You analyze git changes and create commit messages in conventional commit format.

Rules:
1. Use Conventional Commits format: type(scope): description
2. Types: feat, fix, docs, style, refactor, test, chore, perf
3. Scope: changed module/file area (optional)
4. Description: start lowercase, no period, max 50 characters
5. Body (optional): detailed explanation, each line max 72 characters
6. IMPORTANT: Write commit messages in ${language === 'tr' ? 'Turkish' : 'English'} language
7. OUTPUT FORMAT IS MANDATORY:
<<COMMITOR_TITLE>>
type(scope): description
<<COMMITOR_TITLE_END>>
<<COMMITOR_BODY>>
- bullet lines describing the change
<<COMMITOR_BODY_END>>

Example:
<<COMMITOR_TITLE>>
feat(auth): add JWT support for user authentication
<<COMMITOR_TITLE_END>>
<<COMMITOR_BODY>>
- Token-based authentication system
- Login and logout endpoints
- Route protection with middleware
<<COMMITOR_BODY_END>>`;
  }

  private toProviderError(error: any): ProviderError {
    const providerError: ProviderError = {
      code: error.code || 'ANTHROPIC_ERROR',
      message: error.message || 'Failed to communicate with Anthropic',
      provider: 'anthropic'
    };

    if (error.status === 401) {
      providerError.code = 'INVALID_API_KEY';
      providerError.message = 'Invalid Anthropic API key';
    } else if (error.status === 429) {
      providerError.code = 'RATE_LIMIT';
      providerError.message = 'Anthropic rate limit exceeded';
    } else if (error.status === 500) {
      providerError.code = 'SERVER_ERROR';
      providerError.message = 'Anthropic server error';
    }

    return providerError;
  }
}
