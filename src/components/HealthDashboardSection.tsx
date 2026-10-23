import React, { useState } from 'react';
import {
  Activity,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Brain,
  TestTube,
  PackageCheck,
  Info,
  HelpCircle,
  BarChart3,
  Layers,
  Zap,
  AlertCircle,
  FileCode,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { RepoAnalysisData, HealthScoreCategory } from '../types';

interface HealthDashboardSectionProps {
  repo: RepoAnalysisData;
}

export const HealthDashboardSection: React.FC<HealthDashboardSectionProps> = ({ repo }) => {
  const { healthDashboard } = repo;
  const [activeTab, setActiveTab] = useState<'metrics' | 'categories' | 'weights'>('metrics');
  const [expandedMetric, setExpandedMetric] = useState<'complexity' | 'coverage' | 'deps' | null>('complexity');

  // Fallback defaults for new metrics if not provided in raw repo object
  const metrics = healthDashboard.metrics || {
    codeComplexity: {
      cyclomaticComplexityAvg: 4.8,
      rating: 'Low' as const,
      maxFileComplexity: {
        file: 'server/routes/tasks.ts',
        complexity: 12,
      },
      complexityDistribution: {
        simple: 78,
        moderate: 18,
        complex: 4,
      },
      explanation:
        'Cyclomatic complexity measures the number of linearly independent execution paths through code (e.g. branches formed by if, for, while, case, and catch statements). An average below 10 indicates clean, easily testable logic with minimal cognitive overhead.',
      impactOnHealthScore:
        'Contributes 15% weight to overall health score. Low complexity reduces regression risk and makes code significantly easier for new contributors to understand and refactor safely.',
    },
    testCoverage: {
      estimatedPercentage: healthDashboard.categories.testing?.score || 71,
      rating: 'Good' as const,
      linesCoveredApprox: Math.round(((healthDashboard.categories.testing?.score || 71) / 100) * 14200),
      totalLinesApprox: 14200,
      untestedCriticalModules: ['server/socket/hub.ts', 'server/middleware/rateLimiter.ts'],
      testRunner: 'Vitest & React Testing Library',
      explanation:
        'Estimated test coverage calculates the ratio of source code statements executed during automated test suite runs versus total codebase lines. Higher coverage protects against breaking changes during pull request merges.',
      impactOnHealthScore:
        'Contributes 20% weight to overall health score. A 70%+ score indicates strong safety nets for common paths, though uncovered real-time handlers slightly increase production bug risk.',
    },
    dependencyFreshness: {
      freshnessScore: 85,
      totalDependencies: 28,
      upToDateCount: 22,
      minorOutdatedCount: 4,
      majorOutdatedCount: 2,
      knownVulnerabilitiesCount: 0,
      outdatedPackages: [
        { name: 'express', currentVersion: '4.18.2', latestVersion: '5.0.1', status: 'Major update' as const },
        { name: 'socket.io', currentVersion: '4.7.2', latestVersion: '4.8.1', status: 'Minor update' as const },
        { name: 'drizzle-orm', currentVersion: '0.29.3', latestVersion: '0.36.0', status: 'Major update' as const },
        { name: 'lucide-react', currentVersion: '0.344.0', latestVersion: '0.460.0', status: 'Minor update' as const },
      ],
      explanation:
        'Dependency freshness evaluates how closely manifest dependencies match current npm releases and checks for published security advisories (CVEs). Fresh packages ensure stability and security.',
      impactOnHealthScore:
        'Contributes 15% weight to overall health score. Zero security vulnerabilities yields a high baseline, though lagging behind major releases introduces future technical debt when upgrading.',
    },
  };

  const categories: HealthScoreCategory[] = Object.values(healthDashboard.categories).filter(
    (cat): cat is HealthScoreCategory => Boolean(cat && typeof cat === 'object' && 'score' in cat)
  );

  // Score weight breakdown table items
  const weightBreakdown = [
    { name: 'Architecture & Modularity', weight: '20%', score: healthDashboard.categories.architecture.score, impact: 'High', reasoning: 'Ensures clear component boundaries and prevents monolithic coupling.' },
    { name: 'Estimated Test Coverage', weight: '20%', score: metrics.testCoverage.estimatedPercentage, impact: 'High', reasoning: 'Protects core application routines from regression bugs during PR merges.' },
    { name: 'Code Complexity (Cyclomatic)', weight: '15%', score: Math.round(100 - (metrics.codeComplexity.cyclomaticComplexityAvg * 4)), impact: 'Medium', reasoning: 'Reduces cognitive load and ensures functions are readable and refactorable.' },
    { name: 'Dependency Freshness', weight: '15%', score: metrics.dependencyFreshness.freshnessScore, impact: 'Medium', reasoning: 'Mitigates security vulnerability exposure and prevents API drift debt.' },
    { name: 'Code Organization', weight: '10%', score: healthDashboard.categories.codeOrganization.score, impact: 'Medium', reasoning: 'Maintains directory clarity, strict typing, and consistent naming.' },
    { name: 'Contributor Friendliness', weight: '10%', score: healthDashboard.categories.contributorFriendliness.score, impact: 'Low-Medium', reasoning: 'Helps new developers set up locally and find good first issues.' },
    { name: 'Documentation Quality', weight: '10%', score: healthDashboard.categories.documentation.score, impact: 'Low-Medium', reasoning: 'Provides environment setup instructions and architectural guidance.' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* HEADER BANNER */}
      <div className="rounded-xl border border-white/10 bg-[#111] p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-3 py-0.5 text-[10px] font-mono uppercase tracking-wider font-semibold text-emerald-400">
              <Activity className="h-3.5 w-3.5 text-emerald-400" />
              <span>Automated Health Scorecard</span>
            </div>

            <h1 className="text-2xl font-extrabold text-white sm:text-3xl tracking-tight">
              Repository Health Dashboard
            </h1>

            <p className="text-xs text-white/60 max-w-2xl leading-relaxed">
              {healthDashboard.summary}
            </p>
          </div>

          {/* Overall Score Badge */}
          <div className="shrink-0 flex flex-col items-center justify-center p-6 rounded-xl bg-[#0a0a0a] border border-white/10 text-center min-w-[200px] shadow-2xl">
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">
              Overall Health Score
            </span>
            <span className="text-4xl font-extrabold text-emerald-400 my-1 font-mono">
              {healthDashboard.overallScore}/100
            </span>
            <span className="rounded-md bg-emerald-500/10 px-3 py-0.5 text-xs font-mono font-bold text-emerald-300 border border-emerald-500/20">
              {healthDashboard.gradeLabel}
            </span>
          </div>
        </div>

        {/* View Toggle Bar */}
        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-white/10 font-mono text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
              activeTab === 'metrics'
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-bold'
                : 'border-white/10 bg-[#0a0a0a] text-white/60 hover:text-white'
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            <span>Key Metrics & Explanations</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
              activeTab === 'categories'
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-bold'
                : 'border-white/10 bg-[#0a0a0a] text-white/60 hover:text-white'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Category Scorecard ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('weights')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
              activeTab === 'weights'
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-bold'
                : 'border-white/10 bg-[#0a0a0a] text-white/60 hover:text-white'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Score Weight Formula</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: KEY METRICS & EXPLANATIONS */}
      {(activeTab === 'metrics' || activeTab === 'weights') && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span>Enhanced Repository Quality Metrics</span>
            </h2>
            <span className="text-xs font-mono text-white/40">3 Automated Measurements</span>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* METRIC 1: CODE COMPLEXITY */}
            <div className="rounded-xl border border-white/10 bg-[#111] p-6 shadow-xl space-y-5 hover:border-emerald-500/30 transition">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <Brain className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      Code Complexity (Cyclomatic)
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                        Avg: {metrics.codeComplexity.cyclomaticComplexityAvg} ({metrics.codeComplexity.rating} Risk)
                      </span>
                    </h3>
                    <p className="text-xs text-white/60">
                      Evaluates function branching density and structural maintainability.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-white/40">Score Weight:</span>
                  <span className="px-2.5 py-1 rounded-md bg-[#0a0a0a] border border-white/10 text-emerald-400 font-bold">
                    15%
                  </span>
                </div>
              </div>

              {/* Explanations Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                {/* Metric Definition Explanation */}
                <div className="rounded-lg border border-white/10 bg-[#0a0a0a] p-4 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold uppercase tracking-wider text-[11px]">
                    <Info className="h-4 w-4 shrink-0" />
                    <span>What is Cyclomatic Complexity?</span>
                  </div>
                  <p className="text-white/70 leading-relaxed">
                    {metrics.codeComplexity.explanation}
                  </p>
                </div>

                {/* Score Impact Explanation */}
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold uppercase tracking-wider text-[11px]">
                    <Zap className="h-4 w-4 shrink-0" />
                    <span>Impact on Overall Health Score</span>
                  </div>
                  <p className="text-white/80 leading-relaxed">
                    {metrics.codeComplexity.impactOnHealthScore}
                  </p>
                </div>
              </div>

              {/* Visual Complexity Distribution */}
              <div className="rounded-lg border border-white/10 bg-[#0a0a0a] p-4 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between text-white/70">
                  <span className="font-bold">Function Complexity Distribution:</span>
                  <span className="text-emerald-400 text-[11px]">
                    {metrics.codeComplexity.complexityDistribution.simple}% Simple (1–5)
                  </span>
                </div>

                <div className="h-3 w-full rounded-full bg-white/5 overflow-hidden flex border border-white/10">
                  <div
                    style={{ width: `${metrics.codeComplexity.complexityDistribution.simple}%` }}
                    className="bg-emerald-500 h-full"
                    title={`Simple (1-5): ${metrics.codeComplexity.complexityDistribution.simple}%`}
                  />
                  <div
                    style={{ width: `${metrics.codeComplexity.complexityDistribution.moderate}%` }}
                    className="bg-amber-500 h-full"
                    title={`Moderate (6-10): ${metrics.codeComplexity.complexityDistribution.moderate}%`}
                  />
                  <div
                    style={{ width: `${metrics.codeComplexity.complexityDistribution.complex}%` }}
                    className="bg-rose-500 h-full"
                    title={`Complex (>10): ${metrics.codeComplexity.complexityDistribution.complex}%`}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between text-[11px] pt-1 text-white/60">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Simple (1–5): {metrics.codeComplexity.complexityDistribution.simple}%
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      Moderate (6–10): {metrics.codeComplexity.complexityDistribution.moderate}%
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-rose-500" />
                      Complex (&gt;10): {metrics.codeComplexity.complexityDistribution.complex}%
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-amber-400 font-semibold mt-1 sm:mt-0">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>Max Hotspot: {metrics.codeComplexity.maxFileComplexity.file} (Complexity {metrics.codeComplexity.maxFileComplexity.complexity})</span>
                  </div>
                </div>
              </div>
            </div>

            {/* METRIC 2: ESTIMATED TEST COVERAGE */}
            <div className="rounded-xl border border-white/10 bg-[#111] p-6 shadow-xl space-y-5 hover:border-emerald-500/30 transition">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <TestTube className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      Estimated Test Coverage
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                        {metrics.testCoverage.estimatedPercentage}% ({metrics.testCoverage.rating})
                      </span>
                    </h3>
                    <p className="text-xs text-white/60">
                      Calculates automated test suite line execution across source files.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-white/40">Score Weight:</span>
                  <span className="px-2.5 py-1 rounded-md bg-[#0a0a0a] border border-white/10 text-emerald-400 font-bold">
                    20%
                  </span>
                </div>
              </div>

              {/* Explanations Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                {/* Metric Definition Explanation */}
                <div className="rounded-lg border border-white/10 bg-[#0a0a0a] p-4 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold uppercase tracking-wider text-[11px]">
                    <Info className="h-4 w-4 shrink-0" />
                    <span>What is Test Coverage?</span>
                  </div>
                  <p className="text-white/70 leading-relaxed">
                    {metrics.testCoverage.explanation}
                  </p>
                </div>

                {/* Score Impact Explanation */}
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold uppercase tracking-wider text-[11px]">
                    <Zap className="h-4 w-4 shrink-0" />
                    <span>Impact on Overall Health Score</span>
                  </div>
                  <p className="text-white/80 leading-relaxed">
                    {metrics.testCoverage.impactOnHealthScore}
                  </p>
                </div>
              </div>

              {/* Test Coverage Stats Breakdown */}
              <div className="rounded-lg border border-white/10 bg-[#0a0a0a] p-4 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between text-white/70">
                  <span className="font-bold">Test Execution Lines:</span>
                  <span className="text-emerald-400 font-bold">
                    ~{metrics.testCoverage.linesCoveredApprox.toLocaleString()} / {metrics.testCoverage.totalLinesApprox.toLocaleString()} lines ({metrics.testCoverage.estimatedPercentage}%)
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2.5 w-full rounded-full bg-white/5 overflow-hidden border border-white/10">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-500"
                    style={{ width: `${metrics.testCoverage.estimatedPercentage}%` }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-[11px]">
                  <div className="flex items-center gap-2 text-white/70">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span>Test Framework: <strong className="text-white">{metrics.testCoverage.testRunner}</strong></span>
                  </div>

                  <div className="flex items-center gap-2 text-amber-400">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>Untested Modules: <span className="underline">{metrics.testCoverage.untestedCriticalModules.join(', ')}</span></span>
                  </div>
                </div>
              </div>
            </div>

            {/* METRIC 3: DEPENDENCY FRESHNESS */}
            <div className="rounded-xl border border-white/10 bg-[#111] p-6 shadow-xl space-y-5 hover:border-emerald-500/30 transition">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <PackageCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      Dependency Update Status (Freshness)
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                        Score: {metrics.dependencyFreshness.freshnessScore}/100 ({metrics.dependencyFreshness.knownVulnerabilitiesCount} CVEs)
                      </span>
                    </h3>
                    <p className="text-xs text-white/60">
                      Tracks npm package version currency, major drift, and security advisories.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-white/40">Score Weight:</span>
                  <span className="px-2.5 py-1 rounded-md bg-[#0a0a0a] border border-white/10 text-emerald-400 font-bold">
                    15%
                  </span>
                </div>
              </div>

              {/* Explanations Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                {/* Metric Definition Explanation */}
                <div className="rounded-lg border border-white/10 bg-[#0a0a0a] p-4 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold uppercase tracking-wider text-[11px]">
                    <Info className="h-4 w-4 shrink-0" />
                    <span>What is Dependency Freshness?</span>
                  </div>
                  <p className="text-white/70 leading-relaxed">
                    {metrics.dependencyFreshness.explanation}
                  </p>
                </div>

                {/* Score Impact Explanation */}
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold uppercase tracking-wider text-[11px]">
                    <Zap className="h-4 w-4 shrink-0" />
                    <span>Impact on Overall Health Score</span>
                  </div>
                  <p className="text-white/80 leading-relaxed">
                    {metrics.dependencyFreshness.impactOnHealthScore}
                  </p>
                </div>
              </div>

              {/* Dependency Status Table / Grid */}
              <div className="rounded-lg border border-white/10 bg-[#0a0a0a] p-4 space-y-4 font-mono text-xs">
                {/* Status Bar */}
                <div className="flex flex-wrap items-center justify-between text-[11px] gap-2 pb-2 border-b border-white/10 text-white/70">
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400 font-bold">
                      ✓ {metrics.dependencyFreshness.upToDateCount} Up to Date
                    </span>
                    <span className="text-amber-400 font-bold">
                      ⚠ {metrics.dependencyFreshness.minorOutdatedCount} Minor Updates
                    </span>
                    <span className="text-indigo-400 font-bold">
                      ⚡ {metrics.dependencyFreshness.majorOutdatedCount} Major Updates
                    </span>
                  </div>
                  <div className="text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    <span>{metrics.dependencyFreshness.knownVulnerabilitiesCount} Security Vulnerabilities</span>
                  </div>
                </div>

                {/* Outdated Package List */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                    Packages Requiring Attention:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {metrics.dependencyFreshness.outdatedPackages.map((pkg, pIdx) => (
                      <div
                        key={pIdx}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-white/5 bg-[#111] text-[11px]"
                      >
                        <div className="flex items-center gap-2">
                          <FileCode className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          <span className="font-bold text-white">{pkg.name}</span>
                        </div>

                        <div className="flex items-center gap-2 text-[10px]">
                          <span className="text-white/50">{pkg.currentVersion}</span>
                          <ArrowRight className="h-3 w-3 text-white/30" />
                          <span className="text-emerald-400 font-bold">{pkg.latestVersion}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                              pkg.status === 'Major update'
                                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                : pkg.status === 'Vulnerable'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {pkg.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: SCORE WEIGHT BREAKDOWN FORMULA */}
      {(activeTab === 'weights' || activeTab === 'metrics') && (
        <div className="rounded-xl border border-white/10 bg-[#111] p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="h-4 w-4 text-emerald-400" />
                <span>Overall Health Score Weight Breakdown</span>
              </h2>
              <p className="text-xs text-white/60">
                How RepoRescue combines metrics and structural checks to produce the final 100-point score.
              </p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              Formula Total: 100%
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-white/40 text-[10px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Metric / Category</th>
                  <th className="py-2.5 px-3">Formula Weight</th>
                  <th className="py-2.5 px-3">Current Score</th>
                  <th className="py-2.5 px-3">Impact Level</th>
                  <th className="py-2.5 px-3 font-sans">Why It Matters</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                {weightBreakdown.map((item, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition">
                    <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      {item.name}
                    </td>
                    <td className="py-3 px-3 text-emerald-400 font-bold">{item.weight}</td>
                    <td className="py-3 px-3 font-bold">{item.score} / 100</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          item.impact === 'High'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {item.impact}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-sans text-white/60 text-xs">{item.reasoning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 3: ALL CATEGORY CARDS */}
      {(activeTab === 'categories' || activeTab === 'metrics') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-400" />
              <span>Full Repository Category Scorecard</span>
            </h2>
            <span className="text-xs font-mono text-white/40">{categories.length} Categories Assessed</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((cat, idx) => {
              const isHigh = cat.score >= 80;
              const isMedium = cat.score >= 70 && cat.score < 80;

              return (
                <div
                  key={idx}
                  className="rounded-xl border border-white/10 bg-[#111] p-6 shadow-xl space-y-4 hover:border-emerald-500/30 transition"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white">{cat.name}</h3>
                    <span
                      className={`font-mono text-xs font-extrabold px-2.5 py-1 rounded-md border ${
                        isHigh
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : isMedium
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}
                    >
                      {cat.score} / {cat.maxScore}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-1.5 w-full rounded-full bg-[#0a0a0a] overflow-hidden border border-white/5">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isHigh ? 'bg-emerald-500' : isMedium ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${(cat.score / cat.maxScore) * 100}%` }}
                    />
                  </div>

                  <p className="text-xs text-white/70 leading-relaxed">{cat.description}</p>

                  {/* Feedback bullets */}
                  <div className="space-y-1.5 pt-2 border-t border-white/10 text-xs">
                    {cat.feedback.map((fb, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-white/70">{fb}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
