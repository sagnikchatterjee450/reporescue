import React from 'react';
import { CheckCircle2, Loader2, Compass, Sparkles } from 'lucide-react';

interface AnalysisProgressProps {
  currentStep: string;
  repoUrl: string;
}

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({ currentStep, repoUrl }) => {
  const allSteps = [
    'Repository Found ✓',
    'Reading README ✓',
    'Mapping File Structure ✓',
    'Analyzing Dependencies ✓',
    'Understanding Architecture ✓',
    'Finding Contribution Opportunities ✓',
    'Generating Developer Guide...',
  ];

  const currentStepIndex = allSteps.findIndex((s) => s.startsWith(currentStep.split(' ')[0]));
  const activeIdx = currentStepIndex >= 0 ? currentStepIndex : allSteps.length - 1;

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 text-gray-200 font-sans">
      <div className="w-full max-w-lg rounded-xl border border-white/10 bg-[#111] p-8 shadow-2xl text-left space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Analyzing Repository</h2>
            <p className="text-xs text-white/40 font-mono truncate max-w-xs">{repoUrl}</p>
          </div>
        </div>

        {/* Steps checklist */}
        <div className="space-y-3 font-mono text-xs">
          {allSteps.map((stepText, idx) => {
            const isCompleted = idx < activeIdx;
            const isCurrent = idx === activeIdx;

            return (
              <div
                key={idx}
                className={`flex items-center justify-between p-2.5 rounded-lg border transition ${
                  isCurrent
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 font-semibold'
                    : isCompleted
                    ? 'border-white/10 bg-[#0a0a0a] text-white/80'
                    : 'border-white/5 bg-[#0a0a0a]/50 text-white/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="h-4 w-4 text-emerald-400 animate-spin shrink-0" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-white/20 shrink-0" />
                  )}
                  <span>{stepText.replace(' ✓', '')}</span>
                </div>
                {isCompleted && <span className="text-[10px] text-emerald-400">✓ Done</span>}
                {isCurrent && <span className="text-[10px] text-emerald-400 animate-pulse">In Progress...</span>}
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-white/40">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            AI context mapping active
          </span>
          <span>RepoRescue Engine</span>
        </div>
      </div>
    </div>
  );
};
