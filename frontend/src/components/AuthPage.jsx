import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mail, Lock, User as UserIcon, Rocket } from 'lucide-react';

const AuthPage = ({ onNavigate }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Pass email so App can key history by user
    onNavigate('app', email.trim().toLowerCase());
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0c] flex items-center justify-center relative overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600 opacity-20 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600 opacity-20 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] pointer-events-none"></div>

      <button 
        onClick={() => onNavigate('landing')}
        className="absolute top-8 left-8 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-gray-400 hover:text-white transition-all backdrop-blur-md z-20 group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
      </button>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="w-full max-w-md p-8 bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl shadow-2xl z-10 relative"
      >
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-aero-accent/10 rounded-2xl border border-aero-accent/20 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
            <Rocket className="w-8 h-8 text-aero-accent" />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-center text-white mb-2">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-center text-gray-400 text-sm mb-8">
          {isLogin ? 'Enter your details to access your workspace.' : 'Sign up to start researching with RAGravity.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="popLayout">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input 
                    type="text" 
                    placeholder="Full Name" 
                    required={!isLogin}
                    className="w-full bg-black/30 border border-gray-700/50 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-aero-accent focus:ring-1 focus:ring-aero-accent transition-all placeholder:text-gray-600"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input 
              type="email" 
              placeholder="Email Address" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/30 border border-gray-700/50 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-aero-accent focus:ring-1 focus:ring-aero-accent transition-all placeholder:text-gray-600"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input 
              type="password" 
              placeholder="Password" 
              required
              className="w-full bg-black/30 border border-gray-700/50 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-aero-accent focus:ring-1 focus:ring-aero-accent transition-all placeholder:text-gray-600"
            />
          </div>

          {isLogin && (
            <div className="flex justify-end mt-2">
              <button type="button" className="text-xs text-aero-accent hover:text-white transition-colors">
                Forgot password?
              </button>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full py-4 mt-6 bg-aero-accent hover:bg-aero-accent-hover text-white rounded-xl font-semibold shadow-lg shadow-aero-accent/30 transition-colors"
          >
            {isLogin ? 'Sign In' : 'Register'}
          </motion.button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-aero-accent hover:text-white font-medium transition-colors"
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
