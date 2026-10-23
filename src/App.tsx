import React, { useState, useEffect } from 'react';
import { RepoAnalysisData, ContributorMode } from './types';
import { TASKFLOW_DEMO_REPO } from './data/demoRepos';
import { fetchAndAnalyzeRepo } from './services/apiClient';

import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { CommandPalette } from './components/CommandPalette';
import { LandingPage } from './components/LandingPage';
import { AnalysisProgress } from './components/AnalysisProgress';

import { OverviewSection } from './components/OverviewSection';
import { RepoMapSection } from './components/RepoMapSection';
import { StartHereSection } from './components/StartHereSection';
import { ContributionFinderSection } from './components/ContributionFinderSection';
import { CodeExplorerSection } from './components/CodeExplorerSection';
import { ChatPanel } from './components/ChatPanel';
import { HealthDashboardSection } from './components/HealthDashboardSection';
import { ReadmeImprovementSection } from './components/ReadmeImprovementSection';
import { RepoComparisonSection } from './components/RepoComparisonSection';
import { SettingsModal } from './components/SettingsModal';
import { DevFixPage } from './components/DevFixPage';
import { TutorPage } from './features/tutor/components/TutorPage';

import { MessageSquare, Sparkles, X, Compass } from 'lucide-react';

export default function App() {
  const [currentRepo, setCurrentRepo] = useState<RepoAnalysisData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisProgressStep, setAnalysisProgressStep] = useState<string>('Repository Found ✓');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [contributorMode, setContributorMode] = useState<ContributorMode>('beginner');
  const [selectedFileForExplorer, setSelectedFileForExplorer] = useState<string>('README.md');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState<boolean>(false);

  // Dedicated DevFix webpage state
  const [isDevFixPage, setIsDevFixPage] = useState<boolean>(() => {
    return typeof window !== 'undefined' && window.location.pathname.startsWith('/devfix');
  });

  // Dedicated Tutor webpage state (/tutor or /tutor/:owner/:repo)
  const [isTutorPage, setIsTutorPage] = useState<boolean>(() => {
    return typeof window !== 'undefined' && window.location.pathname.startsWith('/tutor');
  });

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setIsDevFixPage(window.location.pathname.startsWith('/devfix'));
      setIsTutorPage(window.location.pathname.startsWith('/tutor'));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleOpenDevFix = () => {
    setIsDevFixPage(true);
    setIsTutorPage(false);
    if (window.location.pathname !== '/devfix') {
      window.history.pushState({}, '', '/devfix');
    }
  };

  const handleBackFromDevFix = () => {
    setIsDevFixPage(false);
    if (window.location.pathname === '/devfix') {
      window.history.pushState({}, '', '/');
    }
  };

  const handleOpenTutor = (repoUrl?: unknown) => {
    setIsTutorPage(true);
    setIsDevFixPage(false);
    const targetUrl = typeof repoUrl === 'string' ? repoUrl.trim() : currentRepo?.repoUrl;
    if (typeof targetUrl === 'string' && targetUrl) {
      const match = targetUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (match) {
        const owner = match[1];
        const repo = match[2].replace(/\.git$/, '');
        window.history.pushState({}, '', `/tutor/${owner}/${repo}`);
        return;
      }
      const slashMatch = targetUrl.match(/^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/);
      if (slashMatch) {
        const owner = slashMatch[1];
        const repo = slashMatch[2].replace(/\.git$/, '');
        window.history.pushState({}, '', `/tutor/${owner}/${repo}`);
        return;
      }
    }
    if (!window.location.pathname.startsWith('/tutor')) {
      window.history.pushState({}, '', '/tutor');
    }
  };

  const handleBackFromTutor = () => {
    setIsTutorPage(false);
    if (window.location.pathname.startsWith('/tutor')) {
      window.history.pushState({}, '', '/');
    }
  };

  const handleRescueFileFromTutor = (filePath: string) => {
    setIsTutorPage(false);
    setSelectedFileForExplorer(filePath);
    setActiveTab('code');
    if (window.location.pathname.startsWith('/tutor')) {
      window.history.pushState({}, '', '/');
    }
  };

  // Analyze new GitHub URL
  const handleAnalyzeUrl = async (url: string) => {
    setIsDevFixPage(false);
    setIsTutorPage(false);
    if (window.location.pathname === '/devfix' || window.location.pathname.startsWith('/tutor')) {
      window.history.pushState({}, '', '/');
    }
    setIsAnalyzing(true);
    setAnalysisProgressStep('Repository Found ✓');

    try {
      const repoData = await fetchAndAnalyzeRepo(url, (step) => {
        setAnalysisProgressStep(step);
      });
      setCurrentRepo(repoData);
      setActiveTab('overview');
    } catch (err) {
      console.error('Analysis error:', err);
      // Fallback to TaskFlow demo so user experience is never broken
      setCurrentRepo(TASKFLOW_DEMO_REPO);
      setActiveTab('overview');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Open built-in demo
  const handleOpenDemo = () => {
    setIsDevFixPage(false);
    if (window.location.pathname === '/devfix') {
      window.history.pushState({}, '', '/');
    }
    setCurrentRepo(TASKFLOW_DEMO_REPO);
    setActiveTab('overview');
  };

  // Jump to specific file in Code Explorer
  const handleSelectFile = (filePath: string) => {
    setSelectedFileForExplorer(filePath);
    setActiveTab('code');
  };

  // Ask AI quick question from Command Palette
  const handleAskAIFromPalette = (question: string) => {
    setActiveTab('chat');
  };

  // Go back to landing page
  const handleGoHome = () => {
    if (isDevFixPage) {
      handleBackFromDevFix();
    }
    setCurrentRepo(null);
  };

  const handleTabSelect = (tabId: string) => {
    if (tabId === 'devfix') {
      handleOpenDevFix();
    } else if (tabId === 'tutor') {
      handleOpenTutor();
    } else {
      setActiveTab(tabId);
    }
  };

  // Render main content section based on activeTab
  const renderMainContent = () => {
    if (!currentRepo) return null;

    switch (activeTab) {
      case 'overview':
        return (
          <OverviewSection
            repo={currentRepo}
            onSelectTab={handleTabSelect}
            contributorMode={contributorMode}
            onOpenTutor={() => handleOpenTutor(currentRepo.repoUrl)}
          />
        );
      case 'repomap':
        return <RepoMapSection repo={currentRepo} onSelectFile={handleSelectFile} />;
      case 'starthere':
        return <StartHereSection repo={currentRepo} onSelectFile={handleSelectFile} />;
      case 'contribute':
        return (
          <ContributionFinderSection repo={currentRepo} onSelectFile={handleSelectFile} />
        );
      case 'code':
        return (
          <CodeExplorerSection
            repo={currentRepo}
            initialFilePath={selectedFileForExplorer}
            onSelectFile={handleSelectFile}
          />
        );
      case 'chat':
        return <ChatPanel repo={currentRepo} onSelectFile={handleSelectFile} />;
      case 'health':
        return <HealthDashboardSection repo={currentRepo} />;
      case 'readme':
        return <ReadmeImprovementSection repo={currentRepo} />;
      case 'compare':
        return <RepoComparisonSection />;
      case 'settings':
        return (
          <SettingsModal
            contributorMode={contributorMode}
            onToggleContributorMode={setContributorMode}
          />
        );
      default:
        return (
          <OverviewSection
            repo={currentRepo}
            onSelectTab={handleTabSelect}
            contributorMode={contributorMode}
            onOpenTutor={() => handleOpenTutor(currentRepo.repoUrl)}
          />
        );
    }
  };

  // If user requested DevFix webpage (via /devfix URL, header, landing banner, or sidebar)
  if (isDevFixPage) {
    return <DevFixPage onBackToRepoRescue={handleBackFromDevFix} />;
  }

  // If user requested Tutor onboarding webpage (via /tutor URL, header, landing banner, or sidebar)
  if (isTutorPage) {
    return (
      <TutorPage
        initialRepoUrl={currentRepo?.repoUrl}
        onBackToRepoRescue={handleBackFromTutor}
        onRescueFile={handleRescueFileFromTutor}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-gray-300 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Navbar */}
      <Navbar
        currentRepo={currentRepo}
        onAnalyzeNewUrl={handleAnalyzeUrl}
        onOpenDemo={handleOpenDemo}
        contributorMode={contributorMode}
        onToggleContributorMode={setContributorMode}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onGoHome={handleGoHome}
        onOpenDevFix={handleOpenDevFix}
        onOpenTutor={() => handleOpenTutor()}
      />

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        repo={currentRepo}
        onSelectTab={handleTabSelect}
        onSelectFile={handleSelectFile}
        onAskAI={handleAskAIFromPalette}
        onOpenTutor={() => handleOpenTutor()}
      />

      {/* Conditional Rendering: Landing Page / Loading / Analyzed Dashboard */}
      {isAnalyzing ? (
        <AnalysisProgress
          currentStep={analysisProgressStep}
          repoUrl={currentRepo?.repoUrl || 'GitHub Repository'}
        />
      ) : !currentRepo ? (
        <LandingPage
          onAnalyze={handleAnalyzeUrl}
          onTryDemo={handleOpenDemo}
          onOpenDevFix={handleOpenDevFix}
          onOpenTutor={() => handleOpenTutor()}
        />
      ) : (
        /* DASHBOARD LAYOUT */
        <div className="flex mx-auto max-w-7xl">
          {/* Left Sidebar Navigation */}
          <Sidebar
            activeTab={activeTab}
            onSelectTab={handleTabSelect}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />

          {/* Main Content View Container */}
          <main className="flex-1 p-6 overflow-x-hidden min-w-0">
            <div className="max-w-6xl mx-auto space-y-6">{renderMainContent()}</div>
          </main>

          {/* Persistent Floating AI Chat Trigger Button (Bottom-Right) */}
          {activeTab !== 'chat' && (
            <div className="fixed bottom-6 right-6 z-40">
              <button
                onClick={() => setIsChatDrawerOpen(!isChatDrawerOpen)}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 text-xs font-bold text-slate-950 shadow-2xl hover:brightness-110 transition shadow-emerald-500/30 border border-emerald-400/40"
              >
                <Sparkles className="h-4 w-4" />
                <span>Ask RepoRescue AI</span>
              </button>
            </div>
          )}

          {/* Slide-over persistent AI Assistant Drawer */}
          {isChatDrawerOpen && currentRepo && (
            <ChatPanel
              repo={currentRepo}
              onSelectFile={handleSelectFile}
              isOpenAsModal={true}
              onCloseModal={() => setIsChatDrawerOpen(false)}
            />
          )}
        </div>
      )}
    </div>
  );
}
