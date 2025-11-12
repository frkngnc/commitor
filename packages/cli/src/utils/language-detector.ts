import fs from 'fs';
import path from 'path';
import { simpleGit } from 'simple-git';
import { Language } from '@commitor/core';

type Score = { tr: number; en: number };

export interface LanguageDetectionResult {
  language: Language | null;
  confidence: number;
  details: Array<{ source: 'readme' | 'commits'; language: Language | null; confidence: number }>;
}

const TURKISH_CHARACTERS = ['ç', 'ğ', 'ı', 'ö', 'ş', 'ü', 'Ç', 'Ğ', 'İ', 'Ö', 'Ş', 'Ü'];
const TURKISH_WORDS = ['ve', 'bir', 'olarak', 'ile', 'için', 'değil', 'güncelle', 'ekle', 'kaldır'];
const ENGLISH_WORDS = ['the', 'and', 'for', 'with', 'update', 'add', 'remove', 'fix', 'refactor'];
const MIN_SCORE = 5;
const MIN_CONFIDENCE = 0.2;

export class LanguageDetector {
  constructor(private cwd: string = process.cwd()) {}

  async detect(): Promise<LanguageDetectionResult> {
    const sources = await Promise.all([this.fromReadme(), this.fromCommits()]);

    const totalScore = sources.reduce(
      (acc, current) => ({
        tr: acc.tr + current.score.tr,
        en: acc.en + current.score.en
      }),
      { tr: 0, en: 0 }
    );

    const language = this.resolveLanguage(totalScore);
    const confidence = this.calculateConfidence(totalScore);

    return {
      language,
      confidence,
      details: sources.map(source => ({
        source: source.source,
        language: this.resolveLanguage(source.score),
        confidence: this.calculateConfidence(source.score)
      }))
    };
  }

  private async fromReadme(): Promise<{ source: 'readme'; score: Score }> {
    try {
      const readmePath = path.join(this.cwd, 'README.md');
      if (!fs.existsSync(readmePath)) {
        return { source: 'readme', score: { tr: 0, en: 0 } };
      }
      const content = fs.readFileSync(readmePath, 'utf8');
      return { source: 'readme', score: this.scoreText(content) };
    } catch {
      return { source: 'readme', score: { tr: 0, en: 0 } };
    }
  }

  private async fromCommits(): Promise<{ source: 'commits'; score: Score }> {
    try {
      const git = simpleGit({ baseDir: this.cwd });
      const log = await git.log({ n: 25 });
      const combined = log.all.map(entry => entry.message || '').join('\n');
      return { source: 'commits', score: this.scoreText(combined) };
    } catch {
      return { source: 'commits', score: { tr: 0, en: 0 } };
    }
  }

  private scoreText(text: string): Score {
    const lower = text.toLowerCase();
    let trScore = 0;
    let enScore = 0;

    TURKISH_CHARACTERS.forEach(char => {
      trScore += this.countOccurrences(text, char) * 2;
    });

    TURKISH_WORDS.forEach(word => {
      trScore += this.countWordOccurrences(lower, word);
    });

    ENGLISH_WORDS.forEach(word => {
      enScore += this.countWordOccurrences(lower, word);
    });

    return { tr: trScore, en: enScore };
  }

  private countOccurrences(text: string, pattern: string): number {
    return text.split(pattern).length - 1;
  }

  private countWordOccurrences(text: string, word: string): number {
    const matches = text.match(new RegExp(`\\b${word}\\b`, 'g'));
    return matches ? matches.length : 0;
  }

  private resolveLanguage(score: Score): Language | null {
    const total = score.tr + score.en;
    if (total < MIN_SCORE) {
      return null;
    }
    const diff = Math.abs(score.tr - score.en);
    if (diff === 0) {
      return null;
    }
    const confidence = diff / total;
    if (confidence < MIN_CONFIDENCE) {
      return null;
    }
    return score.tr > score.en ? 'tr' : 'en';
  }

  private calculateConfidence(score: Score): number {
    const total = score.tr + score.en;
    if (total === 0) {
      return 0;
    }
    const diff = Math.abs(score.tr - score.en);
    return diff / total;
  }
}
