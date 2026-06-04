import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import StatsCards from '../components/StatsCards';
import UrlForm from '../components/UrlForm';
import UrlTable from '../components/UrlTable';
import QRCodeModal from '../components/QRCodeModal';
import AnalyticsChart from '../components/AnalyticsChart';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  FiTrendingUp,
  FiClock,
  FiAward,
  FiArrowUpRight,
  FiExternalLink,
  FiGlobe,
  FiSmartphone,
  FiMonitor,
  FiCopy,
  FiMenu,
  FiActivity,
  FiCpu,
  FiPlay,
  FiSettings,
  FiCheckCircle,
  FiX,
  FiCalendar,
  FiMousePointer,
  FiFilter,
  FiShare2
} from 'react-icons/fi';
import { BsQrCode } from 'react-icons/bs';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import useAuth from '../hooks/useAuth';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('operational');
  const [urls, setUrls] = useState([]);
  const [pagination, setPagination] = useState({ totalItems: 0, totalPages: 1, currentPage: 1, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUrl, setEditingUrl] = useState(null);
  const [editOriginalUrl, setEditOriginalUrl] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [activeQrItem, setActiveQrItem] = useState(null);

  const [stats, setStats] = useState({ totalUrls: 0, totalClicks: 0, mostClickedCode: '', mostClickedCount: 0, todayClicks: 0 });
  const [topUrls, setTopUrls] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(false);

  const [globalChartData, setGlobalChartData] = useState({ clicksByDay: [], browserData: [], deviceData: [] });

  const [simLink, setSimLink] = useState('');
  const [simSteps, setSimSteps] = useState([]);
  const [simRunning, setSimRunning] = useState(false);
  const [simActiveStep, setSimActiveStep] = useState(-1);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerUrl, setDrawerUrl] = useState(null);
  const [drawerAnalytics, setDrawerAnalytics] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerChartData, setDrawerChartData] = useState({ browserData: [], deviceData: [] });

  const [selectedUrlFilter, setSelectedUrlFilter] = useState(null);
  const [sandboxTab, setSandboxTab] = useState('sim'); // 'sim' | 'mock'
  const [mockTargetUrlId, setMockTargetUrlId] = useState('');
  const [mockCount, setMockCount] = useState(50);
  const [mockDays, setMockDays] = useState(7);
  const [mockLogs, setMockLogs] = useState([]);
  const [mockRunning, setMockRunning] = useState(false);

  const fetchFilteredUrlAnalytics = async (urlItem) => {
    setLoading(true);
    setLoadingFeed(true);
    try {
      const res = await api.get(`/analytics/${urlItem._id}`);
      if (res.data && res.data.success) {
        const analData = res.data.data;
        const visits = analData.recentVisits || [];
        
        // Calculate browser & device data from visits
        const browsers = {};
        const devices = {};
        visits.forEach((v) => {
          const b = v.browser || 'Unknown';
          const d = v.device || 'Desktop';
          browsers[b] = (browsers[b] || 0) + 1;
          devices[d] = (devices[d] || 0) + 1;
        });

        const browserData = Object.keys(browsers).map((k) => ({ name: k, value: browsers[k] }));
        const deviceData = Object.keys(devices).map((k) => ({ name: k, value: devices[k] }));

        // Clicks by day
        const clicksByDay = [...analData.clicksByDay];
        clicksByDay.sort((a, b) => new Date(a.date) - new Date(b.date));

        setGlobalChartData({ browserData, deviceData, clicksByDay });
        
        // Activity Feed
        const mappedFeed = visits.map(v => ({
          ...v,
          shortCode: urlItem.shortCode,
          originalUrl: urlItem.originalUrl
        }));
        setActivityFeed(mappedFeed);

        // Compute today's clicks
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const todayClicks = visits
          .filter((v) => new Date(v.timestamp) >= startOfToday)
          .length;

        setStats({
          totalUrls: 1,
          totalClicks: analData.totalClicks || urlItem.clickCount,
          mostClickedCode: urlItem.shortCode,
          mostClickedCount: analData.totalClicks || urlItem.clickCount,
          todayClicks
        });
      }
    } catch (error) {
      console.error('Error fetching filtered analytics:', error);
      toast.error('Failed to load filter analytics');
    } finally {
      setLoading(false);
      setLoadingFeed(false);
    }
  };

  const handleGenerateMockTraffic = async () => {
    if (!mockTargetUrlId) {
      toast.error('Select a link to inject traffic into');
      return;
    }
    const targetUrl = urls.find(u => u._id === mockTargetUrlId);
    if (!targetUrl) return;

    setMockRunning(true);
    setMockLogs([
      `[SYS] Initiating Sandbox Traffic Generator for /${targetUrl.shortCode}...`,
      `[SYS] Parameters: count=${mockCount}, daysRange=${mockDays}`
    ]);

    try {
      await new Promise(r => setTimeout(r, 600));
      setMockLogs(prev => [...prev, `[DB] Connecting to MongoDB and validating ownership...`]);
      
      const res = await api.post(`/analytics/${mockTargetUrlId}/mock`, {
        count: mockCount,
        daysRange: mockDays
      });

      if (res.data && res.data.success) {
        await new Promise(r => setTimeout(r, 700));
        setMockLogs(prev => [...prev, `[DB] Generating visitor demographics (devices, browsers, timestamps)...`]);
        await new Promise(r => setTimeout(r, 700));
        setMockLogs(prev => [...prev, `[DB] Successfully injected ${res.data.data.generatedCount} visit records.`]);
        await new Promise(r => setTimeout(r, 500));
        setMockLogs(prev => [...prev, `[SYS] Re-calculating aggregations and rebuilding index views...`]);
        await new Promise(r => setTimeout(r, 500));
        
        toast.success(`Sandbox traffic generated!`);
        setMockLogs(prev => [...prev, `[SUCCESS] Complete! Reloading workspace views.`]);
        
        await fetchDashboardData(currentPage);
        const updatedUrl = urls.find(u => u._id === mockTargetUrlId) || targetUrl;
        setSelectedUrlFilter(updatedUrl);
      }
    } catch (error) {
      console.error(error);
      setMockLogs(prev => [...prev, `[ERROR] Injection failed: ${error.response?.data?.message || error.message}`]);
      toast.error('Failed to generate mock traffic');
    } finally {
      setMockRunning(false);
    }
  };

  const fetchDashboardData = async (page = 1) => {
    setLoading(true);
    try {
      const listRes = await api.get(`/urls?page=${page}&limit=10`);
      if (listRes.data && listRes.data.success) {
        const { urls: fetchedUrls, pagination: paging } = listRes.data.data;
        setUrls(fetchedUrls);
        setPagination(paging);
        setCurrentPage(paging.currentPage);
      }

      const statsRes = await api.get('/urls?limit=100');
      if (statsRes.data && statsRes.data.success) {
        const allUrls = statsRes.data.data.urls || [];
        const pagingMeta = statsRes.data.data.pagination || {};

        const totalClicks = allUrls.reduce((sum, item) => sum + (item.clickCount || 0), 0);
        const sortedUrls = [...allUrls].sort((a, b) => b.clickCount - a.clickCount);
        setTopUrls(sortedUrls.slice(0, 5));

        let mostClickedCode = sortedUrls.length > 0 ? sortedUrls[0].shortCode : '';
        let mostClickedCount = sortedUrls.length > 0 ? sortedUrls[0].clickCount : 0;

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const todayClicks = allUrls
          .filter((item) => new Date(item.createdAt) >= startOfToday)
          .reduce((sum, item) => sum + (item.clickCount || 0), 0);

        setStats({ totalUrls: pagingMeta.totalItems || allUrls.length, totalClicks, mostClickedCode, mostClickedCount, todayClicks });

        setLoadingFeed(true);
        const activeBatch = sortedUrls.slice(0, 5);
        if (activeBatch.length > 0) {
          const analPromises = activeBatch.map(item => api.get(`/analytics/${item._id}`).catch(() => null));
          const analResponses = await Promise.all(analPromises);
          
          let mergedVisits = [];
          let aggregatedBrowsers = {};
          let aggregatedDevices = {};
          let aggregatedClicksByDay = {};
          
          analResponses.forEach((res, index) => {
            if (res && res.data && res.data.success) {
              const urlItem = activeBatch[index];
              const visits = res.data.data.recentVisits || [];
              const clicks = res.data.data.clicksByDay || [];
              
              clicks.forEach(c => {
                aggregatedClicksByDay[c.date] = (aggregatedClicksByDay[c.date] || 0) + c.count;
              });

              visits.forEach(v => {
                mergedVisits.push({ ...v, shortCode: urlItem.shortCode, originalUrl: urlItem.originalUrl });
                const b = v.browser || 'Unknown';
                const d = v.device || 'Desktop';
                aggregatedBrowsers[b] = (aggregatedBrowsers[b] || 0) + 1;
                aggregatedDevices[d] = (aggregatedDevices[d] || 0) + 1;
              });
            }
          });

          mergedVisits.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          setActivityFeed(mergedVisits.slice(0, 5));

          const browserData = Object.keys(aggregatedBrowsers).map(k => ({ name: k, value: aggregatedBrowsers[k] }));
          const deviceData = Object.keys(aggregatedDevices).map(k => ({ name: k, value: aggregatedDevices[k] }));
          const clicksByDay = Object.keys(aggregatedClicksByDay).map(k => ({ date: k, count: aggregatedClicksByDay[k] }));
          clicksByDay.sort((a, b) => new Date(a.date) - new Date(b.date));

          setGlobalChartData({ browserData, deviceData, clicksByDay });
        } else {
          setActivityFeed([]);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setLoadingFeed(false);
    }
  };

  useEffect(() => {
    if (selectedUrlFilter) {
      fetchFilteredUrlAnalytics(selectedUrlFilter);
    } else {
      fetchDashboardData(currentPage);
    }
  }, [selectedUrlFilter, currentPage]);

  const handleCreateUrl = async (formData, resetFormCallback) => {
    setSubmitting(true);
    try {
      const res = await api.post('/urls', formData);
      if (res.data && res.data.success) {
        toast.success('Short link generated successfully!');
        resetFormCallback();
        await fetchDashboardData(1);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to shorten URL');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkCreate = async (urlsList, resetBulkFormCallback) => {
    setSubmitting(true);
    try {
      const res = await api.post('/urls/bulk', { urlsList });
      if (res.data && res.data.success) {
        toast.success(res.data.message || `Successfully shortened ${res.data.data.length} URLs!`);
        resetBulkFormCallback();
        await fetchDashboardData(1);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to shorten bulk URLs');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEditModal = (urlItem) => {
    setEditingUrl(urlItem);
    setEditOriginalUrl(urlItem.originalUrl);
    setEditModalOpen(true);
  };

  const handleEditUrlSubmit = async (e) => {
    e.preventDefault();
    if (!editOriginalUrl) {
      toast.error('Destination URL is required');
      return;
    }
    try {
      new URL(editOriginalUrl);
    } catch (_) {
      toast.error('Please enter a valid absolute URL (including http:// or https://)');
      return;
    }

    setEditSubmitting(true);
    try {
      const res = await api.put(`/urls/${editingUrl._id}`, { originalUrl: editOriginalUrl });
      if (res.data && res.data.success) {
        toast.success('Destination URL updated successfully');
        setEditModalOpen(false);
        setEditingUrl(null);
        setEditOriginalUrl('');
        await fetchDashboardData(currentPage);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update destination URL');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDeleteUrl = async (id) => {
    if (!window.confirm('Delete this short link? Associated visitor logs will be lost.')) return;
    try {
      const res = await api.delete(`/urls/${id}`);
      if (res.data && res.data.success) {
        toast.success('Link deleted');
        if (drawerOpen && drawerUrl?._id === id) setDrawerOpen(false);
        await fetchDashboardData(currentPage);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete link');
    }
  };

  const handleShowQR = async (urlItem) => {
    setActiveQrItem(null);
    setQrModalOpen(true);
    try {
      const res = await api.get(`/urls/${urlItem._id}`);
      if (res.data && res.data.success) setActiveQrItem(res.data.data);
    } catch (error) {
      toast.error('Failed to load QR code');
      setQrModalOpen(false);
    }
  };

  const handlePageChange = (newPage) => fetchDashboardData(newPage);

  const handleOpenDrawer = async (urlItem) => {
    setDrawerUrl(urlItem);
    setDrawerOpen(true);
    setDrawerLoading(true);
    setDrawerAnalytics(null);
    try {
      const res = await api.get(`/analytics/${urlItem._id}`);
      if (res.data && res.data.success) {
        const analData = res.data.data;
        setDrawerAnalytics(analData);
        const visits = analData.recentVisits || [];
        const browsers = {};
        const devices = {};
        visits.forEach((v) => {
          const b = v.browser || 'Unknown';
          const d = v.device || 'Desktop';
          browsers[b] = (browsers[b] || 0) + 1;
          devices[d] = (devices[d] || 0) + 1;
        });
        setDrawerChartData({
          browserData: Object.keys(browsers).map((k) => ({ name: k, value: browsers[k] })),
          deviceData: Object.keys(devices).map((k) => ({ name: k, value: devices[k] }))
        });
      }
    } catch (error) {
      toast.error('Failed to load quick analytics report');
    } finally {
      setDrawerLoading(false);
    }
  };

  const runSimulation = () => {
    if (!simLink) {
      toast.error('Select a link to simulate routing');
      return;
    }
    setSimRunning(true);
    setSimActiveStep(0);
    setSimSteps([
      { title: 'GET Request Received', desc: `Client GET request dispatched to /${simLink}`, status: 'active' },
      { title: 'MongoDB Lookup', desc: `Running index query: Url.findOne({ shortCode: "${simLink}" })`, status: 'pending' },
      { title: 'Redirection Logic', desc: 'Analyzing expiryDate and checking redirect status...', status: 'pending' },
      { title: 'Log Visitor Agent', desc: 'Emitting visit logging event capturing browser, device & IP', status: 'pending' },
      { title: 'Emit 302 Redirection', desc: 'Emitting HTTP status 302 with location redirect header', status: 'pending' },
    ]);
    [1000, 2000, 3000, 4000, 5000].forEach((delay, idx) => {
      setTimeout(() => {
        setSimActiveStep(idx);
        setSimSteps(prev => prev.map((s, sIdx) => {
          if (sIdx < idx) return { ...s, status: 'complete' };
          if (sIdx === idx) return { ...s, status: 'active' };
          return s;
        }));
        if (idx === 4) {
          setTimeout(() => {
            setSimSteps(prev => prev.map(s => ({ ...s, status: 'complete' })));
            setSimRunning(false);
            setSimActiveStep(6);
            toast.success('Simulation trace complete! Routing succeeded.');
          }, 1000);
        }
      }, delay);
    });
  };

  const getMedal = (index) => index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;
  const redirectBase = import.meta.env.VITE_REDIRECT_BASE || 'https://url-shortener-e004.onrender.com';
  const drawerShortUrl = drawerUrl ? `${redirectBase}/${drawerUrl.shortCode}` : '';

  return (
    <div className="space-y-6 select-none relative">
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5 mb-6">
        <div className="flex gap-6 relative select-none">
          {[
            { id: 'operational', label: 'Operations Console', icon: FiSettings },
            { id: 'analytics', label: 'Global Analytics Hub', icon: FiActivity }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-2.5 text-sm font-semibold tracking-wide transition-all relative ${active ? 'text-slate-900' : 'text-slate-400 hover:text-slate-650'}`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {active && (
                  <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
                )}
              </button>
            );
          })}
        </div>
        <span className="text-xs text-slate-400 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-inner font-light hidden sm:inline">System operational</span>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'operational' ? (
          <motion.div key="operational" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }} className="space-y-8">
            <div className="rounded-[28px] bg-white border border-slate-200 p-6 md:p-8 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="absolute -top-12 -left-12 w-48 h-48 bg-violet-600/5 rounded-full blur-[80px] pointer-events-none"></div>
              <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none"></div>
              <div className="relative z-10 space-y-2">
                <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest block">SaaS Hub workspace</span>
                <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">Welcome Back, <span className="text-violet-600">{user?.name || 'Tester'}</span></h1>
                <p className="text-xs text-slate-500 max-w-sm font-light">Your shortened codes are active. Below is your redirect traffic and visitor logs.</p>
              </div>
              <div className="flex items-center gap-8 relative z-10 font-mono">
                <div className="text-center md:text-left"><span className="text-[9px] font-semibold font-sans text-slate-400 uppercase tracking-wider block">Links</span><span className="text-xl font-bold text-slate-800">{stats.totalUrls}</span></div>
                <div className="w-px h-10 bg-slate-100 hidden md:block"></div>
                <div className="text-center md:text-left"><span className="text-[9px] font-semibold font-sans text-slate-400 uppercase tracking-wider block">Clicks</span><span className="text-xl font-bold text-slate-800">{stats.totalClicks}</span></div>
                <div className="w-px h-10 bg-slate-100 hidden md:block"></div>
                <div className="text-center md:text-left"><span className="text-[9px] font-semibold font-sans text-slate-400 uppercase tracking-wider block">Most Clicked</span><span className="text-xl font-bold text-violet-600">/{stats.mostClickedCode || 'None'}</span></div>
              </div>
            </div>
            <StatsCards stats={stats} loading={loading} />
            <UrlForm onSubmit={handleCreateUrl} onBulkSubmit={handleBulkCreate} submitting={submitting} />
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2 space-y-6">
                {selectedUrlFilter && (
                  <div className="bg-violet-50/50 border border-violet-100 px-5 py-3.5 rounded-[20px] flex items-center justify-between animate-fadeIn">
                    <div className="flex items-center gap-2.5">
                      <FiFilter className="text-violet-600 animate-pulse w-4 h-4" />
                      <span className="text-xs font-semibold text-slate-700">
                        Active Workspace Filter: <code className="bg-white border border-violet-200/40 text-violet-650 px-2 py-0.5 rounded-lg text-xs font-mono">/{selectedUrlFilter.shortCode}</code>
                      </span>
                    </div>
                    <button 
                      onClick={() => setSelectedUrlFilter(null)} 
                      className="text-xs font-bold text-violet-600 hover:text-violet-850 hover:underline transition-all"
                    >
                      Clear Filter
                    </button>
                  </div>
                )}
                
                <UrlTable 
                  urls={urls} 
                  pagination={pagination} 
                  loading={loading} 
                  onPageChange={handlePageChange} 
                  onShowQR={handleShowQR} 
                  onEdit={handleOpenEditModal}
                  onDelete={handleDeleteUrl} 
                  onViewAnalytics={handleOpenDrawer} 
                  onFilterSelect={setSelectedUrlFilter}
                  selectedFilterId={selectedUrlFilter?._id}
                />

                <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 select-none">
                    <div className="flex gap-4">
                      <button
                        onClick={() => setSandboxTab('sim')}
                        className={`text-[12px] font-semibold uppercase tracking-widest pb-1 transition-all ${sandboxTab === 'sim' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        Redirect Simulator
                      </button>
                      <button
                        onClick={() => setSandboxTab('mock')}
                        className={`text-[12px] font-semibold uppercase tracking-widest pb-1 transition-all ${sandboxTab === 'mock' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-400 hover:text-slate-605'}`}
                      >
                        Traffic Sandbox
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Workspace tools</span>
                  </div>

                  {sandboxTab === 'sim' ? (
                    <div className="space-y-4">
                      <p className="text-xs text-slate-500 font-light leading-relaxed">Choose one of your shortened codes to simulate redirection and trace backend validations, visit logs, and 302 routing headers.</p>
                      <div className="flex flex-col sm:flex-row gap-3 items-center">
                        <select value={simLink} onChange={(e) => setSimLink(e.target.value)} disabled={simRunning} className="w-full sm:flex-1 py-2.5 px-3 bg-slate-50 border border-slate-200 focus:border-slate-400 focus:ring-slate-400 text-slate-800 text-xs rounded-xl focus:outline-none transition-colors">
                          <option value="">-- Choose a shortened link to trace --</option>
                          {urls.map(url => <option key={url.shortCode} value={url.shortCode}>/{url.shortCode} → {url.originalUrl.substring(0, 35)}...</option>)}
                        </select>
                        <button type="button" onClick={runSimulation} disabled={simRunning || !simLink} className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-40"><FiPlay className="w-3.5 h-3.5" />{simRunning ? 'Tracing...' : 'Run Simulation'}</button>
                      </div>
                      {simSteps.length > 0 && (
                        <div className="bg-slate-950 p-4.5 rounded-2xl font-mono text-[11px] text-slate-350 space-y-3.5 border border-slate-900 max-h-[280px] overflow-y-auto select-text scrollbar-thin">
                          {simSteps.map((step, idx) => (
                            <div key={idx} className={`flex items-start gap-3 transition-opacity duration-300 ${step.status === 'complete' ? 'opacity-100' : simActiveStep === idx ? 'opacity-100 text-white font-bold' : 'opacity-35'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${step.status === 'complete' ? 'bg-emerald-500' : simActiveStep === idx ? 'bg-violet-500 animate-ping' : 'bg-slate-700'}`}></span>
                              <div className="flex-1 space-y-0.5">
                                <div className="flex items-center justify-between"><span className={`${step.status === 'complete' ? 'text-emerald-400' : simActiveStep === idx ? 'text-violet-400' : 'text-slate-400'}`}>{step.title}</span><span className="text-[9px] text-slate-500 uppercase tracking-wider">{step.status}</span></div>
                                <p className="text-slate-400 leading-normal font-light">{step.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-xs text-slate-500 font-light leading-relaxed">Inject mock visitor logs directly into MongoDB to populate your dashboard charts and test analytical views instantly.</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Target Slug</label>
                          <select value={mockTargetUrlId} onChange={(e) => setMockTargetUrlId(e.target.value)} disabled={mockRunning} className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 focus:border-slate-450 focus:ring-slate-450 text-slate-800 text-xs rounded-xl focus:outline-none transition-colors">
                            <option value="">-- Select link --</option>
                            {urls.map(url => <option key={url._id} value={url._id}>/{url.shortCode}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Visits count ({mockCount})</label>
                          <input type="range" min="10" max="200" step="10" value={mockCount} onChange={(e) => setMockCount(parseInt(e.target.value, 10))} disabled={mockRunning} className="w-full h-8 accent-violet-600 bg-slate-100 rounded-lg cursor-pointer" />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Time spread ({mockDays} days)</label>
                          <select value={mockDays} onChange={(e) => setMockDays(parseInt(e.target.value, 10))} disabled={mockRunning} className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl focus:outline-none transition-colors">
                            <option value="1">Last 24 Hours</option>
                            <option value="7">Last 7 Days</option>
                            <option value="14">Last 14 Days</option>
                            <option value="30">Last 30 Days</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={handleGenerateMockTraffic}
                          disabled={mockRunning || !mockTargetUrlId}
                          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-40"
                        >
                          <FiActivity className="w-3.5 h-3.5" />
                          {mockRunning ? 'Generating logs...' : 'Inject Traffic Data'}
                        </button>
                      </div>
                      {mockLogs.length > 0 && (
                        <div className="bg-slate-950 p-4.5 rounded-2xl font-mono text-[11px] text-slate-350 space-y-1.5 border border-slate-900 max-h-[180px] overflow-y-auto select-text scrollbar-thin">
                          {mockLogs.map((log, idx) => {
                            let color = 'text-slate-400';
                            if (log.includes('[SUCCESS]')) color = 'text-emerald-400 font-semibold';
                            if (log.includes('[ERROR]')) color = 'text-rose-450 font-semibold';
                            if (log.includes('[DB]')) color = 'text-cyan-400';
                            if (log.includes('[SYS]')) color = 'text-violet-400';
                            return <div key={idx} className={color}>{log}</div>;
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-8">
                <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-sm flex flex-col justify-between">
                  <h3 className="text-[12px] font-semibold text-slate-900 uppercase tracking-widest mb-4.5 flex items-center gap-2 border-b border-slate-100 pb-3"><FiAward className="text-pink-500" /> Top Performing Links</h3>
                  {topUrls.length === 0 ? <div className="text-slate-400 text-xs py-4 text-center font-light">No click rankings logged.</div> : (
                    <div className="divide-y divide-slate-100">
                      {topUrls.map((item, idx) => (
                        <div key={item.shortCode} className="py-3 flex items-center justify-between text-xs group">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-sm font-semibold w-6 text-center select-none text-slate-400 group-hover:text-slate-600 transition-colors">{getMedal(idx)}</span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <a href={`${redirectBase}/${item.shortCode}`} target="_blank" rel="noopener noreferrer" className="font-mono font-semibold text-slate-900 hover:text-violet-650 hover:underline flex items-center gap-0.5 w-fit">/{item.shortCode}<FiArrowUpRight className="w-3 h-3 text-slate-455 opacity-0 group-hover:opacity-100 transition-all" /></a>
                                <button 
                                  onClick={() => setSelectedUrlFilter(item)} 
                                  title="Filter Workspace to this Link"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-slate-100 rounded text-slate-400 hover:text-violet-650"
                                >
                                  <FiFilter className="w-3 h-3" />
                                </button>
                              </div>
                              <p className="text-[10px] text-slate-400 truncate max-w-[180px] font-light mt-0.5" title={item.originalUrl}>{item.originalUrl}</p>
                            </div>
                          </div>
                          <span className="font-mono font-bold text-slate-700 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg shrink-0">{item.clickCount} clicks</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-sm">
                  <h3 className="text-[12px] font-semibold text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-slate-100 pb-3"><FiClock className="text-cyan-500" /> Recent Activity Feed</h3>
                  {loadingFeed ? <div className="flex flex-col gap-4 animate-pulse py-4"><div className="h-10 bg-slate-50 rounded-xl"></div><div className="h-10 bg-slate-50 rounded-xl"></div></div> : activityFeed.length === 0 ? <div className="text-slate-400 text-xs py-4 text-center font-light">No redirect activity detected yet.</div> : (
                    <div className="relative border-l border-slate-100 pl-4 ml-2.5 space-y-6">
                      {activityFeed.map((v, index) => (
                        <div key={index} className="relative text-xs">
                          <span className="absolute -left-[21px] top-1 w-2 h-2 rounded-full bg-cyan-500 border border-[#F8FAFC] ring-4 ring-cyan-500/10"></span>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] text-slate-400 select-none"><span>{new Date(v.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span><span className="font-mono">{v.ipAddress}</span></div>
                            <p className="text-slate-600 font-light leading-relaxed">Someone visited <a href={`${redirectBase}/${v.shortCode}`} target="_blank" rel="noopener noreferrer" className="font-mono font-semibold text-slate-900 hover:text-violet-600 hover:underline">/{v.shortCode}</a> via <strong className="text-slate-700 font-semibold">{v.browser}</strong> on {v.device}.</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }} className="space-y-8">
            <div className="rounded-[28px] bg-white border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-2 tracking-tight">Global Workspace Analytics</h2>
              <p className="text-xs text-slate-500 font-light max-w-xl">Aggregated statistics and redirect trends calculated across your top shortened links in real-time.</p>
            </div>
            <AnalyticsChart clicksByDay={globalChartData.clicksByDay} browserData={globalChartData.browserData} deviceData={globalChartData.deviceData} />
          </motion.div>
        )}
      </AnimatePresence>

      <QRCodeModal isOpen={qrModalOpen} onClose={() => { setQrModalOpen(false); setActiveQrItem(null); }} urlItem={activeQrItem} />

      {/* Edit Destination URL Modal */}
      <AnimatePresence>
        {editModalOpen && editingUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setEditModalOpen(false); setEditingUrl(null); }}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-md rounded-[24px] bg-white border border-slate-200 p-6 relative shadow-xl z-10"
            >
              {/* Close Button */}
              <button
                onClick={() => { setEditModalOpen(false); setEditingUrl(null); }}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="text-center mb-6">
                <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-widest">Edit Destination URL</h3>
                <p className="text-xs text-slate-500 mt-1 truncate">Short Code: /{editingUrl.shortCode}</p>
              </div>

              {/* Edit Form */}
              <form onSubmit={handleEditUrlSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">
                    Original Destination URL *
                  </label>
                  <input
                    type="text"
                    value={editOriginalUrl}
                    onChange={(e) => setEditOriginalUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 text-sm text-slate-850 placeholder-slate-400 focus:outline-none transition-all duration-300"
                    placeholder="https://example.com/long-original-url"
                    required
                  />
                </div>

                <div className="flex items-center gap-3 pt-2 justify-end">
                  <button
                    type="button"
                    onClick={() => { setEditModalOpen(false); setEditingUrl(null); }}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50 text-sm font-medium transition-all"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={editSubmitting}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-sm font-semibold shadow-sm transition-all disabled:opacity-50"
                  >
                    {editSubmitting ? 'Updating...' : 'Update Destination'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {drawerOpen && drawerUrl && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawerOpen(false)} className="fixed inset-0 bg-slate-950/20 backdrop-blur-xs z-40" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 26, stiffness: 220 }} className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white border-l border-slate-200 shadow-2xl z-50 overflow-y-auto flex flex-col justify-between">
              <div>
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <div><span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest block">Quick Report</span><h3 className="text-sm font-bold text-slate-900 mt-0.5">Link Console</h3></div>
                  <button onClick={() => setDrawerOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"><FiX className="w-5 h-5" /></button>
                </div>
                <div className="p-6 space-y-6">
                  <div className="space-y-3 bg-slate-50 border border-slate-200/60 p-4.5 rounded-2xl relative overflow-hidden">
                    <div><span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Destination</span><p className="text-xs font-semibold text-slate-900 truncate" title={drawerUrl.originalUrl}>{drawerUrl.originalUrl}</p></div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/40">
                      <div><span className="text-[9px] font-semibold text-slate-450 uppercase tracking-wider block">Short Slug</span><a href={drawerShortUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-violet-650 hover:underline flex items-center gap-1 mt-0.5">/{drawerUrl.shortCode}<FiExternalLink className="w-3.5 h-3.5 text-slate-400" /></a></div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => { navigator.clipboard.writeText(drawerShortUrl); toast.success('Short url copied'); }} className="p-2 text-slate-500 hover:text-slate-900 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-colors shadow-sm"><FiCopy className="w-4 h-4" /></button>
                        <button onClick={() => handleShowQR(drawerUrl)} className="p-2 text-slate-500 hover:text-slate-900 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-colors shadow-sm"><BsQrCode className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                  {drawerLoading ? (
                    <div className="space-y-4 animate-pulse"><div className="h-32 bg-slate-50 rounded-2xl border border-slate-200"></div><div className="h-32 bg-slate-50 rounded-2xl border border-slate-200"></div></div>
                  ) : drawerAnalytics ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50/50 border border-slate-200/80 p-4 rounded-2xl flex items-center justify-between"><div><span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block">Clicks</span><span className="text-xl font-bold text-slate-900 mt-1 block">{drawerAnalytics.totalClicks}</span></div><div className="p-2 rounded-xl bg-violet-50 text-violet-600 border border-violet-100"><FiMousePointer className="w-4 h-4" /></div></div>
                        <div className="bg-slate-50/50 border border-slate-200/80 p-4 rounded-2xl flex items-center justify-between"><div><span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block">Coverage</span><span className="text-xl font-bold text-slate-900 mt-1 block">{drawerAnalytics.recentVisits.length} logs</span></div><div className="p-2 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100"><FiMonitor className="w-4 h-4" /></div></div>
                      </div>
                      <div className="bg-violet-50/30 border border-violet-100 p-4 rounded-2xl flex items-center justify-between">
                        <div>
                          <span className="text-[9px] font-semibold text-violet-650 uppercase tracking-wider block">Public Stats Page</span>
                          <span className="text-xs font-bold text-slate-800 mt-0.5 block">Share real-time click analytics</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/stats/${drawerUrl.shortCode}`);
                            toast.success('Public stats link copied to clipboard!');
                          }}
                          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 active:scale-[0.98]"
                        >
                          <FiShare2 className="w-3.5 h-3.5" /> Share Stats
                        </button>
                      </div>
                      <div className="bg-white border border-slate-200/80 p-4 rounded-2xl">
                        <span className="text-[9px] font-semibold text-slate-450 uppercase tracking-wider block mb-4">Click Trend (Last 7 Days)</span>
                        <div className="h-44 w-full">
                          {drawerAnalytics.clicksByDay.length === 0 ? <div className="h-full flex items-center justify-center text-slate-400 text-xs font-light">No visits logged.</div> : (
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={drawerAnalytics.clicksByDay} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                                <defs><linearGradient id="drawerColorClicks" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#7C3AED" stopOpacity={0.15} /><stop offset="95%" stopColor="#7C3AED" stopOpacity={0} /></linearGradient></defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} allowDecimals={false} />
                                <RechartsTooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', color: '#0F172A', fontSize: '10px' }} />
                                <Area type="monotone" dataKey="count" name="Clicks" stroke="#7C3AED" strokeWidth={1.5} fill="url(#drawerColorClicks)" />
                              </AreaChart>
                            </ResponsiveContainer>
                          )}
                        </div>
                      </div>
                      <div className="bg-white border border-slate-200/80 p-4 rounded-2xl">
                        <span className="text-[9px] font-semibold text-slate-455 uppercase tracking-wider block mb-4">Browser Shares</span>
                        <div className="h-44 w-full flex items-center justify-center">
                          {drawerChartData.browserData.length === 0 ? <div className="text-slate-400 text-xs font-light">No browsers logged.</div> : (
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie data={drawerChartData.browserData} cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={3} dataKey="value" nameKey="name">
                                  {drawerChartData.browserData.map((entry, index) => <Cell key={`cell-${index}`} fill={['#7C3AED', '#06B6D4', '#EC4899', '#38BDF8'][index % 4]} />)}
                                </Pie>
                                <RechartsTooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', color: '#0F172A', fontSize: '10px' }} />
                              </PieChart>
                            </ResponsiveContainer>
                          )}
                        </div>
                      </div>
                      <div className="space-y-3.5">
                        <span className="text-[9px] font-semibold text-slate-455 uppercase tracking-wider block mb-2">Recent Logs</span>
                        <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                          {drawerAnalytics.recentVisits.slice(0, 4).map((visit, index) => (
                            <div key={index} className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-center justify-between text-[11px]">
                              <div className="min-w-0"><span className="font-semibold text-slate-800">{visit.browser}</span><p className="text-[10px] text-slate-455 font-mono truncate">{visit.ipAddress}</p></div>
                              <span className="text-[10px] text-slate-400 shrink-0">{new Date(visit.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : <div className="text-center py-10 text-slate-400 text-xs">No statistics log found.</div>}
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center gap-3">
                <button type="button" onClick={() => { setDrawerOpen(false); navigate(`/analytics/${drawerUrl._id}`); }} className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all text-center flex items-center justify-center gap-1.5"><FiActivity className="w-3.5 h-3.5" />Open Full Report</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
