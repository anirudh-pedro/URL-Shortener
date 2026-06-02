import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
  LineChart,
  Line,
} from 'recharts';
import { FiActivity, FiTrendingUp } from 'react-icons/fi';

// Strict color schema variables
const PURPLE = '#7C3AED';
const CYAN = '#06B6D4';
const PINK = '#EC4899';
const COLORS = [PURPLE, CYAN, PINK, '#9061F9', '#38BDF8', '#F472B6'];

const AnalyticsChart = ({ clicksByDay = [], browserData = [], deviceData = [] }) => {
  const [chartType, setChartType] = useState('area');

  const renderTrendChart = () => {
    if (chartType === 'bar') {
      return (
        <BarChart data={clicksByDay} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
          <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              borderColor: '#E2E8F0',
              borderRadius: '16px',
              color: '#0F172A',
              fontSize: '11px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            }}
            cursor={{ fill: 'rgba(0,0,0,0.01)', opacity: 0.1 }}
          />
          <Bar dataKey="count" name="Clicks" fill={PURPLE} radius={[4, 4, 0, 0]} />
        </BarChart>
      );
    }

    if (chartType === 'line') {
      return (
        <LineChart data={clicksByDay} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
          <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              borderColor: '#E2E8F0',
              borderRadius: '16px',
              color: '#0F172A',
              fontSize: '11px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            }}
            cursor={{ stroke: '#E2E8F0', strokeWidth: 1 }}
          />
          <Line type="monotone" dataKey="count" name="Clicks" stroke={PURPLE} strokeWidth={2.5} dot={{ r: 4, stroke: PURPLE, strokeWidth: 2, fill: '#FFFFFF' }} activeDot={{ r: 6 }} />
        </LineChart>
      );
    }

    // Default to Area Chart
    return (
      <AreaChart data={clicksByDay} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={PURPLE} stopOpacity={0.2} />
            <stop offset="95%" stopColor={PURPLE} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#FFFFFF',
            borderColor: '#E2E8F0',
            borderRadius: '16px',
            color: '#0F172A',
            fontSize: '11px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          }}
          cursor={{ stroke: '#E2E8F0', strokeWidth: 1 }}
        />
        <Area type="monotone" dataKey="count" name="Clicks" stroke={PURPLE} strokeWidth={2} fillOpacity={1} fill="url(#colorClicks)" />
      </AreaChart>
    );
  };

  return (
    <div className="space-y-8 select-none">
      {/* 1. Daily Click Trend Area/Line/Bar Chart */}
      <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-[11px] font-semibold text-slate-800 uppercase tracking-widest flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#06B6D4]"></div>
            Daily Click Trend (Last 7 Days)
          </h3>
          <div className="inline-flex bg-slate-50 border border-slate-200/60 p-0.5 rounded-xl self-start sm:self-auto">
            {['area', 'line', 'bar'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setChartType(type)}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-lg tracking-wider transition-all ${
                  chartType === type
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/40'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="h-80 w-full">
          {clicksByDay.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-450 text-xs font-light">
              No click activity logged in the last 7 days.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {renderTrendChart()}
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 2. Browser & Device Distributions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Browser Pie Chart */}
        <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-sm">
          <h3 className="text-[11px] font-semibold text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]"></div>
            Browser Breakdown
          </h3>
          <div className="h-64 w-full relative">
            {browserData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-450 text-xs font-light">
                No browser visits logged.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={browserData}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={72}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                  >
                    {browserData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E2E8F0',
                      borderRadius: '16px',
                      color: '#0F172A',
                      fontSize: '11px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', color: '#64748B' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Device Bar Chart */}
        <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-sm">
          <h3 className="text-[11px] font-semibold text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#EC4899]"></div>
            Device Distribution
          </h3>
          <div className="h-64 w-full">
            {deviceData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-450 text-xs font-light">
                No device visits logged.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deviceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E2E8F0',
                      borderRadius: '16px',
                      color: '#0F172A',
                      fontSize: '11px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                    }}
                    cursor={{ fill: 'rgba(0,0,0,0.02)', opacity: 0.2 }}
                  />
                  <Bar dataKey="value" name="Visits" radius={[6, 6, 0, 0]}>
                    {deviceData.map((entry, index) => {
                      let fill = COLORS[index % COLORS.length];
                      if (entry.name === 'Desktop') fill = PURPLE;
                      else if (entry.name === 'Mobile') fill = CYAN;
                      else if (entry.name === 'Tablet') fill = PINK;
                      return <Cell key={`cell-${index}`} fill={fill} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsChart;
