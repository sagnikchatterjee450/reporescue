import React, { useState, useEffect } from 'react';
import { RepoModel, TourStep } from '../types';
import { TUTOR_CONFIG } from '../config';
import { fetchOrAnalyzeTutorRepo } from '../services/tutorApi';
import { TASKFLOW_TUTOR_MODEL } from '../data/taskflowTutorDemo';

import { TutorOverview } from './TutorOverview';
import { ArchitectureDiagrams } from './ArchitectureDiagrams';
import { GuidedTour } from './GuidedTour';
import { CodeExplainer } from './CodeExplainer';
import { RepoChat } from './RepoChat';
import { SetupCoach } from './SetupCoach';
import { FirstContributionFinder } from './FirstContributionFinder';
import { LearnAndVerify } from './LearnAndVerify';
import { WhatsChanged } from './WhatsChanged';
import { GlossaryAndConventions } from './GlossaryAndConventions';
import { ExportAndShare } from './ExportAndShare';
import { TutorCompare } from './TutorCompare';

import {
  Compass,
  Layers,
  FileCode2,
  MessageSquare,
  Terminal,
  Code2,
  HelpCircle,
  GitPullRequest,
  BookMarked,
  Download,
  ArrowRightLeft,
  ArrowLeft,
  Github,
  Key,
  Cpu,
  Sparkles,
  Search,
  CheckCircle2,
} from 'lucide-react';

interface TutorPageProps {
  initialRepoUrl?: string;
  onBackToRepoRescue: () => void;
  onRescueFile?: (filePath: string) => void;
  preloadedModel?: RepoModel | null;
}

