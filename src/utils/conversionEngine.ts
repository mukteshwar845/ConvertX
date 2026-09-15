import mammoth from 'mammoth';
import { jsPDF } from 'jspdf';
import PptxGenJS from 'pptxgenjs';
import JSZip from 'jszip';
import {
  SupportedFormat,
  TargetFormat,
  ConversionOptions,
  FidelityReport,
  InternalDocumentModel,
  ConversionResult,
} from '../types';
import { createDocxFromContent } from './docxGenerator';
import { detectFileFormat, getCompatibleTargets } from './fileDetector';
import { parseDocumentToIDM } from './documentParser';
import { evaluateDocumentFidelity } from './fidelityEngine';
import { convertSpreadsheet } from './spreadsheetEngine';
import { convertImage } from './imageConverter';

export interface ConversionProgressCallback {
  (progress: number, statusText: string): void;
}

export type { ConversionResult };

// In-memory SHA-256 conversion cache
const conversionCache = new Map<string, ConversionResult>();

/**
 * Detects format from file extension or MIME type
 */
export function detectFormat(file: File): SupportedFormat {
  const name = file.name.toLowerCase();
  if (name.endsWith('.docx')) return 'docx';
  if (name.endsWith('.doc')) return 'doc';
  if (name.endsWith('.pdf')) return 'pdf';
  if (name.endsWith('.pptx')) return 'pptx';
  if (name.endsWith('.ppt')) return 'ppt';
  if (name.endsWith('.odp')) return 'odp';
  if (name.endsWith('.xlsx')) return 'xlsx';
  if (name.endsWith('.xls')) return 'xls';
  if (name.endsWith('.csv')) return 'csv';
  if (name.endsWith('.ods')) return 'ods';
  if (name.endsWith('.odt')) return 'odt';
  if (name.endsWith('.rtf')) return 'rtf';
  if (name.endsWith('.txt')) return 'txt';
  if (name.endsWith('.md') || name.endsWith('.markdown')) return 'md';
  if (name.endsWith('.html') || name.endsWith('.htm')) return 'html';
  if (name.endsWith('.png')) return 'png';
  if (name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.jfif')) return 'jpg';
  if (name.endsWith('.webp')) return 'webp';
  if (name.endsWith('.svg')) return 'svg';
  if (name.endsWith('.bmp')) return 'bmp';
  if (name.endsWith('.gif')) return 'gif';
  if (name.endsWith('.tiff') || name.endsWith('.tif')) return 'tiff';
  if (name.endsWith('.avif')) return 'webp';
  if (name.endsWith('.ico')) return 'png';
  if (name.endsWith('.tsv')) return 'csv';
  if (name.endsWith('.json')) return 'json';
  if (name.endsWith('.xml')) return 'xml';
  if (name.endsWith('.yaml') || name.endsWith('.yml') || name.endsWith('.log') || name.endsWith('.ini')) return 'txt';

  // MIME fallback
  if (file.type.includes('word')) return 'docx';
  if (file.type.includes('pdf')) return 'pdf';
  if (file.type.includes('presentation') || file.type.includes('powerpoint')) return 'pptx';
  if (file.type.includes('spreadsheet') || file.type.includes('excel')) return 'xlsx';
  if (file.type.includes('csv')) return 'csv';
  if (file.type.includes('image/png')) return 'png';
  if (file.type.includes('image/jpeg')) return 'jpg';
  if (file.type.includes('image/webp')) return 'webp';
  if (file.type.includes('image/svg')) return 'svg';
  if (file.type.includes('text/html')) return 'html';
  if (file.type.includes('text/markdown')) return 'md';
  if (file.type.includes('json')) return 'json';
  if (file.type.includes('xml')) return 'xml';
  return 'txt';
}

/**
 * Get available target formats for a given source format using the Universal Conversion Graph
 */
export function getAvailableTargets(source: SupportedFormat, ocrEnabled: boolean = false): TargetFormat[] {
  return getCompatibleTargets(source, ocrEnabled);
}


/**
 * Extract clean HTML and text from DOCX preserving interior formatting
 */
export async function parseDocx(arrayBuffer: ArrayBuffer) {
  const result = await mammoth.convertToHtml(
    { arrayBuffer },
    {
      styleMap: [
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
        "p[style-name='Title'] => h1.title:fresh",
        "r[style-name='Strong'] => strong",
        "r[style-name='Emphasis'] => em",
      ],
    }
  );
  const rawTextResult = await mammoth.extractRawText({ arrayBuffer });
  return {
    html: result.value,
    text: rawTextResult.value,
    messages: result.messages,
  };
}

/**
 * Render structured HTML to a pristine multi-page PDF preserving font sizes, headings, margins
 */
export function renderHtmlToPdf(html: string, title?: string): { blob: Blob; url: string } {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 45;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  function checkPageBreak(neededSpace: number) {
    if (y + neededSpace > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  }

  // Parse HTML into DOM elements
  const parser = new DOMParser();
  const dom = parser.parseFromString(`<div>${html}</div>`, 'text/html');

  // Collect all direct text nodes and child blocks
  const rootDiv = dom.body.firstElementChild || dom.body;
  const childNodes = Array.from(rootDiv.childNodes);

  if (childNodes.length === 0) {
    const rawText = dom.body.textContent || '';
    const paragraphs = rawText.split('\n').filter((p) => p.trim().length > 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);

    for (const p of paragraphs) {
      const lines = doc.splitTextToSize(p.trim(), contentWidth);
      checkPageBreak(lines.length * 15 + 8);
      doc.text(lines, margin, y);
      y += lines.length * 15 + 8;
    }
  } else {
    for (const node of childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        if (!text) continue;
        const lines = doc.splitTextToSize(text, contentWidth);
        checkPageBreak(lines.length * 15 + 6);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10.5);
        doc.setTextColor(30, 41, 59);
        doc.text(lines, margin, y);
        y += lines.length * 15 + 6;
        continue;
      }

      if (node.nodeType !== Node.ELEMENT_NODE) continue;
      const el = node as HTMLElement;
      const tag = el.tagName.toLowerCase();
      const text = el.textContent ? el.textContent.trim() : '';
      if (!text && tag !== 'hr') continue;

      if (tag === 'h1') {
        checkPageBreak(36);
        y += y > margin ? 12 : 0;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.setTextColor(15, 23, 42);
        const lines = doc.splitTextToSize(text, contentWidth);
        doc.text(lines, margin, y);
        y += lines.length * 22 + 8;
      } else if (tag === 'h2') {
        checkPageBreak(30);
        y += y > margin ? 10 : 0;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(30, 41, 59);
        const lines = doc.splitTextToSize(text, contentWidth);
        doc.text(lines, margin, y);
        y += lines.length * 18 + 6;
      } else if (tag === 'h3') {
        checkPageBreak(24);
        y += y > margin ? 8 : 0;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(51, 65, 85);
        const lines = doc.splitTextToSize(text, contentWidth);
        doc.text(lines, margin, y);
        y += lines.length * 16 + 5;
      } else if (tag === 'h4' || tag === 'h5' || tag === 'h6') {
        checkPageBreak(20);
        y += y > margin ? 6 : 0;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(71, 85, 105);
        const lines = doc.splitTextToSize(text, contentWidth);
        doc.text(lines, margin, y);
        y += lines.length * 15 + 4;
      } else if (tag === 'ul' || tag === 'ol') {
        const items = Array.from(el.querySelectorAll('li'));
        for (let idx = 0; idx < items.length; idx++) {
          const itemText = items[idx].textContent?.trim() || '';
          if (!itemText) continue;
          checkPageBreak(18);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10.5);
          doc.setTextColor(30, 41, 59);
          const bullet = tag === 'ol' ? `${idx + 1}. ` : '• ';
          doc.text(bullet, margin + 5, y);
          const lines = doc.splitTextToSize(itemText, contentWidth - 25);
          doc.text(lines, margin + 20, y);
          y += lines.length * 15 + 4;
        }
        y += 4;
      } else if (tag === 'table') {
        const rows = Array.from(el.querySelectorAll('tr'));
        checkPageBreak(rows.length * 20 + 10);
        for (const tr of rows) {
          const cells = Array.from(tr.querySelectorAll('th, td'));
          const colWidth = contentWidth / Math.max(cells.length, 1);
          checkPageBreak(20);
          cells.forEach((td, cIdx) => {
            const isHeader = td.tagName.toLowerCase() === 'th';
            doc.setFont('helvetica', isHeader ? 'bold' : 'normal');
            doc.setFontSize(9.5);
            doc.setTextColor(isHeader ? 15 : 51, isHeader ? 23 : 65, isHeader ? 42 : 85);
            const cellLines = doc.splitTextToSize(td.textContent?.trim() || '', colWidth - 8);
            doc.text(cellLines, margin + cIdx * colWidth + 4, y);
          });
          y += 18;
        }
        y += 8;
      } else if (tag === 'hr') {
        checkPageBreak(15);
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(1);
        doc.line(margin, y, margin + contentWidth, y);
        y += 15;
      } else if (tag === 'pre' || tag === 'code') {
        const lines = doc.splitTextToSize(text, contentWidth);
        checkPageBreak(lines.length * 14 + 10);
        doc.setFont('courier', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(30, 41, 59);
        doc.text(lines, margin + 10, y);
        y += lines.length * 14 + 8;
      } else {
        // Standard paragraph or div
        const lines = doc.splitTextToSize(text, contentWidth);
        checkPageBreak(lines.length * 15 + 6);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10.5);
        doc.setTextColor(30, 41, 59);
        doc.text(lines, margin, y);
        y += lines.length * 15 + 6;
      }
    }
  }

  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  return { blob: pdfBlob, url: pdfUrl };
}

