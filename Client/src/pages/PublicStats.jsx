import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiLink, FiArrowLeft, FiClock, FiActivity, FiGlobe, FiMonitor } from 'react-icons/fi';
import api from '../services/api';
import AnalyticsChart from '../components/AnalyticsChart';

const PublicStats = () => {
  const { shortCode } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPublicAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/analytics/public/${shortCode}`);
        if (res.data && res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to load public analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicAnalytics();
  }, [shortCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
        <div className="flex items-center gap-3 animate-pulse">
          <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
          <div className="h-6 w-32 bg-slate-200 rounded-md"></div>
        </div>
        <div className="mt-8 w-full max-w-4xl space-y-6">
          <div className="h-28 bg-white border border-slate-200 rounded-[24px] animate-pulse"></div>
          <div className="h-96 bg-white border border-slate-200 rounded-[24px] animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mb-4">
          <FiLink className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Link Analytics Unreachable</h1>
        <p className="text-sm text-slate-500 max-w-sm mt-2 font-light">{error}</p>
        <Link to="/" className="mt-6 flex items-center gap-2 text-xs font-semibold bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-colors shadow-sm">
          <FiArrowLeft /> Back to Home
        </Link>
      </div>
    );
  }

  const redirectBase = import.meta.env.VITE_REDIRECT_BASE || 'https://url-shortener-e004.onrender.com';
  const shortUrl = `${redirectBase}/${shortCode}`;

  // Prepare browser and device data
  const browsers = {};
  const devices = {};
  const visits = data.recentVisits || [];
  visits.forEach((v) => {
    const b = v.browser || 'Unknown';
    const d = v.device || 'Desktop';
    browsers[b] = (browsers[b] || 0) + 1;
    devices[d] = (devices[d] || 0) + 1;
  });

  const browserData = Object.keys(browsers).map((k) => ({ name: k, value: browsers[k] }));
  const deviceData = Object.keys(devices).map((k) => ({ name: k, value: devices[k] }));

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col pb-12 relative overflow-hidden" style={{ backgroundImage: 'radial-gradient(rgba(15, 23, 42, 0.02) 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      {/* Background Animated Glow Blobs */}
      <div className="absolute -top-40 -left-40 w-[450px] h-[450px] bg-violet-600/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute top-[400px] -right-40 w-[450px] h-[450px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Public Navbar */}
      <header className="w-full border-b border-slate-200/80 bg-white/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-900 rounded-xl text-white">
              <FiLink className="w-4.5 h-4.5" />
            </div>
            <span className="text-base font-bold text-slate-900 tracking-wider">LinkSnap</span>
          </Link>
          <span className="text-[10px] text-slate-450 uppercase tracking-widest font-semibold bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">Public Report</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl w-full mx-auto px-6 mt-8 space-y-8 relative z-10">
        {/* Info Header Card */}
        <div className="rounded-[28px] bg-white border border-slate-200 p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 min-w-0">
            <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest block">Shortened Slug /{shortCode}</span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight truncate" title={data.originalUrl}>
              Destination: <a href={data.originalUrl} target="_blank" rel="noopener noreferrer" className="text-violet-650 hover:underline">{data.originalUrl}</a>
            </h1>
            <p className="text-xs text-slate-500 font-light">Short URL: <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-slate-800 hover:underline">{shortUrl}</a></p>
          </div>
          <div className="flex items-center gap-8 shrink-0">
            <div>
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block">Total Clicks</span>
              <span className="text-xl font-bold text-slate-900">{data.totalClicks}</span>
            </div>
            <div className="w-px h-8 bg-slate-100"></div>
            <div>
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block">Created On</span>
              <span className="text-sm font-bold text-slate-850">{new Date(data.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {/* Recharts Analytics Charts */}
        <AnalyticsChart clicksByDay={data.clicksByDay} browserData={browserData} deviceData={deviceData} />

        {/* Public Visitor Logs List (IP address and UA masked for privacy compliance) */}
        <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 shadow-sm">
          <h3 className="text-[12px] font-semibold text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
            <FiClock className="text-cyan-500 animate-pulse" />
            Recent Visit Timeline (Anonymous logs)
          </h3>
          {visits.length === 0 ? (
            <div className="text-slate-450 text-xs py-6 text-center font-light">No click logs registered yet.</div>
          ) : (
            <div className="relative border-l border-slate-100 pl-4 ml-2.5 space-y-6">
              {visits.map((v, index) => (
                <div key={index} className="relative text-xs">
                  <span className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-cyan-500 border border-white ring-4 ring-cyan-500/10"></span>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{new Date(v.timestamp).toLocaleString()}</span>
                      <span className="font-semibold text-slate-800 uppercase">{v.device}</span>
                    </div>
                    <p className="text-slate-550 font-light">
                      Visitor from a <strong className="text-slate-700 font-semibold">{v.device}</strong> device accessed the slug using <strong className="text-slate-700 font-semibold">{v.browser}</strong>.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PublicStats;
