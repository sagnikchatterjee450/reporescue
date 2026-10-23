import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  ArrowRight,
  Github,
  Network,
  Zap,
  Code2,
  FileCode2,
  MessageSquare,
  Activity,
  CheckCircle2,
  GitBranch,
  Layers,
  BookOpenCheck,
  ShieldCheck,
  Star,
  Users,
  Wrench,
} from 'lucide-react';

interface LandingPageProps {
  onAnalyze: (url: string) => void;
  onTryDemo: () => void;
  onOpenDevFix?: () => void;
  onOpenTutor?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onAnalyze, onTryDemo, onOpenDevFix, onOpenTutor }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onAnalyze(url.trim());
    }
  };

  const sampleRepos = [
    { name: 'facebook/react', url: 'https://github.com/facebook/react' },
    { name: 'expressjs/express', url: 'https://github.com/expressjs/express' },
    { name: 'open-source/taskflow', url: 'https://github.com/open-source/taskflow' },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-gray-300 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Background ambient subtle glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[140px]" />
        <div className="absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full bg-emerald-500/5 blur-[160px]" />
      </div>

      <div className="relative z-10">
        {/* HERO SECTION */}
        <section className="mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1 text-[11px] font-mono uppercase tracking-wider text-emerald-400 mb-8">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>AI Onboarding Copilot for Open Source</span>
          </div>

          {/* Headline */}
          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl leading-[1.1]">
            Understand any codebase.{' '}
            <span className="text-emerald-400">
              Start contributing in minutes.
            </span>
          </h1>

          {/* Subheading */}
          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-white/60 leading-relaxed">
            AI-powered repository analysis that turns complex, unfamiliar codebases into clear,
            interactive architecture maps and guided contribution paths.
          </p>

          {/* URL Input Form */}
          <div className="mx-auto mt-10 max-w-2xl">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row items-center gap-2 rounded-xl border border-white/10 bg-[#111] p-2 shadow-2xl backdrop-blur-xl transition focus-within:border-emerald-500/50"
            >
              <div className="flex w-full items-center gap-3 px-3 py-2">
                <Github className="h-5 w-5 text-white/40 shrink-0" />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://github.com/user/project"
                  className="w-full bg-transparent text-sm text-white placeholder-white/30 focus:outline-none font-mono"
                />
              </div>
              <div className="flex w-full sm:w-auto items-center gap-2 shrink-0">
                <button
                  type="submit"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-bold text-black shadow-lg shadow-emerald-500/10 hover:bg-emerald-400 transition active:scale-95"
                >
                  <span>Analyze Repository</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={onTryDemo}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/10 transition active:scale-95"
                >
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  <span>Try Demo</span>
                </button>
              </div>
            </form>

            {/* Quick Sample Links */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-white/40">
              <span className="font-mono text-[11px] uppercase tracking-wider text-white/30">Popular repos:</span>
              {sampleRepos.map((sample) => (
                <button
                  key={sample.name}
                  onClick={() => onAnalyze(sample.url)}
                  className="rounded-md border border-white/10 bg-[#111] px-2.5 py-1 text-xs text-white/70 hover:border-emerald-500/30 hover:text-emerald-400 transition font-mono"
                >
                  {sample.name}
                </button>
              ))}
            </div>

            {/* Tutor Feature Spotlight Banner */}
            {onOpenTutor && (
              <div className="mt-8 mx-auto max-w-2xl rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-left flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl shadow-emerald-500/5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20">
                    <Compass className="h-5 w-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">New: Tutor Onboarding Experience</span>
                      <span className="rounded bg-emerald-400/20 px-1.5 py-0.5 text-[9px] font-mono font-semibold text-emerald-300 uppercase">
                        Feature
                      </span>
                    </div>
                    <p className="text-xs text-white/60 mt-0.5">
                      Turn any GitHub repository into an interactive onboarding guide with Mermaid diagrams, guided tours, citation-guarded Q&A, and setup coaching.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenTutor()}
                  className="shrink-0 flex items-center gap-1.5 rounded-lg bg-emerald-400 px-4 py-2 text-xs font-bold text-black hover:bg-emerald-300 transition shadow-sm cursor-pointer"
                >
                  <span>Launch Tutor</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* DevFix Feature Spotlight Banner */}
            {onOpenDevFix && (
              <div className="mt-4 mx-auto max-w-2xl rounded-xl border border-white/10 bg-[#111] p-4 text-left flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white font-bold border border-white/10">
                    <Wrench className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">DevFix — Standalone Error Diagnostic Tool</span>
                    </div>
                    <p className="text-xs text-white/60 mt-0.5">
                      Hit a confusing compiler error or runtime exception? Select your language, paste your code, and DevFix diagnoses and repairs it.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onOpenDevFix}
                  className="shrink-0 flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#0a0a0a] px-4 py-2 text-xs font-semibold text-white/80 hover:text-white hover:border-white/20 transition cursor-pointer"
                >
                  <span>Launch DevFix</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* ANIMATED TRANSFORMATION VISUALIZATION */}
          <div className="mx-auto mt-16 max-w-5xl rounded-xl border border-white/10 bg-[#111] p-4 sm:p-8 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2 text-xs font-mono text-white/60">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>RepoRescue Architecture Transformation Engine</span>
              </div>
              <span className="text-xs text-emerald-400 font-mono">Raw Code → Interactive Graph</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Left: Complex Repo File Tree */}
              <div className="rounded-lg border border-white/10 bg-[#0a0a0a] p-4 text-left font-mono text-xs space-y-2 text-white/60 overflow-hidden shadow-inner">
                <div className="text-white/40 pb-1 border-b border-white/5 flex justify-between">
                  <span>📁 github.com/user/project</span>
                  <span>142 files</span>
                </div>
                <div className="space-y-1 text-gray-300 text-[11px] opacity-80">
                  <p className="text-emerald-400 font-semibold">├── src/app.ts (Entry Point)</p>
                  <p>├── src/controllers/authController.ts</p>
                  <p>├── src/services/dbConnection.ts</p>
                  <p>├── src/components/DashboardCanvas.tsx</p>
                  <p>├── server/routes/apiRouter.ts</p>
                  <p>├── server/middleware/jwtValidator.ts</p>
                  <p className="text-white/30">└── ... 136 more unorganized files</p>
                </div>
                <div className="mt-3 text-[10px] font-mono text-amber-400 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                  ⚠️ "Where do I start? Which files handle authentication?"
                </div>
              </div>

              {/* Right: AI Transformed Graph */}
              <div className="rounded-lg border border-emerald-500/20 bg-[#0a0a0a] p-4 text-left relative overflow-hidden shadow-lg shadow-emerald-500/5">
                <div className="text-xs font-semibold text-emerald-400 mb-3 flex items-center gap-2 font-mono">
                  <Network className="h-4 w-4" />
                  <span>RepoRescue Interactive Map</span>
                </div>

                <div className="space-y-3 relative">
                  {/* Nodes diagram mock */}
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 rounded-lg border border-white/10 bg-[#111] text-white">
                      <span className="font-bold block">Frontend SPA</span>
                      <span className="text-[10px] text-emerald-400 font-mono">React 19 & Vite</span>
                    </div>
                    <div className="p-2.5 rounded-lg border border-white/10 bg-[#111] text-white">
                      <span className="font-bold block">Express Server</span>
                      <span className="text-[10px] text-indigo-400 font-mono">REST Router</span>
                    </div>
                    <div className="p-2.5 rounded-lg border border-white/10 bg-[#111] text-white">
                      <span className="font-bold block">JWT Auth Middleware</span>
                      <span className="text-[10px] text-teal-400 font-mono">bcrypt & tokens</span>
                    </div>
                    <div className="p-2.5 rounded-lg border border-white/10 bg-[#111] text-white">
                      <span className="font-bold block">PostgreSQL Database</span>
                      <span className="text-[10px] text-purple-400 font-mono">Drizzle ORM</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20 text-emerald-400 font-medium">
                    <span className="flex items-center gap-1.5 font-mono">
                      <Zap className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Start Here Path Generated</span>
                    </span>
                    <span className="text-[10px] font-mono bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-300">
                      4 Steps
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 border-t border-white/10">
          <div className="text-center mb-16">
            <h2 className="text-xs font-mono uppercase tracking-widest text-emerald-400">
              How RepoRescue Works
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              From zero context to first pull request in 4 steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Enter Repository URL',
                desc: 'Provide any public GitHub repository URL or choose a built-in demo repository.',
                icon: Github,
              },
              {
                step: '02',
                title: 'AI Codebase Mapping',
                desc: 'RepoRescue analyzes README, tree architecture, dependencies, frameworks, and issues.',
                icon: Layers,
              },
              {
                step: '03',
                title: 'Explore "Start Here" Path',
                desc: 'Follow the AI-recommended step-by-step learning sequence explaining essential entry files.',
                icon: Zap,
              },
              {
                step: '04',
                title: 'Find & Start Contribution',
                desc: 'Select beginner-friendly issues, inspect file flows, and ask the AI assistant questions.',
                icon: Code2,
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="rounded-xl border border-white/10 bg-[#111] p-6 relative hover:border-emerald-500/30 transition"
                >
                  <span className="text-3xl font-mono font-extrabold text-white/20 block mb-4">
                    {item.step}
                  </span>
                  <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-white/60 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* KEY FEATURES GRID */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 border-t border-white/10">
          <div className="text-center mb-16">
            <h2 className="text-xs font-mono uppercase tracking-widest text-emerald-400">
              Core Capabilities
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Everything you need to navigate open-source projects
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Interactive Architecture Map',
                desc: 'Visual node graphs mapping Frontend, Backend, Auth, Database, and Services with clickable node details.',
                icon: Network,
                color: 'text-cyan-400',
              },
              {
                title: '"Start Here" Learning Path',
                desc: 'A signature AI recommended reading list answering "Where do I start?" with rationale for every file.',
                icon: Zap,
                color: 'text-emerald-400',
              },
              {
                title: 'AI Contribution Opportunities',
                desc: 'Analyzes GitHub issues and categorizes tasks into Beginner 🟢, Intermediate 🟡, and Advanced 🔴.',
                icon: Code2,
                color: 'text-teal-400',
              },
              {
                title: 'AI Code & Flow Explainer',
                desc: 'Generates beginner-friendly explanations and Inputs → Processing → Outputs visual flow diagrams.',
                icon: FileCode2,
                color: 'text-indigo-400',
              },
              {
                title: 'Ask RepoRescue AI Chat',
                desc: 'Persistent AI assistant trained on analyzed repository context. Answers questions citing exact files.',
                icon: MessageSquare,
                color: 'text-purple-400',
              },
              {
                title: 'Repository Health Dashboard',
                desc: 'Visual scorecard rating Architecture, Documentation, Testing, Code Organization, and Contributor Friendliness.',
                icon: Activity,
                color: 'text-rose-400',
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="rounded-xl border border-white/10 bg-[#111] p-6 hover:border-emerald-500/30 transition"
                >
                  <div className={`h-10 w-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-4 ${feature.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-xs text-white/60 leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* WHY REPORESCUE */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 border-t border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
                Why RepoRescue?
              </span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Stop spending days reading unorganized codebase files
              </h2>
              <p className="mt-4 text-sm text-white/60 leading-relaxed">
                Open-source maintainers struggle with onboarding new developers, while beginners get
                overwhelmed by complex file trees. RepoRescue bridges the gap with intelligent AI
                context extraction.
              </p>

              <div className="mt-8 space-y-4 text-xs">
                {[
                  'Accelerates developer onboarding from days to under 15 minutes',
                  'Reduces maintainer burden by pointing contributors to beginner-friendly tasks',
                  'Provides interactive visual maps instead of walls of code',
                  'Generates copyable README improvements to fix missing setup documentation',
                ].map((point, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-gray-200">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#111] p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-bold text-white">Repository Scorecard Preview</span>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  78/100 — Good
                </span>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-white/70 mb-1 font-mono">
                    <span>Architecture</span>
                    <span className="text-emerald-400">82%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[82%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-white/70 mb-1 font-mono">
                    <span>Code Organization</span>
                    <span className="text-cyan-400">87%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full bg-cyan-500 w-[87%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-white/70 mb-1 font-mono">
                    <span>Contributor Friendliness</span>
                    <span className="text-indigo-400">76%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full bg-indigo-500 w-[76%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DEVELOPER TESTIMONIALS */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 border-t border-white/10">
          <div className="text-center mb-16">
            <h2 className="text-xs font-mono uppercase tracking-widest text-emerald-400">
              Community Feedback
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Loved by open-source contributors & maintainers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote:
                  'RepoRescue allowed me to submit my very first open-source PR in a massive 20,000 line TypeScript repo within two hours!',
                author: 'Alex Chen',
                role: 'Frontend Developer',
              },
              {
                quote:
                  'The "Start Here" learning path is magical. It immediately told me which 4 files controlled authentication and data routing.',
                author: 'Maya Patel',
                role: 'Open Source Contributor',
              },
              {
                quote:
                  'As a maintainer, RepoRescue saves us hours answering repetitive questions. New contributors get up to speed instantly.',
                author: 'Marcus Vance',
                role: 'Maintainer @ OpenSource',
              },
            ].map((t, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-[#111] p-6 flex flex-col justify-between">
                <p className="text-xs text-white/70 leading-relaxed italic mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-md bg-emerald-500 text-black flex items-center justify-center font-bold text-xs">
                    {t.author[0]}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{t.author}</p>
                    <p className="text-[10px] text-white/40">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA FOOTER BANNER */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-emerald-500/30 bg-[#111] p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Ready to explore any open-source repository?
            </h2>
            <p className="mt-3 text-sm text-white/60 max-w-xl mx-auto">
              Analyze a public GitHub URL now or test drive with our built-in TaskFlow demo repo.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={onTryDemo}
                className="flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-3 text-sm font-bold text-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition"
              >
                <Sparkles className="h-4 w-4" />
                <span>Launch TaskFlow Demo</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
