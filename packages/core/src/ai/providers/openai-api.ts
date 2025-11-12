

import OpenAI from 'openai';
import { AIProvider, AIProviderOptions, GenerateMessageOptions, AIResponse, ProviderError } from '../types.js';
import { buildPrompt } from '../prompts.js';

export class OpenAIProvider implements AIProvider {
  private client: OpenAI;
  private model: string;

  constructor(options: AIProviderOptions) {
    if (!options.apiKey) {
      throw new Error('OpenAI API key is required');
    }

    this.client = new OpenAI({
      apiKey: options.apiKey
    });

    this.model = options.model || 'gpt-4o-mini';
  }

  async generateMessage(options: GenerateMessageOptions): Promise<AIResponse> {
    try {
      const prompt = buildPrompt(options.diff, options.language);

      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(options.language)
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 500
      });

      const message = completion.choices[0]?.message?.content || '';

      if (!message) {
        throw new Error('No response from OpenAI');
      }

      return {
        message: message.trim(),
        raw: message,
        usage: completion.usage
          ? {
              promptTokens: completion.usage.prompt_tokens,
              completionTokens: completion.usage.completion_tokens,
              totalTokens: completion.usage.total_tokens
            }
          : undefined
      };
    } catch (error: any) {
      throw this.toProviderError(error);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.client.models.retrieve(this.model);
      return true;
    } catch (error: any) {
      throw this.toProviderError(error);
    }
  }

  getName(): string {
    return 'OpenAI';
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
      code: error.code || 'OPENAI_ERROR',
      message: error.message || 'Failed to communicate with OpenAI',
      provider: 'openai'
    };

    if (error.status === 401) {
      providerError.code = 'INVALID_API_KEY';
      providerError.message = 'Invalid OpenAI API key';
    } else if (error.status === 429) {
      providerError.code = 'RATE_LIMIT';
      providerError.message = 'OpenAI rate limit exceeded';
    } else if (error.status === 500) {
      providerError.code = 'SERVER_ERROR';
      providerError.message = 'OpenAI server error';
    }

    return providerError;
  }
}
