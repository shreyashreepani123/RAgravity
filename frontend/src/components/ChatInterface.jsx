import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const ChatInterface = ({ isReady, userEmail, initialMessages = [], onMessagesChange, sessionKey }) => {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Sync internal state when sessionKey changes (user switched chats)
  useEffect(() => {
    setMessages(initialMessages);
  }, [sessionKey, initialMessages]);

  // Notify parent of message changes
  useEffect(() => {
    if (onMessagesChange && messages.length > 0) {
      onMessagesChange(messages);
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || !isReady || isLoading) return;

    const userQuery = input.trim();
    setInput('');
    
    const newUserMsg = { role: 'user', content: userQuery };
    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      const response = await axios.post('https://ragravity-2.onrender.com/query', {
        question: userQuery
      });

      const newAssistantMsg = {
        role: 'assistant',
        content: response.data.answer,
        sources: response.data.sources || []
      };

      setMessages(prev => [...prev, newAssistantMsg]);
    } catch (err) {
      const errorDetail = err.response?.data?.detail || err.message;
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ Error: ${errorDetail}\n\nPlease ensure the backend is running and the Groq API key is valid.`,
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-aero-accent opacity-[0.03] rounded-full blur-[120px] pointer-events-none"></div>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 z-10 scroll-smooth custom-scrollbar">
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              key={idx} 
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 shadow-sm ${
                msg.role === 'user' ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gray-800 border border-gray-700'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-aero-accent" />}
              </div>
              
              <div className={`max-w-[85%] ${msg.role === 'user' ? 'items-end flex flex-col' : 'items-start flex flex-col'}`}>
                <div className={`p-4 rounded-2xl shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-aero-accent text-white rounded-tr-sm' 
                    : msg.isError 
                      ? 'bg-red-500/10 border border-red-500/20 text-red-400 rounded-tl-sm'
                      : 'bg-gray-800/60 border border-gray-700/50 text-gray-200 rounded-tl-sm'
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed text-sm">{msg.content}</p>
                </div>
                

              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center mt-1">
              <Bot className="w-4 h-4 text-aero-accent" />
            </div>
            <div className="bg-gray-800/60 border border-gray-700/50 px-5 py-4 rounded-2xl rounded-tl-sm flex items-center gap-3">
              <div className="flex gap-1.5">
                <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} className="w-2 h-2 bg-aero-accent/80 rounded-full" />
                <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }} className="w-2 h-2 bg-aero-accent/80 rounded-full" />
                <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }} className="w-2 h-2 bg-aero-accent/80 rounded-full" />
              </div>
              <span className="text-sm font-medium text-gray-400 ml-1">Synthesizing answer...</span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} className="h-1" />
      </div>

      {/* Input Area */}
      <div className="p-5 border-t border-aero-border bg-[#101014] z-10">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!isReady || isLoading}
            placeholder={isReady ? "Ask a question about your research..." : "Upload a document to start asking questions"}
            className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3.5 pl-5 pr-14 text-sm text-white focus:outline-none focus:border-aero-accent focus:ring-1 focus:ring-aero-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={!input.trim() || !isReady || isLoading}
            className="absolute right-2.5 p-2 bg-aero-accent rounded-lg text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-aero-accent-hover transition-all duration-200 active:scale-95 shadow-md shadow-aero-accent/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
