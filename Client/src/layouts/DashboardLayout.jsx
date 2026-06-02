import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import useAuth from '../hooks/useAuth';

const DashboardLayout = () => {
  const { isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // loading session recovering indicators
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex items-center justify-center relative overflow-hidden">
        {/* Glow effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-xs font-medium tracking-widest uppercase">Securing connection...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if unauthenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex relative overflow-hidden font-sans">
      {/* Radial animated blobs for the premium Aurora Night feel */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-[#7C3AED]/3 rounded-full blur-[130px] animate-orb-1 pointer-events-none"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-[600px] h-[600px] bg-[#06B6D4]/3 rounded-full blur-[130px] animate-orb-2 pointer-events-none"></div>

      {/* Floating navigation sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content viewport */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen z-10 relative">
        <Navbar toggleSidebar={() => setSidebarOpen(true)} />
        
        {/* Spacious Main Panel */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 max-w-[1400px] w-full mx-auto">
          {/* Framer motion page transitions */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
