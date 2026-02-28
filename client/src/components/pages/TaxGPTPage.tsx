import React, { useState, useRef, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Send, Bot, User, Sparkles, RefreshCw, BookOpen, Calculator, FileText, Shield } from 'lucide-react';
import { Streamdown } from 'streamdown';
import { nanoid } from 'nanoid';
import { FeatureGate } from '@/components/FeatureGate';

const QUICK_QUESTIONS = [
  { icon: Calculator, text: 'How do I calculate my quarterly taxes?' },
  { icon: FileText, text: 'What deductions can I claim as a gig worker?' },
  { icon: BookOpen, text: 'What is the self-employment tax rate?' },
  { icon: Shield, text: 'How do I handle an IRS audit notice?' },
];

function TaxGPTPageInner() {
  const [sessionId] = useState(() => nanoid());
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatMutation = trpc.taxgpt.chat.useMutation({
    onSuccess: (data) => {
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
    },
    onError: (err) => {
      toast.error('TaxGPT error: ' + err.message);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg = text.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    chatMutation.mutate({ message: userMsg, sessionId });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <FeatureGate feature="taxgpt_basic" fullPage upgradeMessage="TaxGPT AI is available on the Essential plan and above. Upgrade to get 24/7 AI tax answers.">
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-gray-900" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">TaxGPT</h1>
              <p className="text-gray-500 text-sm">Your AI tax assistant — available 24/7</p>
            </div>
          </div>
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse" />
            Online
          </Badge>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-gray-900" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Ask TaxGPT anything</h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Get instant answers about taxes, deductions, quarterly payments, crypto taxes, and more.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {QUICK_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q.text)}
                    className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-emerald-500/50 hover:bg-gray-100 transition-all text-left"
                  >
                    <q.icon className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span className="text-gray-600 text-sm">{q.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-lg flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-gray-900" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-emerald-500 text-gray-900 rounded-tr-sm'
                  : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'
              }`}>
                {msg.role === 'assistant' ? (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <Streamdown>{msg.content}</Streamdown>
                  </div>
                ) : (
                  <p className="text-sm">{msg.content}</p>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
              )}
            </div>
          ))}

          {chatMutation.isPending && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-lg flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-gray-900" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about taxes, deductions, quarterly payments..."
              className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-500 flex-1"
              disabled={chatMutation.isPending}
            />
            <Button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || chatMutation.isPending}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-gray-600 text-xs mt-2 text-center">
            TaxGPT provides general tax information. Consult a licensed tax professional for personalized advice.
          </p>
        </div>
      </div>
    </div>
    </FeatureGate>
  );
}

export default function TaxGPTPage() {
  return <TaxGPTPageInner />;
}
