import React, { useState } from 'react';
import { RepoModel, SetupStep, ConfigEnvVar } from '../types';
import {
  Terminal,
  Copy,
  Check,
  CheckCircle2,
  Circle,
  AlertTriangle,
  FileCode2,
  Sliders,
  ExternalLink,
} from 'lucide-react';

interface SetupCoachProps {
  model: RepoModel;
}

export const SetupCoach: React.FC<SetupCoachProps> = ({ model }) => {
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const steps = model.setupSteps || [];
  const envVars = model.configAndEnvVars || [];

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleStep = (id: string) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const progressPct = steps.length > 0 ? Math.round((completedSteps.size / steps.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header & Progress */}
      <div className="rounded-xl border border-white/10 bg-[#111] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Terminal className="h-5 w-5 text-emerald-400" />
              <span>Interactive Local Setup Coach</span>
            </h1>
            <p className="text-xs text-white/60">
              Interactive checklist with 1-click terminal commands, common error resolutions, and environment configuration.
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono text-emerald-400 font-bold">
              {completedSteps.size} of {steps.length} Steps Done ({progressPct}%)
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-[#0a0a0a] rounded-full overflow-hidden border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Setup Steps Checklist */}
      <div className="space-y-4">
        {steps.map((step, idx) => {
          const isDone = completedSteps.has(step.id);
          const isCopied = copiedId === step.id;

          return (
            <div
              key={step.id}
              className={`rounded-xl border p-5 transition-all ${
                isDone
                  ? 'border-emerald-500/30 bg-[#0a0a0a]/60'
                  : 'border-white/10 bg-[#0a0a0a]'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <button
                    onClick={() => toggleStep(step.id)}
                    className="mt-1 text-white/40 hover:text-emerald-400 transition"
                    title="Toggle step completion"
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </button>

                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-white/40">Step {idx + 1}</span>
                      <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] font-mono uppercase text-emerald-400 border border-white/10">
                        {step.category}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-gray-200">
                      {step.description}
                    </p>

                    {/* Command Box */}
                    <div className="rounded-lg bg-[#050505] border border-white/10 p-3 flex items-center justify-between font-mono text-xs">
                      <span className="text-emerald-400 truncate pr-4">
                        $ {step.command}
                      </span>
                      <button
                        onClick={() => handleCopy(step.id, step.command)}
                        className="flex items-center gap-1 shrink-0 rounded bg-white/10 px-2.5 py-1 text-[11px] font-sans text-white hover:bg-white/20 transition"
                        title="Copy command to clipboard"
                      >
                        {isCopied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        <span>{isCopied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    {/* Common failure resolutions */}
                    {step.commonFailures && step.commonFailures.length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        <div className="text-[11px] font-semibold text-amber-400 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Troubleshooting & Known Failure Tips:</span>
                        </div>
                        <ul className="space-y-1 pl-4">
                          {step.commonFailures.map((tip, tIdx) => (
                            <li key={tIdx} className="text-xs text-amber-200/70 list-disc">
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Environment Configuration Variables */}
      {envVars.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-[#111] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="h-4 w-4 text-emerald-400" />
              <span>Environment Variables (.env.example)</span>
            </h2>
            <span className="text-xs text-white/40 font-mono">
              {envVars.length} Variables Configured
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 text-white/40 font-mono text-[11px]">
                <tr>
                  <th className="py-2.5 pr-4">Variable</th>
                  <th className="py-2.5 px-4">Required</th>
                  <th className="py-2.5 px-4">Default Value</th>
                  <th className="py-2.5 px-4">Purpose & Example</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {envVars.map((v, idx) => (
                  <tr key={idx} className="hover:bg-white/5">
                    <td className="py-2.5 pr-4 font-mono font-semibold text-emerald-400">
                      {v.name}
                    </td>
                    <td className="py-2.5 px-4">
                      {v.required ? (
                        <span className="rounded bg-red-500/10 text-red-400 px-1.5 py-0.5 text-[10px] font-mono">
                          Required
                        </span>
                      ) : (
                        <span className="text-white/40 font-mono text-[10px]">
                          Optional
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-white/60">
                      {v.defaultValue || '—'}
                    </td>
                    <td className="py-2.5 px-4 text-white/80">
                      <div>{v.purpose}</div>
                      <div className="font-mono text-[10px] text-white/40 pt-0.5">
                        e.g. {v.example}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
