import React, { useState, useEffect } from 'react';
import {
  FileCode,
  Folder,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Zap,
  ArrowDown,
  Search,
  Layers,
  AlertTriangle,
  Code2,
  BookOpen,
} from 'lucide-react';
import { FileTreeNode, RepoAnalysisData, FileExplanation } from '../types';
import { explainFileAI } from '../services/apiClient';

interface CodeExplorerSectionProps {
  repo: RepoAnalysisData;
  initialFilePath?: string;
  onSelectFile?: (filePath: string) => void;
}

export const CodeExplorerSection: React.FC<CodeExplorerSectionProps> = ({
  repo,
  initialFilePath,
}) => {
  const [selectedFilePath, setSelectedFilePath] = useState<string>(
    initialFilePath || repo.fileTree[0]?.path || 'README.md'
  );
  const [explanationMode, setExplanationMode] = useState<string>('Beginner');
  const [explanation, setExplanation] = useState<FileExplanation | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState<boolean>(false);
  const [treeSearch, setTreeSearch] = useState<string>('');

  // Find file content in tree
  const findFileInTree = (nodes: FileTreeNode[], targetPath: string): FileTreeNode | null => {
    for (const node of nodes) {
      if (node.path === targetPath) return node;
      if (node.children) {
        const found = findFileInTree(node.children, targetPath);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedFileNode = findFileInTree(repo.fileTree, selectedFilePath);

  // Trigger AI file explanation whenever selected file or mode changes
  useEffect(() => {
    let active = true;
    const loadExp = async () => {
      setLoadingExplanation(true);
      const res = await explainFileAI(
        selectedFilePath,
        selectedFileNode?.content || '',
        explanationMode,
        repo.repoName
      );
      if (active) {
        setExplanation(res);
        setLoadingExplanation(false);
      }
    };
    loadExp();
    return () => {
      active = false;
    };
  }, [selectedFilePath, explanationMode, repo.repoName]);

  // Flatten tree for clean search view
  const flattenTree = (nodes: FileTreeNode[]): FileTreeNode[] => {
    let list: FileTreeNode[] = [];
    for (const n of nodes) {
      list.push(n);
      if (n.children) {
        list = list.concat(flattenTree(n.children));
      }
    }
    return list;
  };

  const allFiles = flattenTree(repo.fileTree).filter((n) => n.type === 'file');
  const filteredFiles = allFiles.filter((f) =>
    f.path.toLowerCase().includes(treeSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileCode className="h-5 w-5 text-emerald-400" />
            <span>AI Code Explainer & Explorer</span>
          </h2>
          <p className="text-xs text-white/60">
            Select any source file to inspect code and receive beginner-friendly visual architecture flows.
          </p>
        </div>

        {/* AI Explanation Mode Buttons */}
        <div className="flex flex-wrap items-center gap-1 rounded-lg border border-white/10 bg-[#111] p-1 text-xs font-mono">
          {[
            { id: 'Simply', label: 'Explain Simply' },
            { id: 'Beginner', label: 'Like I’m a Beginner' },
            { id: 'Architecture', label: 'Architecture Role' },
            { id: 'Dependencies', label: 'Dependencies' },
            { id: 'Problems', label: 'Potential Problems' },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setExplanationMode(mode.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] transition ${
                explanationMode === mode.id
                  ? 'bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* FILE TREE + CODE & AI PANEL SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* LEFT COLUMN: FILE TREE SEARCH */}
        <div className="lg:col-span-1 rounded-xl border border-white/10 bg-[#111] p-4 shadow-xl flex flex-col justify-between max-h-[640px] overflow-hidden">
          <div className="space-y-3 mb-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={treeSearch}
                onChange={(e) => setTreeSearch(e.target.value)}
                placeholder="Search files..."
                className="w-full rounded-lg border border-white/10 bg-[#0a0a0a] py-1.5 pl-8 pr-2 text-xs text-gray-200 placeholder-white/30 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
            <p className="text-[10px] font-mono font-semibold uppercase text-white/40 tracking-wider">
              Repository Files ({allFiles.length})
            </p>
          </div>

          <div className="overflow-y-auto space-y-1 text-xs font-mono pr-1">
            {filteredFiles.map((f) => {
              const isSelected = selectedFilePath === f.path;
              return (
                <button
                  key={f.path}
                  onClick={() => setSelectedFilePath(f.path)}
                  className={`w-full flex items-center justify-between p-2 rounded-md text-left transition ${
                    isSelected
                      ? 'bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode
                      className={`h-3.5 w-3.5 shrink-0 ${
                        isSelected ? 'text-emerald-400' : 'text-white/40'
                      }`}
                    />
                    <span className="truncate">{f.path}</span>
                  </div>
                  {f.important && (
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT 3 COLUMNS: AI EXPLAINER + CODE PREVIEW */}
        <div className="lg:col-span-3 space-y-6">
          {/* AI EXPLAINER CARD */}
          <div className="rounded-xl border border-white/10 bg-[#111] p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">What does this file do?</h3>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                {selectedFilePath}
              </span>
            </div>

            {loadingExplanation ? (
              <div className="py-8 text-center text-xs text-white/40 font-mono animate-pulse">
                Analyzing file logic & dependencies...
              </div>
            ) : explanation ? (
              <div className="space-y-5 text-xs">
                {/* Explanation text */}
                <p className="text-white/80 leading-relaxed bg-[#0a0a0a] p-4 rounded-lg border border-white/10">
                  {explanationMode === 'Simply' && explanation.simpleExplanation}
                  {explanationMode === 'Beginner' && explanation.beginnerExplanation}
                  {explanationMode === 'Architecture' && explanation.architectureRole}
                  {explanationMode === 'Dependencies' &&
                    `This file depends on: ${explanation.dependencies.join(', ')}`}
                  {explanationMode === 'Problems' &&
                    `Potential risks: ${explanation.potentialProblems.join('; ')}`}
                </p>

                {/* VISUAL FLOW DIAGRAM (Inputs -> Processing -> Outputs) */}
                <div>
                  <h4 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5" />
                    <span>Inputs → Processing → Outputs Flow</span>
                  </h4>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center">
                    {/* INPUTS */}
                    <div className="w-full sm:w-1/3 rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-3 space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-cyan-400 block">
                        Inputs
                      </span>
                      {explanation.flow.inputs.map((inp, idx) => (
                        <p key={idx} className="text-xs font-semibold text-cyan-300">
                          {inp}
                        </p>
                      ))}
                    </div>

                    <ArrowDown className="h-4 w-4 text-white/40 sm:-rotate-90 shrink-0" />

                    {/* PROCESSING STEPS */}
                    <div className="w-full sm:w-1/3 rounded-lg border border-indigo-500/20 bg-indigo-500/10 p-3 space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-indigo-400 block">
                        Processing
                      </span>
                      {explanation.flow.processingSteps.map((step, idx) => (
                        <p key={idx} className="text-xs font-semibold text-indigo-300">
                          {step}
                        </p>
                      ))}
                    </div>

                    <ArrowDown className="h-4 w-4 text-white/40 sm:-rotate-90 shrink-0" />

                    {/* OUTPUTS */}
                    <div className="w-full sm:w-1/3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-emerald-400 block">
                        Outputs
                      </span>
                      {explanation.flow.outputs.map((out, idx) => (
                        <p key={idx} className="text-xs font-semibold text-emerald-300">
                          {out}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* CODE PREVIEW BOX */}
          <div className="rounded-xl border border-white/10 bg-[#111] p-4 shadow-xl space-y-2">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 text-xs font-mono text-white/40">
              <span className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-emerald-400" />
                <span>{selectedFilePath}</span>
              </span>
              <span>Source Preview</span>
            </div>

            <pre className="p-4 rounded-lg bg-[#0a0a0a] font-mono text-xs text-gray-300 overflow-x-auto max-h-80 leading-relaxed border border-white/10">
              {selectedFileNode?.content ||
                `// ${selectedFilePath}\n// Selected file from repository tree.`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
