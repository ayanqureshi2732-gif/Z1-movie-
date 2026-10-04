import express from 'express';
import path from 'path';
import fs from 'fs';
import { pipeline } from 'stream/promises';

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';

// Ensure storage directories exist
const storageDir = path.resolve(process.cwd(), 'storage');
const uploadsDir = path.resolve(storageDir, 'media');
const chunksDir = path.resolve(storageDir, 'chunks');

fs.mkdirSync(uploadsDir, { recursive: true });
fs.mkdirSync(chunksDir, { recursive: true });

// Body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint for Cloud Run container healthchecks
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'Z1 MOVIES' });
});

// Storage sessions tracking in-memory & on-disk
interface UploadSession {
  id: string;
  fileName: string;
  fileSize: number;
  chunkSize: number;
  totalChunks: number;
  uploadedChunks: number[];
  metadata?: any;
  createdAt: number;
  lastActive: number;
}

const activeSessions = new Map<string, UploadSession>();

// Helper to get session directory
function getSessionDir(sessionId: string) {
  const safeId = sessionId.replace(/[^a-zA-Z0-9_-]/g, '');
  return path.resolve(chunksDir, safeId);
}

// 1. INIT UPLOAD SESSION
app.post('/api/upload/init', (req, res) => {
  try {
    const { id, fileName, fileSize, chunkSize, totalChunks, metadata } = req.body;
    if (!id || !fileName || !fileSize) {
      return res.status(400).json({ error: 'Missing required upload parameters' });
    }

    const sessionDir = getSessionDir(id);
    fs.mkdirSync(sessionDir, { recursive: true });

    // Check if session already exists for resume
    let session = activeSessions.get(id);
    if (!session) {
      // Check existing chunks on disk
      const existingFiles = fs.readdirSync(sessionDir);
      const uploadedChunks: number[] = [];
      for (const file of existingFiles) {
        if (file.startsWith('chunk_')) {
          const idx = parseInt(file.replace('chunk_', ''), 10);
          if (!isNaN(idx)) uploadedChunks.push(idx);
        }
      }

      session = {
        id,
        fileName,
        fileSize,
        chunkSize: chunkSize || 2 * 1024 * 1024,
        totalChunks: totalChunks || Math.ceil(fileSize / (chunkSize || 2 * 1024 * 1024)),
        uploadedChunks,
        metadata: metadata || {},
        createdAt: Date.now(),
        lastActive: Date.now(),
      };
      activeSessions.set(id, session);
    }

    return res.status(200).json({
      success: true,
      sessionId: session.id,
      chunkSize: session.chunkSize,
      totalChunks: session.totalChunks,
      uploadedChunks: session.uploadedChunks,
      isResumed: session.uploadedChunks.length > 0,
    });
  } catch (error: any) {
    console.error('[Upload Init Error]', error);
    return res.status(500).json({ error: error.message || 'Failed to initialize upload session' });
  }
});

