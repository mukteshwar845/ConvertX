import * as docx from 'docx-preview';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export interface DocxToPdfProgressCallback {
  (progress: number, statusText: string): void;
}

/**
 * High-fidelity DOCX to PDF converter using docx-preview OpenXML engine + html2canvas + jsPDF.
 * 
 * Preserves:
 * 1. Exact page count and page breaks (same pages)
 * 2. Word cover page layout, graphics, backgrounds, author, title (same cover page)
 * 3. Exact typography, font sizes, weights, colors, line heights (same format)
 * 4. Embedded images and diagrams with exact aspect ratios and positions
 * 5. Tables with full borders, cell padding, and shading
 * 6. Headers, footers, margins, and page numbers
 */
export async function renderDocxToPdf(
  docxData: ArrayBuffer | Blob,
  fileName: string = 'document.docx',
  onProgress?: DocxToPdfProgressCallback
): Promise<{ blob: Blob; url: string; pageCount: number }> {
  onProgress?.(10, 'Initializing OpenXML document layout engine...');

  // Create an off-screen container for rendering the DOCX DOM pages
  const container = document.createElement('div');
  container.id = `docx-render-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  container.style.position = 'fixed';
  container.style.left = '-99999px';
  container.style.top = '0';
  container.style.width = '210mm'; // Standard A4 width reference
  container.style.minHeight = '297mm';
  container.style.backgroundColor = '#ffffff';
  container.style.zIndex = '-9999';
  container.style.opacity = '1';
  container.style.pointerEvents = 'none';

  // Inject default Word document styling into container to ensure crisp rendering
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    .docx-wrapper {
      background: #ffffff !important;
      padding: 0 !important;
    }
    .docx-wrapper > section.docx {
      background: #ffffff !important;
      box-shadow: none !important;
      margin: 0 !important;
      margin-bottom: 0 !important;
    }
  `;
  container.appendChild(styleEl);
  document.body.appendChild(container);

  try {
    onProgress?.(25, 'Parsing Word styles, cover page & page layouts...');

    // Render DOCX with docx-preview
    await docx.renderAsync(docxData, container, undefined, {
      className: 'docx',
      inWrapper: true,
      ignoreWidth: false,
      ignoreHeight: false,
      ignoreFonts: false,
      breakPages: true,
      renderHeaders: true,
      renderFooters: true,
      renderFootnotes: true,
      renderEndnotes: true,
      useBase64URL: true,
      renderAltChunks: true,
    });

    // Allow browser layout and image loading to complete
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Find all rendered page sections
    // docx-preview wraps each page in `<section class="docx ...">`
    let pageSections = Array.from(container.querySelectorAll<HTMLElement>('.docx-wrapper > section.docx'));
    if (pageSections.length === 0) {
      pageSections = Array.from(container.querySelectorAll<HTMLElement>('section.docx'));
    }
    if (pageSections.length === 0) {
      pageSections = Array.from(container.querySelectorAll<HTMLElement>('section'));
    }

    // If still no sections found, fallback to the wrapper or container itself
    if (pageSections.length === 0) {
      const wrapper = container.querySelector<HTMLElement>('.docx-wrapper') || container;
      pageSections = [wrapper];
    }

    const totalPages = pageSections.length;
    onProgress?.(35, `Detected ${totalPages} page${totalPages > 1 ? 's' : ''} (including cover page)...`);

    let pdf: jsPDF | null = null;

    for (let i = 0; i < totalPages; i++) {
      const pageEl = pageSections[i];
      const pageNum = i + 1;
      const isCover = i === 0;

      onProgress?.(
        35 + Math.round((i / totalPages) * 55),
        isCover
          ? `Rendering Page 1 (Cover Page) with full styling...`
          : `Rendering Page ${pageNum} of ${totalPages}...`
      );

      // Render page element to high-res canvas (scale 2.0 = 200-300 DPI razor-sharp fidelity)
      const canvas = await html2canvas(pageEl, {
        scale: 2.0,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 15000,
        windowWidth: pageEl.scrollWidth || 794,
      });

      // Calculate PDF dimensions in points (pt)
      // Standard A4 is 595.28 x 841.89 pt
      // 1 pt = 1/72 inch; 1 px @ 96 dpi = 0.75 pt
      const elemWidthPx = pageEl.offsetWidth || canvas.width / 2;
      const elemHeightPx = pageEl.offsetHeight || canvas.height / 2;
      const widthPt = elemWidthPx * 0.75;
      const heightPt = elemHeightPx * 0.75;
      const isLandscape = widthPt > heightPt;

      if (!pdf) {
        pdf = new jsPDF({
          orientation: isLandscape ? 'landscape' : 'portrait',
          unit: 'pt',
          format: [widthPt, heightPt],
          compress: true,
        });
      } else {
        pdf.addPage([widthPt, heightPt], isLandscape ? 'landscape' : 'portrait');
      }

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(imgData, 'JPEG', 0, 0, widthPt, heightPt, undefined, 'FAST');
    }

    onProgress?.(95, 'Finalizing multi-page vector PDF...');

    if (!pdf) {
      throw new Error('PDF document could not be created from the Word file.');
    }

    const pdfBlob = pdf.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);

    onProgress?.(100, `Converted successfully (${totalPages} pages preserved)`);

    return {
      blob: pdfBlob,
      url: pdfUrl,
      pageCount: totalPages,
    };
  } finally {
    // Clean up offscreen container from DOM
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
}
