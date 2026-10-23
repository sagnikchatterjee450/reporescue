import React, { useState } from 'react';
import { RepoModel } from '../types';
import {
  generateOnboardingMarkdown,
  downloadMarkdownFile,
} from '../utils/markdownExporter';
import {
  Download,
  Share2,
  Copy,
  Check,
  FileText,
  Code2,
  ExternalLink,
} from 'lucide-react';

interface ExportAndShareProps {
  model: RepoModel;
}

export const ExportAndShare: React.FC<ExportAndShareProps> = ({ model }) => {
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const markdownContent = generateOnboardingMarkdown(model);

  const handleDownload = () => {
    downloadMarkdownFile(markdownContent, `ONBOARDING-${model.repoName}.md`);
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Buttons */}
      <div className="rounded-xl border border-white/10 bg-[#111] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Download className="h-5 w-5 text-emerald-400" />
              <span>Export & Share Onboarding Guide</span>
            </h1>
            <p className="text-xs text-white/60">
              Download a complete, production-ready ONBOARDING.md for team wikis or share a direct link.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-black hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20"
            >
              <Download className="h-4 w-4" />
              <span>Download ONBOARDING.md</span>
            </button>

            <button
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#0a0a0a] px-3 py-2 text-xs font-semibold text-white/80 hover:text-white hover:border-white/20 transition"
            >
              {copiedMd ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedMd ? 'Copied' : 'Copy Markdown'}</span>
            </button>

            <button
              onClick={handleCopyShareLink}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#0a0a0a] px-3 py-2 text-xs font-semibold text-white/80 hover:text-white hover:border-white/20 transition"
            >
              {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
              <span>{copiedLink ? 'Link Copied' : 'Share Link'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Markdown Preview */}
      <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3 text-xs text-white/60">
          <span className="font-mono flex items-center gap-2 text-emerald-400">
            <FileText className="h-4 w-4" />
            <span>Generated Document Preview (ONBOARDING.md)</span>
          </span>
          <span className="text-[10px] text-white/40 font-mono">
            {markdownContent.length} characters
          </span>
        </div>

        <pre className="font-mono text-xs text-gray-300 bg-[#050505] p-5 rounded-lg border border-white/5 overflow-x-auto max-h-[560px] whitespace-pre-wrap leading-relaxed">
          {markdownContent}
        </pre>
      </div>
    </div>
  );
};
