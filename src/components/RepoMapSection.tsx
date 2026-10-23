import React, { useState } from 'react';
import {
  Network,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Search,
  FileCode,
  Layers,
  ArrowRight,
  ExternalLink,
  BookOpen,
  Info,
} from 'lucide-react';
import { ArchitectureNode, RepoAnalysisData } from '../types';

interface RepoMapSectionProps {
  repo: RepoAnalysisData;
  onSelectFile: (filePath: string) => void;
}

export const RepoMapSection: React.FC<RepoMapSectionProps> = ({ repo, onSelectFile }) => {
  const [selectedNode, setSelectedNode] = useState<ArchitectureNode | null>(
    repo.architectureMap[0] || null
  );
  const [zoomLevel, setZoomLevel] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Frontend', 'Backend', 'Database', 'Auth', 'Services', 'Config'];

  const filteredNodes = repo.architectureMap.filter((node) => {
    const matchesCategory = selectedCategory === 'All' || node.category === selectedCategory;
    const matchesQuery =
      !searchQuery ||
      node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Search / Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Network className="h-5 w-5 text-emerald-400" />
            <span>Interactive Architecture Map</span>
          </h2>
          <p className="text-xs text-white/60">
            Click any architecture component node to inspect its files, dependencies, and entry pathways.
          </p>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search components..."
              className="w-44 rounded-lg border border-white/10 bg-[#111] py-1.5 pl-8 pr-2 text-xs text-gray-200 placeholder-white/30 focus:border-emerald-500 focus:outline-none font-mono"
            />
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-[#111] p-0.5 text-xs">
            {categories.slice(0, 5).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-1 rounded-md text-[11px] font-mono transition ${
                  selectedCategory === cat
                    ? 'bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-[#111] p-1">
            <button
              onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 1.4))}
              className="p-1 text-white/40 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.7))}
              className="p-1 text-white/40 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1 text-white/40 hover:text-white"
              title="Reset Zoom"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* GRAPH CANVAS & DETAILS DRAWER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GRAPH VIEW AREA */}
        <div className="lg:col-span-2 rounded-xl border border-white/10 bg-[#111] p-6 relative overflow-hidden min-h-[480px] flex flex-col justify-between shadow-2xl">
          {/* Subtle grid pattern background */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          <div className="relative z-10 flex items-center justify-between text-xs text-white/40 font-mono mb-4">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Interactive Repository Architecture
            </span>
            <span>Zoom: {Math.round(zoomLevel * 100)}%</span>
          </div>

          {/* Rendered Nodes Layout */}
          <div
            className="relative z-10 my-auto py-8 transition-transform duration-200 origin-center"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {/* Top Level Root */}
            <div className="flex justify-center mb-8">
              <div className="px-6 py-2.5 rounded-lg border border-emerald-500/30 bg-[#0a0a0a] shadow-xl text-center">
                <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 block">
                  Repository Core
                </span>
                <span className="text-sm font-extrabold text-white">{repo.repoName}</span>
              </div>
            </div>

            {/* Connecting lines */}
            <div className="w-1/2 mx-auto h-6 border-t border-white/20 border-dashed mb-6" />

            {/* Architecture Node Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredNodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;

                return (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className={`p-4 rounded-xl border text-left transition relative group ${
                      isSelected
                        ? 'border-emerald-500 bg-[#0a0a0a] shadow-xl shadow-emerald-500/10'
                        : 'border-white/10 bg-[#0a0a0a] hover:border-white/20'
                    }`}
                  >
                    <span className="inline-block px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider font-semibold mb-2 bg-white/5 border border-white/10 text-white/70">
                      {node.category}
                    </span>
                    <h3 className="text-xs font-bold text-white mb-1 group-hover:text-emerald-400 transition">
                      {node.label}
                    </h3>
                    <p className="text-[11px] text-white/60 line-clamp-2 leading-relaxed">
                      {node.description}
                    </p>

                    <div className="mt-3 flex items-center justify-between text-[10px] text-white/40 pt-2 border-t border-white/5 font-mono">
                      <span>{node.importantFiles.length} key files</span>
                      <ArrowRight className="h-3 w-3 text-emerald-400 opacity-0 group-hover:opacity-100 transition" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative z-10 text-[11px] text-white/40 flex items-center justify-between pt-4 border-t border-white/10 font-mono">
            <span>Tip: Click any component box to reveal file relationships and suggested reading order</span>
            <span>{filteredNodes.length} Components</span>
          </div>
        </div>

        {/* NODE INSPECTOR DRAWER */}
        <div className="rounded-xl border border-white/10 bg-[#111] p-6 shadow-xl flex flex-col justify-between">
          {selectedNode ? (
            <div className="space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded-md bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider font-semibold text-emerald-400 border border-emerald-500/20">
                    {selectedNode.category} Layer
                  </span>
                  <span className="text-[10px] text-white/40 font-mono">ID: {selectedNode.id}</span>
                </div>
                <h3 className="text-lg font-extrabold text-white">{selectedNode.label}</h3>
                <p className="mt-2 text-xs text-white/70 leading-relaxed">
                  {selectedNode.description}
                </p>
              </div>

              {/* Suggested Files to Read First */}
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-emerald-400 flex items-center gap-1.5 mb-2">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Suggested Files to Read First</span>
                </h4>
                <div className="space-y-1.5">
                  {selectedNode.suggestedFilesToRead.map((file, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSelectFile(file)}
                      className="w-full flex items-center justify-between p-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 transition text-left text-xs text-emerald-300 font-mono"
                    >
                      <span className="truncate">{file}</span>
                      <ExternalLink className="h-3 w-3 text-emerald-400 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Important Files */}
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-white/70 flex items-center gap-1.5 mb-2">
                  <FileCode className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Important Files in Component</span>
                </h4>
                <div className="space-y-1">
                  {selectedNode.importantFiles.map((file, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSelectFile(file)}
                      className="w-full flex items-center justify-between p-2 rounded-lg border border-white/10 bg-[#0a0a0a] hover:bg-white/5 transition text-left text-xs text-white/80 font-mono"
                    >
                      <span className="truncate">{file}</span>
                      <span className="text-[10px] text-white/40">Inspect</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dependencies */}
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-white/70 flex items-center gap-1.5 mb-2">
                  <Layers className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Dependencies & Libraries</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedNode.dependencies.map((dep, idx) => (
                    <span
                      key={idx}
                      className="rounded bg-white/5 px-2 py-1 text-[10px] font-mono text-white/70 border border-white/10"
                    >
                      {dep}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-16 text-white/40 space-y-3">
              <Info className="h-8 w-8 text-white/20" />
              <p className="text-xs">Select any architecture node on the graph to inspect details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
