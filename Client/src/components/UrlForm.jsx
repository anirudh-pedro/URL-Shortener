import React, { useState } from 'react';
import { FiLink, FiTag, FiCalendar, FiPlusCircle, FiRotateCcw, FiUploadCloud, FiFileText, FiList } from 'react-icons/fi';
import toast from 'react-hot-toast';

const UrlForm = ({ onSubmit, onBulkSubmit, submitting }) => {
  const [activeMode, setActiveMode] = useState('single'); // 'single' | 'bulk'
  
  // Single link states
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  // Bulk link states
  const [csvDataList, setCsvDataList] = useState([]);
  const [fileName, setFileName] = useState('');

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

  const handleCsvFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please select a valid CSV file');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      parseCsvData(text);
    };
    reader.readAsText(file);
  };

  const parseCsvData = (text) => {
    try {
      const lines = text.split(/\r?\n/);
      const parsedUrls = [];
      
      let startIdx = 0;
      if (lines.length > 0) {
        const firstLine = lines[0].toLowerCase();
        if (firstLine.includes('url') || firstLine.includes('alias') || firstLine.includes('expiry')) {
          startIdx = 1;
        }
      }

      for (let i = startIdx; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const columns = line.split(',').map(c => c.replace(/^["']|["']$/g, '').trim());
        const originalUrl = columns[0];
        const customAlias = columns[1] || '';
        const expiryDate = columns[2] || '';

        if (originalUrl) {
          parsedUrls.push({ originalUrl, customAlias, expiryDate });
        }
      }

      if (parsedUrls.length === 0) {
        toast.error('No valid URLs found in the CSV file');
        setFileName('');
        return;
      }

      setCsvDataList(parsedUrls);
      toast.success(`Imported ${parsedUrls.length} urls from CSV file.`);
    } catch (err) {
      toast.error('Failed to parse CSV file');
      setFileName('');
      console.error(err);
    }
  };

  const handleBulkSubmitClick = () => {
    if (csvDataList.length === 0) {
      toast.error('Please upload a valid CSV file first');
      return;
    }

    if (onBulkSubmit) {
      onBulkSubmit(csvDataList, () => {
        setCsvDataList([]);
        setFileName('');
      });
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 mb-8 shadow-sm select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
        <h2 className="text-[12px] font-semibold text-slate-900 flex items-center gap-2.5 uppercase tracking-widest">
          <div className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-pulse"></div>
          Generate Smart Links
        </h2>
        <div className="inline-flex bg-slate-50 border border-slate-200/60 p-0.5 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveMode('single')}
            className={`px-3.5 py-1.5 text-[10px] font-bold uppercase rounded-lg tracking-wider transition-all flex items-center gap-1.5 ${
              activeMode === 'single'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/40'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <FiLink className="w-3.5 h-3.5" />
            Single Link
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('bulk')}
            className={`px-3.5 py-1.5 text-[10px] font-bold uppercase rounded-lg tracking-wider transition-all flex items-center gap-1.5 ${
              activeMode === 'bulk'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/40'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <FiUploadCloud className="w-3.5 h-3.5" />
            Bulk CSV Upload
          </button>
        </div>
      </div>

      {activeMode === 'single' ? (
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
      ) : (
        <div className="space-y-5">
          <div className="bg-slate-50 border border-dashed border-slate-300 rounded-[20px] p-8 text-center flex flex-col items-center justify-center relative">
            <input
              type="file"
              accept=".csv"
              onChange={handleCsvFileChange}
              disabled={submitting}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:pointer-events-none"
            />
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 mb-3 shadow-inner">
              <FiUploadCloud className="w-6 h-6 text-slate-400" />
            </div>
            {fileName ? (
              <div>
                <span className="text-sm font-semibold text-slate-850 flex items-center justify-center gap-2">
                  <FiFileText className="text-violet-650" />
                  {fileName}
                </span>
                <p className="text-[10px] text-emerald-500 mt-1 font-semibold">Loaded {csvDataList.length} records successfully</p>
              </div>
            ) : (
              <div>
                <span className="text-xs font-semibold text-slate-900">Upload CSV File</span>
                <p className="text-[10px] text-slate-400 mt-1 font-light">
                  Drag and drop your file here, or click to browse.<br />
                  Columns format: <code className="bg-white border px-1.5 py-0.5 rounded font-mono">originalUrl,customAlias,expiryDate</code>
                </p>
              </div>
            )}
          </div>

          {csvDataList.length > 0 && (
            <div className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/50 max-h-40 overflow-y-auto">
              <div className="p-3 border-b border-slate-100 flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider select-none bg-slate-50">
                <FiList /> Preview Imported Links List
              </div>
              <div className="divide-y divide-slate-100 text-[11px] font-mono p-3 space-y-1">
                {csvDataList.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="py-1 flex items-center justify-between text-slate-600">
                    <span className="truncate max-w-[200px]" title={item.originalUrl}>{item.originalUrl}</span>
                    <span className="text-violet-650 font-bold">/{item.customAlias || 'nanoid'}</span>
                  </div>
                ))}
                {csvDataList.length > 5 && (
                  <div className="text-slate-400 text-[10px] pt-1 select-none">... and {csvDataList.length - 5} more links</div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-1.5">
            <button
              type="button"
              onClick={handleBulkSubmitClick}
              disabled={submitting || csvDataList.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-sm font-semibold shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-100 border-t-transparent rounded-full animate-spin"></div>
                  Processing Bulk Links...
                </>
              ) : (
                <>
                  <FiPlusCircle className="w-4.5 h-4.5" />
                  Shorten CSV URLs Batch
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UrlForm;
