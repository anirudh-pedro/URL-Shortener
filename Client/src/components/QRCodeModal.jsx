import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiDownload, FiCopy } from 'react-icons/fi';
import toast from 'react-hot-toast';

const QRCodeModal = ({ isOpen, onClose, urlItem }) => {
  if (!urlItem) return null;

  const redirectBase = import.meta.env.VITE_REDIRECT_BASE || 'https://url-shortener-e004.onrender.com';
  const shortUrl = `${redirectBase}/${urlItem.shortCode}`;

  const handleDownload = () => {
    if (!urlItem.qrCodeUrl) return;
    const link = document.createElement('a');
    link.href = urlItem.qrCodeUrl;
    link.download = `qr-code-${urlItem.shortCode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    toast.success('Short link copied!');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-sm rounded-[24px] bg-white border border-slate-200 p-6 relative shadow-xl z-10"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="text-center mb-6">
              <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-widest">QR Scanner Code</h3>
              <p className="text-xs text-slate-500 mt-1 truncate">Short Code: {urlItem.shortCode}</p>
            </div>

            {/* QR Canvas Frame */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-200 rounded-2xl mb-6 shadow-inner w-40 h-40 mx-auto select-none">
              <img
                src={urlItem.qrCodeUrl}
                alt="QR Code"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Action buttons */}
            <div className="space-y-2.5">
              <button
                onClick={handleCopy}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-350 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-sm font-medium transition-all"
              >
                <FiCopy className="w-4 h-4" />
                Copy Short URL
              </button>

              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-sm font-semibold shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <FiDownload className="w-4 h-4" />
                Download QR Code
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default QRCodeModal;
