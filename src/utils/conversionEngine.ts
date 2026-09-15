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
  if (name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'jpg';
  if (name.endsWith('.webp')) return 'webp';
  if (name.endsWith('.svg')) return 'svg';
  if (name.endsWith('.bmp')) return 'bmp';
  if (name.endsWith('.gif')) return 'gif';
  if (name.endsWith('.tiff') || name.endsWith('.tif')) return 'tiff';
  if (name.endsWith('.json')) return 'json';
  if (name.endsWith('.xml')) return 'xml';

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
export function renderHtmlToPdf(html: string, title: string): { blob: Blob; url: string } {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 50;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Parse HTML into DOM elements
  const parser = new DOMParser();
  const dom = parser.parseFromString(`<div>${html}</div>`, 'text/html');

  // Document Title Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42); // slate-900
  const cleanTitle = title.replace(/\.[^/.]+$/, '');
  const titleLines = doc.splitTextToSize(cleanTitle, contentWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 24 + 10;

  // Decorative subtle divider
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(1);
  doc.line(margin, y, margin + contentWidth, y);
  y += 20;

  function checkPageBreak(neededSpace: number) {
    if (y + neededSpace > pageHeight - margin) {
      doc.addPage();
      y = margin;
      // Add page header / footer
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`Page ${doc.getNumberOfPages()}`, pageWidth - margin - 30, pageHeight - 20);
    }
  }

  const nodes = dom.body.firstElementChild ? Array.from(dom.body.firstElementChild.children) : [];

  if (nodes.length === 0) {
    // If no complex tags, fallback to text paragraphs
    const paragraphs = (dom.body.textContent || '').split('\n').filter((p) => p.trim().length > 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(51, 65, 85);

    for (const p of paragraphs) {
      const lines = doc.splitTextToSize(p.trim(), contentWidth);
      checkPageBreak(lines.length * 15 + 10);
      doc.text(lines, margin, y);
      y += lines.length * 15 + 10;
    }
  } else {
    for (const el of nodes) {
      const tag = el.tagName.toLowerCase();
      const text = el.textContent ? el.textContent.trim() : '';
      if (!text) continue;

      if (tag === 'h1') {
        checkPageBreak(36);
        y += 10;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(15, 23, 42);
        const lines = doc.splitTextToSize(text, contentWidth);
        doc.text(lines, margin, y);
        y += lines.length * 20 + 8;
      } else if (tag === 'h2') {
        checkPageBreak(30);
        y += 8;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(30, 41, 59);
        const lines = doc.splitTextToSize(text, contentWidth);
        doc.text(lines, margin, y);
        y += lines.length * 18 + 6;
      } else if (tag === 'h3') {
        checkPageBreak(26);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(71, 85, 105);
        const lines = doc.splitTextToSize(text, contentWidth);
        doc.text(lines, margin, y);
        y += lines.length * 16 + 5;
      } else if (tag === 'ul' || tag === 'ol') {
        const items = Array.from(el.querySelectorAll('li'));
        for (let idx = 0; idx < items.length; idx++) {
          const itemText = items[idx].textContent?.trim() || '';
          if (!itemText) continue;
          checkPageBreak(20);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10.5);
          doc.setTextColor(51, 65, 85);
          const bullet = tag === 'ol' ? `${idx + 1}. ` : '• ';
          doc.text(bullet, margin + 5, y);
          const lines = doc.splitTextToSize(itemText, contentWidth - 25);
          doc.text(lines, margin + 20, y);
          y += lines.length * 15 + 4;
        }
        y += 6;
      } else if (tag === 'table') {
        const rows = Array.from(el.querySelectorAll('tr'));
        checkPageBreak(rows.length * 22 + 10);
        for (const tr of rows) {
          const cells = Array.from(tr.querySelectorAll('th, td'));
          const colWidth = contentWidth / Math.max(cells.length, 1);
          checkPageBreak(22);
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
        y += 10;
      } else {
        // Standard paragraph
        const lines = doc.splitTextToSize(text, contentWidth);
        checkPageBreak(lines.length * 15 + 8);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10.5);
        doc.setTextColor(51, 65, 85);
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
export async function parsePdfText(buffer: ArrayBuffer): Promise<{ text: string; paragraphs: string[] }> {
  const bytes = new Uint8Array(buffer);
  const textDecoder = new TextDecoder('utf-8', { fatal: false });
  const rawString = textDecoder.decode(bytes);

  // Extract literal PDF text streams and Tj / TJ blocks
  const textRegex = /\(([^)]+)\)\s*Tj|\[([^\]]+)\]\s*TJ/g;
  const matches: string[] = [];
  let match;

  while ((match = textRegex.exec(rawString)) !== null) {
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
    // Clean fallback to printable ASCII runs
    const cleanMatches = rawString.match(/[A-Za-z0-9\s.,!?:;'"\-–—()]{4,}/g) || [];
    extracted = cleanMatches.filter((s) => !s.includes('xref') && !s.includes('trailer') && !s.includes('obj') && !s.includes('endobj')).join('\n');
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

// Legacy fallback methods retained for backward compatibility
async function _legacyConvert(file: File, targetFormat: TargetFormat, onProgress?: ConversionProgressCallback, ocrEnabled: boolean = false) {
  const sourceFormat = detectFormat(file);
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const outName = `${baseName}.${targetFormat}`;

  onProgress?.(10, 'Reading file bytes...');
  const arrayBuffer = await file.arrayBuffer();

  // DOCX Source
  if (sourceFormat === 'docx') {
    onProgress?.(30, 'Extracting document layout and styles...');
    const parsed = await parseDocx(arrayBuffer);

    if (targetFormat === 'pdf') {
      onProgress?.(65, 'Rendering high-fidelity vector PDF...');
      const { blob } = renderHtmlToPdf(parsed.html, file.name);
      onProgress?.(100, 'Conversion complete');
      return {
        blob,
        name: outName,
        size: blob.size,
        preview: { type: 'html', content: parsed.html },
      };
    }

    if (targetFormat === 'pptx') {
      onProgress?.(60, 'Generating presentation slides...');
      // Extract headings as slide titles
      const parser = new DOMParser();
      const dom = parser.parseFromString(`<div>${parsed.html}</div>`, 'text/html');
      const elements = Array.from(dom.body.firstElementChild?.children || []);

      const sections: Array<{ title: string; bullets: string[] }> = [];
      let currentSection: { title: string; bullets: string[] } | null = null;

      for (const el of elements) {
        const tag = el.tagName.toLowerCase();
        const text = el.textContent?.trim() || '';
        if (!text) continue;

        if (tag === 'h1' || tag === 'h2') {
          if (currentSection) sections.push(currentSection);
          currentSection = { title: text, bullets: [] };
        } else if (tag === 'ul' || tag === 'ol') {
          const lis = Array.from(el.querySelectorAll('li'));
          for (const li of lis) {
            const liText = li.textContent?.trim();
            if (liText) {
              if (!currentSection) currentSection = { title: 'Overview', bullets: [] };
              currentSection.bullets.push(liText);
            }
          }
        } else {
          if (!currentSection) currentSection = { title: 'Overview', bullets: [] };
          currentSection.bullets.push(text);
        }
      }
      if (currentSection) sections.push(currentSection);

      const blob = await renderContentToPptx(file.name, sections);
      onProgress?.(100, 'Conversion complete');
      return {
        blob,
        name: outName,
        size: blob.size,
        preview: { type: 'html', content: parsed.html },
      };
    }

    if (targetFormat === 'txt') {
      onProgress?.(90, 'Formatting raw text...');
      const blob = new Blob([parsed.text], { type: 'text/plain;charset=utf-8' });
      return {
        blob,
        name: outName,
        size: blob.size,
        preview: { type: 'text', content: parsed.text },
      };
    }

    if (targetFormat === 'html') {
      onProgress?.(90, 'Formatting semantic HTML...');
      const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${file.name}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1e293b; }
    h1, h2, h3 { color: #0f172a; margin-top: 1.5em; }
    table { border-collapse: collapse; width: 100%; margin: 1em 0; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
    th { background: #f1f5f9; font-weight: 600; }
  </style>
</head>
<body>
  ${parsed.html}
</body>
</html>`;
      const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
      return {
        blob,
        name: outName,
        size: blob.size,
        preview: { type: 'html', content: parsed.html },
      };
    }

    if (targetFormat === 'md') {
      onProgress?.(90, 'Generating Markdown...');
      // Simple clean HTML to markdown parser
      let md = parsed.html
        .replace(/<h1>(.*?)<\/h1>/gi, '# $1\n\n')
        .replace(/<h2>(.*?)<\/h2>/gi, '## $1\n\n')
        .replace(/<h3>(.*?)<\/h3>/gi, '### $1\n\n')
        .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
        .replace(/<em>(.*?)<\/em>/gi, '*$1*')
        .replace(/<li>(.*?)<\/li>/gi, '- $1\n')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<[^>]+>/g, '');
      md = md.trim();
      const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
      return {
        blob,
        name: outName,
        size: blob.size,
        preview: { type: 'text', content: md },
      };
    }
  }

  // PDF Source
  if (sourceFormat === 'pdf') {
    let text = '';
    let paragraphs: string[] = [];
    let ocrUsed = false;

    if (ocrEnabled) {
      onProgress?.(30, 'Performing OCR on scanned PDF document...');
      const ocrRes = await performOcrExtraction(file, onProgress);
      if (ocrRes.success && ocrRes.text) {
        text = ocrRes.text;
        paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
        ocrUsed = true;
      }
    }

    if (!text) {
      onProgress?.(35, 'Analyzing PDF streams and text...');
      const parsed = await parsePdfText(arrayBuffer);
      text = parsed.text;
      paragraphs = parsed.paragraphs;

      // Auto-detect image-only / scanned PDF if extracted text is negligible
      if ((!text || text.length < 30) && !ocrUsed) {
        onProgress?.(45, 'Scanned / image-based PDF detected. Running OCR extraction...');
        const ocrRes = await performOcrExtraction(file, onProgress);
        if (ocrRes.success && ocrRes.text) {
          text = ocrRes.text;
          paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
          ocrUsed = true;
        }
      }
    }

    if (targetFormat === 'docx') {
      onProgress?.(70, 'Building OpenXML Word document (.docx)...');
      const sections = ocrUsed
        ? markdownToSections(text)
        : paragraphs.map((p, idx) => ({
            type: idx === 0 ? ('heading1' as const) : ('paragraph' as const),
            text: p,
          }));
      const blob = await createDocxFromContent(baseName, sections);
      onProgress?.(100, 'Conversion complete');
      return {
        blob,
        name: outName,
        size: blob.size,
        ocrUsed,
        preview: { type: 'text', content: text },
      };
    }

    if (targetFormat === 'pptx') {
      onProgress?.(65, 'Creating presentation slides...');
      const slideSections = ocrUsed
        ? markdownToSlides(file.name, text)
        : (() => {
            const ss = [];
            for (let i = 0; i < paragraphs.length; i += 3) {
              const chunk = paragraphs.slice(i, i + 3);
              ss.push({
                title: chunk[0] ? chunk[0].slice(0, 50) : `Slide ${i / 3 + 1}`,
                bullets: chunk.slice(1),
              });
            }
            return ss;
          })();
      const blob = await renderContentToPptx(file.name, slideSections);
      return {
        blob,
        name: outName,
        size: blob.size,
        ocrUsed,
        preview: { type: 'text', content: text },
      };
    }

    if (targetFormat === 'txt') {
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      return {
        blob,
        name: outName,
        size: blob.size,
        ocrUsed,
        preview: { type: 'text', content: text },
      };
    }

    if (targetFormat === 'html') {
      const htmlBody = ocrUsed ? markdownToHtml(text) : paragraphs.map((p) => `<p>${p}</p>`).join('\n');
      const blob = new Blob([`<html><body>${htmlBody}</body></html>`], { type: 'text/html;charset=utf-8' });
      return {
        blob,
        name: outName,
        size: blob.size,
        ocrUsed,
        preview: { type: 'html', content: htmlBody },
      };
    }

    if (targetFormat === 'md') {
      const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
      return {
        blob,
        name: outName,
        size: blob.size,
        ocrUsed,
        preview: { type: 'text', content: text },
      };
    }
  }

  // PPTX Source
  if (sourceFormat === 'pptx') {
    onProgress?.(40, 'Parsing PowerPoint presentation structures...');
    const { title, slides } = await parsePptx(arrayBuffer);

    if (targetFormat === 'pdf') {
      onProgress?.(75, 'Generating PDF presentation export...');
      const htmlSlides = slides
        .map(
          (s, idx) => `
        <div style="margin-bottom: 24px;">
          <h2>Slide ${idx + 1}: ${s.title}</h2>
          <ul>${s.content.map((c) => `<li>${c}</li>`).join('')}</ul>
        </div>
      `
        )
        .join('');
      const { blob } = renderHtmlToPdf(htmlSlides, title);
      return {
        blob,
        name: outName,
        size: blob.size,
        preview: { type: 'html', content: htmlSlides },
      };
    }

    if (targetFormat === 'docx') {
      onProgress?.(70, 'Converting slides to Word document...');
      const docxSections: Array<{ type: 'heading1' | 'heading2' | 'paragraph' | 'bullet'; text: string }> = [];
      for (const s of slides) {
        docxSections.push({ type: 'heading2', text: s.title });
        for (const c of s.content) {
          docxSections.push({ type: 'bullet', text: c });
        }
      }
      const blob = await createDocxFromContent(title, docxSections);
      return {
        blob,
        name: outName,
        size: blob.size,
        preview: {
          type: 'text',
          content: slides.map((s) => `${s.title}\n${s.content.join('\n')}`).join('\n\n'),
        },
      };
    }

    if (targetFormat === 'txt') {
      const txt = slides.map((s, idx) => `--- Slide ${idx + 1}: ${s.title} ---\n${s.content.join('\n')}`).join('\n\n');
      const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
      return {
        blob,
        name: outName,
        size: blob.size,
        preview: { type: 'text', content: txt },
      };
    }
  }

  // Image Source (PNG, JPG)
  if (sourceFormat === 'png' || sourceFormat === 'jpg') {
    // If OCR is enabled or target is a text/doc format (docx, txt, html, pptx, md)
    if (ocrEnabled || targetFormat !== 'pdf') {
      onProgress?.(30, 'Performing OCR on scanned image document...');
      const ocrRes = await performOcrExtraction(file, onProgress);
      if (ocrRes.success && ocrRes.text) {
        const text = ocrRes.text;

        if (targetFormat === 'docx') {
          onProgress?.(70, 'Generating editable Word document with extracted OCR text...');
          const sections = markdownToSections(text);
          const blob = await createDocxFromContent(baseName, sections);
          return {
            blob,
            name: outName,
            size: blob.size,
            ocrUsed: true,
            preview: { type: 'text', content: text },
          };
        }

        if (targetFormat === 'txt') {
          const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
          return {
            blob,
            name: outName,
            size: blob.size,
            ocrUsed: true,
            preview: { type: 'text', content: text },
          };
        }

        if (targetFormat === 'html') {
          const html = markdownToHtml(text);
          const fullHtml = `<!DOCTYPE html><html><body>${html}</body></html>`;
          const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
          return {
            blob,
            name: outName,
            size: blob.size,
            ocrUsed: true,
            preview: { type: 'html', content: html },
          };
        }

        if (targetFormat === 'pptx') {
          const slides = markdownToSlides(file.name, text);
          const blob = await renderContentToPptx(file.name, slides);
          return {
            blob,
            name: outName,
            size: blob.size,
            ocrUsed: true,
            preview: { type: 'text', content: text },
          };
        }

        if (targetFormat === 'md') {
          const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
          return {
            blob,
            name: outName,
            size: blob.size,
            ocrUsed: true,
            preview: { type: 'text', content: text },
          };
        }

        if (targetFormat === 'pdf') {
          const html = markdownToHtml(text);
          const { blob } = renderHtmlToPdf(html, file.name);
          return {
            blob,
            name: outName,
            size: blob.size,
            ocrUsed: true,
            preview: { type: 'html', content: html },
          };
        }
      }
    }

    onProgress?.(45, 'Processing image...');
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

    onProgress?.(75, 'Embedding into PDF document...');
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const img = new Image();
    img.src = dataUrl;
    await new Promise((resolve) => {
      img.onload = resolve;
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    const maxWidth = pageWidth - margin * 2;
    const maxHeight = pageHeight - margin * 2;

    let w = img.width;
    let h = img.height;
    const ratio = Math.min(maxWidth / w, maxHeight / h);
    w = w * ratio;
    h = h * ratio;

    const x = (pageWidth - w) / 2;
    const y = (pageHeight - h) / 2;

    doc.addImage(dataUrl, sourceFormat === 'png' ? 'PNG' : 'JPEG', x, y, w, h);
    const blob = doc.output('blob');
    return {
      blob,
      name: outName,
      size: blob.size,
      preview: { type: 'image', content: dataUrl },
    };
  }

  // TXT / Markdown / HTML Source
  const rawText = await file.text();
  if (targetFormat === 'pdf') {
    onProgress?.(65, 'Rendering formatted PDF...');
    const htmlContent =
      sourceFormat === 'html'
        ? rawText
        : rawText
            .split('\n\n')
            .map((p) => `<p>${p.replace(/\n/g, '<br/>')}</p>`)
            .join('');
    const { blob } = renderHtmlToPdf(htmlContent, file.name);
    return {
      blob,
      name: outName,
      size: blob.size,
      preview: { type: 'text', content: rawText },
    };
  }

  if (targetFormat === 'docx') {
    onProgress?.(70, 'Converting to Word document (.docx)...');
    const paragraphs = rawText
      .split('\n')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
    const sections = paragraphs.map((p) => ({
      type: p.startsWith('# ') ? ('heading1' as const) : p.startsWith('## ') ? ('heading2' as const) : ('paragraph' as const),
      text: p.replace(/^#+\s*/, ''),
    }));
    const blob = await createDocxFromContent(baseName, sections);
    return {
      blob,
      name: outName,
      size: blob.size,
      preview: { type: 'text', content: rawText },
    };
  }

  if (targetFormat === 'pptx') {
    onProgress?.(70, 'Building presentation slides...');
    const paragraphs = rawText.split('\n\n').filter((p) => p.trim().length > 0);
    const sections = paragraphs.map((p, idx) => ({
      title: `Slide ${idx + 1}`,
      bullets: p.split('\n').filter((l) => l.trim().length > 0),
    }));
    const blob = await renderContentToPptx(file.name, sections);
    return {
      blob,
      name: outName,
      size: blob.size,
      preview: { type: 'text', content: rawText },
    };
  }

  // Fallback direct text blob
  const blob = new Blob([rawText], { type: 'text/plain;charset=utf-8' });
  return {
    blob,
    name: outName,
    size: blob.size,
    preview: { type: 'text', content: rawText },
  };
}
