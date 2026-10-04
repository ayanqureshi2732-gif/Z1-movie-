export interface AudioTrack {
  id: string;
  language: string; // e.g. "Hindi", "Tamil", "Telugu", "English", "Spanish"
  label: string; // e.g. "Hindi (Original 5.1)", "English (Dubbed)"
  codec?: string; // "AAC", "AC3", "EAC3", "MP3"
  audioUrl?: string; // Optional separate dubbed audio URL synchronized with video
  isDefault?: boolean;
}

export interface VideoQualityOption {
  label: string; // "4K Ultra HD", "1080p Full HD", "720p HD", "480p SD"
  url: string;
  bitrate?: string;
}

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
  audioTracks?: AudioTrack[];
  qualities?: VideoQualityOption[];
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

export type UploadStatus =
  | 'queued'
  | 'uploading'
  | 'processing'
  | 'completed'
  | 'paused'
  | 'failed'
  | 'cancelled';

export interface UploadQueueItem {
  id: string;
  file?: File;
  fileName: string;
  fileSize: number;
  thumbnailUrl?: string;
  progress: number; // 0 - 100
  uploadedBytes: number;
  totalBytes: number;
  speedBytesPerSec: number;
  status: UploadStatus;
  errorMessage?: string;
  sessionId?: string;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  targetMovieId?: string;
  movieMetadata?: Partial<Movie>;
  audioTracks?: AudioTrack[];
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
  | { path: '/admin'; tab?: 'movies' | 'uploads' | 'add' | 'supabase' };
