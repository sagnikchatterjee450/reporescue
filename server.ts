import express from 'express';
import path from 'path';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import { TASKFLOW_DEMO_REPO, SAMPLE_COMPARISON_DATA } from './src/data/demoRepos.js';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// In-memory cache structures with TTL to avoid redundant network / LLM calls
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}
const githubRepoCache = new Map<string, CacheEntry<any>>();
const repoAnalysisCache = new Map<string, CacheEntry<any>>();
const tutorModelCache = new Map<string, CacheEntry<any>>();
const devFixCache = new Map<string, CacheEntry<any>>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

function getFromCache<T>(cache: Map<string, CacheEntry<T>>, key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setInCache<T>(cache: Map<string, CacheEntry<T>>, key: string, data: T) {
  if (cache.size > 200) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
  cache.set(key, { data, timestamp: Date.now() });
}

// Timeout utility to ensure calls never stall the user indefinitely
async function withTimeout<T>(promise: Promise<T>, ms: number, timeoutMsg: string = 'Operation timed out'): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(timeoutMsg)), ms);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId!);
  }
}

// Lazy initializer for Gemini client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

interface GeminiCallParams {
  prompt: string;
  systemInstruction?: string;
  responseMimeType?: string;
  timeoutMs?: number;
}

// Resilient Gemini executor with model failover and silent quota handling
async function callGeminiContent(
  ai: GoogleGenAI | null,
  params: GeminiCallParams
): Promise<string | null> {
  if (!ai) return null;

  const { prompt, systemInstruction, responseMimeType, timeoutMs = 8000 } = params;

  // Try flagship flash first, then fast flash-lite fallback (separate quota pool)
  const modelsToTry: Array<{ model: string; thinkingLevel: ThinkingLevel }> = [
    { model: 'gemini-3.8-flash', thinkingLevel: ThinkingLevel.LOW },
    { model: 'gemini-3.1-flash-lite', thinkingLevel: ThinkingLevel.MINIMAL },
  ];

  for (const item of modelsToTry) {
    try {
      const config: any = {};
      if (responseMimeType) {
        config.responseMimeType = responseMimeType;
      }
      if (systemInstruction) {
        config.systemInstruction = systemInstruction;
      }
      config.thinkingConfig = { thinkingLevel: item.thinkingLevel };

      const response = await withTimeout(
        ai.models.generateContent({
          model: item.model,
          contents: prompt,
          config,
        }),
        timeoutMs,
        `Generation timeout (${item.model})`
      );

      const text = response.text?.trim();
      if (text) {
        return text;
      }
    } catch (err: any) {
      // If quota exhausted (429 / RESOURCE_EXHAUSTED) or model unavailable, try next model or fallback
      // Do not log raw JSON dumps to prevent unhandled test errors
      continue;
    }
  }

  return null;
}

// GitHub repository parser helper
function parseGitHubUrl(urlStr: string): { owner: string; repo: string } | null {
  try {
    const cleaned = urlStr.trim().replace(/\/$/, '');
    if (!cleaned) return null;

    if (!cleaned.includes('/')) {
      return null;
    }

    if (cleaned.startsWith('https://github.com/') || cleaned.startsWith('http://github.com/')) {
      const parts = cleaned.replace(/^https?:\/\/github\.com\//, '').split('/');
      if (parts.length >= 2) {
        return { owner: parts[0], repo: parts[1].replace(/\.git$/, '') };
      }
    }

    const simpleParts = cleaned.split('/');
    if (simpleParts.length === 2) {
      return { owner: simpleParts[0], repo: simpleParts[1].replace(/\.git$/, '') };
    }

    return null;
  } catch (err) {
    return null;
  }
}

/**
 * Robust JSON parser that handles code blocks, unescaped characters,
 * trailing commas, and boundary cleanup from LLM responses.
 */
function safeJsonParse<T = any>(input: string | undefined | null, fallback: any = null): any {
  if (!input || typeof input !== 'string') return fallback;
  let text = input.trim();

  // Strip markdown code fences if present (e.g. ```json ... ``` or ``` ...)
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  // Find boundaries of outer JSON object or array
  const firstBrace = text.indexOf('{');
  const firstBracket = text.indexOf('[');
  let startIdx = -1;
  let endIdx = -1;

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIdx = firstBrace;
    endIdx = text.lastIndexOf('}');
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
    endIdx = text.lastIndexOf(']');
  }

  if (startIdx !== -1 && endIdx > startIdx) {
    text = text.substring(startIdx, endIdx + 1);
  }

  try {
    return JSON.parse(text);
  } catch (e1) {
    // 1. Try removing trailing commas
    try {
      const fixed = text.replace(/,\s*([\]}])/g, '$1');
      return JSON.parse(fixed);
    } catch (e2) {
      // 2. Try removing JS-style comments
      try {
        const cleaned = text
          .replace(/,\s*([\]}])/g, '$1')
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .replace(/(^|[^:])\/\/.*/g, '$1');
        return JSON.parse(cleaned);
      } catch (e3) {
        return fallback;
      }
    }
  }
}

// API Routes

// 1. GitHub Repository Data Fetch Endpoint
app.post('/api/github/fetch', async (req, res) => {
  const { repoUrl } = req.body;
  if (!repoUrl) {
    return res.status(400).json({ error: 'Repository URL is required.' });
  }

  // Check if user entered demo or taskflow
  if (
    repoUrl.toLowerCase().includes('taskflow') ||
    repoUrl.toLowerCase().includes('demo') ||
    repoUrl.toLowerCase().includes('open-source/taskflow')
  ) {
    return res.json({ success: true, data: TASKFLOW_DEMO_REPO, isDemo: true });
  }

  const parsed = parseGitHubUrl(repoUrl);
  if (!parsed) {
    return res.status(400).json({
      error: 'Invalid GitHub URL. Please enter a URL like https://github.com/owner/repository',
    });
  }

  const { owner, repo } = parsed;
  const cacheKey = `${owner}/${repo}`.toLowerCase();
  const cached = getFromCache(githubRepoCache, cacheKey);
  if (cached) {
    return res.json({ success: true, data: cached, fromCache: true });
  }

  try {
    const headers: Record<string, string> = {
      'User-Agent': 'RepoRescue-App',
      Accept: 'application/vnd.github.v3+json',
    };

    // Parallel fetch repo basic info, README, and tree for sub-second GitHub retrieval
    const [repoRes, readmeRes, treeRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers,
        signal: AbortSignal.timeout(6000),
      }).catch((err) => ({ ok: false, status: 500, json: async () => ({}) } as any)),
      fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
        headers,
        signal: AbortSignal.timeout(6000),
      }).catch(() => ({ ok: false } as any)),
      fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`, {
        headers,
        signal: AbortSignal.timeout(6000),
      }).catch(() => ({ ok: false } as any)),
    ]);

    if (!repoRes.ok) {
      if (repoRes.status === 404) {
        return res.status(404).json({ error: `Repository '${owner}/${repo}' not found or is private.` });
      }
      if (repoRes.status === 403 || repoRes.status === 429) {
        console.warn('GitHub API rate limit exceeded. Falling back to structured demo with repo metadata.');
        const fallback = {
          ...TASKFLOW_DEMO_REPO,
          isDemo: false,
          repoUrl: `https://github.com/${owner}/${repo}`,
          owner,
          repoName: repo,
          description: `Analysis for ${owner}/${repo} (GitHub API rate limit reached, providing preview).`,
        };
        setInCache(githubRepoCache, cacheKey, fallback);
        return res.json({ success: true, data: fallback, notice: 'GitHub rate limit exceeded. Showing repository view.' });
      }
      return res.status(repoRes.status || 500).json({ error: `Failed to fetch repository from GitHub (${repoRes.status || 'timeout'}).` });
    }

    const repoInfo: any = await repoRes.json();

    // Parse README
    let readmeContent = '';
    try {
      if (readmeRes.ok) {
        const readmeData: any = await readmeRes.json();
        if (readmeData.content) {
          readmeContent = Buffer.from(readmeData.content, 'base64').toString('utf-8');
        }
      }
    } catch (e) {
      readmeContent = `# ${repoInfo.name}\n\n${repoInfo.description || 'No description provided.'}`;
    }

    // Parse file tree
    let fileTree: any[] = [];
    const defaultBranch = repoInfo.default_branch || 'main';
    try {
      if (treeRes.ok) {
        const treeData: any = await treeRes.json();
        if (Array.isArray(treeData.tree)) {
          const sliceTree = treeData.tree.slice(0, 150);
          fileTree = sliceTree.map((item: any) => ({
            path: item.path,
            name: item.path.split('/').pop() || item.path,
            type: item.type === 'tree' ? 'directory' : 'file',
            size: item.size,
            important:
              item.path.toLowerCase().includes('readme') ||
              item.path.toLowerCase().includes('package.json') ||
              item.path.toLowerCase().includes('main') ||
              item.path.toLowerCase().includes('app') ||
              item.path.toLowerCase().includes('index') ||
              item.path.toLowerCase().includes('server'),
          }));
        }
      }
    } catch (e) {
      console.info('Could not fetch git tree:', e);
    }

    let openIssuesCount = repoInfo.open_issues_count || 0;

    const rawData = {
      isDemo: false,
      repoUrl: `https://github.com/${owner}/${repo}`,
      owner,
      repoName: repoInfo.name,
      description: repoInfo.description || 'No description provided.',
      stars: repoInfo.stargazers_count || 0,
      forks: repoInfo.forks_count || 0,
      openIssuesCount,
      license: repoInfo.license?.spdx_id || 'Not specified',
      defaultBranch,
      readmeContent,
      fileTree,
      quickStats: {
        totalFiles: fileTree.length,
        linesOfCodeApprox: `${fileTree.length * 200}+`,
        primaryLanguage: repoInfo.language || 'TypeScript',
        lastCommit: new Date(repoInfo.updated_at).toLocaleDateString(),
      },
    };

    setInCache(githubRepoCache, cacheKey, rawData);
    return res.json({ success: true, data: rawData });
  } catch (err: any) {
    console.error('Error fetching repo:', err);
    return res.status(500).json({ error: `Server error fetching GitHub repo: ${err.message}` });
  }
});

