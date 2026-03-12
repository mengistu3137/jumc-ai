/**
 * App-wide configuration.
 *
 * DEVELOPMENT: set API_BASE to your machine's local IP so the device/emulator
 * can reach the backend (e.g. 'http://192.168.1.100:3001/api').
 * PRODUCTION: replace with your deployed backend URL.
 */
export const API_BASE = 'http://localhost:3001/api';

// WebSocket URL derived from the API base
export const WS_URL = API_BASE.replace(/^http/, 'ws').replace('/api', '') + '/ws';
