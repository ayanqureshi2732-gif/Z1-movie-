import { useState, useEffect } from 'react';
import { uploadManager } from '../services/uploadManager';
import { UploadQueueItem, Movie, AudioTrack } from '../types';

export function useUploadManager() {
  const [queue, setQueue] = useState<UploadQueueItem[]>(() => uploadManager.getQueue());

  useEffect(() => {
    const unsubscribe = uploadManager.subscribe((updatedQueue) => {
      setQueue(updatedQueue);
    });
    return unsubscribe;
  }, []);

  const activeUploads = queue.filter((item) => item.status === 'uploading');
  const queuedUploads = queue.filter((item) => item.status === 'queued');
  const completedUploads = queue.filter((item) => item.status === 'completed');
  const failedUploads = queue.filter((item) => item.status === 'failed');
  const pausedUploads = queue.filter((item) => item.status === 'paused');

  const overallProgress =
    queue.length === 0
      ? 0
      : Math.round(
          queue.reduce((acc, curr) => acc + curr.progress, 0) / queue.length
        );

  const totalSpeedBytesPerSec = activeUploads.reduce(
    (acc, curr) => acc + curr.speedBytesPerSec,
    0
  );

  return {
    queue,
    activeUploads,
    queuedUploads,
    completedUploads,
    failedUploads,
    pausedUploads,
    overallProgress,
    totalSpeedBytesPerSec,
    addFilesToQueue: (files: File[], metadata?: Partial<Movie>, targetMovieId?: string) =>
      uploadManager.addFilesToQueue(files, metadata, targetMovieId),
    attachFile: (id: string, file: File) => uploadManager.attachFile(id, file),
    updateItemMetadata: (id: string, metadata: Partial<Movie>, audioTracks?: AudioTrack[]) =>
      uploadManager.updateItemMetadata(id, metadata, audioTracks),
    pauseUpload: (id: string) => uploadManager.pauseUpload(id),
    resumeUpload: (id: string) => uploadManager.resumeUpload(id),
    cancelUpload: (id: string) => uploadManager.cancelUpload(id),
    retryUpload: (id: string) => uploadManager.retryUpload(id),
    removeItem: (id: string) => uploadManager.removeItem(id),
    pauseAll: () => uploadManager.pauseAll(),
    resumeAll: () => uploadManager.resumeAll(),
    cancelAll: () => uploadManager.cancelAll(),
    clearCompleted: () => uploadManager.clearCompleted(),
  };
}
