import React from 'react';
import { Settings, ShieldCheck, Sparkles, Check, UserCheck, Code2 } from 'lucide-react';
import { ContributorMode } from '../types';

interface SettingsModalProps {
  contributorMode: ContributorMode;
  onToggleContributorMode: (mode: ContributorMode) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  contributorMode,
  onToggleContributorMode,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="rounded-xl border border-white/10 bg-[#111] p-6 shadow-xl">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-6">
          <div className="h-10 w-10 rounded-lg bg-[#0a0a0a] border border-white/10 flex items-center justify-center text-emerald-400">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Application Settings & Preferences</h1>
            <p className="text-xs text-white/60">
              Configure contributor guidance modes, theme preferences, and AI service options.
            </p>
          </div>
        </div>

        <div className="space-y-6 text-xs">
          {/* Contributor Mode */}
          <div className="rounded-lg border border-white/10 bg-[#0a0a0a] p-4 space-y-3">
            <h3 className="font-bold text-white text-sm font-mono uppercase tracking-wider">Contributor Mode</h3>
            <p className="text-white/60">
              Choose your experience level to customize terminology, file tree highlights, and issue recommendations.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 font-mono">
              <button
                onClick={() => onToggleContributorMode('beginner')}
                className={`p-4 rounded-lg border text-left transition ${
                  contributorMode === 'beginner'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                    : 'border-white/10 bg-[#111] text-white/60 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs mb-1">
                  <UserCheck className="h-4 w-4 text-emerald-400" />
                  <span>Beginner Mode</span>
                </div>
                <p className="text-xs text-white/70 font-sans">
                  Hides complex jargon, highlights primary entry files, and gives guided learning paths.
                </p>
              </button>

              <button
                onClick={() => onToggleContributorMode('expert')}
                className={`p-4 rounded-lg border text-left transition ${
                  contributorMode === 'expert'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                    : 'border-white/10 bg-[#111] text-white/60 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs mb-1">
                  <Code2 className="h-4 w-4 text-emerald-400" />
                  <span>Expert Mode</span>
                </div>
                <p className="text-xs text-white/70 font-sans">
                  Shows raw dependency trees, API relations, architectural patterns, and refactoring debt.
                </p>
              </button>
            </div>
          </div>

          {/* Tutor & Local Ollama Configuration */}
          <div className="rounded-lg border border-white/10 bg-[#0a0a0a] p-4 space-y-3">
            <h3 className="font-bold text-white text-sm font-mono uppercase tracking-wider">Tutor Onboarding & AI Providers</h3>
            <p className="text-white/60">
              Configure AI providers for deep synthesis, hierarchical map-reduce, and local offline privacy.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 font-mono">
              <div className="p-4 rounded-lg border border-emerald-500 bg-emerald-500/10 text-emerald-400">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs">Gemini Flash (Default)</span>
                  <span className="rounded bg-emerald-400/20 px-1.5 py-0.5 text-[9px] uppercase">Active</span>
                </div>
                <p className="text-xs text-white/70 font-sans">
                  High-speed structured extraction, Mermaid diagram generation, and citation guarded Q&A.
                </p>
              </div>

              <div className="p-4 rounded-lg border border-white/10 bg-[#111] text-white/60">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs">Local Ollama</span>
                  <span className="rounded bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 text-[9px] uppercase">Local Mode</span>
                </div>
                <p className="text-xs text-white/70 font-sans">
                  Connects to localhost:11434 with gemma4:e4b / gemma4:26b for zero-cloud private repositories.
                </p>
              </div>
            </div>
          </div>

          {/* AI Security & Environment Status */}
          <div className="rounded-lg border border-white/10 bg-[#0a0a0a] p-4 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs font-mono uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Server-Side Gemini AI Engine</span>
            </div>
            <p className="text-white/70">
              All repository analysis, architecture extraction, and AI chats run through secure server-side calls (`gemini-3.8-flash`). API keys are managed safely via environment secrets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
