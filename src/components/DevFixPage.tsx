import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Sparkles,
  ArrowLeft,
  Copy,
  Check,
  Code2,
  AlertTriangle,
  Bug,
  Lightbulb,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Terminal,
  FileCode,
  Layers,
  Zap,
  Info,
  Sliders,
  History,
  Trash2,
  Share2,
} from 'lucide-react';
import { DevFixRequest, DevFixResult } from '../types';
import { SUPPORTED_LANGUAGES, DEVFIX_PRESETS, DevFixPreset } from '../data/devfixPresets';
import { analyzeDevFixError } from '../services/apiClient';

interface DevFixPageProps {
  onBackToRepoRescue: () => void;
}

export const DevFixPage: React.FC<DevFixPageProps> = ({ onBackToRepoRescue }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('typescript');
  const [errorCode, setErrorCode] = useState<string>(
    "TS2322: Type 'string | null' is not assignable to type 'string'"
  );
  const [codeSnippet, setCodeSnippet] = useState<string>(DEVFIX_PRESETS[0]?.sampleCode || '');
  const [contextInfo, setContextInfo] = useState<string>('');
  const [showContextInput, setShowContextInput] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<DevFixResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'fixed' | 'diff'>('fixed');
  const [historyItems, setHistoryItems] = useState<DevFixResult[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);

  // Sync document title
  useEffect(() => {
    const originalTitle = document.title;
    document.title = 'DevFix — Intelligent Error Diagnostic & Code Fixer';
    return () => {
      document.title = originalTitle;
    };
  }, []);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('devfix_history');
      if (saved) {
        setHistoryItems(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to parse history from localStorage', e);
    }
  }, []);

  const saveToHistory = (item: DevFixResult) => {
    try {
      const updated = [item, ...historyItems.filter((h) => h.errorCode !== item.errorCode)].slice(0, 10);
      setHistoryItems(updated);
      localStorage.setItem('devfix_history', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }
  };

  const clearHistory = () => {
    setHistoryItems([]);
    try {
      localStorage.removeItem('devfix_history');
    } catch (e) {}
  };

  // Switch preset
  const handleSelectPreset = (preset: DevFixPreset) => {
    setSelectedLanguage(preset.language);
    setErrorCode(preset.errorCode);
    setCodeSnippet(preset.sampleCode);
    setAnalysisResult(null);
    setErrorMessage(null);
  };

  // Perform Error Diagnosis & Code Fix
  const handleDiagnose = async () => {
    if (!errorCode.trim()) {
      setErrorMessage('Please enter an error code, message, or traceback to diagnose.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setLoadingStep('Inspecting Error Signature...');

    const stepTimer1 = setTimeout(() => setLoadingStep('Analyzing Language Semantics & Call Stack...'), 500);
    const stepTimer2 = setTimeout(() => setLoadingStep('Synthesizing Repaired Code & Prevention Strategy...'), 1100);

    try {
      const req: DevFixRequest = {
        language: selectedLanguage,
        errorCode: errorCode.trim(),
        codeSnippet: codeSnippet.trim(),
        contextInfo: contextInfo.trim(),
      };

      const result = await analyzeDevFixError(req);
      setAnalysisResult(result);
      saveToHistory(result);
    } catch (err: any) {
      console.error('Diagnosis failed:', err);
      setErrorMessage(err.message || 'Error diagnosis failed. Please check inputs and try again.');
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  // Copy fixed code
  const handleCopyFixedCode = () => {
    if (!analysisResult?.howToFix?.fixedCode) return;
    navigator.clipboard.writeText(analysisResult.howToFix.fixedCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Copy complete Markdown diagnosis report
  const handleCopyReport = () => {
    if (!analysisResult) return;
    const r = analysisResult;
    const md = `# DevFix Diagnostic Report: ${r.errorCode}
**Language:** ${r.language} | **Severity:** ${r.severity} | **Category:** ${r.errorCategory}

## 1. What Happened
${r.whatHappened.summary}

### Technical Details
${r.whatHappened.technicalDetails}

### Engine Behavior
${r.whatHappened.engineBehavior}

## 2. Why Might It Happen
**Primary Cause:** ${r.whyItMightHappen.primaryCause}

### Scenarios
${r.whyItMightHappen.possibleScenarios.map((s) => `- ${s}`).join('\n')}

### Risk Factors
${r.whyItMightHappen.riskFactors.map((rf) => `- ${rf}`).join('\n')}

## 3. How To Fix in Given Code
### Repaired Source Code
\`\`\`${r.language.toLowerCase()}
${r.howToFix.fixedCode}
\`\`\`

### Resolution Steps
${r.howToFix.stepByStepResolution.map((step) => `- ${step}`).join('\n')}

### Prevention & Best Practices
${r.howToFix.preventionBestPractices.map((bp) => `- ${bp}`).join('\n')}
${r.howToFix.suggestedLintRuleOrFlag ? `\n*Recommended Config:* \`${r.howToFix.suggestedLintRuleOrFlag}\`` : ''}
`;
    navigator.clipboard.writeText(md);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  // Handle Tab key in code textarea to insert spaces
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const val = target.value;
      target.value = val.substring(0, start) + '  ' + val.substring(end);
      target.selectionStart = target.selectionEnd = start + 2;
      setCodeSnippet(target.value);
    } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleDiagnose();
    }
  };

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.id === selectedLanguage) || SUPPORTED_LANGUAGES[0];
  const matchingPresets = DEVFIX_PRESETS.filter((p) => p.language === selectedLanguage);

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans selection:bg-emerald-500/30 selection:text-emerald-200 flex flex-col">
      {/* Top Header / Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0a0a0a]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand & Back Button */}
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToRepoRescue}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#111] px-3 py-1.5 text-xs font-medium text-white/70 hover:bg-white/5 hover:text-white transition"
              title="Return to RepoRescue codebase copilot"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to RepoRescue</span>
            </button>

            <div className="h-4 w-px bg-white/10 hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-black font-extrabold text-sm shadow-md shadow-emerald-500/20">
                <Wrench className="h-4 w-4 text-black stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-white tracking-tight">DevFix</span>
                  <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider font-semibold text-emerald-400 border border-emerald-500/20">
                    Standalone Tool
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-3">
            {historyItems.length > 0 && (
              <button
                onClick={() => setShowHistoryModal(true)}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#111] px-3 py-1.5 text-xs text-white/70 hover:bg-white/5 hover:text-white transition"
                title="View recent diagnoses"
              >
                <History className="h-3.5 w-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Recent Fixes</span>
                <span className="rounded bg-white/10 px-1.5 py-0.2 text-[10px] font-mono">
                  {historyItems.length}
                </span>
              </button>
            )}

            <button
              onClick={() => {
                const randomPreset = DEVFIX_PRESETS[Math.floor(Math.random() * DEVFIX_PRESETS.length)];
                handleSelectPreset(randomPreset);
              }}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#111] px-3 py-1.5 text-xs text-white/70 hover:bg-white/5 hover:text-white transition"
              title="Load a random error code preset"
            >
              <RefreshCw className="h-3.5 w-3.5 text-white/40" />
              <span className="hidden sm:inline">Random Example</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Banner */}
        <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 sm:p-8">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-mono text-emerald-400">
              <Zap className="h-3.5 w-3.5" />
              <span>Automated Code Diagnostic & Resolution System</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              DevFix: Instant Root-Cause Analysis & Code Repair
            </h1>
            <p className="text-sm text-white/60 leading-relaxed">
              Select your programming language, enter the error code or runtime exception, and paste your offending code.
              DevFix explains <strong className="text-emerald-400 font-medium">what happened</strong>, explores{' '}
              <strong className="text-emerald-400 font-medium">why it might happen</strong>, and generates the exact{' '}
              <strong className="text-emerald-400 font-medium">repaired code fix</strong> to resolve it.
            </p>
          </div>
        </section>

        {/* Input Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form Controls (Language, Error Code, Code Input) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Step 1: Programming Language Selector */}
            <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono uppercase tracking-wider text-white/50 flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                    1
                  </span>
                  Select Programming Language
                </label>
                <span className="text-[11px] font-mono text-emerald-400">
                  {currentLangObj.name} ({currentLangObj.ext})
                </span>
              </div>

              {/* Language Chips */}
              <div className="flex flex-wrap gap-2 pt-1">
                {SUPPORTED_LANGUAGES.map((lang) => {
                  const isSelected = selectedLanguage === lang.id;
                  return (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => {
                        setSelectedLanguage(lang.id);
                        // Check if a preset exists for this language
                        const p = DEVFIX_PRESETS.find((preset) => preset.language === lang.id);
                        if (p) {
                          setErrorCode(p.errorCode);
                          setCodeSnippet(p.sampleCode);
                        }
                      }}
                      className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                        isSelected
                          ? 'border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 shadow-sm shadow-emerald-500/10'
                          : 'border border-white/5 bg-[#111] text-white/60 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      <span className="font-mono text-[10px] font-bold text-white/40">{lang.icon}</span>
                      <span>{lang.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Error Code / Message Input */}
            <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono uppercase tracking-wider text-white/50 flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                    2
                  </span>
                  Enter Error Code or Exception Signature
                </label>
                <span className="text-[11px] text-white/40">e.g. TS2322, IndexError, E0382, SIGSEGV</span>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={errorCode}
                  onChange={(e) => setErrorCode(e.target.value)}
                  placeholder="Enter error code (e.g. TypeError: Cannot read properties of undefined, TS2322, etc.)"
                  className="w-full rounded-lg border border-white/10 bg-[#111] py-2.5 px-3.5 text-xs font-mono text-emerald-300 placeholder-white/25 focus:border-emerald-500 focus:outline-none transition shadow-inner"
                />
              </div>

              {/* Quick Preset Buttons for current language */}
              {matchingPresets.length > 0 && (
                <div className="pt-2 space-y-1.5">
                  <div className="text-[11px] font-mono text-white/40 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-emerald-400" />
                    <span>Quick presets for {currentLangObj.name}:</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {matchingPresets.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className="text-left group flex items-center justify-between rounded-lg border border-white/5 bg-[#111] p-2 hover:border-emerald-500/30 hover:bg-[#151515] transition"
                      >
                        <div className="truncate mr-2">
                          <div className="text-xs font-mono text-white/80 group-hover:text-emerald-300 transition truncate">
                            {preset.errorCode}
                          </div>
                          <div className="text-[10px] text-white/40 truncate">{preset.description}</div>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-white/30 group-hover:text-emerald-400 shrink-0 transition" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Given Code by the User */}
            <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono uppercase tracking-wider text-white/50 flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                    3
                  </span>
                  Paste Offending Code Snippet
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCodeSnippet('')}
                    className="text-[11px] text-white/40 hover:text-white transition"
                  >
                    Clear
                  </button>
                  <span className="text-white/20">•</span>
                  <button
                    type="button"
                    onClick={() => {
                      const p = DEVFIX_PRESETS.find((x) => x.language === selectedLanguage);
                      if (p) setCodeSnippet(p.sampleCode);
                    }}
                    className="text-[11px] text-emerald-400/80 hover:text-emerald-300 transition"
                  >
                    Reset Sample
                  </button>
                </div>
              </div>

              {/* Code Editor Frame */}
              <div className="overflow-hidden rounded-lg border border-white/10 bg-[#111]">
                <div className="flex items-center justify-between border-b border-white/5 bg-[#0e0e0e] px-3 py-1.5 text-[11px] font-mono text-white/40">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500/60" />
                    <span className="h-2 w-2 rounded-full bg-yellow-500/60" />
                    <span className="h-2 w-2 rounded-full bg-emerald-500/60" />
                    <span className="ml-2 text-white/60">code{currentLangObj.ext}</span>
                  </div>
                  <span>Tab key supported</span>
                </div>
                <textarea
                  rows={13}
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`// Paste your ${currentLangObj.name} code here...\n// DevFix will analyze this exact code and return a corrected version.`}
                  className="w-full bg-[#111] p-3.5 font-mono text-xs text-gray-200 placeholder-white/20 focus:outline-none resize-y leading-relaxed select-text"
                  spellCheck={false}
                />
              </div>

              {/* Optional Context Accordion */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowContextInput(!showContextInput)}
                  className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition"
                >
                  <Sliders className="h-3 w-3" />
                  <span>{showContextInput ? 'Hide additional context' : '+ Add environment/runtime context (optional)'}</span>
                </button>

                {showContextInput && (
                  <div className="mt-2.5 pt-2 border-t border-white/5">
                    <input
                      type="text"
                      value={contextInfo}
                      onChange={(e) => setContextInfo(e.target.value)}
                      placeholder="e.g. Node 20, Next.js 14, React 19, strict mode, PostgreSQL 16..."
                      className="w-full rounded-lg border border-white/10 bg-[#111] py-2 px-3 text-xs font-mono text-gray-200 placeholder-white/25 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Error Alert if validation fails */}
              {errorMessage && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300 flex items-start gap-2.5">
                  <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  <div>{errorMessage}</div>
                </div>
              )}

              {/* Submit Action Button */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleDiagnose}
                  className={`w-full flex items-center justify-center gap-2.5 rounded-xl py-3 px-5 text-sm font-bold text-black transition shadow-lg ${
                    isLoading
                      ? 'bg-emerald-400/60 cursor-not-allowed'
                      : 'bg-emerald-400 hover:bg-emerald-300 active:scale-[0.99] shadow-emerald-500/20 cursor-pointer'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin text-black" />
                      <span>{loadingStep || 'Analyzing Error & Code...'}</span>
                    </>
                  ) : (
                    <>
                      <Wrench className="h-4 w-4 text-black stroke-[2.5]" />
                      <span>Diagnose & Fix Error in Given Code</span>
                      <kbd className="hidden sm:inline-block rounded bg-black/20 px-1.5 py-0.5 text-[10px] font-mono text-black font-semibold">
                        ⌘ + Enter
                      </kbd>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Diagnostic & Repaired Code Output */}
          <div className="lg:col-span-5 space-y-5">
            {!analysisResult && !isLoading ? (
              /* Empty State Placeholder */
              <div className="rounded-xl border border-dashed border-white/10 bg-[#0a0a0a]/50 p-8 text-center space-y-4 flex flex-col items-center justify-center h-full min-h-[460px]">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white/40">
                  <Bug className="h-7 w-7 text-emerald-400/60" />
                </div>
                <div className="max-w-xs space-y-1.5">
                  <h3 className="text-sm font-semibold text-white">Diagnostic Results Awaiting Input</h3>
                  <p className="text-xs text-white/50 leading-relaxed">
                    Select a language, enter the error code or message, and click{' '}
                    <span className="text-emerald-400 font-medium">Diagnose & Fix</span>. DevFix will explain what happened,
                    why it happened, and how to fix it in your code.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleDiagnose}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Run Diagnostic on Preset</span>
                  </button>
                </div>
              </div>
            ) : isLoading ? (
              /* Loading State */
              <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-8 text-center space-y-5 flex flex-col items-center justify-center h-full min-h-[460px]">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Wrench className="h-6 w-6 text-emerald-400 animate-pulse" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-white">DevFix Engine at Work</h4>
                  <p className="text-xs font-mono text-emerald-400 animate-pulse">{loadingStep}</p>
                  <p className="text-[11px] text-white/40 max-w-xs">
                    Interpreting compiler diagnostics, AST invariants, and building side-by-side corrected patch.
                  </p>
                </div>
              </div>
            ) : analysisResult ? (
              /* Analysis Complete Results Card */
              <div className="space-y-5 animate-in fade-in duration-300">
                {/* Result Header Badge Bar */}
                <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-4 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider font-semibold border ${
                        analysisResult.severity === 'Critical'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : analysisResult.severity === 'High'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}
                    >
                      {analysisResult.severity} Severity
                    </span>
                    <span className="rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-mono text-white/60">
                      {analysisResult.errorCategory}
                    </span>
                    <span className="rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
                      {analysisResult.language}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyReport}
                      className="flex items-center gap-1 text-[11px] font-mono text-white/60 hover:text-white transition rounded px-2 py-1 bg-white/5 hover:bg-white/10"
                      title="Copy entire diagnostic report as Markdown"
                    >
                      {copiedReport ? <Check className="h-3 w-3 text-emerald-400" /> : <Share2 className="h-3 w-3" />}
                      <span>{copiedReport ? 'Report Copied!' : 'Copy Report'}</span>
                    </button>
                  </div>
                </div>

                {/* SECTION 1: WHAT HAPPENED */}
                <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-5 space-y-3">
                  <div className="flex items-center gap-2 text-white font-medium text-xs font-mono uppercase tracking-wider">
                    <Info className="h-4 w-4 text-emerald-400" />
                    <span>1. What Happened</span>
                  </div>

                  <div className="rounded-lg bg-[#111] p-3.5 border border-white/5 space-y-2">
                    <p className="text-xs text-white/90 font-medium leading-relaxed">
                      {analysisResult.whatHappened.summary}
                    </p>
                    <div className="text-[11px] text-white/50 leading-relaxed pt-1 border-t border-white/5">
                      <strong className="text-white/70">Engine Behavior: </strong>
                      {analysisResult.whatHappened.engineBehavior}
                    </div>
                  </div>

                  {analysisResult.whatHappened.technicalDetails && (
                    <div className="text-[11px] text-white/50 leading-relaxed font-mono bg-[#0c0c0c] p-2.5 rounded border border-white/5">
                      {analysisResult.whatHappened.technicalDetails}
                    </div>
                  )}
                </div>

                {/* SECTION 2: WHY MIGHT IT HAPPEN */}
                <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-5 space-y-3">
                  <div className="flex items-center gap-2 text-white font-medium text-xs font-mono uppercase tracking-wider">
                    <Lightbulb className="h-4 w-4 text-amber-400" />
                    <span>2. Why Might It Happen</span>
                  </div>

                  <div className="space-y-2.5">
                    {/* Primary Cause in User's Code */}
                    <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-3 text-xs text-amber-200/90 leading-relaxed">
                      <strong className="text-amber-300 font-semibold block mb-0.5">Identified Root Cause:</strong>
                      {analysisResult.whyItMightHappen.primaryCause}
                    </div>

                    {/* Common Scenarios */}
                    {analysisResult.whyItMightHappen.possibleScenarios?.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <div className="text-[11px] font-mono text-white/40 uppercase tracking-wider">
                          Typical trigger scenarios:
                        </div>
                        <ul className="space-y-1 text-xs text-white/70">
                          {analysisResult.whyItMightHappen.possibleScenarios.map((sc, i) => (
                            <li key={i} className="flex items-start gap-2 bg-[#111] p-2 rounded border border-white/5">
                              <span className="text-amber-400/80 font-mono text-[10px] mt-0.5">0{i + 1}</span>
                              <span className="text-[11px] leading-relaxed">{sc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Risk Factors */}
                    {analysisResult.whyItMightHappen.riskFactors?.length > 0 && (
                      <div className="pt-1 flex flex-wrap gap-1.5">
                        {analysisResult.whyItMightHappen.riskFactors.map((rf, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 rounded bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 text-[10px] font-mono text-rose-300"
                          >
                            <AlertTriangle className="h-2.5 w-2.5" />
                            {rf}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* SECTION 3: HOW IT CAN BE FIXED IN THE GIVEN CODE */}
                <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-5 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 text-white font-medium text-xs font-mono uppercase tracking-wider">
                      <ShieldCheck className="h-4 w-4 text-emerald-400" />
                      <span>3. How It Can Be Fixed in Given Code</span>
                    </div>

                    <div className="flex items-center rounded-lg border border-white/10 bg-[#111] p-0.5 text-[11px] font-mono">
                      <button
                        onClick={() => setViewMode('fixed')}
                        className={`px-2 py-0.5 rounded transition ${
                          viewMode === 'fixed' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-white/50 hover:text-white'
                        }`}
                      >
                        Repaired Code
                      </button>
                      <button
                        onClick={() => setViewMode('diff')}
                        className={`px-2 py-0.5 rounded transition ${
                          viewMode === 'diff' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-white/50 hover:text-white'
                        }`}
                      >
                        Diff View
                      </button>
                    </div>
                  </div>

                  {/* Diff Explanation */}
                  {analysisResult.howToFix.diffExplanation && (
                    <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-3 text-xs text-emerald-300/90 leading-relaxed">
                      <strong className="text-emerald-300 font-semibold block mb-0.5">Summary of Code Changes:</strong>
                      {analysisResult.howToFix.diffExplanation}
                    </div>
                  )}

                  {/* Fixed Code Box with 1-Click Copy */}
                  <div className="overflow-hidden rounded-lg border border-white/10 bg-[#111]">
                    <div className="flex items-center justify-between border-b border-white/5 bg-[#0e0e0e] px-3.5 py-2 text-[11px] font-mono text-white/50">
                      <div className="flex items-center gap-2">
                        <FileCode className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-white/80 font-medium">
                          {viewMode === 'fixed' ? `repaired_code${currentLangObj.ext}` : 'diff_preview'}
                        </span>
                        <span className="rounded bg-emerald-500/10 text-emerald-400 px-1.5 py-0.2 text-[9px] border border-emerald-500/20">
                          Ready to run
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleCopyFixedCode}
                        className="flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1 text-xs font-mono text-white hover:bg-emerald-500/20 hover:text-emerald-300 transition"
                      >
                        {copiedCode ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copy Fixed Code</span>
                          </>
                        )}
                      </button>
                    </div>

                    <pre className="p-4 font-mono text-xs text-emerald-200/90 overflow-x-auto leading-relaxed max-h-[360px] bg-[#0c0c0c] select-all">
                      <code>{analysisResult.howToFix.fixedCode}</code>
                    </pre>
                  </div>

                  {/* Step-by-Step Resolution Walkthrough */}
                  {analysisResult.howToFix.stepByStepResolution?.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <div className="text-[11px] font-mono text-white/40 uppercase tracking-wider">
                        Step-by-step resolution walkthrough:
                      </div>
                      <div className="space-y-1.5">
                        {analysisResult.howToFix.stepByStepResolution.map((step, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2.5 rounded-lg bg-[#111] p-2.5 border border-white/5 text-xs text-white/80"
                          >
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold">
                              {idx + 1}
                            </span>
                            <span className="leading-relaxed mt-0.5">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Prevention & Best Practices */}
                  {analysisResult.howToFix.preventionBestPractices?.length > 0 && (
                    <div className="rounded-lg bg-[#111] p-3.5 border border-white/5 space-y-2 pt-3">
                      <div className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Prevention & Best Practices:</span>
                      </div>
                      <ul className="space-y-1 text-xs text-white/70">
                        {analysisResult.howToFix.preventionBestPractices.map((bp, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-emerald-400 mt-1">•</span>
                            <span className="leading-relaxed">{bp}</span>
                          </li>
                        ))}
                      </ul>

                      {analysisResult.howToFix.suggestedLintRuleOrFlag && (
                        <div className="pt-2 border-t border-white/5 text-[11px] font-mono text-white/50">
                          <span className="text-white/70 font-semibold">Recommended Config: </span>
                          <code className="text-emerald-300 bg-white/5 px-1.5 py-0.5 rounded">
                            {analysisResult.howToFix.suggestedLintRuleOrFlag}
                          </code>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Popular Error Presets Catalog Section */}
        <section className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <Code2 className="h-4 w-4 text-emerald-400" />
                <span>Common Error Catalog Across Languages</span>
              </h2>
              <p className="text-xs text-white/50">
                Click any preset to prefill the language, error signature, and buggy code sample.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {DEVFIX_PRESETS.map((preset) => {
              const lang = SUPPORTED_LANGUAGES.find((l) => l.id === preset.language);
              return (
                <button
                  key={preset.id}
                  onClick={() => {
                    handleSelectPreset(preset);
                    window.scrollTo({ top: 180, behavior: 'smooth' });
                  }}
                  className="text-left group rounded-xl border border-white/5 bg-[#111] p-3.5 hover:border-emerald-500/30 hover:bg-[#151515] transition space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] font-mono text-white/60 group-hover:text-emerald-400 transition">
                      {lang?.name || preset.language}
                    </span>
                    <span className="text-[10px] font-mono text-white/30 group-hover:text-white/60">
                      Try Fix →
                    </span>
                  </div>
                  <div className="text-xs font-mono font-medium text-white/90 group-hover:text-emerald-300 transition truncate">
                    {preset.errorCode}
                  </div>
                  <p className="text-[11px] text-white/50 line-clamp-2 leading-relaxed">
                    {preset.description}
                  </p>
                </button>
              );
            })}
          </div>
        </section>
      </main>

      {/* History Modal Drawer */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#0e0e0e] shadow-2xl p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Recent DevFix Diagnoses</h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={clearHistory}
                  className="flex items-center gap-1 text-[11px] text-white/40 hover:text-rose-400 transition"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Clear All</span>
                </button>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="rounded-lg p-1 text-white/40 hover:text-white hover:bg-white/5 transition"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {historyItems.length === 0 ? (
                <div className="py-8 text-center text-xs text-white/40">No recent diagnoses stored.</div>
              ) : (
                historyItems.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setAnalysisResult(item);
                      setSelectedLanguage(item.language.toLowerCase());
                      setErrorCode(item.errorCode);
                      setShowHistoryModal(false);
                      window.scrollTo({ top: 220, behavior: 'smooth' });
                    }}
                    className="cursor-pointer rounded-xl border border-white/5 bg-[#141414] p-3 hover:border-emerald-500/30 hover:bg-[#181818] transition space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-emerald-400 font-semibold truncate mr-2">
                        {item.errorCode}
                      </span>
                      <span className="rounded bg-white/5 px-2 py-0.5 text-[9px] font-mono text-white/50 shrink-0">
                        {item.language}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/60 line-clamp-1">{item.whatHappened.summary}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#0a0a0a] py-6 text-center text-xs text-white/40">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">DevFix</span>
            <span>—</span>
            <span>Intelligent Code Error Diagnostic & Repair Engine</span>
          </div>
          <div>
            <span>Integrated with RepoRescue Codebase Copilot</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
