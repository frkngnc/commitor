

import { simpleGit, SimpleGit } from 'simple-git';
import { CommitOptions } from './types.js';

export interface CommitResult {
  hash: string;
  message: string;
  branch: string;
  success: boolean;
}

export class GitCommitter {
  private git: SimpleGit;
  private cwd: string;

  constructor(cwd: string = process.cwd()) {
    this.cwd = cwd;
    this.git = simpleGit({ baseDir: this.cwd });
  }

  
  async commit(options: CommitOptions): Promise<CommitResult> {
    const { message, allowEmpty = false } = options;

    
    const isRepo = await this.git.checkIsRepo();
    if (!isRepo) {
      throw new Error('Not a git repository');
    }

    
    if (!allowEmpty) {
      const status = await this.git.status();
      const hasStagedChanges = status.staged.length > 0 ||
                               status.created.length > 0 ||
                               status.deleted.length > 0 ||
                               status.renamed.length > 0;

      if (!hasStagedChanges) {
        throw new Error('No staged changes to commit');
      }
    }

    
    const branch = await this.git.branch();
    const currentBranch = branch.current;

    
    const commitOptions = allowEmpty ? { '--allow-empty': null } : undefined;
    const result = await this.git.commit(message, commitOptions as any);

    return {
      hash: result.commit.substring(0, 7), 
      message,
      branch: currentBranch,
      success: true
    };
  }

  
  async amendCommit(message: string): Promise<CommitResult> {
    const isRepo = await this.git.checkIsRepo();
    if (!isRepo) {
      throw new Error('Not a git repository');
    }

    
    const branch = await this.git.branch();
    const currentBranch = branch.current;

    
    await this.git.commit(message, { '--amend': null } as any);

    
    const log = await this.git.log(['-1']);
    const hash = log.latest?.hash.substring(0, 7) || 'unknown';

    return {
      hash,
      message,
      branch: currentBranch,
      success: true
    };
  }

  
  async getLastCommitMessage(): Promise<string> {
    const log = await this.git.log(['-1']);
    return log.latest?.message || '';
  }

  
  async hasCommits(): Promise<boolean> {
    try {
      const log = await this.git.log(['-1']);
      return log.total > 0;
    } catch {
      return false;
    }
  }

  
  async getCommitHistory(limit: number = 10): Promise<Array<{
    hash: string;
    message: string;
    author: string;
    date: string;
  }>> {
    const log = await this.git.log([`-${limit}`]);

    return log.all.map(commit => ({
      hash: commit.hash.substring(0, 7),
      message: commit.message,
      author: commit.author_name,
      date: commit.date
    }));
  }
}
