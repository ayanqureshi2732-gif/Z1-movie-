import React, { useState, useMemo } from 'react';
import { Filter, SlidersHorizontal, Star, Film } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MovieCard } from '../components/MovieCard';

export const MoviesPage: React.FC = () => {
  const { movies } = useApp();
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [selectedAccess, setSelectedAccess] = useState<'all' | 'free' | 'vip'>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'year' | 'title'>('rating');

  const genres = ['All', 'Action', 'Sci-Fi', 'Thriller', 'Crime', 'Adventure', 'Drama', 'Fantasy', 'Comedy'];
  const languages = ['All', 'English', 'Hindi', 'Japanese', 'Korean', 'Spanish', 'French'];

  const filteredMovies = useMemo(() => {
    return movies
      .filter((m) => m.isPublished)
      .filter((m) => {
        if (selectedGenre !== 'All' && !m.genre.includes(selectedGenre)) return false;
        if (selectedLanguage !== 'All' && m.language !== selectedLanguage) return false;
        if (selectedAccess === 'vip' && !m.isPremium) return false;
        if (selectedAccess === 'free' && m.isPremium) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'year') return b.year - a.year;
        return a.title.localeCompare(b.title);
      });
  }, [movies, selectedGenre, selectedLanguage, selectedAccess, sortBy]);

  return (
    <div className="w-full min-h-screen bg-[#08080b] text-white px-4 sm:px-6 py-6 pb-24 md:pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-brand tracking-tight flex items-center gap-2">
            <Film className="w-6 h-6 text-red-500" />
            <span>Movies Catalog</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Browse our full library of cinema blockbusters, indie gems and Z1 Originals.
          </p>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-gray-400 font-medium">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#14141d] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500 cursor-pointer"
          >
            <option value="rating">Top Rated</option>
            <option value="year">Newest Year</option>
            <option value="title">Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Filter Bars (Segmented Buttons) */}
      <div className="space-y-3 mb-6 bg-[#101016] p-4 rounded-2xl border border-white/[0.06]">
        {/* Genre filters */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
            Genres
          </span>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGenre(g)}
                className={`min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  selectedGenre === g
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-[#181822] text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Language & Access Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-xs text-gray-400 font-medium">Language:</span>
            {languages.map((l) => (
              <button
                key={l}
                onClick={() => setSelectedLanguage(l)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedLanguage === l
                    ? 'bg-white/20 text-white font-semibold'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-[#181822] p-1 rounded-lg border border-white/5">
            <button
              onClick={() => setSelectedAccess('all')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                selectedAccess === 'all' ? 'bg-white/20 text-white' : 'text-gray-400'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedAccess('vip')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                selectedAccess === 'vip' ? 'bg-red-600 text-white' : 'text-gray-400'
              }`}
            >
              VIP Only
            </button>
            <button
              onClick={() => setSelectedAccess('free')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                selectedAccess === 'free' ? 'bg-white/20 text-white' : 'text-gray-400'
              }`}
            >
              Free
            </button>
          </div>
        </div>
      </div>

      {/* Movies Grid */}
      {filteredMovies.length === 0 ? (
        <div className="text-center py-16">
          <Film className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-300">No movies match this filter</h3>
          <p className="text-xs text-gray-500 mt-1">Try resetting the genre or language filter.</p>
          <button
            onClick={() => {
              setSelectedGenre('All');
              setSelectedLanguage('All');
              setSelectedAccess('all');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-medium hover:bg-red-500"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {filteredMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
};
