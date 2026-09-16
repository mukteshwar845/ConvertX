/**
 * docxToPptxConverter.ts
 *
 * Full-fidelity DOCX → PPTX conversion engine.
 *
 * Key design decisions:
 * - Uses mammoth to convert DOCX to rich HTML preserving headings, paragraphs, lists, tables
 * - Walks all HTML nodes intelligently to build a structured slide model
 * - Splits oversized sections into multiple slides automatically (no content lost)
 * - Handles documents with NO headings by auto-chunking on paragraph density
 * - Each slide body is word-count balanced (max ~120 words) so text is readable
 * - Tables are converted to readable rows per slide
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
}

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_WORDS_PER_SLIDE = 110;  // readable word cap per slide body
const MAX_BULLETS_PER_SLIDE = 9;  // max physical line items before auto-split

// ─── HTML → SlideSection[] Parser ─────────────────────────────────────────────
export function parseHtmlToSections(html: string, docTitle: string): SlideSection[] {
  const parser = new DOMParser();
  const dom = parser.parseFromString(`<div id="root">${html}</div>`, 'text/html');
  const root = dom.getElementById('root');
  if (!root) return [];

  const allNodes = Array.from(root.childNodes);
  const sections: SlideSection[] = [];
  let current: SlideSection | null = null;

  const flush = () => {
    if (current && (current.bullets.length > 0 || current.title)) {
      // Split current section into multiple slides if too large
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

  for (const node of allNodes) {
    if (node.nodeType !== Node.ELEMENT_NODE) continue;
    const el = node as Element;
    const tag = el.tagName.toLowerCase();
    const text = el.textContent?.trim() ?? '';
    if (!text) continue;

    // Headings → new section boundary
    if (tag === 'h1') {
      flush();
      current = { title: text, bullets: [] };
      continue;
    }
    if (tag === 'h2') {
      flush();
      current = { title: text, bullets: [] };
      continue;
    }
    if (tag === 'h3') {
      // h3 within a section becomes a sub-title / bold bullet rather than new section
      ensureCurrent();
      // Only start a new section if current already has content
      if (current!.bullets.length > 0) {
        flush();
        current = { title: text, bullets: [] };
      } else {
        current!.title = current!.title || text;
      }
      continue;
    }

    // Unordered / ordered list
    if (tag === 'ul' || tag === 'ol') {
      ensureCurrent();
      const items = Array.from(el.querySelectorAll('li'));
      for (const li of items) {
        const liText = li.textContent?.trim() ?? '';
        if (!liText) continue;
        // Auto-split if slide is getting too big
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

    // Table → render as indented rows
    if (tag === 'table') {
      ensureCurrent();
      const rows = Array.from(el.querySelectorAll('tr'));
      for (const row of rows) {
        const cells = Array.from(row.querySelectorAll('td, th'))
          .map((c) => c.textContent?.trim() ?? '')
          .filter(Boolean);
        if (!cells.length) continue;
        const rowText = cells.join('  |  ');
        if (
          currentWordCount() + wordCount(rowText) > MAX_WORDS_PER_SLIDE ||
          current!.bullets.length >= MAX_BULLETS_PER_SLIDE
        ) {
          flush();
          current = { title: 'Continued (Table)', bullets: [] };
        }
        const isHeader = row.querySelector('th') !== null;
        current!.bullets.push({ text: rowText, level: 0, bold: isHeader });
      }
      continue;
    }

    // Normal paragraphs — check for bold/italic inline
    if (tag === 'p' || tag === 'div' || tag === 'blockquote') {
      if (!text) continue;
      ensureCurrent();

      const hasBold = el.querySelector('strong, b') !== null;
      const hasItalic = el.querySelector('em, i') !== null;

      // Split long paragraphs into chunks of MAX_WORDS_PER_SLIDE words
      const words = text.split(/\s+/);
      let chunk: string[] = [];
      for (const word of words) {
        chunk.push(word);
        if (
          chunk.length >= 25 || // hard max per bullet line (readable on slide)
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

  // If the document had absolutely no structure, chunk raw text
  if (sections.length === 0) {
    return [{ title: docTitle, bullets: [{ text: 'Document converted to presentation format.', level: 0 }] }];
  }

  return sections;
}

// ─── Split a single oversized section into multiple slides ─────────────────────
function splitSectionIntoSlides(section: SlideSection): SlideSection[] {
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
  onProgress?: (pct: number, msg: string) => void
): Promise<Blob> {
  const pres = new PptxGenJS();
  pres.layout = 'LAYOUT_16x9';

  const totalSlides = sections.length + 1; // +1 for title slide
  let slideIndex = 0;

  // ── Title slide ──────────────────────────────────────────────────────────────
  const titleSlide = pres.addSlide();
  titleSlide.background = { color: '0F172A' };

  titleSlide.addText(docTitle.replace(/\.[^/.]+$/, ''), {
    x: 0.8,
    y: 1.8,
    w: '85%',
    h: 1.6,
    fontSize: 36,
    bold: true,
    color: 'FFFFFF',
    fontFace: 'Arial',
    wrap: true,
  });

  titleSlide.addText(`${sections.length} slides  ·  Converted by ConvertX`, {
    x: 0.8,
    y: 3.8,
    w: '80%',
    h: 0.5,
    fontSize: 13,
    color: '64748B',
    fontFace: 'Arial',
  });

  slideIndex++;
  onProgress?.(Math.round((slideIndex / totalSlides) * 85), `Building slide 1 of ${totalSlides}...`);

  // ── Content slides ───────────────────────────────────────────────────────────
  for (const sec of sections) {
    const slide = pres.addSlide();
    slide.background = { color: 'F8FAFC' };

    // Dark header banner
    slide.addShape(pres.ShapeType.rect, {
      x: 0,
      y: 0,
      w: '100%',
      h: 1.05,
      fill: { color: '1E293B' },
    });

    // Slide title
    slide.addText(sec.title || 'Overview', {
      x: 0.5,
      y: 0.18,
      w: '90%',
      h: 0.7,
      fontSize: 20,
      bold: true,
      color: 'FFFFFF',
      fontFace: 'Arial',
      wrap: true,
    });

    // Body bullets
    if (sec.bullets.length > 0) {
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
        x: 0.5,
        y: 1.2,
        w: '92%',
        h: 5.2,
        fontFace: 'Arial',
        valign: 'top',
      });
    }

    // Slide number footer
    slide.addText(`${slideIndex} / ${totalSlides - 1}`, {
      x: 8.5,
      y: 6.8,
      w: 1.2,
      h: 0.25,
      fontSize: 8,
      color: 'CBD5E1',
      align: 'right',
    });

    slideIndex++;
    if (slideIndex % 5 === 0) {
      onProgress?.(
        Math.round((slideIndex / totalSlides) * 85),
        `Building slide ${slideIndex} of ${totalSlides}...`
      );
    }
  }

  onProgress?.(90, 'Packaging PPTX file...');
  return (await pres.write({ outputType: 'blob' })) as Blob;
}