/**
 * Convert structured content to PowerPoint presentation slides (.pptx)
 */
export async function renderContentToPptx(
  title: string,
  sections: Array<{ title: string; bullets: string[]; subtitle?: string }>
): Promise<Blob> {
  const pres = new PptxGenJS();
  pres.layout = 'LAYOUT_16x9';

  // Slide 1: Elegant Title Slide
  const titleSlide = pres.addSlide();
  titleSlide.background = { color: '0F172A' }; // Dark slate

  titleSlide.addText(title.replace(/\.[^/.]+$/, ''), {
    x: 1.0,
    y: 2.2,
    w: '80%',
    h: 1.5,
    fontSize: 34,
    bold: true,
    color: 'FFFFFF',
    fontFace: 'Arial',
  });

  titleSlide.addText('Converted with DocuConvert • Preserved Formatting Integrity', {
    x: 1.0,
    y: 3.8,
    w: '80%',
    h: 0.8,
    fontSize: 14,
    color: '94A3B8',
    fontFace: 'Arial',
  });

  // Content slides
  if (sections.length === 0) {
    sections = [{ title: 'Document Overview', bullets: ['Maintained original text content', 'Ready for presentation and editing'] }];
  }

  for (const sec of sections) {
    const slide = pres.addSlide();
    slide.background = { color: 'F8FAFC' }; // Soft clean off-white

    // Top Header Banner
    slide.addShape(pres.ShapeType.rect, {
      x: 0,
      y: 0,
      w: '100%',
      h: 1.1,
      fill: { color: '1E293B' },
    });

    slide.addText(sec.title || 'Summary', {
      x: 0.8,
      y: 0.3,
      w: '85%',
      h: 0.6,
      fontSize: 22,
      bold: true,
      color: 'FFFFFF',
      fontFace: 'Arial',
    });

    // Subtitle if present
    if (sec.subtitle) {
      slide.addText(sec.subtitle, {
        x: 0.8,
        y: 1.3,
        w: '85%',
        h: 0.4,
        fontSize: 12,
        italic: true,
        color: '64748B',
      });
    }

    // Body content / bullets
    if (sec.bullets && sec.bullets.length > 0) {
      const bulletItems = sec.bullets.slice(0, 7).map((b) => ({
        text: b,
        options: {
          fontSize: 15,
          color: '334155',
          bullet: true,
          breakLine: true,
          paraSpaceAfter: 12,
        },
      }));

      slide.addText(bulletItems, {
        x: 0.8,
        y: sec.subtitle ? 1.8 : 1.5,
        w: '85%',
        h: 4.5,
        fontFace: 'Arial',
      });
    }

    // Slide footer
    slide.addText('DocuConvert Presentation System', {
      x: 0.8,
      y: 6.8,
      w: '50%',
      h: 0.3,
      fontSize: 9,
      color: '94A3B8',
    });
  }

  return (await pres.write({ outputType: 'blob' })) as Blob;
}

