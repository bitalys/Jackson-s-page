import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from dist directory
const distPath = path.resolve(__dirname, 'dist');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  // SPA client-side routing fallback
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
} else {
  app.get('*', (req, res) => {
    res.status(503).send('Application is still building. Please refresh in a moment.');
  });
}

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});
