import React, { useState } from 'react';
import {
  FileEdit,
  Sparkles,
  Copy,
  Check,
  AlertCircle,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { ReadmeImprovementSection as ReadmeSectionType, RepoAnalysisData } from '../types';

interface ReadmeImprovementSectionProps {
  repo: RepoAnalysisData;
}

export const ReadmeImprovementSection: React.FC<ReadmeImprovementSectionProps> = ({ repo }) => {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* HEADER */}
      <div className="rounded-xl border border-white/10 bg-[#111] p-6 sm:p-8 shadow-xl">
        <div className="inline-flex items-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-3 py-0.5 text-[10px] font-mono uppercase tracking-wider font-semibold text-emerald-400 mb-3">
          <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
          <span>AI README Optimizer</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white sm:text-3xl tracking-tight">
          Improve This Repository README
        </h1>
        <p className="mt-1 text-xs text-white/60 max-w-2xl leading-relaxed">
          RepoRescue analyzed <span className="font-bold text-white">{repo.repoName}</span>'s README and
          identified missing setup instructions, architecture docs, and environment variable guidelines.
        </p>
      </div>

      {/* IMPROVEMENT CARDS */}
      <div className="space-y-6">
        {repo.readmeImprovements.map((sec: ReadmeSectionType, idx: number) => {
          const isMissing = sec.status === 'Missing';
          const isCopied = copiedIdx === idx;

          return (
            <div
              key={idx}
              className="rounded-xl border border-white/10 bg-[#111] p-6 shadow-xl space-y-4 hover:border-emerald-500/30 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs font-mono ${
                      isMissing
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    !
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{sec.title}</h3>
                    <p className="text-xs text-white/60">{sec.recommendation}</p>
                  </div>
                </div>

                <span
                  className={`self-start sm:self-center rounded-md px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider font-semibold border ${
                    isMissing
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}
                >
                  {sec.status} Section
                </span>
              </div>

              {/* Suggested Markdown Code Block */}
              <div className="rounded-lg border border-white/10 bg-[#0a0a0a] p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-xs font-mono text-emerald-400">
                    Suggested Markdown Snippet to Copy
                  </span>
                  <button
                    onClick={() => handleCopy(sec.suggestedMarkdown, idx)}
                    className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-3 py-1 text-xs font-mono font-bold text-white hover:bg-emerald-500 hover:text-black transition"
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Markdown</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="p-3 bg-[#111] rounded-md text-xs font-mono text-gray-300 overflow-x-auto leading-relaxed border border-white/5">
                  {sec.suggestedMarkdown}
                </pre>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
