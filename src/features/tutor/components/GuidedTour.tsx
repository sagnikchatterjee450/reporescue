import React, { useState } from 'react';
import { RepoModel, TourStep, TourDifficulty, TourRole } from '../types';
import {
  Compass,
  CheckCircle2,
  Circle,
  Clock,
  ArrowRight,
  ArrowLeft,
  Share2,
  Check,
  FileCode2,
  Eye,
  SlidersHorizontal,
  Bookmark,
} from 'lucide-react';

interface GuidedTourProps {
  model: RepoModel;
  onSelectFile?: (filePath: string) => void;
  initialStepIndex?: number;
}

export const GuidedTour: React.FC<GuidedTourProps> = ({
  model,
  onSelectFile,
  initialStepIndex = 0,
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<TourDifficulty>('experienced_new_to_stack');
  const [selectedRole, setSelectedRole] = useState<TourRole>('all');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(initialStepIndex);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [copiedLink, setCopiedLink] = useState(false);

  // Filter steps according to difficulty and role
  const allSteps = model.guidedTour || [];

  const filteredSteps = allSteps.filter((step) => {
    // Role filter
    if (selectedRole !== 'all') {
      if (!step.roles.includes(selectedRole as any)) {
        return false;
      }
    }
    // Difficulty filter
    if (selectedDifficulty === 'senior_architecture') {
      return step.difficulty === 'senior_architecture' || step.difficulty === 'experienced_new_to_stack';
    }
    return true;
  });

  const activeSteps = filteredSteps.length > 0 ? filteredSteps : allSteps;
  const currentStep: TourStep | undefined = activeSteps[currentStepIndex] || activeSteps[0];

  const handleToggleComplete = (stepNum: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepNum)) {
        next.delete(stepNum);
      } else {
        next.add(stepNum);
      }
      return next;
    });
  };

  const handleCopyStepLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('tourStep', String(currentStep?.stepNumber || 1));
    navigator.clipboard.writeText(url.toString());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const progressPct = activeSteps.length > 0 ? Math.round((completedSteps.size / activeSteps.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Filter & Progress Bar */}
      <div className="rounded-xl border border-white/10 bg-[#111] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Compass className="h-5 w-5 text-emerald-400" />
              <span>Interactive Guided Codebase Tour</span>
            </h1>
            <p className="text-xs text-white/60">
              Curated chronological path to master the architecture, core execution flow, and conventions.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleCopyStepLink}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#0a0a0a] px-3 py-1.5 text-xs text-white/80 hover:text-white hover:border-white/20 transition"
              title="Copy shareable URL to current tour step"
            >
              {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
              <span>{copiedLink ? 'Link Copied!' : 'Share Step'}</span>
            </button>
          </div>
        </div>

        {/* Filters: Difficulty & Role */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/10 pt-4">
          {/* Difficulty Switcher */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-white/60 flex items-center gap-1">
              <SlidersHorizontal className="h-3 w-3 text-emerald-400" />
              <span>Experience Level</span>
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => { setSelectedDifficulty('new_to_programming'); setCurrentStepIndex(0); }}
                className={`px-2.5 py-1 rounded text-xs transition ${
                  selectedDifficulty === 'new_to_programming'
                    ? 'bg-emerald-500 text-black font-semibold'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                🌱 New to Programming
              </button>
              <button
                onClick={() => { setSelectedDifficulty('experienced_new_to_stack'); setCurrentStepIndex(0); }}
                className={`px-2.5 py-1 rounded text-xs transition ${
                  selectedDifficulty === 'experienced_new_to_stack'
                    ? 'bg-emerald-500 text-black font-semibold'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                ⚡ Experienced (New to Stack)
              </button>
              <button
                onClick={() => { setSelectedDifficulty('senior_architecture'); setCurrentStepIndex(0); }}
                className={`px-2.5 py-1 rounded text-xs transition ${
                  selectedDifficulty === 'senior_architecture'
                    ? 'bg-emerald-500 text-black font-semibold'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                🏛️ Senior Architecture
              </button>
            </div>
          </div>

          {/* Role Filter */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-white/60">Specialization Role</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {(['all', 'frontend', 'backend', 'devops', 'docs', 'reviewer'] as TourRole[]).map((role) => (
                <button
                  key={role}
                  onClick={() => { setSelectedRole(role); setCurrentStepIndex(0); }}
                  className={`px-2.5 py-1 rounded text-xs capitalize transition ${
                    selectedRole === role
                      ? 'bg-white/20 text-white font-semibold border border-white/20'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="border-t border-white/10 pt-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-white/60">
            <span>
              Tour Progress: <strong className="text-white">{completedSteps.size} of {activeSteps.length}</strong> steps completed
            </span>
            <span className="font-mono text-emerald-400 font-bold">{progressPct}%</span>
          </div>
          <div className="h-1.5 w-full bg-[#0a0a0a] rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Tour Step View & Step Navigator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Chronological Steps List */}
        <div className="rounded-xl border border-white/10 bg-[#111] p-4 space-y-2 max-h-[640px] overflow-y-auto">
          <div className="text-xs font-bold text-white/60 px-2 pb-2 border-b border-white/10 uppercase tracking-wider font-mono">
            Tour Steps ({activeSteps.length})
          </div>

          {activeSteps.map((step, idx) => {
            const isCurrent = idx === currentStepIndex;
            const isCompleted = completedSteps.has(step.stepNumber);

            return (
              <button
                key={step.stepNumber}
                onClick={() => setCurrentStepIndex(idx)}
                className={`w-full text-left p-3 rounded-lg border transition-all flex items-start gap-3 ${
                  isCurrent
                    ? 'border-emerald-500 bg-emerald-500/10 text-white'
                    : 'border-white/5 bg-[#0a0a0a] text-white/70 hover:border-white/20 hover:bg-[#141414]'
                }`}
              >
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleComplete(step.stepNumber);
                  }}
                  className="mt-0.5 shrink-0 text-white/40 hover:text-emerald-400 transition"
                  title="Mark as completed"
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center justify-between text-[11px] text-white/40 font-mono">
                    <span>Step {idx + 1}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" />
                      <span>{step.minutes}m</span>
                    </span>
                  </div>
                  <div className={`text-xs font-semibold truncate ${isCurrent ? 'text-emerald-300' : 'text-white'}`}>
                    {step.title}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Active Step Details */}
        <div className="lg:col-span-2 rounded-xl border border-white/10 bg-[#0a0a0a] p-6 sm:p-8 space-y-6">
          {currentStep ? (
            <>
              {/* Step Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
                    <span>STEP {currentStepIndex + 1} OF {activeSteps.length}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{currentStep.minutes} minutes reading time</span>
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {currentStep.title}
                  </h2>
                </div>

                <button
                  onClick={() => handleToggleComplete(currentStep.stepNumber)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition shrink-0 ${
                    completedSteps.has(currentStep.stepNumber)
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-white/5 text-white/80 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>
                    {completedSteps.has(currentStep.stepNumber) ? 'Completed ✓' : 'Mark Completed'}
                  </span>
                </button>
              </div>

              {/* Files to open */}
              <div className="rounded-lg border border-white/10 bg-[#111] p-4 space-y-2">
                <div className="text-xs font-bold text-white/80 flex items-center gap-1.5">
                  <FileCode2 className="h-4 w-4 text-emerald-400" />
                  <span>Files to Open & Inspect:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentStep.files.map((file, idx) => (
                    <button
                      key={idx}
                      onClick={() => onSelectFile && onSelectFile(file)}
                      className="flex items-center gap-1.5 rounded-md bg-[#0a0a0a] border border-white/10 px-3 py-1.5 text-xs font-mono text-emerald-400 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition"
                    >
                      <span>{file}</span>
                      <ArrowRight className="h-3 w-3 opacity-60" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Why it matters */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Bookmark className="h-4 w-4 text-emerald-400" />
                  <span>Why This Step Matters</span>
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed pl-6 border-l-2 border-emerald-500/30">
                  {currentStep.whyItMatters}
                </p>
              </div>

              {/* What to notice */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Eye className="h-4 w-4 text-indigo-400" />
                  <span>What to Notice While Reading the Code</span>
                </h3>
                <ul className="space-y-2 pl-2">
                  {currentStep.whatToNotice.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Step Navigation Controls */}
              <div className="flex items-center justify-between border-t border-white/10 pt-6">
                <button
                  onClick={() => setCurrentStepIndex((i) => Math.max(0, i - 1))}
                  disabled={currentStepIndex === 0}
                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#111] px-4 py-2 text-xs font-semibold text-white hover:bg-white/5 transition disabled:opacity-30"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Previous Step</span>
                </button>

                <button
                  onClick={() => setCurrentStepIndex((i) => Math.min(activeSteps.length - 1, i + 1))}
                  disabled={currentStepIndex === activeSteps.length - 1}
                  className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-black hover:bg-emerald-400 transition disabled:opacity-30"
                >
                  <span>Next Step</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-xs text-white/40">
              No tour steps match the active filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
