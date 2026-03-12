'use strict';
const { WebSocketServer } = require('ws');

let wss = null;
/** @type {Set<import('ws').WebSocket>} */
const clients = new Set();

/**
 * Attach a WebSocket server to the existing HTTP server.
 * All clients connect to the `/ws` path.
 *
 * @param {import('http').Server} httpServer
 */
function initWebSocket(httpServer) {
  wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws, req) => {
    const ip = req.socket.remoteAddress;
    console.log(`[WS] client connected from ${ip}`);
    clients.add(ws);

    // Acknowledge connection
    ws.send(JSON.stringify({ type: 'connected', message: 'JUMC AI WebSocket ready' }));

    ws.on('close', () => {
      clients.delete(ws);
      console.log('[WS] client disconnected');
    });

    ws.on('error', (err) => {
      console.warn('[WS] client error:', err.message);
      clients.delete(ws);
    });
  });

  console.log('[WS] WebSocket server initialised at /ws');
}

/**
 * Broadcast a typed event to all connected clients.
 *
 * @param {string} type   Event name (e.g. 'pharmacy_notification')
 * @param {object} data   Event payload
 */
function broadcast(type, data) {
  if (!wss) return;
  const message = JSON.stringify({ type, data, timestamp: new Date().toISOString() });
  for (const client of clients) {
    if (client.readyState === 1 /* OPEN */) {
      client.send(message);
    }
  }
}

module.exports = { initWebSocket, broadcast };
