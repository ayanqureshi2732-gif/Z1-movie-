import React, { useState } from 'react';
import { Folder, FileText, Film, Music, Image as ImageIcon, Download, ArrowLeft, Check, Package } from 'lucide-react';
import { AndroidAppId } from '../types';

interface FilesAppProps {
  onOpenApp: (appId: AndroidAppId) => void;
}

type FileFolder = 'root' | 'downloads' | 'movies' | 'images' | 'documents';

export const FilesApp: React.FC<FilesAppProps> = ({ onOpenApp }) => {
  const [currentFolder, setCurrentFolder] = useState<FileFolder>('root');
  const [installedApk, setInstalledApk] = useState(false);

  const renderFolderContent = () => {
    switch (currentFolder) {
      case 'downloads':
        return (
          <div className="space-y-3">
            {/* APK File Item */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Z1-Movies-debug.apk</h4>
                  <p className="text-[10px] text-neutral-400">42.8 MB • Today</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setInstalledApk(true);
                  setTimeout(() => {
                    onOpenApp('z1movies');
                  }, 800);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  installedApk ? 'bg-emerald-600 text-white' : 'bg-red-600 hover:bg-red-500 text-white shadow-md'
                }`}
              >
                {installedApk ? 'Installed' : 'Install / Open'}
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
              <FileText className="w-8 h-8 text-neutral-400" />
              <div>
                <h4 className="text-xs font-medium text-white">release-notes.txt</h4>
                <p className="text-[10px] text-neutral-400">12 KB • Yesterday</p>
              </div>
            </div>
          </div>
        );

      case 'movies':
        return (
          <div className="space-y-3">
            <div
              onClick={() => onOpenApp('z1movies')}
              className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between cursor-pointer active:scale-98 transition-all"
            >
              <div className="flex items-center gap-3">
                <Film className="w-8 h-8 text-red-500" />
                <div>
                  <h4 className="text-xs font-bold text-white">Z1 Movie Library (Cached)</h4>
                  <p className="text-[10px] text-neutral-400">48 movies • 1080p / 4K</p>
                </div>
              </div>
              <span className="text-xs text-red-400 font-semibold">Open Z1 →</span>
            </div>
          </div>
        );

      case 'images':
        return (
          <div className="grid grid-cols-2 gap-2.5">
            <div
              onClick={() => onOpenApp('gallery')}
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex flex-col items-center justify-center text-center cursor-pointer active:scale-98 transition-all"
            >
              <ImageIcon className="w-8 h-8 text-purple-400 mb-2" />
              <h4 className="text-xs font-semibold text-white">Poster Stills</h4>
              <p className="text-[10px] text-neutral-400 mt-0.5">View in Gallery</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full bg-[#141720] text-white flex flex-col justify-between select-none overflow-hidden">
      {/* Header */}
      <header className="p-4 bg-[#1C202E] border-b border-white/10 flex items-center gap-3 flex-shrink-0">
        {currentFolder !== 'root' && (
          <button
            type="button"
            onClick={() => setCurrentFolder('root')}
            className="p-1.5 rounded-full hover:bg-white/10 active:scale-90"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
        )}
        <h2 className="text-base font-bold text-white capitalize">
          {currentFolder === 'root' ? 'Files & Storage' : currentFolder}
        </h2>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentFolder === 'root' ? (
          <>
            {/* Storage Summary Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-900/30 to-indigo-950/40 border border-blue-500/20 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white">Internal Storage</span>
                <span className="text-blue-300 font-mono">48.2 GB / 128 GB</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="w-[38%] h-full bg-blue-500" />
              </div>
            </div>

            {/* Folder Categories Grid */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCurrentFolder('downloads')}
                className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 flex flex-col items-center justify-center text-center cursor-pointer active:scale-98 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2">
                  <Download className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-semibold text-white">Downloads</h4>
                <p className="text-[10px] text-emerald-400 mt-0.5">Z1-Movies-debug.apk</p>
              </button>

              <button
                type="button"
                onClick={() => setCurrentFolder('movies')}
                className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 flex flex-col items-center justify-center text-center cursor-pointer active:scale-98 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center mb-2">
                  <Film className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-semibold text-white">Movies</h4>
                <p className="text-[10px] text-neutral-400 mt-0.5">Z1 Cache</p>
              </button>

              <button
                type="button"
                onClick={() => setCurrentFolder('images')}
                className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 flex flex-col items-center justify-center text-center cursor-pointer active:scale-98 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-2">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-semibold text-white">Images</h4>
                <p className="text-[10px] text-neutral-400 mt-0.5">Cinema Stills</p>
              </button>

              <button
                type="button"
                onClick={() => setCurrentFolder('downloads')}
                className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 flex flex-col items-center justify-center text-center cursor-pointer active:scale-98 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2">
                  <Folder className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-semibold text-white">Documents</h4>
                <p className="text-[10px] text-neutral-400 mt-0.5">System files</p>
              </button>
            </div>
          </>
        ) : (
          renderFolderContent()
        )}
      </div>
    </div>
  );
};
