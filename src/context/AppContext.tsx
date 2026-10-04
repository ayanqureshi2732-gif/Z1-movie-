import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Movie, AppRoute, WatchHistoryItem, UserProfile, LiveChannel } from '../types';
import {
  getSavedMovies,
  saveMovies,
  getWatchHistory,
  saveWatchHistory,
  getMyList,
  saveMyList,
  getUserProfile,
  saveUserProfile,
  INITIAL_LIVE_CHANNELS,
} from '../services/db';

interface ToastInfo {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  route: AppRoute;
  navigate: (route: AppRoute) => void;
  goBack: () => void;
  movies: Movie[];
  addMovie: (movie: Movie) => void;
  updateMovie: (movie: Movie) => void;
  deleteMovie: (id: string) => void;
  togglePublish: (id: string) => void;
  watchHistory: WatchHistoryItem[];
  updateWatchProgress: (movieId: string, seconds: number, duration: number) => void;
  clearWatchHistory: () => void;
  removeFromHistory: (movieId: string) => void;
  myList: string[];
  toggleMyList: (movieId: string) => void;
  isInMyList: (movieId: string) => boolean;
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
  liveChannels: LiveChannel[];
  toasts: ToastInfo[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper to parse current path into AppRoute
function parseCurrentUrl(): AppRoute {
  if (typeof window === 'undefined') return { path: '/' };
  const pathname = window.location.pathname;

  if (pathname.startsWith('/movie/')) {
    const id = pathname.replace('/movie/', '');
    return { path: '/movie/:id', id };
  }
  if (pathname.startsWith('/player/')) {
    const id = pathname.replace('/player/', '');
    return { path: '/player/:id', id };
  }
  if (pathname === '/movies') return { path: '/movies' };
  if (pathname === '/search') return { path: '/search' };
  if (pathname === '/history') return { path: '/history' };
  if (pathname === '/my-list') return { path: '/my-list' };
  if (pathname === '/live-tv') return { path: '/live-tv' };
  if (pathname === '/profile') return { path: '/profile' };
  if (pathname === '/admin') return { path: '/admin' };
  return { path: '/' };
}

function routeToPath(route: AppRoute): string {
  switch (route.path) {
    case '/':
      return '/';
    case '/movies':
      return '/movies';
    case '/search':
      return '/search';
    case '/movie/:id':
      return `/movie/${route.id}`;
    case '/player/:id':
      return `/player/${route.id}`;
    case '/history':
      return '/history';
    case '/my-list':
      return '/my-list';
    case '/live-tv':
      return '/live-tv';
    case '/profile':
      return '/profile';
    case '/admin':
      return '/admin';
    default:
      return '/';
  }
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [route, setRoute] = useState<AppRoute>(() => parseCurrentUrl());
  const [historyStack, setHistoryStack] = useState<AppRoute[]>([{ path: '/' }]);
  const [movies, setMovies] = useState<Movie[]>(() => getSavedMovies());
  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>(() => getWatchHistory());
  const [myList, setMyList] = useState<string[]>(() => getMyList());
  const [profile, setProfileState] = useState<UserProfile>(() => getUserProfile());
  const [liveChannels] = useState<LiveChannel[]>(INITIAL_LIVE_CHANNELS);
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  // Sync route with browser history
  useEffect(() => {
    const handlePopState = () => {
      setRoute(parseCurrentUrl());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (newRoute: AppRoute) => {
    const path = routeToPath(newRoute);
    window.history.pushState({}, '', path);
    setHistoryStack((prev) => [...prev, newRoute]);
    setRoute(newRoute);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const goBack = () => {
    if (historyStack.length > 1) {
      const newStack = [...historyStack];
      newStack.pop(); // remove current
      const prevRoute = newStack[newStack.length - 1];
      setHistoryStack(newStack);
      window.history.pushState({}, '', routeToPath(prevRoute));
      setRoute(prevRoute);
    } else {
      navigate({ path: '/' });
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  const addMovie = (movie: Movie) => {
    const updated = [movie, ...movies];
    setMovies(updated);
    saveMovies(updated);
    showToast(`"${movie.title}" added successfully`, 'success');
  };

  const updateMovie = (updatedMovie: Movie) => {
    const updated = movies.map((m) => (m.id === updatedMovie.id ? updatedMovie : m));
    setMovies(updated);
    saveMovies(updated);
    showToast(`Updated "${updatedMovie.title}"`, 'success');
  };

  const deleteMovie = (id: string) => {
    const target = movies.find((m) => m.id === id);
    const updated = movies.filter((m) => m.id !== id);
    setMovies(updated);
    saveMovies(updated);
    showToast(`Deleted ${target?.title || 'movie'}`, 'info');
  };

  const togglePublish = (id: string) => {
    const updated = movies.map((m) => {
      if (m.id === id) {
        const nextState = !m.isPublished;
        showToast(
          nextState ? `"${m.title}" is now Published` : `"${m.title}" is now Unpublished`,
          'info'
        );
        return { ...m, isPublished: nextState };
      }
      return m;
    });
    setMovies(updated);
    saveMovies(updated);
  };

  const updateWatchProgress = (movieId: string, seconds: number, duration: number) => {
    if (duration <= 0) return;
    const progressPercent = Math.min(100, Math.round((seconds / duration) * 100));
    setWatchHistory((prev) => {
      const existingIdx = prev.findIndex((item) => item.movieId === movieId);
      const newItem: WatchHistoryItem = {
        movieId,
        progressPercent,
        lastWatchedPosition: Math.floor(seconds),
        duration: Math.floor(duration),
        updatedAt: new Date().toISOString(),
      };
      let updated: WatchHistoryItem[];
      if (existingIdx >= 0) {
        updated = [...prev];
        updated[existingIdx] = newItem;
      } else {
        updated = [newItem, ...prev];
      }
      saveWatchHistory(updated);
      return updated;
    });
  };

  const clearWatchHistory = () => {
    setWatchHistory([]);
    saveWatchHistory([]);
    showToast('Watch history cleared', 'info');
  };

  const removeFromHistory = (movieId: string) => {
    setWatchHistory((prev) => {
      const updated = prev.filter((item) => item.movieId !== movieId);
      saveWatchHistory(updated);
      return updated;
    });
  };

  const toggleMyList = (movieId: string) => {
    const exists = myList.includes(movieId);
    const movie = movies.find((m) => m.id === movieId);
    let updated: string[];
    if (exists) {
      updated = myList.filter((id) => id !== movieId);
      showToast(`Removed from My List`, 'info');
    } else {
      updated = [movieId, ...myList];
      showToast(`Added "${movie?.title || 'Movie'}" to My List`, 'success');
    }
    setMyList(updated);
    saveMyList(updated);
  };

  const isInMyList = (movieId: string) => {
    return myList.includes(movieId);
  };

  const setProfile = (newProfile: UserProfile) => {
    setProfileState(newProfile);
    saveUserProfile(newProfile);
    showToast('Profile updated', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        route,
        navigate,
        goBack,
        movies,
        addMovie,
        updateMovie,
        deleteMovie,
        togglePublish,
        watchHistory,
        updateWatchProgress,
        clearWatchHistory,
        removeFromHistory,
        myList,
        toggleMyList,
        isInMyList,
        profile,
        setProfile,
        liveChannels,
        toasts,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
