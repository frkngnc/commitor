

import { CommitorConfig, GitDiff, CommitMessage } from './types.js';
import { GitAnalyzer } from './git/analyzer.js';
import { GitCommitter, CommitResult } from './git/commit.js';
import { ConfigStore } from './config/store.js';
import { MessageGenerator } from './generator/message-generator.js';
import { AIProviderFactory } from './ai/factory.js';

export class CommitorCore {
  private config: CommitorConfig;
  private analyzer: GitAnalyzer;
  private committer: GitCommitter;
  private configStore: ConfigStore;
  private messageGenerator: MessageGenerator;

  constructor(config: CommitorConfig) {
    this.config = config;
    this.analyzer = new GitAnalyzer();
    this.committer = new GitCommitter();
    this.configStore = new ConfigStore();
    this.messageGenerator = new MessageGenerator(config);
  }

  
  static async fromConfig(): Promise<CommitorCore> {
    const store = new ConfigStore();
    const config = await store.load();

    if (!config) {
      throw new Error('No configuration found. Run initialization first.');
    }

    return new CommitorCore(config);
  }

  
  async analyzeGitDiff(repoPath: string = process.cwd()): Promise<GitDiff> {
    const analyzer = new GitAnalyzer({ cwd: repoPath });
    return await analyzer.analyzeStagedChanges();
  }

  
  async generateCommitMessage(diff: GitDiff, language: string): Promise<CommitMessage> {
    return await this.messageGenerator.generate(diff, language);
  }

  
  async checkProviderHealth(): Promise<boolean> {
    try {
      await AIProviderFactory.checkHealth(this.config);
      return true;
    } catch {
      return false;
    }
  }

  
  getProviderName(): string {
    return this.messageGenerator.getProviderName();
  }

  
  async commit(repoPath: string, message: CommitMessage): Promise<CommitResult> {
    const committer = new GitCommitter(repoPath);
    return await committer.commit({
      message: message.raw
    });
  }

  
  async saveConfig(config: CommitorConfig): Promise<void> {
    await this.configStore.save(config);
    this.config = config;
  }

  
  async loadConfig(): Promise<CommitorConfig | null> {
    return await this.configStore.load();
  }

  
  async updateConfig(partialConfig: Partial<CommitorConfig>): Promise<void> {
    await this.configStore.update(partialConfig);
    this.config = { ...this.config, ...partialConfig };
  }

  
  async clearSession(): Promise<void> {
    await this.configStore.clear();
  }

  
  async hasConfig(): Promise<boolean> {
    return await this.configStore.exists();
  }

  
  getConfig(): CommitorConfig {
    return { ...this.config };
  }

  
  getConfigPath(): string {
    return this.configStore.getConfigPath();
  }
}
