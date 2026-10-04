import React from 'react';
import { Upload, Pause, Play, CheckCircle2, AlertCircle, X, ChevronRight } from 'lucide-react';
import { useUploadManager } from '../hooks/useUploadManager';
import { useApp } from '../context/AppContext';

export const UploadProgressBanner: React.FC = () => {
  const { queue, activeUploads, overallProgress, totalSpeedBytesPerSec } = useUploadManager();
  const { navigate, route } = useApp();

  // If on player page or no active/queued items, don't show floating banner
  if (route.path.startsWith('/player/') || queue.length === 0) {
    return null;
  }

  const isUploading = activeUploads.length > 0;
  const speedMb = (totalSpeedBytesPerSec / (1024 * 1024)).toFixed(1);

  return (
    <aside
      aria-label="Upload progress banner"
      onClick={() => navigate({ path: '/admin', tab: 'uploads' })}
      className="fixed bottom-20 md:bottom-6 right-4 z-40 max-w-sm w-[calc(100%-2rem)] sm:w-auto bg-[#12131a]/95 backdrop-blur-xl border border-red-500/30 rounded-2xl p-3.5 shadow-2xl flex items-center gap-3 cursor-pointer group hover:border-red-500/60 transition-all select-none"
    >
      {/* Mini Progress Ring */}
      <div className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center">
        <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
          <circle
            cx="18"
            cy="18"
            r="15"
            fill="none"
            className="stroke-white/10"
            strokeWidth="3"
          />
          <circle
            cx="18"
            cy="18"
            r="15"
            fill="none"
            className="stroke-red-500 transition-all duration-300"
            strokeWidth="3"
            strokeDasharray="94.2"
            strokeDashoffset={94.2 - (94.2 * overallProgress) / 100}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute text-[10px] font-bold text-white">
          {overallProgress}%
        </div>
      </div>

      {/* Info text */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-white truncate">
            {isUploading
              ? `Uploading ${activeUploads.length} movie${activeUploads.length > 1 ? 's' : ''}`
              : `Upload Queue (${queue.length})`}
          </span>
          {isUploading && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </div>
        <div className="text-[11px] text-gray-400 truncate flex items-center gap-2 mt-0.5">
          {isUploading ? (
            <>
              <span className="text-red-400 font-medium">{speedMb} MB/s</span>
              <span>·</span>
              <span>{activeUploads[0]?.fileName}</span>
            </>
          ) : (
            <span>Tap to open Upload Center</span>
          )}
        </div>
      </div>

      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
    </aside>
  );
};
