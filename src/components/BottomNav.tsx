import React from 'react';
import { Home, Film, Tv, Bookmark, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BottomNav: React.FC = () => {
  const { route, navigate } = useApp();

  // STRICT REQUIREMENT: Video player must hide bottom navigation!
  if (route.path === '/player/:id') {
    return null;
  }

  const tabs = [
    {
      label: 'Home',
      icon: Home,
      isActive: route.path === '/',
      onClick: () => navigate({ path: '/' }),
    },
    {
      label: 'Movies',
      icon: Film,
      isActive: route.path === '/movies',
      onClick: () => navigate({ path: '/movies' }),
    },
    {
      label: 'Live TV',
      icon: Tv,
      isActive: route.path === '/live-tv',
      badge: 'LIVE',
      onClick: () => navigate({ path: '/live-tv' }),
    },
    {
      label: 'My List',
      icon: Bookmark,
      isActive: route.path === '/my-list',
      onClick: () => navigate({ path: '/my-list' }),
    },
    {
      label: 'Profile',
      icon: User,
      isActive: route.path === '/profile',
      onClick: () => navigate({ path: '/profile' }),
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#09090d]/95 backdrop-blur-xl border-t border-white/[0.08] shadow-2xl safe-area-bottom"
    >
      <div className="grid grid-cols-5 h-16 items-center max-w-md mx-auto px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.label}
              onClick={tab.onClick}
              className={`flex flex-col items-center justify-center h-full min-h-[44px] min-w-[44px] py-1 transition-all select-none cursor-pointer relative ${
                tab.isActive
                  ? 'text-red-500 font-semibold'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-150 ${
                    tab.isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                  }`}
                />
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-3 text-[8px] font-extrabold px-1 py-0.2 rounded bg-red-600 text-white uppercase tracking-tighter">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-1 line-clamp-1">
                {tab.label}
              </span>
              {tab.isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-red-500" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
