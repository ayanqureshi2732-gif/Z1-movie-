import React from 'react';
import { History, Play, Trash2, Clock, Film } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const HistoryPage: React.FC = () => {
  const { watchHistory, movies, navigate, clearWatchHistory, removeFromHistory } = useApp();

  const historyItems = watchHistory
    .map((hist) => {
      const movie = movies.find((m) => m.id === hist.movieId);
      return movie ? { ...hist, movie } : null;
    })
    .filter(Boolean) as (typeof watchHistory[0] & { movie: (typeof movies)[0] })[];

  return (
    <div className="w-full min-h-screen bg-[#08080b] text-white px-4 sm:px-6 py-6 pb-24 md:pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-brand tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-red-500" />
            <span>Watch History</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Pick up right where you left off or review past streams.
          </p>
        </div>

        {historyItems.length > 0 && (
          <button
            onClick={clearWatchHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-red-400 bg-white/5 hover:bg-red-950/20 border border-white/10 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {historyItems.length === 0 ? (
        <div className="text-center py-20 bg-[#121218] rounded-2xl border border-white/5 p-8">
          <Film className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">Your history is clear</h3>
          <p className="text-xs text-gray-400 mt-1 mb-5">
            Movies and episodes you watch will appear here with your saved timestamp.
          </p>
          <button
            onClick={() => navigate({ path: '/movies' })}
            className="px-5 py-2.5 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-500 transition-colors"
          >
            Browse Movies
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {historyItems.map((item) => (
            <div
              key={item.movieId}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3.5 rounded-2xl bg-[#121218] border border-white/[0.08] hover:border-red-500/40 transition-all group"
            >
              {/* Left: Thumbnail with progress + Title info */}
              <div
                onClick={() => navigate({ path: '/player/:id', id: item.movie.id })}
                className="flex items-center gap-3.5 min-w-0 cursor-pointer flex-1"
              >
                <div className="relative w-20 sm:w-28 aspect-video rounded-xl overflow-hidden bg-neutral-900 flex-shrink-0">
                  <img
                    src={item.movie.backdropUrl || item.movie.posterUrl}
                    alt={item.movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-red-600/90 text-white flex items-center justify-center">
                      <Play className="w-4 h-4 fill-white ml-0.5" />
                    </div>
                  </div>
                  {/* Progress bar on thumbnail */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/60">
                    <div
                      className="h-full bg-red-600"
                      style={{ width: `${item.progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="min-w-0">
                  <h4 className="text-sm sm:text-base font-bold text-white truncate group-hover:text-red-400 transition-colors">
                    {item.movie.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                    <span>{item.movie.duration}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-red-400 font-medium">{item.progressPercent}% watched</span>
                  </div>
                  <span className="text-[11px] text-gray-500 block mt-0.5">
                    Watched {new Date(item.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => navigate({ path: '/player/:id', id: item.movie.id })}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Resume</span>
                </button>
                <button
                  onClick={() => removeFromHistory(item.movieId)}
                  title="Remove from history"
                  className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
