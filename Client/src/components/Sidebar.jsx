import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGrid, FiLink, FiX, FiLogOut, FiUser } from 'react-icons/fi';
import useAuth from '../hooks/useAuth';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();

  const sidebarContent = (
    <div className="w-[280px] h-[calc(100vh-2rem)] bg-white border border-slate-250/60 rounded-[24px] flex flex-col p-6 overflow-hidden relative shadow-sm">
      {/* Brand Logo Header */}
      <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-5 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-slate-900 rounded-xl text-white">
            <FiLink className="w-4 h-4" />
          </div>
          <span className="text-md font-bold text-slate-900 tracking-wider">
            LinkSnap
          </span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1.5 text-slate-400 hover:text-slate-600 lg:hidden hover:bg-slate-50 rounded-lg transition-colors"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto">
        <NavLink
          to="/dashboard"
          onClick={() => setIsOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3.5 px-4 py-2.5 rounded-xl font-medium text-[13px] tracking-wide transition-all duration-200 ${
              isActive
                ? 'bg-slate-100 text-slate-900 border border-slate-200/50'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
            }`
          }
        >
          <FiGrid className="w-4.5 h-4.5" />
          Dashboard
        </NavLink>

        <div className="pt-6 px-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
          Shortener Tools
        </div>

        <div className="text-slate-500 text-[11px] leading-relaxed px-4 pt-3.5 bg-slate-50 rounded-2xl border border-slate-100 p-4 mt-4 select-none">
          Click <strong className="text-violet-600 font-semibold">"View Analytics"</strong> inside the URLs list grid to inspect detailed click charts, geo metrics, and browser agents.
        </div>
      </nav>

      {/* User Profile Card at Bottom */}
      <div className="pt-5 border-t border-slate-100 flex items-center justify-between mt-auto gap-3 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white text-xs font-semibold shrink-0 shadow-inner">
            {user?.name ? user.name[0].toUpperCase() : <FiUser className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-900 truncate">{user?.name}</p>
            <p className="text-[9px] text-slate-400 truncate font-light mt-0.5">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={logout}
          title="Sign Out"
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-200 shrink-0 border border-transparent hover:border-rose-200/40"
        >
          <FiLogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Floating) */}
      <div className="hidden lg:flex flex-col m-4 mr-0 select-none shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 lg:hidden"
            />
            {/* Sidebar Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-0 bottom-0 left-0 m-4 z-50 lg:hidden"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
