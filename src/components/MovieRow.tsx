import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Movie } from '../types';
import { MovieCard } from './MovieCard';

interface MovieRowProps {
  title: string;
  subtitle?: string;
  movies: Movie[];
  showProgressMap?: Record<string, number>;
  onSeeAll?: () => void;
}

export const MovieRow: React.FC<MovieRowProps> = ({
  title,
  subtitle,
  movies,
  showProgressMap,
  onSeeAll,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);

  if (!movies || movies.length === 0) {
    return null;
  }

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const scrollAmount = rowRef.current.clientWidth * 0.75;
      rowRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="w-full relative my-5 sm:my-7 block">
      {/* Row Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 mb-2.5">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span>{title}</span>
          </h2>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>

        {onSeeAll && (
          <button
            onClick={onSeeAll}
            className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors flex items-center gap-0.5 min-h-[32px] px-2 cursor-pointer"
          >
            <span>See All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Relative container for scroll arrows + carousel */}
      <div className="relative group/row">
        {/* Desktop Left Scroll Arrow */}
        <button
          onClick={() => scroll('left')}
          aria-label="Scroll left"
          className="hidden md:flex absolute -left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/80 hover:bg-red-600 text-white items-center justify-center border border-white/10 opacity-0 group-hover/row:opacity-100 transition-all shadow-xl cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Desktop Right Scroll Arrow */}
        <button
          onClick={() => scroll('right')}
          aria-label="Scroll right"
          className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/80 hover:bg-red-600 text-white items-center justify-center border border-white/10 opacity-0 group-hover/row:opacity-100 transition-all shadow-xl cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Horizontal Carousel (Only overflow-x: auto inside this container!) */}
        <div
          ref={rowRef}
          className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto no-scrollbar px-4 sm:px-6 py-1 scroll-smooth"
        >
          {movies.map((movie) => (
            <div key={movie.id} className="w-[130px] sm:w-[155px] md:w-[175px] flex-shrink-0">
              <MovieCard
                movie={movie}
                showProgress={showProgressMap ? showProgressMap[movie.id] : undefined}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
