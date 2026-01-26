'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Loader2, X, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { Article } from '@/types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatProps {
  articles: Article[];
}

export function AIChat({ articles }: AIChatProps) {
  const { user, getToken } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Only show for allowed users
  const allowedEmails = ['hillier.dave@gmail.com', 'dave@davehillier.com'];
  const isAllowed = user?.email && allowedEmails.includes(user.email.toLowerCase());

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isAllowed) return null;

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      const response = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: userMessage,
          articles: articles.map(a => ({
            title: a.title,
            description: a.description,
            category: a.category,
            source: a.source.name,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I couldn\'t process that. Please try again.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestedQuestions = [
    'What\'s the biggest tech story today?',
    'Any good news in finance?',
    'Summarise UK politics',
    'What should I know about sports?',
  ];

  return (
    <>
      {/* Chat toggle button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-40 flex items-center justify-center
                 w-14 h-14 rounded-full
                 bg-[var(--color-ink)] text-white shadow-lg
                 hover:bg-[var(--color-bronze-dark)] hover:shadow-xl hover:scale-105
                 transition-all duration-200"
        title="Ask about the news"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in sm:bg-transparent sm:backdrop-blur-none"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="fixed bottom-0 left-0 right-0 h-[80vh] sm:bottom-6 sm:left-6 sm:right-auto
                      sm:w-96 sm:h-[500px] sm:rounded-lg
                      bg-[var(--color-paper)] shadow-2xl flex flex-col
                      rounded-t-2xl sm:rounded-t-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-pearl)]
                          bg-gradient-to-r from-[var(--color-ink)] to-[var(--color-bronze-dark)]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[var(--color-bronze)]" />
                <span className="font-medium text-white">Ask Claude</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[var(--color-steel)] mb-4">
                    Ask me anything about today's news
                  </p>
                  <div className="space-y-2">
                    {suggestedQuestions.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => setInput(q)}
                        className="block w-full text-left px-4 py-2 rounded-lg
                                 bg-[var(--color-parchment)] text-sm text-[var(--color-steel)]
                                 hover:bg-[var(--color-bronze-muted)] hover:text-[var(--color-bronze-dark)]
                                 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm
                                ${msg.role === 'user'
                                  ? 'bg-[var(--color-bronze)] text-white rounded-br-sm'
                                  : 'bg-[var(--color-parchment)] text-[var(--color-ink)] rounded-bl-sm'
                                }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="flex justify-start">
                  <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-[var(--color-parchment)]">
                    <Loader2 className="w-5 h-5 text-[var(--color-bronze)] animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-[var(--color-pearl)] bg-[var(--color-paper)]">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about today's news..."
                  className="flex-1 px-4 py-2.5 rounded-full
                           bg-[var(--color-parchment)] border border-[var(--color-pearl)]
                           text-[var(--color-ink)] text-sm
                           placeholder:text-[var(--color-silver)]
                           focus:outline-none focus:border-[var(--color-bronze)]
                           transition-colors"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading}
                  className="flex items-center justify-center w-10 h-10 rounded-full
                           bg-[var(--color-bronze)] text-white
                           hover:bg-[var(--color-bronze-dark)]
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