export const TutorPage: React.FC<TutorPageProps> = ({
  initialRepoUrl,
  onBackToRepoRescue,
  onRescueFile,
  preloadedModel,
}) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [model, setModel] = useState<RepoModel>(preloadedModel || TASKFLOW_TUTOR_MODEL);
  const [inputUrl, setInputUrl] = useState(initialRepoUrl || model.repoUrl);
  const [githubToken, setGithubToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [useLocalOllama, setUseLocalOllama] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progressStep, setProgressStep] = useState('');
  const [selectedFileForExplainer, setSelectedFileForExplainer] = useState<string>('src/index.ts');

  // Handle URL syncing for /tutor or /tutor/:owner/:repo
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.startsWith('/tutor/')) {
        const parts = path.replace('/tutor/', '').split('/');
        if (parts.length >= 2) {
          const owner = parts[0];
          const repo = parts[1];
          const url = `https://github.com/${owner}/${repo}`;
          setInputUrl(url);
          loadRepo(url);
        }
      }
    }
  }, []);

  const loadRepo = async (url: string) => {
    if (!url.trim()) return;
    setIsLoading(true);
    setProgressStep('Connecting to repository...');

    try {
      const loadedModel = await fetchOrAnalyzeTutorRepo({
        repoUrl: url.trim(),
        githubToken: githubToken || undefined,
        useLocalOllama,
        onProgress: (step) => setProgressStep(step),
      });

      setModel(loadedModel);
      setActiveTab('overview');

      // Update URL to /tutor/:owner/:repo if valid
      if (typeof window !== 'undefined' && loadedModel.owner && loadedModel.repoName) {
        window.history.pushState(
          {},
          '',
          `/tutor/${loadedModel.owner}/${loadedModel.repoName}`
        );
      }
    } catch (err) {
      console.error('Failed to load repo:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadRepo(inputUrl);
  };

  const handleSelectFile = (filePath: string) => {
    setSelectedFileForExplainer(filePath);
    setActiveTab('code');
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Compass },
    { id: 'diagrams', label: 'Architecture', icon: Layers },
    { id: 'tour', label: 'Guided Tour', icon: Compass, badge: `${model.guidedTour?.length || 8} Steps` },
    { id: 'code', label: 'Code Explainer', icon: FileCode2 },
    { id: 'chat', label: 'Chat with Repo', icon: MessageSquare, badge: 'Guarded' },
    { id: 'setup', label: 'Setup Coach', icon: Terminal },
    { id: 'contribute', label: 'First Issue', icon: Code2 },
    { id: 'verify', label: 'Learn & Verify', icon: HelpCircle },
    { id: 'changes', label: "What's Changed", icon: GitPullRequest },
    { id: 'glossary', label: 'Glossary', icon: BookMarked },
    { id: 'export', label: 'Export Guide', icon: Download },
    { id: 'compare', label: 'Compare', icon: ArrowRightLeft },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-gray-300 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0a0a0a]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
          {/* Brand & Back Button */}
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToRepoRescue}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#111] px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white transition shadow-sm"
              title="Return to RepoRescue dashboard"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to RepoRescue</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500 text-black font-extrabold text-xs shadow-md shadow-emerald-500/10">
                T
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-base font-bold text-white tracking-tight">RepoTutor</span>
                <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider font-semibold text-emerald-400 border border-emerald-500/20">
                  Onboarding Copilot
                </span>
              </div>
            </div>
          </div>

          {/* Center Repo Input Form */}
          <form onSubmit={handleSubmit} className="hidden md:flex items-center gap-2 flex-1 max-w-lg">
            <div className="relative w-full">
              <Github className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="Enter GitHub URL (e.g. https://github.com/facebook/react)"
                className="w-full rounded-lg border border-white/10 bg-[#111] py-1.5 pl-8 pr-3 text-xs text-gray-200 placeholder-white/30 transition focus:border-emerald-500 focus:outline-none font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-lg bg-emerald-500 text-black px-3.5 py-1.5 text-xs font-bold hover:bg-emerald-400 transition shadow-sm shrink-0 disabled:opacity-40"
            >
              {isLoading ? 'Ingesting...' : 'Ingest'}
            </button>
          </form>

          {/* Right Controls: Token, Local Mode, Repo Badge */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTokenInput(!showTokenInput)}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition ${
                githubToken
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                  : 'border-white/10 bg-[#111] text-white/60 hover:text-white'
              }`}
              title="Private Repository GitHub Token"
            >
              <Key className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">{githubToken ? 'Token Attached' : 'Private Repo Token'}</span>
            </button>

            <button
              onClick={() => setUseLocalOllama(!useLocalOllama)}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition ${
                useLocalOllama
                  ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300'
                  : 'border-white/10 bg-[#111] text-white/60 hover:text-white'
              }`}
              title="Toggle Fully Local Mode (Ollama localhost:11434)"
            >
              <Cpu className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">{useLocalOllama ? 'Local Mode Active' : 'Local Ollama'}</span>
            </button>
          </div>
        </div>

        {/* Optional Private Token Popup */}
        {showTokenInput && (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2 bg-[#050505] border-t border-white/5 flex items-center gap-3">
            <span className="text-xs text-white/60 font-mono">GitHub PAT (kept in-memory only):</span>
            <input
              type="password"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              className="flex-1 max-w-md rounded border border-white/10 bg-[#111] px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={() => setShowTokenInput(false)}
              className="text-xs text-emerald-400 hover:underline"
            >
              Save in Memory
            </button>
          </div>
        )}
      </header>

      {/* Navigation Sub-Tabs */}
      <nav className="border-b border-white/10 bg-[#0a0a0a]/50 sticky top-16 z-30 overflow-x-auto">
        <div className="mx-auto max-w-7xl flex items-center px-4 sm:px-6 lg:px-8 gap-1 py-1.5 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm font-semibold'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-emerald-400' : 'text-white/40'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="rounded bg-white/5 px-1.5 py-0.2 text-[9px] font-mono text-white/50 border border-white/5">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        {isLoading ? (
          <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-12 text-center space-y-4 max-w-md mx-auto my-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">Ingesting Repository</h3>
              <p className="text-xs text-white/60 font-mono">{progressStep}</p>
            </div>
          </div>
        ) : (
          <div>
            {activeTab === 'overview' && (
              <TutorOverview
                model={model}
                onSelectTab={setActiveTab}
                onRescueRepo={onBackToRepoRescue}
              />
            )}
            {activeTab === 'diagrams' && (
              <ArchitectureDiagrams
                model={model}
                onSelectFile={handleSelectFile}
                onRescueFile={onRescueFile}
              />
            )}
            {activeTab === 'tour' && (
              <GuidedTour
                model={model}
                onSelectFile={handleSelectFile}
              />
            )}
            {activeTab === 'code' && (
              <CodeExplainer
                model={model}
                initialFilePath={selectedFileForExplainer}
                onRescueFile={onRescueFile}
                onSelectFile={handleSelectFile}
              />
            )}
            {activeTab === 'chat' && (
              <RepoChat
                model={model}
                onSelectFile={handleSelectFile}
              />
            )}
            {activeTab === 'setup' && <SetupCoach model={model} />}
            {activeTab === 'contribute' && (
              <FirstContributionFinder
                model={model}
                onSelectFile={handleSelectFile}
                onRescueFile={onRescueFile}
              />
            )}
            {activeTab === 'verify' && <LearnAndVerify model={model} />}
            {activeTab === 'changes' && <WhatsChanged model={model} />}
            {activeTab === 'glossary' && <GlossaryAndConventions model={model} />}
            {activeTab === 'export' && <ExportAndShare model={model} />}
            {activeTab === 'compare' && <TutorCompare currentModel={model} />}
          </div>
        )}
      </main>
    </div>
  );
};
