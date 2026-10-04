import React from 'react';
import { Bookmark, Film, Play, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MovieCard } from '../components/MovieCard';

export const MyListPage: React.FC = () => {
  const { myList, movies, navigate, toggleMyList } = useApp();

  const savedMovies = myList
    .map((id) => movies.find((m) => m.id === id))
    .filter(Boolean) as (typeof movies)[0][];

  return (
    <div className="w-full min-h-screen bg-[#08080b] text-white px-4 sm:px-6 py-6 pb-24 md:pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-brand tracking-tight flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-red-500 fill-red-500/20" />
            <span>My Watchlist</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            {savedMovies.length} {savedMovies.length === 1 ? 'title' : 'titles'} saved to watch later.
          </p>
        </div>
      </div>

      {savedMovies.length === 0 ? (
        <div className="text-center py-20 bg-[#121218] rounded-2xl border border-white/5 p-8 max-w-xl mx-auto">
          <Bookmark className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">Your list is currently empty</h3>
          <p className="text-xs text-gray-400 mt-1 mb-5">
            Add movies to your list using the &quot;+ MY LIST&quot; button to keep track of what you want to watch.
          </p>
          <button
            onClick={() => navigate({ path: '/movies' })}
            className="px-5 py-2.5 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-500 transition-colors cursor-pointer"
          >
            Explore Movies
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {savedMovies.map((movie) => (
            <div key={movie.id} className="relative group/saved">
              <MovieCard movie={movie} />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMyList(movie.id);
                }}
                title="Remove from My List"
                className="absolute top-2 right-2 z-20 min-h-[32px] min-w-[32px] rounded-lg bg-black/80 hover:bg-red-600 text-gray-300 hover:text-white flex items-center justify-center opacity-0 group-hover/saved:opacity-100 transition-opacity cursor-pointer shadow-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
