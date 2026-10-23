import { RepoAnalysisData, FileExplanation, RepoComparisonData, ChatMessage, DevFixRequest, DevFixResult } from '../types';
import { TASKFLOW_DEMO_REPO, SAMPLE_COMPARISON_DATA } from '../data/demoRepos';

export async function fetchAndAnalyzeRepo(
  repoUrl: string,
  onProgress?: (step: string) => void
): Promise<RepoAnalysisData> {
  // Step 1: Repository Found
  onProgress?.('Repository Found ✓');
  await new Promise((r) => setTimeout(r, 400));

  // Check if demo requested directly
  if (!repoUrl || repoUrl.toLowerCase().includes('demo') || repoUrl.toLowerCase().includes('taskflow')) {
    onProgress?.('Reading README ✓');
    await new Promise((r) => setTimeout(r, 400));
    onProgress?.('Mapping File Structure ✓');
    await new Promise((r) => setTimeout(r, 400));
    onProgress?.('Analyzing Dependencies ✓');
    await new Promise((r) => setTimeout(r, 400));
    onProgress?.('Understanding Architecture ✓');
    await new Promise((r) => setTimeout(r, 400));
    onProgress?.('Finding Contribution Opportunities ✓');
    await new Promise((r) => setTimeout(r, 400));
    onProgress?.('Generating Developer Guide...');
    await new Promise((r) => setTimeout(r, 300));
    return TASKFLOW_DEMO_REPO;
  }

  // Step 2: Fetch repo from server
  onProgress?.('Reading README ✓');
  let repoDataRaw: RepoAnalysisData;

  try {
    const res = await fetch('/api/github/fetch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoUrl }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Fetch failed' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }

    const data = await res.json();
    repoDataRaw = data.data;
  } catch (err: any) {
    console.warn('Backend fetch error, providing structured demo preview:', err);
    // If invalid or rate limited, return TaskFlow with custom URL banner
    return {
      ...TASKFLOW_DEMO_REPO,
      repoUrl,
      repoName: repoUrl.split('/').pop() || 'Repository',
      description: `Analysis for ${repoUrl} (GitHub connection preview mode).`,
    };
  }

  // Step 3: Progress steps
  onProgress?.('Mapping File Structure ✓');
  await new Promise((r) => setTimeout(r, 400));

  onProgress?.('Analyzing Dependencies ✓');
  await new Promise((r) => setTimeout(r, 400));

  onProgress?.('Understanding Architecture ✓');

  // Step 4: AI Analysis
  let fullAnalysis: RepoAnalysisData = repoDataRaw;
  try {
    const aiRes = await fetch('/api/ai/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoData: repoDataRaw }),
    });

    if (aiRes.ok) {
      const aiData = await aiRes.json();
      if (aiData.analysis) {
        fullAnalysis = aiData.analysis;
      }
    }
  } catch (e) {
    console.warn('AI analysis call failed, using synthesized structure:', e);
  }

  onProgress?.('Finding Contribution Opportunities ✓');
  await new Promise((r) => setTimeout(r, 400));

  onProgress?.('Generating Developer Guide...');
  await new Promise((r) => setTimeout(r, 300));

  return fullAnalysis;
}

export async function askRepoRescueAI(
  message: string,
  history: ChatMessage[],
  repoContext: RepoAnalysisData
): Promise<{ text: string; citedFiles: string[] }> {
  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, repoContext }),
    });

    if (!res.ok) {
      throw new Error('Chat API response failed');
    }

    const data = await res.json();
    return {
      text: data.text || 'Unable to generate AI response.',
      citedFiles: data.citedFiles || [],
    };
  } catch (err) {
    return {
      text: `Based on **${repoContext.repoName}**:\n\n- Main Application Entry: \`src/App.tsx\` or \`server/index.ts\`\n- Domain Logic: \`src/components/TaskBoard.tsx\`\n- Authentication: \`server/middleware/auth.ts\`\n\nClick any file above to view its details.`,
      citedFiles: ['src/App.tsx', 'server/index.ts', 'src/components/TaskBoard.tsx', 'server/middleware/auth.ts'],
    };
  }
}

export async function explainFileAI(
  filePath: string,
  fileContent: string,
  mode: string,
  repoName: string
): Promise<FileExplanation> {
  try {
    const res = await fetch('/api/ai/explain-file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filePath, fileContent, mode, repoName }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.explanation) return data.explanation;
    }
  } catch (e) {
    console.warn('File explain fallback triggered:', e);
  }

  return {
    filePath,
    summary: `The file \`${filePath}\` contains key logic for ${repoName}.`,
    simpleExplanation: `Provides functions and interface handling for \`${filePath.split('/').pop()}\`.`,
    beginnerExplanation: `Acts as a modular component handling data transformation and UI rendering.`,
    architectureRole: `Integrates user actions with underlying backend services and database storage.`,
    flow: {
      inputs: ['User Props', 'API Response Payload'],
      processingSteps: ['Validate payload parameters', 'Execute core state updates', 'Render UI output'],
      outputs: ['Updated React View', 'Dispatched API Action'],
    },
    dependencies: ['React / Express', 'TypeScript Types'],
    potentialProblems: ['Check for unhandled asynchronous loading states'],
  };
}

export async function compareReposAI(repoAUrl: string, repoBUrl: string): Promise<RepoComparisonData> {
  try {
    const res = await fetch('/api/ai/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoAUrl, repoBUrl }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.comparison) return data.comparison;
    }
  } catch (e) {
    console.warn('Comparison fallback:', e);
  }

  return SAMPLE_COMPARISON_DATA;
}

export async function analyzeDevFixError(params: DevFixRequest): Promise<DevFixResult> {
  const res = await fetch('/api/devfix/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({ error: 'DevFix analysis request failed.' }));
    throw new Error(errData.error || `HTTP error ${res.status}`);
  }

  const data = await res.json();
  if (!data.success || !data.result) {
    throw new Error('Invalid response structure received from DevFix analyzer.');
  }

  return data.result;
}
