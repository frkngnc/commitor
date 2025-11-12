

import { DiffResult, StatusResult } from 'simple-git';

export type ChangeType = 'added' | 'modified' | 'deleted' | 'renamed';
export type CommitType = 'feat' | 'fix' | 'refactor' | 'docs' | 'test' | 'chore' | 'style' | 'perf';

export interface FileChange {
  path: string;
  type: ChangeType;
  additions: number;
  deletions: number;
  diff: string;
  oldPath?: string; 
}

export interface DiffStats {
  totalFiles: number;
  totalAdditions: number;
  totalDeletions: number;
}

export interface GitDiff {
  files: FileChange[];
  stats: DiffStats;
  branch: string;
  type: CommitType;
}

export interface GitStatus {
  staged: string[];
  modified: string[];
  deleted: string[];
  created: string[];
  renamed: Array<{ from: string; to: string }>;
  notStaged: string[];
  untracked: string[];
  conflicted: string[];
  current: string;
  tracking: string | null;
  ahead: number;
  behind: number;
}

export interface AnalyzerOptions {
  cwd?: string;
  includeUnstaged?: boolean;
}

export interface CommitOptions {
  message: string;
  cwd?: string;
  allowEmpty?: boolean;
}


export type { DiffResult, StatusResult };
