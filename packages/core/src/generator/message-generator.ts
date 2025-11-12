

import { CommitMessage, CommitorConfig, GitDiff } from '../types.js';
import { AIProviderFactory } from '../ai/factory.js';
import { AIProvider } from '../ai/types.js';
import { TITLE_START, TITLE_END, BODY_START, BODY_END } from '../ai/prompts.js';

export class MessageGenerator {
  private provider: AIProvider;

  constructor(config: CommitorConfig) {
      this.provider = AIProviderFactory.create(config);
  }

  
  async generate(diff: GitDiff, language: string): Promise<CommitMessage> {
    const response = await this.provider.generateMessage({
      diff,
      language
    });

    if (process.env.COMMITOR_DEBUG_AI === '1') {
      console.log('\n[commitor:debug] Raw AI output:\n');
      console.log(response.message);
      console.log('\n[commitor:debug] ---------- end ----------\n');
    }

    const commitMessage = this.parseCommitMessage(response.message);
    if (process.env.COMMITOR_DEBUG === '1') {
      console.log('\n[commitor:debug] Parsed commit message:');
      console.log(JSON.stringify(commitMessage, null, 2));
      console.log('[commitor:debug] ---------- end ----------\n');
    }
    return commitMessage;
  }

  
  private parseCommitMessage(rawMessage: string): CommitMessage {
    const structured = this.parseStructuredMessage(rawMessage);
    if (structured) {
      return structured;
    }

    const normalizedLines = this.normalizeLines(
      rawMessage
        .split('\n')
        .map(line => this.cleanLine(line))
        .filter(Boolean)
    );

    if (normalizedLines.length === 0) {
      throw new Error('Empty commit message received from AI');
    }

    const conventionalPattern = /^(\w+)(?:\(([^)]+)\))?:\s*.+/;
    let titleIndex = normalizedLines.findIndex(line => conventionalPattern.test(line));
    for (let i = normalizedLines.length - 1; i >= 0; i--) {
      if (conventionalPattern.test(normalizedLines[i])) {
        titleIndex = i;
        break;
      }
    }

    const validTitleIndex = titleIndex >= 0 ? titleIndex : 0;
    const titleLine = normalizedLines[validTitleIndex];
    const bodySource = normalizedLines.slice(validTitleIndex + 1);
    const filteredBodyLines = bodySource.filter(line => {
      if (!line || conventionalPattern.test(line)) {
        return false;
      }
      return line.toLowerCase() !== titleLine.toLowerCase();
    });
    const seen = new Set<string>();
    const bodyLines: string[] = [];
    for (const line of filteredBodyLines) {
      const key = line.toLowerCase();
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      bodyLines.push(line);
    }
    const title = titleLine.trim();
    const body = bodyLines.join('\n').trim();

    
    const { type, scope } = this.parseTitle(title);

    
    const raw = body ? `${title}\n\n${body}` : title;

    return {
      title,
      body,
      raw,
      type,
      scope
    };
  }

  private parseStructuredMessage(raw: string): CommitMessage | null {
    const titleSection = this.extractSection(raw, TITLE_START, TITLE_END);
    const bodySection = this.extractSection(raw, BODY_START, BODY_END);

    if (!titleSection) {
      return null;
    }

    const title = titleSection.trim();
    const bodyLines = bodySection
      ? bodySection
          .split('\n')
          .map(line => line.trimEnd())
          .filter(line => line.length > 0)
      : [];
    const body = bodyLines.join('\n');

    const { type, scope } = this.parseTitle(title);
    const rawMessage = body ? `${title}\n\n${body}` : title;

    return {
      title,
      body,
      raw: rawMessage,
      type,
      scope
    };
  }

  private extractSection(source: string, start: string, end: string): string | null {
    const startIndex = source.indexOf(start);
    const endIndex = source.indexOf(end);

    if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
      return null;
    }

    return source.substring(startIndex + start.length, endIndex).trim();
  }

  private normalizeLines(lines: string[]): string[] {
    const normalized: string[] = [];

    for (const line of lines) {
      const titleMatch = line.match(/^title\s*:\s*(.+)$/i);
      if (titleMatch) {
        normalized.push(titleMatch[1].trim());
        continue;
      }

      const descriptionMatch = line.match(/^description\s*:\s*(.+)$/i);
      if (descriptionMatch) {
        normalized.push(descriptionMatch[1].trim());
        continue;
      }

      if (/^description\s*:?$/i.test(line)) {
        continue;
      }

      normalized.push(this.cleanLine(line));
    }

    return normalized;
  }

  private cleanLine(line: string): string {
    return line
      .replace(/[\u200B\u200C\u200D\uFEFF\u2060]/g, '')
      .replace(/^[*-]\s+/, '')
      .replace(/^[:\-–]+/, '')
      .trim();
  }

  
  private parseTitle(title: string): { type: string; scope?: string } {
    const conventionalPattern = /^(\w+)(?:\(([^)]+)\))?:\s*.+/;
    const match = title.match(conventionalPattern);

    if (match) {
      return {
        type: match[1],
        scope: match[2]
      };
    }

    return {
      type: 'chore'
    };
  }

  
  validateMessage(message: CommitMessage): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    
    if (message.title.length > 72) {
      errors.push('Title is too long (max 72 characters)');
    }

    
    const conventionalPattern = /^(\w+)(?:\(([^)]+)\))?:\s*.+/;
    if (!conventionalPattern.test(message.title)) {
      errors.push('Title does not follow conventional commit format');
    }

    
    if (message.body) {
      const bodyLines = message.body.split('\n');
      const longLines = bodyLines.filter(line => line.length > 72);
      if (longLines.length > 0) {
        errors.push('Some body lines are too long (max 72 characters per line)');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  
  getProviderName(): string {
    return this.provider.getName();
  }
}
