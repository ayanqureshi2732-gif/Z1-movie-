import React from 'react';
import { Search, User, ShieldAlert, Film, Tv, Bookmark } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from './BrandLogo';

export const Navbar: React.FC = () => {
  const { route, navigate, profile } = useApp();

  return (
    <header className="sticky top-0 z-40 w-full bg-[#08080b]/92 backdrop-blur-md border-b border-white/[0.06] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
        {/* Brand Zone */}
        <div className="flex items-center gap-6">
          <BrandLogo onClick={() => navigate({ path: '/' })} />

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-gray-300">
            <button
              onClick={() => navigate({ path: '/' })}
              className={`hover:text-white transition-colors cursor-pointer ${
                route.path === '/' ? 'text-red-500 font-semibold' : ''
              }`}
            >
              Home
            </button>
            <button
              onClick={() => navigate({ path: '/movies' })}
              className={`hover:text-white transition-colors cursor-pointer ${
                route.path === '/movies' ? 'text-red-500 font-semibold' : ''
              }`}
            >
              Movies
            </button>
            <button
              onClick={() => navigate({ path: '/live-tv' })}
              className={`hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 ${
                route.path === '/live-tv' ? 'text-red-500 font-semibold' : ''
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Live TV
            </button>
            <button
              onClick={() => navigate({ path: '/my-list' })}
              className={`hover:text-white transition-colors cursor-pointer ${
                route.path === '/my-list' ? 'text-red-500 font-semibold' : ''
              }`}
            >
              My List
            </button>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Admin Studio Quick Link */}
          <button
            onClick={() => navigate({ path: '/admin' })}
            title="Admin Studio"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] transition-colors cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">Admin</span>
          </button>

          {/* Search Button */}
          <button
            onClick={() => navigate({ path: '/search' })}
            className={`min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full text-gray-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer ${
              route.path === '/search' ? 'text-red-500 bg-white/[0.08]' : ''
            }`}
            aria-label="Search movies"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Profile Avatar */}
          <button
            onClick={() => navigate({ path: '/profile' })}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full hover:ring-2 hover:ring-red-500/80 transition-all cursor-pointer p-0.5"
            aria-label="User profile"
          >
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-8 h-8 rounded-full object-cover border border-white/20"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Fallback avatar icon
                (e.currentTarget as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop';
              }}
            />
          </button>
        </div>
      </div>
    </header>
  );
};
