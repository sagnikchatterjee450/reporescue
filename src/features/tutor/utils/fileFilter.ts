/**
 * Smart file filtering & importance ranking for repository ingestion
 */

// Patterns to exclude completely from AI ingestion
const IGNORED_DIRECTORIES = [
  'node_modules',
  '.git',
  'dist',
  'build',
  'out',
  'target',
  'vendor',
  '.next',
  '.nuxt',
  'coverage',
  '.turbo',
  '.cache',
  'tmp',
  'temp',
  '.idea',
  '.vscode',
  '__pycache__',
  '.pytest_cache',
  'venv',
  '.venv',
  'env',
  'pods',
];

const IGNORED_EXTENSIONS = [
  // Images & Media
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.ico',
  '.svg',
  '.webp',
  '.mp4',
  '.mp3',
  '.wav',
  '.pdf',
  // Binaries & Archives
  '.exe',
  '.bin',
  '.dll',
  '.so',
  '.dylib',
  '.zip',
  '.tar',
  '.gz',
  '.7z',
  '.rar',
  '.jar',
  '.war',
  // Fonts
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
  '.otf',
  // Lockfiles & Minified assets
  '.min.js',
  '.min.css',
  '.map',
  '.lock',
];

const LOCKFILE_EXACT_NAMES = [
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  'cargo.lock',
  'poetry.lock',
  'gemfile.lock',
  'composer.lock',
];

export interface FileFilterOptions {
  maxFileSize?: number; // bytes
}

export function isIngestableFile(path: string, size?: number, options?: FileFilterOptions): boolean {
  if (!path) return false;
  const normalized = path.replace(/\\/g, '/');
  const filename = normalized.split('/').pop() || '';
  const lowerPath = normalized.toLowerCase();
  const lowerName = filename.toLowerCase();

  // Size limit check
  const maxBytes = options?.maxFileSize ?? 250 * 1024;
  if (size && size > maxBytes) {
    return false;
  }

  // Directory segment check
  const segments = lowerPath.split('/');
  for (const dir of IGNORED_DIRECTORIES) {
    if (segments.includes(dir)) {
      return false;
    }
  }

  // Exact lockfile names
  if (LOCKFILE_EXACT_NAMES.includes(lowerName)) {
    return false;
  }

  // Extensions
  for (const ext of IGNORED_EXTENSIONS) {
    if (lowerName.endsWith(ext)) {
      return false;
    }
  }

  return true;
}

/**
 * Calculates priority weight for ranking files (higher = more critical for architecture understanding)
 */
export function getFilePriorityScore(filePath: string): number {
  const normalized = filePath.replace(/\\/g, '/').toLowerCase();
  const name = normalized.split('/').pop() || '';

  // 1. Core Documentation (Highest)
  if (name === 'readme.md' || name === 'readme') return 1000;
  if (name === 'architecture.md' || name === 'contributing.md') return 900;

  // 2. Project Manifests & Configurations
  if (
    name === 'package.json' ||
    name === 'cargo.toml' ||
    name === 'pyproject.toml' ||
    name === 'go.mod' ||
    name === 'pom.xml' ||
    name === 'build.gradle'
  ) {
    return 850;
  }

  // 3. Main entry points
  if (
    name === 'main.ts' ||
    name === 'main.js' ||
    name === 'index.ts' ||
    name === 'index.js' ||
    name === 'server.ts' ||
    name === 'server.js' ||
    name === 'app.tsx' ||
    name === 'app.jsx' ||
    name === 'app.ts' ||
    name === 'main.go' ||
    name === 'main.py' ||
    name === 'app.py'
  ) {
    return 800;
  }

  // 4. Configuration files
  if (
    name.includes('config') ||
    name.includes('.env.example') ||
    name === 'dockerfile' ||
    name.includes('docker-compose') ||
    name === 'tsconfig.json'
  ) {
    return 700;
  }

  // 5. Architecture & Core Routes / Models / Controllers
  if (
    normalized.includes('/routes/') ||
    normalized.includes('/controllers/') ||
    normalized.includes('/models/') ||
    normalized.includes('/api/') ||
    normalized.includes('/core/') ||
    normalized.includes('/services/')
  ) {
    return 600;
  }

  // 6. Components / Views
  if (
    normalized.includes('/components/') ||
    normalized.includes('/views/') ||
    normalized.includes('/pages/')
  ) {
    return 400;
  }

  // 7. Tests & CI
  if (
    normalized.includes('test') ||
    normalized.includes('spec') ||
    normalized.includes('.github/workflows')
  ) {
    return 300;
  }

  // 8. General source files
  return 100;
}

export function rankAndFilterFiles<T extends { path: string; size?: number }>(
  files: T[],
  limit = 120
): T[] {
  return files
    .filter((f) => isIngestableFile(f.path, f.size))
    .sort((a, b) => getFilePriorityScore(b.path) - getFilePriorityScore(a.path))
    .slice(0, limit);
}
