'use client';

import { useState, FormEvent, ChangeEvent, useRef, useEffect } from 'react';
import { Send, Bot } from 'lucide-react';
import { motion } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
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

      if (!response.body) throw new Error('Response body is empty.');
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantResponse = '';
      const assistantMessageId = (Date.now() + 1).toString();

      setIsLoading(false);
      setMessages((prev) => [...prev, { id: assistantMessageId, role: 'assistant', content: '' }]);
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        assistantResponse += decoder.decode(value);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId ? { ...msg, content: assistantResponse } : msg
          )
        );
      }
    } catch (error) {
      console.error('Error fetching chat response:', error);
      setMessages((prev) => [...prev, { id: 'error', role: 'assistant', content: 'The Oracle is silent... An error occurred.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-start gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
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
            placeholder="Consult the Bot..."
            onChange={handleInputChange}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="p-3 w-12 h-12 bg-gold text-background rounded-lg hover:bg-gold/80 disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            disabled={isLoading}
          >
            <Send className="h-6 w-6" />
          </motion.button>
        </form>
      </div>
    </div>
  );
}