import React, { useState } from 'react';
import { Play, Plus, Check, Star, Info, Tv, Film, Compass, Globe2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MovieRow } from '../components/MovieRow';
import { Top10Row } from '../components/Top10Row';

export const HomePage: React.FC = () => {
  const { movies, watchHistory, navigate, myList, toggleMyList, liveChannels } = useApp();

  // Find featured or top movie for Hero Banner
  const featuredMovie =
    movies.find((m) => m.isFeatured && m.isPublished) ||
    movies.find((m) => m.isPublished) ||
    movies[0];

  const inList = featuredMovie ? myList.includes(featuredMovie.id) : false;

  // Filter sections
  const publishedMovies = movies.filter((m) => m.isPublished);

  // Continue Watching list
  const continueWatchingMovies = watchHistory
    .map((hist) => {
      const movie = publishedMovies.find((m) => m.id === hist.movieId);
      return movie ? { movie, progress: hist.progressPercent } : null;
    })
    .filter(Boolean) as { movie: (typeof movies)[0]; progress: number }[];

  const progressMap = continueWatchingMovies.reduce((acc, curr) => {
    acc[curr.movie.id] = curr.progress;
    return acc;
  }, {} as Record<string, number>);

  const trendingMovies = publishedMovies.filter((m) => m.isTrending);
  const newReleases = publishedMovies.filter((m) => m.isNewRelease);
  const recommendedMovies = publishedMovies.slice().reverse();

  // Curated genres & languages
  const genresList = [
    'Action',
    'Sci-Fi',
    'Thriller',
    'Crime',
    'Adventure',
    'Drama',
    'Fantasy',
    'Comedy',
    'Horror',
  ];

  const languagesList = [
    { code: 'en', name: 'English', count: 12 },
    { code: 'hi', name: 'Hindi', count: 8 },
    { code: 'ja', name: 'Japanese', count: 6 },
    { code: 'ko', name: 'Korean', count: 5 },
    { code: 'es', name: 'Spanish', count: 4 },
    { code: 'fr', name: 'French', count: 3 },
  ];

  return (
    <div className="w-full bg-[#08080b] text-white overflow-x-hidden min-h-screen">
      {/* 1. HERO BANNER in Normal Flow */}
      {featuredMovie && (
        <section className="relative w-full overflow-hidden bg-black">
          {/* Backdrop Image with Scrim Gradients */}
          <div className="relative w-full h-[54vh] sm:h-[65vh] md:h-[72vh] max-h-[720px] overflow-hidden">
            <img
              src={featuredMovie.backdropUrl || featuredMovie.posterUrl}
              alt={featuredMovie.title}
              className="w-full h-full object-cover object-center transform scale-[1.02]"
              referrerPolicy="no-referrer"
            />
            {/* Multi-tier gradient scrims: ensuring 100% contrast & zero overlapping bugs */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#08080b] via-[#08080b]/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#08080b] via-[#08080b]/70 to-transparent max-w-2xl" />
          </div>

          {/* Hero Content Overlay (Anchored to bottom of hero area) */}
          <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 pb-6 sm:pb-10 flex flex-col justify-end">
            <div className="max-w-xl">
              {/* Unboxed Metadata Line (Zero-Pill Discipline) */}
              <div className="flex items-center flex-wrap gap-2 text-xs sm:text-sm text-gray-300 font-medium mb-2">
                <span className="text-red-500 font-bold tracking-wider">Z1 ORIGINAL</span>
                <span aria-hidden="true">·</span>
                <span>{featuredMovie.year}</span>
                <span aria-hidden="true">·</span>
                <span>{featuredMovie.language}</span>
                <span aria-hidden="true">·</span>
                <span>{featuredMovie.duration}</span>
                <span aria-hidden="true">·</span>
                <div className="flex items-center gap-1 text-amber-400 font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{featuredMovie.rating.toFixed(1)}</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black font-brand text-white tracking-tight leading-tight mb-2 sm:mb-3">
                {featuredMovie.title}
              </h1>

              {/* Synopsis */}
              <p className="text-xs sm:text-sm text-gray-300 line-clamp-2 sm:line-clamp-3 mb-5 leading-relaxed max-w-lg">
                {featuredMovie.description}
              </p>

              {/* CTA Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate({ path: '/player/:id', id: featuredMovie.id })}
                  className="min-h-[44px] px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-900/40 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>WATCH NOW</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleMyList(featuredMovie.id)}
                  className="min-h-[44px] px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-white font-semibold text-sm flex items-center justify-center gap-2 backdrop-blur-md border border-white/20 transition-all cursor-pointer"
                >
                  {inList ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>IN LIST</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>MY LIST</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate({ path: '/movie/:id', id: featuredMovie.id })}
                  title="View Details"
                  className="min-h-[44px] min-w-[44px] rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-gray-200 flex items-center justify-center backdrop-blur-md border border-white/10 transition-all cursor-pointer"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. MAIN SECTIONS IN STRICT DOCUMENT FLOW */}
      <div className="max-w-7xl mx-auto space-y-2 py-4">
        {/* Continue Watching Section (if any watched movies) */}
        {continueWatchingMovies.length > 0 && (
          <MovieRow
            title="Continue Watching"
            subtitle="Pick up where you left off"
            movies={continueWatchingMovies.map((cw) => cw.movie)}
            showProgressMap={progressMap}
            onSeeAll={() => navigate({ path: '/history' })}
          />
        )}

        {/* Trending */}
        <MovieRow
          title="Trending on Z1"
          subtitle="Top rated by subscribers this week"
          movies={trendingMovies}
          onSeeAll={() => navigate({ path: '/movies' })}
        />

        {/* Top 10 with prominent numbered numerals */}
        <Top10Row movies={publishedMovies} />

        {/* New Releases */}
        <MovieRow
          title="New Releases"
          subtitle="Freshly added blockbusters & originals"
          movies={newReleases}
          onSeeAll={() => navigate({ path: '/movies' })}
        />

        {/* All Movies Carousel */}
        <MovieRow
          title="Featured Movies"
          subtitle="Curated cinematic experiences"
          movies={publishedMovies}
          onSeeAll={() => navigate({ path: '/movies' })}
        />

        {/* GENRES SECTION */}
        <section className="w-full px-4 sm:px-6 my-6 sm:my-8 block">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Compass className="w-4 h-4 text-red-500" />
                <span>Explore Genres</span>
              </h2>
              <p className="text-xs text-gray-400">Find movies curated by theme and mood</p>
            </div>
            <button
              onClick={() => navigate({ path: '/movies' })}
              className="text-xs text-red-400 hover:text-red-300 font-medium cursor-pointer"
            >
              Browse All
            </button>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
            {genresList.map((genre) => (
              <button
                key={genre}
                onClick={() => navigate({ path: '/movies' })}
                className="flex-shrink-0 min-h-[44px] px-4 py-2 rounded-xl bg-[#14141d] hover:bg-red-600/20 active:scale-95 border border-white/10 hover:border-red-500/40 text-xs font-semibold text-gray-200 hover:text-white transition-all cursor-pointer flex items-center gap-2"
              >
                <span>{genre}</span>
              </button>
            ))}
          </div>
        </section>

        {/* LIVE TV SECTION */}
        <section className="w-full px-4 sm:px-6 my-6 sm:my-8 block">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Tv className="w-4 h-4 text-red-500" />
                <span>Live TV Channels</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white animate-pulse">
                  LIVE
                </span>
              </h2>
              <p className="text-xs text-gray-400">Stream 24/7 uninterrupted broadcasts</p>
            </div>
            <button
              onClick={() => navigate({ path: '/live-tv' })}
              className="text-xs text-red-400 hover:text-red-300 font-medium cursor-pointer"
            >
              Open TV Guide
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {liveChannels.map((channel) => (
              <div
                key={channel.id}
                onClick={() => navigate({ path: '/live-tv', channelId: channel.id })}
                className="p-3.5 rounded-xl bg-[#121218] border border-white/[0.08] hover:border-red-500/50 hover:bg-[#161622] transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl p-1.5 rounded-lg bg-black/50 border border-white/10">
                      {channel.logo}
                    </span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">{channel.name}</h4>
                      <span className="text-[11px] text-gray-400">{channel.category}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-red-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                    LIVE
                  </span>
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/5">
                  <div className="text-[11px] text-gray-400 font-medium truncate">
                    Now: <span className="text-gray-200">{channel.currentProgram}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-gray-500 mt-1">
                    <span>Next: {channel.nextProgram}</span>
                    <span>{channel.viewersCount.toLocaleString()} watching</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* LANGUAGES SECTION */}
        <section className="w-full px-4 sm:px-6 my-6 sm:my-8 block">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-red-500" />
                <span>Browse by Language</span>
              </h2>
              <p className="text-xs text-gray-400">Global stories in your native language</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
            {languagesList.map((lang) => (
              <button
                key={lang.code}
                onClick={() => navigate({ path: '/movies' })}
                className="min-h-[44px] p-3 rounded-xl bg-[#121218] border border-white/[0.08] hover:border-red-500/40 text-left hover:bg-[#161620] transition-all cursor-pointer group"
              >
                <div className="text-xs sm:text-sm font-semibold text-white group-hover:text-red-400 transition-colors">
                  {lang.name}
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">Explore catalog</div>
              </button>
            ))}
          </div>
        </section>

        {/* Recommended */}
        <MovieRow
          title="Recommended For You"
          subtitle="Based on your streaming tastes"
          movies={recommendedMovies}
          onSeeAll={() => navigate({ path: '/movies' })}
        />
      </div>
    </div>
  );
};
