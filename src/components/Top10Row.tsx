import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { Movie } from '../types';
import { MovieCard } from './MovieCard';

interface Top10RowProps {
  movies: Movie[];
}

export const Top10Row: React.FC<Top10RowProps> = ({ movies }) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const top10List = [...movies]
    .filter((m) => m.isPublished)
    .sort((a, b) => (a.top10Rank || 99) - (b.top10Rank || 99))
    .slice(0, 10);

  if (top10List.length === 0) return null;

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
    <section className="w-full relative my-6 sm:my-8 block">
      <div className="flex items-center gap-2 px-4 sm:px-6 mb-3">
        <div className="p-1 rounded-md bg-red-600/20 text-red-500">
          <Flame className="w-4 h-4 fill-red-500" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            Top 10 Today on Z1
          </h2>
          <p className="text-xs text-gray-400">Most streamed blockbusters right now</p>
        </div>
      </div>

      <div className="relative group/top10">
        <button
          onClick={() => scroll('left')}
          aria-label="Scroll left"
          className="hidden md:flex absolute -left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/80 hover:bg-red-600 text-white items-center justify-center border border-white/10 opacity-0 group-hover/top10:opacity-100 transition-all shadow-xl cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={() => scroll('right')}
          aria-label="Scroll right"
          className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/80 hover:bg-red-600 text-white items-center justify-center border border-white/10 opacity-0 group-hover/top10:opacity-100 transition-all shadow-xl cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div
          ref={rowRef}
          className="flex items-end gap-3 sm:gap-5 overflow-x-auto no-scrollbar px-4 sm:px-6 py-2 scroll-smooth"
        >
          {top10List.map((movie, index) => {
            const rank = movie.top10Rank || index + 1;
            return (
              <div key={movie.id} className="flex items-end flex-shrink-0">
                {/* Massive Architectural Top 10 Number */}
                <div className="w-10 sm:w-14 flex items-baseline justify-end -mr-3 sm:-mr-4 z-10 pointer-events-none select-none">
                  <span
                    className="font-brand font-black text-5xl sm:text-7xl leading-none text-transparent tracking-tighter"
                    style={{
                      WebkitTextStroke: '2px #E50914',
                      textShadow: '0 0 20px rgba(229, 9, 20, 0.4)',
                    }}
                  >
                    {rank}
                  </span>
                </div>

                {/* Card */}
                <div className="w-[125px] sm:w-[150px] md:w-[170px] flex-shrink-0">
                  <MovieCard movie={movie} rank={rank} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
