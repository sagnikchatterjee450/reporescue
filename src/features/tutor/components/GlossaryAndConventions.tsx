import React from 'react';
import { RepoModel } from '../types';
import { BookMarked, Code, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface GlossaryAndConventionsProps {
  model: RepoModel;
}

export const GlossaryAndConventions: React.FC<GlossaryAndConventionsProps> = ({ model }) => {
  const glossary = model.keyConceptsAndGlossary || [];
  const conventions = model.codeConventions || [];
  const gotchas = model.gotchas || [];

  return (
    <div className="space-y-8">
      {/* 1. Project Glossary */}
      <div className="rounded-xl border border-white/10 bg-[#111] p-6 space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <BookMarked className="h-5 w-5 text-emerald-400" />
          <span>Project Domain Glossary</span>
        </h2>
        <p className="text-xs text-white/60">
          Core concepts, domain terminology, and architecture abstractions unique to {model.repoName}.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {glossary.map((item, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-white/5 bg-[#0a0a0a] p-4 space-y-2 hover:border-white/20 transition"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs sm:text-sm text-emerald-400 font-mono">
                  {item.term}
                </span>
                <span className="text-[10px] font-mono text-white/40 truncate max-w-[180px]">
                  {item.whereUsed}
                </span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                {item.definition}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Code Conventions */}
      <div className="rounded-xl border border-white/10 bg-[#111] p-6 space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <Code className="h-5 w-5 text-indigo-400" />
          <span>Code Conventions & Style Rules</span>
        </h2>
        <p className="text-xs text-white/60">
          Mandatory coding patterns, error handling conventions, and structural invariants.
        </p>

        <div className="space-y-3 pt-2">
          {conventions.map((conv, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-white/5 bg-[#0a0a0a] p-4 space-y-2 hover:border-white/20 transition"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-white">
                  {conv.rule}
                </span>
              </div>
              <p className="text-xs text-gray-300 pl-6 leading-relaxed">
                {conv.context}
              </p>
              {conv.example && (
                <div className="pl-6 pt-1">
                  <code className="block rounded bg-[#050505] border border-white/10 p-2 font-mono text-[11px] text-emerald-300 overflow-x-auto">
                    {conv.example}
                  </code>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Known Gotchas & Pitfalls */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6 space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-amber-300 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-400" />
          <span>Known Gotchas & System Traps</span>
        </h2>
        <p className="text-xs text-amber-200/70">
          Avoid these common pitfalls when modifying or debugging {model.repoName}.
        </p>

        <div className="space-y-3 pt-2">
          {gotchas.map((gotcha, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-amber-500/20 bg-[#0a0a0a] p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs sm:text-sm text-amber-300">
                  ⚠️ {gotcha.title}
                </h3>
                {gotcha.fileRef && (
                  <span className="text-[10px] font-mono text-white/40">
                    Ref: {gotcha.fileRef}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                {gotcha.description}
              </p>
              <div className="rounded bg-amber-500/10 border border-amber-500/20 p-2.5 text-xs text-amber-200">
                <strong className="text-white">Mitigation:</strong> {gotcha.mitigation}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
