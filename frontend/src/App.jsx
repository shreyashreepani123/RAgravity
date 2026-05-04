import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import UploadZone from './components/UploadZone';
import ChatInterface from './components/ChatInterface';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import { Rocket, LogOut, Trash2, FileText, X, Plus, MessageSquare, History, PanelLeft, PanelRight, Shield, Settings, Info, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const API = 'http://127.0.0.1:8000';

function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [dbChunks, setDbChunks] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isClearing, setIsClearing] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

  // On mount (when the app view loads), check real DB status and load sessions
  useEffect(() => {
    if (currentView === 'app') {
      fetchStatus();
      loadSessions();
    }
  }, [currentView, userEmail]);

  const loadSessions = () => {
    if (!userEmail) return;
    const saved = localStorage.getItem(`chat_sessions_${userEmail}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      setSessions(parsed);
      if (parsed.length > 0) {
        setActiveSessionId(parsed[0].id);
      } else {
        createNewSession();
      }
    } else {
      createNewSession();
    }
  };

  const createNewSession = () => {
    const newSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [
        {
          role: 'assistant',
          content: 'Welcome to your personal intelligence hub. Upload your documents, and let me instantly uncover the insights, answers, and clarity you need. How can we elevate your research today?',
          sources: []
        }
      ]
    };
    const updatedSessions = [newSession, ...sessions];
    setSessions(updatedSessions);
    setActiveSessionId(newSession.id);
    saveSessions(updatedSessions);
  };

  const saveSessions = (updatedSessions) => {
    if (!userEmail) return;
    localStorage.setItem(`chat_sessions_${userEmail}`, JSON.stringify(updatedSessions));
  };

  const updateActiveSessionMessages = (messages) => {
    const updatedSessions = sessions.map(s => {
      if (s.id === activeSessionId) {
        // Update title based on first user message if title is 'New Chat'
        let title = s.title;
        if (title === 'New Chat' || title === 'Untitled') {
          const firstUserMsg = messages.find(m => m.role === 'user');
          if (firstUserMsg) {
            title = firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? '...' : '');
          }
        }
        return { ...s, title, messages };
      }
      return s;
    });
    setSessions(updatedSessions);
    saveSessions(updatedSessions);
  };

  const fetchStatus = async () => {
    try {
      const res = await axios.get(`${API}/status`);
      setDbChunks(res.data.chunks_in_db || 0);
      setUploadedFiles(res.data.files || []);
    } catch {
      // backend may not be running
    }
  };

  const handleUploadSuccess = (newChunks, filename) => {
    setDbChunks(prev => prev + newChunks);
    setUploadedFiles(prev => {
      const exists = prev.includes(filename);
      return exists ? prev : [...prev, filename];
    });
    // Refresh real count from server
    fetchStatus();
  };

  const handleClearDB = async () => {
    setIsClearing(true);
    try {
      const res = await axios.delete(`${API}/clear`);
      console.log('Clear response:', res.data);
      // Let server state drive the UI — don't set locally
      await fetchStatus();
    } catch (err) {
      console.error('Clear error:', err);
      alert('Failed to clear: ' + (err.response?.data?.detail || err.message));
      await fetchStatus();
    } finally {
      setIsClearing(false);
    }
  };

  const handleDeleteFile = async (filename) => {
    try {
      await axios.delete(`${API}/files/${encodeURIComponent(filename)}`);
      await fetchStatus();
    } catch (err) {
      alert('Failed to remove file: ' + (err.response?.data?.detail || err.message));
    }
  };

  const renderApp = () => {
    const activeSession = sessions.find(s => s.id === activeSessionId) || { messages: [] };

    return (
      <div className="flex h-screen w-full bg-[#0a0a0c] overflow-hidden text-gray-200">
        {/* Left Sidebar: History */}
        <AnimatePresence mode="wait">
          {isSidebarOpen && (
            <motion.aside
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-[280px] bg-[#0c0c0e] border-r border-white/5 flex flex-col h-full z-40"
            >
              <div className="p-4 mb-2">
                <button 
                  onClick={createNewSession}
                  className="flex items-center gap-2 px-4 py-2.5 bg-aero-accent text-white rounded-xl text-sm font-semibold hover:bg-aero-accent-hover transition-all w-full justify-center shadow-lg shadow-aero-accent/20"
                >
                  <Plus className="w-4 h-4" />
                  New Research
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-3 space-y-1 custom-scrollbar">
                <div className="px-3 mb-2 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">History</span>
                  <History className="w-3 h-3 text-gray-600" />
                </div>
                {sessions.map(session => (
                  <button
                    key={session.id}
                    onClick={() => setActiveSessionId(session.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm group flex items-center gap-3 transition-all ${
                      activeSessionId === session.id 
                        ? 'bg-white/10 text-white shadow-sm' 
                        : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                    }`}
                  >
                    <MessageSquare className={`w-4 h-4 shrink-0 ${activeSessionId === session.id ? 'text-aero-accent' : 'text-gray-600'}`} />
                    <span className="truncate flex-1 font-medium">{session.title}</span>
                  </button>
                ))}
              </div>

              <div className="p-4 mt-auto space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-aero-accent to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                    {userEmail?.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{userEmail.split('@')[0]}</p>
                    <p className="text-[10px] text-gray-500 truncate">{userEmail}</p>
                  </div>
                  <button 
                    onClick={() => {
                      setCurrentView('landing');
                      setDbChunks(0);
                      setUploadedFiles([]);
                      setUserEmail('');
                      setSessions([]);
                    }}
                    className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Workspace */}
        <div className="flex-1 flex flex-col min-w-0 relative bg-[#0a0a0c]">
          {/* Main Header */}
          <header className="h-16 px-6 flex items-center justify-between border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-xl z-30">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-white/5 rounded-xl text-gray-400 transition-all active:scale-90"
              >
                <PanelLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-aero-accent/10 rounded-lg">
                  <Rocket className="w-5 h-5 text-aero-accent" />
                </div>
                <h1 className="text-base font-bold tracking-tight text-white">RAGravity <span className="text-[10px] font-medium text-aero-accent bg-aero-accent/10 px-1.5 py-0.5 rounded-md ml-1 uppercase">Pro</span></h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
                <div className={`w-2 h-2 rounded-full ${dbChunks > 0 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-gray-600'}`} />
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  {dbChunks} Chunks In Core
                </span>
              </div>
              <button 
                onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
                className={`p-2 rounded-xl transition-all active:scale-90 ${isRightPanelOpen ? 'bg-aero-accent/10 text-aero-accent' : 'hover:bg-white/5 text-gray-400'}`}
              >
                <PanelRight className="w-5 h-5" />
              </button>
            </div>
          </header>

          <div className="flex-1 flex overflow-hidden">
            {/* Center: The actual Chat */}
            <div className="flex-1 h-full relative">
              <ChatInterface 
                isReady={dbChunks > 0} 
                userEmail={userEmail} 
                initialMessages={activeSession.messages}
                onMessagesChange={updateActiveSessionMessages}
                sessionKey={activeSessionId}
              />
            </div>

            {/* Right Panel: Knowledge & Uploads */}
            <AnimatePresence>
              {isRightPanelOpen && (
                <motion.aside
                  initial={{ x: 320, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 320, opacity: 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="w-[320px] bg-[#0c0c0e]/50 border-l border-white/5 flex flex-col h-full z-20 overflow-y-auto custom-scrollbar"
                >
                  <div className="p-6 space-y-8">
                    <section>
                      <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">Ingestion</h3>
                      <UploadZone onUploadSuccess={handleUploadSuccess} />
                    </section>

                    {uploadedFiles.length > 0 && (
                      <section>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Context Store</h3>
                          <button 
                            onClick={handleClearDB}
                            className="text-[10px] font-bold text-red-500/80 hover:text-red-400 transition-colors flex items-center gap-1 uppercase"
                          >
                            <Trash2 className="w-3 h-3" />
                            Purge All
                          </button>
                        </div>
                        <div className="space-y-2">
                          {uploadedFiles.map((f, i) => (
                            <div key={i} className="group p-3 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-3 hover:bg-white/10 hover:border-white/10 transition-all">
                              <div className="p-2 bg-indigo-500/10 rounded-xl">
                                <FileText className="w-4 h-4 text-indigo-400" />
                              </div>
                              <span className="truncate flex-1 text-xs font-semibold text-gray-300" title={f}>{f}</span>
                              <button
                                onClick={() => handleDeleteFile(f)}
                                className="p-1.5 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    <section className="bg-gradient-to-br from-aero-accent/10 to-transparent p-5 rounded-3xl border border-aero-accent/10 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-aero-accent opacity-10 rounded-full blur-3xl" />
                      <div className="flex items-center gap-2 mb-3">
                        <Shield className="w-4 h-4 text-aero-accent" />
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Research Mode</h3>
                      </div>
                      <p className="text-[11px] leading-relaxed text-gray-400 mb-4">
                        Your assistant is now optimized for scientific accuracy. Answers are grounded exclusively in the provided context to prevent hallucinations.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[10px] text-gray-500">
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                          Source Attribution
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500">
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                          Context Memory
                        </div>
                      </div>
                    </section>
                  </div>
                </motion.aside>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence mode="wait">
      {currentView === 'landing' && (
        <motion.div key="landing" exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}>
          <LandingPage onNavigate={(v) => setCurrentView(v)} />
        </motion.div>
      )}
      {currentView === 'auth' && (
        <motion.div key="auth" exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
          <AuthPage onNavigate={(v, email) => { setCurrentView(v); if (email) setUserEmail(email); }} />
        </motion.div>
      )}
      {currentView === 'app' && renderApp()}
    </AnimatePresence>
  );
}

export default App;
