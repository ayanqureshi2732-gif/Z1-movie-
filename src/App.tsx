import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { HomePage } from './pages/HomePage';
import { MoviesPage } from './pages/MoviesPage';
import { SearchPage } from './pages/SearchPage';
import { MovieDetailsPage } from './pages/MovieDetailsPage';
import { VideoPlayerPage } from './pages/VideoPlayerPage';
import { HistoryPage } from './pages/HistoryPage';
import { MyListPage } from './pages/MyListPage';
import { LiveTVPage } from './pages/LiveTVPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

const AppContent: React.FC = () => {
  const { route, toasts } = useApp();

  // If in dedicated video player mode: hide header, hide bottom nav, render full player view
  if (route.path === '/player/:id') {
    return (
      <main className="w-full min-h-screen bg-black overflow-hidden">
        <VideoPlayerPage movieId={route.id} />
      </main>
    );
  }

  // Active page selection
  const renderActivePage = () => {
    switch (route.path) {
      case '/':
        return <HomePage />;
      case '/movies':
        return <MoviesPage />;
      case '/search':
        return <SearchPage />;
      case '/movie/:id':
        return <MovieDetailsPage movieId={route.id} />;
      case '/history':
        return <HistoryPage />;
      case '/my-list':
        return <MyListPage />;
      case '/live-tv':
        return <LiveTVPage initialChannelId={route.channelId} />;
      case '/profile':
        return <ProfilePage />;
      case '/admin':
        return <AdminPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#08080b] text-white flex flex-col justify-between overflow-x-hidden">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Page Area in Normal Document Flow */}
      {/* pb-20 on mobile ensures bottom navigation never obscures content */}
      <main className="flex-1 w-full pb-20 md:pb-6 relative z-10 bg-[#08080b]">
        {renderActivePage()}
      </main>

      {/* Mobile Bottom Navigation Bar (Hidden on Player) */}
      <BottomNav />

      {/* Toast Notification Container */}
      {toasts.length > 0 && (
        <div className="fixed top-18 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full px-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`p-3 rounded-xl shadow-2xl backdrop-blur-md border text-xs font-semibold flex items-center gap-2 pointer-events-auto transition-all ${
                toast.type === 'success'
                  ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40'
                  : toast.type === 'error'
                  ? 'bg-red-950/90 text-red-200 border-red-500/40'
                  : 'bg-neutral-900/90 text-gray-200 border-white/20'
              }`}
            >
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
              {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-red-400 flex-shrink-0" />}
              <span className="truncate">{toast.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
