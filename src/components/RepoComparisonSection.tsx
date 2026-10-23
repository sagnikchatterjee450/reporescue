import React, { useState } from 'react';
import { ArrowRightLeft, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { RepoComparisonData } from '../types';
import { SAMPLE_COMPARISON_DATA } from '../data/demoRepos';
import { compareReposAI } from '../services/apiClient';

export const RepoComparisonSection: React.FC = () => {
  const [repoAUrl, setRepoAUrl] = useState('https://github.com/open-source/taskflow');
  const [repoBUrl, setRepoBUrl] = useState('https://github.com/open-source/miniexpress');
  const [data, setData] = useState<RepoComparisonData>(SAMPLE_COMPARISON_DATA);
  const [loading, setLoading] = useState(false);

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await compareReposAI(repoAUrl, repoBUrl);
    setData(result);
    setLoading(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* HEADER */}
      <div className="rounded-xl border border-white/10 bg-[#111] p-6 sm:p-8 shadow-xl">
        <div className="inline-flex items-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-3 py-0.5 text-[10px] font-mono uppercase tracking-wider font-semibold text-emerald-400 mb-3">
          <ArrowRightLeft className="h-3.5 w-3.5 text-emerald-400" />
          <span>Side-by-Side Analysis</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white sm:text-3xl tracking-tight">
          Repository Comparison
        </h1>
        <p className="mt-1 text-xs text-white/60 max-w-2xl leading-relaxed">
          Compare two open-source projects to evaluate tech stack differences, architectural scores, and contributor friendliness.
        </p>

        {/* Input Form */}
        <form onSubmit={handleCompare} className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
          <input
            type="text"
            value={repoAUrl}
            onChange={(e) => setRepoAUrl(e.target.value)}
            placeholder="Repository A URL..."
            className="md:col-span-2 rounded-lg border border-white/10 bg-[#0a0a0a] px-4 py-2.5 text-xs text-gray-200 placeholder-white/30 focus:outline-none focus:border-emerald-500 font-mono"
          />
          <div className="text-center font-bold text-white/40 text-xs font-mono">VS</div>
          <input
            type="text"
            value={repoBUrl}
            onChange={(e) => setRepoBUrl(e.target.value)}
            placeholder="Repository B URL..."
            className="md:col-span-2 rounded-lg border border-white/10 bg-[#0a0a0a] px-4 py-2.5 text-xs text-gray-200 placeholder-white/30 focus:outline-none focus:border-emerald-500 font-mono"
          />
          <button
            type="submit"
            disabled={loading}
            className="md:col-span-5 mt-2 flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-6 py-2.5 text-xs font-bold text-black hover:bg-emerald-400 transition shadow-md font-mono"
          >
            <Sparkles className="h-4 w-4" />
            <span>{loading ? 'Analyzing Repositories...' : 'Compare Repositories'}</span>
          </button>
        </form>
      </div>

      {/* COMPARISON TABLE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* REPO A CARD */}
        <div className="rounded-xl border border-white/10 bg-[#111] p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h2 className="text-xl font-extrabold text-white">{data.repoA.name}</h2>
              <p className="text-[10px] text-white/40 font-mono">{data.repoA.url}</p>
            </div>
            <span className="text-xl font-extrabold text-emerald-400 font-mono">
              {data.repoA.overallScore}/100
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-white/40 block mb-1">
                Tech Stack
              </span>
              <div className="flex flex-wrap gap-1">
                {data.repoA.techStack.map((tech, i) => (
                  <span
                    key={i}
                    className="rounded bg-[#0a0a0a] border border-white/10 px-2 py-0.5 text-[11px] font-mono text-white/70"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex justify-between text-white/70">
                <span>Architecture</span>
                <span className="font-mono text-emerald-400">{data.repoA.architectureScore}%</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Documentation</span>
                <span className="font-mono text-cyan-400">{data.repoA.documentationScore}%</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Beginner Friendly</span>
                <span className="font-mono text-indigo-400">
                  {data.repoA.beginnerFriendlyScore}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* REPO B CARD */}
        <div className="rounded-xl border border-white/10 bg-[#111] p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h2 className="text-xl font-extrabold text-white">{data.repoB.name}</h2>
              <p className="text-[10px] text-white/40 font-mono">{data.repoB.url}</p>
            </div>
            <span className="text-xl font-extrabold text-emerald-400 font-mono">
              {data.repoB.overallScore}/100
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-white/40 block mb-1">
                Tech Stack
              </span>
              <div className="flex flex-wrap gap-1">
                {data.repoB.techStack.map((tech, i) => (
                  <span
                    key={i}
                    className="rounded bg-[#0a0a0a] border border-white/10 px-2 py-0.5 text-[11px] font-mono text-white/70"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex justify-between text-white/70">
                <span>Architecture</span>
                <span className="font-mono text-emerald-400">{data.repoB.architectureScore}%</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Documentation</span>
                <span className="font-mono text-cyan-400">{data.repoB.documentationScore}%</span>
              </div>
              <div className="flex justify-between text-white/70">
                <span>Beginner Friendly</span>
                <span className="font-mono text-indigo-400">
                  {data.repoB.beginnerFriendlyScore}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI DIFFERENCES SUMMARY */}
      <div className="rounded-xl border border-white/10 bg-[#111] p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2 font-mono uppercase tracking-wider">
          <Sparkles className="h-4 w-4 text-emerald-400" />
          <span>AI Architectural Differences Summary</span>
        </h3>
        <p className="text-xs text-white/80 leading-relaxed bg-[#0a0a0a] p-4 rounded-lg border border-white/10">
          {data.aiComparisonSummary}
        </p>

        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-mono font-bold text-white/70">Key Feature Comparisons:</h4>
          {data.keyDifferences.map((diff, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 md:grid-cols-3 gap-2 p-3 rounded-lg bg-[#0a0a0a] border border-white/10 text-xs"
            >
              <span className="font-bold font-mono text-emerald-400">{diff.category}</span>
              <span className="text-white/70">
                <span className="text-[10px] font-mono text-white/40 uppercase block">{data.repoA.name}:</span>
                {diff.diffA}
              </span>
              <span className="text-white/70">
                <span className="text-[10px] font-mono text-white/40 uppercase block">{data.repoB.name}:</span>
                {diff.diffB}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
