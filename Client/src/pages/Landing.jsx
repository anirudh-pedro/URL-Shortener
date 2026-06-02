import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLink, FiArrowRight, FiCheck, FiPlay, FiBarChart2, FiLock, FiTrendingUp } from 'react-icons/fi';
import { BsQrCode as QrIcon } from 'react-icons/bs';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';

const Landing = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [url, setUrl] = useState('');

  const handleMockShorten = (e) => {
    e.preventDefault();
    if (!url) {
      toast.error('Please enter a destination URL');
      return;
    }
    
    // Redirect user to dashboard to create the link or login if unauthenticated
    if (isAuthenticated) {
      navigate('/dashboard', { state: { autoShortenUrl: url } });
    } else {
      toast.success('Ready to shorten! Please create a free account to continue.', { duration: 4000 });
      navigate('/register', { state: { prefilledUrl: url } });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } },
  };

  return (
    <div 
      className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col selection:bg-slate-900 selection:text-white relative overflow-hidden"
      style={{ backgroundImage: 'radial-gradient(rgba(15, 23, 42, 0.02) 1px, transparent 1px)', backgroundSize: '24px 24px' }}
    >
      {/* Background Animated Glow Blobs */}
      <div className="absolute -top-40 -left-40 w-[450px] h-[450px] bg-violet-600/5 rounded-full blur-[100px] pointer-events-none animate-orb-1"></div>
      <div className="absolute top-[400px] -right-40 w-[450px] h-[450px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none animate-orb-2"></div>

      {/* 1. Header Navbar */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full border-b border-slate-200/80 bg-white/70 backdrop-blur-md sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-900 rounded-xl text-white">
              <FiLink className="w-4.5 h-4.5" />
            </div>
            <span className="text-base font-bold text-slate-900 tracking-wider">
              LinkSnap
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium text-slate-500">
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#about" className="hover:text-slate-900 transition-colors">About</a>
            <a href="#pricing" className="hover:text-slate-900 transition-colors">Pricing</a>
            <a href="#contact" className="hover:text-slate-900 transition-colors">Contact us</a>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-sm"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-semibold text-slate-550 hover:text-slate-900 transition-colors"
                >
                  Create Link
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-sm"
                >
                  Dashboard
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.header>

      {/* 2. Hero Section */}
      <motion.main 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 max-w-5xl mx-auto px-6 py-16 md:py-24 flex flex-col items-center text-center relative z-10"
      >
        {/* Sub-Header */}
        <motion.span 
          variants={itemVariants}
          className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-[0.25em] mb-4 block"
        >
          Simplify Your Links
        </motion.span>

        {/* Hero Title */}
        <motion.h1 
          variants={itemVariants}
          className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] max-w-3xl mb-6"
        >
          Transform Long Urls, into <br />
          <span className="text-slate-900 underline decoration-slate-350 decoration-wavy underline-offset-8">
            Tiny Links Instantly!
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p 
          variants={itemVariants}
          className="text-sm md:text-base text-slate-500 font-light leading-relaxed max-w-xl mb-10"
        >
          Shorten long URLs, track performance, & manage all your links in one place. <br className="hidden sm:inline" />
          Your go-to solution for smarter sharing. Paste your long link below.
        </motion.p>

        {/* Form Input */}
        <motion.form 
          variants={itemVariants}
          onSubmit={handleMockShorten} 
          className="w-full max-w-xl bg-white border border-slate-200 shadow-sm p-1.5 rounded-2xl flex items-center justify-between mb-6 group focus-within:border-slate-400 transition-colors"
        >
          <div className="flex items-center gap-3 pl-3 flex-1 min-w-0">
            <FiLink className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="https://www.example.com/long-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="bg-transparent border-none text-slate-800 text-sm placeholder-slate-450 focus:outline-none w-full"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm shrink-0 transition-all hover:scale-[1.01]"
          >
            Generate Link <span className="text-slate-450 font-normal">· it's free</span>
          </button>
        </motion.form>

        {/* Social Proof Group */}
        <motion.div 
          variants={itemVariants}
          className="flex items-center gap-2 mb-16 relative"
        >
          <div className="flex -space-x-2">
            {[
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=60',
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&auto=format&fit=crop&q=60',
              'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&auto=format&fit=crop&q=60',
              'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&auto=format&fit=crop&q=60'
            ].map((img, i) => (
              <img
                key={i}
                src={img}
                alt="user avatar"
                className="w-6 h-6 rounded-full border-2 border-white object-cover shadow-sm"
              />
            ))}
          </div>
          <span className="text-[11px] font-semibold text-slate-500 font-light">
            1K+ people already using it.
          </span>

          {/* Decorative Curly Arrow */}
          <div className="absolute -right-16 -top-2 hidden sm:block text-slate-350">
            <svg className="w-12 h-10 transform scale-x-[-1] rotate-12" fill="none" viewBox="0 0 48 40">
              <path
                d="M8 8 C 16 16, 24 16, 36 28 M36 28 L30 28 M36 28 L36 22"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </motion.div>

        {/* 3. Illustration mockup */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -4 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="w-full max-w-3xl bg-white border border-slate-200 rounded-[28px] p-4 shadow-md relative group select-none"
        >
          {/* Mock Window Header */}
          <div className="flex items-center gap-1.5 pb-4 border-b border-slate-100 mb-4 px-2">
            <div className="w-3 h-3 rounded-full bg-rose-400"></div>
            <div className="w-3 h-3 rounded-full bg-amber-400"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
            <div className="h-4 w-40 bg-slate-50 border border-slate-100 rounded-md ml-4"></div>
          </div>
          {/* Mock Image canvas representing the drawing */}
          <div className="bg-[#FAFBFD] border border-slate-150 rounded-2xl p-6 md:p-12 flex flex-col items-center justify-center min-h-[300px]">
            <svg className="w-72 h-44 text-slate-300" viewBox="0 0 200 120" fill="none">
              {/* Mock illustration of collaboration and link shortening */}
              <rect x="40" y="30" width="120" height="60" rx="8" fill="white" stroke="#CBD5E1" strokeWidth="2" />
              <line x1="50" y1="45" x2="110" y2="45" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" />
              <line x1="50" y1="55" x2="90" y2="55" stroke="#E2E8F0" strokeWidth="3" strokeLinecap="round" />
              <circle cx="135" cy="50" r="12" fill="#E0F2FE" />
              <path d="M131 50 L139 50 M135 46 L135 54" stroke="#0284C7" strokeWidth="2" />
              <rect x="50" y="70" width="30" height="12" rx="4" fill="#F1F5F9" />
              <rect x="85" y="70" width="30" height="12" rx="4" fill="#F5F3FF" />
            </svg>
            <span className="text-xs text-slate-400 font-light mt-4">
              Real-time redirect metrics and QR generator workspace dashboard preview.
            </span>
          </div>
        </motion.div>
      </motion.main>

      {/* 4. Features Section */}
      <section id="features" className="w-full bg-white border-t border-slate-200/80 py-20 relative z-10">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-md mx-auto mb-16"
          >
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-[0.2em]">Robust Engine</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-2">Everything you need to share smart links</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: FiBarChart2,
                title: 'Advanced Analytics',
                desc: 'Review visitor distribution maps, track referrers, and break down clicks by day, devices, and browser types.',
                bgColor: 'bg-violet-550/10 text-violet-600 border-violet-100/50'
              },
              {
                icon: QrIcon,
                title: 'QR Code Scanner',
                desc: 'Automatically generate customizable high-resolution QR codes for every shortened link to download or print.',
                bgColor: 'bg-cyan-550/10 text-cyan-600 border-cyan-100/50'
              },
              {
                icon: FiLock,
                title: 'Link Protection',
                desc: 'Control redirects using security headers, enforce validation, and set automated custom link expiry timelines.',
                bgColor: 'bg-emerald-550/10 text-emerald-600 border-emerald-100/50'
              }
            ].map((card, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                whileHover={{ y: -5, boxShadow: '0 10px 30px -15px rgba(0,0,0,0.08)' }}
                className="space-y-3 p-6 rounded-3xl border border-slate-100 hover:border-slate-200 bg-white transition-all"
              >
                <div className={`w-10 h-10 border rounded-2xl flex items-center justify-center ${card.bgColor}`}>
                  <card.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm tracking-tight">{card.title}</h3>
                <p className="text-xs text-slate-500 font-light leading-relaxed">
                  {card.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-slate-900 text-slate-400 py-12 border-t border-slate-800 mt-auto relative z-10">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs font-light">
          <div className="flex items-center gap-2">
            <FiLink className="text-white" />
            <span className="font-bold text-white tracking-wider">LinkSnap</span>
          </div>
          <span>&copy; 2026 LinkSnap. Simplified links, absolute clarity.</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
