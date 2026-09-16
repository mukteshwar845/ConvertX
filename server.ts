import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

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

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    ocrSupported: true,
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
