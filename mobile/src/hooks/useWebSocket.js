import { useEffect, useRef } from 'react';
import { WS_URL } from '../config';

/**
 * Custom hook that opens a WebSocket connection to the backend and
 * calls `onMessage` whenever a message arrives.
 *
 * Auto-reconnects after 5 s on disconnect.
 * The connection is closed when the component unmounts.
 */
export function useWebSocket(onMessage) {
  // Keep ref stable across re-renders so the effect doesn't reinstall
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    let ws;
    let reconnectTimer;
    let cancelled = false;

    const connect = () => {
      if (cancelled) return;
      try {
        ws = new WebSocket(WS_URL);

        ws.onopen  = ()  => console.log('[WS] connected');
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            // Skip the initial "connected" handshake
            if (data.type === 'connected') return;
            onMessageRef.current?.(data);
          } catch {
            // Ignore unparseable frames
          }
        };
        ws.onerror = (e) => console.warn('[WS] error:', e.message);
        ws.onclose = () => {
          if (!cancelled) {
            reconnectTimer = setTimeout(connect, 5000);
          }
        };
      } catch {
        if (!cancelled) {
          reconnectTimer = setTimeout(connect, 5000);
        }
      }
    };

    connect();

    return () => {
      cancelled = true;
      clearTimeout(reconnectTimer);
      ws?.close();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