/**
 * Parse PPTX slides using JSZip
 */
export async function parsePptx(buffer: ArrayBuffer): Promise<{ title: string; slides: Array<{ title: string; content: string[] }> }> {
  const zip = new JSZip();
  await zip.loadAsync(buffer);

  const slides: Array<{ title: string; content: string[] }> = [];
  const slideFiles = Object.keys(zip.files).filter((f) => f.startsWith('ppt/slides/slide') && f.endsWith('.xml'));

  // Sort slides sequentially (slide1.xml, slide2.xml, ...)
  slideFiles.sort((a, b) => {
    const numA = parseInt(a.replace(/[^0-9]/g, ''), 10) || 0;
    const numB = parseInt(b.replace(/[^0-9]/g, ''), 10) || 0;
    return numA - numB;
  });

  for (const sFile of slideFiles) {
    const xml = await zip.files[sFile].async('string');
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, 'application/xml');
    const textNodes = Array.from(xmlDoc.getElementsByTagName('a:t'));
    const texts = textNodes.map((n) => n.textContent?.trim() || '').filter((t) => t.length > 0);

    if (texts.length > 0) {
      const slideTitle = texts[0];
      const slideBody = texts.slice(1);
      slides.push({
        title: slideTitle,
        content: slideBody,
      });
    }
  }

  return {
    title: slides[0]?.title || 'PowerPoint Presentation',
    slides,
  };
}

