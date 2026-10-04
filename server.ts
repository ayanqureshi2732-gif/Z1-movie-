import express from 'express';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';

// Health check endpoint for Cloud Run container healthchecks
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'Z1 MOVIES' });
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