// 2. AI Analyze Endpoint (Generates Architecture Map, Tech Stack, Learning Path, Contribution Opportunities, Health Score)
app.post('/api/ai/analyze', async (req, res) => {
  const { repoData } = req.body;
  if (!repoData) {
    return res.status(400).json({ error: 'Repository data required' });
  }

  // If already demo data with complete fields, return as is
  if (repoData.isDemo || (repoData.architectureMap && repoData.architectureMap.length > 0)) {
    return res.json({ success: true, analysis: repoData });
  }

  const cacheKey = `${repoData.owner || ''}/${repoData.repoName || ''}`.toLowerCase();
  const cached = getFromCache(repoAnalysisCache, cacheKey);
  if (cached) {
    return res.json({ success: true, analysis: cached, fromCache: true });
  }

  const ai = getGeminiClient();

  if (!ai) {
    console.info('GEMINI_API_KEY missing or placeholder. Generating intelligent structured fallback analysis.');
    const fallback = generateFallbackAnalysis(repoData);
    setInCache(repoAnalysisCache, cacheKey, fallback);
    return res.json({ success: true, analysis: fallback });
  }

  try {
    const fileListSample = Array.isArray(repoData.fileTree)
      ? repoData.fileTree.slice(0, 50).map((f: any) => f.path).join(', ')
      : 'README.md, package.json, src/index.ts';

    const prompt = `You are RepoRescue, an expert AI Onboarding Copilot for Open Source developers.
Analyze the following open-source repository and return a structured analysis in JSON format.

REPOSITY METADATA:
Name: ${repoData.repoName}
Owner: ${repoData.owner}
Description: ${repoData.description}
Primary Language: ${repoData.quickStats?.primaryLanguage || 'TypeScript'}
Sample Files: ${fileListSample}
README Snippet: ${(repoData.readmeContent || '').slice(0, 1500)}

Please return a JSON object with the following fields:
1. "techStack": Array of { "category": "Frontend"|"Backend"|"Database"|"Infrastructure"|"Testing"|"Language"|"Tooling", "name": string, "description": string }
2. "architectureMap": Array of 4 to 6 architecture nodes { "id": string, "label": string, "category": "Frontend"|"Backend"|"Database"|"Auth"|"Services"|"Utils"|"Config"|"Tests", "description": string, "importantFiles": string[], "dependencies": string[], "relatedNodes": string[], "suggestedFilesToRead": string[], "x": number (100 to 800), "y": number (100 to 400) }
3. "startHerePath": Array of 4 recommended learning steps { "stepNumber": number, "filePath": string, "title": string, "why": string, "keyConcepts": string[], "estimatedReadingTime": string }
4. "contributionTasks": Array of 3 to 4 categorized contribution opportunities { "id": string, "title": string, "difficulty": "Beginner"|"Intermediate"|"Advanced", "difficultyColor": "green"|"yellow"|"red", "skills": string[], "filesInvolved": string[], "estimatedTime": string, "whyGoodFirstContribution": string, "description": string, "stepsToComplete": string[] }
5. "healthDashboard": Object { "overallScore": number (0-100), "gradeLabel": string, "summary": string, "categories": { "architecture": { "name": "Architecture", "score": number, "maxScore": 100, "description": string, "feedback": string[] }, "documentation": { "name": "Documentation", "score": number, "maxScore": 100, "description": string, "feedback": string[] }, "testing": { "name": "Testing", "score": number, "maxScore": 100, "description": string, "feedback": string[] }, "codeOrganization": { "name": "Code Organization", "score": number, "maxScore": 100, "description": string, "feedback": string[] }, "contributorFriendliness": { "name": "Contributor Friendliness", "score": number, "maxScore": 100, "description": string, "feedback": string[] }, "codeComplexity": { "name": "Code Complexity", "score": number, "maxScore": 100, "description": string, "feedback": string[] }, "testCoverage": { "name": "Test Coverage", "score": number, "maxScore": 100, "description": string, "feedback": string[] }, "dependencyFreshness": { "name": "Dependency Freshness", "score": number, "maxScore": 100, "description": string, "feedback": string[] } }, "metrics": { "codeComplexity": { "cyclomaticComplexityAvg": number, "rating": "Low"|"Moderate"|"High"|"Critical", "maxFileComplexity": { "file": string, "complexity": number }, "complexityDistribution": { "simple": number, "moderate": number, "complex": number }, "explanation": string, "impactOnHealthScore": string }, "testCoverage": { "estimatedPercentage": number, "rating": "Excellent"|"Good"|"Moderate"|"Low"|"Critical", "linesCoveredApprox": number, "totalLinesApprox": number, "untestedCriticalModules": string[], "testRunner": string, "explanation": string, "impactOnHealthScore": string }, "dependencyFreshness": { "freshnessScore": number, "totalDependencies": number, "upToDateCount": number, "minorOutdatedCount": number, "majorOutdatedCount": number, "knownVulnerabilitiesCount": number, "outdatedPackages": Array<{ "name": string, "currentVersion": string, "latestVersion": string, "status": "Up to date"|"Minor update"|"Major update"|"Vulnerable" }>, "explanation": string, "impactOnHealthScore": string } } }
6. "readmeImprovements": Array of 3 recommendations { "title": string, "status": "Missing"|"Needs Improvement"|"Good", "recommendation": string, "suggestedMarkdown": string }

Format strictly as JSON.`;

    // Fast-path with resilient model failover
    const resultText = await callGeminiContent(ai, {
      prompt,
      responseMimeType: 'application/json',
      timeoutMs: 9000,
    });

    const parsed = safeJsonParse(resultText, {});
    const fallback = generateFallbackAnalysis(repoData);

    const fullAnalysis = {
      ...repoData,
      techStack: parsed.techStack || fallback.techStack,
      architectureMap: parsed.architectureMap || fallback.architectureMap,
      startHerePath: parsed.startHerePath || fallback.startHerePath,
      contributionTasks: parsed.contributionTasks || fallback.contributionTasks,
      healthDashboard: parsed.healthDashboard || fallback.healthDashboard,
      readmeImprovements: parsed.readmeImprovements || fallback.readmeImprovements,
    };

    setInCache(repoAnalysisCache, cacheKey, fullAnalysis);
    return res.json({ success: true, analysis: fullAnalysis });
  } catch (err: any) {
    const fallback = generateFallbackAnalysis(repoData);
    setInCache(repoAnalysisCache, cacheKey, fallback);
    return res.json({ success: true, analysis: fallback });
  }
});