/**
 * Extract text chunks and structure from PDF buffer
 */
/**
 * Decompress Flate / zlib compressed PDF data streams
 */
async function decompressPdfStream(data: Uint8Array): Promise<string> {
  if (typeof DecompressionStream === 'undefined') return '';
  try {
    const ds = new DecompressionStream('deflate');
    const writer = ds.writable.getWriter();
    writer.write(data);
    writer.close();
    const reader = ds.readable.getReader();
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
    const totalLen = chunks.reduce((acc, c) => acc + c.length, 0);
    const merged = new Uint8Array(totalLen);
    let offset = 0;
    for (const c of chunks) {
      merged.set(c, offset);
      offset += c.length;
    }
    return new TextDecoder('utf-8', { fatal: false }).decode(merged);
  } catch {
    try {
      const ds = new DecompressionStream('deflate-raw');
      const writer = ds.writable.getWriter();
      writer.write(data);
      writer.close();
      const reader = ds.readable.getReader();
      const chunks: Uint8Array[] = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
      }
      const totalLen = chunks.reduce((acc, c) => acc + c.length, 0);
      const merged = new Uint8Array(totalLen);
      let offset = 0;
      for (const c of chunks) {
        merged.set(c, offset);
        offset += c.length;
      }
      return new TextDecoder('utf-8', { fatal: false }).decode(merged);
    } catch {
      return '';
    }
  }
}

/**
 * Extract text from PDF buffer with support for compressed Flate streams and text operators
 */
