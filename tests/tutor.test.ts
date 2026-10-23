import { describe, it, expect } from 'vitest';
import { isIngestableFile, getFilePriorityScore, rankAndFilterFiles } from '../src/features/tutor/utils/fileFilter';
import { buildRepoTreeLookup, verifyFilePath, extractAndGuardCitations } from '../src/features/tutor/utils/citationGuard';
import { sanitizeAndRepairMermaid } from '../src/features/tutor/utils/mermaidHelper';
import { generateOnboardingMarkdown } from '../src/features/tutor/utils/markdownExporter';
import { TASKFLOW_TUTOR_MODEL } from '../src/features/tutor/data/taskflowTutorDemo';

describe('Tutor File Filter & Ingestion', () => {
  it('should ignore node_modules, .git, lockfiles, and images', () => {
    expect(isIngestableFile('node_modules/react/index.js')).toBe(false);
    expect(isIngestableFile('.git/config')).toBe(false);
    expect(isIngestableFile('package-lock.json')).toBe(false);
    expect(isIngestableFile('yarn.lock')).toBe(false);
    expect(isIngestableFile('assets/logo.png')).toBe(false);
    expect(isIngestableFile('dist/bundle.min.js')).toBe(false);
  });

  it('should accept valid source and documentation files', () => {
    expect(isIngestableFile('README.md')).toBe(true);
    expect(isIngestableFile('src/index.ts')).toBe(true);
    expect(isIngestableFile('package.json')).toBe(true);
    expect(isIngestableFile('src/core/Queue.ts')).toBe(true);
  });

  it('should reject files exceeding max size limit', () => {
    expect(isIngestableFile('large-file.ts', 500 * 1024, { maxFileSize: 250 * 1024 })).toBe(false);
    expect(isIngestableFile('normal-file.ts', 50 * 1024, { maxFileSize: 250 * 1024 })).toBe(true);
  });

  it('should prioritize README and manifests higher than internal components', () => {
    const readmeScore = getFilePriorityScore('README.md');
    const packageScore = getFilePriorityScore('package.json');
    const entryScore = getFilePriorityScore('src/index.ts');
    const componentScore = getFilePriorityScore('src/components/Button.tsx');

    expect(readmeScore).toBeGreaterThan(packageScore);
    expect(packageScore).toBeGreaterThan(entryScore);
    expect(entryScore).toBeGreaterThan(componentScore);
  });

  it('should rank and filter file collections properly', () => {
    const files = [
      { path: 'node_modules/a.js' },
      { path: 'src/components/Footer.tsx' },
      { path: 'package.json' },
      { path: 'README.md' },
      { path: 'package-lock.json' },
    ];
    const ranked = rankAndFilterFiles(files);
    expect(ranked.length).toBe(3);
    expect(ranked[0].path).toBe('README.md');
    expect(ranked[1].path).toBe('package.json');
    expect(ranked[2].path).toBe('src/components/Footer.tsx');
  });
});

describe('Tutor Citation Guard', () => {
  const treeLookup = buildRepoTreeLookup([
    'src/index.ts',
    'src/core/Queue.ts',
    'src/workers/Worker.ts',
    'package.json',
  ]);

  it('should verify existing file paths', () => {
    const check1 = verifyFilePath('src/index.ts', treeLookup);
    expect(check1.verified).toBe(true);
    expect(check1.canonicalPath).toBe('src/index.ts');

    // Case insensitivity
    const check2 = verifyFilePath('SRC/INDEX.TS', treeLookup);
    expect(check2.verified).toBe(true);
    expect(check2.canonicalPath).toBe('src/index.ts');

    // Suffix match
    const check3 = verifyFilePath('Queue.ts', treeLookup);
    expect(check3.verified).toBe(true);
    expect(check3.canonicalPath).toBe('src/core/Queue.ts');
  });

  it('should mark non-existent file paths as unverified', () => {
    const check = verifyFilePath('src/nonexistent/Fake.ts', treeLookup);
    expect(check.verified).toBe(false);
  });

  it('should extract citations from AI text and guard them', () => {
    const rawText = 'Look at `src/core/Queue.ts:10-25` and also `src/missing/Ghost.ts` for details.';
    const result = extractAndGuardCitations(rawText, treeLookup);

    expect(result.citations.length).toBe(2);

    const verified = result.citations.find((c) => c.filePath === 'src/core/Queue.ts');
    expect(verified).toBeDefined();
    expect(verified?.isVerified).toBe(true);
    expect(verified?.lines).toBe('10-25');

    const unverified = result.citations.find((c) => c.filePath === 'src/missing/Ghost.ts');
    expect(unverified).toBeDefined();
    expect(unverified?.isVerified).toBe(false);
  });
});

describe('Tutor Mermaid Diagram Helper', () => {
  it('should auto-repair unquoted bracket labels', () => {
    const input = 'graph TD\n  A[Entry (Main File)] --> B[Core]';
    const result = sanitizeAndRepairMermaid(input);
    expect(result.isValid).toBe(true);
    expect(result.sanitizedMermaid).toContain('["Entry (Main File)"]');
  });

  it('should add missing graph TD header if omitted', () => {
    const input = 'A --> B\nB --> C';
    const result = sanitizeAndRepairMermaid(input);
    expect(result.isValid).toBe(true);
    expect(result.sanitizedMermaid.startsWith('graph TD')).toBe(true);
  });
});

describe('Tutor Markdown Exporter', () => {
  it('should generate valid ONBOARDING.md content from RepoModel', () => {
    const md = generateOnboardingMarkdown(TASKFLOW_TUTOR_MODEL);
    expect(md).toContain('# Developer Onboarding Guide: taskflow');
    expect(md).toContain('## 1. Overview');
    expect(md).toContain('## 2. Tech Stack & Dependencies');
    expect(md).toContain('## 3. Entry Points & Core Architecture');
    expect(md).toContain('## 4. Local Development Setup');
    expect(md).toContain('```mermaid');
    expect(md).toContain('## 6. Recommended Reading Order');
    expect(md).toContain('## 7. Conventions & Known Gotchas');
  });
});