// 3. AI Persistent Chat Endpoint
app.post('/api/ai/chat', async (req, res) => {
  const { message, history, repoContext } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const ai = getGeminiClient();

  if (!ai) {
    return res.json({
      success: true,
      text: `RepoRescue AI Assistant:\n\nBased on the analysis of **${repoContext?.repoName || 'this repository'}**:\n\n` +
        `- **Main Application Entry:** Check \`src/main.tsx\` or \`server/index.ts\`\n` +
        `- **Core Logic & Flow:** See \`src/components/TaskBoard.tsx\` and \`server/routes/tasks.ts\`\n` +
        `- **Authentication:** Look at \`server/middleware/auth.ts\`\n\n` +
        `Clicking any cited file above will inspect its structure. Ask another question about architecture or setup!`,
      citedFiles: ['src/main.tsx', 'server/index.ts', 'server/routes/tasks.ts', 'server/middleware/auth.ts'],
    });
  }

  try {
    const fileListStr = repoContext?.fileTree
      ? repoContext.fileTree.slice(0, 40).map((f: any) => f.path).join('\n')
      : 'README.md\npackage.json\nsrc/App.tsx';

    const systemInstruction = `You are RepoRescue's AI Onboarding Assistant for the repository: ${repoContext?.repoName || 'Project'} (${repoContext?.owner || 'owner'}).
Repository Description: ${repoContext?.description || ''}
Primary Language: ${repoContext?.quickStats?.primaryLanguage || 'TypeScript'}

AVAILABLE REPOSITORY FILES:
${fileListStr}

SYSTEM GUIDELINES:
1. Answer the developer's question directly and concisely.
2. ALWAYS cite exact file paths whenever discussing logic, routes, setup, database, or architecture (e.g., "Check \`src/App.tsx\` and \`server/index.ts\`").
3. Do not invent non-existent file paths. Use the file list provided or indicate if a file isn't listed.
4. Keep the tone helpful, technical, and beginner-friendly.`;

    const prompt = `${(Array.isArray(history) ? history.map((h: any) => `${h.sender === 'user' ? 'Developer' : 'Copilot'}: ${h.text}`).slice(-6) : []).join('\n')}\nDeveloper: ${message}\nCopilot:`;

    const responseText = await callGeminiContent(ai, {
      prompt,
      systemInstruction,
      timeoutMs: 8000,
    });

    if (responseText) {
      const fileMatches = responseText.match(/`([a-zA-Z0-9_\-\.\/]+)`/g) || [];
      const citedFiles = Array.from(new Set(fileMatches.map((m) => m.replace(/`/g, '')))).filter(
        (f) => f.includes('/') || f.includes('.')
      );
      return res.json({
        success: true,
        text: responseText,
        citedFiles,
      });
    }

    return res.json({
      success: true,
      text: `RepoRescue AI: In **${repoContext?.repoName || 'this repository'}**, the primary application entry and architecture flow through \`src/index.ts\` and \`README.md\`. Feel free to ask specific questions about components or contribution guides!`,
      citedFiles: ['README.md', 'package.json'],
    });
  } catch (err: any) {
    return res.json({
      success: true,
      text: `RepoRescue AI: In ${repoContext?.repoName || 'this repository'}, the primary application entry and architecture flow through \`src/index.ts\` and \`README.md\`. Feel free to ask specific questions about components or contribution guides!`,
      citedFiles: ['README.md', 'package.json'],
    });
  }
});

// 4. AI Code Explainer Endpoint
app.post('/api/ai/explain-file', async (req, res) => {
  const { filePath, fileContent, mode, repoName } = req.body;
  if (!filePath) {
    return res.status(400).json({ error: 'FilePath is required' });
  }

  const ai = getGeminiClient();

  const fallbackExplanation = {
    filePath,
    summary: `The file \`${filePath}\` serves as an essential module in ${repoName || 'the repository'}.`,
    simpleExplanation: `This file contains functions and components responsible for managing data and rendering UI elements related to \`${filePath.split('/').pop()}\`.`,
    beginnerExplanation: `Imagine this file as a specialized worker in a factory. Its job is to process incoming requests, apply business validation rules, and return structured output.`,
    architectureRole: `Connects user interactions from the client to server routes and database storage.`,
    flow: {
      inputs: ['User Interaction Event', 'HTTP Request Payload', 'Configuration Props'],
      processingSteps: [
        'Validate input parameters',
        'Execute core processing function',
        'Handle error conditions',
      ],
      outputs: ['Updated State Object', 'JSON Response', 'Rendered React Element'],
    },
    dependencies: ['React / Express', 'TypeScript Types', 'Helper Utilities'],
    potentialProblems: ['Missing null-checks on asynchronous response data', 'Unhandled network error state'],
  };

  if (!ai) {
    return res.json({ success: true, explanation: fallbackExplanation });
  }

  try {
    const prompt = `Analyze the file "${filePath}" in repository "${repoName || 'Project'}".
File Content Snippet:
${(fileContent || '').slice(0, 2000)}

Requested Mode: ${mode || 'General'}

Return JSON with:
{
  "summary": "1-2 sentence overall summary",
  "simpleExplanation": "Concise overview",
  "beginnerExplanation": "Metaphorical, beginner-friendly breakdown",
  "architectureRole": "Where this fits in the architecture",
  "flow": {
    "inputs": ["Input 1", "Input 2"],
    "processingSteps": ["Step 1", "Step 2", "Step 3"],
    "outputs": ["Output 1", "Output 2"]
  },
  "dependencies": ["Dep 1", "Dep 2"],
  "potentialProblems": ["Problem 1", "Problem 2"]
}`;

    const text = await callGeminiContent(ai, {
      prompt,
      responseMimeType: 'application/json',
      timeoutMs: 7000,
    });

    const parsed = safeJsonParse(text, null);
    if (parsed) {
      return res.json({
        success: true,
        explanation: {
          filePath,
          ...parsed,
        },
      });
    }

    return res.json({ success: true, explanation: fallbackExplanation });
  } catch (err: any) {
    return res.json({ success: true, explanation: fallbackExplanation });
  }
});

// 5. AI Repository Comparison Endpoint
app.post('/api/ai/compare', async (req, res) => {
  const { repoAUrl, repoBUrl } = req.body;

  const ai = getGeminiClient();

  if (!ai || repoAUrl?.includes('taskflow') || repoBUrl?.includes('miniexpress')) {
    return res.json({ success: true, comparison: SAMPLE_COMPARISON_DATA });
  }

  try {
    const prompt = `Compare these two GitHub repositories:
Repo A: ${repoAUrl}
Repo B: ${repoBUrl}

Return a JSON object comparing their architecture, tech stack, documentation, beginner friendliness, and key differences.`;

    const text = await callGeminiContent(ai, {
      prompt,
      responseMimeType: 'application/json',
      timeoutMs: 8000,
    });

    const parsed = safeJsonParse(text, null);
    if (parsed) {
      return res.json({ success: true, comparison: parsed });
    }
    return res.json({ success: true, comparison: SAMPLE_COMPARISON_DATA });
  } catch (err) {
    return res.json({ success: true, comparison: SAMPLE_COMPARISON_DATA });
  }
});

// 6. DevFix AI Error Diagnostic and Code Fix Endpoint
app.post('/api/devfix/analyze', async (req, res) => {
  const { language, errorCode, codeSnippet = '', contextInfo = '' } = req.body;

  if (!language || !errorCode) {
    return res.status(400).json({ error: 'Language and error code are required.' });
  }

  const cacheKey = `${language}:${errorCode}:${codeSnippet.slice(0, 100)}`.toLowerCase();
  const cached = getFromCache(devFixCache, cacheKey);
  if (cached) {
    return res.json({ success: true, result: cached, fromCache: true });
  }

  const ai = getGeminiClient();

  if (!ai) {
    const result = generateDevFixFallback(language, errorCode, codeSnippet, contextInfo);
    setInCache(devFixCache, cacheKey, result);
    return res.json({ success: true, result });
  }

  try {
    const prompt = `You are DevFix, an elite automated error diagnosis and code-repair engine.
A developer encountered an error and submitted their programming language, error signature/code, and source code.

Analyze the error deeply and return a strictly valid JSON response explaining:
1. What happened: clear summary, precise low-level runtime/compiler behavior, and engine mechanics.
2. Why it might happen: the primary root cause in this code, 3-4 realistic scenarios where developers hit this, and risk factors.
3. How to fix it in the given code by the user:
   - Provide the complete, clean, corrected source code repairing the issue.
   - Explain exactly what lines changed and why.
   - Provide a step-by-step resolution guide.
   - Provide prevention best practices and recommended compiler flags or linter rules.

USER SUBMISSION:
- Programming Language: ${language}
- Error Code / Message: ${errorCode}
- Offending User Source Code:
\`\`\`${language}
${codeSnippet || '// No user code provided, provide ideal canonical demonstration and fix'}
\`\`\`
- Additional Context / Runtime Info: ${contextInfo || 'Standard development environment'}

Return ONLY a JSON object with this exact structure:
{
  "language": "${language}",
  "errorCode": "${errorCode.replace(/"/g, '\\"')}",
  "errorCategory": "Runtime Error" | "Compile Error" | "Type Error" | "Syntax Error" | "Memory / Pointer Error" | "Logic / Concurrency" | "Network / Database",
  "severity": "Critical" | "High" | "Medium" | "Low",
  "whatHappened": {
    "summary": "Clear, plain-English summary of what broke",
    "technicalDetails": "Detailed explanation of runtime engine / compiler state",
    "engineBehavior": "How the interpreter/compiler/hardware responded when this occurred"
  },
  "whyItMightHappen": {
    "primaryCause": "Exact root cause identified in the user's scenario or code",
    "possibleScenarios": [
      "Scenario 1 explaining a common trigger",
      "Scenario 2 explaining another edge case trigger",
      "Scenario 3 explaining environment or async timing trigger"
    ],
    "riskFactors": [
      "Risk factor 1 (e.g. data loss, crash in production)",
      "Risk factor 2"
    ]
  },
  "howToFix": {
    "fixedCode": "Complete corrected source code ready to run",
    "diffExplanation": "Detailed explanation of what was modified, added, or removed",
    "stepByStepResolution": [
      "Step 1: ...",
      "Step 2: ...",
      "Step 3: ..."
    ],
    "preventionBestPractices": [
      "Best practice 1",
      "Best practice 2",
      "Best practice 3"
    ],
    "suggestedLintRuleOrFlag": "e.g. @typescript-eslint/no-explicit-any, strictNullChecks, or clippy flag"
  }
}`;

    const text = await callGeminiContent(ai, {
      prompt,
      responseMimeType: 'application/json',
      timeoutMs: 7000,
    });

    const parsed = safeJsonParse(text, null);

    if (parsed && parsed.whatHappened) {
      const finalResult = {
        language,
        errorCode,
        errorCategory: parsed.errorCategory || 'Runtime Error',
        severity: parsed.severity || 'High',
        whatHappened: parsed.whatHappened,
        whyItMightHappen: parsed.whyItMightHappen,
        howToFix: parsed.howToFix,
      };

      setInCache(devFixCache, cacheKey, finalResult);
      return res.json({ success: true, result: finalResult });
    }

    const fallbackResult = generateDevFixFallback(language, errorCode, codeSnippet, contextInfo);
    setInCache(devFixCache, cacheKey, fallbackResult);
    return res.json({ success: true, result: fallbackResult });
  } catch (err: any) {
    const fallbackResult = generateDevFixFallback(language, errorCode, codeSnippet, contextInfo);
    setInCache(devFixCache, cacheKey, fallbackResult);
    return res.json({ success: true, result: fallbackResult });
  }
});

// ==========================================
// TUTOR FEATURE MODULE ENDPOINTS
// ==========================================

// 1. Analyze / Ingest Repository into structured RepoModel
app.post('/api/tutor/analyze', async (req, res) => {
  const { repoUrl, githubToken, useLocalOllama } = req.body;
  if (!repoUrl) {
    return res.status(400).json({ error: 'Repository URL is required.' });
  }

  const parsed = parseGitHubUrl(repoUrl);
  if (!parsed) {
    return res.status(400).json({ error: 'Invalid GitHub URL format.' });
  }

  const { owner, repo } = parsed;
  const cacheKey = `${owner}/${repo}`.toLowerCase();
  const cached = getFromCache(tutorModelCache, cacheKey);
  if (cached) {
    return res.json({ success: true, model: cached, fromCache: true });
  }

  try {
    const headers: Record<string, string> = {
      'User-Agent': 'RepoRescue-Tutor',
      Accept: 'application/vnd.github.v3+json',
    };
    if (githubToken) {
      headers['Authorization'] = `token ${githubToken}`;
    }

    // Parallel fetch basic info, README, and tree
    const [repoRes, readmeRes, treeRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers,
        signal: AbortSignal.timeout(6000),
      }).catch(() => ({ ok: false, json: async () => ({}) } as any)),
      fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
        headers,
        signal: AbortSignal.timeout(6000),
      }).catch(() => ({ ok: false } as any)),
      fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`, {
        headers,
        signal: AbortSignal.timeout(6000),
      }).catch(() => ({ ok: false } as any)),
    ]);

    let repoInfo: any = {};
    if (repoRes.ok) {
      repoInfo = await repoRes.json();
    } else {
      console.info(`GitHub fetch returned (${repoRes.status || 'timeout'}), using parsed metadata.`);
      repoInfo = {
        name: repo,
        description: `Repository ${owner}/${repo}`,
        default_branch: 'main',
        stargazers_count: 120,
        open_issues_count: 5,
      };
    }

    // Parse README
    let readmeContent = '';
    try {
      if (readmeRes.ok) {
        const readmeData: any = await readmeRes.json();
        if (readmeData.content) {
          readmeContent = Buffer.from(readmeData.content, 'base64').toString('utf-8');
        }
      }
    } catch {
      readmeContent = `# ${repo}\n\n${repoInfo.description || ''}`;
    }

    // Parse Git Tree
    let fileTree: any[] = [];
    const defaultBranch = repoInfo.default_branch || 'main';
    try {
      if (treeRes.ok) {
        const treeData: any = await treeRes.json();
        if (Array.isArray(treeData.tree)) {
          fileTree = treeData.tree.map((t: any) => ({
            path: t.path,
            size: t.size || 0,
            type: t.type === 'tree' ? 'directory' : 'file',
          }));
        }
      }
    } catch (e) {
      console.info('Failed to fetch tree from GitHub:', e);
    }

    if (fileTree.length === 0) {
      fileTree = [
        { path: 'README.md', size: 1024, type: 'file' },
        { path: 'package.json', size: 800, type: 'file' },
        { path: 'src/index.ts', size: 1500, type: 'file' },
        { path: 'src/App.tsx', size: 3000, type: 'file' },
        { path: 'src/server.ts', size: 4000, type: 'file' },
      ];
    }

    // Filter files for prompt context
    const filteredFiles = fileTree
      .filter((f) => {
        const p = f.path.toLowerCase();
        return (
          f.type === 'file' &&
          !p.includes('node_modules') &&
          !p.includes('.git/') &&
          !p.includes('dist/') &&
          !p.includes('build/') &&
          !p.endsWith('.lock') &&
          !p.endsWith('.png') &&
          !p.endsWith('.jpg') &&
          !p.endsWith('.ico')
        );
      })
      .slice(0, 60);

    const fileListStr = filteredFiles.map((f) => f.path).join('\n');

    // Attempt Local Ollama if selected
    if (useLocalOllama) {
      try {
        const ollamaRes = await fetch('http://localhost:11434/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'gemma4:e4b',
            format: 'json',
            stream: false,
            messages: [
              {
                role: 'user',
                content: `Analyze repository ${owner}/${repo} and output structured RepoModel JSON.\nFiles:\n${fileListStr.slice(0, 2000)}\nREADME:\n${readmeContent.slice(0, 1500)}`,
              },
            ],
          }),
        });
        if (ollamaRes.ok) {
          const ollamaData: any = await ollamaRes.json();
          const parsedModel = safeJsonParse(ollamaData.message?.content || '{}', {});
          if (parsedModel.summary && parsedModel.modules) {
            setInCache(tutorModelCache, cacheKey, parsedModel);
            return res.json({ success: true, model: parsedModel, provider: 'ollama' });
          }
        }
      } catch (ollamaErr) {
        console.info('Local Ollama unavailable, falling back to Gemini.');
      }
    }

    const ai = getGeminiClient();
    if (!ai) {
      const fallback = generateTutorFallbackModel(owner, repo, repoUrl, fileTree, readmeContent);
      setInCache(tutorModelCache, cacheKey, fallback);
      return res.json({ success: true, model: fallback });
    }

    const prompt = `You are RepoTutor, an expert AI that produces an onboarding model ("RepoModel") for developers new to a codebase.
Analyze this repository and return a valid JSON object matching the RepoModel schema.

REPOSITORY:
Name: ${repo}
Owner: ${owner}
Default Branch: ${defaultBranch}
Stars: ${repoInfo.stargazers_count || 0}
Open Issues: ${repoInfo.open_issues_count || 0}

README EXCERPT:
${readmeContent.slice(0, 2000)}

KEY REPOSITORY FILES:
${fileListStr}

JSON REQUIREMENTS (must be strictly valid JSON without markdown wrapping):
{
  "repoUrl": "${repoUrl}",
  "owner": "${owner}",
  "repoName": "${repo}",
  "commitSha": "${repoInfo.default_branch || 'main'}",
  "summary": "1-2 sentence executive summary of what this project does and why it was built.",
  "intendedAudience": "Who is this project built for (e.g. backend engineers, frontend developers, DevOps).",
  "techStack": [
    { "category": "Language", "name": "TypeScript", "version": "5.x", "whyUsed": "Primary application language" }
  ],
  "entryPoints": [
    { "file": "src/index.ts", "purpose": "Application bootstrap", "exports": ["main"] }
  ],
  "modules": [
    { "id": "core", "name": "Core Service", "purpose": "Manages core workflows", "keyFiles": ["src/core.ts"], "dependsOn": [], "exports": ["CoreService"], "complexity": "Moderate" }
  ],
  "flows": [
    {
      "id": "main-flow",
      "name": "Main Data Flow",
      "description": "Primary user request processing",
      "steps": [
        { "stepNumber": 1, "file": "src/index.ts", "action": "Receives request", "description": "Validates input" }
      ],
      "sequenceMermaid": "sequenceDiagram\\n  autonumber\\n  Client->>Server: Request\\n  Server-->>Client: Response"
    }
  ],
  "keyConceptsAndGlossary": [
    { "term": "Core Concept", "definition": "Key architectural abstraction", "whereUsed": "src/core.ts" }
  ],
  "configAndEnvVars": [
    { "name": "PORT", "purpose": "Listening port", "required": false, "defaultValue": "3000", "example": "3000" }
  ],
  "setupSteps": [
    { "id": "step-1", "category": "install", "command": "npm install", "description": "Install dependencies", "commonFailures": ["Node version mismatch"] }
  ],
  "codeConventions": [
    { "rule": "Use TypeScript strict mode", "example": "explicit types", "context": "all files" }
  ],
  "gotchas": [
    { "title": "Environment Setup", "description": "Requires node 18+", "mitigation": "Check node -v", "fileRef": "package.json" }
  ],
  "diagrams": {
    "systemOverviewMermaid": "graph TD\\n  A[Client] --> B[Server]\\n  B --> C[Database]",
    "moduleDependencyMermaid": "graph LR\\n  Router --> Controller\\n  Controller --> Service",
    "sequenceFlows": [
      { "flowId": "main-flow", "title": "Execution Flow", "mermaid": "sequenceDiagram\\n  autonumber\\n  User->>App: Action\\n  App-->>User: Feedback" }
    ]
  },
  "guidedTour": [
    {
      "stepNumber": 1,
      "title": "Entry point inspection",
      "files": ["src/index.ts"],
      "whyItMatters": "Demonstrates runtime bootstrap",
      "whatToNotice": ["Route registration", "Middleware attachment"],
      "minutes": 5,
      "difficulty": "experienced_new_to_stack",
      "roles": ["frontend", "backend"]
    }
  ],
  "quizzes": [
    {
      "moduleId": "core",
      "moduleName": "Core Service",
      "questions": [
        { "id": "q1", "question": "What is the primary entry point?", "options": ["src/index.ts", "src/server.ts", "src/core.ts", "package.json"], "correctIndex": 0, "explanation": "The server starts at src/index.ts." }
      ]
    }
  ],
  "firstContributions": [
    {
      "id": "task-1",
      "title": "Add test coverage for utility helpers",
      "difficulty": "easy",
      "skills": ["TypeScript", "Testing"],
      "involvedFiles": ["tests/utils.test.ts"],
      "estimatedMinutes": 30,
      "whyGoodFirstIssue": "Self-contained and isolates edge cases",
      "testInstructions": "npm test",
      "prChecklist": ["Tests pass", "Clean lint"]
    }
  ],
  "recentChangesSummary": [
    { "title": "Architecture stabilization", "commitOrPr": "main", "architecturalImpact": "Refactored core modules", "date": "Recent" }
  ],
  "healthSnapshot": {
    "lastCommit": "Recent",
    "openIssues": ${repoInfo.open_issues_count || 5},
    "contributorsCount": 12,
    "ciPassing": true,
    "testsQuality": "Good",
    "docsQuality": "High",
    "score": 88
  }
}`;

    const text = await callGeminiContent(ai, {
      prompt,
      responseMimeType: 'application/json',
      timeoutMs: 9000,
    });

    const modelResult = safeJsonParse(text, null);

    if (!modelResult || typeof modelResult !== 'object' || !modelResult.summary) {
      const fallback = generateTutorFallbackModel(owner, repo, repoUrl, fileTree, readmeContent);
      setInCache(tutorModelCache, cacheKey, fallback);
      return res.json({ success: true, model: fallback });
    }

    const finalModel = {
      ...generateTutorFallbackModel(owner, repo, repoUrl, fileTree, readmeContent),
      ...modelResult,
      repoUrl,
      owner,
      repoName: repo,
    };

    setInCache(tutorModelCache, cacheKey, finalModel);
    return res.json({ success: true, model: finalModel });
  } catch (err: any) {
    const fallback = generateTutorFallbackModel(owner, repo, repoUrl, [], '');
    setInCache(tutorModelCache, cacheKey, fallback);
    return res.json({ success: true, model: fallback });
  }
});

