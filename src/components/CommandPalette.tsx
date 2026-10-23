import React, { useState, useEffect } from 'react';
import {
  Search,
  FileCode,
  MapPin,
  Sparkles,
  Compass,
  Code2,
  X,
  ArrowRight,
  Zap,
  Wrench,
} from 'lucide-react';
import { RepoAnalysisData } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  repo: RepoAnalysisData | null;
  onSelectTab: (tabId: string) => void;
  onSelectFile: (filePath: string) => void;
  onAskAI: (question: string) => void;
  onOpenTutor?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  repo,
  onSelectTab,
  onSelectFile,
  onAskAI,
  onOpenTutor,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sampleQuestions = [
    'Where is authentication handled?',
    'How does the frontend communicate with the backend?',
    'Which files should I modify to add dark mode?',
    'Explain the database architecture',
  ];

  const matchingFiles = repo?.fileTree
    ? repo.fileTree
        .filter((f) => f.type === 'file' && f.path.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 6)
    : [];

  const navigationOptions = [
    { id: 'tutor', label: 'Tutor — Interactive Codebase Onboarding', icon: Compass },
    { id: 'overview', label: 'Overview & Tech Stack', icon: Compass },
    { id: 'repomap', label: 'Architecture Map', icon: MapPin },
    { id: 'starthere', label: 'Start Here Guide', icon: Zap },
    { id: 'contribute', label: 'Where Can I Contribute?', icon: Code2 },
    { id: 'code', label: 'Code Explorer', icon: FileCode },
    { id: 'chat', label: 'Ask RepoRescue AI', icon: Sparkles },
    { id: 'devfix', label: 'DevFix — Error Diagnostic & Code Fixer', icon: Wrench },
  ].filter((opt) => opt.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/80 backdrop-blur-sm p-4 font-sans">
      <div className="w-full max-w-2xl rounded-xl border border-white/10 bg-[#111] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Input Header */}
        <div className="flex items-center px-4 border-b border-white/10 bg-[#0a0a0a]">
          <Search className="h-5 w-5 text-white/40 mr-3 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files, jump to section, or ask AI a question..."
            autoFocus
            className="w-full py-4 bg-transparent text-sm text-gray-200 placeholder-white/30 focus:outline-none font-mono"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Quick AI Questions */}
          {query.trim() && (
            <div className="space-y-1">
              <p className="px-2 text-[10px] font-mono font-semibold uppercase tracking-wider text-emerald-400">
                Ask AI Assistant
              </p>
              <button
                onClick={() => {
                  onAskAI(query);
                  onClose();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition text-left"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="font-medium font-mono">"{query}"</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Navigation Items */}
          {navigationOptions.length > 0 && (
            <div className="space-y-1">
              <p className="px-2 text-[10px] font-mono font-semibold uppercase tracking-wider text-white/40">
                Navigation
              </p>
              {navigationOptions.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      onSelectTab(opt.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg text-white/70 hover:bg-white/5 hover:text-white transition text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4 text-emerald-400" />
                      <span>{opt.label}</span>
                    </div>
                    <ArrowRight className="h-3 w-3 text-white/40" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Matching Files */}
          {matchingFiles.length > 0 && (
            <div className="space-y-1">
              <p className="px-2 text-[10px] font-mono font-semibold uppercase tracking-wider text-white/40">
                Repository Files
              </p>
              {matchingFiles.map((file) => (
                <button
                  key={file.path}
                  onClick={() => {
                    onSelectFile(file.path);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-lg text-white/70 hover:bg-white/5 hover:text-white transition text-left font-mono text-[11px]"
                >
                  <div className="flex items-center gap-2">
                    <FileCode className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{file.path}</span>
                  </div>
                  <span className="text-[10px] text-white/40">Open file</span>
                </button>
              ))}
            </div>
          )}

          {/* Sample Prompts when query is empty */}
          {!query.trim() && (
            <div className="space-y-2">
              <p className="px-2 text-[10px] font-mono font-semibold uppercase tracking-wider text-white/40">
                Suggested Questions for RepoRescue AI
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono">
                {sampleQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onAskAI(q);
                      onClose();
                    }}
                    className="flex items-center gap-2 p-2.5 rounded-lg border border-white/10 bg-[#0a0a0a] hover:border-emerald-500/30 text-white/70 hover:text-emerald-400 transition text-left"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate text-[11px]">{q}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-[#0a0a0a] border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-white/40">
          <span>Tip: Press ESC to exit</span>
          <span>RepoRescue AI Engine</span>
        </div>
      </div>
    </div>
  );
};
