import React, { useState } from 'react';
import { RepoModel, FirstContributionTask } from '../types';
import {
  Code2,
  Clock,
  CheckCircle2,
  Circle,
  FileCode2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckSquare,
} from 'lucide-react';

interface FirstContributionFinderProps {
  model: RepoModel;
  onSelectFile?: (filePath: string) => void;
  onRescueFile?: (filePath: string) => void;
}

export const FirstContributionFinder: React.FC<FirstContributionFinderProps> = ({
  model,
  onSelectFile,
  onRescueFile,
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const tasks = model.firstContributions || [];

  const filteredTasks = tasks.filter((t) => {
    if (selectedDifficulty === 'all') return true;
    return t.difficulty === selectedDifficulty;
  });

  const toggleChecklist = (taskId: string, index: number) => {
    const key = `${taskId}-${index}`;
    setCheckedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-white/10 bg-[#111] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Code2 className="h-5 w-5 text-emerald-400" />
              <span>First Contribution Finder</span>
            </h1>
            <p className="text-xs text-white/60">
              Curated, high-impact tasks categorized by difficulty, complete with testing instructions and PR checklists.
            </p>
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-[#0a0a0a] p-1 rounded-lg border border-white/10">
            {(['all', 'easy', 'medium', 'hard'] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-3 py-1 rounded text-xs capitalize transition ${
                  selectedDifficulty === diff
                    ? 'bg-emerald-500 text-black font-bold shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className="rounded-xl border border-white/10 bg-[#0a0a0a] p-6 space-y-4 hover:border-white/20 transition"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-mono uppercase font-bold border ${
                      task.difficulty === 'easy'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : task.difficulty === 'medium'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-red-500/10 text-red-400 border-red-500/30'
                    }`}
                  >
                    {task.difficulty}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-white/50 font-mono">
                    <Clock className="h-3 w-3" />
                    <span>~{task.estimatedMinutes} mins</span>
                  </span>
                </div>

                <h3 className="text-base font-bold text-white tracking-tight">
                  {task.title}
                </h3>
              </div>

              {onRescueFile && task.involvedFiles[0] && (
                <button
                  onClick={() => onRescueFile(task.involvedFiles[0])}
                  className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition shrink-0"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Rescue In RepoRescue</span>
                </button>
              )}
            </div>

            {/* Why Good First Issue */}
            <div className="space-y-1">
              <div className="text-[11px] font-semibold text-white/60">Why this is a great start:</div>
              <p className="text-xs text-gray-300 leading-relaxed pl-4 border-l-2 border-emerald-500/40">
                {task.whyGoodFirstIssue}
              </p>
            </div>

            {/* Files & Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-white/5">
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-white/60">Involved Files:</div>
                <div className="flex flex-wrap gap-1.5">
                  {task.involvedFiles.map((file, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSelectFile && onSelectFile(file)}
                      className="rounded bg-[#111] border border-white/10 px-2 py-0.5 text-[11px] font-mono text-emerald-400 hover:border-emerald-500/40 transition"
                    >
                      {file}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-white/60">Required Skills:</div>
                <div className="flex flex-wrap gap-1.5">
                  {task.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="rounded bg-white/5 px-2 py-0.5 text-[10px] font-mono text-white/80"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Test Instructions */}
            <div className="rounded-lg bg-[#111] border border-white/5 p-3 space-y-1 text-xs">
              <div className="font-semibold text-white/80 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Test Verification Instructions</span>
              </div>
              <code className="text-emerald-400 font-mono text-[11px] block pt-1">
                {task.testInstructions}
              </code>
            </div>

            {/* PR Checklist */}
            {task.prChecklist && task.prChecklist.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="text-[11px] font-semibold text-white/60 flex items-center gap-1.5">
                  <CheckSquare className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Pull Request Checklist:</span>
                </div>
                <div className="space-y-1.5">
                  {task.prChecklist.map((item, idx) => {
                    const isChecked = checkedItems[`${task.id}-${idx}`] || false;
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleChecklist(task.id, idx)}
                        className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer hover:text-white transition select-none"
                      >
                        {isChecked ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <Circle className="h-3.5 w-3.5 text-white/30 shrink-0" />
                        )}
                        <span className={isChecked ? 'line-through text-white/40' : ''}>
                          {item}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
