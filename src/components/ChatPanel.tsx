import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User,
  FileCode,
  X,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { ChatMessage, RepoAnalysisData } from '../types';
import { askRepoRescueAI } from '../services/apiClient';

interface ChatPanelProps {
  repo: RepoAnalysisData;
  onSelectFile: (filePath: string) => void;
  isOpenAsModal?: boolean;
  onCloseModal?: () => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  repo,
  onSelectFile,
  isOpenAsModal,
  onCloseModal,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello! I am your AI Onboarding Assistant for **${repo.repoName}**.\n\nAsk me anything about the codebase architecture, file locations, or setup!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citedFiles: repo.startHerePath.map((s) => s.filePath),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const sampleQuestions = [
    'Where is authentication handled?',
    'How does the frontend communicate with the backend?',
    'Which files should I modify to add dark mode?',
    'Where should I add a payment system?',
    'Explain the database architecture.',
  ];

  const handleSend = async (questionText?: string) => {
    const textToSend = questionText || input;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!questionText) setInput('');
    setIsTyping(true);

    const aiRes = await askRepoRescueAI(textToSend, messages, repo);

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'ai',
      text: aiRes.text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citedFiles: aiRes.citedFiles,
    };

    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false);
  };

  const content = (
    <div className="flex flex-col h-full bg-[#111] border border-white/10 rounded-xl shadow-2xl overflow-hidden font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0a0a0a] border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5 font-mono uppercase tracking-wider">
              <span>Ask RepoRescue AI</span>
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            </h3>
            <p className="text-[10px] text-white/40 truncate max-w-[180px] font-mono">
              Trained on {repo.repoName}
            </p>
          </div>
        </div>

        {isOpenAsModal && onCloseModal && (
          <button
            onClick={onCloseModal}
            className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/5"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-3 py-2 bg-[#0a0a0a]/60 border-b border-white/10 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
        <span className="text-white/40 shrink-0 font-mono text-[10px] uppercase tracking-wider">
          Quick Ask:
        </span>
        {sampleQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="shrink-0 rounded-md border border-white/10 bg-[#111] px-2.5 py-1 text-white/70 hover:border-emerald-500/30 hover:text-emerald-400 transition font-mono text-[11px]"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-emerald-500 text-black'
                    : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                }`}
              >
                {isUser ? <User className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
              </div>

              <div
                className={`max-w-[85%] rounded-xl p-3.5 text-xs leading-relaxed space-y-2 ${
                  isUser
                    ? 'bg-emerald-500 text-black rounded-tr-none font-medium'
                    : 'bg-[#0a0a0a] border border-white/10 text-white/80 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Cited File Badges (Clicking opens code explorer!) */}
                {msg.citedFiles && msg.citedFiles.length > 0 && (
                  <div className="pt-2 border-t border-white/10 space-y-1">
                    <p className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                      Cited Code Files:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.citedFiles.map((file, fIdx) => (
                        <button
                          key={fIdx}
                          onClick={() => onSelectFile(file)}
                          className="flex items-center gap-1 rounded bg-[#111] px-2 py-1 text-[10px] font-mono text-emerald-300 border border-white/10 hover:border-emerald-500/30 transition"
                        >
                          <FileCode className="h-3 w-3 text-emerald-400" />
                          <span>{file}</span>
                          <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <span className={`block text-[9px] text-right font-mono ${isUser ? 'text-black/60' : 'text-white/30'}`}>{msg.timestamp}</span>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-white/40 font-mono italic">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-spin" />
            <span>RepoRescue AI is analyzing repository context...</span>
          </div>
        )}
      </div>

      {/* Input Footer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-[#0a0a0a] border-t border-white/10 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about files, auth, backend, or setup..."
          className="flex-1 rounded-lg border border-white/10 bg-[#111] px-3 py-2 text-xs text-gray-200 placeholder-white/30 focus:outline-none focus:border-emerald-500 font-mono"
        />
        <button
          type="submit"
          className="rounded-lg bg-emerald-500 p-2 text-black hover:bg-emerald-400 transition shadow-md"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );

  if (isOpenAsModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div className="w-full max-w-xl h-[80vh]">{content}</div>
      </div>
    );
  }

  return <div className="h-[600px]">{content}</div>;
};
