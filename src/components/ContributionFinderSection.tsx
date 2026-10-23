import React, { useState } from 'react';
import {
  Code2,
  Clock,
  FileCode,
  Sparkles,
  CheckCircle2,
  X,
  Play,
  CheckSquare,
  Square,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { ContributionTask, RepoAnalysisData } from '../types';

interface ContributionFinderSectionProps {
  repo: RepoAnalysisData;
  onSelectFile: (filePath: string) => void;
}

export const ContributionFinderSection: React.FC<ContributionFinderSectionProps> = ({
  repo,
  onSelectFile,
}) => {
  const [selectedTask, setSelectedTask] = useState<ContributionTask | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [filterDifficulty, setFilterDifficulty] = useState<string>('All');

  const filteredTasks = repo.contributionTasks.filter((task) => {
    if (filterDifficulty === 'All') return true;
    return task.difficulty === filterDifficulty;
  });

  const toggleStep = (stepIdx: number) => {
    if (!selectedTask) return;
    const key = `${selectedTask.id}-${stepIdx}`;
    setCompletedSteps((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* HEADER BANNER */}
      <div className="rounded-xl border border-white/10 bg-[#111] p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-3 py-0.5 text-[10px] font-mono uppercase tracking-wider font-semibold text-emerald-400 mb-2">
              <Code2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>AI Opportunity Analyzer</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white sm:text-3xl tracking-tight">
              Where Can I Contribute?
            </h1>
            <p className="mt-1 text-xs text-white/60 max-w-2xl leading-relaxed">
              Analyzing repository issues and codebase complexity to suggest bite-sized contribution opportunities.
            </p>
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-[#0a0a0a] p-1 text-xs">
            {['All', 'Beginner', 'Intermediate', 'Advanced'].map((diff) => (
              <button
                key={diff}
                onClick={() => setFilterDifficulty(diff)}
                className={`px-3 py-1 rounded-md text-[11px] font-mono transition ${
                  filterDifficulty === diff
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {diff === 'Beginner' && '🟢 '}
                {diff === 'Intermediate' && '🟡 '}
                {diff === 'Advanced' && '🔴 '}
                {diff}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TASKS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTasks.map((task) => {
          const isBeginner = task.difficulty === 'Beginner';
          const isIntermediate = task.difficulty === 'Intermediate';

          return (
            <div
              key={task.id}
              className="rounded-xl border border-white/10 bg-[#111] p-6 shadow-xl flex flex-col justify-between space-y-4 hover:border-emerald-500/30 transition group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-md px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider font-semibold border ${
                      isBeginner
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : isIntermediate
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}
                  >
                    {isBeginner && '🟢 Beginner Task'}
                    {isIntermediate && '🟡 Intermediate Task'}
                    {!isBeginner && !isIntermediate && '🔴 Advanced Task'}
                  </span>

                  <span className="flex items-center gap-1 text-[10px] text-white/40 font-mono">
                    <Clock className="h-3.5 w-3.5" />
                    {task.estimatedTime}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition">
                  {task.title}
                </h3>

                <p className="text-xs text-white/70 leading-relaxed">{task.description}</p>

                {/* Why this is a good first contribution */}
                <div className="rounded-lg bg-[#0a0a0a] p-3 border border-white/10 text-xs">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                    Why This Is A Good Contribution:
                  </span>
                  <p className="text-white/70 italic">"{task.whyGoodFirstContribution}"</p>
                </div>

                {/* Skills & Files involved */}
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-white/40 text-[10px] font-mono uppercase tracking-wider font-semibold block mb-1">
                      Required Skills:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {task.skills.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="rounded bg-white/5 px-2 py-0.5 text-[10px] font-mono text-white/70 border border-white/10"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-white/40 text-[10px] font-mono uppercase tracking-wider font-semibold block mb-1">
                      Files Involved:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {task.filesInvolved.map((file, fIdx) => (
                        <button
                          key={fIdx}
                          onClick={() => onSelectFile(file)}
                          className="flex items-center gap-1 rounded bg-[#0a0a0a] px-2 py-1 text-xs font-mono text-emerald-400 border border-white/10 hover:border-emerald-500/30 transition"
                        >
                          <FileCode className="h-3 w-3 text-emerald-400" />
                          <span>{file}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Start Task Button */}
              <div className="pt-3 border-t border-white/10">
                <button
                  onClick={() => setSelectedTask(task)}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-black hover:bg-emerald-400 transition shadow-md shadow-emerald-500/10"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Start This Task</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* INTERACTIVE "START THIS TASK" GUIDANCE MODAL */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-xl border border-white/10 bg-[#111] p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Code2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{selectedTask.title}</h3>
                  <p className="text-xs text-white/40 font-mono">Task Execution Checklist</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="rounded-lg bg-[#0a0a0a] p-4 border border-white/10 space-y-2">
                <span className="font-mono font-bold text-emerald-400 uppercase tracking-wider text-[10px] block">
                  Task Rationale
                </span>
                <p className="text-white/70 leading-relaxed">{selectedTask.description}</p>
              </div>

              <div>
                <h4 className="font-bold text-white text-xs mb-3 font-mono uppercase tracking-wider">Step-by-Step Guidance Checklist:</h4>
                <div className="space-y-2">
                  {selectedTask.stepsToComplete.map((step, idx) => {
                    const key = `${selectedTask.id}-${idx}`;
                    const isDone = !!completedSteps[key];

                    return (
                      <button
                        key={idx}
                        onClick={() => toggleStep(idx)}
                        className={`w-full flex items-start gap-3 p-3 rounded-lg border text-left transition ${
                          isDone
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 line-through opacity-80'
                            : 'border-white/10 bg-[#0a0a0a] text-white/80 hover:border-white/20'
                        }`}
                      >
                        {isDone ? (
                          <CheckSquare className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <Square className="h-4 w-4 text-white/40 shrink-0 mt-0.5" />
                        )}
                        <span className="leading-relaxed">{step}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono">
              <span className="text-white/40">
                Target File:{' '}
                <span className="text-emerald-400">{selectedTask.filesInvolved[0]}</span>
              </span>
              <button
                onClick={() => {
                  if (selectedTask.filesInvolved[0]) {
                    onSelectFile(selectedTask.filesInvolved[0]);
                    setSelectedTask(null);
                  }
                }}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 font-bold text-black hover:bg-emerald-400 transition"
              >
                <span>Open Target File in Explorer</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
