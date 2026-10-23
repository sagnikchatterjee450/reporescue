import React from 'react';
import {
  Github,
  Star,
  GitFork,
  AlertCircle,
  FileText,
  Zap,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { RepoAnalysisData, ContributorMode } from '../types';

interface OverviewSectionProps {
  repo: RepoAnalysisData;
  onSelectTab: (tabId: string) => void;
  contributorMode: ContributorMode;
  onOpenTutor?: () => void;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({
  repo,
  onSelectTab,
  contributorMode,
  onOpenTutor,
}) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* HEADER BANNER */}
      <div className="rounded-xl border border-white/10 bg-[#111] p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {repo.isDemo && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-md border border-amber-500/20 bg-amber-500/10 px-3 py-0.5 text-[10px] font-mono uppercase tracking-wider font-semibold text-amber-400">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Demo Repository</span>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500 text-black font-extrabold text-lg shadow-md">
                {repo.repoName[0]}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold text-white sm:text-3xl tracking-tight">
                    {repo.repoName}
                  </h1>
                  <a
                    href={repo.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 text-white/40 hover:text-white transition"
                    title="Open on GitHub"
                  >
                    <Github className="h-5 w-5" />
                  </a>
                </div>
                <p className="text-xs text-white/40 font-mono">
                  {repo.owner} / {repo.repoName}
                </p>
              </div>
            </div>

            <p className="text-sm text-white/70 max-w-3xl leading-relaxed">
              {repo.description}
            </p>

            {/* Quick Badges */}
            <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
              <span className="flex items-center gap-1.5 rounded-md border border-white/10 bg-[#0a0a0a] px-2.5 py-1 text-white/70 font-mono text-[11px]">
                <Star className="h-3.5 w-3.5 text-amber-400" />
                <span>{repo.stars.toLocaleString()} stars</span>
              </span>
              <span className="flex items-center gap-1.5 rounded-md border border-white/10 bg-[#0a0a0a] px-2.5 py-1 text-white/70 font-mono text-[11px]">
                <GitFork className="h-3.5 w-3.5 text-cyan-400" />
                <span>{repo.forks.toLocaleString()} forks</span>
              </span>
              <span className="flex items-center gap-1.5 rounded-md border border-white/10 bg-[#0a0a0a] px-2.5 py-1 text-white/70 font-mono text-[11px]">
                <AlertCircle className="h-3.5 w-3.5 text-rose-400" />
                <span>{repo.openIssuesCount} open issues</span>
              </span>
              <span className="flex items-center gap-1.5 rounded-md border border-white/10 bg-[#0a0a0a] px-2.5 py-1 text-white/70 font-mono text-[11px]">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>{repo.license}</span>
              </span>
            </div>
          </div>

          {/* Start Here Call to Action */}
          <div className="shrink-0 flex flex-col gap-2.5 bg-[#0a0a0a] p-4 rounded-xl border border-white/10 md:w-64">
            <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 font-bold">
              <Zap className="h-4 w-4" />
              <span>Ready to start?</span>
            </div>
            <p className="text-[11px] text-white/60">
              Follow the AI step-by-step reading roadmap tailored for new contributors.
            </p>
            <button
              onClick={() => onSelectTab('starthere')}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-black hover:bg-emerald-400 transition shadow-md shadow-emerald-500/10"
            >
              <span>View Start Here Path</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            {onOpenTutor && (
              <button
                onClick={() => onOpenTutor()}
                className="w-full flex items-center justify-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition"
              >
                <span>Learn this repo in Tutor</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* BEGINNER MODE HELPER BANNER */}
      {contributorMode === 'beginner' && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h3 className="font-bold text-emerald-300 mb-1 font-mono uppercase tracking-wider text-[11px]">🧑 Beginner Mode Active</h3>
            <p className="text-white/70 leading-relaxed">
              Technical jargon is simplified, essential files are highlighted with explanations, and
              beginner-friendly GitHub issues are prioritized.
            </p>
          </div>
        </div>
      )}

      {/* TECH STACK DETECTION CARDS */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="h-5 w-5 text-emerald-400" />
            <span>Detected Tech Stack</span>
          </h2>
          <span className="text-xs text-white/40 font-mono">
            {repo.techStack.length} Layers Identified
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {repo.techStack.map((item, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-white/10 bg-[#111] p-4 hover:border-emerald-500/30 transition"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider font-semibold text-white/70">
                  {item.category}
                </span>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">{item.name}</h3>
              <p className="text-xs text-white/60 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* QUICK ACTIONS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => onSelectTab('repomap')}
          className="rounded-xl border border-white/10 bg-[#111] p-5 hover:border-emerald-500/30 transition text-left space-y-2 group"
        >
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            🗺️
          </div>
          <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition">
            Explore Architecture Map
          </h3>
          <p className="text-xs text-white/60">
            Interactive visual node graph showing Frontend, Backend, Database, and Auth layers.
          </p>
        </button>

        <button
          onClick={() => onSelectTab('contribute')}
          className="rounded-xl border border-white/10 bg-[#111] p-5 hover:border-emerald-500/30 transition text-left space-y-2 group"
        >
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            🎯
          </div>
          <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition">
            Where Can I Contribute?
          </h3>
          <p className="text-xs text-white/60">
            Find categorized beginner 🟢, intermediate 🟡, and advanced 🔴 open tasks.
          </p>
        </button>

        <button
          onClick={() => onSelectTab('chat')}
          className="rounded-xl border border-white/10 bg-[#111] p-5 hover:border-emerald-500/30 transition text-left space-y-2 group"
        >
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            💬
          </div>
          <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition">
            Ask RepoRescue AI
          </h3>
          <p className="text-xs text-white/60">
            Ask questions like "Where is auth handled?" with direct file citations.
          </p>
        </button>
      </div>
    </div>
  );
};
