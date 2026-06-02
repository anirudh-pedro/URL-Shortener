import React, { useState } from 'react';
import { FiLink, FiTag, FiCalendar, FiPlusCircle, FiRotateCcw } from 'react-icons/fi';
import toast from 'react-hot-toast';

const UrlForm = ({ onSubmit, submitting }) => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!originalUrl) {
      toast.error('Please enter the original URL');
      return;
    }

    try {
      new URL(originalUrl);
    } catch (_) {
      toast.error('Please enter a valid absolute URL (including http:// or https://)');
      return;
    }

    onSubmit({ originalUrl, customAlias, expiryDate }, () => {
      // Clear form on success
      setOriginalUrl('');
      setCustomAlias('');
      setExpiryDate('');
    });
  };

  const handleReset = () => {
    setOriginalUrl('');
    setCustomAlias('');
    setExpiryDate('');
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 mb-8 shadow-sm select-none">
      <h2 className="text-[12px] font-semibold text-slate-900 mb-5 flex items-center gap-2.5 uppercase tracking-widest">
        <div className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-pulse"></div>
        Create Smart Link
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Original URL Input */}
          <div className="lg:col-span-1">
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2.5">
              Original Destination URL *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <FiLink className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="https://example.com/long-original-url"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all duration-300"
                disabled={submitting}
              />
            </div>
          </div>

          {/* Custom Alias Input */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2.5">
              Custom Alias (Optional)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <FiTag className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="vanity-slug"
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all duration-300"
                disabled={submitting}
              />
            </div>
          </div>

          {/* Expiry Date Input */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2.5">
              Expiry Date (Optional)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <FiCalendar className="w-4 h-4" />
              </span>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all duration-300"
                disabled={submitting}
              />
            </div>
          </div>
        </div>

        {/* Form buttons */}
        <div className="flex items-center gap-3 pt-1.5 justify-end">
          <button
            type="button"
            onClick={handleReset}
            disabled={submitting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50 text-sm font-medium transition-all duration-200 disabled:opacity-50"
          >
            <FiRotateCcw className="w-4 h-4" />
            Reset
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-sm font-semibold shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-100 border-t-transparent rounded-full animate-spin"></div>
                Generating...
              </>
            ) : (
              <>
                <FiPlusCircle className="w-4.5 h-4.5" />
                Generate Link
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UrlForm;
