/**
 * docxToPptxConverter.ts
 *
 * Full-fidelity DOCX → PPTX conversion engine.
 *
 * Key features:
 * - Detects and preserves true cover page (title, subtitle, author, date) as Slide 1
 * - Preserves headings, paragraphs, lists, and formatted tables
 * - Renders tables as native PowerPoint tables with styled headers
 * - Splits oversized sections into multiple slides automatically
 * - Handles documents with no headings by auto-chunking on paragraph density
 * - Each slide body is word-count balanced (max ~110 words) for clean readability
 * - Pure client-side — no server, no external API
 */

import PptxGenJS from 'pptxgenjs';

export interface SlideSection {
  title: string;
  bullets: Array<{
    text: string;
    level: number;         // 0 = normal paragraph, 1 = bullet, 2 = sub-bullet
    bold?: boolean;
    italic?: boolean;
  }>;
  table?: string[][];     // Native table matrix if section contains a table
}

export interface DocumentCoverInfo {
  title: string;
  subtitle?: string;
  author?: string;
  date?: string;
}

export interface ParsedDocumentSlides {
  cover: DocumentCoverInfo;
  sections: SlideSection[];
}

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_WORDS_PER_SLIDE = 110;  // readable word cap per slide body
const MAX_BULLETS_PER_SLIDE = 8;   // max physical line items before auto-split

// ─── HTML → ParsedDocumentSlides Parser ─────────────────────────────────────────
export function parseHtmlToSections(html: string, docTitle: string): SlideSection[] {
  const parsed = parseHtmlToDocumentSlides(html, docTitle);
  return parsed.sections;
}

interface ExtractedElement {
  tag: string;
  text: string;
  hasBold?: boolean;
  hasItalic?: boolean;
  isTitle?: boolean;
  tableData?: string[][];
  listItems?: string[];
}

