import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCopy, FiBarChart2, FiTrash2, FiExternalLink, FiChevronLeft, FiChevronRight, FiLink, FiFilter, FiEdit2 } from 'react-icons/fi';
import { BsQrCode } from 'react-icons/bs';
import toast from 'react-hot-toast';

const UrlTable = ({ urls = [], pagination, loading, onPageChange, onShowQR, onEdit, onDelete, onViewAnalytics, onFilterSelect, selectedFilterId }) => {
  const navigate = useNavigate();
  const redirectBase = import.meta.env.VITE_REDIRECT_BASE || 'https://url-shortener-e004.onrender.com';

  const handleCopy = (shortCode) => {
    const shortUrl = `${redirectBase}/${shortCode}`;
    navigator.clipboard.writeText(shortUrl);
    toast.success('Short link copied to clipboard!');
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Status Badge Logic matching Active/Expires Soon/Expired rules
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

  // Skeleton loaders
  if (loading) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-sm animate-pulse">
        <div className="h-4 w-36 bg-slate-100 rounded mb-5"></div>
        <div className="space-y-4">
          <div className="h-10 bg-slate-50 rounded-lg"></div>
          <div className="h-12 bg-slate-50 rounded-lg"></div>
          <div className="h-12 bg-slate-50 rounded-lg"></div>
        </div>
      </div>
    );
  }

  const { currentPage = 1, totalPages = 1 } = pagination || {};

  return (
    <div className="bg-white border border-slate-200/80 rounded-[24px] overflow-hidden shadow-sm select-none">
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-[12px] font-semibold text-slate-900 uppercase tracking-widest flex items-center gap-2">
          <FiLink className="text-slate-800" />
          Link Repository
        </h2>
        <span className="text-xs text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-150">
          Total Items: {pagination?.totalItems || 0}
        </span>
      </div>

      {urls.length === 0 ? (
        <div className="p-16 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
            <FiLink className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-sm font-medium text-slate-900">No smart links created yet</h3>
          <p className="text-xs text-slate-500 mt-2 max-w-sm leading-relaxed font-light">
            Create your first smart link using the generator form above to start tracking clicks.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                <th className="px-6 py-4">Original URL</th>
                <th className="px-6 py-4">Short URL</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4 text-center">Clicks</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {urls.map((url) => {
                const shortUrl = `${redirectBase}/${url.shortCode}`;
                const isFiltered = selectedFilterId === url._id;
                return (
                  <tr
                    key={url.shortCode}
                    className={`hover:bg-slate-50/50 transition-all duration-200 group ${isFiltered ? 'bg-violet-50/20' : ''}`}
                  >
                    {/* Original URL */}
                    <td className="px-6 py-4 max-w-xs truncate text-slate-600 font-light" title={url.originalUrl}>
                      {url.originalUrl}
                    </td>
                    {/* Short URL Link */}
                    <td className="px-6 py-4 font-mono text-slate-900 font-semibold">
                      <a
                        href={shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline flex items-center gap-1.5 w-fit hover:text-slate-700 transition-colors"
                      >
                        /{url.shortCode}
                        <FiExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    </td>
                    {/* Created Date */}
                    <td className="px-6 py-4 text-slate-500 text-xs font-light">
                      {formatDate(url.createdAt)}
                    </td>
                    {/* Clicks */}
                    <td className="px-6 py-4 text-center font-bold text-slate-800">
                      {url.clickCount}
                    </td>
                    {/* Status Badge */}
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(url)}
                    </td>
                    {/* Action buttons */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onFilterSelect && onFilterSelect(isFiltered ? null : url)}
                          title={isFiltered ? "Clear Dashboard Filter" : "Filter Dashboard by Link"}
                          className={`p-1.5 rounded-lg border transition-all duration-250 ${isFiltered ? 'text-violet-650 bg-violet-100 border-violet-200' : 'text-slate-500 hover:text-violet-650 hover:bg-slate-100 border-transparent hover:border-slate-200'}`}
                        >
                          <FiFilter className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleCopy(url.shortCode)}
                          title="Copy Link"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all duration-250"
                        >
                          <FiCopy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onViewAnalytics ? onViewAnalytics(url) : navigate(`/analytics/${url._id}`)}
                          title="Quick View Analytics"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all duration-250"
                        >
                          <FiBarChart2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onShowQR(url)}
                          title="Show QR Code"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all duration-250"
                        >
                          <BsQrCode className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEdit && onEdit(url)}
                          title="Edit Destination URL"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all duration-250"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(url._id)}
                          title="Delete URL"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all duration-250"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="px-6 py-3.5 border-t border-slate-155 bg-slate-50/20 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-light">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 disabled:opacity-20 disabled:pointer-events-none hover:bg-slate-100 transition-all"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 disabled:opacity-20 disabled:pointer-events-none hover:bg-slate-100 transition-all"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UrlTable;
