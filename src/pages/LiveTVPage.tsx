import React, { useState, useRef, useEffect } from 'react';
import { Tv, Play, Volume2, VolumeX, Maximize, Radio, Users, Clock, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LiveChannel } from '../types';

interface LiveTVPageProps {
  initialChannelId?: string;
}

export const LiveTVPage: React.FC<LiveTVPageProps> = ({ initialChannelId }) => {
  const { liveChannels } = useApp();
  const [selectedChannel, setSelectedChannel] = useState<LiveChannel>(() => {
    if (initialChannelId) {
      const found = liveChannels.find((c) => c.id === initialChannelId);
      if (found) return found;
    }
    return liveChannels[0];
  });

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {
        setIsMuted(true);
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play().catch(() => {});
        }
      });
    }
  }, [selectedChannel]);

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#08080b] text-white px-4 sm:px-6 py-6 pb-24 md:pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-brand tracking-tight flex items-center gap-2">
            <Tv className="w-6 h-6 text-red-500" />
            <span>Z1 Live Broadcast</span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-600 text-white animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              LIVE
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            24/7 curated non-stop television networks and event coverage.
          </p>
        </div>
      </div>

      {/* Main Grid: Player on top/left, Channel Guide on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live TV Video Player Container */}
        <div className="lg:col-span-2 space-y-4">
          <div
            ref={containerRef}
            className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl group"
          >
            <video
              ref={videoRef}
              src={selectedChannel.streamUrl}
              autoPlay
              playsInline
              loop
              className="w-full h-full object-contain"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />

            {/* Live TV Overlay Badges */}
            <div className="absolute top-3 left-3 flex items-center gap-2 z-20">
              <span className="bg-red-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded flex items-center gap-1 shadow-md">
                <Radio className="w-3 h-3 animate-pulse" />
                LIVE
              </span>
              <span className="bg-black/70 backdrop-blur-md text-white font-bold text-xs px-2.5 py-0.5 rounded border border-white/10">
                {selectedChannel.name}
              </span>
            </div>

            {/* Live Viewers Indicator */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-2.5 py-0.5 rounded text-xs text-gray-300 font-medium border border-white/10">
              <Users className="w-3 h-3 text-red-400" />
              <span>{selectedChannel.viewersCount.toLocaleString()} watching</span>
            </div>

            {/* Player Controls Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-center justify-between z-20 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  aria-label="Toggle Mute"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <span className="text-xs font-semibold text-gray-200 truncate">
                  Now Airing: {selectedChannel.currentProgram}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-emerald-400 font-mono font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  1080p 60fps
                </span>
                <button
                  onClick={toggleFullscreen}
                  className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  aria-label="Fullscreen"
                >
                  <Maximize className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Currently Selected Channel Info */}
          <div className="p-4 rounded-2xl bg-[#121218] border border-white/[0.08] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center text-2xl">
                {selectedChannel.logo}
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{selectedChannel.name}</span>
                  <span className="text-xs font-normal text-gray-400">({selectedChannel.category})</span>
                </h3>
                <p className="text-xs text-red-400 font-medium mt-0.5">
                  Current Program: {selectedChannel.currentProgram}
                </p>
              </div>
            </div>

            <div className="text-right hidden sm:block">
              <span className="text-xs text-gray-400 block">Up Next:</span>
              <span className="text-xs text-gray-200 font-medium">{selectedChannel.nextProgram}</span>
            </div>
          </div>
        </div>

        {/* Live TV Channels List / Electronic Program Guide */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
              Channel Directory
            </h3>
            <span className="text-xs text-gray-500 font-mono">{liveChannels.length} Channels</span>
          </div>

          <div className="space-y-2.5">
            {liveChannels.map((channel) => {
              const isSelected = channel.id === selectedChannel.id;
              return (
                <div
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-red-950/30 border-red-500 shadow-md shadow-red-950/20'
                      : 'bg-[#121218] border-white/[0.08] hover:border-white/20 hover:bg-[#161622]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl p-1.5 rounded-lg bg-black/50 border border-white/5 flex-shrink-0">
                      {channel.logo}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                          {channel.name}
                        </h4>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                        )}
                      </div>
                      <span className="text-[11px] text-gray-400 truncate block mt-0.5">
                        {channel.currentProgram}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end flex-shrink-0 text-right">
                    <span className="text-[10px] font-bold text-red-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                      LIVE
                    </span>
                    <span className="text-[10px] text-gray-400 mt-1">
                      {channel.viewersCount.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
