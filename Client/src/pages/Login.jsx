import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiLink, FiArrowRight, FiCheck } from 'react-icons/fi';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';

const Login = () => {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // If session is already validated, route directly to dashboard
  if (!loading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter all fields');
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      toast.error(error.message || 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex relative overflow-hidden font-sans">
      {/* Decorative Aurora meshes on left panel (visible on md+) */}
      <div className="hidden md:flex md:w-[55%] lg:w-[60%] flex-col justify-between p-12 bg-gradient-to-br from-slate-50 via-[#F8FAFC] to-slate-100 border-r border-slate-200 relative overflow-hidden select-none">
        
        {/* Glowing floating meshes in background */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-violet-100/40 rounded-full blur-[140px] animate-orb-1 pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-cyan-100/40 rounded-full blur-[140px] animate-orb-2 pointer-events-none"></div>

        {/* Platform Brand */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="p-2 bg-slate-900 rounded-xl text-white shadow-sm">
            <FiLink className="w-5 h-5" />
          </div>
          <span className="text-sm font-bold text-slate-900 tracking-widest uppercase">
            LinkSnap
          </span>
        </div>

        {/* Tagline section */}
        <div className="max-w-xl my-auto relative z-10 space-y-6">
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-slate-900">
            Transform Long Links Into{' '}
            <span className="text-slate-900 underline decoration-slate-300 decoration-wavy underline-offset-8">
              Actionable Insights
            </span>
          </h1>
          <p className="text-sm text-slate-500 font-light leading-relaxed max-w-sm">
            Deploy custom redirects, generate QR codes, and measure visitor agent click paths from a single unified workspace.
          </p>
          
          {/* Checklist */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            {[
              'Smart Analytics',
              'QR Generation',
              'Link Management',
              'Real-Time Tracking',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2.5 text-xs text-slate-655 font-medium">
                <div className="p-1 rounded-lg bg-emerald-50 border border-emerald-250/60 text-emerald-600">
                  <FiCheck className="w-3.5 h-3.5" />
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer brand stamp */}
        <div className="text-xs text-slate-400 relative z-10 font-light">
          &copy; 2026 LinkSnap App.
        </div>
      </div>

      {/* Login panel (Right panel) */}
      <div className="w-full md:w-[45%] lg:w-[40%] flex items-center justify-center p-6 relative">
        {/* Glow behind form for mobile views */}
        <div className="absolute inset-0 bg-[#7C3AED]/3 rounded-full blur-[100px] pointer-events-none md:hidden"></div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm bg-white border border-slate-200 rounded-[28px] p-8 shadow-sm relative"
        >
          {/* Brand header for mobile only */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 bg-slate-50 border border-slate-200 rounded-2xl mb-4 text-slate-800 shadow-inner md:hidden">
              <FiLink className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Sign In</h2>
            <p className="text-xs text-slate-500 mt-1 font-light">Access your Aurora dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-550 uppercase tracking-widest mb-2.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <FiMail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all duration-300"
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-550 uppercase tracking-widest mb-2.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <FiLock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all duration-300"
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 mt-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-slate-100 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Log In
                  <FiArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <p className="text-center text-xs text-slate-550 mt-6 font-light">
            New here?{' '}
            <Link to="/register" className="text-violet-600 hover:underline font-semibold ml-1">
              Create an account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
