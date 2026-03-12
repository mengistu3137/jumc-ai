'use strict';
require('dotenv').config();

const express = require('express');
const http    = require('http');
const cors    = require('cors');

const voiceRoutes  = require('./api/routes/voice');
const healthRoutes = require('./api/routes/health');
const { initWebSocket } = require('./modules/websockets');

const app    = express();
const server = http.createServer(app);

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/voice',  voiceRoutes);
app.use('/api/health', healthRoutes);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// ── Global error handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[server] unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// ── WebSocket ─────────────────────────────────────────────────────────────────
initWebSocket(server);

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT) || 3001;
server.listen(PORT, () => {
  console.log(`JUMC AI Backend running on port ${PORT}`);
});
