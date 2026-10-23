import React, { useState, useEffect } from 'react';
import { RepoModel, ExplainDepth, FileDetailedExplanation } from '../types';
import { explainFileTutor } from '../services/tutorApi';
import {
  FileCode2,
  Sparkles,
  ArrowRight,
  HelpCircle,
  AlertTriangle,
  Network,
  Check,
  SlidersHorizontal,
  ExternalLink,
  ChevronRight,
  Code,
} from 'lucide-react';

interface CodeExplainerProps {
  model: RepoModel;
  initialFilePath?: string;
  onRescueFile?: (filePath: string) => void;
  onSelectFile?: (filePath: string) => void;
}

export const CodeExplainer: React.FC<CodeExplainerProps> = ({
  model,
  initialFilePath,
  onRescueFile,
  onSelectFile,
}) => {
  // Collect all available files across entry points and modules
  const allKnownFiles = Array.from(
    new Set([
      ...model.entryPoints.map((e) => e.file),
      ...model.modules.flatMap((m) => m.keyFiles),
    ])
  );

  const [selectedFile, setSelectedFile] = useState<string>(
    initialFilePath || allKnownFiles[0] || 'src/index.ts'
  );
  const [selectedDepth, setSelectedDepth] = useState<ExplainDepth>('junior');
  const [lineRange, setLineRange] = useState<string>('');
  const [explanation, setExplanation] = useState<FileDetailedExplanation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showUsageModal, setShowUsageModal] = useState<boolean>(false);

  useEffect(() => {
    if (initialFilePath && allKnownFiles.includes(initialFilePath)) {
      setSelectedFile(initialFilePath);
    }
  }, [initialFilePath]);

  useEffect(() => {
    let isCurrent = true;
    setIsLoading(true);

    explainFileTutor(model, selectedFile, selectedDepth)
      .then((res) => {
        if (isCurrent) {
          setExplanation(res);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [selectedFile, selectedDepth, model]);

  // Mock code sample for illustration with line numbers
  const sampleCode = `// ${selectedFile}
// Core module exports and implementation definitions

import { Config } from '../config';

export class ServiceHandler {
  private status: 'ready' | 'active' = 'ready';

  constructor(private config: Config) {
    this.init();
  }

  public async init(): Promise<void> {
    // Setup listeners and verify environment
    if (!this.config.isValid()) {
      throw new Error('Invalid configuration');
    }
  }

  public async execute(action: string, data: unknown): Promise<unknown> {
    this.status = 'active';
    try {
      return await this.dispatch(action, data);
    } finally {
      this.status = 'ready';
    }
  }

  private async dispatch(action: string, payload: unknown) {
    return { ok: true, action, timestamp: Date.now() };
  }
}`;

  return (
    <div className="space-y-6">
      {/* Top Header & Depth Switcher */}
      <div className="rounded-xl border border-white/10 bg-[#111] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <FileCode2 className="h-5 w-5 text-emerald-400" />
              <span>Multi-Depth Code Explainer</span>
            </h1>
            <p className="text-xs text-white/60">
              Dissect any file or function at three pedagogical depths: ELI5, Junior, or Senior Architecture.
            </p>
          </div>

          {/* Rescue this button */}
          {onRescueFile && (
            <button
              onClick={() => onRescueFile(selectedFile)}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition self-start sm:self-auto"
              title="Send to RepoRescue full diagnosis"
            >
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span>Rescue This in RepoRescue</span>
            </button>
          )}
        </div>

        {/* File & Depth Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/10 pt-4">
          {/* File Picker */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-white/60">Selected File:</label>
            <select
              value={selectedFile}
              onChange={(e) => setSelectedFile(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#0a0a0a] px-3 py-2 text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
            >
              {allKnownFiles.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          {/* Depth Controls */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-white/60 flex items-center gap-1">
              <SlidersHorizontal className="h-3 w-3 text-emerald-400" />
              <span>Explanation Depth:</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setSelectedDepth('eli5')}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium text-center transition ${
                  selectedDepth === 'eli5'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                🧸 ELI5
              </button>
              <button
                onClick={() => setSelectedDepth('junior')}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium text-center transition ${
                  selectedDepth === 'junior'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                🧑 Junior Dev
              </button>
              <button
                onClick={() => setSelectedDepth('senior')}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium text-center transition ${
                  selectedDepth === 'senior'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                🏛️ Senior Arch
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Split: Code Viewer & AI Multi-Depth Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Code Viewer with line numbers */}
        <div className="rounded-xl border border-white/10 bg-[#0a0a0a] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#111] border-b border-white/10 text-xs">
            <span className="font-mono text-white/80 truncate">{selectedFile}</span>
            <span className="text-[10px] text-white/40">Read-Only View</span>
          </div>

          <div className="p-4 font-mono text-xs overflow-x-auto flex-1 text-gray-300 max-h-[500px]">
            {sampleCode.split('\n').map((line, idx) => (
              <div key={idx} className="flex hover:bg-white/5 px-1 py-0.5 rounded leading-relaxed">
                <span className="w-8 shrink-0 text-white/30 select-none text-right pr-3">
                  {idx + 1}
                </span>
                <span className="whitespace-pre">
                  {line.startsWith('//') ? (
                    <span className="text-gray-500">{line}</span>
                  ) : line.includes('export') || line.includes('import') || line.includes('class') ? (
                    <span className="text-emerald-400 font-semibold">{line}</span>
                  ) : line.includes('public') || line.includes('private') || line.includes('async') ? (
                    <span className="text-indigo-400">{line}</span>
                  ) : (
                    line
                  )}
                </span>
              </div>
            ))}
          </div>

          <div className="p-3 bg-[#111] border-t border-white/10 flex items-center justify-between text-xs">
            <button
              onClick={() => setShowUsageModal(true)}
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-medium"
            >
              <Network className="h-3.5 w-3.5" />
              <span>Show me where this is used</span>
            </button>

            <span className="text-[10px] text-white/40">TypeScript 5.8</span>
          </div>
        </div>

        {/* Right: AI Explanation Breakdown */}
        <div className="rounded-xl border border-white/10 bg-[#111] p-6 space-y-5">
          {isLoading ? (
            <div className="py-20 text-center text-xs text-white/50 space-y-2">
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-emerald-500 border-t-transparent" />
              <div>Generating {selectedDepth.toUpperCase()} breakdown for {selectedFile}...</div>
            </div>
          ) : explanation ? (
            <>
              {/* Depth Badge */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-mono font-bold text-white flex items-center gap-2">
                  <span>Depth:</span>
                  <span className="text-emerald-400 uppercase tracking-wider">
                    {selectedDepth === 'eli5'
                      ? '🧸 Explain Like I am 5'
                      : selectedDepth === 'junior'
                      ? '🧑 Junior Developer Focus'
                      : '🏛️ Senior Architecture View'}
                  </span>
                </span>
              </div>

              {/* 1. What it does */}
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>What It Does</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed pl-5">
                  {explanation.whatItDoes}
                </p>
              </div>

              {/* 2. Why it exists */}
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <HelpCircle className="h-4 w-4 text-indigo-400" />
                  <span>Why It Exists</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed pl-5">
                  {explanation.whyItExists}
                </p>
              </div>

              {/* 3. How it connects */}
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Network className="h-4 w-4 text-teal-400" />
                  <span>How It Connects</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed pl-5">
                  {explanation.howItConnects}
                </p>
              </div>

              {/* 4. Known Gotchas & Pitfalls */}
              {explanation.gotchas && explanation.gotchas.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    <span>Gotchas & Pitfalls</span>
                  </div>
                  <ul className="space-y-1.5 pl-5">
                    {explanation.gotchas.map((g, idx) => (
                      <li key={idx} className="text-xs text-amber-200/80 list-disc">
                        {g}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Where Used Quick Links */}
              {explanation.whereUsed && explanation.whereUsed.length > 0 && (
                <div className="pt-3 border-t border-white/10 space-y-2">
                  <div className="text-[11px] font-semibold text-white/60">
                    Direct Consumers & Connections:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {explanation.whereUsed.map((u, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedFile(u)}
                        className="rounded bg-[#0a0a0a] border border-white/10 px-2.5 py-1 text-[11px] font-mono text-white/80 hover:border-emerald-500/40 hover:text-emerald-400 transition"
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>

      {/* Where Used Modal Drawer */}
      {showUsageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#111] p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Network className="h-4 w-4 text-emerald-400" />
                <span>Consumers of {selectedFile}</span>
              </h3>
              <button
                onClick={() => setShowUsageModal(false)}
                className="text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-white/60">
              Files that import or directly coordinate with this module:
            </p>

            <div className="space-y-2">
              {explanation?.whereUsed && explanation.whereUsed.length > 0 ? (
                explanation.whereUsed.map((f, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedFile(f);
                      setShowUsageModal(false);
                    }}
                    className="w-full flex items-center justify-between rounded-lg bg-[#0a0a0a] border border-white/5 p-2.5 text-xs text-left hover:border-emerald-500/30 transition"
                  >
                    <span className="font-mono text-emerald-400">{f}</span>
                    <ChevronRight className="h-4 w-4 text-white/40" />
                  </button>
                ))
              ) : (
                <div className="text-xs text-white/40">No external consumers found.</div>
              )}
            </div>

            <button
              onClick={() => setShowUsageModal(false)}
              className="w-full rounded-lg bg-white/10 py-2 text-xs font-semibold text-white hover:bg-white/20 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
