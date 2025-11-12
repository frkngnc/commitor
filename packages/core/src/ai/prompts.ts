

import { GitDiff } from '../git/types.js';

export const TITLE_START = '<<COMMITOR_TITLE>>';
export const TITLE_END = '<<COMMITOR_TITLE_END>>';
export const BODY_START = '<<COMMITOR_BODY>>';
export const BODY_END = '<<COMMITOR_BODY_END>>';

export function buildPrompt(diff: GitDiff, language: string): string {
  const filesSummary = diff.files.map(file => {
    return `- ${file.path} (${file.type}): +${file.additions} -${file.deletions}`;
  }).join('\n');

  const detailedDiffs = diff.files.map(file => {
    return `\n### ${file.path}\n${file.diff}`;
  }).join('\n');

  const languageName = language?.trim().length ? language.trim() : 'English';
  const languageInstruction = `Write the commit message in ${languageName.toUpperCase()} language.`;

  return `Analyze the git changes and create a commit message in conventional commit format.

IMPORTANT OUTPUT FORMAT:
1. Return the result EXACTLY in the following structure (no extra text, explanations, or code fences):
${TITLE_START}
type(scope): short description
${TITLE_END}
${BODY_START}
- bullet line describing change
- another line
${BODY_END}
2. There must be exactly one line between each block.
3. Do not include additional commentary outside the markers.

${languageInstruction}

Branch: ${diff.branch}
Detected type: ${diff.type}

Changed files (${diff.stats.totalFiles}):
${filesSummary}

Statistics:
- Total additions: ${diff.stats.totalAdditions}
- Total deletions: ${diff.stats.totalDeletions}

Detailed changes:
${detailedDiffs}

Guidelines:
- Title: type(scope): description (max 50 characters, lowercase description)
- Body: concise bullet list describing key changes`;
}
