import React, { useState } from 'react';
import { ArrowLeft, Play, Plus, Check, Star, Film, Clock, Globe, Shield, User, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MovieCard } from '../components/MovieCard';

interface MovieDetailsPageProps {
  movieId: string;
}

export const MovieDetailsPage: React.FC<MovieDetailsPageProps> = ({ movieId }) => {
  const { movies, navigate, goBack, myList, toggleMyList } = useApp();
  const [showTrailerModal, setShowTrailerModal] = useState(false);

  const movie = movies.find((m) => m.id === movieId);

  if (!movie) {
    return (
      <div className="min-h-screen bg-[#08080b] flex flex-col items-center justify-center p-6 text-center">
        <Film className="w-12 h-12 text-red-500 mb-4 stroke-1" />
        <h2 className="text-xl font-bold text-white mb-2">Movie Not Found</h2>
        <p className="text-sm text-gray-400 mb-6">The requested movie could not be located in the catalog.</p>
        <button
          onClick={() => navigate({ path: '/' })}
          className="px-6 py-2.5 rounded-xl bg-red-600 text-white font-medium text-sm hover:bg-red-500 transition-colors"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const inList = myList.includes(movie.id);

  // Similar movies in same genre
  const similarMovies = movies
    .filter((m) => m.id !== movie.id && m.genre.some((g) => movie.genre.includes(g)))
    .slice(0, 8);

  return (
    <div className="w-full min-h-screen bg-[#08080b] text-white overflow-x-hidden pb-24 md:pb-12">
      {/* Top Floating Back Bar */}
      <div className="sticky top-0 z-30 w-full bg-[#08080b]/90 backdrop-blur-md border-b border-white/[0.06] px-4 sm:px-6 h-14 flex items-center justify-between">
        <button
          onClick={goBack}
          className="min-h-[44px] min-w-[44px] -ml-2 flex items-center justify-center text-gray-300 hover:text-white transition-colors cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-semibold text-gray-200 truncate max-w-[200px] sm:max-w-md">
          {movie.title}
        </span>
        <button
          onClick={() => toggleMyList(movie.id)}
          className="min-h-[44px] min-w-[44px] -mr-2 flex items-center justify-center text-gray-300 hover:text-white transition-colors cursor-pointer"
          aria-label="Toggle Watchlist"
        >
          {inList ? <Check className="w-5 h-5 text-emerald-400" /> : <Plus className="w-5 h-5" />}
        </button>
      </div>

      {/* Hero Backdrop Section */}
      <div className="relative w-full h-[40vh] sm:h-[50vh] md:h-[58vh] max-h-[580px] bg-black overflow-hidden">
        <img
          src={movie.backdropUrl || movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover object-center"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080b] via-[#08080b]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#08080b]/80 via-transparent to-transparent hidden sm:block" />

        {/* Quick Trailer Trigger Button on Hero */}
        {movie.trailerUrl && (
          <button
            onClick={() => setShowTrailerModal(true)}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-h-[48px] min-w-[48px] rounded-full bg-red-600/90 hover:bg-red-500 text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all cursor-pointer backdrop-blur-sm"
            aria-label="Watch Trailer"
          >
            <Play className="w-6 h-6 fill-white ml-0.5" />
          </button>
        )}
      </div>

      {/* Main Content Details */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-14 sm:-mt-20 relative z-20">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Movie Poster (Desktop + Mobile) */}
          <div className="w-28 sm:w-36 md:w-52 aspect-[2/3] flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10 bg-neutral-900 hidden sm:block">
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Core Info & Actions */}
          <div className="flex-1 w-full">
            {/* Badges / Metadata row */}
            <div className="flex items-center flex-wrap gap-2 text-xs text-gray-300 font-medium mb-2.5">
              {movie.isPremium && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white tracking-wider">
                  VIP EXCLUSIVE
                </span>
              )}
              <div className="flex items-center gap-1 text-amber-400 font-semibold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{movie.rating.toFixed(1)} Rating</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/10 text-gray-300 border border-white/10">
                HD 1080P
              </span>
              <span>{movie.year}</span>
              <span aria-hidden="true">·</span>
              <span>{movie.duration}</span>
              <span aria-hidden="true">·</span>
              <span>{movie.language}</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-brand text-white tracking-tight mb-3">
              {movie.title}
            </h1>

            {/* Genres */}
            <div className="flex flex-wrap gap-1.5 mb-5">
              {movie.genre.map((g) => (
                <span
                  key={g}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#161622] text-gray-300 border border-white/10"
                >
                  {g}
                </span>
              ))}
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <button
                type="button"
                onClick={() => navigate({ path: '/player/:id', id: movie.id })}
                className="flex-1 sm:flex-initial min-h-[48px] px-8 py-3 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-red-950/50 transition-all cursor-pointer"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>WATCH NOW</span>
              </button>

              <button
                type="button"
                onClick={() => toggleMyList(movie.id)}
                className="min-h-[48px] px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-semibold text-sm flex items-center justify-center gap-2 backdrop-blur-md border border-white/15 transition-all cursor-pointer"
              >
                {inList ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>IN MY LIST</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>ADD TO LIST</span>
                  </>
                )}
              </button>

              {movie.trailerUrl && (
                <button
                  type="button"
                  onClick={() => setShowTrailerModal(true)}
                  className="min-h-[48px] px-5 py-3 rounded-xl bg-white/5 hover:bg-white/15 active:scale-95 text-gray-200 font-medium text-sm flex items-center justify-center gap-2 border border-white/10 transition-all cursor-pointer"
                >
                  <Film className="w-4 h-4 text-red-400" />
                  <span>TRAILER</span>
                </button>
              )}
            </div>

            {/* Synopsis */}
            <div className="mb-6">
              <h3 className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-1.5">
                Storyline
              </h3>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-normal">
                {movie.description}
              </p>
            </div>

            {/* Metadata Grid (Cast, Director, Technical) */}
            <div className="p-4 rounded-2xl bg-[#121218] border border-white/[0.08] space-y-3 mb-8">
              <div className="flex items-start text-xs sm:text-sm">
                <span className="w-24 text-gray-400 flex-shrink-0 font-medium">Director:</span>
                <span className="text-white font-semibold">{movie.director}</span>
              </div>
              <div className="flex items-start text-xs sm:text-sm">
                <span className="w-24 text-gray-400 flex-shrink-0 font-medium">Starring Cast:</span>
                <span className="text-gray-200">{movie.cast.join(', ')}</span>
              </div>
              <div className="flex items-start text-xs sm:text-sm">
                <span className="w-24 text-gray-400 flex-shrink-0 font-medium">Audio & Sub:</span>
                <span className="text-gray-200">5.1 Dolby Audio · English [Original], CC Subtitles</span>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Movies Section */}
        {similarMovies.length > 0 && (
          <div className="mt-8 pt-6 border-t border-white/[0.08]">
            <h3 className="text-base sm:text-lg font-bold text-white mb-4">
              More Like This
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {similarMovies.map((sim) => (
                <MovieCard key={sim.id} movie={sim} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Trailer Modal */}
      {showTrailerModal && movie.trailerUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative w-full max-w-3xl bg-neutral-950 rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between p-3.5 border-b border-white/10 bg-[#121218]">
              <span className="text-sm font-bold text-white truncate">
                {movie.title} - Official Trailer
              </span>
              <button
                onClick={() => setShowTrailerModal(false)}
                className="min-h-[36px] min-w-[36px] rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative aspect-video bg-black">
              <video
                src={movie.trailerUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
