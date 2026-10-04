import React, { useState } from 'react';
import { User, Crown, ShieldAlert, History, Bookmark, Sparkles, Check, Settings, Sliders } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ProfilePage: React.FC = () => {
  const { profile, setProfile, watchHistory, myList, navigate } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [streamQuality, setStreamQuality] = useState('1080p Ultra HD');
  const [audioTrack, setAudioTrack] = useState('English [Original]');
  const [autoSubtitles, setAutoSubtitles] = useState(true);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile({ ...profile, name });
    setIsEditing(false);
  };

  const sampleAvatars = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
  ];

  return (
    <div className="w-full min-h-screen bg-[#08080b] text-white px-4 sm:px-6 py-6 pb-24 md:pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-brand tracking-tight flex items-center gap-2">
          <User className="w-6 h-6 text-red-500" />
          <span>Subscriber Profile</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Manage your account credentials, playback quality and device settings.
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#121218] border border-white/[0.08] shadow-xl mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Avatar with VIP border */}
          <div className="relative">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-red-500/80 shadow-lg"
              referrerPolicy="no-referrer"
            />
            {profile.isVip && (
              <span className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-red-600 text-white shadow-md">
                <Crown className="w-4 h-4 fill-white" />
              </span>
            )}
          </div>

          {/* Details & Quick Stats */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center justify-center sm:justify-start gap-2">
                  <span>{profile.name}</span>
                  {profile.isVip && (
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-red-600/90 text-white">
                      VIP PASS
                    </span>
                  )}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">{profile.email}</p>
              </div>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors cursor-pointer self-center sm:self-start"
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/5">
              <div
                onClick={() => navigate({ path: '/history' })}
                className="p-2 rounded-xl bg-black/40 text-center cursor-pointer hover:bg-black/60 transition-colors"
              >
                <span className="text-lg font-bold text-white block">{watchHistory.length}</span>
                <span className="text-[10px] text-gray-400">Watched</span>
              </div>
              <div
                onClick={() => navigate({ path: '/my-list' })}
                className="p-2 rounded-xl bg-black/40 text-center cursor-pointer hover:bg-black/60 transition-colors"
              >
                <span className="text-lg font-bold text-white block">{myList.length}</span>
                <span className="text-[10px] text-gray-400">In My List</span>
              </div>
              <div className="p-2 rounded-xl bg-black/40 text-center">
                <span className="text-lg font-bold text-emerald-400 block">Active</span>
                <span className="text-[10px] text-gray-400">Subscription</span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        {isEditing && (
          <form onSubmit={handleSaveProfile} className="mt-6 pt-5 border-t border-white/10 space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-white/15 text-sm text-white focus:outline-none focus:border-red-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-2">
                Choose Avatar
              </label>
              <div className="flex items-center gap-3">
                {sampleAvatars.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setProfile({ ...profile, avatar: av })}
                    className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-transform cursor-pointer ${
                      profile.avatar === av ? 'border-red-500 scale-110' : 'border-transparent opacity-60'
                    }`}
                  >
                    <img src={av} alt="Avatar" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              Save Changes
            </button>
          </form>
        )}
      </div>

      {/* Streaming Preferences */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#121218] border border-white/[0.08] shadow-xl space-y-5 mb-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Settings className="w-4 h-4 text-red-500" />
          <span>Playback & Streaming Preferences</span>
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-white">Default Video Quality</h4>
              <p className="text-xs text-gray-400">Higher resolution consumes more cellular data.</p>
            </div>
            <select
              value={streamQuality}
              onChange={(e) => setStreamQuality(e.target.value)}
              className="bg-[#181822] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
            >
              <option value="Auto (Adaptive)">Auto (Adaptive)</option>
              <option value="1080p Ultra HD">1080p Ultra HD</option>
              <option value="720p High Def">720p High Def</option>
              <option value="Data Saver 480p">Data Saver 480p</option>
            </select>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <div>
              <h4 className="text-sm font-semibold text-white">Default Audio Track</h4>
              <p className="text-xs text-gray-400">Preferred soundtrack when opening movies.</p>
            </div>
            <select
              value={audioTrack}
              onChange={(e) => setAudioTrack(e.target.value)}
              className="bg-[#181822] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
            >
              <option value="English [Original]">English [Original]</option>
              <option value="Hindi [Dubbed]">Hindi [Dubbed]</option>
              <option value="Japanese [Original]">Japanese [Original]</option>
              <option value="Spanish [Dubbed]">Spanish [Dubbed]</option>
            </select>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <div>
              <h4 className="text-sm font-semibold text-white">Automatic Subtitles (CC)</h4>
              <p className="text-xs text-gray-400">Always display subtitles on start.</p>
            </div>
            <button
              onClick={() => setAutoSubtitles(!autoSubtitles)}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                autoSubtitles ? 'bg-red-600' : 'bg-neutral-700'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  autoSubtitles ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Admin Panel Entry Link */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/40 to-neutral-900 border border-red-500/30 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>Z1 Studio Admin Panel</span>
          </h4>
          <p className="text-xs text-gray-400 mt-0.5">
            Add movies, upload permanent video files from your device, and manage catalog.
          </p>
        </div>
        <button
          onClick={() => navigate({ path: '/admin' })}
          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-colors cursor-pointer whitespace-nowrap"
        >
          Open Studio
        </button>
      </div>
    </div>
  );
};
