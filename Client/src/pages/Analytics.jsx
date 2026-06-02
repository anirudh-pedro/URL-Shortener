import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowLeft,
  FiMousePointer,
  FiCalendar,
  FiSmartphone,
  FiMonitor,
  FiExternalLink,
  FiCopy,
  FiGlobe,
  FiClock
} from 'react-icons/fi';
import AnalyticsChart from '../components/AnalyticsChart';
import api from '../services/api';
import toast from 'react-hot-toast';

const Analytics = () => {
  const { urlId } = useParams();
  const [loading, setLoading] = useState(true);
  
  const [urlDetails, setUrlDetails] = useState(null);
  const [analytics, setAnalytics] = useState({ totalClicks: 0, lastVisited: null, recentVisits: [], clicksByDay: [] });
  const [chartData, setChartData] = useState({ browserData: [], deviceData: [] });

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      try {
        // Query both URL metadata and visits aggregation in parallel
        const [urlRes, analRes] = await Promise.all([
          api.get(`/urls/${urlId}`),
          api.get(`/analytics/${urlId}`),
        ]);

        if (urlRes.data && urlRes.data.success) {
          setUrlDetails(urlRes.data.data);
        }

        if (analRes.data && analRes.data.success) {
          const analData = analRes.data.data;
          setAnalytics(analData);

          // Aggregate browser and device distributions dynamically from visits log
          const visits = analData.recentVisits || [];
          const browsers = {};
          const devices = {};

          visits.forEach((v) => {
            const b = v.browser || 'Unknown';
            const d = v.device || 'Desktop';
            browsers[b] = (browsers[b] || 0) + 1;
            devices[d] = (devices[d] || 0) + 1;
          });

          const browserData = Object.keys(browsers).map((key) => ({
            name: key,
            value: browsers[key],
          }));

          const deviceData = Object.keys(devices).map((key) => ({
            name: key,
            value: devices[key],
          }));

          setChartData({ browserData, deviceData });
        }
      } catch (error) {
        console.error('Error loading analytics:', error);
        toast.error('Failed to load URL analytics data');
      } finally {
        setLoading(false);
      }
    };

    if (urlId) {
      fetchAnalyticsData();
    }
  }, [urlId]);

  const handleCopy = (shortUrl) => {
    navigator.clipboard.writeText(shortUrl);
    toast.success('Short link copied to clipboard!');
  };

  const getStatusBadge = (url) => {
    if (!url.expiryDate) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
          ACTIVE
        </span>
      );
    }

    const expired = new Date() > new Date(url.expiryDate);
    const diffTime = new Date(url.expiryDate) - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const expiresSoon = diffDays >= 0 && diffDays <= 3;

    if (expired) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]"></span>
          EXPIRED
        </span>
      );
    }

    if (expiresSoon) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse"></span>
          EXPIRES SOON
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
        ACTIVE
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse p-1 select-none">
        <div>
          <div className="h-4 w-32 bg-slate-100 rounded-md mb-3"></div>
          <div className="h-7 w-48 bg-slate-100 rounded-md"></div>
        </div>
        
        {/* URL Meta details block skeleton */}
        <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1 space-y-3">
            <div className="h-3 w-16 bg-slate-100 rounded"></div>
            <div className="h-5 w-3/4 bg-slate-100 rounded"></div>
            <div className="h-3 w-40 bg-slate-100 rounded"></div>
          </div>
          <div className="h-16 w-60 bg-slate-100 rounded-2xl"></div>
        </div>

        {/* Key Indicators skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-24 bg-white border border-slate-200 rounded-[24px]"></div>
          <div className="h-24 bg-white border border-slate-200 rounded-[24px]"></div>
          <div className="h-24 bg-white border border-slate-200 rounded-[24px]"></div>
        </div>

        {/* Charts block skeleton */}
        <div className="h-96 bg-white border border-slate-200 rounded-[24px]"></div>
      </div>
    );
  }

  const redirectBase = import.meta.env.VITE_REDIRECT_BASE || 'http://localhost:5000';
  const shortUrl = urlDetails ? `${redirectBase}/${urlDetails.shortCode}` : '';

  return (
    <div className="space-y-8 select-none">
      {/* Header controls and titles */}
      <div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-[10px] font-semibold text-slate-500 hover:text-slate-800 uppercase tracking-widest transition-colors mb-2 group"
        >
          <FiArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Dashboard
        </Link>
        <h1 className="text-xl font-bold text-slate-900 w-fit uppercase tracking-wider">
          Link Analytics
        </h1>
      </div>

      {/* URL Meta details block */}
      {urlDetails && (
        <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-violet-600/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="min-w-0 flex-1 relative z-10">
            <div className="flex items-center gap-3 mb-2.5">
              <span className="text-[9px] font-semibold text-slate-450 uppercase tracking-widest font-sans">Original Link</span>
              {getStatusBadge(urlDetails)}
            </div>
            <h2 className="text-sm md:text-base text-slate-900 font-bold truncate mb-4 max-w-xl lg:max-w-2xl" title={urlDetails.originalUrl}>
              {urlDetails.originalUrl}
            </h2>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <FiCalendar className="w-4 h-4 text-slate-400" />
                <span>Created: {new Date(urlDetails.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
              </div>
              {urlDetails.expiryDate && (
                <div className="flex items-center gap-2 text-amber-600/80">
                  <FiCalendar className="w-4 h-4" />
                  <span>Expires: {new Date(urlDetails.expiryDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-1.5 shrink-0 bg-slate-50 border border-slate-200 p-4.5 rounded-2xl font-mono text-sm min-w-[240px] relative z-10">
            <span className="text-[9px] font-semibold text-slate-450 uppercase tracking-widest font-sans mb-1 block">Short Link</span>
            <div className="flex items-center justify-between gap-3">
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-600 hover:text-violet-800 font-bold flex items-center gap-1.5 hover:underline transition-colors"
              >
                /{urlDetails.shortCode}
                <FiExternalLink className="w-4 h-4 text-slate-400" />
              </a>
              <button
                onClick={() => handleCopy(shortUrl)}
                className="p-1.5 rounded-lg text-slate-550 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all duration-200"
                title="Copy Link"
              >
                <FiCopy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Key Indicators row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200/80 rounded-[24px] p-5.5 flex items-center justify-between shadow-sm relative overflow-hidden group hover:border-slate-300 transition-all duration-300">
          <div className="absolute -top-12 -left-12 w-24 h-24 bg-violet-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-violet-550/10 transition-all"></div>
          <div className="relative z-10">
            <p className="text-[10px] font-semibold text-slate-450 uppercase tracking-widest">Total Clicks</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{analytics.totalClicks}</h3>
          </div>
          <div className="p-3 rounded-xl bg-violet-50 border border-violet-100 text-violet-600 group-hover:scale-110 transition-transform duration-300">
            <FiMousePointer className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-[24px] p-5.5 flex items-center justify-between shadow-sm relative overflow-hidden group hover:border-slate-300 transition-all duration-300">
          <div className="absolute -top-12 -left-12 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-550/10 transition-all"></div>
          <div className="relative z-10 min-w-0">
            <p className="text-[10px] font-semibold text-slate-450 uppercase tracking-widest">Last Visited</p>
            <h3 className="text-sm font-bold text-slate-900 mt-2.5 truncate pr-2">
              {analytics.lastVisited ? new Date(analytics.lastVisited).toLocaleString() : 'Never'}
            </h3>
          </div>
          <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-100 text-cyan-600 group-hover:scale-110 transition-transform duration-300 shrink-0">
            <FiCalendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-[24px] p-5.5 flex items-center justify-between shadow-sm relative overflow-hidden group hover:border-slate-300 transition-all duration-300 md:col-span-2 lg:col-span-1">
          <div className="absolute -top-12 -left-12 w-24 h-24 bg-pink-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-pink-550/10 transition-all"></div>
          <div className="relative z-10">
            <p className="text-[10px] font-semibold text-slate-455 uppercase tracking-widest">Log Coverage</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{analytics.recentVisits.length} Records</h3>
          </div>
          <div className="p-3 rounded-xl bg-pink-50 border border-pink-100 text-pink-600 group-hover:scale-110 transition-transform duration-300">
            <FiMonitor className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Chart widgets mapping Recharts elements */}
      <AnalyticsChart
        clicksByDay={analytics.clicksByDay}
        browserData={chartData.browserData}
        deviceData={chartData.deviceData}
      />

      {/* Detailed visitor logs grid list */}
      <div className="space-y-5">
        <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
          <h2 className="text-[12px] font-semibold text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <FiClock className="text-pink-500" />
            Recent Visitor Logs
          </h2>
          <span className="text-xs text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
            Total Logs: {analytics.recentVisits.length}
          </span>
        </div>

        {analytics.recentVisits.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-[24px] p-12 text-center text-slate-400 text-sm font-light">
            No visitor logs recorded for this link yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analytics.recentVisits.map((visit, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: idx * 0.04 }}
                className="bg-white border border-slate-200/70 rounded-[20px] p-5 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] hover:border-slate-350 hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4 group"
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                      <FiGlobe className="w-4 h-4 text-cyan-600" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-slate-900 truncate">{visit.browser}</h4>
                      <p className="text-[9px] text-slate-400 uppercase tracking-wider font-sans">Browser</p>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-slate-655 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg shrink-0">
                    {visit.ipAddress}
                  </span>
                </div>

                {/* Body */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    {visit.device === 'Mobile' ? (
                      <FiSmartphone className="w-4 h-4 text-slate-400" />
                    ) : (
                      <FiMonitor className="w-4 h-4 text-slate-400" />
                    )}
                    <span className="font-light">Device: <strong className="text-slate-800 font-semibold">{visit.device}</strong></span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600">
                    <FiCalendar className="w-4 h-4 text-slate-400" />
                    <span className="font-light">Timestamp: <strong className="text-slate-800 font-semibold">{new Date(visit.timestamp).toLocaleString()}</strong></span>
                  </div>
                </div>

                {/* Footer (User Agent) */}
                <div className="pt-3 border-t border-slate-100">
                  <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest block mb-1">User Agent</span>
                  <p className="text-[10px] text-slate-450 font-mono bg-slate-50 p-2 rounded-lg break-all line-clamp-2 group-hover:line-clamp-none transition-all duration-350" title={visit.userAgent}>
                    {visit.userAgent}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