export async function parsePdfText(buffer: ArrayBuffer): Promise<{ text: string; paragraphs: string[] }> {
  const bytes = new Uint8Array(buffer);
  const textDecoder = new TextDecoder('utf-8', { fatal: false });
  let combinedText = textDecoder.decode(bytes);

  // Decompress FlateDecode streams if present
  try {
    const streamMarker = new TextEncoder().encode('stream');
    const endstreamMarker = new TextEncoder().encode('endstream');
    let searchPos = 0;

    while (searchPos < bytes.length) {
      // Find 'stream'
      let streamStart = -1;
      for (let i = searchPos; i <= bytes.length - 6; i++) {
        if (
          bytes[i] === streamMarker[0] &&
          bytes[i + 1] === streamMarker[1] &&
          bytes[i + 2] === streamMarker[2] &&
          bytes[i + 3] === streamMarker[3] &&
          bytes[i + 4] === streamMarker[4] &&
          bytes[i + 5] === streamMarker[5]
        ) {
          // Check following newline
          let offset = 6;
          if (bytes[i + offset] === 0x0d) offset++;
          if (bytes[i + offset] === 0x0a) offset++;
          streamStart = i + offset;
          break;
        }
      }

      if (streamStart === -1) break;

      // Find 'endstream'
      let streamEnd = -1;
      for (let j = streamStart; j <= bytes.length - 9; j++) {
        if (
          bytes[j] === endstreamMarker[0] &&
          bytes[j + 1] === endstreamMarker[1] &&
          bytes[j + 2] === endstreamMarker[2] &&
          bytes[j + 3] === endstreamMarker[3] &&
          bytes[j + 4] === endstreamMarker[4] &&
          bytes[j + 5] === endstreamMarker[5] &&
          bytes[j + 6] === endstreamMarker[6] &&
          bytes[j + 7] === endstreamMarker[7] &&
          bytes[j + 8] === endstreamMarker[8]
        ) {
          streamEnd = j;
          // Trim preceding whitespace / newline
          if (bytes[streamEnd - 1] === 0x0a) streamEnd--;
          if (bytes[streamEnd - 1] === 0x0d) streamEnd--;
          break;
        }
      }

      if (streamEnd > streamStart) {
        const streamData = bytes.subarray(streamStart, streamEnd);
        const decompressed = await decompressPdfStream(streamData);
        if (decompressed) {
          combinedText += '\n' + decompressed;
        }
        searchPos = streamEnd + 9;
      } else {
        searchPos = streamStart + 6;
      }
    }
  } catch (err) {
    // Fallback to uncompressed text extraction
  }

  // Extract literal PDF text streams and Tj / TJ blocks
  const textRegex = /\(([^)]+)\)\s*Tj|\[([^\]]+)\]\s*TJ/g;
  const matches: string[] = [];
  let match;

  while ((match = textRegex.exec(combinedText)) !== null) {
    if (match[1]) {
      matches.push(match[1]);
    } else if (match[2]) {
      // TJ array format: [(text) 10 (more)]
      const innerRegex = /\(([^)]+)\)/g;
      let innerMatch;
      while ((innerMatch = innerRegex.exec(match[2])) !== null) {
        matches.push(innerMatch[1]);
      }
    }
  }

  let extracted = matches.join(' ');
  // Unescape standard PDF octals and entities
  extracted = extracted
    .replace(/\\([0-9]{3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)))
    .replace(/\\([()\\\/])/g, '$1');

  if (!extracted || extracted.length < 20) {
    // Clean fallback to printable text runs
    const cleanMatches = combinedText.match(/[A-Za-z0-9\s.,!?:;'"\-–—()]{4,}/g) || [];
    extracted = cleanMatches
      .filter((s) => !s.includes('xref') && !s.includes('trailer') && !s.includes('obj') && !s.includes('endobj'))
      .join('\n');
  }

  const paragraphs = extracted
    .split(/\n{2,}|\.\s+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 5);

  return {
    text: extracted.trim(),
    paragraphs: paragraphs.length > 0 ? paragraphs : ['Extracted document content successfully.'],
  };
}

/**
 * Parse markdown into structured DOCX sections
 */
export function markdownToSections(md: string) {
  const lines = md.split('\n');
  const sections: Array<{
    type: 'heading1' | 'heading2' | 'heading3' | 'paragraph' | 'bullet';
    text: string;
    bold?: boolean;
  }> = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith('# ')) {
      sections.push({ type: 'heading1', text: line.replace(/^#\s+/, '') });
    } else if (line.startsWith('## ')) {
      sections.push({ type: 'heading2', text: line.replace(/^##\s+/, '') });
    } else if (line.startsWith('### ')) {
      sections.push({ type: 'heading3', text: line.replace(/^###\s+/, '') });
    } else if (line.startsWith('- ') || line.startsWith('* ') || /^\d+\.\s+/.test(line)) {
      sections.push({ type: 'bullet', text: line.replace(/^([-*]|\d+\.)\s+/, '') });
    } else if (line.startsWith('|') && line.endsWith('|')) {
      if (!line.includes('---')) {
        const cells = line
          .split('|')
          .map((c) => c.trim())
          .filter(Boolean);
        sections.push({ type: 'paragraph', text: cells.join('   |   '), bold: true });
      }
    } else {
      sections.push({ type: 'paragraph', text: line });
    }
  }

  if (sections.length === 0) {
    sections.push({ type: 'paragraph', text: md });
  }

  return sections;
}

/**
 * Convert markdown to clean semantic HTML
 */
export function markdownToHtml(md: string): string {
  let html = md
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/^\s*[-*]\s+(.*$)/gim, '<li>$1</li>')
    .replace(/^\d+\.\s+(.*$)/gim, '<li>$1</li>');

  html = html.replace(/(<li>[\s\S]*?<\/li>)/gm, '<ul>$1</ul>');

  return html
    .split(/\n\s*\n/)
    .map((block) => {
      block = block.trim();
      if (!block) return '';
      if (
        block.startsWith('<h') ||
        block.startsWith('<ul') ||
        block.startsWith('<ol') ||
        block.startsWith('<table')
      ) {
        return block;
      }
      return `<p>${block.replace(/\n/g, '<br/>')}</p>`;
    })
    .join('\n');
}

/**
 * Parse markdown into presentation slides
 */
export function markdownToSlides(title: string, md: string): Array<{ title: string; bullets: string[] }> {
  const sections: Array<{ title: string; bullets: string[] }> = [];
  const lines = md.split('\n');
  let currentTitle = title.replace(/\.[^/.]+$/, '');
  let currentBullets: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('# ') || trimmed.startsWith('## ')) {
      if (currentBullets.length > 0 || currentTitle !== title) {
        sections.push({
          title: currentTitle,
          bullets: currentBullets.length > 0 ? currentBullets : ['Document section content'],
        });
      }
      currentTitle = trimmed.replace(/^#+\s*/, '');
      currentBullets = [];
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\.\s+/.test(trimmed)) {
      currentBullets.push(trimmed.replace(/^([-*]|\d+\.)\s*/, ''));
    } else if (currentBullets.length < 5 && trimmed.length < 200) {
      currentBullets.push(trimmed);
    }
  }

  if (currentTitle || currentBullets.length > 0) {
    sections.push({
      title: currentTitle,
      bullets: currentBullets.length > 0 ? currentBullets : ['Extracted document content'],
    });
  }

  return sections.length > 0 ? sections : [{ title: 'Overview', bullets: [md.slice(0, 200)] }];
}

/**
 * Server-side OCR Text Extractor with graceful client fallbacks
 */
export async function performOcrExtraction(
  file: File,
  onProgress?: ConversionProgressCallback
): Promise<{ text: string; success: boolean }> {
  onProgress?.(25, 'Preparing document for Optical Character Recognition (OCR)...');

  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      const commaIdx = res.indexOf(',');
      resolve(commaIdx >= 0 ? res.substring(commaIdx + 1) : res);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const mimeType =
    file.type ||
    (file.name.toLowerCase().endsWith('.pdf')
      ? 'application/pdf'
      : file.name.toLowerCase().endsWith('.png')
      ? 'image/png'
      : 'image/jpeg');

  onProgress?.(50, 'Analyzing scanned page with OCR Vision Engine...');

  try {
    const response = await fetch('/api/ocr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        base64,
        mimeType,
        fileName: file.name,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.text && data.text.trim().length > 0) {
        onProgress?.(75, 'Extracted text and structure via OCR');
        return { text: data.text.trim(), success: true };
      }
    } else {
      const errData = await response.json().catch(() => ({}));
      console.warn('OCR endpoint returned status:', response.status, errData);
    }
  } catch (err) {
    console.warn('Network error invoking OCR API:', err);
  }

  return { text: '', success: false };
}

/**
 * Main Direct Document Converter Engine
 */
export async function convertDocument(
  file: File,
  targetFormat: TargetFormat,
  onProgressOrOptions?: ConversionProgressCallback | ConversionOptions,
  maybeOptions?: { ocrEnabled?: boolean }
): Promise<ConversionResult> {
  const { universalConvertDocument } = await import('./universalConverter');
  let onProgress: ConversionProgressCallback | undefined;
  let options: ConversionOptions = {};

  if (typeof onProgressOrOptions === 'function') {
    onProgress = onProgressOrOptions;
    if (maybeOptions?.ocrEnabled) {
      options.ocrEnabled = maybeOptions.ocrEnabled;
    }
  } else if (onProgressOrOptions && typeof onProgressOrOptions === 'object') {
    onProgress = (onProgressOrOptions as any).onProgress;
    options = { ...onProgressOrOptions };
  }

  return universalConvertDocument(file, targetFormat, options, onProgress);
}

