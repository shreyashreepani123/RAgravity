import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, Sparkles, Database, Shield, Zap } from 'lucide-react';

const LandingPage = ({ onNavigate }) => {
  return (
    <div className="min-h-screen w-full bg-aero-dark flex flex-col items-center justify-center relative overflow-hidden font-sans">
      
      {/* Background Ambient Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-aero-accent opacity-[0.03] rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600 opacity-[0.03] rounded-full blur-[120px] pointer-events-none"></div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.015] pointer-events-none mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>

      {/* Navbar Mock */}
      <nav className="absolute top-0 w-full p-6 flex justify-between items-center z-20 max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="p-2 bg-aero-accent/10 rounded-xl border border-aero-accent/20">
            <Rocket className="w-6 h-6 text-aero-accent" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">RAGravity</span>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex gap-4"
        >
          <button 
            onClick={() => onNavigate('auth')}
            className="px-5 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
          >
            Sign In
          </button>
          <button 
            onClick={() => onNavigate('auth')}
            className="px-5 py-2 text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white transition-all hover:scale-105 active:scale-95 backdrop-blur-md"
          >
            Get Started
          </button>
        </motion.div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl mt-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-aero-accent/10 border border-aero-accent/20 text-aero-accent text-sm font-medium mb-8"
        >
          <Sparkles className="w-4 h-4" />
          <span>The Next Generation Research AI</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-500 tracking-tight leading-tight mb-6"
        >
          Defy the Limits <br className="hidden md:block" /> of Knowledge.
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl leading-relaxed"
        >
          Upload your documents. Extract infinite insights. RAGravity uses blazing-fast LLMs and precise vector embeddings to ground every answer strictly in your context.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3, type: "spring" }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <button 
            onClick={() => onNavigate('auth')}
            className="group relative px-8 py-4 bg-aero-accent hover:bg-aero-accent-hover text-white rounded-full font-semibold text-lg transition-all shadow-[0_0_40px_-10px_rgba(59,130,246,0.5)] hover:shadow-[0_0_60px_-15px_rgba(59,130,246,0.7)] hover:-translate-y-1 active:translate-y-0 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
            <span className="relative flex items-center justify-center gap-2">
              Enter the Portal <Rocket className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </span>
          </button>
        </motion.div>
      </main>

      {/* Feature Pills */}
      <div className="absolute bottom-10 left-0 w-full flex justify-center gap-6 px-6 overflow-hidden">
        {[
          { icon: Database, text: "Vector Grounding" },
          { icon: Zap, text: "Sub-second Queries" },
          { icon: Shield, text: "Private Context" }
        ].map((feature, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + (idx * 0.1) }}
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-sm"
          >
            <feature.icon className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-300">{feature.text}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default LandingPage;
