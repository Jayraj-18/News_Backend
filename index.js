require('dotenv').config();
const express = require('express');
const cors = require('cors');
const articleRoutes = require('./routes/articleRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Allow localhost development and any production origins configured through env.
const configuredOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  ...configuredOrigins,
]);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, Postman) or same-origin requests.
    if (!origin) return callback(null, true);

    if (allowedOrigins.has(origin)) return callback(null, true);

    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }

    callback(new Error(`CORS policy: origin ${origin} not allowed`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-admin-token'],
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
app.options('*', cors(corsOptions));

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));  // Parse JSON bodies (articles may have images as base64)
app.use(express.urlencoded({ extended: true }));

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Maharashtra News 24 Backend is running 🚀' });
});

// ─── ROUTES ───────────────────────────────────────────────────────────────────
app.use('/api/articles', articleRoutes);

// ─── 404 HANDLER ──────────────────────────────────────────────────────────────
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
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`📰 Articles API: http://localhost:${PORT}/api/articles\n`);
});
