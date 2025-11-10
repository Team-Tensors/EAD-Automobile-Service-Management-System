import React, { useEffect, useRef, useState } from 'react';
import chatBotService from '@/services/chatBotService';
import MarkdownRenderer from './MarkdownRenderer';

interface Message {
  id: number;
  from: 'user' | 'bot';
  text: string;
}

const Chatbot: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, from: 'bot', text: "👋 **Hi! I'm the DriveCare Assistant**\n\nI'm here to help with:\n- 🚗 Service information\n- ⏰ Appointment availability\n- 📍 Center locations\n- ❓ General inquiries\n\nHow can I assist you today?" },
  ]);
  const [input, setInput] = useState('');
  const [locationRequested, setLocationRequested] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);


  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  // Request user location when chatbot is opened for the first time
  // This triggers location caching which will be automatically included in all requests
  useEffect(() => {
    if (open && !locationRequested) {
      requestUserLocation();
      setLocationRequested(true);
    }
  }, [open, locationRequested]);

  const requestUserLocation = async () => {
    try {
      const location = await chatBotService.getUserLocation();
      if (location) {
        console.log('User location obtained and cached:', location);
      } else {
        console.log('Location access denied or unavailable');
      }
    } catch (error) {
      console.error('Error requesting location:', error);
    }
  };

  const [isSending, setIsSending] = useState(false);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = { id: Date.now(), from: 'user', text };
    setMessages((m) => [...m, userMsg]);
    setInput('');

    // Add a temporary typing indicator message from bot
    const typingId = Date.now() + 2;
    const typingMsg: Message = { id: typingId, from: 'bot', text: '...' };
    setMessages((m) => [...m, typingMsg]);
    setIsSending(true);

    try {
        // Location will be automatically attached by the service interceptor
        const res: any = await chatBotService.sendMessage({ message: text });
        console.log('Chatbot response:', res);
      // axios responses usually have data property; support both shapes
        const data = res?.data ?? res;
      // Try common response fields
        const botText = data?.reply ?? data?.message ?? (typeof data === 'string' ? data : null) ?? 'Sorry, I could not get a response.';

      // Replace typing message with actual bot response
        setMessages((m) => m.map(msg => msg.id === typingId ? { ...msg, text: botText } : msg));
    } catch (err: any) {
        const errMsg = err?.message ?? 'Network error. Please try again.';
        setMessages((m) => m.map(msg => msg.id === typingId ? { ...msg, text: `Error: ${errMsg}` } : msg));
    } finally {
        setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      {/* Chat panel */}
      {open && (
        <div className="flex flex-col shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 animate-fadeIn">
          <div className="w-80 md:w-96 h-[500px] bg-linear-to-b from-slate-900 via-slate-800 to-slate-900 border border-orange-500/20 flex flex-col backdrop-blur-xl">
            {/* Header with gradient matching the main page */}
            <div className="flex items-center justify-between px-5 py-4 bg-linear-to-r from-orange-600 via-orange-500 to-orange-600 relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                    <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-white text-lg tracking-wide">DRIVECARE</div>
                  <div className="text-xs text-white/80">Support Assistant</div>
                </div>
              </div>
              <button
                aria-label="Close chat"
                onClick={() => setOpen(false)}
                className="relative z-10 p-2 rounded-lg hover:bg-white/20 transition-colors duration-200 group"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white group-hover:rotate-90 transition-transform duration-200" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Messages area with dark theme */}
            <div className="px-4 py-4 overflow-y-auto flex-1 space-y-4 bg-slate-900/50 scrollbar-thin scrollbar-thumb-orange-500/50 scrollbar-track-slate-800">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                  <div className={`${
                    m.from === 'user' 
                      ? 'bg-linear-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-500/30' 
                      : 'bg-slate-800 text-gray-100 border border-slate-700/50'
                  } max-w-[80%] px-4 py-3 rounded-2xl ${m.from === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'} backdrop-blur-sm transition-all duration-200 hover:scale-[1.02]`}> 
                    {m.from === 'bot' ? (
                      <MarkdownRenderer content={m.text} />
                    ) : (
                      <div className="text-sm leading-relaxed">{m.text}</div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area with dark theme */}
            <form onSubmit={handleSend} className="px-4 py-4 bg-slate-900 border-t border-slate-800 flex items-center gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                aria-label="Chat input"
                disabled={isSending}
              />
              <button
                type="submit"
                disabled={isSending}
                className={`bg-linear-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-lg shadow-orange-500/30 transition-all duration-200 hover:scale-105 active:scale-95 ${isSending ? 'opacity-60 cursor-not-allowed' : ''}`}>
                {isSending ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Toggle button with enhanced styling - always visible */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-center w-12 h-12 rounded-full bg-linear-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-600 shadow-2xl shadow-orange-500/50 text-white transition-all duration-300 hover:scale-110 active:scale-95 border-2 border-orange-400/30"
        aria-label="Toggle chat"
        title="Chat with support"
      >
        {!open ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8-1.23 0-2.39-.17-3.45-.48L3 20l1.48-4.1C3.64 14.78 3 13.45 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L10 9.586 7.707 7.293a1 1 0 10-1.414 1.414L8.586 11l-2.293 2.293a1 1 0 101.414 1.414L10 12.414l2.293 2.293a1 1 0 001.414-1.414L11.414 11l2.293-2.293z" clipRule="evenodd" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default Chatbot;
