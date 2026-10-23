import React from 'react';
import {
  Zap,
  BookOpen,
  ArrowRight,
  FileCode,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { RepoAnalysisData, StartHereStep } from '../types';

interface StartHereSectionProps {
  repo: RepoAnalysisData;
  onSelectFile: (filePath: string) => void;
}

export const StartHereSection: React.FC<StartHereSectionProps> = ({ repo, onSelectFile }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* SECTION BANNER */}
      <div className="rounded-xl border border-emerald-500/30 bg-[#111] p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Zap className="h-48 w-48 text-emerald-400" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-3 py-0.5 text-[10px] font-mono uppercase tracking-wider font-semibold text-emerald-400">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>RepoRescue Signature Feature</span>
          </div>

          <h1 className="text-2xl font-extrabold text-white sm:text-3xl tracking-tight">
            Your Recommended Learning Path
          </h1>

          <p className="text-sm text-white/70 leading-relaxed">
            New to <span className="font-bold text-white">{repo.repoName}</span>? Don't get lost in 40+ files.
            Read these essential files in sequence to understand the core architecture in under 20 minutes.
          </p>
        </div>
      </div>

      {/* STEP BY STEP TIMELINE */}
      <div className="space-y-6">
        {repo.startHerePath.map((step: StartHereStep, index: number) => {
          return (
            <div
              key={step.stepNumber}
              className="rounded-xl border border-white/10 bg-[#111] p-6 shadow-xl relative hover:border-emerald-500/30 transition group"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                {/* Left: Step number & File path */}
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-extrabold text-base shadow-md">
                    0{step.stepNumber}
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-400 bg-[#0a0a0a] px-3 py-1 rounded-md border border-white/10">
                        {step.filePath}
                      </span>
                      <span className="flex items-center gap-1 rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] text-white/60 font-mono">
                        <Clock className="h-3 w-3" />
                        {step.estimatedReadingTime}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white">{step.title}</h3>

                    <div className="rounded-lg bg-[#0a0a0a] p-3 border border-white/10 text-xs space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-emerald-400 block">
                        Why Read This First:
                      </span>
                      <p className="text-white/70 leading-relaxed">{step.why}</p>
                    </div>

                    {/* Key concepts */}
                    {step.keyConcepts && step.keyConcepts.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 font-semibold mr-1">
                          Key Concepts:
                        </span>
                        {step.keyConcepts.map((concept, cIdx) => (
                          <span
                            key={cIdx}
                            className="rounded bg-white/5 px-2 py-0.5 text-[10px] font-mono text-white/70 border border-white/10"
                          >
                            {concept}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Inspect Button */}
                <div className="shrink-0 flex items-center md:self-center">
                  <button
                    onClick={() => onSelectFile(step.filePath)}
                    className="w-full md:w-auto flex items-center justify-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 hover:text-black transition shadow-md border border-white/10"
                  >
                    <FileCode className="h-4 w-4" />
                    <span>Inspect Code</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