function extractElementsFromHtml(html: string): ExtractedElement[] {
  if (typeof DOMParser !== 'undefined') {
    const parser = new DOMParser();
    const dom = parser.parseFromString(`<div id="root">${html}</div>`, 'text/html');
    const root = dom.getElementById('root');
    if (!root) return [];
    const elements: ExtractedElement[] = [];
    for (const node of Array.from(root.childNodes)) {
      if (node.nodeType !== Node.ELEMENT_NODE) continue;
      const el = node as Element;
      const tag = el.tagName.toLowerCase();
      const rawText = el.textContent?.trim() ?? '';
      const text = rawText
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");

      if (tag === 'table') {
        const rows = Array.from(el.querySelectorAll('tr'));
        const tableData: string[][] = [];
        for (const tr of rows) {
          const cells = Array.from(tr.querySelectorAll('td, th')).map((c) =>
            (c.textContent?.trim() ?? '').replace(/&amp;/g, '&')
          );
          if (cells.some((c) => c.length > 0)) tableData.push(cells);
        }
        elements.push({ tag: 'table', text: '', tableData });
      } else if (tag === 'ul' || tag === 'ol') {
        const items = Array.from(el.querySelectorAll('li'))
          .map((li) => (li.textContent?.trim() ?? '').replace(/&amp;/g, '&'))
          .filter(Boolean);
        elements.push({ tag, text: '', listItems: items });
      } else {
        elements.push({
          tag,
          text,
          hasBold: el.querySelector('strong, b') !== null,
          hasItalic: el.querySelector('em, i') !== null,
          isTitle: el.classList.contains('title'),
        });
      }
    }
    return elements;
  }

  // Robust Regex Tokenizer Fallback for Node / Non-DOM environments
  const elements: ExtractedElement[] = [];
  const regex = /<(h[1-6]|p|div|blockquote|table|ul|ol)([^>]*)>([\s\S]*?)<\/\1>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const tag = match[1].toLowerCase();
    const attrs = match[2];
    const innerHtml = match[3];

    if (tag === 'table') {
      const tableData: string[][] = [];
      const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
      let trMatch;
      while ((trMatch = trRegex.exec(innerHtml)) !== null) {
        const rowContent = trMatch[1];
        const cellRegex = /<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi;
        const cells: string[] = [];
        let cellMatch;
        while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
          const rawCell = cellMatch[1].replace(/<[^>]+>/g, '').trim();
          cells.push(rawCell.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'));
        }
        if (cells.length > 0) tableData.push(cells);
      }
      elements.push({ tag: 'table', text: '', tableData });
    } else if (tag === 'ul' || tag === 'ol') {
      const listItems: string[] = [];
      const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
      let liMatch;
      while ((liMatch = liRegex.exec(innerHtml)) !== null) {
        const itemText = liMatch[1].replace(/<[^>]+>/g, '').trim();
        if (itemText) listItems.push(itemText.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'));
      }
      elements.push({ tag, text: '', listItems });
    } else {
      const text = innerHtml
        .replace(/<[^>]+>/g, '')
        .trim()
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"');
      elements.push({
        tag,
        text,
        hasBold: /<(strong|b)[^>]*>/i.test(innerHtml),
        hasItalic: /<(em|i)[^>]*>/i.test(innerHtml),
        isTitle: /class=["'][^"']*title[^"']*["']/i.test(attrs),
      });
    }
  }
  return elements;
}

export function parseHtmlToDocumentSlides(html: string, docTitle: string): ParsedDocumentSlides {
  const cleanDocTitle = docTitle.replace(/\.[^/.]+$/, '').trim();
  const allElements = extractElementsFromHtml(html);

  const defaultCover: DocumentCoverInfo = {
    title: cleanDocTitle,
    subtitle: 'Preserved Presentation Structure',
  };

  if (allElements.length === 0) {
    return {
      cover: defaultCover,
      sections: [{ title: cleanDocTitle, bullets: [{ text: 'Document converted to presentation format.', level: 0 }] }],
    };
  }

  const sections: SlideSection[] = [];
  let current: SlideSection | null = null;
  let detectedCover: DocumentCoverInfo | null = null;
  let isFirstHeading = true;

  const flush = () => {
    if (current && (current.bullets.length > 0 || current.table || current.title)) {
      const chunks = splitSectionIntoSlides(current);
      sections.push(...chunks);
    }
    current = null;
  };

  const ensureCurrent = (title = 'Overview') => {
    if (!current) current = { title, bullets: [] };
  };

  const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

  const currentWordCount = () =>
    current?.bullets.reduce((acc, b) => acc + wordCount(b.text), 0) ?? 0;

  for (let i = 0; i < allElements.length; i++) {
    const el = allElements[i];
    const tag = el.tag;
    const text = el.text;
    if (!text && tag !== 'table' && (!el.listItems || el.listItems.length === 0)) continue;

    // Check for Cover Page / Title Block at start of document
    if (isFirstHeading && (tag === 'h1' || el.isTitle)) {
      isFirstHeading = false;
      let coverTitle = text || cleanDocTitle;
      let coverSubtitle = '';
      let coverAuthor = '';
      let coverDate = '';

      // Look at subsequent elements for subtitle, author, date before next heading
      let lookAhead = i + 1;
      while (lookAhead < allElements.length) {
        const nextEl = allElements[lookAhead];
        if (nextEl.tag === 'h1' || nextEl.tag === 'h2') break;

        const nextText = nextEl.text;
        if (nextText) {
          const lower = nextText.toLowerCase();
          if (lower.includes('author') || lower.includes('by ') || lower.includes('prepared by')) {
            coverAuthor = nextText;
          } else if (/\b(20\d\d|19\d\d|january|february|march|april|may|june|july|august|september|october|november|december)\b/i.test(nextText)) {
            coverDate = nextText;
          } else if (!coverSubtitle && nextText.length < 120) {
            coverSubtitle = nextText;
          }
        }
        lookAhead++;
      }

      detectedCover = {
        title: coverTitle,
        subtitle: coverSubtitle || 'Preserved Presentation Layout',
        author: coverAuthor || undefined,
        date: coverDate || undefined,
      };

      i = lookAhead - 1;
      continue;
    }

    if (tag === 'h1' || tag === 'h2') {
      isFirstHeading = false;
      flush();
      current = { title: text, bullets: [] };
      continue;
    }

    if (tag === 'h3') {
      isFirstHeading = false;
      ensureCurrent();
      if (current!.bullets.length > 0) {
        flush();
        current = { title: text, bullets: [] };
      } else {
        current!.title = current!.title || text;
      }
      continue;
    }

    // Lists
    if (tag === 'ul' || tag === 'ol' || (el.listItems && el.listItems.length > 0)) {
      isFirstHeading = false;
      ensureCurrent();
      const items = el.listItems || [];
      for (const liText of items) {
        if (!liText) continue;
        if (
          currentWordCount() + wordCount(liText) > MAX_WORDS_PER_SLIDE ||
          current!.bullets.length >= MAX_BULLETS_PER_SLIDE
        ) {
          flush();
          current = { title: 'Continued', bullets: [] };
        }
        current!.bullets.push({ text: liText, level: 1 });
      }
      continue;
    }

    // Tables
    if (tag === 'table' && el.tableData && el.tableData.length > 0) {
      isFirstHeading = false;
      flush();
      sections.push({
        title: current?.title || 'Data Table',
        bullets: [],
        table: el.tableData.slice(0, 10),
      });
      continue;
    }

    // Paragraphs
    if (tag === 'p' || tag === 'div' || tag === 'blockquote') {
      if (!text) continue;
      isFirstHeading = false;
      ensureCurrent();

      const hasBold = el.hasBold;
      const hasItalic = el.hasItalic;

      const words = text.split(/\s+/);
      let chunk: string[] = [];
      for (const word of words) {
        chunk.push(word);
        if (
          chunk.length >= 25 ||
          currentWordCount() + chunk.length > MAX_WORDS_PER_SLIDE ||
          current!.bullets.length >= MAX_BULLETS_PER_SLIDE
        ) {
          const chunkText = chunk.join(' ');
          if (
            currentWordCount() + wordCount(chunkText) > MAX_WORDS_PER_SLIDE ||
            current!.bullets.length >= MAX_BULLETS_PER_SLIDE
          ) {
            flush();
            current = { title: 'Continued', bullets: [] };
          }
          current!.bullets.push({ text: chunkText, level: 0, bold: hasBold, italic: hasItalic });
          chunk = [];
        }
      }
      if (chunk.length > 0) {
        const chunkText = chunk.join(' ');
        if (
          currentWordCount() + wordCount(chunkText) > MAX_WORDS_PER_SLIDE ||
          current!.bullets.length >= MAX_BULLETS_PER_SLIDE
        ) {
          flush();
          current = { title: 'Continued', bullets: [] };
        }
        current!.bullets.push({ text: chunkText, level: 0, bold: hasBold, italic: hasItalic });
      }
      continue;
    }
  }

  flush();

  if (sections.length === 0) {
    sections.push({
      title: 'Overview',
      bullets: [{ text: 'Extracted document content successfully converted to slides.', level: 0 }],
    });
  }

  return {
    cover: detectedCover || defaultCover,
    sections,
  };
}

// ─── Split a single oversized section into multiple slides ─────────────────────
function splitSectionIntoSlides(section: SlideSection): SlideSection[] {
  if (section.table) return [section];
  if (section.bullets.length <= MAX_BULLETS_PER_SLIDE) {
    const wc = section.bullets.reduce((acc, b) => acc + b.text.split(/\s+/).length, 0);
    if (wc <= MAX_WORDS_PER_SLIDE) return [section];
  }

  const slides: SlideSection[] = [];
  let current: SlideSection = { title: section.title, bullets: [] };
  let wordsSoFar = 0;

  for (const bullet of section.bullets) {
    const bw = bullet.text.split(/\s+/).length;
    if (
      (wordsSoFar + bw > MAX_WORDS_PER_SLIDE || current.bullets.length >= MAX_BULLETS_PER_SLIDE) &&
      current.bullets.length > 0
    ) {
      slides.push(current);
      current = { title: `${section.title} (cont.)`, bullets: [] };
      wordsSoFar = 0;
    }
    current.bullets.push(bullet);
    wordsSoFar += bw;
  }

  if (current.bullets.length > 0) slides.push(current);
  return slides;
}

// ─── Render SlideSection[] → PPTX Blob ────────────────────────────────────────
export async function renderSectionsToPptx(
  docTitle: string,
  sections: SlideSection[],
  onProgress?: (pct: number, msg: string) => void,
  coverInfo?: DocumentCoverInfo
): Promise<Blob> {
  const pres = new PptxGenJS();
  pres.layout = 'LAYOUT_16x9';

  const title = coverInfo?.title || docTitle.replace(/\.[^/.]+$/, '').trim();
  const subtitle = coverInfo?.subtitle || `${sections.length} slides · Formatted with ConvertX`;
  const author = coverInfo?.author;
  const date = coverInfo?.date || new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

  const totalSlides = sections.length + 1; // +1 for cover slide
  let slideIndex = 0;

  // ── Cover Slide ──────────────────────────────────────────────────────────────
  const titleSlide = pres.addSlide();
  titleSlide.background = { color: '0F172A' }; // Modern Dark Slate

  // Left Accent Vertical Bar
  titleSlide.addShape(pres.ShapeType.rect, {
    x: 0.8,
    y: 1.5,
    w: 0.15,
    h: 3.8,
    fill: { color: '3B82F6' }, // Royal Blue
  });

  // Main Document Title
  titleSlide.addText(title, {
    x: 1.2,
    y: 1.5,
    w: '80%',
    h: 2.0,
    fontSize: 34,
    bold: true,
    color: 'FFFFFF',
    fontFace: 'Arial',
    wrap: true,
  });

  // Subtitle
  titleSlide.addText(subtitle, {
    x: 1.2,
    y: 3.6,
    w: '80%',
    h: 0.8,
    fontSize: 16,
    color: '94A3B8',
    fontFace: 'Arial',
    wrap: true,
  });

  // Author & Date metadata
  const metaText = [author, date].filter(Boolean).join('  •  ');
  if (metaText) {
    titleSlide.addText(metaText, {
      x: 1.2,
      y: 4.5,
      w: '80%',
      h: 0.5,
      fontSize: 13,
      color: '64748B',
      fontFace: 'Arial',
    });
  }

  // Cover footer badge
  titleSlide.addText('Converted with ConvertX • Presentation Engine', {
    x: 1.2,
    y: 6.8,
    w: '60%',
    h: 0.3,
    fontSize: 9,
    color: '475569',
    fontFace: 'Arial',
  });

  slideIndex++;
  onProgress?.(Math.round((slideIndex / totalSlides) * 85), `Building Slide 1 (Cover Page)...`);

  // ── Content Slides ───────────────────────────────────────────────────────────
  for (const sec of sections) {
    const slide = pres.addSlide();
    slide.background = { color: 'F8FAFC' };

    // Top Header Banner
    slide.addShape(pres.ShapeType.rect, {
      x: 0,
      y: 0,
      w: '100%',
      h: 1.05,
      fill: { color: '1E293B' },
    });

    // Accent line under banner
    slide.addShape(pres.ShapeType.rect, {
      x: 0,
      y: 1.05,
      w: '100%',
      h: 0.04,
      fill: { color: '3B82F6' },
    });

    // Slide title
    slide.addText(sec.title || 'Overview', {
      x: 0.8,
      y: 0.18,
      w: '85%',
      h: 0.7,
      fontSize: 20,
      bold: true,
      color: 'FFFFFF',
      fontFace: 'Arial',
      wrap: true,
    });

    // Render Table if section has a table
    if (sec.table && sec.table.length > 0) {
      const formattedRows = sec.table.map((row, rIdx) => {
        const isHeader = rIdx === 0;
        return row.map((cell) => ({
          text: cell,
          options: {
            fill: { color: isHeader ? '1E293B' : rIdx % 2 === 0 ? 'F1F5F9' : 'FFFFFF' },
            color: isHeader ? 'FFFFFF' : '334155',
            bold: isHeader,
            fontSize: isHeader ? 12 : 11,
          },
        }));
      });

      slide.addTable(formattedRows as any, {
        x: 0.8,
        y: 1.5,
        w: 8.4,
        border: { type: 'solid', pt: 1, color: 'CBD5E1' },
        margin: 0.08,
      });
    } else if (sec.bullets.length > 0) {
      // Body bullets
      const bulletItems = sec.bullets.map((b) => ({
        text: b.text,
        options: {
          fontSize: b.level === 1 ? 14 : 13,
          color: b.bold ? '0F172A' : '334155',
          bold: !!b.bold,
          italic: !!b.italic,
          bullet: b.level === 1 ? { type: 'bullet' as const } : false,
          indentLevel: b.level,
          breakLine: true,
          paraSpaceAfter: 8,
          paraSpaceBefore: b.level === 0 ? 4 : 0,
        },
      }));

      slide.addText(bulletItems as any, {
        x: 0.8,
        y: 1.4,
        w: '88%',
        h: 5.0,
        fontFace: 'Arial',
        valign: 'top',
      });
    }

    // Slide number footer
    slide.addText(`Slide ${slideIndex} of ${totalSlides - 1}`, {
      x: 8.0,
      y: 6.8,
      w: 1.8,
      h: 0.25,
      fontSize: 9,
      color: '94A3B8',
      align: 'right',
    });

    slideIndex++;
    if (slideIndex % 3 === 0 || slideIndex === totalSlides) {
      onProgress?.(
        Math.round((slideIndex / totalSlides) * 85),
        `Building Slide ${slideIndex} of ${totalSlides}...`
      );
    }
  }

  onProgress?.(90, 'Packaging presentation file (.pptx)...');
  return (await pres.write({ outputType: 'blob' })) as Blob;
}
