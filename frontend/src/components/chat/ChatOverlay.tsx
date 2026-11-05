'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLocale } from 'next-intl';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { AI_SERVICE_URL } from '@/config/dynamic';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const ChatOverlay: React.FC = () => {
  const locale = useLocale();
  const isRTL = locale === 'fa';

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const positionClass = isRTL ? 'left-6' : 'right-6';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');

      // IMPORTANT: AI floating chat must ONLY call ai_service
      const response = await fetch(`${AI_SERVICE_URL}/api/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.message }]);
      } else {
        const debugParts: string[] = [];
        if (data.error_stage) debugParts.push(`stage: ${data.error_stage}`);
        if (data.load_error) debugParts.push(`load_error: ${data.load_error}`);
        const debugText = debugParts.length ? `\n\n${debugParts.join('\n')}` : '';
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              (data.message ||
                (isRTL ? 'خطا در دریافت پاسخ' : 'Error receiving response')) + debugText,
          },
        ]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: isRTL ? 'خطا در اتصال. لطفا دوباره تلاش کنید.' : 'Connection error. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <div className={`fixed bottom-6 ${positionClass} z-50`}>
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        >
          <MessageCircle size={24} className="sm:w-7 sm:h-7" />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`fixed bottom-6 ${positionClass} z-50 w-[95vw] sm:w-[400px] h-[500px] sm:h-[600px] bg-white rounded-[40px] sm:rounded-[44px] shadow-2xl flex flex-col overflow-hidden border border-gray-200`}
    >
      <div className="p-3 sm:p-4 bg-blue-600 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center text-sm sm:text-lg">
            🤖
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base">
              {isRTL ? 'پشتیبانی هوشمند' : 'Smart Support'}
            </h3>
            <p className="text-[10px] sm:text-xs text-white/70">{isRTL ? 'آنلاین' : 'Online'}</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X size={18} className="sm:w-5 sm:h-5" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 sm:p-4 bg-gray-50 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="text-4xl mb-3">👋</div>
            <p className="text-gray-600 font-medium text-sm sm:text-base">
              {isRTL ? 'چطور می‌توانم کمکتان کنم؟' : 'How can I help you?'}
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.role === 'user'
                ? isRTL
                  ? 'justify-end'
                  : 'justify-start'
                : isRTL
                  ? 'justify-start'
                  : 'justify-end'
            }`}
          >
            <div
              className={`max-w-[85%] p-2.5 sm:p-3 rounded-[26px] sm:rounded-[28px] text-xs sm:text-sm ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-800 border border-gray-200'
              }`}
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 p-3 rounded-2xl">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            </div>
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4 bg-white border-t border-gray-100 shrink-0 rounded-b-[36px] sm:rounded-b-[40px]">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
            placeholder={isRTL ? 'پیام...' : 'Message...'}
            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:border-blue-500"
            dir={isRTL ? 'rtl' : 'ltr'}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition-colors shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send size={18} className="sm:w-5 sm:h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

