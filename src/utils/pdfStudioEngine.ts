/**
 * PDF Studio Processing Engine
 * 100% Client-Side PDF manipulations powered by pdf-lib
 */
import { PDFDocument, degrees, rgb, StandardFonts, RGB } from 'pdf-lib';

export interface PdfMetadataInfo {
  pageCount: number;
  title?: string;
  author?: string;
  subject?: string;
  creator?: string;
  producer?: string;
  creationDate?: Date;
  modificationDate?: Date;
  fileSizeBytes: number;
}

export interface WatermarkOptions {
  text: string;
  opacity: number; // 0.1 to 1.0
  fontSize: number; // e.g. 48
  colorHex: string; // e.g. '#e11d48'
  isDiagonal: boolean;
  pages: 'all' | 'first' | 'odd' | 'even';
}

/**
 * Parse hex color to pdf-lib RGB (values 0..1)
 */
function hexToRgb(hex: string): RGB {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255 || 0.5;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255 || 0.5;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255 || 0.5;
  return rgb(r, g, b);
}

/**
 * Extract summary info and metadata from a PDF file
 */
export async function getPdfInfo(file: File): Promise<PdfMetadataInfo> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

  return {
    pageCount: pdfDoc.getPageCount(),
    title: pdfDoc.getTitle() || undefined,
    author: pdfDoc.getAuthor() || undefined,
    subject: pdfDoc.getSubject() || undefined,
    creator: pdfDoc.getCreator() || undefined,
    producer: pdfDoc.getProducer() || undefined,
    creationDate: pdfDoc.getCreationDate() || undefined,
    modificationDate: pdfDoc.getModificationDate() || undefined,
    fileSizeBytes: file.size,
  };
}

/**
 * Merge multiple PDF files in order into a single PDF
 */
export async function mergePdfFiles(
  files: File[],
  onProgress?: (progressPercent: number, currentFileName: string) => void
): Promise<Blob> {
  if (files.length === 0) {
    throw new Error('Please select at least one PDF file to merge.');
  }

  const mergedPdf = await PDFDocument.create();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (onProgress) {
      const pct = Math.round((i / files.length) * 90);
      onProgress(pct, file.name);
    }

    const arrayBuffer = await file.arrayBuffer();
    const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    const copiedPages = await mergedPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());

    for (const page of copiedPages) {
      mergedPdf.addPage(page);
    }
  }

  if (onProgress) onProgress(95, 'Finalizing merged PDF...');
  const mergedPdfBytes = await mergedPdf.save();
  if (onProgress) onProgress(100, 'Done');

  return new Blob([mergedPdfBytes], { type: 'application/pdf' });
}

/**
 * Parse page range expressions (e.g. "1-3, 5, 8-10") into 0-based page indices
 */
export function parsePageRanges(rangeStr: string, totalPages: number): number[] {
  const cleaned = rangeStr.trim();
  if (!cleaned || cleaned.toLowerCase() === 'all') {
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  const indices = new Set<number>();
  const parts = cleaned.split(/[,;\s]+/).filter(Boolean);

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = Math.max(1, parseInt(startStr, 10));
      const end = Math.min(totalPages, parseInt(endStr, 10));
      if (!isNaN(start) && !isNaN(end) && start <= end) {
        for (let p = start; p <= end; p++) {
          indices.add(p - 1);
        }
      }
    } else {
      const pageNum = parseInt(part, 10);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
        indices.add(pageNum - 1);
      }
    }
  }

  const result = Array.from(indices).sort((a, b) => a - b);
  if (result.length === 0) {
    throw new Error(`No valid pages matched "${rangeStr}". Document has ${totalPages} pages.`);
  }
  return result;
}

/**
 * Split or extract specific pages from a PDF into a new PDF
 */
