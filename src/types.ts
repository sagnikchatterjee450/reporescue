export type ContributorMode = 'beginner' | 'expert';

export interface TechStackItem {
  category: 'Frontend' | 'Backend' | 'Database' | 'Infrastructure' | 'Testing' | 'Language' | 'Tooling';
  name: string;
  icon?: string;
  description: string;
}

export interface ArchitectureNode {
  id: string;
  label: string;
  category: 'Frontend' | 'Backend' | 'Database' | 'Auth' | 'Services' | 'Utils' | 'Config' | 'Tests';
  description: string;
  importantFiles: string[];
  dependencies: string[];
  relatedNodes: string[];
  suggestedFilesToRead: string[];
  x?: number;
  y?: number;
}

export interface StartHereStep {
  stepNumber: number;
  filePath: string;
  title: string;
  why: string;
  keyConcepts: string[];
  estimatedReadingTime: string;
}

export interface ContributionTask {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  difficultyColor: 'green' | 'yellow' | 'red';
  skills: string[];
  filesInvolved: string[];
  estimatedTime: string;
  whyGoodFirstContribution: string;
  description: string;
  stepsToComplete: string[];
  issueNumber?: number;
}

export interface FileFlowNode {
  label: string;
  type: 'input' | 'process' | 'output';
  description: string;
}

export interface FileExplanation {
  filePath: string;
  summary: string;
  simpleExplanation: string;
  beginnerExplanation: string;
  architectureRole: string;
  flow: {
    inputs: string[];
    processingSteps: string[];
    outputs: string[];
  };
  dependencies: string[];
  potentialProblems: string[];
}

export interface HealthScoreCategory {
  name: string;
  score: number;
  maxScore: number;
  description: string;
  feedback: string[];
}

export interface CodeComplexityMetric {
  cyclomaticComplexityAvg: number;
  rating: 'Low' | 'Moderate' | 'High' | 'Critical';
  maxFileComplexity: {
    file: string;
    complexity: number;
  };
  complexityDistribution: {
    simple: number; // percentage of functions with low complexity (1-5)
    moderate: number; // percentage of functions with moderate complexity (6-10)
    complex: number; // percentage of functions with high complexity (>10)
  };
  explanation: string;
  impactOnHealthScore: string;
}

export interface TestCoverageMetric {
  estimatedPercentage: number;
  rating: 'Excellent' | 'Good' | 'Moderate' | 'Low' | 'Critical';
  linesCoveredApprox: number;
  totalLinesApprox: number;
  untestedCriticalModules: string[];
  testRunner: string;
  explanation: string;
  impactOnHealthScore: string;
}

export interface OutdatedDependency {
  name: string;
  currentVersion: string;
  latestVersion: string;
  status: 'Up to date' | 'Minor update' | 'Major update' | 'Vulnerable';
}

export interface DependencyFreshnessMetric {
  freshnessScore: number;
  totalDependencies: number;
  upToDateCount: number;
  minorOutdatedCount: number;
  majorOutdatedCount: number;
  knownVulnerabilitiesCount: number;
  outdatedPackages: OutdatedDependency[];
  explanation: string;
  impactOnHealthScore: string;
}

export interface HealthDashboard {
  overallScore: number;
  gradeLabel: string; // e.g. "82/100 — Good"
  categories: {
    architecture: HealthScoreCategory;
    documentation: HealthScoreCategory;
    testing: HealthScoreCategory;
    codeOrganization: HealthScoreCategory;
    contributorFriendliness: HealthScoreCategory;
    codeComplexity?: HealthScoreCategory;
    testCoverage?: HealthScoreCategory;
    dependencyFreshness?: HealthScoreCategory;
  };
  metrics?: {
    codeComplexity: CodeComplexityMetric;
    testCoverage: TestCoverageMetric;
    dependencyFreshness: DependencyFreshnessMetric;
  };
  summary: string;
}

export interface ReadmeImprovementSection {
  title: string;
  status: 'Missing' | 'Needs Improvement' | 'Good';
  recommendation: string;
  suggestedMarkdown: string;
}

export interface RepoAnalysisData {
  isDemo?: boolean;
  repoUrl: string;
  owner: string;
  repoName: string;
  description: string;
  stars: number;
  forks: number;
  openIssuesCount: number;
  license: string;
  defaultBranch: string;
  techStack: TechStackItem[];
  fileTree: FileTreeNode[];
  readmeContent: string;
  architectureMap: ArchitectureNode[];
  startHerePath: StartHereStep[];
  contributionTasks: ContributionTask[];
  healthDashboard: HealthDashboard;
  readmeImprovements: ReadmeImprovementSection[];
  quickStats: {
    totalFiles: number;
    linesOfCodeApprox: string;
    primaryLanguage: string;
    lastCommit: string;
  };
}

export interface FileTreeNode {
  path: string;
  name: string;
  type: 'file' | 'directory';
  size?: number;
  children?: FileTreeNode[];
  content?: string;
  important?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  citedFiles?: string[];
}

export interface RepoComparisonData {
  repoA: {
    name: string;
    url: string;
    techStack: string[];
    architectureScore: number;
    documentationScore: number;
    beginnerFriendlyScore: number;
    overallScore: number;
  };
  repoB: {
    name: string;
    url: string;
    techStack: string[];
    architectureScore: number;
    documentationScore: number;
    beginnerFriendlyScore: number;
    overallScore: number;
  };
  aiComparisonSummary: string;
  keyDifferences: {
    category: string;
    diffA: string;
    diffB: string;
  }[];
}

// DevFix Types
export interface DevFixRequest {
  language: string;
  errorCode: string;
  codeSnippet?: string;
  contextInfo?: string;
}

export interface DevFixResult {
  language: string;
  errorCode: string;
  errorCategory: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  whatHappened: {
    summary: string;
    technicalDetails: string;
    engineBehavior: string;
  };
  whyItMightHappen: {
    primaryCause: string;
    possibleScenarios: string[];
    riskFactors: string[];
  };
  howToFix: {
    fixedCode: string;
    diffExplanation: string;
    stepByStepResolution: string[];
    preventionBestPractices: string[];
    suggestedLintRuleOrFlag?: string;
  };
}
