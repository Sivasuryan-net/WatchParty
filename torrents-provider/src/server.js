const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Import routes
const apiRoutes = require('./routes/api');
const sourcesRoutes = require('./routes/sources');
const transcodeRoutes = require('./routes/transcode');
const streamRoutes = require('./routes/stream');
const imdbRoutes = require('./routes/imdb');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3000, // Limit each IP to 3000 requests per windowMs
    message: {
        error: 'Too many requests, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false
});

app.use(limiter);
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'WatchParty Video Streaming API',
        version: '3.0.0',
        status: 'running',
        endpoints: {
            // Torrent streaming
            addTorrent: 'POST /api/stream/add { magnet: "..." }',
            streamFile: 'GET /api/stream/:infoHash/:fileIndex',
            streamStatus: 'GET /api/stream/status/:infoHash',
            // Video sources
            movieSources: '/api/sources/movie/:tmdbId',
            tvSources: '/api/sources/tv/:tmdbId/:season/:episode',
            // Transcoding
            transcodeStream: '/api/transcode/stream?url=<video-url>',
            // Search
            search: '/api/:site/:query/:page?',
            allSites: '/api/all/:query/:page?'
        }
    });
});

// API routes
app.use('/api/stream', streamRoutes);
app.use('/api/transcode', transcodeRoutes);
app.use('/api/sources', sourcesRoutes);
app.use('/api/imdb', imdbRoutes);
app.use('/api', apiRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        availableEndpoints: {
            search: '/api/:site/:query/:page?',
            allSites: '/api/all/:query/:page?',
            sites: '/api/sites'
        }
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║       WatchParty Torrents Provider API                    ║
║       Running on http://localhost:${PORT}                    ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Prevent crashes on unhandled errors (common with WebTorrent)
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
    // Don't exit, keep running if possible
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION:', reason);
});

module.exports = app;
