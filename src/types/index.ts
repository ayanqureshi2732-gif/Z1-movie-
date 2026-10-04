export interface Movie {
  id: string;
  title: string;
  description: string;
  posterUrl: string;
  backdropUrl: string;
  videoUrl: string;
  trailerUrl?: string;
  year: number;
  language: string;
  genre: string[];
  duration: string;
  rating: number; // e.g. 8.8
  cast: string[];
  director: string;
  isTrending: boolean;
  isFeatured: boolean;
  isNewRelease: boolean;
  isTop10: boolean;
  top10Rank?: number;
  isPremium: boolean;
  isPublished: boolean;
  createdAt: string;
  views?: number;
}

export interface WatchHistoryItem {
  movieId: string;
  progressPercent: number; // 0 - 100
  lastWatchedPosition: number; // seconds
  duration: number; // seconds
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  isKid: boolean;
  isVip: boolean;
  email: string;
}

export interface LiveChannel {
  id: string;
  name: string;
  logo: string;
  category: string;
  streamUrl: string;
  currentProgram: string;
  nextProgram: string;
  viewersCount: number;
}

export type AppRoute =
  | { path: '/' }
  | { path: '/movies' }
  | { path: '/search'; query?: string }
  | { path: '/movie/:id'; id: string }
  | { path: '/player/:id'; id: string }
  | { path: '/history' }
  | { path: '/my-list' }
  | { path: '/live-tv'; channelId?: string }
  | { path: '/profile' }
  | { path: '/admin' };
