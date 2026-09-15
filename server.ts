import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;

// Lazy initialization of Gemini client for server-side OCR
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

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
    ocrSupported: true,
    roomsActive: syncRooms.size,
    timestamp: Date.now(),
  });
});

// Optical Character Recognition (OCR) Endpoint for image-based PDFs & Scanned Documents
app.post('/api/ocr', async (req, res) => {
  try {
    const { base64, mimeType, fileName } = req.body;
    if (!base64 || !mimeType) {
      return res.status(400).json({ error: 'Missing base64 document payload or mimeType.' });
    }

    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'OCR service unavailable: GEMINI_API_KEY environment variable is not configured.',
      });
    }

    const ocrPrompt = `You are a high-precision Optical Character Recognition (OCR) engine.
Perform comprehensive optical character recognition on this scanned document or image.
Rules:
1. Extract all legible text, titles, subtitles, sections, numbers, bullet lists, and tables.
2. Structure the output as clean, semantic Markdown:
   - Use # for main document titles, ## for section headings, ### for sub-headers.
   - Use Markdown bullet lists (- ) or numbered lists (1. ) where applicable.
   - If tables are present, structure them cleanly as Markdown tables (| Header 1 | Header 2 |).
   - Maintain natural paragraph breaks between distinct blocks of text.
3. Transcribe faithfully without altering wording, numbers, or dates.
4. Output ONLY the raw extracted document markdown text. DO NOT write conversational filler, intro remarks (e.g. "Here is the extracted text:"), or summary disclaimers.`;

    const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
    let extractedText = '';
    let selectedModel = '';
    let lastError: any = null;

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: base64,
                },
              },
              {
                text: ocrPrompt,
              },
            ],
          },
        });
        extractedText = response.text || '';
        selectedModel = model;
        break;
      } catch (err: any) {
        lastError = err;
        console.warn(`OCR model candidate ${model} failed, testing next model:`, err?.message);
      }
    }

    if (!extractedText && lastError) {
      throw lastError;
    }

    // Sanitize fileName to prevent path injection / XSS
    const safeFileName = typeof fileName === 'string'
      ? fileName.replace(/[/\\?%*:|"<>]/g, '').trim().slice(0, 120)
      : 'document';

    res.json({
      success: true,
      text: extractedText.trim(),
      model: selectedModel,
      fileName: safeFileName || 'document',
    });
  } catch (err: any) {
    console.error('Error during OCR processing:', err);
    // Sanitize error message to prevent server path leakage
    const rawMsg = String(err?.message || '');
    const cleanMsg = rawMsg.replace(/\/[\w./-]+/g, '[path]').slice(0, 200);
    res.status(500).json({
      error: cleanMsg || 'Optical Character Recognition processing failed.',
    });
  }
});

// Cloud Sync Room retrieval
app.get('/api/sync/:roomCode', (req, res) => {
  const roomCode = String(req.params.roomCode || '')
    .replace(/[^A-Za-z0-9_-]/g, '')
    .toUpperCase()
    .trim()
    .slice(0, 32);

  if (!roomCode) {
    return res.status(400).json({ error: 'Invalid room code format' });
  }

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
  const roomCode = String(req.params.roomCode || '')
    .replace(/[^A-Za-z0-9_-]/g, '')
    .toUpperCase()
    .trim()
    .slice(0, 32);

  if (!roomCode) {
    return res.status(400).json({ error: 'Invalid room code format' });
  }

  const doc: SyncedDocument = req.body;

  if (!doc || typeof doc !== 'object' || !doc.name || !doc.id) {
    return res.status(400).json({ error: 'Invalid document payload' });
  }

  // Sanitize document fields
  doc.id = String(doc.id).replace(/[^A-Za-z0-9_-]/g, '').slice(0, 64);
  doc.name = String(doc.name).replace(/[/\\?%*:|"<>]/g, '').slice(0, 150);
  doc.originalName = String(doc.originalName || doc.name).replace(/[/\\?%*:|"<>]/g, '').slice(0, 150);
  doc.format = String(doc.format || 'pdf').replace(/[^a-z0-9]/gi, '').slice(0, 10);
  doc.size = typeof doc.size === 'number' ? Math.max(0, doc.size) : 0;

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
  const roomCode = String(req.params.roomCode || '')
    .replace(/[^A-Za-z0-9_-]/g, '')
    .toUpperCase()
    .trim()
    .slice(0, 32);

  const docId = String(req.params.docId || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 64);

  if (!roomCode || !docId) {
    return res.status(400).json({ error: 'Invalid room or document identifier' });
  }

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
  const roomCode = String(req.params.roomCode || '')
    .replace(/[^A-Za-z0-9_-]/g, '')
    .toUpperCase()
    .trim()
    .slice(0, 32);

  if (!roomCode) {
    return res.status(400).json({ error: 'Invalid room code format' });
  }

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
