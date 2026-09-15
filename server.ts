import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

interface SyncedDocument {
  id: string;
  name: string;
  originalName: string;
  format: string;
  originalFormat: string;
  size: number;
  encrypted: boolean;
  encryptedPayload?: string; // Base64 ciphertext
  iv?: string; // Base64 IV
  salt?: string; // Base64 Salt
  checksum?: string; // SHA-256
  createdAt: number;
  deviceLabel: string;
}

interface SyncRoom {
  roomCode: string;
  createdAt: number;
  updatedAt: number;
  documents: SyncedDocument[];
}

// In-memory sync rooms cache with disk fallback
const syncRooms = new Map<string, SyncRoom>();
const DATA_DIR = path.join(process.cwd(), '.data');
const SYNC_FILE = path.join(DATA_DIR, 'cloud_sync.json');

function loadSyncData() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(SYNC_FILE)) {
      const raw = fs.readFileSync(SYNC_FILE, 'utf-8');
      const data: Record<string, SyncRoom> = JSON.parse(raw);
      for (const [key, room] of Object.entries(data)) {
        syncRooms.set(key, room);
      }
    }
  } catch (err) {
    console.error('Failed to load sync data:', err);
  }
}

function saveSyncData() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const data: Record<string, SyncRoom> = {};
    syncRooms.forEach((room, key) => {
      data[key] = room;
    });
    fs.writeFileSync(SYNC_FILE, JSON.stringify(data), 'utf-8');
  } catch (err) {
    console.error('Failed to save sync data:', err);
  }
}

loadSyncData();

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    roomsActive: syncRooms.size,
    timestamp: Date.now(),
  });
});

// Cloud Sync Room retrieval
app.get('/api/sync/:roomCode', (req, res) => {
  const roomCode = req.params.roomCode.toUpperCase().trim();
  const room = syncRooms.get(roomCode);
  if (!room) {
    return res.json({
      roomCode,
      exists: false,
      documents: [],
      message: 'Room is empty or newly created.',
    });
  }
  res.json({
    roomCode,
    exists: true,
    createdAt: room.createdAt,
    updatedAt: room.updatedAt,
    documents: room.documents,
  });
});

// Cloud Sync Document Upload / Push
app.post('/api/sync/:roomCode', (req, res) => {
  const roomCode = req.params.roomCode.toUpperCase().trim();
  const doc: SyncedDocument = req.body;

  if (!doc || !doc.name || !doc.id) {
    return res.status(400).json({ error: 'Invalid document payload' });
  }

  let room = syncRooms.get(roomCode);
  if (!room) {
    room = {
      roomCode,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      documents: [],
    };
    syncRooms.set(roomCode, room);
  }

  // Replace if exists or prepend
  const existingIdx = room.documents.findIndex((d) => d.id === doc.id);
  if (existingIdx >= 0) {
    room.documents[existingIdx] = doc;
  } else {
    room.documents.unshift(doc);
  }

  // Cap per room to avoid memory exhaustion (50 docs)
  if (room.documents.length > 50) {
    room.documents = room.documents.slice(0, 50);
  }

  room.updatedAt = Date.now();
  saveSyncData();

  res.json({
    success: true,
    roomCode,
    count: room.documents.length,
    document: doc,
  });
});

// Delete document from sync room
app.delete('/api/sync/:roomCode/:docId', (req, res) => {
  const roomCode = req.params.roomCode.toUpperCase().trim();
  const docId = req.params.docId;
  const room = syncRooms.get(roomCode);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  room.documents = room.documents.filter((d) => d.id !== docId);
  room.updatedAt = Date.now();
  saveSyncData();
  res.json({ success: true, count: room.documents.length });
});

// Clear all documents in sync room
app.post('/api/sync/:roomCode/clear', (req, res) => {
  const roomCode = req.params.roomCode.toUpperCase().trim();
  const room = syncRooms.get(roomCode);
  if (room) {
    room.documents = [];
    room.updatedAt = Date.now();
    saveSyncData();
  }
  res.json({ success: true, count: 0 });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DocuConvert server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
