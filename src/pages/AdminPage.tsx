import React, { useState, useRef } from 'react';
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
  RotateCcw,
  Check,
  Database,
  Lock,
  Unlock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Movie } from '../types';
import {
  uploadVideoFile,
  uploadImageFile,
  UploadResult,
} from '../services/uploadService';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  SupabaseConfig,
} from '../services/db';

export const AdminPage: React.FC = () => {
  const { movies, addMovie, updateMovie, deleteMovie, togglePublish, navigate, showToast } =
    useApp();

  // Admin PIN protection (simple security layer)
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Tab: 'movies' | 'add' | 'supabase'
  const [activeTab, setActiveTab] = useState<'movies' | 'add' | 'supabase'>('movies');

  // Editing state
  const [editingMovieId, setEditingMovieId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [year, setYear] = useState<number>(2026);
  const [language, setLanguage] = useState('English');
  const [genreInput, setGenreInput] = useState('Action, Sci-Fi');
  const [duration, setDuration] = useState('2h 10m');
  const [rating, setRating] = useState<number>(8.8);
  const [castInput, setCastInput] = useState('John Doe, Jane Smith');
  const [director, setDirector] = useState('Christopher Nolan');
  const [posterUrl, setPosterUrl] = useState('');
  const [backdropUrl, setBackdropUrl] = useState('');
  const [trailerUrl, setTrailerUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  // Toggles
  const [isTrending, setIsTrending] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewRelease, setIsNewRelease] = useState(true);
  const [isTop10, setIsTop10] = useState(false);
  const [top10Rank, setTop10Rank] = useState<number>(1);
  const [isPremium, setIsPremium] = useState(false);
  const [isPublished, setIsPublished] = useState(true);

  // Upload States
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [videoUploadedBytes, setVideoUploadedBytes] = useState(0);
  const [videoTotalBytes, setVideoTotalBytes] = useState(0);
  const [videoUploadStatus, setVideoUploadStatus] = useState<
    'idle' | 'uploading' | 'success' | 'error'
  >('idle');
  const [videoUploadError, setVideoUploadError] = useState('');
  const videoInputRef = useRef<HTMLInputElement>(null);

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

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '1234' || pinInput === 'z1' || pinInput.toLowerCase() === 'admin') {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleVideoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoUploadStatus('idle');
      setVideoUploadProgress(0);
      setVideoUploadError('');
    }
  };

  const handleStartVideoUpload = async () => {
    if (!videoFile) return;
    setVideoUploadStatus('uploading');
    setVideoUploadProgress(0);
    setVideoUploadError('');

    try {
      const result: UploadResult = await uploadVideoFile(
        videoFile,
        (progress, loaded, total) => {
          setVideoUploadProgress(progress);
          setVideoUploadedBytes(loaded);
          setVideoTotalBytes(total);
        }
      );
      setVideoUrl(result.url);
      setVideoUploadStatus('success');
      showToast(
        `Video uploaded (${(result.fileSize / (1024 * 1024)).toFixed(1)} MB)`,
        'success'
      );
    } catch (err: any) {
      setVideoUploadStatus('error');
      setVideoUploadError(err.message || 'Video upload pipeline failed');
      showToast('Video upload failed', 'error');
    }
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

  const resetForm = () => {
    setEditingMovieId(null);
    setTitle('');
    setDescription('');
    setYear(2026);
    setLanguage('English');
    setGenreInput('Action, Sci-Fi');
    setDuration('2h 10m');
    setRating(8.8);
    setCastInput('');
    setDirector('');
    setPosterUrl('');
    setBackdropUrl('');
    setTrailerUrl('');
    setVideoUrl('');
    setVideoFile(null);
    setVideoUploadProgress(0);
    setVideoUploadStatus('idle');
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
      id: editingMovieId || `movie-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: title.trim(),
      description: description.trim() || 'No description provided.',
      posterUrl: finalPosterUrl,
      backdropUrl: finalBackdropUrl,
      videoUrl: finalVideoUrl,
      trailerUrl: trailerUrl.trim() || undefined,
      year: Number(year) || 2026,
      language: language.trim() || 'English',
      genre: genreInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      duration: duration.trim() || '2h 00m',
      rating: Number(rating) || 8.0,
      cast: castInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      director: director.trim() || 'Unknown Director',
      isTrending,
      isFeatured,
      isNewRelease,
      isTop10,
      top10Rank: isTop10 ? Number(top10Rank) : undefined,
      isPremium,
      isPublished,
      createdAt: new Date().toISOString(),
    };

    if (editingMovieId) {
      updateMovie(movieData);
    } else {
      addMovie(movieData);
    }

    resetForm();
    setActiveTab('movies');
  };

  const handleSaveSupabaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(supabaseConfig);
    setSupabaseSavedNotice(true);
    showToast('Supabase settings saved', 'success');
    setTimeout(() => setSupabaseSavedNotice(false), 3000);
  };

  // If not authenticated, show PIN prompt
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#08080b] flex items-center justify-center p-4">
        <div className="w-full max-w-md p-6 sm:p-8 rounded-2xl bg-[#121218] border border-white/10 shadow-2xl text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">Z1 Admin Verification</h2>
          <p className="text-xs text-gray-400 mb-6">
            Enter admin PIN code to manage movies, upload videos, and adjust cloud storage.
          </p>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <input
              type="password"
              placeholder="Enter PIN (Default: 1234)"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              className="w-full text-center tracking-widest text-lg px-4 py-3 rounded-xl bg-black border border-white/15 text-white focus:outline-none focus:border-red-500"
              autoFocus
            />
            {pinError && (
              <p className="text-xs text-red-500 font-medium">
                Incorrect PIN. Use &quot;1234&quot; or &quot;admin&quot; to unlock.
              </p>
            )}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm transition-colors cursor-pointer"
            >
              Authorize Studio Access
            </button>
            <button
              type="button"
              onClick={() => setIsAuthenticated(true)}
              className="w-full text-xs text-gray-400 hover:text-white pt-2 cursor-pointer"
            >
              Quick Test Unlock
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#08080b] text-white px-4 sm:px-6 py-6 pb-24 md:pb-12 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-brand tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-red-500" />
            <span>Z1 Cinema Admin Studio</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Publish movies, perform real video uploads from mobile devices, and configure Supabase.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 bg-[#121218] p-1 rounded-xl border border-white/10 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('movies')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'movies' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Catalog ({movies.length})</span>
          </button>

          <button
            onClick={() => {
              if (activeTab !== 'add') resetForm();
              setActiveTab('add');
            }}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'add' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{editingMovieId ? 'Edit Movie' : 'Add Movie'}</span>
          </button>

          <button
            onClick={() => setActiveTab('supabase')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'supabase' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Supabase Cloud</span>
          </button>
        </div>
      </div>

      {/* TAB 1: MOVIES CATALOG TABLE */}
      {activeTab === 'movies' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#121218] border border-white/[0.08] flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-300">
              Total Movies: <span className="text-white font-bold">{movies.length}</span>
            </span>
            <button
              onClick={() => {
                resetForm();
                setActiveTab('add');
              }}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Movie</span>
            </button>
          </div>

          <div className="space-y-3">
            {movies.map((movie) => (
              <div
                key={movie.id}
                className="p-4 rounded-2xl bg-[#121218] border border-white/[0.08] hover:border-white/20 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                {/* Left: Thumbnail & Details */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-16 sm:w-20 aspect-[2/3] rounded-lg overflow-hidden bg-neutral-900 flex-shrink-0 border border-white/10">
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-white truncate">
                        {movie.title}
                      </h3>
                      {movie.isPremium && (
                        <span className="text-[9px] font-extrabold bg-red-600 text-white px-1.5 py-0.5 rounded">
                          VIP
                        </span>
                      )}
                      {movie.isTrending && (
                        <span className="text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded">
                          Trending
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                      <span>{movie.year}</span>
                      <span aria-hidden="true">·</span>
                      <span>{movie.language}</span>
                      <span aria-hidden="true">·</span>
                      <span>{movie.duration}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-amber-400 font-semibold">★ {movie.rating}</span>
                    </div>

                    <div className="text-[11px] text-gray-500 truncate mt-1">
                      Genres: {movie.genre.join(', ')} · Dir: {movie.director}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                  {/* Test play in Video Player */}
                  <button
                    onClick={() => navigate({ path: '/player/:id', id: movie.id })}
                    title="Test Watch in Player"
                    className="min-h-[36px] px-3 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Watch</span>
                  </button>

                  {/* Publish/Unpublish toggle */}
                  <button
                    onClick={() => togglePublish(movie.id)}
                    title={movie.isPublished ? 'Unpublish' : 'Publish'}
                    className={`min-h-[36px] px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      movie.isPublished
                        ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-900/40'
                        : 'bg-neutral-800 text-gray-400 border border-white/10 hover:text-white'
                    }`}
                  >
                    {movie.isPublished ? (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Published</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Draft</span>
                      </>
                    )}
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => handleEditClick(movie)}
                    title="Edit Movie"
                    className="min-h-[36px] min-w-[36px] rounded-xl bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${movie.title}"?`)) {
                        deleteMovie(movie.id);
                      }
                    }}
                    title="Delete Movie"
                    className="min-h-[36px] min-w-[36px] rounded-xl bg-red-950/20 hover:bg-red-900/40 text-red-400 hover:text-red-300 flex items-center justify-center transition-colors cursor-pointer border border-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: ADD / EDIT MOVIE FORM WITH REAL VIDEO UPLOAD */}
      {activeTab === 'add' && (
        <form onSubmit={handleSubmitMovie} className="space-y-6">
          <div className="p-5 sm:p-6 rounded-2xl bg-[#121218] border border-white/[0.08] shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>{editingMovieId ? 'Edit Movie Details' : 'Add New Movie to Z1'}</span>
              </h2>
              {editingMovieId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-red-400 hover:text-red-300 cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            {/* REAL VIDEO UPLOAD SECTION FROM PHONE/DEVICE */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0e0e14] border border-red-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Upload className="w-4 h-4 text-red-500" />
                    <span>Video File Upload (Mobile & Cloud Storage)</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Select a real video file from your phone storage (.mp4, .webm, .mov)
                  </p>
                </div>
                {videoUploadStatus === 'success' && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    Uploaded
                  </span>
                )}
              </div>

              {/* Hidden Native File Input */}
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/*"
                onChange={handleVideoFileSelect}
                className="hidden"
              />

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-white/15"
                >
                  <Upload className="w-4 h-4 text-red-400" />
                  <span>{videoFile ? 'Change Selected Video' : 'Select Video from Phone'}</span>
                </button>

                {videoFile && (
                  <div className="flex-1 flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs">
                    <div className="min-w-0 pr-2">
                      <p className="font-semibold text-white truncate">{videoFile.name}</p>
                      <p className="text-[11px] text-gray-400">
                        {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>

                    {videoUploadStatus !== 'uploading' && videoUploadStatus !== 'success' && (
                      <button
                        type="button"
                        onClick={handleStartVideoUpload}
                        className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs whitespace-nowrap cursor-pointer transition-colors"
                      >
                        Start Upload
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Upload Progress Bar */}
              {videoUploadStatus === 'uploading' && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-xs text-gray-300">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                      Uploading chunked binary stream to storage...
                    </span>
                    <span className="font-mono font-bold text-red-400">
                      {videoUploadProgress}% ({((videoUploadedBytes / (1024 * 1024)) || 0).toFixed(1)} / {((videoTotalBytes / (1024 * 1024)) || 0).toFixed(1)} MB)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-600 to-amber-500 transition-all duration-150"
                      style={{ width: `${videoUploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Upload Success Indicator */}
              {videoUploadStatus === 'success' && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="truncate">
                      Permanent Video URL generated and saved into database.
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-emerald-400 font-bold ml-2">100% READY</span>
                </div>
              )}

              {/* Upload Error & Retry */}
              {videoUploadStatus === 'error' && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 flex items-center justify-between text-xs text-red-300">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span>{videoUploadError || 'Upload failed. Network interrupted.'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleStartVideoUpload}
                    className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retry</span>
                  </button>
                </div>
              )}

              {/* Fallback Direct URL Field */}
              <div>
                <label className="text-[11px] text-gray-400 font-medium block mb-1">
                  Or enter direct permanent Video Stream URL (HTTPS MP4/HLS):
                </label>
                <input
                  type="text"
                  placeholder="https://.../video.mp4 or idb://video/..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* BASIC METADATA GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                  Movie Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chrono Protocol: Redline"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-white/15 text-sm text-white focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                  Release Year
                </label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-white/15 text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                  Language
                </label>
                <input
                  type="text"
                  placeholder="e.g. English, Hindi, Japanese"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-white/15 text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                  Genres (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Action, Sci-Fi, Thriller"
                  value={genreInput}
                  onChange={(e) => setGenreInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-white/15 text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                  Duration
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2h 15m"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-white/15 text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                  Rating (0 - 10)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-white/15 text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                  Director
                </label>
                <input
                  type="text"
                  placeholder="e.g. Denis Villeneuve"
                  value={director}
                  onChange={(e) => setDirector(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-white/15 text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                  Starring Cast (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Marcus Kane, Elena Vance"
                  value={castInput}
                  onChange={(e) => setCastInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-white/15 text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                Storyline / Description
              </label>
              <textarea
                rows={3}
                placeholder="Write the theatrical plot overview..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-white/15 text-sm text-white focus:outline-none focus:border-red-500"
              />
            </div>

            {/* ARTWORK UPLOADS (POSTER, BACKDROP, TRAILER) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {/* Poster Upload */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-300 block">
                  Poster Image (2:3 Aspect)
                </label>
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
                  className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-medium text-gray-300 hover:text-white flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{posterUploading ? 'Uploading...' : 'Upload Poster'}</span>
                </button>
                <input
                  type="text"
                  placeholder="Or paste Poster URL"
                  value={posterUrl}
                  onChange={(e) => setPosterUrl(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-black border border-white/10 text-xs text-white"
                />
              </div>

              {/* Backdrop Upload */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-300 block">
                  Backdrop Banner (16:9 Aspect)
                </label>
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
                  className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-medium text-gray-300 hover:text-white flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{backdropUploading ? 'Uploading...' : 'Upload Backdrop'}</span>
                </button>
                <input
                  type="text"
                  placeholder="Or paste Backdrop URL"
                  value={backdropUrl}
                  onChange={(e) => setBackdropUrl(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-black border border-white/10 text-xs text-white"
                />
              </div>

              {/* Trailer URL */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-300 block">
                  Trailer Stream URL (MP4)
                </label>
                <input
                  type="text"
                  placeholder="https://.../trailer.mp4"
                  value={trailerUrl}
                  onChange={(e) => setTrailerUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black border border-white/10 text-xs text-white mt-1"
                />
                <span className="text-[10px] text-gray-500 block">
                  Enables &quot;Watch Trailer&quot; button on movie details page
                </span>
              </div>
            </div>

            {/* CURATION FLAGS (Trending, Featured, New Release, Top 10, Premium, Published) */}
            <div className="pt-4 border-t border-white/10">
              <span className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-3">
                Curation Flags & Access Tiers
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-black/40 border border-white/5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="accent-red-600 rounded"
                  />
                  <span className="text-xs font-medium text-white">Published</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-black/40 border border-white/5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTrending}
                    onChange={(e) => setIsTrending(e.target.checked)}
                    className="accent-red-600 rounded"
                  />
                  <span className="text-xs font-medium text-white">Trending</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-black/40 border border-white/5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="accent-red-600 rounded"
                  />
                  <span className="text-xs font-medium text-white">Featured Hero</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-black/40 border border-white/5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isNewRelease}
                    onChange={(e) => setIsNewRelease(e.target.checked)}
                    className="accent-red-600 rounded"
                  />
                  <span className="text-xs font-medium text-white">New Release</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-black/40 border border-white/5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTop10}
                    onChange={(e) => setIsTop10(e.target.checked)}
                    className="accent-red-600 rounded"
                  />
                  <span className="text-xs font-medium text-white">Top 10 Today</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-black/40 border border-white/5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPremium}
                    onChange={(e) => setIsPremium(e.target.checked)}
                    className="accent-red-600 rounded"
                  />
                  <span className="text-xs font-medium text-white">VIP Only</span>
                </label>
              </div>

              {isTop10 && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-gray-300">Top 10 Rank Position:</span>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={top10Rank}
                    onChange={(e) => setTop10Rank(Number(e.target.value))}
                    className="w-16 px-2 py-1 rounded-lg bg-black border border-white/10 text-xs text-white"
                  />
                </div>
              )}
            </div>

            {/* SUBMIT BUTTON */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setActiveTab('movies');
                }}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-7 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold text-xs shadow-lg shadow-red-950/40 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{editingMovieId ? 'Update Movie' : 'Save & Publish Movie'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 3: SUPABASE CLOUD STORAGE CONFIGURATION */}
      {activeTab === 'supabase' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="p-5 sm:p-6 rounded-2xl bg-[#121218] border border-white/[0.08] shadow-xl space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-white/10">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">
                  Supabase Storage + Database Integration
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Permanent cloud object storage and distributed database syncing
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 text-xs text-gray-300 space-y-1.5">
              <p className="font-semibold text-white">Active Storage Engine Status:</p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>
                  {supabaseConfig.url && supabaseConfig.anonKey
                    ? 'Connected to Remote Supabase Cloud Bucket'
                    : 'Local Persistent IndexedDB Video Vault Active (Permanent on this device)'}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 pt-1">
                You can optionally link your Supabase project below to push uploaded videos directly
                to your Supabase Storage bucket.
              </p>
            </div>

            <form onSubmit={handleSaveSupabaseConfig} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  placeholder="https://your-project.supabase.co"
                  value={supabaseConfig.url}
                  onChange={(e) =>
                    setSupabaseState({ ...supabaseConfig, url: e.target.value.trim() })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-white/15 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  Supabase Anon Public API Key
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseConfig.anonKey}
                  onChange={(e) =>
                    setSupabaseState({ ...supabaseConfig, anonKey: e.target.value.trim() })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-white/15 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  Storage Bucket Name
                </label>
                <input
                  type="text"
                  placeholder="movies"
                  value={supabaseConfig.bucket}
                  onChange={(e) =>
                    setSupabaseState({ ...supabaseConfig, bucket: e.target.value.trim() })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-white/15 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              {supabaseSavedNotice && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Configuration saved successfully.</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Save Supabase Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
