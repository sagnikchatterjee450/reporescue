import React from 'react';
import {
  Compass,
  Search,
  Sparkles,
  Github,
  BookOpen,
  CheckCircle2,
  SlidersHorizontal,
  Command,
  UserCheck,
  Code2,
  Wrench,
} from 'lucide-react';
import { ContributorMode, RepoAnalysisData } from '../types';

interface NavbarProps {
  currentRepo: RepoAnalysisData | null;
  onAnalyzeNewUrl: (url: string) => void;
  onOpenDemo: () => void;
  contributorMode: ContributorMode;
  onToggleContributorMode: (mode: ContributorMode) => void;
  onOpenCommandPalette: () => void;
  onGoHome: () => void;
  onOpenDevFix?: () => void;
  onOpenTutor?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRepo,
  onAnalyzeNewUrl,
  onOpenDemo,
  contributorMode,
  onToggleContributorMode,
  onOpenCommandPalette,
  onGoHome,
  onOpenDevFix,
  onOpenTutor,
}) => {
  const [inputUrl, setInputUrl] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      onAnalyzeNewUrl(inputUrl.trim());
      setInputUrl('');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand / Logo */}
        <div className="flex items-center gap-6">
          <button
            onClick={onGoHome}
            className="flex items-center gap-2.5 text-left transition hover:opacity-90 focus:outline-none"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500 text-black font-extrabold text-xs shadow-md shadow-emerald-500/10">
              R
            </div>
            <div>
              <div className="flex items-center gap-2 font-bold tracking-tight text-white">
                <span className="text-base font-bold text-white tracking-tight">RepoRescue</span>
                <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider font-semibold text-emerald-400 border border-emerald-500/20">
                  AI Copilot
                </span>
              </div>
            </div>
          </button>

          {/* Quick Repo Search if inside an analysis */}
          {currentRepo && (
            <form onSubmit={handleSubmit} className="hidden md:flex items-center gap-2">
              <div className="relative">
                <Github className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="Analyze another repository..."
                  className="w-64 rounded-lg border border-white/10 bg-[#111] py-1.5 pl-8 pr-3 text-xs text-gray-200 placeholder-white/30 transition focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-white text-black px-3.5 py-1.5 text-xs font-bold hover:bg-gray-200 transition shadow-sm"
              >
                Analyze
              </button>
            </form>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* Command Palette button */}
          <button
            onClick={onOpenCommandPalette}
            className="hidden sm:flex items-center gap-2 rounded-lg border border-white/10 bg-[#111] px-2.5 py-1.5 text-xs text-white/60 hover:border-white/20 hover:text-white transition"
            title="Open Command Palette (Cmd+K)"
          >
            <Search className="h-3.5 w-3.5 text-white/40" />
            <span>Search or ask AI</span>
            <kbd className="flex items-center gap-0.5 rounded bg-white/5 border border-white/10 px-1.5 py-0.5 text-[10px] font-mono text-white/40">
              <Command className="h-2.5 w-2.5" /> K
            </kbd>
          </button>

          {/* Beginner / Expert Mode Toggle */}
          <div className="flex items-center rounded-lg border border-white/10 bg-[#111] p-0.5">
            <button
              onClick={() => onToggleContributorMode('beginner')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                contributorMode === 'beginner'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-white/60 hover:text-white'
              }`}
              title="Beginner Mode: Simplifies terminology, highlights core entry files & guided paths"
            >
              <UserCheck className="h-3.5 w-3.5" />
              <span>🧑 Beginner</span>
            </button>
            <button
              onClick={() => onToggleContributorMode('expert')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                contributorMode === 'expert'
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  : 'text-white/60 hover:text-white'
              }`}
              title="Expert Mode: Full dependency maps, API relations & refactoring debt"
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>👨‍💻 Expert</span>
            </button>
          </div>

          {/* Tutor Button */}
          {onOpenTutor && (
            <button
              onClick={() => onOpenTutor()}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 transition shadow-sm"
              title="Open Tutor: Interactive Onboarding Experience"
            >
              <Compass className="h-3.5 w-3.5 text-emerald-400" />
              <span>Tutor</span>
              <span className="rounded bg-emerald-400/20 px-1 py-0.2 text-[9px] font-mono text-emerald-300 uppercase">
                New
              </span>
            </button>
          )}

          {/* DevFix Button */}
          {onOpenDevFix && (
            <button
              onClick={onOpenDevFix}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#111] px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white transition shadow-sm"
              title="Open DevFix: AI Error Diagnostic & Code Repair"
            >
              <Wrench className="h-3.5 w-3.5 text-emerald-400" />
              <span>DevFix</span>
            </button>
          )}

          {/* Demo Button */}
          {!currentRepo && (
            <button
              onClick={onOpenDemo}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#111] px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/5 hover:text-white transition shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span>Try Demo</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