// 2. UPLOAD CHUNK (Accepts raw binary or octet-stream)
app.post(
  '/api/upload/chunk',
  express.raw({ type: ['application/octet-stream', 'application/x-binary', '*/*'], limit: '50mb' }),
  async (req, res) => {
    try {
      const sessionId = (req.query.sessionId || req.headers['x-session-id']) as string;
      const chunkIndexStr = (req.query.chunkIndex || req.headers['x-chunk-index']) as string;

      if (!sessionId || chunkIndexStr === undefined) {
        return res.status(400).json({ error: 'Missing sessionId or chunkIndex' });
      }

      const chunkIndex = parseInt(chunkIndexStr, 10);
      if (isNaN(chunkIndex) || chunkIndex < 0) {
        return res.status(400).json({ error: 'Invalid chunkIndex' });
      }

      const sessionDir = getSessionDir(sessionId);
      if (!fs.existsSync(sessionDir)) {
        fs.mkdirSync(sessionDir, { recursive: true });
      }

      const chunkPath = path.resolve(sessionDir, `chunk_${chunkIndex}`);
      const chunkBuffer = req.body instanceof Buffer ? req.body : Buffer.from(req.body);

      if (!chunkBuffer || chunkBuffer.length === 0) {
        return res.status(400).json({ error: 'Empty chunk payload' });
      }

      // Write chunk atomically
      const tempChunkPath = `${chunkPath}.tmp`;
      await fs.promises.writeFile(tempChunkPath, chunkBuffer);
      await fs.promises.rename(tempChunkPath, chunkPath);

      // Update session tracking
      let session = activeSessions.get(sessionId);
      if (session) {
        if (!session.uploadedChunks.includes(chunkIndex)) {
          session.uploadedChunks.push(chunkIndex);
        }
        session.lastActive = Date.now();
      }

      return res.status(200).json({
        success: true,
        chunkIndex,
        bytesReceived: chunkBuffer.length,
      });
    } catch (error: any) {
      console.error('[Upload Chunk Error]', error);
      return res.status(500).json({ error: error.message || 'Failed to write chunk' });
    }
  }
);

