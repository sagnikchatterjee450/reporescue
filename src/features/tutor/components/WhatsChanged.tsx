import React from 'react';
import { RepoModel } from '../types';
import { GitCommit, GitPullRequest, Calendar, Layers, Sparkles } from 'lucide-react';

interface WhatsChangedProps {
  model: RepoModel;
}

export const WhatsChanged: React.FC<WhatsChangedProps> = ({ model }) => {
  const changes = model.recentChangesSummary || [
    {
      title: 'Architectural baseline ingestion completed',
      commitOrPr: 'main',
      architecturalImpact: 'Mapped entry points, dependency trees, and core modular boundaries.',
      date: 'Latest',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-white/10 bg-[#111] p-6">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <GitPullRequest className="h-5 w-5 text-emerald-400" />
          <span>What’s Changed: Architectural Digest</span>
        </h1>
        <p className="text-xs text-white/60 pt-1">
          Digest of recent pull requests, merged commits, and their downstream impacts on system design.
        </p>
      </div>

      {/* Timeline List */}
      <div className="space-y-4">
        {changes.map((item, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-white/10 bg-[#0a0a0a] p-5 space-y-3 hover:border-white/20 transition"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <span className="rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-mono">
                  {item.commitOrPr}
                </span>
                <span className="text-xs sm:text-sm font-bold text-white">
                  {item.title}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-white/40 font-mono">
                <Calendar className="h-3 w-3" />
                <span>{item.date}</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-[11px] font-semibold text-white/60 flex items-center gap-1">
                <Layers className="h-3 w-3 text-indigo-400" />
                <span>Architectural Impact & Invariants:</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed pl-4 border-l-2 border-indigo-500/30">
                {item.architecturalImpact}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
