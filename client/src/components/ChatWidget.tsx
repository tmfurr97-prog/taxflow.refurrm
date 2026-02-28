import React, { useState, useRef, useEffect, useCallback } from 'react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: Date;
}

interface QuickReply {
  label: string;
  category: string;
}

const QUICK_REPLIES: QuickReply[] = [
  { label: 'Pricing & Plans', category: 'pricing' },
  { label: 'Filing Status Help', category: 'filing' },
  { label: 'Document Requirements', category: 'documents' },
  { label: 'Refund Timeline', category: 'refund' },
  { label: 'Book Appointment', category: 'appointment' },
  { label: 'Contact Support', category: 'contact' },
  { label: 'RON / Notary Services', category: 'notary' },
];


const BOT_RESPONSES: Record<string, string[]> = {
  pricing: [
    "Great question! We offer three plans:\n\n• **Basic** — $49.99 for simple W-2 returns\n• **Premium** — $99.99 for freelancers & small businesses\n• **Enterprise** — $149.99 for complex multi-state filings\n\nAll plans include free audit protection. Would you like to get started?",
  ],
  filing: [
    "Your filing status depends on your situation as of December 31st:\n\n• **Single** — Unmarried or legally separated\n• **Married Filing Jointly** — Married and filing together\n• **Married Filing Separately** — Married but filing apart\n• **Head of Household** — Unmarried with a qualifying dependent\n• **Qualifying Widow(er)** — Spouse passed within last 2 years\n\nNeed help determining yours? I can walk you through it!",
  ],
  documents: [
    "Here's what you'll typically need:\n\n• **W-2 forms** from all employers\n• **1099 forms** (freelance, interest, dividends)\n• **Social Security numbers** for you & dependents\n• **Last year's tax return** (for reference)\n• **Receipts for deductions** (medical, charitable, etc.)\n• **1098 forms** (mortgage interest, student loan)\n\nYou can securely upload everything through our Document Vault!",
  ],
  refund: [
    "Refund timelines vary based on how you file:\n\n• **E-file + Direct Deposit** — 10 to 21 days\n• **E-file + Paper Check** — 3 to 4 weeks\n• **Paper Return** — 6 to 8 weeks\n\nYou can track your refund anytime using the IRS \"Where's My Refund\" tool. We also provide real-time status updates in your dashboard!",
  ],
  contact: [
    "We're here to help! You can reach us through:\n\n• **Phone**: (888) 555-0124 — Mon-Fri, 8am-8pm EST\n• **Email**: support@smartbooks24.com\n• **Live Chat**: You're already here! 😊\n• **Office**: Schedule an in-person visit through our booking page\n\nFor urgent tax matters, our priority line is available 24/7 during tax season.",
  ],
  notary: [
    "We offer Remote Online Notarization (RON) services!\n\n• **What it is**: Legally notarize documents via secure video call\n• **Available**: 24/7, from anywhere in supported states\n• **Cost**: Starting at $25 per session\n• **Documents**: Powers of attorney, affidavits, real estate docs & more\n\nWould you like to schedule a RON session?",
  ],
  appointment: [

    "We'd love to help you schedule a consultation! We offer:\n\n• **Tax Consultation** — 30 min, Free\n• **Tax Preparation** — 60 min, $149+\n• **Notary / RON** — 45 min, $75+\n• **Bookkeeping Review** — 45 min, $99+\n\nVisit our **Book Appointment** page to pick a date and time that works for you. You can find it in the top navigation or go directly to /book-appointment!",
  ],
  default: [
    "Thanks for your message! Let me look into that for you. In the meantime, feel free to use the quick reply buttons below for instant answers on common topics.",
    "I appreciate your question! Our team specializes in tax preparation, bookkeeping, and notary services. Could you tell me a bit more about what you need help with?",
    "That's a great question! While I gather the best answer for you, you can also explore our services section on the website or use the quick replies below for instant info.",
    "Thanks for reaching out! I want to make sure I give you the most accurate information. Let me connect you with the right resource — in the meantime, check out our FAQ or try a quick reply topic!",
  ],
};


const generateId = () => Math.random().toString(36).substring(2, 11);

