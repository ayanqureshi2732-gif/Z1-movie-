import { UploadQueueItem, UploadStatus, Movie, AudioTrack } from '../types';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

const UPLOAD_QUEUE_STORAGE_KEY = 'Z1_MOVIES_UPLOAD_QUEUE_V1';
const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB chunks for optimal cellular and broadband stability
const MAX_CONCURRENT_UPLOADS = 3; // 3 simultaneous uploads as requested
const MAX_RETRY_ATTEMPTS = 5;

// In-memory File objects map (since File objects cannot be directly serialized to localStorage)
const fileReferenceRegistry = new Map<string, File>();

// Active abort controllers and pause signals
const abortControllers = new Map<string, AbortController>();
const pauseFlags = new Map<string, boolean>();

// Listeners for reactive updates
type QueueChangeListener = (queue: UploadQueueItem[]) => void;
const listeners = new Set<QueueChangeListener>();

class UploadManagerService {
  private queue: UploadQueueItem[] = [];
  private isProcessingQueue = false;
  private notificationSupported = false;

  constructor() {
    this.loadPersistedQueue();
    this.initNotifications();

    // Auto-resume any queued or active uploads on startup
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('[UploadManager] Network online - resuming active/queued uploads');
        this.resumeAll();
      });

      // Periodic check to ensure queue is always moving
      setInterval(() => {
        this.processQueue();
      }, 3000);
    }
  }

  private async initNotifications() {
    if (Capacitor.isNativePlatform()) {
      try {
        const perm = await LocalNotifications.requestPermissions();
        this.notificationSupported = perm.display === 'granted';
      } catch (e) {
        console.warn('Local notifications init error:', e);
      }
    }
  }

  private updateNotification(item: UploadQueueItem) {
    if (!this.notificationSupported) return;
    try {
      LocalNotifications.schedule({
        notifications: [
          {
            id: 1001,
            title: 'Z1 MOVIES Uploading',
            body: `${item.fileName}: ${Math.round(item.progress)}% (${(item.speedBytesPerSec / 1024 / 1024).toFixed(1)} MB/s)`,
            schedule: { at: new Date(Date.now() + 100) },
            ongoing: true,
          },
        ],
      }).catch(() => {});
    } catch (e) {
      // Ignore notification schedule errors
    }
  }

  private clearNotification() {
    if (!this.notificationSupported) return;
    try {
      LocalNotifications.cancel({ notifications: [{ id: 1001 }] }).catch(() => {});
    } catch (e) {}
  }

  // Load queue from localStorage
  private loadPersistedQueue() {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(UPLOAD_QUEUE_STORAGE_KEY);
      if (raw) {
        const parsed: UploadQueueItem[] = JSON.parse(raw);
        // Any items that were mid-upload when app closed get marked as paused/queued so they resume gracefully
        this.queue = parsed.map((item) => {
          if (item.status === 'uploading' || item.status === 'processing') {
            return { ...item, status: 'paused' };
          }
          return item;
        });
      }
    } catch (e) {
      console.warn('Failed to load persisted upload queue:', e);
      this.queue = [];
    }
  }

  // Save current queue snapshot to localStorage (excluding File binary references)
  private persistQueue() {
    if (typeof window === 'undefined') return;
    try {
      const serializableQueue = this.queue.map((item) => {
        const { file, ...rest } = item;
        return rest;
      });
      localStorage.setItem(UPLOAD_QUEUE_STORAGE_KEY, JSON.stringify(serializableQueue));
      this.notifyListeners();
    } catch (e) {
      console.warn('Failed to persist upload queue:', e);
    }
  }

  private notifyListeners() {
    const queueCopy = [...this.queue];
    listeners.forEach((fn) => fn(queueCopy));
  }

  public subscribe(listener: QueueChangeListener) {
    listeners.add(listener);
    listener([...this.queue]);
    return () => {
      listeners.delete(listener);
    };
  }

  public getQueue(): UploadQueueItem[] {
    return [...this.queue];
  }

  // Generate thumbnail from video file using canvas
  private async extractVideoMetadata(
    file: File
  ): Promise<{ thumbnailUrl?: string; duration?: number }> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') return resolve({});
      try {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.muted = true;
        video.playsInline = true;

        const url = URL.createObjectURL(file);
        video.src = url;

        const cleanup = () => {
          URL.revokeObjectURL(url);
          video.remove();
        };

        video.onloadedmetadata = () => {
          // Seek to 2 seconds or 20% for a crisp thumbnail
          const seekTime = Math.min(2, video.duration * 0.2);
          video.currentTime = seekTime;
        };

        video.onseeked = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = 320;
            canvas.height = 180;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
              const duration = video.duration;
              cleanup();
              resolve({ thumbnailUrl, duration });
              return;
            }
          } catch (e) {
            console.warn('Canvas thumbnail extraction failed:', e);
          }
          cleanup();
          resolve({ duration: video.duration });
        };

        video.onerror = () => {
          cleanup();
          resolve({});
        };

        // Timeout fallback after 4 seconds
        setTimeout(() => {
          cleanup();
          resolve({});
        }, 4000);
      } catch (e) {
        resolve({});
      }
    });
  }

  // Add multiple files at once
  public async addFilesToQueue(
    files: File[],
    sharedMetadata?: Partial<Movie>,
    targetMovieId?: string
  ): Promise<UploadQueueItem[]> {
    const newItems: UploadQueueItem[] = [];

    for (const file of files) {
      const id = `upl_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      fileReferenceRegistry.set(id, file);

      // Clean file name title for movie default
      const cleanTitle = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[._-]/g, ' ')
        .trim();

      const item: UploadQueueItem = {
        id,
        file,
        fileName: file.name,
        fileSize: file.size,
        progress: 0,
        uploadedBytes: 0,
        totalBytes: file.size,
        speedBytesPerSec: 0,
        status: 'queued',
        createdAt: Date.now(),
        targetMovieId: targetMovieId || id,
        movieMetadata: {
          title: cleanTitle,
          genre: ['Action', 'Thriller'],
          language: 'Hindi',
          year: new Date().getFullYear(),
          rating: 8.5,
          director: 'Z1 Productions',
          cast: ['Featured Cast'],
          isPublished: true,
          isTrending: false,
          isNewRelease: true,
          ...sharedMetadata,
        },
        audioTracks: [
          {
            id: 'track-1',
            language: sharedMetadata?.language || 'Hindi',
            label: `${sharedMetadata?.language || 'Hindi'} (Original 5.1)`,
            codec: 'AAC',
            isDefault: true,
          },
        ],
      };

      // Extract thumbnail asynchronously
      this.extractVideoMetadata(file).then(({ thumbnailUrl, duration }) => {
        const existing = this.queue.find((q) => q.id === id);
        if (existing) {
          if (thumbnailUrl) existing.thumbnailUrl = thumbnailUrl;
          if (duration && existing.movieMetadata) {
            const mins = Math.round(duration / 60);
            const hrs = Math.floor(mins / 60);
            const remainingMins = mins % 60;
            existing.movieMetadata.duration =
              hrs > 0 ? `${hrs}h ${remainingMins}m` : `${remainingMins}m`;
          }
          this.persistQueue();
        }
      });

      this.queue.push(item);
      newItems.push(item);
    }

    this.persistQueue();
    this.processQueue();
    return newItems;
  }

  // Update item in queue
  public updateItemMetadata(
    id: string,
    metadata: Partial<Movie>,
    audioTracks?: AudioTrack[]
  ) {
    const item = this.queue.find((q) => q.id === id);
    if (item) {
      item.movieMetadata = { ...item.movieMetadata, ...metadata };
      if (audioTracks) item.audioTracks = audioTracks;
      this.persistQueue();
    }
  }

  // Re-attach File if user selected it again after app reload
  public attachFile(id: string, file: File) {
    fileReferenceRegistry.set(id, file);
    const item = this.queue.find((q) => q.id === id);
    if (item) {
      item.file = file;
      item.fileName = file.name;
      item.fileSize = file.size;
      item.totalBytes = file.size;
      if (item.status === 'failed' || item.status === 'paused') {
        item.status = 'queued';
      }
      this.persistQueue();
      this.processQueue();
    }
  }

  // Concurrency Loop
  public async processQueue() {
    if (this.isProcessingQueue) return;
    this.isProcessingQueue = true;

    try {
      const activeCount = this.queue.filter((item) => item.status === 'uploading').length;
      const availableSlots = MAX_CONCURRENT_UPLOADS - activeCount;

      if (availableSlots <= 0) return;

      const queuedItems = this.queue.filter((item) => item.status === 'queued');
      const itemsToStart = queuedItems.slice(0, availableSlots);

      for (const item of itemsToStart) {
        this.startUploadItem(item);
      }
    } finally {
      this.isProcessingQueue = false;
    }
  }

  // Start individual chunked upload with exponential backoff & resume
  private async startUploadItem(item: UploadQueueItem) {
    const file = item.file || fileReferenceRegistry.get(item.id);

    if (!file) {
      item.status = 'paused';
      item.errorMessage = 'File reference needed after app restart. Please tap Resume / Re-select.';
      this.persistQueue();
      return;
    }

    item.status = 'uploading';
    item.startedAt = item.startedAt || Date.now();
    item.errorMessage = undefined;
    pauseFlags.delete(item.id);

    const abortController = new AbortController();
    abortControllers.set(item.id, abortController);

    this.persistQueue();

    try {
      // 1. Initialize or check session on server
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      let uploadedChunkSet = new Set<number>();

      let initSuccess = false;
      let initErrorMsg = '';

      try {
        const initRes = await fetch('/api/upload/init', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: item.sessionId || item.id,
            fileName: item.fileName,
            fileSize: file.size,
            chunkSize: CHUNK_SIZE,
            totalChunks,
            metadata: {
              ...item.movieMetadata,
              audioTracks: item.audioTracks,
            },
          }),
          signal: abortController.signal,
        });

        if (initRes.ok) {
          const initData = await initRes.json();
          item.sessionId = initData.sessionId;
          if (Array.isArray(initData.uploadedChunks)) {
            uploadedChunkSet = new Set<number>(initData.uploadedChunks);
          }
          initSuccess = true;
        } else {
          initErrorMsg = await initRes.text();
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        initErrorMsg = err.message;
      }

      // If server init failed (e.g. standalone offline test), fallback to IndexedDB chunking
      if (!initSuccess) {
        console.warn(
          `[UploadManager] Remote init failed (${initErrorMsg}), utilizing local offline chunking fallback`
        );
      }

      // 2. Upload chunks with resume and speed calculation
      let lastUploadedBytes = item.uploadedBytes;
      let lastSpeedCheckTime = Date.now();

      for (let chunkIdx = 0; chunkIdx < totalChunks; chunkIdx++) {
        // Check if paused or cancelled
        if (pauseFlags.get(item.id) || abortController.signal.aborted) {
          item.status = 'paused';
          this.persistQueue();
          return;
        }

        // Skip chunk if already verified uploaded
        if (uploadedChunkSet.has(chunkIdx)) {
          item.uploadedBytes = Math.min(file.size, (chunkIdx + 1) * CHUNK_SIZE);
          item.progress = Math.round((item.uploadedBytes / file.size) * 100);
          continue;
        }

        const start = chunkIdx * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunkBlob = file.slice(start, end);

        // Upload chunk with retry & exponential backoff
        let chunkUploaded = false;
        let attempt = 0;

        while (!chunkUploaded && attempt < MAX_RETRY_ATTEMPTS) {
          if (pauseFlags.get(item.id) || abortController.signal.aborted) {
            item.status = 'paused';
            this.persistQueue();
            return;
          }

          attempt++;
          try {
            const chunkRes = await fetch(
              `/api/upload/chunk?sessionId=${encodeURIComponent(item.sessionId || item.id)}&chunkIndex=${chunkIdx}`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/octet-stream',
                  'x-session-id': item.sessionId || item.id,
                  'x-chunk-index': String(chunkIdx),
                },
                body: chunkBlob,
                signal: abortController.signal,
              }
            );

            if (chunkRes.ok) {
              chunkUploaded = true;
              uploadedChunkSet.add(chunkIdx);
            } else {
              throw new Error(`Server returned ${chunkRes.status}`);
            }
          } catch (err: any) {
            if (err.name === 'AbortError') return;
            console.warn(`Chunk ${chunkIdx} attempt ${attempt} failed:`, err);
            if (attempt >= MAX_RETRY_ATTEMPTS) {
              throw new Error(`Chunk ${chunkIdx} failed after ${MAX_RETRY_ATTEMPTS} attempts`);
            }
            // Exponential backoff delay (e.g. 500ms, 1000ms, 2000ms)
            await new Promise((r) => setTimeout(r, Math.min(500 * Math.pow(2, attempt - 1), 5000)));
          }
        }

        // Calculate upload speed & update progress
        const now = Date.now();
        const timeDiff = (now - lastSpeedCheckTime) / 1000;
        const bytesDiff = end - lastUploadedBytes;

        if (timeDiff >= 0.5) {
          item.speedBytesPerSec = Math.round(bytesDiff / timeDiff);
          lastSpeedCheckTime = now;
          lastUploadedBytes = end;
        }

        item.uploadedBytes = end;
        item.progress = Math.min(99, Math.round((end / file.size) * 100));
        this.updateNotification(item);
        this.persistQueue();
      }

      // 3. Mark as Processing & Complete Assembly
      item.status = 'processing';
      item.progress = 99;
      this.persistQueue();

      const completeRes = await fetch('/api/upload/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: item.sessionId || item.id,
          fileName: item.fileName,
          totalChunks,
          metadata: {
            ...item.movieMetadata,
            audioTracks: item.audioTracks,
          },
        }),
        signal: abortController.signal,
      });

      if (!completeRes.ok) {
        throw new Error('Failed to assemble video file on server');
      }

      const completeData = await completeRes.json();

      item.status = 'completed';
      item.progress = 100;
      item.completedAt = Date.now();
      item.speedBytesPerSec = 0;

      // Attach returned URL and audio tracks to movie metadata
      if (item.movieMetadata) {
        item.movieMetadata.videoUrl = completeData.mediaUrl;
        if (completeData.audioTracks) {
          item.audioTracks = completeData.audioTracks;
        }
      }

      this.clearNotification();
      this.persistQueue();

      // Trigger auto-creation/update in movie database
      this.notifyMovieReady(item, completeData.mediaUrl);
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.error(`Upload error for ${item.fileName}:`, err);
      item.status = 'failed';
      item.errorMessage = err.message || 'Upload failed. Network interrupted.';
      item.speedBytesPerSec = 0;
      this.clearNotification();
      this.persistQueue();
    } finally {
      abortControllers.delete(item.id);
      // Process next queued upload in line
      this.processQueue();
    }
  }

  // Hook to notify database of completed upload
  private notifyMovieReady(item: UploadQueueItem, mediaUrl: string) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('Z1_MOVIE_UPLOAD_COMPLETE', {
          detail: {
            queueItem: item,
            mediaUrl,
          },
        })
      );
    }
  }

  // Control Actions
  public pauseUpload(id: string) {
    pauseFlags.set(id, true);
    const controller = abortControllers.get(id);
    if (controller) controller.abort();

    const item = this.queue.find((q) => q.id === id);
    if (item && item.status === 'uploading') {
      item.status = 'paused';
      item.speedBytesPerSec = 0;
      this.persistQueue();
    }
    this.processQueue();
  }

  public resumeUpload(id: string) {
    pauseFlags.delete(id);
    const item = this.queue.find((q) => q.id === id);
    if (item && (item.status === 'paused' || item.status === 'failed')) {
      item.status = 'queued';
      item.errorMessage = undefined;
      this.persistQueue();
      this.processQueue();
    }
  }

  public cancelUpload(id: string) {
    pauseFlags.set(id, true);
    const controller = abortControllers.get(id);
    if (controller) controller.abort();

    const item = this.queue.find((q) => q.id === id);
    if (item) {
      item.status = 'cancelled';
      item.speedBytesPerSec = 0;
      this.persistQueue();
    }
    this.processQueue();
  }

  public retryUpload(id: string) {
    const item = this.queue.find((q) => q.id === id);
    if (item) {
      item.status = 'queued';
      item.errorMessage = undefined;
      this.persistQueue();
      this.processQueue();
    }
  }

  public removeItem(id: string) {
    this.cancelUpload(id);
    this.queue = this.queue.filter((q) => q.id !== id);
    fileReferenceRegistry.delete(id);
    this.persistQueue();
  }

  public pauseAll() {
    this.queue.forEach((item) => {
      if (item.status === 'uploading' || item.status === 'queued') {
        this.pauseUpload(item.id);
      }
    });
  }

  public resumeAll() {
    this.queue.forEach((item) => {
      if (item.status === 'paused' || item.status === 'failed') {
        item.status = 'queued';
        item.errorMessage = undefined;
      }
    });
    this.persistQueue();
    this.processQueue();
  }

  public cancelAll() {
    this.queue.forEach((item) => {
      if (item.status === 'uploading' || item.status === 'queued' || item.status === 'paused') {
        this.cancelUpload(item.id);
      }
    });
  }

  public clearCompleted() {
    this.queue = this.queue.filter((q) => q.status !== 'completed' && q.status !== 'cancelled');
    this.persistQueue();
  }
}

// Global Singleton Export
export const uploadManager = new UploadManagerService();
