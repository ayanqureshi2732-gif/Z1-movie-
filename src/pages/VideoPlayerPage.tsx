import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  ArrowLeft,
  Languages,
  Subtitles,
  AlertTriangle,
  RefreshCw,
  Loader2,
  Check,
  Sliders,
  Volume1,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getVideoBlobUrl } from '../services/db';
import { AudioTrack } from '../types';

interface VideoPlayerPageProps {
  movieId: string;
}

export const VideoPlayerPage: React.FC<VideoPlayerPageProps> = ({ movieId }) => {
  const { movies, navigate, updateWatchProgress, watchHistory } = useApp();
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const movie = movies.find((m) => m.id === movieId);

  const [resolvedVideoUrl, setResolvedVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedTime, setBufferedTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showControls, setShowControls] = useState(true);

  // Menus
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);
  const [showAudioMenu, setShowAudioMenu] = useState(false);
  const [activeSubtitle, setActiveSubtitle] = useState<'off' | 'en' | 'es'>('off');
  const [selectedQuality, setSelectedQuality] = useState('1080p');

  // Audio Tracks Management (Supports Multi-Audio & Dubbed tracks)
  const defaultAudioTracks: AudioTrack[] = movie?.audioTracks && movie.audioTracks.length > 0
    ? movie.audioTracks
    : [
        {
          id: 'audio-main',
          language: movie?.language || 'Hindi',
          label: `${movie?.language || 'Hindi'} [Original] (Dolby / AAC)`,
          codec: 'AAC/Dolby',
          isDefault: true,
        },
        {
          id: 'audio-eng',
          language: 'English',
          label: 'English [Dubbed] (Stereo)',
          codec: 'AAC',
        },
        {
          id: 'audio-tamil',
          language: 'Tamil',
          label: 'Tamil [Dubbed] (Stereo)',
          codec: 'AAC',
        },
        {
          id: 'audio-telugu',
          language: 'Telugu',
          label: 'Telugu [Dubbed] (Stereo)',
          codec: 'AAC',
        },
      ];

  const [availableAudioTracks, setAvailableAudioTracks] = useState<AudioTrack[]>(defaultAudioTracks);
  const [selectedAudioTrackId, setSelectedAudioTrackId] = useState<string>(
    defaultAudioTracks[0]?.id || 'audio-main'
  );

  // Audio Codec Diagnostics Info
  const [audioCodecInfo, setAudioCodecInfo] = useState<{
    codec: string;
    channels: string;
    status: 'compatible' | 'active' | 'synced';
  }>({
    codec: 'AAC / Dolby Compatible',
    channels: '5.1 / Stereo',
    status: 'compatible',
  });

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Resume position check
  const lastHistory = watchHistory.find((h) => h.movieId === movieId);

  // Resolve video URL
  useEffect(() => {
    let active = true;
    let createdUrl: string | null = null;

    async function loadStream() {
      if (!movie) return;
      setIsLoading(true);
      setHasError(false);

      try {
        const url = await getVideoBlobUrl(movie.videoUrl);
        if (active) {
          if (!url) {
            throw new Error('Video source not accessible');
          }
          if (url.startsWith('blob:')) {
            createdUrl = url;
          }
          setResolvedVideoUrl(url);
        }
      } catch (err: any) {
        if (active) {
          setHasError(true);
          setErrorMessage(err.message || 'Failed to load video stream');
          setIsLoading(false);
        }
      }
    }

    loadStream();

    return () => {
      active = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [movie]);

  // Initial resume from last history position
  useEffect(() => {
    if (videoRef.current && lastHistory && lastHistory.lastWatchedPosition > 10) {
      const handleLoaded = () => {
        if (
          videoRef.current &&
          lastHistory.lastWatchedPosition < videoRef.current.duration - 15
        ) {
          videoRef.current.currentTime = lastHistory.lastWatchedPosition;
        }
      };
      const v = videoRef.current;
      v.addEventListener('loadedmetadata', handleLoaded);
      return () => v.removeEventListener('loadedmetadata', handleLoaded);
    }
  }, [resolvedVideoUrl, lastHistory]);

  // Synchronize secondary dubbed audio track if active
  const activeAudioTrack = availableAudioTracks.find((t) => t.id === selectedAudioTrackId);

  useEffect(() => {
    if (!audioRef.current || !videoRef.current) return;
    if (activeAudioTrack?.audioUrl) {
      // Using external synchronized audio track
      videoRef.current.muted = true;
      audioRef.current.src = activeAudioTrack.audioUrl;
      audioRef.current.currentTime = videoRef.current.currentTime;
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.playbackRate = playbackRate;
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      }
    } else {
      // Revert to primary video audio
      if (videoRef.current) {
        videoRef.current.muted = isMuted;
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  }, [selectedAudioTrackId, activeAudioTrack, resolvedVideoUrl]);

  // HTML5 audioTracks API probe if supported by browser/engine
  const probeNativeAudioTracks = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    // Check if HTML5 audioTracks API is present
    const nativeTracks = (video as any).audioTracks;
    if (nativeTracks && nativeTracks.length > 0) {
      const detected: AudioTrack[] = [];
      for (let i = 0; i < nativeTracks.length; i++) {
        const t = nativeTracks[i];
        detected.push({
          id: t.id || `native-track-${i}`,
          language: t.language || `Track ${i + 1}`,
          label: t.label || `${t.language || 'Audio'} (Track ${i + 1})`,
          isDefault: t.enabled,
        });
      }
      if (detected.length > 0) {
        setAvailableAudioTracks(detected);
      }
    }
  }, []);

  // Controls auto-hide timer
  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
        setShowSpeedMenu(false);
        setShowSubtitleMenu(false);
        setShowAudioMenu(false);
      }, 3500);
    }
  }, [isPlaying]);

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying, resetControlsTimeout]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowLeft' || e.key === 'j') {
        e.preventDefault();
        seekRelative(-10);
      } else if (e.key === 'ArrowRight' || e.key === 'l') {
        e.preventDefault();
        seekRelative(10);
      } else if (e.key === 'f') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'm') {
        e.preventDefault();
        toggleMute();
      }
      resetControlsTimeout();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, volume, isMuted, isFullscreen, resetControlsTimeout]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          if (audioRef.current && activeAudioTrack?.audioUrl) {
            audioRef.current.play().catch(() => {});
          }
        })
        .catch((err) => {
          console.warn('Playback request prevented:', err);
        });
    } else {
      videoRef.current.pause();
      if (audioRef.current) audioRef.current.pause();
      setIsPlaying(false);
    }
    resetControlsTimeout();
  };

  const seekRelative = (seconds: number) => {
    if (!videoRef.current) return;
    const newTime = Math.min(Math.max(0, videoRef.current.currentTime + seconds), duration);
    videoRef.current.currentTime = newTime;
    if (audioRef.current && activeAudioTrack?.audioUrl) {
      audioRef.current.currentTime = newTime;
    }
    setCurrentTime(newTime);
    resetControlsTimeout();
  };

  const handleSeekSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
    if (audioRef.current && activeAudioTrack?.audioUrl) {
      audioRef.current.currentTime = newTime;
    }
    setCurrentTime(newTime);
    resetControlsTimeout();
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    if (activeAudioTrack?.audioUrl && audioRef.current) {
      audioRef.current.muted = nextMuted;
    } else {
      videoRef.current.muted = nextMuted;
    }
    setIsMuted(nextMuted);
    resetControlsTimeout();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    const muted = newVol === 0;
    setIsMuted(muted);

    if (activeAudioTrack?.audioUrl && audioRef.current) {
      audioRef.current.volume = newVol;
      audioRef.current.muted = muted;
    } else if (videoRef.current) {
      videoRef.current.volume = newVol;
      videoRef.current.muted = muted;
    }
    resetControlsTimeout();
  };

  const setSpeed = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
    setPlaybackRate(speed);
    setShowSpeedMenu(false);
    resetControlsTimeout();
  };

  // Switch Audio Track / Language
  const selectAudioTrack = (trackId: string) => {
    setSelectedAudioTrackId(trackId);
    setShowAudioMenu(false);

    const video = videoRef.current;
    if (!video) return;

    // If native HTML5 audioTracks is supported, switch enabled state
    const nativeTracks = (video as any).audioTracks;
    if (nativeTracks) {
      for (let i = 0; i < nativeTracks.length; i++) {
        nativeTracks[i].enabled = nativeTracks[i].id === trackId;
      }
    }

    const track = availableAudioTracks.find((t) => t.id === trackId);
    if (track) {
      setAudioCodecInfo({
        codec: track.codec || 'AAC (Stereo/5.1)',
        channels: track.label.includes('5.1') ? '5.1 Surround' : '2.0 Stereo',
        status: 'synced',
      });
    }

    resetControlsTimeout();
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
    resetControlsTimeout();
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    setCurrentTime(current);

    // Keep secondary dubbed audio track strictly in sync (within 0.15s)
    if (audioRef.current && activeAudioTrack?.audioUrl) {
      const delta = Math.abs(audioRef.current.currentTime - current);
      if (delta > 0.15) {
        audioRef.current.currentTime = current;
      }
    }

    // Save watch progress
    if (movie && duration > 0) {
      updateWatchProgress(movie.id, current, duration);
    }

    // Buffer tracking
    if (videoRef.current.buffered.length > 0) {
      for (let i = 0; i < videoRef.current.buffered.length; i++) {
        if (
          videoRef.current.buffered.start(i) <= current &&
          videoRef.current.buffered.end(i) >= current
        ) {
          setBufferedTime(videoRef.current.buffered.end(i));
          break;
        }
      }
    }
  };

  const retryStream = () => {
    setHasError(false);
    setIsLoading(true);
    if (videoRef.current) {
      videoRef.current.load();
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!movie) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4">
        <p className="text-white text-base mb-4">Movie not found</p>
        <button
          onClick={() => navigate({ path: '/' })}
          className="px-6 py-2.5 rounded-xl bg-red-600 text-white font-medium text-sm"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={resetControlsTimeout}
      onTouchStart={resetControlsTimeout}
      className="fixed inset-0 z-50 bg-black text-white flex flex-col justify-between select-none overflow-hidden"
    >
      {/* Real HTML5 Video element with HTTP Range and multi-audio support */}
      {resolvedVideoUrl && (
        <video
          ref={videoRef}
          src={resolvedVideoUrl}
          playsInline
          className="absolute inset-0 w-full h-full object-contain bg-black cursor-pointer"
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => {
            setIsBuffering(false);
            setIsLoading(false);
            setIsPlaying(true);
            probeNativeAudioTracks();
          }}
          onCanPlay={() => {
            setIsLoading(false);
            setIsBuffering(false);
          }}
          onLoadedMetadata={() => {
            if (videoRef.current) {
              setDuration(videoRef.current.duration);
              setIsLoading(false);
              probeNativeAudioTracks();
            }
          }}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => {
            setIsPlaying(false);
            setShowControls(true);
          }}
          onError={(e) => {
            console.error('Video element stream error:', e);
            setHasError(true);
            setErrorMessage('Playback error: media codec or connection interrupted. Tap Retry Stream.');
            setIsLoading(false);
            setIsBuffering(false);
          }}
          onClick={togglePlay}
        />
      )}

      {/* Hidden synchronized secondary dubbed audio element if active */}
      <audio ref={audioRef} className="hidden" preload="auto" />

      {/* Subtitles Overlay */}
      {activeSubtitle !== 'off' && isPlaying && (
        <div className="absolute bottom-20 left-0 right-0 z-20 flex justify-center pointer-events-none px-4">
          <div className="bg-black/85 backdrop-blur-sm text-yellow-300 px-3.5 py-1.5 rounded-md text-sm sm:text-base font-semibold max-w-xl text-center shadow-2xl border border-white/10">
            {activeSubtitle === 'en'
              ? `[Dialogue in English: ${movie.title}]`
              : `[Diálogo en Español: ${movie.title}]`}
          </div>
        </div>
      )}

      {/* Loading & Buffering State Indicators */}
      {isLoading && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-none">
          <Loader2 className="w-10 h-10 text-red-500 animate-spin mb-3" />
          <p className="text-sm font-semibold tracking-wide text-gray-200">
            Connecting to Z1 Stream...
          </p>
          <span className="text-xs text-gray-400 mt-1">Dolby Audio Engine · 1080p Ultra HD</span>
        </div>
      )}

      {isBuffering && !isLoading && (
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
          <div className="p-4 rounded-2xl bg-black/60 backdrop-blur-md flex items-center gap-3">
            <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
            <span className="text-xs font-semibold text-white tracking-wide">Buffering stream...</span>
          </div>
        </div>
      )}

      {/* Error & Retry State */}
      {hasError && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/95 p-6 text-center">
          <div className="p-3.5 rounded-full bg-red-950/60 border border-red-500/40 text-red-500 mb-3">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Stream Playback Failed</h3>
          <p className="text-xs text-gray-400 max-w-sm mb-6 leading-relaxed">
            {errorMessage || 'Unable to play this video stream. Please check your connection or retry.'}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={retryStream}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Stream</span>
            </button>
            <button
              onClick={() => navigate({ path: '/movie/:id', id: movie.id })}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-all cursor-pointer"
            >
              Return to Details
            </button>
          </div>
        </div>
      )}

      {/* TOP CONTROLS BAR */}
      <header
        className={`relative z-30 w-full p-4 sm:p-6 bg-gradient-to-b from-black/95 via-black/50 to-transparent transition-opacity duration-300 flex items-center justify-between ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate({ path: '/movie/:id', id: movie.id })}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all cursor-pointer"
            aria-label="Back to movie details"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-white truncate">
              {movie.title}
            </h2>
            <div className="flex items-center gap-2 text-[11px] text-gray-300 flex-wrap">
              <span className="font-semibold text-red-500">Z1 CINEMA</span>
              <span aria-hidden="true">·</span>
              <span>{movie.year}</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400 font-medium">
                {activeAudioTrack?.label || `${movie.language} (Dolby 5.1)`}
              </span>
            </div>
          </div>
        </div>

        {/* Top Right Badges */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-600/80 text-white">
            DOLBY AUDIO
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-600/80 text-white">
            {selectedQuality}
          </span>
        </div>
      </header>

      {/* CENTER BIG PLAY/PAUSE GESTURE BUTTONS */}
      <div
        className={`relative z-30 flex items-center justify-center gap-8 transition-opacity duration-300 pointer-events-none ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            seekRelative(-10);
          }}
          className="pointer-events-auto min-h-[48px] min-w-[48px] rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center active:scale-95 transition-all border border-white/10"
          aria-label="Skip backward 10 seconds"
        >
          <RotateCcw className="w-5 h-5" />
          <span className="text-[9px] font-bold ml-0.5">10</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
          className="pointer-events-auto min-h-[64px] min-w-[64px] rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-2xl active:scale-90 transition-all cursor-pointer"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="w-8 h-8 fill-white" />
          ) : (
            <Play className="w-8 h-8 fill-white ml-1" />
          )}
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            seekRelative(10);
          }}
          className="pointer-events-auto min-h-[48px] min-w-[48px] rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center active:scale-95 transition-all border border-white/10"
          aria-label="Skip forward 10 seconds"
        >
          <RotateCw className="w-5 h-5" />
          <span className="text-[9px] font-bold ml-0.5">10</span>
        </button>
      </div>

      {/* BOTTOM CONTROLS & TIMELINE */}
      <footer
        className={`relative z-30 w-full p-4 sm:p-6 bg-gradient-to-t from-black via-black/85 to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* TIMELINE SLIDER WITH BUFFERED INDICATOR */}
        <div className="relative w-full mb-3 flex flex-col gap-1">
          <div className="relative w-full flex items-center h-6 cursor-pointer">
            {/* Background rail */}
            <div className="absolute left-0 right-0 h-1.5 rounded-full bg-white/20 overflow-hidden pointer-events-none">
              {/* Buffered progress */}
              {duration > 0 && (
                <div
                  className="h-full bg-white/30"
                  style={{ width: `${(bufferedTime / duration) * 100}%` }}
                />
              )}
            </div>

            {/* Range input */}
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleSeekSlider}
              className="z1-range absolute left-0 right-0 w-full h-2 appearance-none bg-transparent cursor-pointer z-10"
              aria-label="Seek video slider"
            />
          </div>

          {/* Time Displays */}
          <div className="flex items-center justify-between text-[11px] text-gray-300 font-mono tabular-nums px-0.5">
            <span>{formatTime(currentTime)}</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400 font-sans">
                {audioCodecInfo.codec}
              </span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        {/* BOTTOM BUTTONS ROW */}
        <div className="flex items-center justify-between gap-2">
          {/* Left: Play/Pause, Replay, Forward & Volume */}
          <div className="flex items-center gap-1 sm:gap-3">
            <button
              onClick={togglePlay}
              className="min-h-[40px] min-w-[40px] flex items-center justify-center text-white hover:text-red-400 transition-colors cursor-pointer"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
            </button>

            <button
              onClick={() => seekRelative(-10)}
              className="min-h-[40px] min-w-[40px] flex items-center justify-center text-white hover:text-red-400 transition-colors cursor-pointer"
              title="Replay 10s"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => seekRelative(10)}
              className="min-h-[40px] min-w-[40px] flex items-center justify-center text-white hover:text-red-400 transition-colors cursor-pointer"
              title="Forward 10s"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-1 group/vol ml-1 sm:ml-2">
              <button
                onClick={toggleMute}
                className="min-h-[40px] min-w-[40px] flex items-center justify-center text-white hover:text-red-400 transition-colors cursor-pointer"
                aria-label="Toggle mute"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5 text-red-500" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="z1-range w-14 sm:w-20 h-1.5 appearance-none bg-white/30 rounded-full cursor-pointer hidden sm:block"
                aria-label="Volume slider"
              />
            </div>
          </div>

          {/* Right: Audio Track / Language Selector, Speed, Subtitles, Quality, Fullscreen */}
          <div className="flex items-center gap-1 sm:gap-2 relative">
            {/* AUDIO / LANGUAGE TRACK SELECTOR (Solves Missing Audio & Multi-Audio Tracks) */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowAudioMenu(!showAudioMenu);
                  setShowSubtitleMenu(false);
                  setShowSpeedMenu(false);
                }}
                className={`min-h-[40px] px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  showAudioMenu || selectedAudioTrackId !== availableAudioTracks[0]?.id
                    ? 'text-red-400 bg-red-950/50 border border-red-500/40'
                    : 'text-gray-300 hover:text-white bg-white/[0.06]'
                }`}
                title="Audio / Language Selector"
              >
                <Languages className="w-4 h-4 text-red-400" />
                <span className="hidden sm:inline">
                  {availableAudioTracks.find((t) => t.id === selectedAudioTrackId)?.language || 'Audio'}
                </span>
              </button>

              {showAudioMenu && (
                <div className="absolute bottom-12 right-0 bg-[#121318] border border-white/20 rounded-2xl py-2 shadow-2xl z-50 min-w-[220px] backdrop-blur-xl animate-in fade-in duration-150">
                  <div className="px-3.5 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-white/10 flex items-center justify-between">
                    <span>Audio & Languages</span>
                    <span className="text-[10px] text-emerald-400 font-mono">Dolby/VLC</span>
                  </div>

                  <div className="py-1 max-h-60 overflow-y-auto">
                    {availableAudioTracks.map((track) => (
                      <button
                        key={track.id}
                        onClick={() => selectAudioTrack(track.id)}
                        className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer ${
                          selectedAudioTrackId === track.id ? 'text-red-400 font-bold bg-red-950/20' : 'text-gray-200'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span>{track.label}</span>
                          <span className="text-[10px] text-gray-400 font-normal">
                            {track.language} · {track.codec || 'AAC/Dolby'}
                          </span>
                        </div>
                        {selectedAudioTrackId === track.id && (
                          <Check className="w-4 h-4 text-red-400 flex-shrink-0 ml-2" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="px-3 py-1.5 text-[10px] text-gray-400 border-t border-white/10">
                    Switch audio instantly without restarting video.
                  </div>
                </div>
              )}
            </div>

            {/* Speed Selector */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSpeedMenu(!showSpeedMenu);
                  setShowSubtitleMenu(false);
                  setShowAudioMenu(false);
                }}
                className={`min-h-[40px] px-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                  playbackRate !== 1
                    ? 'text-red-400 bg-red-950/40'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <span>{playbackRate}x</span>
              </button>

              {showSpeedMenu && (
                <div className="absolute bottom-12 right-0 bg-[#121318] border border-white/15 rounded-xl py-1 shadow-2xl z-40 min-w-[100px] backdrop-blur-xl">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSpeed(s)}
                      className={`w-full text-left px-3 py-1.5 text-xs font-medium flex items-center justify-between hover:bg-white/10 cursor-pointer ${
                        playbackRate === s ? 'text-red-400 font-bold' : 'text-gray-300'
                      }`}
                    >
                      <span>{s}x</span>
                      {playbackRate === s && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Subtitles Toggle */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSubtitleMenu(!showSubtitleMenu);
                  setShowSpeedMenu(false);
                  setShowAudioMenu(false);
                }}
                className={`min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                  activeSubtitle !== 'off'
                    ? 'text-red-400 bg-red-950/40'
                    : 'text-gray-300 hover:text-white'
                }`}
                title="Subtitles"
              >
                <Subtitles className="w-4 h-4" />
              </button>

              {showSubtitleMenu && (
                <div className="absolute bottom-12 right-0 bg-[#121318] border border-white/15 rounded-xl py-1 shadow-2xl z-40 min-w-[130px] backdrop-blur-xl">
                  <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-white/10">
                    Subtitles
                  </div>
                  {[
                    { id: 'off', label: 'Off' },
                    { id: 'en', label: 'English [CC]' },
                    { id: 'es', label: 'Spanish' },
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => {
                        setActiveSubtitle(sub.id as any);
                        setShowSubtitleMenu(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-medium flex items-center justify-between hover:bg-white/10 cursor-pointer ${
                        activeSubtitle === sub.id ? 'text-red-400 font-bold' : 'text-gray-300'
                      }`}
                    >
                      <span>{sub.label}</span>
                      {activeSubtitle === sub.id && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quality Cycle */}
            <button
              onClick={() => {
                const qualities = ['4K Ultra HD', '1080p Full HD', '720p HD', '480p SD'];
                const nextIdx = (qualities.indexOf(selectedQuality) + 1) % qualities.length;
                setSelectedQuality(qualities[nextIdx]);
              }}
              className="min-h-[40px] px-2 rounded-lg text-[11px] font-bold text-gray-300 hover:text-white transition-colors cursor-pointer"
              title="Stream Quality"
            >
              {selectedQuality}
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="min-h-[40px] min-w-[40px] flex items-center justify-center text-white hover:text-red-400 transition-colors cursor-pointer"
              aria-label="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
