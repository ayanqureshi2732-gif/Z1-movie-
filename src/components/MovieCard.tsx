import React, { useState } from 'react';
import { Play, Star, Plus, Check } from 'lucide-react';
import { Movie } from '../types';
import { useApp } from '../context/AppContext';

interface MovieCardProps {
  movie: Movie;
  showProgress?: number; // 0-100% for continue watching
  className?: string;
  rank?: number; // for Top 10
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  showProgress,
  className = '',
  rank,
}) => {
  const { navigate, isInMyList, toggleMyList } = useApp();
  const [imageError, setImageError] = useState(false);
  const inList = isInMyList(movie.id);

  const handleCardClick = () => {
    navigate({ path: '/movie/:id', id: movie.id });
  };

  const handleQuickPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate({ path: '/player/:id', id: movie.id });
  };

  const handleListToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleMyList(movie.id);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative flex-shrink-0 cursor-pointer select-none rounded-xl overflow-hidden bg-[#121218] border border-white/[0.08] hover:border-red-500/50 hover:shadow-lg hover:shadow-red-950/20 transition-all duration-200 ${className}`}
    >
      {/* 2:3 Aspect Ratio Container */}
      <div className="relative w-full aspect-[2/3] overflow-hidden bg-neutral-900">
        {!imageError ? (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          /* Robust CSS Fallback container per zero-broken-image policy */
          <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-gradient-to-b from-neutral-800 to-neutral-950">
            <span className="font-extrabold text-xs text-red-500 tracking-wider mb-1">Z1 CINEMA</span>
            <span className="text-xs font-semibold text-gray-200 line-clamp-3">{movie.title}</span>
            <span className="text-[10px] text-gray-400 mt-2">{movie.year}</span>
          </div>
        )}

        {/* Top Badges (Zero-pill compliant clean tags) */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
          {movie.isPremium && (
            <span className="text-[9px] font-extrabold tracking-wider bg-red-600 text-white px-1.5 py-0.5 rounded shadow">
              VIP
            </span>
          )}
          {movie.rating > 0 && (
            <div className="flex items-center gap-1 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] text-amber-400 font-semibold ml-auto">
              <Star className="w-2.5 h-2.5 fill-amber-400" />
              <span>{movie.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Hover / Active Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-2.5">
          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={handleQuickPlay}
              title="Watch Now"
              className="flex-1 min-h-[36px] bg-red-600 hover:bg-red-500 active:scale-95 text-white font-medium text-xs rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Watch</span>
            </button>
            <button
              onClick={handleListToggle}
              title={inList ? 'Remove from List' : 'Add to List'}
              className="min-h-[36px] min-w-[36px] bg-white/20 hover:bg-white/30 backdrop-blur-sm active:scale-95 text-white rounded-lg flex items-center justify-center transition-all cursor-pointer"
            >
              {inList ? <Check className="w-4 h-4 text-emerald-400" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Optional Continue Watching Progress Bar */}
        {typeof showProgress === 'number' && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/60">
            <div
              className="h-full bg-red-600 transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, showProgress))}%` }}
            />
          </div>
        )}
      </div>

      {/* Card Info Below Poster */}
      <div className="p-2 sm:p-2.5 bg-[#121218]">
        <h4 className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-red-400 transition-colors">
          {movie.title}
        </h4>
        <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-1">
          <span>{movie.year}</span>
          <span aria-hidden="true">·</span>
          <span>{movie.language}</span>
          <span aria-hidden="true">·</span>
          <span className="truncate">{movie.duration}</span>
        </div>
      </div>
    </div>
  );
};