export async function splitPdfFile(
  file: File,
  pageRangeStr: string,
  onProgress?: (progressPercent: number) => void
): Promise<Blob> {
  if (onProgress) onProgress(20);
  const arrayBuffer = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const totalPages = sourcePdf.getPageCount();

  const selectedIndices = parsePageRanges(pageRangeStr, totalPages);
  if (onProgress) onProgress(50);

  const newPdf = await PDFDocument.create();
  const copiedPages = await newPdf.copyPages(sourcePdf, selectedIndices);

  for (const page of copiedPages) {
    newPdf.addPage(page);
  }

  if (onProgress) onProgress(85);
  const pdfBytes = await newPdf.save();
  if (onProgress) onProgress(100);

  return new Blob([pdfBytes], { type: 'application/pdf' });
}

/**
 * Rotate pages of a PDF by 90, 180, or 270 degrees
 */
export async function rotatePdfPages(
  file: File,
  rotationDegrees: 90 | 180 | 270,
  pageScope: 'all' | 'odd' | 'even' = 'all',
  onProgress?: (progressPercent: number) => void
): Promise<Blob> {
  if (onProgress) onProgress(25);
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();

  if (onProgress) onProgress(60);
  pages.forEach((page, index) => {
    const pageNumber = index + 1;
    const shouldRotate =
      pageScope === 'all' ||
      (pageScope === 'odd' && pageNumber % 2 !== 0) ||
      (pageScope === 'even' && pageNumber % 2 === 0);

    if (shouldRotate) {
      const currentRotation = page.getRotation().angle;
      const newRotation = (currentRotation + rotationDegrees) % 360;
      page.setRotation(degrees(newRotation));
    }
  });

  if (onProgress) onProgress(85);
  const pdfBytes = await pdfDoc.save();
  if (onProgress) onProgress(100);

  return new Blob([pdfBytes], { type: 'application/pdf' });
}

/**
 * Stamp custom text watermark across pages
 */
export async function watermarkPdfFile(
  file: File,
  options: WatermarkOptions,
  onProgress?: (progressPercent: number) => void
): Promise<Blob> {
  if (onProgress) onProgress(20);
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const watermarkColor = hexToRgb(options.colorHex || '#e11d48');
  const safeOpacity = Math.max(0.05, Math.min(options.opacity || 0.3, 1));
  const fontSize = options.fontSize || 48;

  if (onProgress) onProgress(50);

  pages.forEach((page, index) => {
    const pageNumber = index + 1;
    const shouldStamp =
      options.pages === 'all' ||
      (options.pages === 'first' && pageNumber === 1) ||
      (options.pages === 'odd' && pageNumber % 2 !== 0) ||
      (options.pages === 'even' && pageNumber % 2 === 0);

    if (!shouldStamp) return;

    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(options.text, fontSize);
    const textHeight = font.heightAtSize(fontSize);

    if (options.isDiagonal) {
      // Center diagonal stamping
      const angle = 45;
      const radians = (angle * Math.PI) / 180;
      const cos = Math.cos(radians);
      const sin = Math.sin(radians);
      
      const x = (width - (textWidth * cos - textHeight * sin)) / 2;
      const y = (height - (textWidth * sin + textHeight * cos)) / 2;

      page.drawText(options.text, {
        x: Math.max(20, x),
        y: Math.max(20, y),
        size: fontSize,
        font,
        color: watermarkColor,
        opacity: safeOpacity,
        rotate: degrees(angle),
      });
    } else {
      // Centered horizontal stamping
      const x = (width - textWidth) / 2;
      const y = (height - textHeight) / 2;

      page.drawText(options.text, {
        x: Math.max(10, x),
        y: Math.max(10, y),
        size: fontSize,
        font,
        color: watermarkColor,
        opacity: safeOpacity,
      });
    }
  });

  if (onProgress) onProgress(85);
  const pdfBytes = await pdfDoc.save();
  if (onProgress) onProgress(100);

  return new Blob([pdfBytes], { type: 'application/pdf' });
}