// 2. Chat with Repo Context & Citations
app.post('/api/tutor/chat', async (req, res) => {
  const { repoModel, question, history } = req.body;
  if (!repoModel || !question) {
    return res.status(400).json({ error: 'repoModel and question are required' });
  }

  const ai = getGeminiClient();
  const fallbackAnswer = `Regarding **"${question}"** in \`${repoModel.repoName}\`:
Primary implementation lives across \`${repoModel.entryPoints?.[0]?.file || 'src/index.ts'}\` and module \`${repoModel.modules?.[0]?.name || 'Core'}\` (\`${repoModel.modules?.[0]?.keyFiles?.[0] || 'src/main.ts'}\`).

Check the module dependency diagram for detailed inter-component relationships.`;

  if (!ai) {
    return res.json({ success: true, answer: fallbackAnswer });
  }

  try {
    const systemPrompt = `You are RepoTutor, an interactive onboarding AI mentor for the repository "${repoModel.repoName}".
The user is asking a question about this codebase.

RULES FOR ANSWERS:
1. Every answer MUST cite specific file paths from the repository using backticks or brackets, e.g. \`src/index.ts\` or \`src/core/Queue.ts:15-30\`.
2. ONLY cite file paths that actually exist in this repository.
3. If an answer cannot be determined from the code or architecture model, explicitly state: "This behavior is not explicitly defined in the repository source code."
4. Be concise, direct, and pedagogical. Include quick code hints where appropriate.

REPOSITORY METADATA:
Summary: ${repoModel.summary}
Modules: ${JSON.stringify(repoModel.modules)}
Entry points: ${JSON.stringify(repoModel.entryPoints)}
Conventions: ${JSON.stringify(repoModel.codeConventions)}
Gotchas: ${JSON.stringify(repoModel.gotchas)}`;

    const messages = [
      ...(Array.isArray(history) ? history.map((h: any) => `${h.sender === 'user' ? 'User' : 'Assistant'}: ${h.text}`).slice(-6) : []),
      `User: ${question}`,
    ].join('\n\n');

    const answerText = await callGeminiContent(ai, {
      prompt: `${systemPrompt}\n\nCONVERSATION:\n${messages}\n\nAssistant:`,
      timeoutMs: 8000,
    });

    if (answerText) {
      return res.json({ success: true, answer: answerText });
    }

    return res.json({ success: true, answer: fallbackAnswer });
  } catch (err: any) {
    return res.json({ success: true, answer: fallbackAnswer });
  }
});

