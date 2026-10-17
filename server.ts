import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// In-memory room management for phone <-> PC pairing
interface ClientSession {
  ws: WebSocket;
  role: 'pc' | 'phone';
  roomId: string;
}

const rooms = new Map<string, Set<ClientSession>>();
// Recent events buffer for HTTP polling fallback
const roomEventBuffers = new Map<string, Array<{ id: number; timestamp: number; payload: unknown; stateUpdate?: unknown }>>();
let eventIdCounter = 1;

wss.on('connection', (ws) => {
  let currentSession: ClientSession | null = null;

  ws.on('message', (raw) => {
    try {
      const data = JSON.parse(raw.toString());

      if (data.type === 'join') {
        const { roomId, role } = data;
        if (!roomId) return;

        currentSession = { ws, role: role || 'phone', roomId };
        if (!rooms.has(roomId)) {
          rooms.set(roomId, new Set());
        }
        rooms.get(roomId)!.add(currentSession);

        // Notify room members of connection state
        const roomClients = rooms.get(roomId)!;
        const phoneCount = Array.from(roomClients).filter(c => c.role === 'phone').length;
        const pcCount = Array.from(roomClients).filter(c => c.role === 'pc').length;

        const statusMsg = JSON.stringify({
          type: 'room_status',
          roomId,
          phoneConnected: phoneCount > 0,
          pcConnected: pcCount > 0,
          total: roomClients.size,
        });

        roomClients.forEach((client) => {
          if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(statusMsg);
          }
        });
        return;
      }

      // Broadcast MIDI or control messages to other peers in the room
      if (currentSession && data.roomId) {
        const roomClients = rooms.get(data.roomId);
        if (roomClients) {
          const payload = JSON.stringify(data);
          roomClients.forEach((client) => {
            if (client.ws !== ws && client.ws.readyState === WebSocket.OPEN) {
              client.ws.send(payload);
            }
          });
        }

        // Also store in buffer for HTTP polling
        if (!roomEventBuffers.has(data.roomId)) {
          roomEventBuffers.set(data.roomId, []);
        }
        const buf = roomEventBuffers.get(data.roomId)!;
        buf.push({
          id: ++eventIdCounter,
          timestamp: Date.now(),
          payload: data.payload,
          stateUpdate: data.stateUpdate,
        });
        if (buf.length > 50) buf.shift();
      }
    } catch {
      // Ignore malformed payloads
    }
  });

  ws.on('close', () => {
    if (currentSession) {
      const { roomId } = currentSession;
      const roomClients = rooms.get(roomId);
      if (roomClients) {
        roomClients.delete(currentSession);
        if (roomClients.size === 0) {
          rooms.delete(roomId);
        } else {
          const phoneCount = Array.from(roomClients).filter(c => c.role === 'phone').length;
          const pcCount = Array.from(roomClients).filter(c => c.role === 'pc').length;
          const statusMsg = JSON.stringify({
            type: 'room_status',
            roomId,
            phoneConnected: phoneCount > 0,
            pcConnected: pcCount > 0,
            total: roomClients.size,
          });
          roomClients.forEach((client) => {
            if (client.ws.readyState === WebSocket.OPEN) {
              client.ws.send(statusMsg);
            }
          });
        }
      }
    }
  });
});

// Endpoint providing clean public URLs and room diagnostics
app.get('/api/config', (_req, res) => {
  const devUrl = process.env.APP_URL || '';
  // Convert ais-dev to ais-pre (which is the public preview URL)
  const sharedUrl = devUrl.replace('ais-dev-', 'ais-pre-');
  res.json({
    devUrl,
    sharedUrl: sharedUrl || devUrl,
    activeRooms: rooms.size,
  });
});

// HTTP Fallback endpoint to post events if WebSocket is blocked on phone
app.post('/api/rooms/:roomId/events', (req, res) => {
  const { roomId } = req.params;
  const data = req.body;

  if (!roomEventBuffers.has(roomId)) {
    roomEventBuffers.set(roomId, []);
  }
  const buf = roomEventBuffers.get(roomId)!;
  const evt = {
    id: ++eventIdCounter,
    timestamp: Date.now(),
    payload: data.payload,
    stateUpdate: data.stateUpdate,
  };
  buf.push(evt);
  if (buf.length > 50) buf.shift();

  // Forward to open WebSockets (the PC)
  const roomClients = rooms.get(roomId);
  if (roomClients) {
    const payloadStr = JSON.stringify({
      type: 'midi_event',
      roomId,
      payload: data.payload,
      stateUpdate: data.stateUpdate,
    });
    roomClients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(payloadStr);
      }
    });
  }

  res.json({ success: true, id: evt.id });
});

// HTTP Fallback endpoint to poll events
app.get('/api/rooms/:roomId/events', (req, res) => {
  const { roomId } = req.params;
  const since = Number(req.query.since) || 0;
  const buf = roomEventBuffers.get(roomId) || [];
  const fresh = buf.filter(e => e.id > since);
  res.json({ events: fresh });
});

async function start() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

start();
