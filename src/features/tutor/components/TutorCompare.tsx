import React, { useState } from 'react';
import { RepoModel } from '../types';
import { ArrowRightLeft, Layers, Clock, ShieldCheck, Activity, Sparkles } from 'lucide-react';

interface TutorCompareProps {
  currentModel: RepoModel;
}

export const TutorCompare: React.FC<TutorCompareProps> = ({ currentModel }) => {
  const [compareRepoUrl, setCompareRepoUrl] = useState('https://github.com/expressjs/express');

  // Comparison mock / synthesized data
  const comparisonData = {
    repoA: {
      name: `${currentModel.owner}/${currentModel.repoName}`,
      summary: currentModel.summary,
      primaryLanguage: currentModel.techStack[0]?.name || 'TypeScript',
      moduleCount: currentModel.modules.length,
      entryPointsCount: currentModel.entryPoints.length,
      estimatedOnboardingHours: '2.5 hrs',
      healthScore: currentModel.healthSnapshot?.score || 88,
      complexityRating: 'Moderate',
    },
    repoB: {
      name: 'expressjs/express',
      summary: 'Fast, unopinionated, minimalist web framework for Node.js.',
      primaryLanguage: 'JavaScript',
      moduleCount: 6,
      entryPointsCount: 2,
      estimatedOnboardingHours: '1.5 hrs',
      healthScore: 94,
      complexityRating: 'Low-to-Moderate',
    },
    keyArchitecturalDifferences: [
      {
        aspect: 'Modularity Pattern',
        diffA: 'Hierarchical services with isolated worker threads and atomic Redis script leases.',
        diffB: 'Linear middleware chain dispatch using Layer and Route abstractions.',
      },
      {
        aspect: 'Type Safety & Invariants',
        diffA: 'Strict TypeScript interfaces across all payloads, events, and Redis schema models.',
        diffB: 'Pure JavaScript with optional JSDoc type annotations.',
      },
      {
        aspect: 'Onboarding Complexity',
        diffA: 'Requires understanding asynchronous distributed queues and Redis Lua scripts.',
        diffB: 'Straightforward HTTP request/response pipeline and callback patterns.',
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-white/10 bg-[#111] p-6 space-y-4">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <ArrowRightLeft className="h-5 w-5 text-emerald-400" />
          <span>Compare Architecture & Onboarding Complexity</span>
        </h1>
        <p className="text-xs text-white/60">
          Side-by-side structural comparison of design patterns, modular boundaries, and developer learning curves.
        </p>

        {/* Input for secondary repo */}
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
          <input
            type="text"
            value={compareRepoUrl}
            onChange={(e) => setCompareRepoUrl(e.target.value)}
            placeholder="Enter second GitHub repository (e.g. facebook/react)"
            className="w-full sm:w-96 rounded-lg border border-white/10 bg-[#0a0a0a] px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
          />
          <button className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-black hover:bg-emerald-400 transition shrink-0">
            Compare Repos
          </button>
        </div>
      </div>

      {/* Side by side comparison cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Repo A */}
        <div className="rounded-xl border border-emerald-500/30 bg-[#0a0a0a] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-xs font-mono font-bold text-emerald-400">
              {comparisonData.repoA.name}
            </span>
            <span className="rounded bg-emerald-500/10 text-emerald-400 px-2 py-0.5 text-[10px] font-mono">
              Current Repo
            </span>
          </div>

          <p className="text-xs text-gray-300 leading-relaxed min-h-[48px]">
            {comparisonData.repoA.summary}
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-mono">
            <div className="rounded bg-[#111] p-3 border border-white/5 space-y-1">
              <span className="text-white/40 text-[10px]">Primary Language</span>
              <div className="text-white font-bold">{comparisonData.repoA.primaryLanguage}</div>
            </div>
            <div className="rounded bg-[#111] p-3 border border-white/5 space-y-1">
              <span className="text-white/40 text-[10px]">Onboarding Time</span>
              <div className="text-emerald-400 font-bold">{comparisonData.repoA.estimatedOnboardingHours}</div>
            </div>
            <div className="rounded bg-[#111] p-3 border border-white/5 space-y-1">
              <span className="text-white/40 text-[10px]">Core Modules</span>
              <div className="text-white font-bold">{comparisonData.repoA.moduleCount} modules</div>
            </div>
            <div className="rounded bg-[#111] p-3 border border-white/5 space-y-1">
              <span className="text-white/40 text-[10px]">Health Score</span>
              <div className="text-emerald-400 font-bold">{comparisonData.repoA.healthScore}/100</div>
            </div>
          </div>
        </div>

        {/* Repo B */}
        <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-xs font-mono font-bold text-indigo-400">
              {comparisonData.repoB.name}
            </span>
            <span className="rounded bg-indigo-500/10 text-indigo-400 px-2 py-0.5 text-[10px] font-mono">
              Comparison Target
            </span>
          </div>

          <p className="text-xs text-gray-300 leading-relaxed min-h-[48px]">
            {comparisonData.repoB.summary}
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-mono">
            <div className="rounded bg-[#111] p-3 border border-white/5 space-y-1">
              <span className="text-white/40 text-[10px]">Primary Language</span>
              <div className="text-white font-bold">{comparisonData.repoB.primaryLanguage}</div>
            </div>
            <div className="rounded bg-[#111] p-3 border border-white/5 space-y-1">
              <span className="text-white/40 text-[10px]">Onboarding Time</span>
              <div className="text-indigo-400 font-bold">{comparisonData.repoB.estimatedOnboardingHours}</div>
            </div>
            <div className="rounded bg-[#111] p-3 border border-white/5 space-y-1">
              <span className="text-white/40 text-[10px]">Core Modules</span>
              <div className="text-white font-bold">{comparisonData.repoB.moduleCount} modules</div>
            </div>
            <div className="rounded bg-[#111] p-3 border border-white/5 space-y-1">
              <span className="text-white/40 text-[10px]">Health Score</span>
              <div className="text-indigo-400 font-bold">{comparisonData.repoB.healthScore}/100</div>
            </div>
          </div>
        </div>
      </div>

      {/* Architectural Diff Table */}
      <div className="rounded-xl border border-white/10 bg-[#111] p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="h-4 w-4 text-emerald-400" />
          <span>Key Architectural Divergences</span>
        </h2>

        <div className="space-y-4">
          {comparisonData.keyArchitecturalDifferences.map((item, idx) => (
            <div key={idx} className="rounded-lg bg-[#0a0a0a] border border-white/5 p-4 space-y-3">
              <span className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                {item.aspect}
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1 pl-3 border-l-2 border-emerald-500/50">
                  <div className="font-semibold text-emerald-400 font-mono text-[11px]">
                    {currentModel.repoName}
                  </div>
                  <p className="text-gray-300 leading-relaxed">{item.diffA}</p>
                </div>

                <div className="space-y-1 pl-3 border-l-2 border-indigo-500/50">
                  <div className="font-semibold text-indigo-400 font-mono text-[11px]">
                    {comparisonData.repoB.name}
                  </div>
                  <p className="text-gray-300 leading-relaxed">{item.diffB}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
