import React from 'react';
import { FiMenu, FiLink } from 'react-icons/fi';

const Navbar = ({ toggleSidebar }) => {
  return (
    <header className="h-16 lg:hidden border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6 select-none shrink-0">
      {/* Mobile Sidebar Hamburger Menu Toggle */}
      <button
        onClick={toggleSidebar}
        className="p-2 text-slate-500 hover:text-slate-950 focus:outline-none hover:bg-slate-100 rounded-xl transition-all border border-transparent hover:border-slate-200"
      >
        <FiMenu className="w-5 h-5" />
      </button>

      {/* Mobile-only Centered Brand Label */}
      <div className="flex items-center gap-2">
        <FiLink className="w-4.5 h-4.5 text-slate-800" />
        <span className="text-sm font-bold text-slate-900 tracking-widest uppercase">
          LinkSnap
        </span>
      </div>

      {/* Symmetric Alignment spacer */}
      <div className="w-9" />
    </header>
  );
};

export default Navbar;
