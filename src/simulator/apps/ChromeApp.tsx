import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, Home, Search, MoreVertical, Globe, ExternalLink } from 'lucide-react';
import { AndroidAppId } from '../types';

interface ChromeAppProps {
  onOpenApp: (appId: AndroidAppId) => void;
}

export const ChromeApp: React.FC<ChromeAppProps> = ({ onOpenApp }) => {
  const [urlInput, setUrlInput] = useState('');
  const [currentUrl, setCurrentUrl] = useState('https://z1movies.app');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[] | null>(null);

  const handleNavigate = (url: string) => {
    setIsLoading(true);
    let target = url.trim();
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      if (target.includes('.') && !target.includes(' ')) {
        target = 'https://' + target;
      } else {
        // Search query mode
        setSearchQuery(target);
        setSearchResults([
          `Z1 MOVIES Official Streaming Portal — Watch latest 4K blockbusters`,
          `IMDb: Top Rated Sci-Fi & Action Movies 2026`,
          `Wikipedia: History of Cinematic Film & Video On Demand`,
          `YouTube Movies & Free TV Series Catalog`,
        ]);
        setCurrentUrl(`https://google.com/search?q=${encodeURIComponent(target)}`);
        setIsLoading(false);
        return;
      }
    }

    setSearchResults(null);
    setCurrentUrl(target);
    setUrlInput(target);
    setTimeout(() => setIsLoading(false), 300);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput) {
      handleNavigate(urlInput);
    }
  };

  const handleReload = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 400);
  };

  return (
    <div className="w-full h-full bg-[#1F1F1F] text-white flex flex-col justify-between select-none overflow-hidden">
      {/* Chrome Top Bar */}
      <header className="bg-[#2B2B2B] p-2 border-b border-white/10 flex flex-col gap-1.5 flex-shrink-0 shadow-md">
        {/* Navigation & Tabs Controls */}
        <div className="flex items-center justify-between gap-1 text-neutral-300">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleNavigate('https://z1movies.app')}
              className="p-1.5 rounded-full hover:bg-white/10 active:scale-90"
              title="Home"
            >
              <Home className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('https://z1movies.app')}
              className="p-1.5 rounded-full hover:bg-white/10 active:scale-90"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleReload}
              className={`p-1.5 rounded-full hover:bg-white/10 active:scale-90 ${isLoading ? 'animate-spin' : ''}`}
              title="Reload"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* URL / Omnibox Input */}
          <form onSubmit={handleFormSubmit} className="flex-1 max-w-[200px] flex items-center">
            <div className="w-full h-8 px-2.5 rounded-full bg-[#1A1A1A] border border-white/10 flex items-center gap-1.5 focus-within:border-blue-500 transition-colors">
              <Globe className="w-3 h-3 text-neutral-400 flex-shrink-0" />
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Search or enter URL"
                className="w-full bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none truncate"
              />
            </div>
          </form>

          {/* Tabs Badge & Menu */}
          <div className="flex items-center gap-1">
            <div className="w-5 h-5 rounded-[4px] border border-white/40 flex items-center justify-center text-[10px] font-bold">
              1
            </div>
            <button type="button" className="p-1 hover:bg-white/10 rounded-full">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Loading Progress Bar */}
        {isLoading && (
          <div className="w-full h-0.5 bg-neutral-700 overflow-hidden">
            <div className="w-2/3 h-full bg-blue-500 animate-pulse" />
          </div>
        )}
      </header>

      {/* Browser Viewport Area */}
      <div className="flex-1 overflow-y-auto bg-[#121212] p-4 text-neutral-200">
        {searchResults ? (
          /* Google Search Results Mock */
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
              <Search className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-neutral-400">Results for: <strong className="text-white">{searchQuery}</strong></span>
            </div>
            {searchResults.map((result, idx) => (
              <div
                key={idx}
                onClick={() => {
                  if (result.includes('Z1 MOVIES')) onOpenApp('z1movies');
                }}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer active:scale-98 transition-all"
              >
                <span className="text-[10px] text-blue-400 block truncate">https://results.web/{idx}</span>
                <h4 className="text-xs font-semibold text-blue-300 hover:underline mt-0.5">{result}</h4>
                <p className="text-[11px] text-neutral-400 mt-1">High quality streaming experience optimized for Android devices with instant play.</p>
              </div>
            ))}
          </div>
        ) : currentUrl.includes('z1movies.app') ? (
          /* Z1 Movies Official Portal Page */
          <div className="flex flex-col items-center justify-center text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 to-red-800 p-2 shadow-xl flex items-center justify-center">
              <span className="font-black italic text-2xl text-white">Z1</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Z1 MOVIES Web Gateway</h2>
              <p className="text-xs text-neutral-400 max-w-xs mt-1">
                Enjoy seamless 4K movies, TV series, search, and instant playback directly on your Android phone.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onOpenApp('z1movies')}
              className="px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold text-xs shadow-lg shadow-red-950 flex items-center gap-2 transition-all"
            >
              <span>Launch Z1 MOVIES App</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            {/* Quick Link Bookmarks */}
            <div className="w-full pt-6">
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-3">
                Quick Shortcuts
              </span>
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleNavigate('https://wikipedia.org')}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 flex flex-col items-center gap-1 text-[11px]"
                >
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-serif text-white font-bold">W</div>
                  <span className="truncate max-w-[50px]">Wiki</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigate('https://imdb.com')}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 flex flex-col items-center gap-1 text-[11px]"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">IMDb</div>
                  <span className="truncate max-w-[50px]">IMDb</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigate('https://youtube.com')}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 flex flex-col items-center gap-1 text-[11px]"
                >
                  <div className="w-8 h-8 rounded-full bg-red-600/20 text-red-400 flex items-center justify-center font-bold">▶</div>
                  <span className="truncate max-w-[50px]">YouTube</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenApp('z1movies')}
                  className="p-2 rounded-xl bg-red-600/20 text-red-300 hover:bg-red-600/30 flex flex-col items-center gap-1 text-[11px] border border-red-500/30"
                >
                  <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-black italic">Z1</div>
                  <span className="truncate max-w-[50px]">Z1 App</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* General Web Page View */
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-xs text-blue-400">{currentUrl}</span>
              <h3 className="text-base font-bold text-white mt-1">Web Page Loaded</h3>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                Secure connection established. All web assets are simulated cleanly within the virtual Android environment.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleNavigate('https://z1movies.app')}
              className="text-xs text-blue-400 hover:underline flex items-center gap-1"
            >
              ← Return to Z1 MOVIES portal
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