const INITIAL_GREETING: ChatMessage = {
  id: 'greeting-1',
  sender: 'bot',
  text: "Hi there! 👋 I'm SmartBot, your virtual tax assistant from SmartBooks24. How can I help you today? Choose a topic below or type your question!",
  timestamp: new Date(),
};

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_GREETING]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const getBotResponse = (category: string): string => {
    const responses = BOT_RESPONSES[category] || BOT_RESPONSES.default;
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const addBotMessage = useCallback((text: string) => {
    setIsTyping(true);
    const delay = Math.min(600 + text.length * 8, 2500);
    setTimeout(() => {
      const botMsg: ChatMessage = {
        id: generateId(),
        sender: 'bot',
        text,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
      if (!document.hasFocus()) {
        setUnreadCount((prev) => prev + 1);
      }
    }, delay);
  }, []);

  const handleQuickReply = (reply: QuickReply) => {
    const userMsg: ChatMessage = {
      id: generateId(),
      sender: 'user',
      text: reply.label,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    addBotMessage(getBotResponse(reply.category));
  };

  const handleSendMessage = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      id: generateId(),
      sender: 'user',
      text: trimmed,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');

    // Determine category from keywords
    const lower = trimmed.toLowerCase();
    let category = 'default';
    if (lower.includes('price') || lower.includes('cost') || lower.includes('plan') || lower.includes('pricing') || lower.includes('fee')) {
      category = 'pricing';
    } else if (lower.includes('filing') || lower.includes('status') || lower.includes('married') || lower.includes('single') || lower.includes('head of household')) {
      category = 'filing';
    } else if (lower.includes('document') || lower.includes('w-2') || lower.includes('w2') || lower.includes('1099') || lower.includes('upload') || lower.includes('need')) {
      category = 'documents';
    } else if (lower.includes('refund') || lower.includes('timeline') || lower.includes('how long') || lower.includes('when')) {
      category = 'refund';
    } else if (lower.includes('contact') || lower.includes('phone') || lower.includes('email') || lower.includes('call') || lower.includes('reach')) {
      category = 'contact';
    } else if (lower.includes('notary') || lower.includes('ron') || lower.includes('notarize') || lower.includes('notarization')) {
      category = 'notary';
    }

    addBotMessage(getBotResponse(category));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessageText = (text: string) => {
    // Simple markdown-like rendering for bold text
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      // Handle newlines
      return part.split('\n').map((line, j, arr) => (
        <React.Fragment key={`${i}-${j}`}>
          {line}
          {j < arr.length - 1 && <br />}
        </React.Fragment>
      ));
    });
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-[#18453B]/30 ${
          isOpen
            ? 'bg-[#0A1628]'
            : 'bg-[#18453B] hover:bg-[#0D3328]'
        }`}

        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}

        {/* Unread Badge */}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-gray-900 text-xs font-bold rounded-full flex items-center justify-center animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Chat Panel */}
      <div
        className={`fixed bottom-24 right-6 z-[9998] w-[380px] max-w-[calc(100vw-2rem)] transition-all duration-300 origin-bottom-right ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col" style={{ height: '520px' }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-[#18453B] to-[#1B365D] px-5 py-4 flex items-center gap-3 flex-shrink-0">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47 2.47a2.25 2.25 0 01-1.59.659H9.06a2.25 2.25 0 01-1.591-.659L5 14.5m14 0V5.846a2.25 2.25 0 00-1.276-2.028l-.25-.125a6.776 6.776 0 00-6.948 0l-.25.125A2.25 2.25 0 009 5.846V14.5" />
                </svg>
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#18453B]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-gray-900 font-semibold text-sm">SmartBot Assistant</h3>
              <p className="text-gray-900/70 text-xs">Online — Typically replies instantly</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-900/60 hover:text-gray-900 transition-colors p-1 rounded-lg hover:bg-white/10"
              aria-label="Minimize chat"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gradient-to-b from-gray-50 to-white" style={{ scrollBehavior: 'smooth' }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] ${msg.sender === 'user' ? 'order-1' : 'order-1'}`}>
                  {msg.sender === 'bot' && (
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-5 h-5 rounded-full bg-[#18453B] flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5" />
                        </svg>
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium">SmartBot</span>
                    </div>
                  )}
                  <div
                    className={`px-4 py-3 text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#18453B] text-gray-900 rounded-2xl rounded-br-md'
                        : 'bg-white text-gray-700 rounded-2xl rounded-tl-md shadow-sm border border-gray-100'
                    }`}
                  >
                    {renderMessageText(msg.text)}
                  </div>
                  <p className={`text-[10px] text-gray-400 mt-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[85%]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-5 h-5 rounded-full bg-[#18453B] flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5" />
                      </svg>
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">SmartBot</span>
                  </div>
                  <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-md shadow-sm border border-gray-100 inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {messages.length <= 3 && !isTyping && (
            <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50 flex-shrink-0">
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mb-2">Quick Topics</p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_REPLIES.map((reply) => (
                  <button
                    key={reply.category}
                    onClick={() => handleQuickReply(reply)}
                    className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 text-[#18453B] rounded-full hover:bg-[#18453B] hover:text-gray-900 hover:border-[#18453B] transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    {reply.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Persistent Quick Reply Strip (after initial) */}
          {messages.length > 3 && !isTyping && (
            <div className="px-4 py-1.5 border-t border-gray-100 bg-gray-50/30 flex-shrink-0 overflow-x-auto">
              <div className="flex gap-1.5 whitespace-nowrap">
                {QUICK_REPLIES.slice(0, 4).map((reply) => (
                  <button
                    key={reply.category}
                    onClick={() => handleQuickReply(reply)}
                    className="px-2.5 py-1 text-[11px] font-medium bg-white border border-gray-200 text-gray-500 rounded-full hover:bg-[#18453B] hover:text-gray-900 hover:border-[#18453B] transition-all duration-200 flex-shrink-0"
                  >
                    {reply.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="px-4 py-3 border-t border-gray-100 bg-white flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  disabled={isTyping}
                  className="w-full px-4 py-2.5 bg-gray-100 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#18453B]/30 focus:bg-white border border-transparent focus:border-[#18453B]/30 transition-all duration-200 disabled:opacity-50"
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="w-10 h-10 bg-[#18453B] hover:bg-[#0D3328] disabled:bg-gray-300 disabled:cursor-not-allowed text-gray-900 rounded-xl flex items-center justify-center transition-all duration-200 hover:shadow-md flex-shrink-0"
                aria-label="Send message"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-2">
              Powered by SmartBooks24 AI — Responses are for guidance only
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatWidget;
