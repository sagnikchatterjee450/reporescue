import React from 'react';
import { RepoModel, TourStep } from '../types';
import {
  Compass,
  ArrowRight,
  ShieldCheck,
  GitCommit,
  AlertCircle,
  Users,
  CheckCircle2,
  FileText,
  Activity,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface TutorOverviewProps {
  model: RepoModel;
  onSelectTab: (tab: string) => void;
  onOpenTourStep?: (step: TourStep) => void;
  onRescueRepo?: () => void;
}

export const TutorOverview: React.FC<TutorOverviewProps> = ({
  model,
  onSelectTab,
  onOpenTourStep,
  onRescueRepo,
}) => {
  const health = model.healthSnapshot || {
    lastCommit: 'Recent',
    openIssues: 5,
    contributorsCount: 12,
    ciPassing: true,
    testsQuality: 'Good',
    docsQuality: 'High',
    score: 88,
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>Interactive Onboarding Experience</span>
            <span>·</span>
            <span>{model.owner}/{model.repoName}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Welcome to {model.repoName}
          </h1>

          <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
            {model.summary}
          </p>

          <div className="pt-1 text-xs text-white/60">
            <span className="font-semibold text-white/80">Target Audience:</span> {model.intendedAudience}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-4">
            <button
              onClick={() => onSelectTab('tour')}
              className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-black hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20"
            >
              <Compass className="h-4 w-4" />
              <span>Start Guided Tour (8–15 mins)</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={() => onSelectTab('diagrams')}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10 transition"
            >
              <Layers className="h-4 w-4 text-emerald-400" />
              <span>Explore Architecture Diagrams</span>
            </button>

            {onRescueRepo && (
              <button
                onClick={onRescueRepo}
                className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition"
                title="Send repository to RepoRescue Health & Issue diagnostics"
              >
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <span>Rescue this in RepoRescue</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Repo Health & Quick Snapshot */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-lg border border-white/10 bg-[#111] p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-white/40">
            <Activity className="h-3.5 w-3.5 text-emerald-400" />
            <span>Health Score</span>
          </div>
          <div className="text-lg font-bold text-emerald-400 font-mono tabular-nums">
            {health.score}/100
          </div>
          <div className="text-[10px] text-white/50">Overall quality</div>
        </div>

        <div className="rounded-lg border border-white/10 bg-[#111] p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-white/40">
            <GitCommit className="h-3.5 w-3.5 text-indigo-400" />
            <span>Last Commit</span>
          </div>
          <div className="text-sm font-semibold text-white truncate">
            {health.lastCommit}
          </div>
          <div className="text-[10px] text-white/50">Activity status</div>
        </div>

        <div className="rounded-lg border border-white/10 bg-[#111] p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-white/40">
            <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
            <span>Open Issues</span>
          </div>
          <div className="text-lg font-bold text-white font-mono tabular-nums">
            {health.openIssues}
          </div>
          <div className="text-[10px] text-white/50">Triage backlog</div>
        </div>

        <div className="rounded-lg border border-white/10 bg-[#111] p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-white/40">
            <Users className="h-3.5 w-3.5 text-cyan-400" />
            <span>Contributors</span>
          </div>
          <div className="text-lg font-bold text-white font-mono tabular-nums">
            {health.contributorsCount || 12}+
          </div>
          <div className="text-[10px] text-white/50">Active community</div>
        </div>

        <div className="rounded-lg border border-white/10 bg-[#111] p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-white/40">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>CI / Tests</span>
          </div>
          <div className="text-xs font-semibold text-emerald-400 truncate">
            {health.ciPassing ? 'Passing ✓' : 'Failing ✗'}
          </div>
          <div className="text-[10px] text-white/50">{health.testsQuality}</div>
        </div>

        <div className="rounded-lg border border-white/10 bg-[#111] p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-white/40">
            <FileText className="h-3.5 w-3.5 text-teal-400" />
            <span>Docs Quality</span>
          </div>
          <div className="text-xs font-semibold text-white truncate">
            {health.docsQuality}
          </div>
          <div className="text-[10px] text-white/50">Guides & README</div>
        </div>
      </div>

      {/* Tech Stack Breakdown */}
      <div className="rounded-xl border border-white/10 bg-[#111] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Tech Stack & Architecture Foundations</span>
          </h2>
          <span className="text-xs text-white/40 font-mono">
            {model.techStack.length} Core Technologies
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {model.techStack.map((tech, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-white/5 bg-[#0a0a0a] p-3.5 space-y-1.5 hover:border-white/20 transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{tech.name}</span>
                <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] font-mono text-emerald-400 border border-white/10">
                  {tech.category}
                </span>
              </div>
              <p className="text-xs text-white/60 leading-relaxed">
                {tech.whyUsed}
              </p>
              {tech.version && (
                <div className="text-[10px] text-white/40 font-mono">
                  v{tech.version}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Primary Entry Points */}
      <div className="rounded-xl border border-white/10 bg-[#111] p-6 space-y-4">
        <h2 className="text-base font-bold text-white">
          Where Execution Begins (Entry Points)
        </h2>

        <div className="space-y-2.5">
          {model.entryPoints.map((ep, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-white/5 bg-[#0a0a0a] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-white/20 transition"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {ep.file}
                  </span>
                </div>
                <p className="text-xs text-white/70">{ep.purpose}</p>
                {ep.exports && ep.exports.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-white/50">
                    <span>Key exports:</span>
                    {ep.exports.map((exp, eIdx) => (
                      <span
                        key={eIdx}
                        className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-white/80"
                      >
                        {exp}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => onSelectTab('code')}
                className="shrink-0 self-start sm:self-auto rounded-md bg-white/5 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10 transition"
              >
                Inspect File →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
