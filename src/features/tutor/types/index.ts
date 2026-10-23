export type TourDifficulty = 'new_to_programming' | 'experienced_new_to_stack' | 'senior_architecture';
export type TourRole = 'all' | 'frontend' | 'backend' | 'devops' | 'docs' | 'reviewer';
export type ExplainDepth = 'eli5' | 'junior' | 'senior';

export interface TechStackBadge {
  category: string;
  name: string;
  version?: string;
  whyUsed: string;
}

export interface EntryPoint {
  file: string;
  purpose: string;
  exports: string[];
}

export interface ModuleDefinition {
  id: string;
  name: string;
  purpose: string;
  keyFiles: string[];
  dependsOn: string[];
  exports?: string[];
  complexity?: 'Low' | 'Moderate' | 'High';
}

export interface FlowStep {
  stepNumber: number;
  file: string;
  action: string;
  description: string;
}

export interface DataFlow {
  id: string;
  name: string;
  description: string;
  steps: FlowStep[];
  sequenceMermaid?: string;
}

export interface GlossaryItem {
  term: string;
  definition: string;
  whereUsed: string;
}

export interface ConfigEnvVar {
  name: string;
  purpose: string;
  required: boolean;
  defaultValue?: string;
  example: string;
}

export interface SetupStep {
  id: string;
  category: 'install' | 'run' | 'test' | 'build';
  command: string;
  description: string;
  commonFailures?: string[];
}

export interface CodeConvention {
  rule: string;
  example: string;
  context: string;
}

export interface GotchaItem {
  title: string;
  description: string;
  mitigation: string;
  fileRef?: string;
}

export interface TourStep {
  stepNumber: number;
  title: string;
  files: string[];
  whyItMatters: string;
  whatToNotice: string[];
  minutes: number;
  difficulty: TourDifficulty;
  roles: ('frontend' | 'backend' | 'devops' | 'docs' | 'reviewer')[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ModuleQuiz {
  moduleId: string;
  moduleName: string;
  questions: QuizQuestion[];
}

export interface FirstContributionTask {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  skills: string[];
  involvedFiles: string[];
  estimatedMinutes: number;
  whyGoodFirstIssue: string;
  testInstructions: string;
  prChecklist: string[];
}

export interface RecentChangeDigest {
  title: string;
  commitOrPr: string;
  architecturalImpact: string;
  date: string;
}

export interface RepoModel {
  repoUrl: string;
  owner: string;
  repoName: string;
  commitSha: string;
  summary: string;
  intendedAudience: string;
  techStack: TechStackBadge[];
  entryPoints: EntryPoint[];
  modules: ModuleDefinition[];
  flows: DataFlow[];
  keyConceptsAndGlossary: GlossaryItem[];
  configAndEnvVars: ConfigEnvVar[];
  setupSteps: SetupStep[];
  codeConventions: CodeConvention[];
  gotchas: GotchaItem[];
  diagrams: {
    systemOverviewMermaid: string;
    moduleDependencyMermaid: string;
    sequenceFlows: {
      flowId: string;
      title: string;
      mermaid: string;
    }[];
  };
  guidedTour: TourStep[];
  quizzes: ModuleQuiz[];
  firstContributions: FirstContributionTask[];
  recentChangesSummary?: RecentChangeDigest[];
  healthSnapshot?: {
    lastCommit: string;
    openIssues: number;
    contributorsCount?: number;
    ciPassing: boolean;
    testsQuality: string;
    docsQuality: string;
    score: number;
  };
}

export interface Citation {
  filePath: string;
  lines?: string;
  isVerified: boolean;
}

export interface TutorChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  citations: Citation[];
}

export interface FileDetailedExplanation {
  filePath: string;
  depth: ExplainDepth;
  whatItDoes: string;
  whyItExists: string;
  howItConnects: string;
  gotchas: string[];
  whereUsed: string[];
}
