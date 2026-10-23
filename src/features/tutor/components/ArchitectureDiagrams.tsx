import React, { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { RepoModel, ModuleDefinition } from '../types';
import {
  sanitizeAndRepairMermaid,
  downloadSvg,
  downloadPng,
} from '../utils/mermaidHelper';
import {
  Download,
  Code2,
  Check,
  Copy,
  Layers,
  Network,
  GitBranch,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Info,
  X,
} from 'lucide-react';

interface ArchitectureDiagramsProps {
  model: RepoModel;
  onSelectFile?: (filePath: string) => void;
  onRescueFile?: (filePath: string) => void;
}

export const ArchitectureDiagrams: React.FC<ArchitectureDiagramsProps> = ({
  model,
  onSelectFile,
  onRescueFile,
}) => {
  const [activeTab, setActiveTab] = useState<'system' | 'modules' | 'sequence' | 'interactive'>('system');
  const [selectedSequenceIndex, setSelectedSequenceIndex] = useState(0);
  const [showSource, setShowSource] = useState(false);
  const [copiedSource, setCopiedSource] = useState(false);
  const [repairNotice, setRepairNotice] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<ModuleDefinition | null>(model.modules[0] || null);

  const containerRef = useRef<HTMLDivElement>(null);
  const [diagramKey, setDiagramKey] = useState(0);

  // Initialize mermaid
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      themeVariables: {
        darkMode: true,
        background: '#0a0a0a',
        primaryColor: '#10b981',
        primaryTextColor: '#ffffff',
        primaryBorderColor: '#34d399',
        lineColor: '#52525b',
        secondaryColor: '#27272a',
        tertiaryColor: '#18181b',
      },
      securityLevel: 'loose',
    });
  }, []);

  // Determine current active Mermaid code
  let currentMermaidRaw = model.diagrams.systemOverviewMermaid;
  if (activeTab === 'modules') {
    currentMermaidRaw = model.diagrams.moduleDependencyMermaid;
  } else if (activeTab === 'sequence') {
    const seq = model.diagrams.sequenceFlows[selectedSequenceIndex] || model.diagrams.sequenceFlows[0];
    currentMermaidRaw = seq ? seq.mermaid : 'sequenceDiagram\n  autonumber\n  Note over App: No sequence defined';
  }

  // Validate and sanitize
  const { sanitizedMermaid, wasRepaired } = sanitizeAndRepairMermaid(currentMermaidRaw);

  // Render diagram using Mermaid API
  useEffect(() => {
    if (activeTab === 'interactive') return;

    let isMounted = true;
    const renderDiagram = async () => {
      if (!containerRef.current) return;
      containerRef.current.innerHTML = '<div class="text-xs text-white/40 p-4">Rendering diagram...</div>';

      try {
        const id = `mermaid-svg-${Date.now()}`;
        const { svg } = await mermaid.render(id, sanitizedMermaid);
        if (isMounted && containerRef.current) {
          containerRef.current.innerHTML = svg;
          setRepairNotice(wasRepaired ? 'Diagram syntax was auto-repaired.' : null);
        }
      } catch (err: any) {
        console.warn('Mermaid render error:', err);
        if (isMounted && containerRef.current) {
          containerRef.current.innerHTML = `
            <div class="p-6 text-center text-xs text-amber-400 space-y-2">
              <p>Diagram could not be rendered with standard Mermaid renderer.</p>
              <pre class="text-[11px] font-mono text-left bg-[#050505] p-3 rounded border border-white/10 overflow-x-auto text-gray-300">${sanitizedMermaid}</pre>
            </div>
          `;
        }
      }
    };

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [sanitizedMermaid, activeTab, selectedSequenceIndex, diagramKey]);

  const handleExportSvg = () => {
    const svgEl = containerRef.current?.querySelector('svg');
    if (svgEl) {
      downloadSvg(svgEl, `${model.repoName}-${activeTab}-diagram.svg`);
    }
  };

  const handleExportPng = () => {
    const svgEl = containerRef.current?.querySelector('svg');
    if (svgEl) {
      downloadPng(svgEl, `${model.repoName}-${activeTab}-diagram.png`);
    }
  };

  const handleCopySource = () => {
    navigator.clipboard.writeText(sanitizedMermaid);
    setCopiedSource(true);
    setTimeout(() => setCopiedSource(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header & View Switcher */}
      <div className="rounded-xl border border-white/10 bg-[#111] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Network className="h-5 w-5 text-emerald-400" />
              <span>Architecture & Flow Diagrams</span>
            </h1>
            <p className="text-xs text-white/60">
              Visual system topology, module relationships, and sequence execution paths.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportSvg}
              disabled={activeTab === 'interactive'}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#0a0a0a] px-3 py-1.5 text-xs font-semibold text-white/80 hover:text-white hover:border-white/20 transition disabled:opacity-40"
              title="Download as vector SVG"
            >
              <Download className="h-3.5 w-3.5" />
              <span>SVG</span>
            </button>

            <button
              onClick={handleExportPng}
              disabled={activeTab === 'interactive'}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#0a0a0a] px-3 py-1.5 text-xs font-semibold text-white/80 hover:text-white hover:border-white/20 transition disabled:opacity-40"
              title="Download high-resolution PNG"
            >
              <Download className="h-3.5 w-3.5" />
              <span>PNG</span>
            </button>

            <button
              onClick={() => setShowSource(!showSource)}
              disabled={activeTab === 'interactive'}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#0a0a0a] px-3 py-1.5 text-xs font-semibold text-white/80 hover:text-white hover:border-white/20 transition disabled:opacity-40"
            >
              <Code2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>{showSource ? 'Hide Source' : 'View Mermaid'}</span>
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
          <button
            onClick={() => setActiveTab('system')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'system'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>(a) System Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('modules')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'modules'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Network className="h-3.5 w-3.5" />
            <span>(b) Module Dependencies</span>
          </button>

          <button
            onClick={() => setActiveTab('sequence')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'sequence'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <GitBranch className="h-3.5 w-3.5" />
            <span>(c) Sequence Flows ({model.diagrams.sequenceFlows.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('interactive')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'interactive'
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Interactive Node Graph</span>
          </button>
        </div>

        {/* Sequence flow selector if sequence tab is active */}
        {activeTab === 'sequence' && model.diagrams.sequenceFlows.length > 1 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
            <span className="text-white/50 text-[11px]">Key Flow:</span>
            {model.diagrams.sequenceFlows.map((flow, idx) => (
              <button
                key={flow.flowId}
                onClick={() => setSelectedSequenceIndex(idx)}
                className={`rounded px-2.5 py-1 text-xs transition ${
                  selectedSequenceIndex === idx
                    ? 'bg-emerald-500 text-black font-semibold'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                {flow.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Repair Alert if auto-repaired */}
      {repairNotice && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-300 flex items-center justify-between">
          <span>{repairNotice}</span>
          <button
            onClick={() => setDiagramKey((k) => k + 1)}
            className="flex items-center gap-1 text-[11px] hover:underline"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Re-render</span>
          </button>
        </div>
      )}

      {/* Mermaid Raw Source View Toggle */}
      {showSource && activeTab !== 'interactive' && (
        <div className="rounded-xl border border-white/10 bg-[#050505] p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-white/60">
            <span className="font-mono">Mermaid Source</span>
            <button
              onClick={handleCopySource}
              className="flex items-center gap-1 rounded bg-white/5 px-2 py-1 text-[11px] text-white/80 hover:bg-white/10 transition"
            >
              {copiedSource ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              <span>{copiedSource ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>
          <pre className="text-xs font-mono text-emerald-400/90 bg-[#0a0a0a] p-3 rounded border border-white/5 overflow-x-auto max-h-60">
            {sanitizedMermaid}
          </pre>
        </div>
      )}

      {/* Diagram Canvas View or Interactive Node Graph */}
      {activeTab !== 'interactive' ? (
        <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-6 overflow-x-auto min-h-[420px] flex items-center justify-center shadow-xl">
          <div ref={containerRef} className="w-full flex justify-center [&>svg]:max-w-full [&>svg]:h-auto" />
        </div>
      ) : (
        /* Interactive Node Graph & Module Inspector */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Interactive Graph Surface */}
          <div className="lg:col-span-2 rounded-xl border border-white/10 bg-[#0a0a0a] p-6 min-h-[460px] flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="text-xs text-white/60">
                Click any module node to inspect its architecture, key files, and dependencies.
              </div>
              <span className="text-[10px] font-mono text-emerald-400">
                {model.modules.length} Modules
              </span>
            </div>

            {/* Visual Node Grid with connecting lanes */}
            <div className="py-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {model.modules.map((mod) => {
                const isSelected = selectedModule?.id === mod.id;
                return (
                  <button
                    key={mod.id}
                    onClick={() => setSelectedModule(mod)}
                    className={`rounded-xl p-4 text-left border transition-all duration-150 ${
                      isSelected
                        ? 'border-emerald-400 bg-emerald-500/10 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-400'
                        : 'border-white/10 bg-[#111] hover:border-white/20 hover:bg-[#161616]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-white font-mono">
                        {mod.name}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-mono uppercase ${
                          mod.complexity === 'High'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : mod.complexity === 'Moderate'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {mod.complexity || 'Moderate'}
                      </span>
                    </div>

                    <p className="text-xs text-white/60 line-clamp-2 mb-3">
                      {mod.purpose}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-white/40 pt-2 border-t border-white/5">
                      <span>{mod.keyFiles.length} key files</span>
                      <span className="text-emerald-400 font-medium">Inspect →</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="text-[11px] text-white/40 pt-2 border-t border-white/5 flex items-center justify-between">
              <span>Interactive Graph · Powered by RepoTutor Engine</span>
              <span>Select node on right to drill down</span>
            </div>
          </div>

          {/* Module Drilldown & Explanation Drawer */}
          <div className="rounded-xl border border-white/10 bg-[#111] p-6 space-y-4">
            {selectedModule ? (
              <>
                <div className="flex items-start justify-between border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">
                      Module Inspector
                    </span>
                    <h3 className="text-base font-bold text-white">
                      {selectedModule.name}
                    </h3>
                  </div>
                  <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] font-mono text-white/60">
                    {selectedModule.id}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-semibold text-white/80">Purpose</div>
                  <p className="text-xs text-white/60 leading-relaxed">
                    {selectedModule.purpose}
                  </p>
                </div>

                {/* Key Files */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <div className="text-xs font-semibold text-white/80">Key Files</div>
                  <div className="space-y-1.5">
                    {selectedModule.keyFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded bg-[#0a0a0a] px-2.5 py-1.5 border border-white/5 text-xs"
                      >
                        <span className="font-mono text-white/80 truncate text-[11px]">
                          {file}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {onSelectFile && (
                            <button
                              onClick={() => onSelectFile(file)}
                              className="text-[10px] text-emerald-400 hover:underline"
                            >
                              Open
                            </button>
                          )}
                          {onRescueFile && (
                            <button
                              onClick={() => onRescueFile(file)}
                              className="text-[10px] text-teal-300 hover:underline flex items-center gap-0.5"
                              title="Send to RepoRescue analysis"
                            >
                              <Sparkles className="h-2.5 w-2.5" />
                              <span>Rescue</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dependencies */}
                {selectedModule.dependsOn && selectedModule.dependsOn.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-white/5">
                    <div className="text-xs font-semibold text-white/80">Depends On</div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedModule.dependsOn.map((dep, idx) => (
                        <span
                          key={idx}
                          className="rounded bg-white/5 px-2 py-0.5 text-[10px] font-mono text-white/60"
                        >
                          {dep}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action CTA */}
                <div className="pt-4 border-t border-white/10 space-y-2">
                  {onRescueFile && selectedModule.keyFiles[0] && (
                    <button
                      onClick={() => onRescueFile(selectedModule.keyFiles[0])}
                      className="w-full flex items-center justify-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Rescue {selectedModule.name} in RepoRescue</span>
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-xs text-white/40">
                Select a module to view architectural details.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
