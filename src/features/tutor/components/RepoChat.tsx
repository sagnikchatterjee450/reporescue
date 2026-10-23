import React, { useState, useRef, useEffect } from 'react';
import { RepoModel, TutorChatMessage } from '../types';
import { askTutorAI } from '../services/tutorApi';
import {
  MessageSquare,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileCode2,
  Trash2,
  CornerDownLeft,
  Bot,
  User,
} from 'lucide-react';

interface RepoChatProps {
  model: RepoModel;
  onSelectFile?: (filePath: string) => void;
}

export const RepoChat: React.FC<RepoChatProps> = ({ model, onSelectFile }) => {
  // Collect all file paths for the Citation Guard
  const allKnownFilePaths = [
    ...model.entryPoints.map((e) => e.file),
    ...model.modules.flatMap((m) => m.keyFiles),
    'package.json',
    'README.md',
    'tsconfig.json',
    '.env.example',
  ];

  const [messages, setMessages] = useState<TutorChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: `Hello! I am your Tutor Onboarding Copilot for **${model.repoName}**. Ask me anything about how the architecture operates, where specific workflows are implemented, or how data flows through the system. Every answer includes citations to real files in the repository.`,
      timestamp: 'Just now',
      citations: [
        {
          filePath: model.entryPoints[0]?.file || 'src/index.ts',
          isVerified: true,
        },
      ],
    },
  ]);

  const [inputQuestion, setInputQuestion] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    `How does the primary entry point initialize services in ${model.repoName}?`,
    `What are the known architectural gotchas or concurrency pitfalls?`,
    `Explain the end-to-end data flow when a request or job is processed.`,
    `Which files should I inspect first to understand the data model?`,
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (questionText: string) => {
    const q = questionText.trim();
    if (!q || isTyping) return;

    const userMsg: TutorChatMessage = {
      id: `user-msg-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citations: [],
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setIsTyping(true);

    try {
      const response = await askTutorAI(model, q, messages, allKnownFilePaths);
      setMessages((prev) => [...prev, response]);
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'assistant',
        text: `Chat history cleared. How can I help you explore ${model.repoName}?`,
        timestamp: 'Just now',
        citations: [],
      },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-white/10 bg-[#111] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-emerald-400" />
            <span>Chat With {model.repoName}</span>
          </h1>
          <p className="text-xs text-white/60">
            Ask architectural questions. Every claim cites exact verified repository file paths with citation guard protection.
          </p>
        </div>

        <button
          onClick={handleClearChat}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#0a0a0a] px-3 py-1.5 text-xs text-white/60 hover:text-white hover:border-white/20 transition self-start sm:self-auto"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Clear History</span>
        </button>
      </div>

      {/* Suggested Starter Questions */}
      <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-4 space-y-2">
        <span className="text-[11px] font-semibold text-white/60 font-mono">Suggested Questions:</span>
        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((sq, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(sq)}
              className="rounded-lg border border-white/5 bg-[#111] px-3 py-1.5 text-xs text-white/80 hover:border-emerald-500/30 hover:text-emerald-400 transition text-left"
            >
              {sq}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Thread Container */}
      <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-4 sm:p-6 min-h-[460px] max-h-[580px] overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                  isUser
                    ? 'bg-emerald-500 text-black'
                    : 'bg-white/10 text-emerald-400 border border-white/10'
                }`}
              >
                {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-xl p-4 text-xs space-y-2.5 ${
                  isUser
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-white'
                    : 'bg-[#111] border border-white/10 text-gray-200'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-white/40 pb-1">
                  <span className="font-semibold">{isUser ? 'You' : 'RepoTutor Copilot'}</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div className="whitespace-pre-wrap leading-relaxed">
                  {msg.text}
                </div>

                {/* Citation Guard Chips */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="pt-2 border-t border-white/5 space-y-1.5">
                    <div className="text-[10px] font-semibold text-white/50 font-mono">
                      Referenced File Citations:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.citations.map((c, cIdx) => (
                        <button
                          key={cIdx}
                          onClick={() => onSelectFile && onSelectFile(c.filePath)}
                          className={`flex items-center gap-1.5 rounded px-2 py-0.5 text-[11px] font-mono transition border ${
                            c.isVerified
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                          }`}
                          title={c.isVerified ? 'Verified in repo tree' : 'Unverified path'}
                        >
                          <FileCode2 className="h-3 w-3" />
                          <span>{c.filePath}{c.lines ? `:${c.lines}` : ''}</span>
                          {c.isVerified ? (
                            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <span className="text-[9px] text-amber-400 font-sans">(unverified)</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 text-emerald-400 border border-white/10 text-xs">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-xl bg-[#111] border border-white/10 p-3.5 text-xs text-white/50 flex items-center gap-2">
              <div className="inline-block animate-spin rounded-full h-3.5 w-3.5 border-2 border-emerald-500 border-t-transparent" />
              <span>Analyzing code and verifying citations...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(inputQuestion);
        }}
        className="relative"
      >
        <input
          type="text"
          value={inputQuestion}
          onChange={(e) => setInputQuestion(e.target.value)}
          placeholder={`Ask anything about ${model.repoName}... (e.g. "Where is task retry backoff implemented?")`}
          className="w-full rounded-xl border border-white/10 bg-[#111] p-4 pr-24 text-xs sm:text-sm text-white placeholder-white/40 focus:border-emerald-500 focus:outline-none transition shadow-lg"
        />

        <button
          type="submit"
          disabled={!inputQuestion.trim() || isTyping}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg bg-emerald-500 px-3.5 py-2 text-xs font-bold text-black hover:bg-emerald-400 transition disabled:opacity-30 shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
        >
          <span>Ask</span>
          <CornerDownLeft className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
};
