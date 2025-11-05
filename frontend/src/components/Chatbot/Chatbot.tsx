import React, { useEffect, useRef, useState } from 'react';
import chatBotService from '@/services/chatBotService';

interface Message {
  id: number;
  from: 'user' | 'bot';
  text: string;
}

const Chatbot: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, from: 'bot', text: "Hi! I'm here to help — ask me anything about the service." },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);


  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

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
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat panel */}
      <div className={`flex flex-col shadow-xl rounded-lg overflow-hidden transition-transform duration-200 ${open ? 'translate-y-0' : 'translate-y-4'}`}>
        {open && (
          <div className="w-80 md:w-96 h-[420px] bg-white ring-1 ring-black/5 flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 bg-linear-to-r from-orange-500 to-orange-600 text-white">
              <div className="font-medium">Support Chat</div>
              <button
                aria-label="Close chat"
                onClick={() => setOpen(false)}
                className="p-1 rounded hover:bg-white/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <div className="px-3 py-3 overflow-y-auto flex-1 space-y-3 bg-gray-50">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`${m.from === 'user' ? 'bg-orange-500 text-white' : 'bg-white text-gray-800'} max-w-[80%] px-3 py-2 rounded-lg shadow-sm border`}> 
                    <div className="text-sm">{m.text}</div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="px-3 py-2 bg-white border-t flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-300"
                aria-label="Chat input"
                disabled={isSending}
              />
              <button
                type="submit"
                disabled={isSending}
                className={`bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-md text-sm ${isSending ? 'opacity-60 cursor-not-allowed' : ''}`}>
                {isSending ? 'Sending...' : 'Send'}
              </button>
            </form>
          </div>
        )}

        {/* Toggle button */}
        <div className="flex items-center justify-end">
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center justify-center w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-600"
            aria-label="Toggle chat"
            title="Chat with support"
          >
            {!open ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8-1.23 0-2.39-.17-3.45-.48L3 20l1.48-4.1C3.64 14.78 3 13.45 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L10 9.586 7.707 7.293a1 1 0 10-1.414 1.414L8.586 11l-2.293 2.293a1 1 0 101.414 1.414L10 12.414l2.293 2.293a1 1 0 001.414-1.414L11.414 11l2.293-2.293z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
