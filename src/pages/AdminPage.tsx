import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldAlert,
  Upload,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Cloud,
  Film,
  Play,
  Pause,
  RotateCcw,
  Check,
  Database,
  Lock,
  Unlock,
  Layers,
  ArrowRight,
  RefreshCw,
  X,
  Languages,
  Clock,
  HardDrive,
  FileVideo,
  ListOrdered,
  Search,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Movie, AudioTrack, UploadQueueItem } from '../types';
import { uploadImageFile } from '../services/uploadService';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  SupabaseConfig,
} from '../services/db';
import { useUploadManager } from '../hooks/useUploadManager';

export const AdminPage: React.FC = () => {
  const { movies, addMovie, updateMovie, deleteMovie, togglePublish, navigate, showToast, route } =
    useApp();

  const {
    queue,
    activeUploads,
    queuedUploads,
    completedUploads,
    failedUploads,
    pausedUploads,
    overallProgress,
    totalSpeedBytesPerSec,
    addFilesToQueue,
    pauseUpload,
    resumeUpload,
    cancelUpload,
    retryUpload,
    removeItem,
    pauseAll,
    resumeAll,
    cancelAll,
    clearCompleted,
  } = useUploadManager();

  // Admin PIN protection
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Tabs: 'uploads' | 'movies' | 'add' | 'supabase'
  const initialTab = (route as any).tab || 'uploads';
  const [activeTab, setActiveTab] = useState<'uploads' | 'movies' | 'add' | 'supabase'>(initialTab);

  // Search in Uploads / Movies
  const [uploadSearchQuery, setUploadSearchQuery] = useState('');
  const [uploadStatusFilter, setUploadStatusFilter] = useState<'all' | 'uploading' | 'queued' | 'completed' | 'failed'>('all');

  // Editing movie state
  const [editingMovieId, setEditingMovieId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [year, setYear] = useState<number>(2026);
  const [language, setLanguage] = useState('Hindi');
  const [genreInput, setGenreInput] = useState('Action, Sci-Fi');
  const [duration, setDuration] = useState('2h 10m');
  const [rating, setRating] = useState<number>(8.8);
  const [castInput, setCastInput] = useState('Featured Cast');
  const [director, setDirector] = useState('Z1 Productions');
  const [posterUrl, setPosterUrl] = useState('');
  const [backdropUrl, setBackdropUrl] = useState('');
  const [trailerUrl, setTrailerUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  // Audio Tracks for Movie
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([
    { id: 'track-1', language: 'Hindi', label: 'Hindi (Original 5.1)', codec: 'AAC', isDefault: true },
    { id: 'track-2', language: 'English', label: 'English (Dubbed Stereo)', codec: 'AAC' },
    { id: 'track-3', language: 'Tamil', label: 'Tamil (Dubbed Stereo)', codec: 'AAC' },
    { id: 'track-4', language: 'Telugu', label: 'Telugu (Dubbed Stereo)', codec: 'AAC' },
  ]);

  // Multiple Video Files Selection
  const [selectedVideoFiles, setSelectedVideoFiles] = useState<File[]>([]);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Toggles
  const [isTrending, setIsTrending] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewRelease, setIsNewRelease] = useState(true);
  const [isTop10, setIsTop10] = useState(false);
  const [top10Rank, setTop10Rank] = useState<number>(1);
  const [isPremium, setIsPremium] = useState(false);
  const [isPublished, setIsPublished] = useState(true);

  // Poster & Backdrop Files
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterUploading, setPosterUploading] = useState(false);
  const posterInputRef = useRef<HTMLInputElement>(null);

  const [backdropFile, setBackdropFile] = useState<File | null>(null);
  const [backdropUploading, setBackdropUploading] = useState(false);
  const backdropInputRef = useRef<HTMLInputElement>(null);

  // Supabase Configuration State
  const [supabaseConfig, setSupabaseState] = useState<SupabaseConfig>(() =>
    getSupabaseConfig()
  );
  const [supabaseSavedNotice, setSupabaseSavedNotice] = useState(false);

  useEffect(() => {
    if ((route as any).tab) {
      setActiveTab((route as any).tab);
    }
  }, [route]);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '1234' || pinInput === 'z1' || pinInput.toLowerCase() === 'admin') {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  // MULTIPLE FILE SELECTION HANDLER
  const handleMultipleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedVideoFiles(files);
      if (files.length === 1 && !title) {
        setTitle(files[0].name.replace(/\.[^/.]+$/, '').replace(/[._-]/g, ' '));
      }
      showToast(`${files.length} video file${files.length > 1 ? 's' : ''} selected`, 'info');
    }
  };

  // Start Batch Upload into Queue
  const handleStartBatchUpload = async () => {
    if (selectedVideoFiles.length === 0) {
      showToast('Please select one or more video files first', 'error');
      return;
    }

    const sharedMetadata: Partial<Movie> = {
      title: title.trim() || undefined,
      description: description.trim() || undefined,
      year,
      language,
      genre: genreInput.split(',').map((g) => g.trim()).filter(Boolean),
      duration,
      rating,
      cast: castInput.split(',').map((c) => c.trim()).filter(Boolean),
      director: director.trim(),
      posterUrl: posterUrl.trim() || undefined,
      backdropUrl: backdropUrl.trim() || undefined,
      trailerUrl: trailerUrl.trim() || undefined,
      isTrending,
      isFeatured,
      isNewRelease,
      isTop10,
      top10Rank: isTop10 ? top10Rank : undefined,
      isPremium,
      isPublished,
      audioTracks,
    };

    const added = await addFilesToQueue(selectedVideoFiles, sharedMetadata, editingMovieId || undefined);
    showToast(`${added.length} video${added.length > 1 ? 's' : ''} added to Upload Queue`, 'success');
    setSelectedVideoFiles([]);
    if (videoInputRef.current) videoInputRef.current.value = '';
    setActiveTab('uploads');
  };

  const handlePosterSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPosterFile(file);
      setPosterUploading(true);
      try {
        const url = await uploadImageFile(file);
        setPosterUrl(url);
        showToast('Poster uploaded successfully', 'success');
      } catch (err) {
        showToast('Failed to upload poster', 'error');
      } finally {
        setPosterUploading(false);
      }
    }
  };

  const handleBackdropSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBackdropFile(file);
      setBackdropUploading(true);
      try {
        const url = await uploadImageFile(file);
        setBackdropUrl(url);
        showToast('Backdrop uploaded successfully', 'success');
      } catch (err) {
        showToast('Failed to upload backdrop', 'error');
      } finally {
        setBackdropUploading(false);
      }
    }
  };

  // Add / Edit Audio Track
  const handleAddAudioTrack = () => {
    const newTrack: AudioTrack = {
      id: `track_${Date.now()}`,
      language: 'Tamil',
      label: 'Tamil [Dubbed] (Stereo)',
      codec: 'AAC',
    };
    setAudioTracks((prev) => [...prev, newTrack]);
  };

  const handleUpdateAudioTrack = (index: number, updated: Partial<AudioTrack>) => {
    setAudioTracks((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updated };
      return copy;
    });
  };

  const handleRemoveAudioTrack = (index: number) => {
    setAudioTracks((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setEditingMovieId(null);
    setTitle('');
    setDescription('');
    setYear(2026);
    setLanguage('Hindi');
    setGenreInput('Action, Sci-Fi');
    setDuration('2h 10m');
    setRating(8.8);
    setCastInput('Featured Cast');
    setDirector('Z1 Productions');
    setPosterUrl('');
    setBackdropUrl('');
    setTrailerUrl('');
    setVideoUrl('');
    setSelectedVideoFiles([]);
    setIsTrending(false);
    setIsFeatured(false);
    setIsNewRelease(true);
    setIsTop10(false);
    setIsPremium(false);
    setIsPublished(true);
  };

  const handleEditClick = (movie: Movie) => {
    setEditingMovieId(movie.id);
    setTitle(movie.title);
    setDescription(movie.description);
    setYear(movie.year);
    setLanguage(movie.language);
    setGenreInput(movie.genre.join(', '));
    setDuration(movie.duration);
    setRating(movie.rating);
    setCastInput(movie.cast.join(', '));
    setDirector(movie.director);
    setPosterUrl(movie.posterUrl);
    setBackdropUrl(movie.backdropUrl);
    setTrailerUrl(movie.trailerUrl || '');
    setVideoUrl(movie.videoUrl);
    if (movie.audioTracks && movie.audioTracks.length > 0) {
      setAudioTracks(movie.audioTracks);
    }
    setIsTrending(movie.isTrending);
    setIsFeatured(movie.isFeatured);
    setIsNewRelease(movie.isNewRelease);
    setIsTop10(movie.isTop10);
    setTop10Rank(movie.top10Rank || 1);
    setIsPremium(movie.isPremium);
    setIsPublished(movie.isPublished);
    setActiveTab('add');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitMovie = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast('Title is required', 'error');
      return;
    }

    // If videos are selected, trigger batch upload queue
    if (selectedVideoFiles.length > 0) {
      handleStartBatchUpload();
      return;
    }

    const finalVideoUrl =
      videoUrl.trim() ||
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4';
    const finalPosterUrl =
      posterUrl.trim() ||
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop';
    const finalBackdropUrl =
      backdropUrl.trim() ||
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1400&auto=format&fit=crop';

    const movieData: Movie = {
      id: editingMovieId || `movie_${Date.now()}`,
      title: title.trim(),
      description: description.trim() || 'A high-stakes cinematic thrill-ride streaming on Z1 MOVIES.',
      year,
      language,
      genre: genreInput.split(',').map((g) => g.trim()).filter(Boolean),
      duration,
      rating,
      cast: castInput.split(',').map((c) => c.trim()).filter(Boolean),
      director: director.trim() || 'Z1 Productions',
      posterUrl: finalPosterUrl,
      backdropUrl: finalBackdropUrl,
      trailerUrl: trailerUrl.trim() || undefined,
      videoUrl: finalVideoUrl,
      isTrending,
      isFeatured,
      isNewRelease,
      isTop10,
      top10Rank: isTop10 ? top10Rank : undefined,
      isPremium,
      isPublished,
      createdAt: new Date().toISOString(),
      audioTracks,
    };

    if (editingMovieId) {
      updateMovie(movieData);
      showToast('Movie updated successfully', 'success');
    } else {
      addMovie(movieData);
      showToast('Movie created and published', 'success');
    }

    resetForm();
    setActiveTab('movies');
  };

  const handleSaveSupabaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(supabaseConfig);
    setSupabaseSavedNotice(true);
    setTimeout(() => setSupabaseSavedNotice(false), 3000);
    showToast('Storage settings saved', 'success');
  };

  // Filtered queue items
  const filteredQueue = queue.filter((item) => {
    const matchesSearch =
      item.fileName.toLowerCase().includes(uploadSearchQuery.toLowerCase()) ||
      (item.movieMetadata?.title &&
        item.movieMetadata.title.toLowerCase().includes(uploadSearchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (uploadStatusFilter === 'all') return true;
    if (uploadStatusFilter === 'uploading') return item.status === 'uploading';
    if (uploadStatusFilter === 'queued') return item.status === 'queued';
    if (uploadStatusFilter === 'completed') return item.status === 'completed';
    if (uploadStatusFilter === 'failed') return item.status === 'failed' || item.status === 'paused';
    return true;
  });

  const speedMb = (totalSpeedBytesPerSec / (1024 * 1024)).toFixed(1);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#08080b] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#12131a] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-2xl bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-500">
              <Lock className="w-7 h-7" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-center text-white mb-1">
            Z1 Admin Authentication
          </h2>
          <p className="text-xs text-gray-400 text-center mb-6">
            Enter Admin PIN to manage movies, batch uploads, and cloud storage. (Default: 1234)
          </p>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Enter Admin PIN"
                className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 text-center text-lg tracking-widest font-mono"
                autoFocus
              />
              {pinError && (
                <p className="text-red-400 text-xs mt-1.5 text-center">
                  Invalid PIN. Default is 1234.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 active:scale-98 text-white font-bold text-sm shadow-lg transition-all cursor-pointer"
            >
              Unlock Admin Studio
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08080b] text-white">
      {/* Studio Header Bar */}
      <div className="border-b border-white/[0.08] bg-[#0c0d12]/90 backdrop-blur-md sticky top-14 sm:top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white shadow-lg shadow-red-600/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-white tracking-wide">
                  Z1 Admin Studio
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-600/20 border border-red-500/30 text-red-400 uppercase tracking-wider">
                  Cloud Management
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Resumable chunked uploads, multi-audio tracks & catalog curation
              </p>
            </div>
          </div>

          {/* Top Quick Status Pill */}
          <div className="flex items-center gap-2">
            {activeUploads.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-950/40 border border-red-500/30 text-xs font-semibold text-red-400">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span>{activeUploads.length} Uploading · {speedMb} MB/s</span>
              </div>
            )}
            <button
              onClick={() => {
                resetForm();
                setActiveTab('add');
              }}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-red-600/25 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Video</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('uploads')}
            className={`px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'uploads'
                ? 'border-red-500 text-red-500'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Center</span>
            {queue.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white">
                {queue.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('movies')}
            className={`px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'movies'
                ? 'border-red-500 text-red-500'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Movie Catalog</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white">
              {movies.length}
            </span>
          </button>

          <button
            onClick={() => {
              if (activeTab !== 'add') resetForm();
              setActiveTab('add');
            }}
            className={`px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'add'
                ? 'border-red-500 text-red-500'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{editingMovieId ? 'Edit Movie' : 'Add Movie'}</span>
          </button>

          <button
            onClick={() => setActiveTab('supabase')}
            className={`px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'supabase'
                ? 'border-red-500 text-red-500'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>Storage & Cloud</span>
          </button>
        </div>
      </div>

      {/* TAB 1: UPLOAD CENTER & QUEUE MANAGER */}
      {activeTab === 'uploads' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* Top Queue Controls & Concurrency Stats */}
          <div className="bg-[#12131a] border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative w-14 h-14 flex-shrink-0 flex items-center justify-center">
                <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15" fill="none" className="stroke-white/10" strokeWidth="3" />
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    className="stroke-red-500 transition-all duration-300"
                    strokeWidth="3"
                    strokeDasharray="94.2"
                    strokeDashoffset={94.2 - (94.2 * overallProgress) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute text-xs font-bold text-white">
                  {overallProgress}%
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Batch Upload Queue</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/10 text-gray-300">
                    Max 3 Concurrent
                  </span>
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {activeUploads.length > 0
                    ? `${activeUploads.length} uploading (${speedMb} MB/s) · ${queuedUploads.length} queued in line`
                    : queue.length > 0
                    ? `${completedUploads.length} of ${queue.length} completed`
                    : 'No active uploads. Select video files to start.'}
                </p>
              </div>
            </div>

            {/* Batch Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {activeUploads.length > 0 ? (
                <button
                  onClick={pauseAll}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause All</span>
                </button>
              ) : (
                <button
                  onClick={resumeAll}
                  className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Resume All</span>
                </button>
              )}

              {failedUploads.length > 0 && (
                <button
                  onClick={resumeAll}
                  className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry All Failed ({failedUploads.length})</span>
                </button>
              )}

              {completedUploads.length > 0 && (
                <button
                  onClick={clearCompleted}
                  className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/15 text-gray-300 font-medium text-xs transition-all cursor-pointer"
                >
                  Clear Finished
                </button>
              )}

              <button
                onClick={() => {
                  resetForm();
                  setActiveTab('add');
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-red-600/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add More Videos</span>
              </button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search uploads by filename or title..."
                value={uploadSearchQuery}
                onChange={(e) => setUploadSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#12131a] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center gap-1 bg-[#12131a] border border-white/10 rounded-xl p-1 text-xs">
              {(['all', 'uploading', 'queued', 'completed', 'failed'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setUploadStatusFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg font-medium capitalize transition-all cursor-pointer ${
                    uploadStatusFilter === filter
                      ? 'bg-red-600 text-white font-bold'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Queue Items List */}
          {filteredQueue.length === 0 ? (
            <div className="bg-[#12131a] border border-white/10 rounded-2xl p-12 text-center">
              <FileVideo className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <h4 className="text-base font-bold text-white mb-1">Upload Queue Empty</h4>
              <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">
                Select one or multiple large movie files in the Add Movie tab to start high-speed, resumable chunked uploading.
              </p>
              <button
                onClick={() => {
                  resetForm();
                  setActiveTab('add');
                }}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs shadow-lg shadow-red-600/20 cursor-pointer"
              >
                Select Movie Videos
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredQueue.map((item) => {
                const itemSpeedMb = (item.speedBytesPerSec / (1024 * 1024)).toFixed(1);
                const uploadedMb = (item.uploadedBytes / (1024 * 1024)).toFixed(1);
                const totalMb = (item.totalBytes / (1024 * 1024)).toFixed(1);

                return (
                  <div
                    key={item.id}
                    className="bg-[#12131a] border border-white/10 rounded-2xl p-4 shadow-xl hover:border-white/20 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Left: Thumbnail & Filename */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-16 h-16 sm:w-20 sm:h-14 rounded-xl bg-black/60 border border-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                          {item.thumbnailUrl ? (
                            <img
                              src={item.thumbnailUrl}
                              alt={item.fileName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FileVideo className="w-6 h-6 text-red-500" />
                          )}
                          {item.status === 'uploading' && (
                            <div className="absolute inset-0 bg-red-600/20 flex items-center justify-center">
                              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white truncate">
                              {item.movieMetadata?.title || item.fileName}
                            </h4>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                item.status === 'uploading'
                                  ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                                  : item.status === 'completed'
                                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                                  : item.status === 'processing'
                                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                                  : item.status === 'failed'
                                  ? 'bg-rose-600/20 text-rose-400 border border-rose-500/30'
                                  : item.status === 'paused'
                                  ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30'
                                  : 'bg-white/10 text-gray-300'
                              }`}
                            >
                              {item.status}
                            </span>
                          </div>

                          <p className="text-[11px] text-gray-400 truncate mt-0.5">
                            {item.fileName} · {totalMb} MB
                            {item.audioTracks && item.audioTracks.length > 0 && (
                              <span className="text-emerald-400 ml-2">
                                · {item.audioTracks.map((t) => t.language).join(', ')}
                              </span>
                            )}
                          </p>

                          {/* Error Message if any */}
                          {item.errorMessage && (
                            <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="truncate">{item.errorMessage}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 justify-end">
                        {item.status === 'uploading' && (
                          <button
                            onClick={() => pauseUpload(item.id)}
                            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                            title="Pause upload"
                          >
                            <Pause className="w-4 h-4" />
                          </button>
                        )}

                        {(item.status === 'paused' || item.status === 'failed') && (
                          <button
                            onClick={() => resumeUpload(item.id)}
                            className="p-2 rounded-xl bg-red-600 hover:bg-red-500 text-white transition-colors cursor-pointer"
                            title="Resume upload"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}

                        {item.status === 'failed' && (
                          <button
                            onClick={() => retryUpload(item.id)}
                            className="p-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white transition-colors cursor-pointer"
                            title="Retry upload"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 rounded-xl bg-white/[0.05] hover:bg-rose-950/60 text-gray-400 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Remove from queue"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar & Real Byte Stats */}
                    <div className="mt-3">
                      <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            item.status === 'completed'
                              ? 'bg-emerald-500'
                              : item.status === 'failed'
                              ? 'bg-rose-500'
                              : item.status === 'paused'
                              ? 'bg-amber-500'
                              : 'bg-red-600'
                          }`}
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono mt-1.5">
                        <span>
                          {uploadedMb} MB / {totalMb} MB ({item.progress}%)
                        </span>
                        {item.status === 'uploading' ? (
                          <span className="text-red-400 font-medium">{itemSpeedMb} MB/s</span>
                        ) : (
                          <span>{item.status === 'completed' ? 'Ready to stream' : item.status}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MOVIE CATALOG MANAGEMENT */}
      {activeTab === 'movies' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-base font-bold text-white">
              Published Movies ({movies.length})
            </h3>
            <button
              onClick={() => {
                resetForm();
                setActiveTab('add');
              }}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-red-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Movie</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {movies.map((m) => (
              <div
                key={m.id}
                className="bg-[#12131a] border border-white/10 rounded-2xl p-4 flex gap-3 shadow-lg hover:border-white/20 transition-all"
              >
                <img
                  src={m.posterUrl}
                  alt={m.title}
                  className="w-20 h-28 object-cover rounded-xl flex-shrink-0 bg-neutral-900 border border-white/10"
                />

                <div className="min-w-0 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white truncate">{m.title}</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {m.year} · {m.language} · {m.duration}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-red-600/20 text-red-400 border border-red-500/30">
                        ★ {m.rating}
                      </span>
                      {m.isPublished ? (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-600/20 text-emerald-400">
                          Published
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-neutral-800 text-gray-400">
                          Draft
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/[0.08]">
                    <button
                      onClick={() => navigate({ path: '/player/:id', id: m.id })}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
                      title="Play movie"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>

                    <button
                      onClick={() => handleEditClick(m)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
                      title="Edit metadata"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => togglePublish(m.id)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
                      title={m.isPublished ? 'Unpublish' : 'Publish'}
                    >
                      {m.isPublished ? (
                        <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </button>

                    <button
                      onClick={() => deleteMovie(m.id)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-950/50 text-gray-400 hover:text-rose-400 transition-colors cursor-pointer ml-auto"
                      title="Delete movie"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ADD / EDIT MOVIE & BATCH UPLOAD */}
      {activeTab === 'add' && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <div className="bg-[#12131a] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingMovieId ? `Edit Movie: ${title}` : 'Upload & Add Movie'}
                </h3>
                <p className="text-xs text-gray-400">
                  Select multiple video files for automatic background queueing or enter direct URLs.
                </p>
              </div>

              {editingMovieId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-1.5 rounded-xl bg-white/10 text-xs font-semibold hover:bg-white/20 transition-all cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleSubmitMovie} className="space-y-6">
              {/* SECTION: VIDEO FILE SELECTION (MULTIPLE) */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-bold text-white flex items-center gap-2">
                      <FileVideo className="w-4 h-4 text-red-500" />
                      <span>Select Video File(s)</span>
                    </label>
                    <span className="text-[11px] text-gray-400">
                      You can select MULTIPLE video files at once. Uploads run in the background.
                    </span>
                  </div>

                  <input
                    ref={videoInputRef}
                    type="file"
                    multiple
                    accept="video/*"
                    onChange={handleMultipleVideoSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-red-600/20 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choose Videos</span>
                  </button>
                </div>

                {selectedVideoFiles.length > 0 && (
                  <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-red-400">
                        {selectedVideoFiles.length} file{selectedVideoFiles.length > 1 ? 's' : ''} ready to upload:
                      </span>
                      <button
                        type="button"
                        onClick={handleStartBatchUpload}
                        className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-500 cursor-pointer"
                      >
                        Start Upload Queue Now
                      </button>
                    </div>

                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {selectedVideoFiles.map((file, idx) => (
                        <div key={idx} className="text-[11px] text-gray-300 flex items-center justify-between bg-black/40 px-2.5 py-1 rounded">
                          <span className="truncate">{file.name}</span>
                          <span className="text-gray-500 font-mono ml-2">
                            {(file.size / (1024 * 1024)).toFixed(1)} MB
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-gray-400">
                    Or Direct Streaming URL
                  </label>
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://commondatastorage.googleapis.com/.../video.mp4"
                    className="w-full mt-1 px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* SECTION: MOVIE METADATA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-300">Movie Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Chrono Protocol: Redline"
                    required
                    className="w-full mt-1 px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300">Release Year</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full mt-1 px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300">Overview / Synopsis</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Compelling synopsis of the movie..."
                  className="w-full mt-1 px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-300">Primary Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full mt-1 px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Hindi">Hindi</option>
                    <option value="English">English</option>
                    <option value="Tamil">Tamil</option>
                    <option value="Telugu">Telugu</option>
                    <option value="Malayalam">Malayalam</option>
                    <option value="Kannada">Kannada</option>
                    <option value="Spanish">Spanish</option>
                    <option value="Korean">Korean</option>
                    <option value="Japanese">Japanese</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300">Genres (Comma separated)</label>
                  <input
                    type="text"
                    value={genreInput}
                    onChange={(e) => setGenreInput(e.target.value)}
                    placeholder="Action, Sci-Fi, Cyberpunk"
                    className="w-full mt-1 px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300">Duration</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="2h 12m"
                    className="w-full mt-1 px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* SECTION: AUDIO TRACKS & DUBBED LANGUAGES */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Languages className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">Audio Tracks & Dubbed Languages</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddAudioTrack}
                    className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Language Track</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {audioTracks.map((track, idx) => (
                    <div
                      key={track.id}
                      className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06]"
                    >
                      <input
                        type="text"
                        value={track.language}
                        onChange={(e) => handleUpdateAudioTrack(idx, { language: e.target.value })}
                        placeholder="Language (e.g. Hindi)"
                        className="w-28 px-3 py-1.5 rounded-lg bg-black/50 border border-white/10 text-xs text-white"
                      />
                      <input
                        type="text"
                        value={track.label}
                        onChange={(e) => handleUpdateAudioTrack(idx, { label: e.target.value })}
                        placeholder="Label (e.g. Hindi Original 5.1)"
                        className="flex-1 px-3 py-1.5 rounded-lg bg-black/50 border border-white/10 text-xs text-white"
                      />
                      <input
                        type="text"
                        value={track.codec || 'AAC'}
                        onChange={(e) => handleUpdateAudioTrack(idx, { codec: e.target.value })}
                        placeholder="Codec (AAC/Dolby)"
                        className="w-24 px-3 py-1.5 rounded-lg bg-black/50 border border-white/10 text-xs text-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveAudioTrack(idx)}
                        className="p-2 text-gray-400 hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* POSTER & BACKDROP UPLOAD */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                  <label className="text-xs font-semibold text-gray-300 flex items-center justify-between">
                    <span>Poster Artwork</span>
                    <input
                      ref={posterInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePosterSelect}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => posterInputRef.current?.click()}
                      className="text-xs text-red-400 hover:underline cursor-pointer"
                    >
                      {posterUploading ? 'Uploading...' : 'Upload Image'}
                    </button>
                  </label>
                  <input
                    type="text"
                    value={posterUrl}
                    onChange={(e) => setPosterUrl(e.target.value)}
                    placeholder="https://.../poster.jpg"
                    className="w-full mt-2 px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white"
                  />
                  {posterUrl && (
                    <img
                      src={posterUrl}
                      alt="Poster Preview"
                      className="w-16 h-24 object-cover rounded-lg mt-2 border border-white/10"
                    />
                  )}
                </div>

                <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                  <label className="text-xs font-semibold text-gray-300 flex items-center justify-between">
                    <span>Backdrop Banner</span>
                    <input
                      ref={backdropInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleBackdropSelect}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => backdropInputRef.current?.click()}
                      className="text-xs text-red-400 hover:underline cursor-pointer"
                    >
                      {backdropUploading ? 'Uploading...' : 'Upload Image'}
                    </button>
                  </label>
                  <input
                    type="text"
                    value={backdropUrl}
                    onChange={(e) => setBackdropUrl(e.target.value)}
                    placeholder="https://.../backdrop.jpg"
                    className="w-full mt-2 px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white"
                  />
                  {backdropUrl && (
                    <img
                      src={backdropUrl}
                      alt="Backdrop Preview"
                      className="w-32 h-18 object-cover rounded-lg mt-2 border border-white/10"
                    />
                  )}
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-black/40 border border-white/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="accent-red-600 rounded"
                  />
                  <span className="text-xs font-semibold text-white">Publish Now</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-black/40 border border-white/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTrending}
                    onChange={(e) => setIsTrending(e.target.checked)}
                    className="accent-red-600 rounded"
                  />
                  <span className="text-xs font-semibold text-white">Trending</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-black/40 border border-white/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="accent-red-600 rounded"
                  />
                  <span className="text-xs font-semibold text-white">Hero Featured</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-black/40 border border-white/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isNewRelease}
                    onChange={(e) => setIsNewRelease(e.target.checked)}
                    className="accent-red-600 rounded"
                  />
                  <span className="text-xs font-semibold text-white">New Release</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold text-sm shadow-xl shadow-red-600/25 transition-all cursor-pointer"
                >
                  {selectedVideoFiles.length > 0
                    ? `Start Background Upload (${selectedVideoFiles.length} videos)`
                    : editingMovieId
                    ? 'Save Changes'
                    : 'Save & Publish Movie'}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition-all cursor-pointer"
                >
                  Reset Form
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: CLOUD STORAGE SETTINGS */}
      {activeTab === 'supabase' && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
          <div className="bg-[#12131a] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Storage & Backend Configuration</h3>
                <p className="text-xs text-gray-400">
                  Configure Cloud storage or utilize high-speed local chunked streaming.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveSupabaseConfig} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-300">Supabase Project URL</label>
                <input
                  type="text"
                  value={supabaseConfig.url}
                  onChange={(e) => setSupabaseState({ ...supabaseConfig, url: e.target.value })}
                  placeholder="https://xyz.supabase.co"
                  className="w-full mt-1 px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300">Supabase Anon Key</label>
                <input
                  type="password"
                  value={supabaseConfig.anonKey}
                  onChange={(e) => setSupabaseState({ ...supabaseConfig, anonKey: e.target.value })}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                  className="w-full mt-1 px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300">Storage Bucket Name</label>
                <input
                  type="text"
                  value={supabaseConfig.bucket}
                  onChange={(e) => setSupabaseState({ ...supabaseConfig, bucket: e.target.value })}
                  placeholder="movies"
                  className="w-full mt-1 px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              {supabaseSavedNotice && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Configuration saved successfully.</span>
                </div>
              )}

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg transition-all cursor-pointer"
              >
                Save Cloud Configuration
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
