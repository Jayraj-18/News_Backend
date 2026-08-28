require('dotenv').config();
const express = require('express');
const cors = require('cors');
const articleRoutes = require('./routes/articleRoutes');
const authRoutes = require('./routes/authRoutes');
const sitemapRoutes = require('./routes/sitemapRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── CORS ─────────────────────────────────────────────────────────────────────
const configuredOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

const allowedOrigins = new Set([
  'http://localhost:5173',
  ...configuredOrigins,
]);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.has(origin)) return callback(null, true);
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    callback(new Error(`CORS policy: origin ${origin} not allowed`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use((req, res, next) => {
  if (req.headers['access-control-request-private-network'] === 'true') {
    res.setHeader('Access-Control-Allow-Private-Network', 'true');
  }
  next();
});

app.use(cors(corsOptions));

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── HEALTH CHECK & ROOT ──────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'पालघर दृष्टी Backend is running 🚀' });
});

// ─── PING (pre-warm endpoint) ─────────────────────────────────────────────────
// Called by the frontend on page load so Render's server is awake before the
// actual /api/articles request arrives.  No DB access — responds instantly.
app.get('/ping', (req, res) => {
  res.status(200).json({ pong: true });
});

app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Maharashtra News 24 API Service' });
});

// ─── ROUTES ───────────────────────────────────────────────────────────────────
app.use('/', sitemapRoutes); // <--- MOVED HERE (BEFORE 404 HANDLER)
app.use('/api/articles', articleRoutes);
app.use('/api/auth', authRoutes);

// ─── 404 HANDLER ──────────────────────────────────────────────────────────────
// (Must be below ALL routes)
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});

// ─── GLOBAL ERROR HANDLER ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
});

// ─── START SERVER ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Maharashtra News 24 Backend running on http://localhost:${PORT}`);
});