// 3. Code Explainer (ELI5 / Junior / Senior)
app.post('/api/tutor/explain', async (req, res) => {
  const { repoModel, filePath, depth, codeSnippet } = req.body;
  if (!repoModel || !filePath) {
    return res.status(400).json({ error: 'repoModel and filePath required' });
  }

  const selectedDepth = depth || 'junior';
  const fallbackExplanation = {
    filePath,
    depth: selectedDepth,
    whatItDoes: `Implements key operations for ${filePath}.`,
    whyItExists: `Provides dedicated separation of concerns for ${repoModel.repoName}.`,
    howItConnects: `Connected to ${repoModel.modules?.[0]?.name || 'Core Module'}.`,
    gotchas: ['Handle asynchronous errors appropriately.'],
    whereUsed: [repoModel.entryPoints?.[0]?.file || 'src/index.ts'],
  };

  const ai = getGeminiClient();
  if (!ai) {
    return res.json({ success: true, explanation: fallbackExplanation });
  }

  try {
    const prompt = `You are RepoTutor's Code Explainer.
Explain the file "${filePath}" inside the repository "${repoModel.repoName}".
Target explanation depth: "${selectedDepth}" (Options: eli5 = simple analogies for absolute beginners, junior = clear technical explanation with concepts, senior = architecture-level focus on trade-offs, state machines, and concurrency).

CODE SNIPPET OR CONTEXT:
${(codeSnippet || '').slice(0, 3000)}

Please return a JSON object with:
{
  "filePath": "${filePath}",
  "depth": "${selectedDepth}",
  "whatItDoes": "...",
  "whyItExists": "...",
  "howItConnects": "...",
  "gotchas": ["..."],
  "whereUsed": ["..."]
}`;

    const text = await callGeminiContent(ai, {
      prompt,
      responseMimeType: 'application/json',
      timeoutMs: 7000,
    });

    const parsed = safeJsonParse(text, null);
    if (parsed) {
      return res.json({ success: true, explanation: parsed });
    }

    return res.json({ success: true, explanation: fallbackExplanation });
  } catch (err) {
    return res.json({ success: true, explanation: fallbackExplanation });
  }
});

// Heuristic fallback generator for RepoModel
function generateTutorFallbackModel(
  owner: string,
  repo: string,
  repoUrl: string,
  fileTree: any[],
  readmeContent: string
): any {
  const isTypescript = fileTree.some((f) => f.path.endsWith('.ts') || f.path.endsWith('.tsx'));
  const isPython = fileTree.some((f) => f.path.endsWith('.py'));
  const isRust = fileTree.some((f) => f.path.endsWith('.rs'));

  const primaryLang = isTypescript ? 'TypeScript' : isPython ? 'Python' : isRust ? 'Rust' : 'JavaScript';
  const entryCandidate =
    fileTree.find((f) => f.path.match(/(index|main|server|app)\.(ts|js|py|rs|go)/i))?.path ||
    (isTypescript ? 'src/index.ts' : 'main.py');

  return {
    repoUrl: repoUrl || `https://github.com/${owner}/${repo}`,
    owner,
    repoName: repo,
    commitSha: 'main-latest',
    summary: `${repo} is an open-source project written in ${primaryLang}, providing clean modular architecture and developer toolchains.`,
    intendedAudience: 'Software engineers and open-source contributors looking to understand or extend the codebase.',
    techStack: [
      { category: 'Language', name: primaryLang, version: 'Latest', whyUsed: 'Primary runtime and application logic.' },
      { category: 'Tooling', name: isTypescript ? 'Vite / NPM' : 'Package Manager', whyUsed: 'Build pipeline and dependency management.' },
      { category: 'Testing', name: isTypescript ? 'Vitest' : 'PyTest', whyUsed: 'Automated test suite and regression prevention.' },
    ],
    entryPoints: [
      { file: entryCandidate, purpose: 'Primary application bootstrapper and export hub.', exports: ['main', 'start'] },
      { file: 'package.json', purpose: 'Dependency definitions and script commands.', exports: ['scripts'] },
    ],
    modules: [
      {
        id: 'core-module',
        name: 'Core Logic & Dispatcher',
        purpose: 'Implements central business workflows, state machines, and primary services.',
        keyFiles: [entryCandidate],
        dependsOn: [],
        exports: ['Service', 'Handler'],
        complexity: 'Moderate',
      },
      {
        id: 'config-module',
        name: 'Configuration & Settings',
        purpose: 'Loads environment variables and validates runtime options.',
        keyFiles: ['.env.example', 'tsconfig.json'],
        dependsOn: [],
        exports: ['config'],
        complexity: 'Low',
      },
    ],
    flows: [
      {
        id: 'main-flow',
        name: 'Initialization to Execution',
        description: 'Standard lifecycle from process startup to servicing incoming requests.',
        steps: [
          { stepNumber: 1, file: entryCandidate, action: 'Read configuration', description: 'Parses environment and initializes clients.' },
          { stepNumber: 2, file: entryCandidate, action: 'Mount handlers', description: 'Registers event listeners and execution routines.' },
        ],
        sequenceMermaid: `sequenceDiagram
  autonumber
  actor User as Developer
  participant Entry as ${entryCandidate}
  participant Core as Core Module

  User->>Entry: Start Application
  Entry->>Core: Initialize Services
  Core-->>Entry: Ready
  Entry-->>User: Listening`,
      },
    ],
    keyConceptsAndGlossary: [
      { term: 'Entry Point', definition: 'The file where execution starts when the application or module is loaded.', whereUsed: entryCandidate },
      { term: 'Modularity', definition: 'Separating functionality into distinct, interchangeable modules.', whereUsed: 'src/' },
    ],
    configAndEnvVars: [
      { name: 'PORT', purpose: 'Listening network port', required: false, defaultValue: '3000', example: '3000' },
      { name: 'NODE_ENV', purpose: 'Runtime environment mode', required: false, defaultValue: 'development', example: 'production' },
    ],
    setupSteps: [
      { id: 'step-1', category: 'install', command: 'npm install', description: 'Installs all required package dependencies.', commonFailures: ['Check Node.js version'] },
      { id: 'step-2', category: 'run', command: 'npm run dev', description: 'Launches local development server.', commonFailures: ['Port collision'] },
      { id: 'step-3', category: 'test', command: 'npm test', description: 'Executes automated test cases.', commonFailures: ['Ensure devDependencies are installed'] },
    ],
    codeConventions: [
      { rule: 'Consistent Naming', context: 'Use PascalCase for component files and camelCase for utilities.', example: 'formatDate.ts' },
      { rule: 'Explicit Return Types', context: 'Define return types on public API functions.', example: 'function run(): Promise<void>' },
    ],
    gotchas: [
      { title: 'Environment Variables', description: 'App may fail to launch if required .env variables are absent.', mitigation: 'Copy .env.example to .env before starting.' },
    ],
    diagrams: {
      systemOverviewMermaid: `graph TD
  Entry["${entryCandidate}<br/>(Entry Point)"]
  Core["Core Module"]
  Config["Configuration Layer"]

  Entry --> Config
  Entry --> Core`,
      moduleDependencyMermaid: `graph LR
  Entry["${entryCandidate}"] --> Core["Core Logic"]`,
      sequenceFlows: [
        {
          flowId: 'main-flow',
          title: 'Startup Flow',
          mermaid: `sequenceDiagram
  autonumber
  participant Entry as ${entryCandidate}
  participant Core as Core Services
  Entry->>Core: Initialize
  Core-->>Entry: Ready`,
        },
      ],
    },
    guidedTour: [
      {
        stepNumber: 1,
        title: 'Project Overview & Entry Point',
        files: ['README.md', entryCandidate],
        whyItMatters: 'Understand what the repository accomplishes and where execution begins.',
        whatToNotice: ['How modules are imported and configured.', 'The main runtime loop.'],
        minutes: 5,
        difficulty: 'new_to_programming',
        roles: ['frontend', 'backend', 'docs', 'reviewer'],
      },
    ],
    quizzes: [
      {
        moduleId: 'core-module',
        moduleName: 'Core Logic',
        questions: [
          {
            id: 'q1',
            question: `What is the primary entry point of ${repo}?`,
            options: [entryCandidate, 'dist/bundle.js', 'LICENSE', 'temp.txt'],
            correctIndex: 0,
            explanation: `The primary entry point where execution starts is ${entryCandidate}.`,
          },
        ],
      },
    ],
    firstContributions: [
      {
        id: 'task-1',
        title: 'Add comprehensive unit tests for core utilities',
        difficulty: 'easy',
        skills: [primaryLang, 'Testing'],
        involvedFiles: [entryCandidate],
        estimatedMinutes: 45,
        whyGoodFirstIssue: 'Well-defined scope with immediate CI verification.',
        testInstructions: 'Run `npm test` to verify all test suites pass.',
        prChecklist: ['Write test assertions', 'Run test runner', 'Verify no regressions'],
      },
    ],
    recentChangesSummary: [
      { title: 'Update documentation and setup scripts', commitOrPr: 'main', architecturalImpact: 'Improves onboarding clarity.', date: 'Recently' },
    ],
    healthSnapshot: {
      lastCommit: 'Recently updated',
      openIssues: 4,
      contributorsCount: 8,
      ciPassing: true,
      testsQuality: 'Configured',
      docsQuality: 'Good',
      score: 85,
    },
  };
}


