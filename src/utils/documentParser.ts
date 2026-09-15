import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import JSZip from 'jszip';
import { SupportedFormat, InternalDocumentModel, DocumentElement } from '../types';
import { parsePdfText } from './conversionEngine';

/**
 * Universal Document Parser
 * Parses diverse file types into the standardized Internal Document Model (IDM)
 */
export async function parseDocumentToIDM(
  file: File,
  format: SupportedFormat,
  signature: string
): Promise<InternalDocumentModel> {
  const arrayBuffer = await file.arrayBuffer();

  const baseModel: InternalDocumentModel = {
    title: file.name.replace(/\.[^.]+$/, ''),
    elements: [],
    pageCount: 1,
    wordCount: 0,
    characterCount: 0,
    tablesCount: 0,
    imagesCount: 0,
    headingsCount: 0,
    rawText: '',
    sourceFormat: format,
    detectedSignature: signature,
  };

  try {
    // 1. DOCX Parser (Mammoth + JSZip OpenXML inspection)
    if (format === 'docx' || format === 'doc') {
      try {
        const mammothResult = await mammoth.convertToHtml({ arrayBuffer });
        const html = mammothResult.value;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        const elements: DocumentElement[] = [];
        let runningText = '';

        Array.from(tempDiv.children).forEach((node, idx) => {
          const tag = node.tagName.toLowerCase();
          const text = (node.textContent || '').trim();
          if (!text && tag !== 'img' && tag !== 'table') return;

          runningText += text + '\n\n';

          if (tag === 'h1') {
            elements.push({ id: `elem-${idx}`, type: 'heading', level: 1, text, bold: true });
          } else if (tag === 'h2') {
            elements.push({ id: `elem-${idx}`, type: 'heading', level: 2, text, bold: true });
          } else if (tag === 'h3') {
            elements.push({ id: `elem-${idx}`, type: 'heading', level: 3, text, bold: true });
          } else if (tag === 'ul' || tag === 'ol') {
            Array.from(node.children).forEach((li, lIdx) => {
              elements.push({
                id: `elem-${idx}-${lIdx}`,
                type: tag === 'ul' ? 'bullet' : 'numbered',
                text: li.textContent || '',
              });
            });
          } else if (tag === 'table') {
            const rows: string[][] = [];
            let headers: string[] = [];
            Array.from(node.querySelectorAll('tr')).forEach((tr, rIdx) => {
              const cells = Array.from(tr.querySelectorAll('td, th')).map((c) => (c.textContent || '').trim());
              if (rIdx === 0 && tr.querySelector('th')) {
                headers = cells;
              } else {
                rows.push(cells);
              }
            });
            elements.push({ id: `elem-${idx}`, type: 'table', headers, rows });
          } else {
            elements.push({
              id: `elem-${idx}`,
              type: 'paragraph',
              text,
              bold: !!node.querySelector('strong, b'),
              italic: !!node.querySelector('em, i'),
            });
          }
        });

        // Check if there were images in the docx
        let docxImageCount = 0;
        try {
          const zip = await JSZip.loadAsync(arrayBuffer);
          const mediaFiles = Object.keys(zip.files).filter((k) => k.startsWith('word/media/'));
          docxImageCount = mediaFiles.length;
        } catch {
          // ignore zip media check
        }

        const raw = runningText.trim();
        const words = raw ? raw.split(/\s+/).filter(Boolean).length : 0;
        return {
          ...baseModel,
          elements,
          rawText: raw,
          wordCount: words,
          characterCount: raw.length,
          headingsCount: elements.filter((e) => e.type === 'heading').length,
          tablesCount: elements.filter((e) => e.type === 'table').length,
          imagesCount: docxImageCount,
          pageCount: Math.max(1, Math.ceil(words / 350)),
        };
      } catch (err) {
        console.warn('Mammoth parse failed, falling back to raw text:', err);
      }
    }

    // 2. SPREADSHEETS (XLSX, XLS, CSV, ODS)
    if (format === 'xlsx' || format === 'xls' || format === 'csv' || format === 'ods') {
      const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true, cellStyles: true });
      const sheets: Array<{ name: string; data: (string | number)[][]; headers?: string[]; rowCount: number; colCount: number }> = [];
      const elements: DocumentElement[] = [];
      let fullText = '';
      let totalRows = 0;

      workbook.SheetNames.forEach((sheetName, sIdx) => {
        const worksheet = workbook.Sheets[sheetName];
        const rawJson: (string | number)[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const headers = rawJson.length > 0 ? rawJson[0].map((v) => String(v ?? '')) : [];
        const rows = rawJson.slice(1).map((row) => row.map((v) => String(v ?? '')));

        totalRows += rawJson.length;

        sheets.push({
          name: sheetName,
          data: rawJson,
          headers,
          rowCount: rawJson.length,
          colCount: headers.length,
        });

        elements.push({
          id: `sheet-${sIdx}`,
          type: 'heading',
          level: 2,
          text: `Sheet: ${sheetName}`,
        });

        elements.push({
          id: `table-sheet-${sIdx}`,
          type: 'table',
          sheetName,
          headers,
          rows: rows.slice(0, 100), // Cap representative sample for IDM
        });

        rawJson.forEach((r) => {
          fullText += r.join(' | ') + '\n';
        });
      });

      const words = fullText.split(/\s+/).filter(Boolean).length;
      return {
        ...baseModel,
        elements,
        sheets,
        tablesCount: sheets.length,
        rawText: fullText.trim(),
        wordCount: words,
        characterCount: fullText.length,
        headingsCount: sheets.length,
        pageCount: Math.max(1, Math.ceil(totalRows / 40)),
      };
    }

    // 3. PRESENTATIONS (PPTX)
    if (format === 'pptx') {
      try {
        const zip = await JSZip.loadAsync(arrayBuffer);
        const slideFiles = Object.keys(zip.files)
          .filter((k) => k.match(/ppt\/slides\/slide\d+\.xml$/))
          .sort((a, b) => {
            const numA = parseInt(a.match(/slide(\d+)\.xml/)?.[1] || '0', 10);
            const numB = parseInt(b.match(/slide(\d+)\.xml/)?.[1] || '0', 10);
            return numA - numB;
          });

        const elements: DocumentElement[] = [];
        let slideText = '';

        for (let i = 0; i < slideFiles.length; i++) {
          const xml = await zip.file(slideFiles[i])?.async('string');
          if (xml) {
            const matches = xml.match(/<a:t[^>]*>(.*?)<\/a:t>/g) || [];
            const textLines = matches.map((m) => m.replace(/<[^>]+>/g, '').trim()).filter(Boolean);

            if (textLines.length > 0) {
              elements.push({
                id: `slide-${i}-title`,
                type: 'heading',
                level: 2,
                text: textLines[0],
                pageIndex: i + 1,
              });
              textLines.slice(1).forEach((line, lIdx) => {
                elements.push({
                  id: `slide-${i}-bullet-${lIdx}`,
                  type: 'bullet',
                  text: line,
                  pageIndex: i + 1,
                });
              });
              slideText += textLines.join('\n') + '\n\n';
            }
          }
        }

        const words = slideText.split(/\s+/).filter(Boolean).length;
        return {
          ...baseModel,
          elements,
          rawText: slideText.trim(),
          wordCount: words,
          characterCount: slideText.length,
          headingsCount: slideFiles.length,
          pageCount: Math.max(1, slideFiles.length),
        };
      } catch (err) {
        console.warn('PPTX parsing fallback:', err);
      }
    }

    // 4. PDF
    if (format === 'pdf') {
      const { text, paragraphs } = await parsePdfText(arrayBuffer);
      const elements: DocumentElement[] = paragraphs.map((p, idx) => ({
        id: `pdf-elem-${idx}`,
        type: idx === 0 ? 'heading' : 'paragraph',
        level: idx === 0 ? 1 : undefined,
        text: p,
      }));

      const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
      return {
        ...baseModel,
        elements,
        rawText: text,
        wordCount: words,
        characterCount: text.length,
        headingsCount: elements.filter((e) => e.type === 'heading').length,
        pageCount: Math.max(1, Math.ceil(words / 400)),
      };
    }

    // 5. IMAGES
    if (['png', 'jpg', 'webp', 'svg', 'bmp', 'gif', 'tiff'].includes(format)) {
      const elements: DocumentElement[] = [
        {
          id: 'img-1',
          type: 'image',
          caption: file.name,
        },
      ];
      return {
        ...baseModel,
        elements,
        imagesCount: 1,
        pageCount: 1,
        rawText: `[Image: ${file.name}, ${(file.size / 1024).toFixed(1)} KB]`,
      };
    }

    // 6. TEXT / HTML / MD / JSON / XML
    const textContent = await file.text();
    const lines = textContent.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

    const elements: DocumentElement[] = lines.slice(0, 300).map((line, idx) => {
      if (line.startsWith('# ')) return { id: `line-${idx}`, type: 'heading', level: 1, text: line.replace(/^#\s+/, '') };
      if (line.startsWith('## ')) return { id: `line-${idx}`, type: 'heading', level: 2, text: line.replace(/^##\s+/, '') };
      if (line.startsWith('### ')) return { id: `line-${idx}`, type: 'heading', level: 3, text: line.replace(/^###\s+/, '') };
      if (line.startsWith('- ') || line.startsWith('* ')) return { id: `line-${idx}`, type: 'bullet', text: line.replace(/^[-*]\s+/, '') };
      return { id: `line-${idx}`, type: 'paragraph', text: line };
    });

    const words = textContent.split(/\s+/).filter(Boolean).length;
    return {
      ...baseModel,
      elements,
      rawText: textContent,
      wordCount: words,
      characterCount: textContent.length,
      headingsCount: elements.filter((e) => e.type === 'heading').length,
      pageCount: Math.max(1, Math.ceil(words / 450)),
    };
  } catch (err) {
    console.error('Error generating Internal Document Model:', err);
    return baseModel;
  }
}
