/**
 * Citation Guard: Verifies LLM cited file paths against repository tree
 */
import { Citation } from '../types';

export interface RepoTreeLookup {
  pathsSet: Set<string>;
  lowerMap: Map<string, string>; // lowercase to exact casing
}

export function buildRepoTreeLookup(filePaths: string[]): RepoTreeLookup {
  const pathsSet = new Set<string>();
  const lowerMap = new Map<string, string>();

  for (const p of filePaths) {
    const clean = p.replace(/^[./]+/, '').trim();
    pathsSet.add(clean);
    lowerMap.set(clean.toLowerCase(), clean);
  }

  return { pathsSet, lowerMap };
}

/**
 * Validates whether a file path exists in the repo tree
 */
export function verifyFilePath(path: string, lookup: RepoTreeLookup): { verified: boolean; canonicalPath: string } {
  const clean = path.replace(/^[./]+/, '').trim();
  if (lookup.pathsSet.has(clean)) {
    return { verified: true, canonicalPath: clean };
  }

  const lower = clean.toLowerCase();
  if (lookup.lowerMap.has(lower)) {
    return { verified: true, canonicalPath: lookup.lowerMap.get(lower)! };
  }

  // Check if it matches the end of any file path (e.g. LLM cited "App.tsx" instead of "src/App.tsx")
  for (const knownPath of lookup.pathsSet) {
    if (knownPath.endsWith('/' + clean) || knownPath === clean) {
      return { verified: true, canonicalPath: knownPath };
    }
  }

  return { verified: false, canonicalPath: clean };
}

/**
 * Extracts citations from AI response text
 * Matches patterns like:
 * - `src/index.ts`
 * - [src/app.tsx:12-40]
 * - src/components/Navbar.tsx:25
 * - (file: src/config.ts)
 */
export function extractAndGuardCitations(
  rawText: string,
  treeLookup: RepoTreeLookup
): { text: string; citations: Citation[] } {
  const citations: Citation[] = [];
  const seen = new Set<string>();

  // Pattern 1: `path/to/file.ext` or `path/to/file.ext:10-25`
  const codeSpanRegex = /`([a-zA-Z0-9_\-./]+\.[a-zA-Z0-9]{1,8})(?::(\d+(?:-\d+)?))?`/g;
  let match: RegExpExecArray | null;

  while ((match = codeSpanRegex.exec(rawText)) !== null) {
    const rawPath = match[1];
    const lines = match[2];
    const { verified, canonicalPath } = verifyFilePath(rawPath, treeLookup);

    // Filter out common false positives like "npm.js", "node.js" if not in repo
    if (!verified && (rawPath.startsWith('http') || !rawPath.includes('/'))) {
      continue;
    }

    const key = `${canonicalPath}:${lines || ''}`;
    if (!seen.has(key)) {
      seen.add(key);
      citations.push({
        filePath: canonicalPath,
        lines,
        isVerified: verified,
      });
    }
  }

  // Pattern 2: [path/to/file.ext:10-20]
  const bracketRegex = /\[([a-zA-Z0-9_\-./]+\.[a-zA-Z0-9]{1,8})(?::(\d+(?:-\d+)?))?\]/g;
  while ((match = bracketRegex.exec(rawText)) !== null) {
    const rawPath = match[1];
    const lines = match[2];
    const { verified, canonicalPath } = verifyFilePath(rawPath, treeLookup);

    const key = `${canonicalPath}:${lines || ''}`;
    if (!seen.has(key)) {
      seen.add(key);
      citations.push({
        filePath: canonicalPath,
        lines,
        isVerified: verified,
      });
    }
  }

  return { text: rawText, citations };
}