// 3. CHECK UPLOAD STATUS (For recovering unfinished uploads)
app.get('/api/upload/status/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const sessionDir = getSessionDir(sessionId);

    if (!fs.existsSync(sessionDir)) {
      return res.status(404).json({ error: 'Session not found on disk' });
    }

    const files = fs.readdirSync(sessionDir);
    const uploadedChunks: number[] = [];
    let bytesOnDisk = 0;

    for (const f of files) {
      if (f.startsWith('chunk_') && !f.endsWith('.tmp')) {
        const idx = parseInt(f.replace('chunk_', ''), 10);
        if (!isNaN(idx)) {
          uploadedChunks.push(idx);
          const stat = fs.statSync(path.resolve(sessionDir, f));
          bytesOnDisk += stat.size;
        }
      }
    }

    const session = activeSessions.get(sessionId);
    return res.status(200).json({
      success: true,
      sessionId,
      uploadedChunks,
      bytesOnDisk,
      totalChunks: session?.totalChunks || null,
      fileSize: session?.fileSize || null,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 4. COMPLETE AND ASSEMBLE CHUNKS
app.post('/api/upload/complete', async (req, res) => {
  try {
    const { sessionId, fileName, totalChunks, metadata } = req.body;
    if (!sessionId || !fileName) {
      return res.status(400).json({ error: 'Missing sessionId or fileName' });
    }

    const sessionDir = getSessionDir(sessionId);
    if (!fs.existsSync(sessionDir)) {
      return res.status(404).json({ error: 'Upload chunks directory not found' });
    }

    const ext = path.extname(fileName) || '.mp4';
    const cleanBase = path.basename(fileName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const finalFileName = `${cleanBase}_${Date.now()}${ext}`;
    const finalFilePath = path.resolve(uploadsDir, finalFileName);

    const writeStream = fs.createWriteStream(finalFilePath);

    // Read and merge chunks in sequential order
    const expectedChunks = totalChunks || activeSessions.get(sessionId)?.totalChunks || 0;
    const existingChunks = fs
      .readdirSync(sessionDir)
      .filter((f) => f.startsWith('chunk_') && !f.endsWith('.tmp'))
      .map((f) => parseInt(f.replace('chunk_', ''), 10))
      .sort((a, b) => a - b);

    if (expectedChunks > 0 && existingChunks.length < expectedChunks) {
      return res.status(400).json({
        error: `Missing chunks: received ${existingChunks.length} of ${expectedChunks}`,
        missingChunks: Array.from({ length: expectedChunks }, (_, i) => i).filter(
          (i) => !existingChunks.includes(i)
        ),
      });
    }

    for (const chunkIndex of existingChunks) {
      const chunkFile = path.resolve(sessionDir, `chunk_${chunkIndex}`);
      if (fs.existsSync(chunkFile)) {
        const readStream = fs.createReadStream(chunkFile);
        await pipeline(readStream, writeStream, { end: false });
      }
    }
    writeStream.end();

    await new Promise((resolve, reject) => {
      writeStream.on('finish', () => resolve(true));
      writeStream.on('error', reject);
    });

    // Cleanup temporary chunks
    try {
      fs.rmSync(sessionDir, { recursive: true, force: true });
      activeSessions.delete(sessionId);
    } catch (e) {
      console.warn('Failed to clean up chunks dir:', e);
    }

    const stats = fs.statSync(finalFilePath);

    // Audio tracks detection defaults for standard OTT movies
    // If metadata provided audio tracks, preserve them; otherwise setup compatible tracks
    const audioTracks = metadata?.audioTracks || [
      {
        id: 'track-orig',
        language: metadata?.language || 'Hindi',
        label: `${metadata?.language || 'Hindi'} (Original 5.1 / Stereo)`,
        codec: 'AAC',
        isDefault: true,
      },
    ];

    return res.status(200).json({
      success: true,
      fileName: finalFileName,
      fileSize: stats.size,
      mediaUrl: `/api/media/${encodeURIComponent(finalFileName)}`,
      audioTracks,
      status: 'ready',
    });
  } catch (error: any) {
    console.error('[Upload Complete Error]', error);
    return res.status(500).json({ error: error.message || 'Failed to complete and assemble file' });
  }
});

// 5. HIGH-PERFORMANCE STREAMING ENDPOINT WITH HTTP 206 PARTIAL CONTENT
// This enables video scrubbing, instant audio/video seek, and Android MediaPlayer / ExoPlayer support
app.get('/api/media/:filename', (req, res) => {
  try {
    const rawFilename = req.params.filename;
    const safeFilename = path.basename(rawFilename);
    const filePath = path.resolve(uploadsDir, safeFilename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).send('Media file not found');
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    const ext = path.extname(safeFilename).toLowerCase();
    let contentType = 'video/mp4';
    if (ext === '.mkv') contentType = 'video/x-matroska';
    else if (ext === '.webm') contentType = 'video/webm';
    else if (ext === '.mp3') contentType = 'audio/mpeg';
    else if (ext === '.aac') contentType = 'audio/aac';
    else if (ext === '.m4a') contentType = 'audio/mp4';

    if (range) {
      // Parse Range header: e.g. "bytes=32324-" or "bytes=0-1048575"
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize || start > end) {
        res.status(416).set({
          'Content-Range': `bytes */${fileSize}`,
        });
        return res.end();
      }

      const chunksize = end - start + 1;
      const fileStream = fs.createReadStream(filePath, { start, end });

      res.status(206).set({
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      });

      fileStream.pipe(res);
    } else {
      res.status(200).set({
        'Content-Length': fileSize,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=3600',
      });
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (error: any) {
    console.error('[Media Stream Error]', error);
    if (!res.headersSent) {
      res.status(500).send('Internal media streaming error');
    }
  }
});

// Serve static assets from production dist folder
const distPath = path.resolve(process.cwd(), 'dist');

if (fs.existsSync(distPath)) {
  app.use(
    express.static(distPath, {
      maxAge: '1d',
      index: false,
    })
  );
}

// SPA fallback for all web routes (/movies, /movie/:id, /player/:id, /search, etc.)
app.get('*', (_req, res) => {
  const indexPath = path.resolve(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).send(
      '<!doctype html><html><body style="background:#08080b;color:#fff;font-family:sans-serif;padding:40px;text-align:center;"><h1>Z1 MOVIES</h1><p>Application is starting...</p></body></html>'
    );
  }
});

const server = app.listen(PORT, HOST, () => {
  console.log(`[Z1 MOVIES] Server listening on http://${HOST}:${PORT}`);
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  server.close(() => process.exit(0));
});
