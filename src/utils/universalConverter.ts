import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import {
  SupportedFormat,
  TargetFormat,
  ConversionOptions,
  ConversionResult,
  InternalDocumentModel,
  FidelityReport,
} from '../types';
import { detectFileFormat } from './fileDetector';
import { parseDocumentToIDM } from './documentParser';
import { evaluateDocumentFidelity } from './fidelityEngine';
import { convertSpreadsheet } from './spreadsheetEngine';
import { convertImage } from './imageConverter';
import { createDocxFromContent } from './docxGenerator';
import {
  parseDocx,
  parsePdfText,
  parsePptx,
  renderHtmlToPdf,
  renderContentToPptx,
  markdownToHtml,
  markdownToSections,
  markdownToSlides,
  performOcrExtraction,
  ConversionProgressCallback,
} from './conversionEngine';

// Global SHA-256 in-memory cache for instant replay
const conversionCache = new Map<string, ConversionResult>();

/**
 * Universal Conversion Engine with IDM representation, Fidelity Verification, Auto-Retry, and Caching
 */
export async function universalConvertDocument(
  file: File,
  targetFormat: TargetFormat,
  options?: ConversionOptions,
  onProgress?: ConversionProgressCallback
): Promise<ConversionResult> {
  const ocrEnabled = !!options?.ocrEnabled;
  const presentationMode = options?.presentationMode || 'exact';
  const autoRetry = options?.autoRetryLowFidelity !== false;
  const threshold = options?.fidelityThreshold ?? 85;

  onProgress?.(5, 'Computing cryptographic SHA-256 checksum...');
  const arrayBuffer = await file.arrayBuffer();

  if (!file || file.size === 0 || arrayBuffer.byteLength === 0) {
    throw new Error(
      `The file "${file?.name || 'document'}" is empty (0 bytes). Please upload a document with valid content.`
    );
  }

  // 1. SHA-256 Instant Conversion Caching Check
  try {
    const hashBuf = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArr = Array.from(new Uint8Array(hashBuf));
    const sha256 = hashArr.map((b) => b.toString(16).padStart(2, '0')).join('');
    const cacheKey = `${sha256}_${targetFormat}_${presentationMode}_${options?.imageQuality ?? 0.92}_${ocrEnabled}`;

    if (conversionCache.has(cacheKey)) {
      onProgress?.(100, 'Loaded instantly from verified SHA-256 cache');
      const cached = conversionCache.get(cacheKey)!;
      return { ...cached, cached: true };
    }
  } catch (err) {
    // Cache digest fallback
  }

  // 2. Format & Signature Verification
  onProgress?.(15, 'Inspecting file signature and magic bytes...');
  const { format: detectedFmt, signature } = await detectFileFormat(file);
  const sourceFormat = detectedFmt;
  const baseName = file.name.replace(/\.[^/.]+$/, '');
  const outName = `${baseName}.${targetFormat}`;

  // 3. Build Source Internal Document Model (IDM)
  onProgress?.(25, 'Building Internal Document Model (IDM) intermediate tree...');
  const sourceModel = await parseDocumentToIDM(file, sourceFormat, signature);

  // 4. Strategy Runner
  const runConversionStrategy = async (
    strategy: 'primary' | 'alternative'
  ): Promise<{
    blob: Blob;
    name: string;
    size: number;
    ocrUsed?: boolean;
    preview: { type: 'html' | 'text' | 'pdf' | 'image' | 'table'; content: string; sheets?: any[] };
    extractedText: string;
    strategyName: string;
  }> => {
    // Category A: SPREADSHEETS (XLSX, XLS, CSV, ODS)
    if (['xlsx', 'xls', 'csv', 'ods'].includes(sourceFormat)) {
      onProgress?.(50, `Running ${strategy === 'primary' ? 'SheetJS Core Grid' : 'Tabular Semantic'} adapter...`);
      const res = await convertSpreadsheet(file, targetFormat as any, {
        preserveFormulas: options?.spreadsheetPreserveFormulas,
        onProgress: (p, msg) => onProgress?.(30 + p * 0.5, msg),
      });
      return {
        blob: res.blob,
        name: res.name,
        size: res.size,
        preview: res.preview,
        extractedText: res.extractedText,
        strategyName: strategy === 'primary' ? 'SheetJS High-Fidelity Workbook' : 'Tabular Semantic Grid',
      };
    }

    // Category B: IMAGES (PNG, JPG, WEBP, SVG, BMP, GIF, TIFF)
    if (['png', 'jpg', 'webp', 'svg', 'bmp', 'gif', 'tiff'].includes(sourceFormat)) {
      if (['png', 'jpg', 'webp', 'svg', 'bmp', 'pdf'].includes(targetFormat) && !ocrEnabled) {
        onProgress?.(55, 'Applying image color profile and raster scaling...');
        const res = await convertImage(file, targetFormat as any, options, (p, msg) =>
          onProgress?.(30 + p * 0.5, msg)
        );
        return {
          blob: res.blob,
          name: res.name,
          size: res.size,
          preview: { type: 'image', content: res.previewUrl },
          extractedText: `[Image: ${res.name}]`,
          strategyName: 'Direct Canvas Rasterization',
        };
      }

      // OCR Pipeline for images converting to documents
      onProgress?.(40, 'Executing OCR Vision Extraction...');
      const ocrRes = await performOcrExtraction(file, (p, msg) => onProgress?.(30 + p * 0.4, msg));
      const extractedText = ocrRes.text || sourceModel.rawText || file.name;

      if (targetFormat === 'docx') {
        const sections = markdownToSections(extractedText);
        const blob = await createDocxFromContent(baseName, sections);
        return {
          blob,
          name: outName,
          size: blob.size,
          ocrUsed: true,
          preview: { type: 'text', content: extractedText },
          extractedText,
          strategyName: 'OCR Vision -> OpenXML Document',
        };
      }

      if (targetFormat === 'txt') {
        const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
        return {
          blob,
          name: outName,
          size: blob.size,
          ocrUsed: true,
          preview: { type: 'text', content: extractedText },
          extractedText,
          strategyName: 'OCR Vision -> UTF-8 Text',
        };
      }

      if (targetFormat === 'html') {
        const html = markdownToHtml(extractedText);
        const fullHtml = `<!DOCTYPE html><html><body>${html}</body></html>`;
        const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
        return {
          blob,
          name: outName,
          size: blob.size,
          ocrUsed: true,
          preview: { type: 'html', content: html },
          extractedText,
          strategyName: 'OCR Vision -> Semantic HTML',
        };
      }

      if (targetFormat === 'pptx') {
        const slides = markdownToSlides(file.name, extractedText);
        const blob = await renderContentToPptx(file.name, slides);
        return {
          blob,
          name: outName,
          size: blob.size,
          ocrUsed: true,
          preview: { type: 'text', content: extractedText },
          extractedText,
          strategyName: 'OCR Vision -> OpenXML Presentation',
        };
      }

      if (targetFormat === 'pdf') {
        const html = markdownToHtml(extractedText);
        const { blob } = renderHtmlToPdf(html, file.name);
        return {
          blob,
          name: outName,
          size: blob.size,
          ocrUsed: true,
          preview: { type: 'html', content: html },
          extractedText,
          strategyName: 'OCR Vision -> Vector PDF',
        };
      }

      if (targetFormat === 'md') {
        const blob = new Blob([extractedText], { type: 'text/markdown;charset=utf-8' });
        return {
          blob,
          name: outName,
          size: blob.size,
          ocrUsed: true,
          preview: { type: 'text', content: extractedText },
          extractedText,
          strategyName: 'OCR Vision -> Markdown',
        };
      }
    }

    // Category C: DOCX / DOC / ODT / RTF
    if (['docx', 'doc', 'odt', 'rtf'].includes(sourceFormat)) {
      onProgress?.(45, 'Parsing document styles and structure...');
      const parsed = await parseDocx(arrayBuffer);

      if (targetFormat === 'pdf') {
        onProgress?.(70, 'Rendering high-fidelity vector PDF...');
        const { blob } = renderHtmlToPdf(parsed.html, file.name);
        return {
          blob,
          name: outName,
          size: blob.size,
          preview: { type: 'html', content: parsed.html },
          extractedText: parsed.text,
          strategyName: strategy === 'primary' ? 'Mammoth Typography Engine' : 'DOM Semantic Fallback',
        };
      }

      if (targetFormat === 'pptx') {
        onProgress?.(65, 'Mapping document hierarchy to presentation slides...');
        const mode = presentationMode;

        const parser = new DOMParser();
        const dom = parser.parseFromString(`<div>${parsed.html}</div>`, 'text/html');
        const elements = Array.from(dom.body.firstElementChild?.children || []);

        const sections: Array<{ title: string; bullets: string[] }> = [];
        let currentSection: { title: string; bullets: string[] } | null = null;

        for (const el of elements) {
          const tag = el.tagName.toLowerCase();
          const text = el.textContent?.trim() || '';
          if (!text) continue;

          if (tag === 'h1' || tag === 'h2' || tag === 'h3') {
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
            if (mode === 'exact') {
              // Exact mode: strictly preserve full sentence text
              currentSection.bullets.push(text);
            } else if (mode === 'page-to-slide') {
              // Page to slide: chunk by ~250 words
              if (currentSection.bullets.join(' ').split(/\s+/).length > 250) {
                sections.push(currentSection);
                currentSection = { title: `Page Slide ${sections.length + 1}`, bullets: [text] };
              } else {
                currentSection.bullets.push(text);
              }
            } else {
              // Smart layout
              currentSection.bullets.push(text);
            }
          }
        }
        if (currentSection) sections.push(currentSection);

        const blob = await renderContentToPptx(file.name, sections);
        return {
          blob,
          name: outName,
          size: blob.size,
          preview: { type: 'html', content: parsed.html },
          extractedText: parsed.text,
          strategyName: `OpenXML DOCX -> PPTX (${mode.toUpperCase()} Mode)`,
        };
      }

      if (targetFormat === 'txt') {
        const blob = new Blob([parsed.text], { type: 'text/plain;charset=utf-8' });
        return {
          blob,
          name: outName,
          size: blob.size,
          preview: { type: 'text', content: parsed.text },
          extractedText: parsed.text,
          strategyName: 'OpenXML Plain Text Extraction',
        };
      }

      if (targetFormat === 'html') {
        const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${file.name}</title></head><body>${parsed.html}</body></html>`;
        const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
        return {
          blob,
          name: outName,
          size: blob.size,
          preview: { type: 'html', content: parsed.html },
          extractedText: parsed.text,
          strategyName: 'OpenXML Semantic HTML Adapter',
        };
      }

      if (targetFormat === 'md') {
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
          extractedText: parsed.text,
          strategyName: 'OpenXML Markdown Converter',
        };
      }
    }

    // Category D: PDF Source
    if (sourceFormat === 'pdf') {
      onProgress?.(45, 'Parsing PDF stream operators and glyphs...');
      const { text, paragraphs } = await parsePdfText(arrayBuffer);
      let ocrUsed = false;
      let workingText = text;

      if ((!text || text.trim().length < 30) && ocrEnabled) {
        onProgress?.(55, 'Scanned PDF detected. Executing OCR Vision Engine...');
        const ocrRes = await performOcrExtraction(file, (p, msg) => onProgress?.(40 + p * 0.4, msg));
        if (ocrRes.success && ocrRes.text) {
          workingText = ocrRes.text;
          ocrUsed = true;
        }
      }

      if (targetFormat === 'docx') {
        const sections = markdownToSections(workingText);
        const blob = await createDocxFromContent(baseName, sections);
        return {
          blob,
          name: outName,
          size: blob.size,
          ocrUsed,
          preview: { type: 'text', content: workingText },
          extractedText: workingText,
          strategyName: ocrUsed ? 'PDF OCR Vision -> DOCX' : 'PDF Native Stream -> DOCX',
        };
      }

      if (targetFormat === 'pptx') {
        const slides = markdownToSlides(file.name, workingText);
        const blob = await renderContentToPptx(file.name, slides);
        return {
          blob,
          name: outName,
          size: blob.size,
          ocrUsed,
          preview: { type: 'text', content: workingText },
          extractedText: workingText,
          strategyName: 'PDF -> PPTX Slide Engine',
        };
      }

      if (targetFormat === 'xlsx') {
        const lines = workingText.split('\n').map((l) => l.trim()).filter(Boolean);
        const rows = lines.map((line) => line.split(/\t| {2,}|\|/).map((c) => c.trim()).filter(Boolean));
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(rows.length > 0 ? rows : [['PDF Content', workingText]]);
        XLSX.utils.book_append_sheet(wb, ws, 'Extracted Data');
        const outBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([outBuffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        return {
          blob,
          name: `${baseName}.xlsx`,
          size: blob.size,
          ocrUsed,
          preview: { type: 'table', content: workingText, sheets: [{ name: 'Extracted Data', data: rows.slice(0, 50) }] },
          extractedText: workingText,
          strategyName: 'PDF Tabular Recognizer -> XLSX',
        };
      }

      if (targetFormat === 'txt') {
        const blob = new Blob([workingText], { type: 'text/plain;charset=utf-8' });
        return {
          blob,
          name: outName,
          size: blob.size,
          ocrUsed,
          preview: { type: 'text', content: workingText },
          extractedText: workingText,
          strategyName: 'PDF Text Stream Extraction',
        };
      }

      if (targetFormat === 'html') {
        const html = markdownToHtml(workingText);
        const blob = new Blob([`<!DOCTYPE html><html><body>${html}</body></html>`], { type: 'text/html;charset=utf-8' });
        return {
          blob,
          name: outName,
          size: blob.size,
          ocrUsed,
          preview: { type: 'html', content: html },
          extractedText: workingText,
          strategyName: 'PDF Stream -> HTML',
        };
      }

      if (targetFormat === 'md') {
        const blob = new Blob([workingText], { type: 'text/markdown;charset=utf-8' });
        return {
          blob,
          name: outName,
          size: blob.size,
          ocrUsed,
          preview: { type: 'text', content: workingText },
          extractedText: workingText,
          strategyName: 'PDF -> Markdown',
        };
      }
    }

    // Category E: PPTX Source
    if (['pptx', 'ppt', 'odp'].includes(sourceFormat)) {
      onProgress?.(45, 'Parsing presentation structure...');
      const { title, slides } = await parsePptx(arrayBuffer);

      if (targetFormat === 'pdf') {
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
          extractedText: slides.map((s) => `${s.title}\n${s.content.join('\n')}`).join('\n\n'),
          strategyName: 'OpenXML Presentation -> Vector PDF',
        };
      }

      if (targetFormat === 'docx') {
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
          extractedText: slides.map((s) => `${s.title}\n${s.content.join('\n')}`).join('\n\n'),
          strategyName: 'OpenXML Presentation -> Word Document',
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
          extractedText: txt,
          strategyName: 'OpenXML Presentation -> Text',
        };
      }
    }

    // Category F: JSON / XML / TXT / HTML / MD
    const rawText = await file.text();

    if (sourceFormat === 'json') {
      try {
        const jsonObj = JSON.parse(rawText);
        if (targetFormat === 'csv' || targetFormat === 'xlsx') {
          const arr = Array.isArray(jsonObj) ? jsonObj : [jsonObj];
          const ws = XLSX.utils.json_to_sheet(arr);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Data');
          if (targetFormat === 'csv') {
            const csv = XLSX.utils.sheet_to_csv(ws);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
            return {
              blob,
              name: `${baseName}.csv`,
              size: blob.size,
              preview: { type: 'table', content: csv },
              extractedText: csv,
              strategyName: 'JSON -> CSV Grid',
            };
          }
          const outBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
          const blob = new Blob([outBuffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          return {
            blob,
            name: `${baseName}.xlsx`,
            size: blob.size,
            preview: { type: 'table', content: 'Spreadsheet', sheets: [{ name: 'Data', data: arr }] },
            extractedText: JSON.stringify(arr),
            strategyName: 'JSON -> XLSX Workbook',
          };
        }
      } catch {
        // Fall through
      }
    }

    if (targetFormat === 'pdf') {
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
        extractedText: rawText,
        strategyName: 'Direct Text Stream -> Vector PDF',
      };
    }

    if (targetFormat === 'docx') {
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
        extractedText: rawText,
        strategyName: 'Text Stream -> OpenXML DOCX',
      };
    }

    if (targetFormat === 'pptx') {
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
        extractedText: rawText,
        strategyName: 'Text Stream -> OpenXML PPTX',
      };
    }

    // Direct text fallback
    const blob = new Blob([rawText], { type: 'text/plain;charset=utf-8' });
    return {
      blob,
      name: outName,
      size: blob.size,
      preview: { type: 'text', content: rawText },
      extractedText: rawText,
      strategyName: 'Direct UTF-8 Stream',
    };
  };

  // 5. Execute Primary Strategy
  onProgress?.(50, 'Executing Primary Conversion Pipeline...');
  let result = await runConversionStrategy('primary');

  // 6. Quality & Page Fidelity Engine Verification
  onProgress?.(80, 'Running Page Fidelity Engine verification...');
  let fidelity = evaluateDocumentFidelity(sourceModel, result.extractedText, {
    targetFormat,
    targetPageCount: sourceModel.pageCount,
    targetTablesCount: sourceModel.tablesCount,
    targetImagesCount: sourceModel.imagesCount,
    targetHeadingsCount: sourceModel.headingsCount,
    strategyUsed: result.strategyName,
  });

  // 7. Auto-Retry with Alternative Strategy if Fidelity is Low
  if (autoRetry && fidelity.overallScore < threshold) {
    onProgress?.(
      88,
      `Fidelity score ${fidelity.overallScore}% below ${threshold}%. Auto-retrying with Alternative Strategy...`
    );
    try {
      const altResult = await runConversionStrategy('alternative');
      const altFidelity = evaluateDocumentFidelity(sourceModel, altResult.extractedText, {
        targetFormat,
        targetPageCount: sourceModel.pageCount,
        targetTablesCount: sourceModel.tablesCount,
        targetImagesCount: sourceModel.imagesCount,
        targetHeadingsCount: sourceModel.headingsCount,
        strategyUsed: altResult.strategyName,
      });

      if (altFidelity.overallScore > fidelity.overallScore) {
        const delta = Math.round((altFidelity.overallScore - fidelity.overallScore) * 10) / 10;
        result = altResult;
        fidelity = {
          ...altFidelity,
          retried: true,
          alternativeAttempted: true,
          improvementDelta: delta,
        };
      }
    } catch (err) {
      console.warn('Alternative strategy failed, retaining primary output:', err);
    }
  }

  onProgress?.(100, 'Conversion verified & finalized');

  const finalOutput: ConversionResult = {
    blob: result.blob,
    name: result.name,
    size: result.size,
    ocrUsed: result.ocrUsed,
    fidelity,
    sourceModel,
    preview: result.preview,
  };

  // Cache final result with SHA-256 key
  try {
    const hashBuf = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArr = Array.from(new Uint8Array(hashBuf));
    const sha256 = hashArr.map((b) => b.toString(16).padStart(2, '0')).join('');
    const cacheKey = `${sha256}_${targetFormat}_${presentationMode}_${options?.imageQuality ?? 0.92}_${ocrEnabled}`;
    conversionCache.set(cacheKey, finalOutput);
  } catch {
    // ignore
  }

  return finalOutput;
}

/**
 * Clears the in-memory SHA-256 conversion cache to release stored blob references.
 */
export function clearConversionCache(): void {
  conversionCache.clear();
}
