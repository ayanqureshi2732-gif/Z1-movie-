import React, { useState, useMemo } from 'react';
import { Search as SearchIcon, X, Flame, Film } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MovieCard } from '../components/MovieCard';

export const SearchPage: React.FC = () => {
  const { movies } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  const trendingTags = ['Chrono', 'Sci-Fi', 'Action', 'Thriller', 'English', 'Hindi', 'Japanese', '2026'];

  const results = useMemo(() => {
    const term = (selectedTag || searchTerm).trim().toLowerCase();
    if (!term) return [];

    return movies.filter((m) => {
      if (!m.isPublished) return false;
      const titleMatch = m.title.toLowerCase().includes(term);
      const genreMatch = m.genre.some((g) => g.toLowerCase().includes(term));
      const castMatch = m.cast.some((c) => c.toLowerCase().includes(term));
      const dirMatch = m.director.toLowerCase().includes(term);
      const langMatch = m.language.toLowerCase().includes(term);
      const descMatch = m.description.toLowerCase().includes(term);
      const yearMatch = m.year.toString().includes(term);
      return titleMatch || genreMatch || castMatch || dirMatch || langMatch || descMatch || yearMatch;
    });
  }, [movies, searchTerm, selectedTag]);

  return (
    <div className="w-full min-h-screen bg-[#08080b] text-white px-4 sm:px-6 py-6 pb-24 md:pb-12 max-w-7xl mx-auto">
      {/* Search Input Bar */}
      <div className="relative max-w-2xl mx-auto mb-6">
        <div className="relative flex items-center">
          <SearchIcon className="absolute left-4 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedTag('');
            }}
            placeholder="Search movies, actors, directors, genres..."
            autoFocus
            className="w-full min-h-[52px] pl-12 pr-12 rounded-2xl bg-[#14141d] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-red-500/80 focus:ring-2 focus:ring-red-500/20 text-sm sm:text-base shadow-xl"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedTag('');
              }}
              className="absolute right-3.5 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-full text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Quick Trending Searches */}
        <div className="flex items-center gap-2 mt-3 overflow-x-auto no-scrollbar py-1">
          <span className="text-[11px] text-gray-400 flex items-center gap-1 flex-shrink-0 font-medium">
            <Flame className="w-3.5 h-3.5 text-red-500" />
            Trending:
          </span>
          {trendingTags.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setSelectedTag(tag);
                setSearchTerm(tag);
              }}
              className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                (selectedTag || searchTerm).toLowerCase() === tag.toLowerCase()
                  ? 'bg-red-600 text-white'
                  : 'bg-[#181822] text-gray-300 hover:text-white'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Results View */}
      {searchTerm || selectedTag ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-300">
              Results for &quot;{selectedTag || searchTerm}&quot; ({results.length})
            </h2>
          </div>

          {results.length === 0 ? (
            <div className="text-center py-16">
              <Film className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-300">No movies found</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                We couldn&apos;t find any titles matching your search. Try searching by title, cast, or genre.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {results.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Default Popular suggestions when search is empty */
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Popular on Z1
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {movies.filter((m) => m.isTrending && m.isPublished).slice(0, 12).map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
