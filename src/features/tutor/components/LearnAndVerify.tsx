import React, { useState } from 'react';
import { RepoModel, ModuleQuiz, QuizQuestion } from '../types';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Award,
  RefreshCw,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

interface LearnAndVerifyProps {
  model: RepoModel;
}

export const LearnAndVerify: React.FC<LearnAndVerifyProps> = ({ model }) => {
  const quizzes = model.quizzes || [];

  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<Record<string, boolean>>({});

  const currentQuiz: ModuleQuiz | undefined = quizzes[activeModuleIndex] || quizzes[0];

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    if (submittedQuestions[questionId]) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }));
  };

  const handleSubmitQuestion = (questionId: string) => {
    setSubmittedQuestions((prev) => ({
      ...prev,
      [questionId]: true,
    }));
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setSubmittedQuestions({});
  };

  // Calculate score for active module
  const totalQuestions = currentQuiz?.questions.length || 0;
  const answeredCount = Object.keys(submittedQuestions).length;
  let correctCount = 0;
  if (currentQuiz) {
    for (const q of currentQuiz.questions) {
      if (submittedQuestions[q.id] && selectedAnswers[q.id] === q.correctIndex) {
        correctCount += 1;
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-white/10 bg-[#111] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-emerald-400" />
              <span>Learn & Verify: Architecture Quizzes</span>
            </h1>
            <p className="text-xs text-white/60">
              Test your understanding of core concepts, concurrency models, and module responsibilities.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="text-xs font-mono text-emerald-400 font-bold">
              Score: {correctCount} / {totalQuestions}
            </div>
            <button
              onClick={handleResetQuiz}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#0a0a0a] px-3 py-1.5 text-xs text-white/60 hover:text-white transition"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Module Selector Tabs */}
        {quizzes.length > 1 && (
          <div className="flex flex-wrap gap-2 border-t border-white/10 pt-4">
            {quizzes.map((q, idx) => (
              <button
                key={q.moduleId}
                onClick={() => {
                  setActiveModuleIndex(idx);
                  handleResetQuiz();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  activeModuleIndex === idx
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                {q.moduleName}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {currentQuiz && currentQuiz.questions.length > 0 ? (
          currentQuiz.questions.map((q, qIdx) => {
            const isSubmitted = submittedQuestions[q.id];
            const selectedOpt = selectedAnswers[q.id];
            const isCorrect = isSubmitted && selectedOpt === q.correctIndex;

            return (
              <div
                key={q.id}
                className={`rounded-xl border p-6 space-y-4 transition ${
                  isSubmitted
                    ? isCorrect
                      ? 'border-emerald-500/30 bg-[#0a0a0a]'
                      : 'border-red-500/30 bg-[#0a0a0a]'
                    : 'border-white/10 bg-[#0a0a0a]'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-white/40 font-mono">
                  <span>Question {qIdx + 1} of {currentQuiz.questions.length}</span>
                  {isSubmitted && (
                    <span
                      className={`font-bold flex items-center gap-1 ${
                        isCorrect ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Correct</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4" />
                          <span>Incorrect</span>
                        </>
                      )}
                    </span>
                  )}
                </div>

                <h3 className="text-sm sm:text-base font-bold text-white leading-relaxed">
                  {q.question}
                </h3>

                {/* Options List */}
                <div className="space-y-2 pt-1">
                  {q.options.map((opt, optIdx) => {
                    const isOptionSelected = selectedOpt === optIdx;
                    let optionStyle = 'border-white/5 bg-[#111] text-gray-300 hover:border-white/20 hover:bg-[#161616]';

                    if (isSubmitted) {
                      if (optIdx === q.correctIndex) {
                        optionStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-semibold';
                      } else if (isOptionSelected) {
                        optionStyle = 'border-red-500 bg-red-500/10 text-red-300';
                      } else {
                        optionStyle = 'border-white/5 bg-[#111] text-white/30 opacity-60';
                      }
                    } else if (isOptionSelected) {
                      optionStyle = 'border-emerald-500 bg-emerald-500/10 text-white font-semibold ring-1 ring-emerald-500';
                    }

                    return (
                      <button
                        key={optIdx}
                        disabled={isSubmitted}
                        onClick={() => handleSelectOption(q.id, optIdx)}
                        className={`w-full text-left p-3.5 rounded-lg border text-xs sm:text-sm flex items-start gap-3 transition ${optionStyle}`}
                      >
                        <span className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center shrink-0 font-mono text-[11px] mt-0.5">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="leading-relaxed flex-1">{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Submit or Explanation Banner */}
                {!isSubmitted ? (
                  <div className="pt-2">
                    <button
                      disabled={selectedOpt === undefined}
                      onClick={() => handleSubmitQuestion(q.id)}
                      className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-black hover:bg-emerald-400 transition disabled:opacity-30 shadow-md shadow-emerald-500/20"
                    >
                      Submit Answer
                    </button>
                  </div>
                ) : (
                  <div className="rounded-lg bg-[#111] border border-white/10 p-4 space-y-1.5 text-xs text-gray-300">
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Architecture Explanation:</span>
                    </div>
                    <p className="leading-relaxed text-white/80">{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 text-xs text-white/40">
            No quiz questions generated for this module.
          </div>
        )}
      </div>
    </div>
  );
};