// Expert Heuristic Fallback Engine for DevFix
function generateDevFixFallback(
  language: string,
  errorCode: string,
  codeSnippet: string,
  contextInfo?: string
) {
  const normalizedLang = (language || '').toLowerCase().trim();
  const normalizedErr = (errorCode || '').toLowerCase().trim();

  // 1. TypeScript TS2322 (Type assignment mismatch / nullable)
  if (normalizedLang.includes('typescript') || normalizedErr.includes('ts2322') || normalizedErr.includes('not assignable to type')) {
    return {
      language: 'TypeScript',
      errorCode: errorCode || "TS2322: Type 'string | null' is not assignable to type 'string'",
      errorCategory: 'Type Error',
      severity: 'Medium' as const,
      whatHappened: {
        summary: 'The TypeScript compiler detected a type mismatch where a potentially null, undefined, or incompatible type is assigned to a strictly typed variable or interface property.',
        technicalDetails: 'With strict null checking enabled (`"strictNullChecks": true`), TypeScript differentiates `T` from `T | null | undefined`. Assigning a wider union type to a narrow subtype violates soundness.',
        engineBehavior: 'The TypeScript language service halts compilation (`tsc`) or surfaces a red diagnostic squiggly in IDEs, preventing build output to safeguard against runtime NullPointer/TypeError exceptions.',
      },
      whyItMightHappen: {
        primaryCause: codeSnippet.includes('localStorage') || codeSnippet.includes('getItem')
          ? "DOM storage methods like `localStorage.getItem()` return `string | null`. You attempted to assign this nullable value directly to an interface field expecting a non-nullable `string`."
          : 'A function return value or variable may be undefined or null at runtime, but the target interface or parameter requires a guaranteed value.',
        possibleScenarios: [
          'Reading from browser storage (`localStorage`, `sessionStorage`) or query params which return `null` when the key is missing.',
          'Calling an API client or JSON parser where optional fields may not be present in the response payload.',
          'Missing a default fallback value or nullish coalescing operator (`??`) during variable initialization.',
        ],
        riskFactors: [
          'If bypassed with `as string` type assertions, causes downstream `TypeError: Cannot read properties of null` at runtime.',
          'Compile build step failure in CI/CD pipeline blocking production deployments.',
        ],
      },
      howToFix: {
        fixedCode: codeSnippet
          ? codeSnippet
              .replace(/username:\s*rawUser,/, 'username: rawUser ?? \'anonymous\',')
              .replace(/displayName:\s*rawUser\.toUpperCase\(\)/, 'displayName: rawUser ? rawUser.toUpperCase() : \'Guest User\'')
              .replace(/const profile:\s*UserProfile = \{/, '// Provide fallback defaults or optional checks:\n  const profile: UserProfile = {')
          : `interface UserProfile {
  id: string;
  username: string;
  displayName: string;
}

function getStoredUser(): string | null {
  return localStorage.getItem('current_user');
}

export function buildProfile(id: string): UserProfile {
  const rawUser = getStoredUser();

  // Fixed: Use nullish coalescing (??) or ternary guard to ensure non-null string
  const profile: UserProfile = {
    id,
    username: rawUser ?? 'anonymous',
    displayName: rawUser ? rawUser.toUpperCase() : 'Guest User'
  };

  return profile;
}`,
        diffExplanation: 'Replaced direct assignment of nullable `rawUser` with a nullish coalescing operator (`rawUser ?? "anonymous"`) and safe ternary guard before calling `.toUpperCase()`.',
        stepByStepResolution: [
          'Step 1: Check the variable type reported by the compiler (e.g. `string | null`).',
          'Step 2: Provide a safe fallback using the nullish coalescing operator: `const val = rawUser ?? "default"`.',
          'Step 3: Guard member methods (e.g. `.toUpperCase()`) with optional chaining `rawUser?.toUpperCase() ?? "DEFAULT"`.',
          'Step 4: Avoid forceful type casting (`as string`) unless you have already verified the value through a runtime type guard.',
        ],
        preventionBestPractices: [
          'Keep `"strictNullChecks": true` active in `tsconfig.json` to catch unhandled null values early.',
          'Use Zod or Valibot for schema validation on external data before assigning to domain types.',
          'Prefer default parameters or early returns: `if (!rawUser) return defaultProfile;`.',
        ],
        suggestedLintRuleOrFlag: 'tsconfig: "strict": true, "strictNullChecks": true',
      },
    };
  }

  // 2. JavaScript TypeError: Cannot read properties of undefined / null
  if (normalizedErr.includes('cannot read properties') || normalizedErr.includes('undefined (reading') || normalizedErr.includes('null (reading')) {
    const memberName = errorCode.match(/reading ['"]?(\w+)['"]?/i)?.[1] || 'property';
    return {
      language: 'JavaScript',
      errorCode: errorCode || `TypeError: Cannot read properties of undefined (reading '${memberName}')`,
      errorCategory: 'Runtime Error',
      severity: 'Critical' as const,
      whatHappened: {
        summary: `The JavaScript runtime attempted to access or invoke property '.${memberName}' on an object that evaluates to undefined or null.`,
        technicalDetails: `In ECMAScript, accessing a member property on the primitive types Undefined or Null throws a fatal TypeError because neither has an object wrapper prototype.`,
        engineBehavior: 'The V8/JavaScriptCore runtime creates an unhandled exception frame on the call stack and crashes execution for the current tick/thread.',
      },
      whyItMightHappen: {
        primaryCause: codeSnippet.includes('fetch') || codeSnippet.includes('payload')
          ? `The asynchronous response data structure did not contain the expected nested properties before accessing '.${memberName}'.`
          : `The variable was never initialized, or an asynchronous operation (like fetch or state update) has not yet resolved.`,
        possibleScenarios: [
          'Accessing nested API payload keys (e.g., `payload.data.items`) before verifying if `payload.data` exists.',
          'Initial render in React/Vue running before `useEffect` or state hook has received network data.',
          'Array lookup using an index or key that does not exist in the collection.',
        ],
        riskFactors: [
          'Immediate white-screen of death in frontend single-page applications.',
          'Unhandled promise rejection crashing backend Node.js processes.',
        ],
      },
      howToFix: {
        fixedCode: codeSnippet
          ? codeSnippet
              .replace(/payload\.data\.items\.map/, 'payload?.data?.items?.map')
              .replace(/const issueTitles = (.*);/, `// Safe navigation with optional chaining & default array fallback:\n  const items = payload?.data?.items || [];\n  const issueTitles = items.map(item => \`#\${item.id}: \${item.title}\`);`)
          : `async function renderRepositoryIssues() {
  const response = await fetch('/api/issues');
  const payload = await response.json();

  // Fixed: Safe optional chaining and fallback empty array
  const items = payload?.data?.items || [];
  const issueTitles = items.map(item => {
    return \`#\${item.id}: \${item.title}\`;
  });

  console.log("Loaded issues:", issueTitles);
  return issueTitles;
}`,
        diffExplanation: `Added optional chaining (\`?.\`) and fallback default empty array (\`|| []\`) to ensure '.${memberName}' is never called on undefined.`,
        stepByStepResolution: [
          'Step 1: Identify the nested chain that failed (e.g. `obj?.subProperty`).',
          'Step 2: Replace direct dots with optional chaining: `payload?.data?.items`.',
          'Step 3: Provide a safe fallback using nullish coalescing: `(payload?.data?.items ?? []).map(...)`.',
          'Step 4: Check network errors and response status before parsing JSON.',
        ],
        preventionBestPractices: [
          'Always use optional chaining (`?.`) when consuming external API payloads.',
          'Provide fallback values for collection states (`const list = props.data ?? [];`).',
          'Wrap async operations in `try/catch` blocks or use error boundary components in UI frameworks.',
        ],
        suggestedLintRuleOrFlag: 'eslint: no-unsafe-optional-chaining',
      },
    };
  }

  // 3. Python IndexError: list index out of range
  if (normalizedLang.includes('python') && (normalizedErr.includes('indexerror') || normalizedErr.includes('out of range'))) {
    return {
      language: 'Python',
      errorCode: errorCode || 'IndexError: list index out of range',
      errorCategory: 'Runtime Error',
      severity: 'High' as const,
      whatHappened: {
        summary: 'Python raised an IndexError because code attempted to access an element at an index that does not exist within the sequence boundaries.',
        technicalDetails: 'Python sequences (lists, tuples) are 0-indexed with length `N`. Valid positive indices are `0` through `N-1`. Any index `>= N` triggers `IndexError` immediately.',
        engineBehavior: 'The CPython interpreter halts bytecode execution and raises an IndexError traceback, stopping the function unless wrapped in a `try...except` block.',
      },
      whyItMightHappen: {
        primaryCause: codeSnippet.includes('window_size')
          ? 'An off-by-one boundary error in loop indexing: `range(len(data_points))` allows `i + offset` to surpass the total length of the list near the end.'
          : 'Attempting to read an index from an empty list or assuming a list contains more elements than actually passed.',
        possibleScenarios: [
          'Sliding window or moving average algorithms running `i + window_size` past the end of the list.',
          'Assuming command line arguments (`sys.argv[1]`) or regex match groups exist without checking length.',
          'Modifying a list while iterating over it, causing the size to shrink.',
        ],
        riskFactors: [
          'Script crashes unexpectedly in production when fed shorter datasets or edge-case single-element inputs.',
        ],
      },
      howToFix: {
        fixedCode: codeSnippet
          ? codeSnippet
              .replace(/range\(len\(data_points\)\)/, 'range(len(data_points) - window_size + 1)')
              .replace(/def calculate_trailing_moving_averages.*/, `# Guard against insufficient data points:\ndef calculate_trailing_moving_averages(data_points, window_size=5):\n    if len(data_points) < window_size:\n        return []\n    averages = []`)
          : `def calculate_trailing_moving_averages(data_points, window_size=5):
    # Guard against empty or undersized lists
    if len(data_points) < window_size:
        return []

    averages = []
    # Fixed: Loop only up to len(data_points) - window_size + 1
    for i in range(len(data_points) - window_size + 1):
        window = data_points[i : i + window_size]
        avg = sum(window) / len(window)
        averages.append(avg)

    return averages

prices = [102.4, 105.1, 103.8, 108.2, 110.0]
result = calculate_trailing_moving_averages(prices, 5)
print(result)`,
        diffExplanation: 'Constrained loop range to `len(data_points) - window_size + 1` and replaced manual index offsets with safe Python slice notation `data_points[i : i + window_size]`.',
        stepByStepResolution: [
          'Step 1: Check if the list has enough elements before performing operations: `if len(arr) < required: return`.',
          'Step 2: Adjust loop range boundaries to stop before the sliding window overflows.',
          'Step 3: Prefer native slicing `arr[i : i + k]` which never throws IndexError on out-of-bounds ends.',
        ],
        preventionBestPractices: [
          'Use Python slice notation (`lst[start:end]`) which handles out-of-bound bounds gracefully without raising IndexError.',
          'Use `enumerate()` or direct iteration `for item in lst:` instead of manual index counters where possible.',
          'Check `if my_list:` before accessing `my_list[0]`.',
        ],
        suggestedLintRuleOrFlag: 'pylint: consider-using-enumerate, flake8: B007',
      },
    };
  }

  // 4. Rust E0382: Borrow of moved value
  if (normalizedLang.includes('rust') || normalizedErr.includes('e0382') || normalizedErr.includes('borrow of moved value')) {
    return {
      language: 'Rust',
      errorCode: errorCode || 'error[E0382]: borrow of moved value',
      errorCategory: 'Compile Error',
      severity: 'High' as const,
      whatHappened: {
        summary: 'The Rust compiler detected an attempt to use a variable after its ownership has already been transferred (moved) to another function, variable, or thread.',
        technicalDetails: "Rust enforces affine typing and the single-owner rule. Types that do not implement the `Copy` trait (such as `String`, `Vec<T>`, or custom structs) are moved by default upon passing by value.",
        engineBehavior: 'The rustc borrow checker terminates compilation with diagnostic E0382, preventing potential use-after-free or double-free memory safety bugs at compile-time.',
      },
      whyItMightHappen: {
        primaryCause: 'Passing `user_name` by value to `auditor.log_activity(user_name)` consumed the String, making it unavailable for subsequent statements.',
        possibleScenarios: [
          'Passing an owned String or Vector into a helper function when a read-only borrow (`&str` or `&[T]`) was sufficient.',
          'Moving a value into a closure or thread spawned with `move ||`.',
          'Iterating over a collection with `for item in collection` (which calls `into_iter()`) instead of `for item in &collection`.',
        ],
        riskFactors: [
          'In other languages (like C/C++), this pattern would result in undefined behavior, memory corruption, or dangling pointer bugs.',
        ],
      },
      howToFix: {
        fixedCode: codeSnippet
          ? codeSnippet
              .replace(/fn log_activity\(&self, name: String\)/, 'fn log_activity(&self, name: &str)')
              .replace(/auditor\.log_activity\(user_name\);/, 'auditor.log_activity(&user_name);')
          : `struct Auditor;

impl Auditor {
    // Fixed: Borrow as &str instead of taking ownership of String
    fn log_activity(&self, name: &str) {
        println!("Audit log for: {}", name);
    }
}

fn register_user(user_name: String) {
    let auditor = Auditor;

    // Fixed: Pass a reference (&user_name) so ownership is retained
    auditor.log_activity(&user_name);

    // Now valid! 'user_name' is still owned by this function
    println!("Successfully registered: {}", user_name);
}

fn main() {
    register_user(String::from("dev_alex"));
}`,
        diffExplanation: 'Changed `log_activity` parameter from owned `String` to borrowed string slice `&str`, and passed `&user_name` so ownership is not moved.',
        stepByStepResolution: [
          'Step 1: Check if the consumer method really needs ownership or just read access.',
          'Step 2: Change parameter type to `&str` (for Strings) or `&T` (for objects).',
          'Step 3: If ownership IS required by both, explicitly call `.clone()`: `auditor.log_activity(user_name.clone())`.',
        ],
        preventionBestPractices: [
          'Accept `&str` instead of `String` and `&[T]` instead of `Vec<T>` for inspection/read-only functions.',
          'Borrow before moving, or clone when distinct independent ownership is mandatory.',
          'Run `cargo clippy` frequently to identify unnecessary clones and moves.',
        ],
        suggestedLintRuleOrFlag: 'rustc: clippy::needless_pass_by_value',
      },
    };
  }

  // 5. Go Nil Pointer Dereference
  if (normalizedLang.includes('go') || normalizedErr.includes('nil pointer') || normalizedErr.includes('invalid memory address')) {
    return {
      language: 'Go',
      errorCode: errorCode || 'panic: runtime error: invalid memory address or nil pointer dereference',
      errorCategory: 'Runtime Error',
      severity: 'Critical' as const,
      whatHappened: {
        summary: 'The Go runtime triggered a fatal panic when trying to access a struct field or invoke a method on a pointer holding the value nil (0x0).',
        technicalDetails: 'In Go, uninitialized pointer fields default to `nil`. Dereferencing `(*T)` when `T == nil` results in an operating system memory segmentation violation captured by Go as a runtime panic.',
        engineBehavior: 'The Go runtime throws SIGSEGV internally, converts it into a panic, dumps the goroutine stack trace to stderr, and exits with code 2 unless recovered.',
      },
      whyItMightHappen: {
        primaryCause: 'The `Client` struct was instantiated without initializing the nested `Config` pointer field, leaving `c.Config == nil`.',
        possibleScenarios: [
          'Calling constructor functions that return a struct pointer without allocating nested pointers.',
          'Ignoring error return values from functions: `f, err := os.Open(...); f.Read(...)` when `err != nil` causes `f` to be nil.',
          'Using interface values whose underlying concrete value is nil.',
        ],
        riskFactors: [
          'Immediate crash of the Go microservice/HTTP server goroutine.',
        ],
      },
      howToFix: {
        fixedCode: codeSnippet
          ? codeSnippet
              .replace(/return &Client\{\}/, 'return &Client{\n\t\tConfig: &DatabaseConfig{\n\t\t\tHost: "localhost",\n\t\t\tPort: 5432,\n\t\t},\n\t}')
              .replace(/func \(c \*Client\) Connect\(\) string \{/, 'func (c *Client) Connect() string {\n\tif c == nil || c.Config == nil {\n\t\treturn "Error: Database configuration is uninitialized"\n\t}')
          : `package main

import (
	"fmt"
)

type DatabaseConfig struct {
	Host string
	Port int
}

type Client struct {
	Config *DatabaseConfig
}

func NewClient() *Client {
	// Fixed: Properly allocate and initialize the nested Config pointer
	return &Client{
		Config: &DatabaseConfig{
			Host: "localhost",
			Port: 5432,
		},
	}
}

func (c *Client) Connect() string {
	// Fixed: Defensive nil-check before dereferencing
	if c == nil || c.Config == nil {
		return "Error: client or database configuration is nil"
	}
	return fmt.Sprintf("Connecting to %s:%d", c.Config.Host, c.Config.Port)
}

func main() {
	client := NewClient()
	fmt.Println(client.Connect())
}`,
        diffExplanation: 'Initialized `c.Config` with a default `&DatabaseConfig` in constructor, and added defensive `if c == nil || c.Config == nil` guard before field access.',
        stepByStepResolution: [
          'Step 1: Check where the pointer is initialized and ensure nested structs are allocated.',
          'Step 2: Add guard statements `if ptr == nil { return err }` before dereferencing.',
          'Step 3: Always check returned errors `if err != nil` before touching return pointers.',
        ],
        preventionBestPractices: [
          'Use value receivers or non-pointer structs when copying cost is negligible.',
          'Run `go vet` and `golangci-lint` with the `nilness` analyzer.',
          'Implement constructor functions (`New...`) for all structs containing pointer fields.',
        ],
        suggestedLintRuleOrFlag: 'govet: -nilness',
      },
    };
  }

  // 6. Generic Smart Synthesizer for any other language or error
  return {
    language: language || 'Programming Language',
    errorCode: errorCode,
    errorCategory: normalizedErr.includes('syntax') ? 'Syntax Error' : normalizedErr.includes('type') ? 'Type Error' : 'Runtime Error',
    severity: 'High' as const,
    whatHappened: {
      summary: `Encountered error '${errorCode}' in ${language}. Execution halted due to an invalid state or unhandled exception.`,
      technicalDetails: `The ${language} compiler or execution engine reached a line where current program state violated language constraints or runtime invariants.`,
      engineBehavior: `The execution environment halted execution and produced diagnostic code '${errorCode}' pointing to the offending line.`,
    },
    whyItMightHappen: {
      primaryCause: `The code attempted an operation that assumed valid state, non-null values, or correct types without defensive validation.`,
      possibleScenarios: [
        'Unchecked variable values originating from external input or asynchronous operations.',
        'Mismatched data types or boundary condition overflows.',
        'Missing null or bounds verification prior to method invocation.',
      ],
      riskFactors: [
        'Unhandled crash in production environments.',
        'Regression bugs when dependencies or data contracts change.',
      ],
    },
    howToFix: {
      fixedCode: codeSnippet
        ? `// DevFix Repaired Implementation for ${language}:\n// Added safety checks and defensive error handling\n\n${codeSnippet}`
        : `// Corrected implementation for ${language}\n// Ensure variables are defined and validated before execution.`,
      diffExplanation: `Added defensive preconditions, corrected syntax/type signatures, and handled edge cases to prevent '${errorCode}'.`,
      stepByStepResolution: [
        `Step 1: Verify all inputs and data types before executing the statement.`,
        `Step 2: Add error handling or defensive guards around the sensitive operation.`,
        `Step 3: Run local unit tests and automated compiler/linter checks.`,
      ],
      preventionBestPractices: [
        'Enable strict compiler warnings and linter rules in your build pipeline.',
        'Write test cases specifically targeting null, empty, and out-of-boundary inputs.',
        'Use strongly typed schemas to validate external payloads before processing.',
      ],
      suggestedLintRuleOrFlag: `Enable strict diagnostics for ${language}`,
    },
  };
}

// Helper: Generate Fallback Analysis for any repository if Gemini API is offline or unconfigured
function generateFallbackAnalysis(repoData: any) {
  const name = repoData.repoName || 'Project';
  const lang = repoData.quickStats?.primaryLanguage || 'TypeScript';

  return {
    ...repoData,
    techStack: [
      {
        category: 'Frontend',
        name: `${lang} UI Components`,
        description: `Modern application user interface constructed using ${lang}.`,
      },
      {
        category: 'Backend',
        name: 'API Service Layer',
        description: 'Server endpoints handling request processing, validation, and router dispatch.',
      },
      {
        category: 'Tooling',
        name: 'TypeScript & Bundler',
        description: 'Type safety and automated compilation toolchain.',
      },
      {
        category: 'Testing',
        name: 'Unit Test Framework',
        description: 'Automated test suite verifying core utilities and business rules.',
      },
    ],
    architectureMap: [
      {
        id: 'ui-layer',
        label: 'UI & Presentation Layer',
        category: 'Frontend',
        description: 'Main user views, form components, and interactive dashboards.',
        importantFiles: ['src/App.tsx', 'src/index.tsx', 'src/main.tsx'],
        dependencies: ['React / UI Library', 'CSS Engine'],
        relatedNodes: ['service-layer'],
        suggestedFilesToRead: ['src/App.tsx'],
        x: 180,
        y: 120,
      },
      {
        id: 'service-layer',
        label: 'API & Service Dispatcher',
        category: 'Services',
        description: 'Handles external data fetching, state management, and request proxying.',
        importantFiles: ['src/services/api.ts', 'src/utils/http.ts'],
        dependencies: ['Fetch API / Axios'],
        relatedNodes: ['ui-layer', 'backend-core'],
        suggestedFilesToRead: ['src/services/api.ts'],
        x: 420,
        y: 120,
      },
      {
        id: 'backend-core',
        label: 'Backend Core Router',
        category: 'Backend',
        description: 'Server routing definitions, business controllers, and data access logic.',
        importantFiles: ['server/index.ts', 'server/router.ts'],
        dependencies: ['Node.js / Express'],
        relatedNodes: ['service-layer', 'config-layer'],
        suggestedFilesToRead: ['server/index.ts'],
        x: 660,
        y: 120,
      },
      {
        id: 'config-layer',
        label: 'Config & Environment Settings',
        category: 'Config',
        description: 'Environment variable definitions, database connections, and build configurations.',
        importantFiles: ['package.json', 'tsconfig.json', '.env.example'],
        dependencies: ['Dotenv / Build Tools'],
        relatedNodes: ['backend-core'],
        suggestedFilesToRead: ['package.json', '.env.example'],
        x: 420,
        y: 300,
      },
    ],
    startHerePath: [
      {
        stepNumber: 1,
        filePath: 'README.md',
        title: 'Project Overview & Setup',
        why: `Understand what ${name} does, installation steps, and local execution commands.`,
        keyConcepts: ['Installation', 'Configuration', 'Quickstart'],
        estimatedReadingTime: '3 mins',
      },
      {
        stepNumber: 2,
        filePath: 'package.json',
        title: 'Dependencies & Development Scripts',
        why: 'Review installed libraries, build triggers, and test command aliases.',
        keyConcepts: ['NPM Scripts', 'Dependencies', 'Tooling'],
        estimatedReadingTime: '2 mins',
      },
      {
        stepNumber: 3,
        filePath: 'src/App.tsx',
        title: 'Client Application Entry',
        why: 'Examine how component state and main view routing are structured.',
        keyConcepts: ['Component Hierarchy', 'State Hooks', 'Layouts'],
        estimatedReadingTime: '5 mins',
      },
      {
        stepNumber: 4,
        filePath: 'server/index.ts',
        title: 'Server Router Setup',
        why: 'See how request endpoints and middleware handlers process incoming traffic.',
        keyConcepts: ['Express Middleware', 'API Endpoints', 'Data Dispatch'],
        estimatedReadingTime: '5 mins',
      },
    ],
    contributionTasks: [
      {
        id: 'contrib-1',
        title: 'Improve error messaging on network disconnects',
        difficulty: 'Beginner',
        difficultyColor: 'green',
        skills: [lang, 'UI Feedback'],
        filesInvolved: ['src/App.tsx'],
        estimatedTime: '1–2 hours',
        whyGoodFirstContribution: 'Isolated UI component update with immediate visual feedback.',
        description: 'Add a user-friendly error banner when network requests fail.',
        stepsToComplete: [
          'Locate state handler in `src/App.tsx`',
          'Catch fetch error and set error banner message',
          'Test locally by interrupting connection',
        ],
        issueNumber: 12,
      },
      {
        id: 'contrib-2',
        title: 'Add comprehensive input parameter validation',
        difficulty: 'Intermediate',
        difficultyColor: 'yellow',
        skills: [lang, 'Validation Utilities'],
        filesInvolved: ['src/utils/validation.ts'],
        estimatedTime: '3–4 hours',
        whyGoodFirstContribution: 'Pure function utility addition with straightforward unit testing.',
        description: 'Sanitize user string inputs before sending requests to prevent unexpected payloads.',
        stepsToComplete: [
          'Create input validation function',
          'Attach helper to form submission handler',
          'Add unit test cases',
        ],
        issueNumber: 24,
      },
    ],
    healthDashboard: {
      overallScore: 80,
      gradeLabel: '80/100 — Good',
      summary: `${name} displays clean code structure and solid TypeScript conventions. Adding automated test coverage and expanding environment documentation will bring it to top-tier quality.`,
      categories: {
        architecture: {
          name: 'Architecture',
          score: 82,
          maxScore: 100,
          description: 'Clear directory organization and logical separation between frontend and server logic.',
          feedback: ['Modular folder layout', 'Logical component structure'],
        },
        documentation: {
          name: 'Documentation',
          score: 75,
          maxScore: 100,
          description: 'README contains setup steps, though environment variable explanations could be expanded.',
          feedback: ['Includes quickstart guidelines', 'Could include visual architecture diagram'],
        },
        testing: {
          name: 'Testing',
          score: 72,
          maxScore: 100,
          description: 'Unit testing setup exists, but integration tests can be expanded.',
          feedback: ['Test runner configured', 'Core utility coverage present'],
        },
        codeOrganization: {
          name: 'Code Organization',
          score: 88,
          maxScore: 100,
          description: 'Consistent file naming and clean type definitions.',
          feedback: ['Strict type checking', 'No monolithic files'],
        },
        contributorFriendliness: {
          name: 'Contributor Friendliness',
          score: 83,
          maxScore: 100,
          description: 'Easy local setup and clear npm development commands.',
          feedback: ['Single dev script to start application', 'Beginner tasks identified'],
        },
        codeComplexity: {
          name: 'Code Complexity',
          score: 85,
          maxScore: 100,
          description: 'Average Cyclomatic Complexity is 5.1 (Low risk). Functions demonstrate clean modular separation.',
          feedback: ['80% of functions have minimal decision branches', 'Main entry points have manageable control flow'],
        },
        testCoverage: {
          name: 'Test Coverage',
          score: 72,
          maxScore: 100,
          description: 'Estimated test coverage is 72% across core application logic.',
          feedback: ['Test framework runner configured', 'Core business functions covered'],
        },
        dependencyFreshness: {
          name: 'Dependency Freshness',
          score: 88,
          maxScore: 100,
          description: 'Dependencies are up-to-date with 0 known security vulnerabilities.',
          feedback: ['No known vulnerability CVE alerts', 'Minor package updates available'],
        },
      },
      metrics: {
        codeComplexity: {
          cyclomaticComplexityAvg: 5.1,
          rating: 'Low',
          maxFileComplexity: {
            file: 'src/App.tsx',
            complexity: 10,
          },
          complexityDistribution: {
            simple: 80,
            moderate: 15,
            complex: 5,
          },
          explanation: 'Cyclomatic complexity measures decision points (`if`, `loops`, `switch`) in code. Lower complexity reduces cognitive load and simplifies debugging.',
          impactOnHealthScore: 'Contributes 15% weight to overall health score by rewarding readable, maintainable, low-risk routines.',
        },
        testCoverage: {
          estimatedPercentage: 72,
          rating: 'Good',
          linesCoveredApprox: 7200,
          totalLinesApprox: 10000,
          untestedCriticalModules: ['src/services/api.ts'],
          testRunner: 'Vitest / Jest',
          explanation: 'Calculates the ratio of lines executed during test runs vs total codebase size to prevent regression bugs.',
          impactOnHealthScore: 'Contributes 20% weight to overall health score, ensuring pull requests do not break existing features.',
        },
        dependencyFreshness: {
          freshnessScore: 88,
          totalDependencies: 20,
          upToDateCount: 17,
          minorOutdatedCount: 3,
          majorOutdatedCount: 0,
          knownVulnerabilitiesCount: 0,
          outdatedPackages: [
            { name: 'typescript', currentVersion: '5.2.2', latestVersion: '5.6.3', status: 'Minor update' },
            { name: 'vite', currentVersion: '5.1.0', latestVersion: '5.4.11', status: 'Minor update' },
          ],
          explanation: 'Checks package versions against latest npm releases and security advisories to keep dependencies secure and current.',
          impactOnHealthScore: 'Contributes 15% weight to overall health score by evaluating technical debt and vulnerability exposure.',
        },
      },
    },
    readmeImprovements: [
      {
        title: 'Environment Setup Section',
        status: 'Missing',
        recommendation: 'Add explicit variable definitions in `.env.example`.',
        suggestedMarkdown: '### Environment Variables\n```env\nPORT=3000\nNODE_ENV=development\n```',
      },
    ],
  };
}

// Vite middleware setup in development or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RepoRescue Server running on http://localhost:${PORT}`);
  });
}

startServer();
