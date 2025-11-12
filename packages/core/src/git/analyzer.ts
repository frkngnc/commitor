

import { simpleGit, SimpleGit, DiffResult } from 'simple-git';
import { GitDiff, FileChange, DiffStats, CommitType, ChangeType, AnalyzerOptions } from './types.js';

export class GitAnalyzer {
  private git: SimpleGit;
  private cwd: string;

  constructor(options: AnalyzerOptions = {}) {
    this.cwd = options.cwd || process.cwd();
    this.git = simpleGit({ baseDir: this.cwd });
  }

  
  async analyzeStagedChanges(): Promise<GitDiff> {
    
    const isRepo = await this.git.checkIsRepo();
    if (!isRepo) {
      throw new Error('Not a git repository. Initialize git first.');
    }

    
    const branch = await this.getCurrentBranch();

    
    const status = await this.git.status();
    const stagedFiles = [
      ...status.staged,
      ...status.created,
      ...status.deleted,
      ...status.renamed.map(r => r.to)
    ];

    if (stagedFiles.length === 0) {
      throw new Error('No staged changes found. Use "git add" to stage files.');
    }

    
    const diffResult = await this.git.diff(['--cached', '--numstat']);
    const files = await this.parseDiffResult(diffResult, status);

    
    const stats = this.calculateStats(files);

    
    const type = this.detectCommitType(files);

    return {
      files,
      stats,
      branch,
      type
    };
  }

  
  private async getCurrentBranch(): Promise<string> {
    const branch = await this.git.branch();
    return branch.current;
  }

  
  private async parseDiffResult(diffResult: string, status: any): Promise<FileChange[]> {
    const files: FileChange[] = [];
    const lines = diffResult.split('\n').filter(line => line.trim());

    for (const line of lines) {
      const parts = line.split('\t');
      if (parts.length < 3) continue;

      const additions = parseInt(parts[0]) || 0;
      const deletions = parseInt(parts[1]) || 0;
      const path = parts[2];

      
      const type = this.getChangeType(path, status);

      
      const diff = await this.getFileDiff(path);

      const fileChange: FileChange = {
        path,
        type,
        additions,
        deletions,
        diff
      };

      
      const renamedFile = status.renamed.find((r: any) => r.to === path);
      if (renamedFile) {
        fileChange.oldPath = renamedFile.from;
      }

      files.push(fileChange);
    }

    return files;
  }

  
  private async getFileDiff(filePath: string): Promise<string> {
    try {
      const diff = await this.git.diff(['--cached', '--', filePath]);
      return diff;
    } catch (error) {
      return '';
    }
  }

  
  private getChangeType(path: string, status: any): ChangeType {
    if (status.created.includes(path)) return 'added';
    if (status.deleted.includes(path)) return 'deleted';
    if (status.renamed.find((r: any) => r.to === path)) return 'renamed';
    return 'modified';
  }

  
  private calculateStats(files: FileChange[]): DiffStats {
    return {
      totalFiles: files.length,
      totalAdditions: files.reduce((sum, f) => sum + f.additions, 0),
      totalDeletions: files.reduce((sum, f) => sum + f.deletions, 0)
    };
  }

  
  private detectCommitType(files: FileChange[]): CommitType {
    const paths = files.map(f => f.path.toLowerCase());

    
    if (paths.some(p => p.includes('readme') || p.includes('.md') || p.includes('doc'))) {
      if (files.every(f => f.path.match(/\.(md|txt|rst)$/i))) {
        return 'docs';
      }
    }

    
    if (paths.some(p =>
      p.includes('test') ||
      p.includes('spec') ||
      p.includes('__tests__') ||
      p.match(/\.(test|spec)\.(ts|js|tsx|jsx)$/)
    )) {
      return 'test';
    }

    
    if (paths.some(p =>
      p.match(/\.(css|scss|sass|less|styl)$/) ||
      p.includes('style') ||
      p.includes('theme')
    )) {
      return 'style';
    }

    
    if (paths.some(p =>
      p.match(/^(package\.json|tsconfig|webpack|vite|rollup|babel|eslint|prettier)/) ||
      p.includes('config') ||
      p.includes('.config.')
    )) {
      return 'chore';
    }

    
    const hasNewFiles = files.some(f => f.type === 'added');
    const hasSignificantAdditions = files.some(f => f.additions > f.deletions * 2);

    if (hasNewFiles || hasSignificantAdditions) {
      return 'feat';
    }

    
    const totalAdditions = files.reduce((sum, f) => sum + f.additions, 0);
    const totalDeletions = files.reduce((sum, f) => sum + f.deletions, 0);
    const ratio = totalAdditions / (totalDeletions || 1);

    if (ratio > 0.8 && ratio < 1.2) {
      return 'refactor';
    }

    
    if (files.some(f => f.type === 'modified' && f.deletions > 0)) {
      return 'fix';
    }

    
    return 'feat';
  }

  
  async hasStagedChanges(): Promise<boolean> {
    const status = await this.git.status();
    return status.staged.length > 0 ||
           status.created.length > 0 ||
           status.deleted.length > 0 ||
           status.renamed.length > 0;
  }

  
  async getRepoRoot(): Promise<string> {
    const root = await this.git.revparse(['--show-toplevel']);
    return root.trim();
  }
}
