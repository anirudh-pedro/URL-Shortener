import React from 'react';
import { FiLink, FiMousePointer, FiTrendingUp, FiZap } from 'react-icons/fi';

const StatsCards = ({ stats, loading }) => {
  const cardData = [
    {
      title: 'Total Links',
      value: stats?.totalUrls ?? 0,
      subtext: 'Shortened codes',
      trend: '+12.4%',
      icon: FiLink,
      color: 'text-violet-400 border-violet-500/20 shadow-violet-500/5',
    },
    {
      title: 'Total Clicks',
      value: stats?.totalClicks ?? 0,
      subtext: 'Aggregated visits',
      trend: '+25.1%',
      icon: FiMousePointer,
      color: 'text-cyan-400 border-cyan-500/20 shadow-cyan-500/5',
    },
    {
      title: 'Active Links',
      value: stats?.totalUrls ?? 0,
      subtext: 'Accepting redirects',
      trend: '100% Up',
      icon: FiZap,
      color: 'text-emerald-400 border-emerald-500/20 shadow-emerald-500/5',
    },
    {
      title: 'Top Performing Link',
      value: stats?.mostClickedCode ? `/${stats.mostClickedCode}` : 'None',
      subtext: stats?.mostClickedCount !== undefined ? `${stats.mostClickedCount} clicks` : 'No clicks logged',
      trend: 'Peak hits',
      icon: FiTrendingUp,
      color: 'text-pink-400 border-pink-500/20 shadow-pink-500/5',
    },
  ];

  // Animated loading skeleton placeholders
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 select-none">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-28 rounded-[24px] bg-white border border-slate-200/80 p-5 flex flex-col justify-between animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-20 bg-slate-100 rounded"></div>
              <div className="w-8 h-8 bg-slate-100 rounded-lg"></div>
            </div>
            <div className="h-5 w-12 bg-slate-100 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 select-none">
      {cardData.map((card, idx) => {
        const Icon = card.icon;
        
        // Custom color themes for icons to look premium and curated (not generic)
        const iconTheme = 
          idx === 0 ? 'text-violet-600 bg-violet-50 border-violet-100' :
          idx === 1 ? 'text-cyan-600 bg-cyan-50 border-cyan-100' :
          idx === 2 ? 'text-emerald-600 bg-emerald-50 border-emerald-100' :
          'text-pink-600 bg-pink-50 border-pink-100';

        // Trend badge colors matching Cemdash
        const trendClass = 
          idx === 0 ? 'text-violet-600 bg-violet-50/60 border-violet-100/60' :
          idx === 1 ? 'text-cyan-600 bg-cyan-50/60 border-cyan-100/60' :
          idx === 2 ? 'text-emerald-600 bg-emerald-50/60 border-emerald-100/60' :
          'text-pink-600 bg-pink-50/60 border-pink-100/60';

        return (
          <div
            key={idx}
            className="rounded-[24px] bg-white border border-slate-200/70 p-5 flex flex-col justify-between shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] transition-all duration-350 hover:-translate-y-1 hover:shadow-md hover:border-slate-300 group"
          >
            {/* Top row - Label and Icon */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-slate-400 tracking-widest uppercase">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl border transition-colors ${iconTheme}`}>
                <Icon className="w-4.5 h-4.5" />
              </div>
            </div>

            {/* Bottom row - Value, Subtext, and Trend */}
            <div className="mt-4 flex items-end justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-2xl font-bold text-slate-900 truncate tracking-tight">{card.value}</h3>
                {card.subtext && (
                  <p className="text-[10px] text-slate-400 mt-1.5 truncate font-light leading-none">
                    {card.subtext} <span className="text-slate-350">· than last week</span>
                  </p>
                )}
              </div>

              {/* Trend Tag */}
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${trendClass}`}>
                {card.trend}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
