'use client';

import { useState, FormEvent, ChangeEvent, useRef, useEffect } from 'react';
import { Send, Bot } from 'lucide-react';
import { motion } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: any[];
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setInput('');

    try {
      const response = await fetch('http://localhost:3001/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) {
        throw new Error('Failed to get a response from the server.');
      }
      
      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer,
        sources: data.sources,
      };

      setMessages((prev) => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error fetching chat response:', error);
      setMessages((prev) => [...prev, { id: 'error', role: 'assistant', content: 'The Oracle is silent... An error occurred.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col items-start gap-3 ${m.role === 'user' ? 'items-end' : ''}`}
          >
            <div className={`flex items-start gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {m.role === 'assistant' && (
                <div className="w-8 h-8 flex-shrink-0 rounded-full bg-black/30 border border-gold/50 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-gold" />
                </div>
              )}
              <div
                className={`max-w-xl px-4 py-3 rounded-xl whitespace-pre-wrap shadow-lg shadow-black/30 ${
                  m.role === 'user'
                    ? 'bg-gold/20 text-slate-100 rounded-br-none border border-gold/30'
                    : 'bg-black/30 text-slate-300 rounded-bl-none border border-slate-400/20'
                }`}
              >
                {m.content}
              </div>
            </div>

            {/* Source Citation Display */}
            {m.role === 'assistant' && m.sources && m.sources.length > 0 && (
              <div className={`flex flex-wrap gap-2 self-start ${m.role === 'user' ? 'self-end' : 'ml-12'}`}>
                <p className="text-xs text-slate-400 w-full mb-1">Sources:</p>
                {m.sources.map((source, index) => (
                  <div key={index} className="bg-black/30 border border-slate-600 rounded-lg p-2 text-xs text-slate-400 max-w-xs transition-all hover:border-gold/50 cursor-pointer">
                    <p className="font-semibold text-gold mb-1">
                      Page {source.metadata.loc?.pageNumber || 'N/A'}
                    </p>
                    <p className="truncate">
                      {source.pageContent}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-4"
          >
            <div className="w-8 h-8 flex-shrink-0 rounded-full bg-black/30 border border-gold/50 flex items-center justify-center">
              <Bot className="h-5 w-5 text-gold animate-pulse" />
            </div>
            <div className="max-w-lg px-4 py-3 rounded-xl bg-black/30 border border-slate-400/20 w-full">
              <div className="space-y-2">
                <div className="h-3 w-48 bg-slate-600/50 rounded-full animate-pulse"></div>
                <div className="h-3 w-64 bg-slate-600/50 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                <div className="h-3 w-56 bg-slate-600/50 rounded-full animate-pulse [animation-delay:0.4s]"></div>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gold/20">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <input
            className="flex-1 p-3 bg-black/30 border border-slate-400/30 rounded-lg text-slate-100 placeholder:text-slate-500
                       focus:ring-2 focus:ring-gold focus:outline-none transition-shadow"
            value={input}
            placeholder="Consult the Oracle..."
            onChange={handleInputChange}
            disabled={isLoading}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="p-3 w-12 h-12 bg-gold text-background rounded-lg hover:bg-gold/80 disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            disabled={!input || isLoading}
          >
            <Send className="h-6 w-6" />
          </motion.button>
        </form>
      </div>
    </div>
  );
}